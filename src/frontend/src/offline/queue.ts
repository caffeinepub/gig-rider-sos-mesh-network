interface QueueItem {
  id: number;
  type: 'startSOS' | 'endSOS' | 'addBreadcrumb' | 'submitHazard';
  data: any;
  timestamp: number;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  retryCount: number;
}

const DB_NAME = 'rider-sos-queue';
const DB_VERSION = 1;
const STORE_NAME = 'queue';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-status', 'status', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function enqueueItem(item: Omit<QueueItem, 'id' | 'status' | 'retryCount'>): Promise<bigint> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add({
      ...item,
      status: 'queued',
      retryCount: 0,
    } as Omit<QueueItem, 'id'>);

    request.onsuccess = () => resolve(BigInt(request.result as number));
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedItems(): Promise<QueueItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('by-status');
    const request = index.getAll('queued');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItems(): Promise<QueueItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateItemStatus(
  id: number,
  status: QueueItem['status'],
  retryCount?: number
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        const updatedItem = {
          ...item,
          status,
          retryCount: retryCount !== undefined ? retryCount : item.retryCount,
        };
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function updateItemData(id: number, data: any): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        const updatedItem = {
          ...item,
          data: { ...item.data, ...data },
        };
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteItem(id: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllQueuedItems(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedCount(): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('by-status');
    const request = index.count('queued');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function remapSOSId(oldId: bigint, newId: bigint): Promise<void> {
  const items = await getAllItems();
  const db = await getDB();

  for (const item of items) {
    if (item.type === 'endSOS' && item.data.sosId === oldId) {
      await updateItemData(item.id, { sosId: newId });
    } else if (item.type === 'addBreadcrumb' && item.data.sosId === oldId) {
      await updateItemData(item.id, { sosId: newId });
    }
  }
}
