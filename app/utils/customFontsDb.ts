// Client-only: uses IndexedDB, call only from the browser (onMounted, handlers).
// IndexedDB is never touched at module top level (site is statically generated).

const DB_NAME = 'font-comparer';
const DB_VERSION = 1;
const STORE_NAME = 'custom-fonts';

export interface StoredCustomFont {
  id: string;
  family: string;
  fileName: string;
  format: 'woff2' | 'woff' | 'ttf' | 'otf';
  size: number;
  data: Blob;
  addedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  const promise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      // Если базу закрыли извне (например, версия обновилась), открываем заново
      db.onclose = () => {
        dbPromise = null;
      };
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB open is blocked'));
  });

  dbPromise = promise;
  // Сбрасываем кэш при ошибке, чтобы можно было повторить попытку
  promise.catch(() => {
    if (dbPromise === promise) dbPromise = null;
  });
  return promise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    // На событии error tx.error ещё null, настоящая ошибка есть только в abort
    tx.onabort = () =>
      reject(tx.error ?? new DOMException('Transaction aborted', 'AbortError'));
  });
}

export async function getAllCustomFonts(): Promise<StoredCustomFont[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const done = transactionDone(tx);
  const fonts = await requestToPromise<StoredCustomFont[]>(
    tx.objectStore(STORE_NAME).getAll(),
  );
  await done;
  return fonts.sort((a, b) => a.addedAt - b.addedAt);
}

export async function putCustomFont(font: StoredCustomFont): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const done = transactionDone(tx);
  tx.objectStore(STORE_NAME).put(font);
  await done;
}

export async function deleteCustomFont(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const done = transactionDone(tx);
  tx.objectStore(STORE_NAME).delete(id);
  await done;
}
