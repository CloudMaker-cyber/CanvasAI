const DB_NAME = 'canvasai-images'
const STORE = 'images'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise
}

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function store(): Promise<IDBObjectStore> {
  const db = await openDb()
  return db.transaction(STORE, 'readwrite').objectStore(STORE)
}

export async function getImageSource(id: string): Promise<string | undefined> {
  const db = await openDb()
  return done(db.transaction(STORE, 'readonly').objectStore(STORE).get(id))
}

export async function setImageSource(id: string, dataUrl: string): Promise<void> {
  await done((await store()).put(dataUrl, id))
}

export async function deleteImageSource(id: string): Promise<void> {
  await done((await store()).delete(id))
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
