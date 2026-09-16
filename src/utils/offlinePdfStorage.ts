import { Chapter } from '../types';
import { generateChapterPDF } from './pdfGenerator';

export interface OfflineChapterMeta {
  chapterId: number;
  numberText: string;
  title: string;
  sizeBytes: number;
  downloadedAt: number;
  url: string;
}

const CACHE_NAME = 'sheets-offline-pdfs-v1';
const DB_NAME = 'sheets_offline_db';
const STORE_NAME = 'downloaded_chapters';
const DB_VERSION = 1;

function getOfflineUrl(chapterId: number): string {
  return `/offline-pdfs/capitulo-${chapterId}.pdf`;
}

/**
 * Initializes and opens the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está soportado en este entorno.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'chapterId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores metadata in IndexedDB.
 */
async function saveMetaToDB(meta: OfflineChapterMeta): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(meta);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error al guardar metadata en IndexedDB:', err);
  }
}

/**
 * Removes metadata from IndexedDB.
 */
async function removeMetaFromDB(chapterId: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(chapterId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error al eliminar metadata de IndexedDB:', err);
  }
}

/**
 * Retrieves all offline chapter metadata.
 */
export async function getDownloadedChaptersList(): Promise<OfflineChapterMeta[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    // Fallback: check Cache Storage directly
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        return keys.map((k) => {
          const match = k.url.match(/capitulo-(\d+)\.pdf/);
          const cId = match ? parseInt(match[1], 10) : 0;
          return {
            chapterId: cId,
            numberText: `Capítulo ${cId}`,
            title: `Capítulo ${cId}`,
            sizeBytes: 45000,
            downloadedAt: Date.now(),
            url: k.url,
          };
        });
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * Checks whether a chapter is stored offline in Cache Storage or IndexedDB.
 */
export async function isChapterOffline(chapterId: number): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check Cache Storage API first (Service Worker layer)
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(getOfflineUrl(chapterId));
      if (match) return true;
    } catch {
      // ignore
    }
  }

  // Check IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(chapterId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Generates and saves a chapter PDF into Cache Storage and IndexedDB.
 */
export async function saveChapterPDFLocally(chapter: Chapter): Promise<Blob> {
  const doc = generateChapterPDF(chapter);
  const blob = doc.output('blob');
  const url = getOfflineUrl(chapter.id);

  // 1. Store in Service Worker Cache Storage API
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = new Response(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': String(blob.size),
          'X-Chapter-Id': String(chapter.id),
          'X-Stored-Offline': 'true',
        },
      });
      await cache.put(url, response);
    } catch (err) {
      console.warn('No se pudo guardar en Service Worker Cache Storage:', err);
    }
  }

  // 2. Store metadata in IndexedDB
  const meta: OfflineChapterMeta = {
    chapterId: chapter.id,
    numberText: chapter.numberText,
    title: chapter.title,
    sizeBytes: blob.size,
    downloadedAt: Date.now(),
    url,
  };
  await saveMetaToDB(meta);

  // Dispatch event so UI instantly syncs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-storage-updated', { detail: { chapterId: chapter.id } }));
  }

  return blob;
}

/**
 * Downloads a chapter PDF to the user's device filesystem AND caches it offline.
 */
export async function downloadChapterPDFToDevice(chapter: Chapter): Promise<Blob> {
  const blob = await saveChapterPDFLocally(chapter);

  // Trigger device file download
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  const safeFilename = `${chapter.numberText.replace(/\s+/g, '_')}_Google_Sheets.pdf`;
  anchor.download = safeFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  return blob;
}

/**
 * Retrieves the stored PDF Blob from Cache Storage.
 * If not present in cache, generates it on the fly and saves it.
 */
export async function getChapterPDFBlob(chapter: Chapter): Promise<Blob> {
  const url = getOfflineUrl(chapter.id);

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        return await cachedResponse.blob();
      }
    } catch {
      // continue to generate
    }
  }

  // Generate and save
  return await saveChapterPDFLocally(chapter);
}

/**
 * Deletes a chapter from offline cache and metadata store.
 */
export async function deleteChapterPDFOffline(chapterId: number): Promise<void> {
  const url = getOfflineUrl(chapterId);

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
    } catch (err) {
      console.warn('Error al borrar de Cache Storage:', err);
    }
  }

  await removeMetaFromDB(chapterId);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-storage-updated', { detail: { chapterId } }));
  }
}

/**
 * Clears all cached offline PDFs.
 */
export async function clearAllOfflinePDFs(): Promise<void> {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete(CACHE_NAME);
    } catch {
      // ignore
    }
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-storage-updated'));
  }
}

/**
 * Downloads and caches all chapters for complete offline reading.
 */
export async function downloadAllChaptersOffline(
  chapters: Chapter[],
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < chapters.length; i++) {
    await saveChapterPDFLocally(chapters[i]);
    if (onProgress) {
      onProgress(i + 1, chapters.length);
    }
  }
}

/**
 * Formats bytes to KB or MB.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
