import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { enqueueItem } from '../../offline/queue';

export interface ActiveSOS {
  tempId: bigint;
  backendId?: bigint;
  note: string;
  status: 'queued' | 'syncing' | 'active' | 'ending' | 'ended';
  startTime: bigint;
}

interface SOSState {
  activeSOS: ActiveSOS | null;
  setActiveSOS: (sos: ActiveSOS | null) => void;
  reconcileBackendId: (tempId: bigint, backendId: bigint) => void;
  updateStatus: (status: ActiveSOS['status']) => void;
}

export const useSOSStore = create<SOSState>()(
  persist(
    (set, get) => ({
      activeSOS: null,
      setActiveSOS: (sos) => set({ activeSOS: sos }),
      reconcileBackendId: (tempId, backendId) => {
        const current = get().activeSOS;
        if (current && current.tempId === tempId) {
          set({
            activeSOS: {
              ...current,
              backendId,
              status: 'active',
            },
          });
        }
      },
      updateStatus: (status) => {
        const current = get().activeSOS;
        if (current) {
          set({
            activeSOS: {
              ...current,
              status,
            },
          });
        }
      },
    }),
    {
      name: 'sos-state',
    }
  )
);

export function useActiveSOS() {
  return useSOSStore((state) => state.activeSOS);
}

export async function startSOSEvent(note: string): Promise<bigint> {
  const tempId = await enqueueItem({
    type: 'startSOS',
    data: { note },
    timestamp: Date.now(),
  });

  useSOSStore.getState().setActiveSOS({
    tempId,
    note,
    status: 'queued',
    startTime: BigInt(Date.now() * 1000000),
  });

  return tempId;
}

export async function endSOSEvent(sosId: bigint): Promise<void> {
  useSOSStore.getState().updateStatus('ending');
  
  await enqueueItem({
    type: 'endSOS',
    data: { sosId },
    timestamp: Date.now(),
  });
}

export async function addBreadcrumbToSOS(sosId: bigint, lat: number, long: number): Promise<void> {
  await enqueueItem({
    type: 'addBreadcrumb',
    data: { sosId, lat, long },
    timestamp: Date.now(),
  });
}

export function clearActiveSOS() {
  useSOSStore.getState().setActiveSOS(null);
}
