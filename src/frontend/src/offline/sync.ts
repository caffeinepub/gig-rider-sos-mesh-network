import { useEffect, useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getQueuedItems, updateItemStatus, deleteItem, getQueuedCount, remapSOSId } from './queue';
import { useSOSStore, clearActiveSOS } from '../features/sos/sosState';

// Shared sync state for real-time updates
let syncState = {
  isSyncing: false,
  queuedCount: 0,
  isAuthenticated: false,
  listeners: new Set<() => void>(),
};

function notifyListeners() {
  syncState.listeners.forEach((listener) => listener());
}

function setSyncState(updates: Partial<typeof syncState>) {
  syncState = { ...syncState, ...updates };
  notifyListeners();
}

export function useSyncRunner() {
  const { actor } = useActor();
  const isOnline = useOnlineStatus();
  const { identity } = useInternetIdentity();

  useEffect(() => {
    const isAuth = !!identity;
    setSyncState({ isAuthenticated: isAuth });

    if (!actor || !isOnline || !isAuth) {
      setSyncState({ isSyncing: false });
      return;
    }

    const syncInterval = setInterval(async () => {
      await syncQueuedItems(actor);
    }, 5000);

    // Immediate sync on mount
    syncQueuedItems(actor);

    return () => clearInterval(syncInterval);
  }, [actor, isOnline, identity]);
}

export function useSyncStatus() {
  const [state, setState] = useState({
    isSyncing: syncState.isSyncing,
    queuedCount: syncState.queuedCount,
    isAuthenticated: syncState.isAuthenticated,
  });

  useEffect(() => {
    const updateState = () => {
      setState({
        isSyncing: syncState.isSyncing,
        queuedCount: syncState.queuedCount,
        isAuthenticated: syncState.isAuthenticated,
      });
    };

    syncState.listeners.add(updateState);

    // Initial count update
    getQueuedCount().then((count) => {
      setSyncState({ queuedCount: count });
    });

    return () => {
      syncState.listeners.delete(updateState);
    };
  }, []);

  return state;
}

async function syncQueuedItems(actor: any) {
  const items = await getQueuedItems();
  
  if (items.length === 0) {
    setSyncState({ isSyncing: false });
    return;
  }

  setSyncState({ isSyncing: true });

  for (const item of items) {
    if (item.retryCount >= 3) {
      await updateItemStatus(item.id, 'failed');
      const newCount = await getQueuedCount();
      setSyncState({ queuedCount: newCount });
      continue;
    }

    try {
      await updateItemStatus(item.id, 'sending');

      switch (item.type) {
        case 'startSOS': {
          const backendId = await actor.startSOS(item.data.note);
          const tempId = BigInt(item.id);
          
          // Reconcile temp ID to backend ID
          useSOSStore.getState().reconcileBackendId(tempId, backendId);
          
          // Remap any queued breadcrumb/end items
          await remapSOSId(tempId, backendId);
          break;
        }

        case 'endSOS': {
          await actor.endSOS(item.data.sosId);
          
          // Clear active SOS after successful end
          const activeSOS = useSOSStore.getState().activeSOS;
          if (activeSOS && (activeSOS.backendId === item.data.sosId || activeSOS.tempId === item.data.sosId)) {
            clearActiveSOS();
          }
          break;
        }

        case 'addBreadcrumb': {
          await actor.addBreadcrumb(item.data.sosId, item.data.lat, item.data.long);
          break;
        }

        case 'submitHazard': {
          await actor.submitHazard(
            item.data.hazardType,
            item.data.severity,
            item.data.description,
            item.data.location
          );
          break;
        }
      }

      await deleteItem(item.id);
      const newCount = await getQueuedCount();
      setSyncState({ queuedCount: newCount });
    } catch (error: any) {
      console.error('Sync error:', error);
      
      // Handle authorization errors gracefully in guest mode
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('Only users')) {
        // Keep item queued but don't increment retry count excessively
        await updateItemStatus(item.id, 'queued', Math.min(item.retryCount + 1, 2));
      } else {
        await updateItemStatus(item.id, 'queued', item.retryCount + 1);
      }
      
      const newCount = await getQueuedCount();
      setSyncState({ queuedCount: newCount });
    }
  }

  setSyncState({ isSyncing: false });
  const finalCount = await getQueuedCount();
  setSyncState({ queuedCount: finalCount });
}
