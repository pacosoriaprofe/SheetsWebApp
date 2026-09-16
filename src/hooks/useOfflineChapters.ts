import { useState, useEffect, useCallback } from 'react';
import { Chapter } from '../types';
import {
  getDownloadedChaptersList,
  saveChapterPDFLocally,
  downloadChapterPDFToDevice,
  deleteChapterPDFOffline,
  downloadAllChaptersOffline,
  OfflineChapterMeta,
} from '../utils/offlinePdfStorage';

export function useOfflineChapters() {
  const [offlineList, setOfflineList] = useState<OfflineChapterMeta[]>([]);
  const [downloadedMap, setDownloadedMap] = useState<Record<number, boolean>>({});
  const [downloadingMap, setDownloadingMap] = useState<Record<number, boolean>>({});
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const loadList = useCallback(async () => {
    try {
      const list = await getDownloadedChaptersList();
      setOfflineList(list);
      const map: Record<number, boolean> = {};
      list.forEach((item) => {
        map[item.chapterId] = true;
      });
      setDownloadedMap(map);
    } catch (err) {
      console.error('Error cargando lista offline:', err);
    }
  }, []);

  useEffect(() => {
    loadList();

    const handleUpdate = () => {
      loadList();
    };

    window.addEventListener('offline-storage-updated', handleUpdate);
    return () => window.removeEventListener('offline-storage-updated', handleUpdate);
  }, [loadList]);

  const downloadChapter = async (chapter: Chapter, saveToDevice: boolean = true) => {
    try {
      setDownloadingMap((prev) => ({ ...prev, [chapter.id]: true }));
      if (saveToDevice) {
        await downloadChapterPDFToDevice(chapter);
      } else {
        await saveChapterPDFLocally(chapter);
      }
      await loadList();
    } catch (err) {
      console.error('Error al descargar capítulo:', err);
      throw err;
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [chapter.id]: false }));
    }
  };

  const removeChapter = async (chapterId: number) => {
    try {
      await deleteChapterPDFOffline(chapterId);
      await loadList();
    } catch (err) {
      console.error('Error al eliminar capítulo offline:', err);
    }
  };

  const downloadAll = async (chapters: Chapter[]) => {
    try {
      setIsBatchDownloading(true);
      setBatchProgress({ current: 0, total: chapters.length });
      await downloadAllChaptersOffline(chapters, (current, total) => {
        setBatchProgress({ current, total });
      });
      await loadList();
    } catch (err) {
      console.error('Error en descarga total:', err);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  return {
    offlineList,
    downloadedMap,
    downloadingMap,
    isBatchDownloading,
    batchProgress,
    downloadChapter,
    removeChapter,
    downloadAll,
    refreshList: loadList,
  };
}
