import React from 'react';
import { Chapter } from '../types';
import { useOfflineChapters } from '../hooks/useOfflineChapters';
import { formatBytes, clearAllOfflinePDFs } from '../utils/offlinePdfStorage';
import {
  X,
  Download,
  HardDrive,
  CheckCircle2,
  Trash2,
  FileText,
  Loader2,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  onOpenPDFViewer: (chapter: Chapter) => void;
}

export const OfflineDownloadsManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  chapters,
  onOpenPDFViewer,
}) => {
  const {
    offlineList,
    downloadedMap,
    downloadingMap,
    isBatchDownloading,
    batchProgress,
    downloadChapter,
    removeChapter,
    downloadAll,
    refreshList,
  } = useOfflineChapters();

  if (!isOpen) return null;

  const totalBytes = offlineList.reduce((acc, cur) => acc + (cur.sizeBytes || 0), 0);
  const downloadedCount = offlineList.length;
  const isAllDownloaded = downloadedCount === chapters.length;

  const handleClearAll = async () => {
    if (window.confirm('¿Deseas eliminar todos los capítulos PDF guardados de la memoria local?')) {
      await clearAllOfflinePDFs();
      await refreshList();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Gestor de Descargas Offline (PDF)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {downloadedCount} de {chapters.length} guardados
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Almacena los capítulos en español en tu dispositivo para estudiar sin conexión mediante Service Workers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Batch Action Banner */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                Lectura 100% desconectada
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Almacenamiento usado: <strong>{formatBytes(totalBytes)}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Los archivos se almacenan en la caché de tu navegador y también puedes guardarlos como PDFs independientes en tus archivos.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isAllDownloaded ? (
              <button
                id="btn-download-all-chapters"
                onClick={() => downloadAll(chapters)}
                disabled={isBatchDownloading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-60"
              >
                {isBatchDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando ({batchProgress.current}/{batchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Todo el Libro (9 PDFs)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Libro Completo Offline</span>
              </div>
            )}

            {downloadedCount > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                title="Limpiar almacenamiento offline"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chapters List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {chapters.map((ch) => {
            const isDownloaded = downloadedMap[ch.id];
            const isDownloading = downloadingMap[ch.id];
            const meta = offlineList.find((item) => item.chapterId === ch.id);

            return (
              <div
                key={ch.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  isDownloaded
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      {ch.numberText}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ch.readTime} • {ch.category}
                    </span>
                    {isDownloaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Listo offline ({meta ? formatBytes(meta.sizeBytes) : 'PDF'})
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {ch.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {ch.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isDownloaded && (
                    <button
                      onClick={() => onOpenPDFViewer(ch)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 transition"
                      title="Abrir visor PDF integrado"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver PDF</span>
                    </button>
                  )}

                  <button
                    onClick={() => downloadChapter(ch, true)}
                    disabled={isDownloading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isDownloaded
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloaded ? 'Guardar archivo' : 'Descargar PDF'}</span>
                  </button>

                  {isDownloaded && (
                    <button
                      onClick={() => removeChapter(ch.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Eliminar de almacenamiento local"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Los archivos PDF se crean y compilan en español con índice, resúmenes y fórmulas.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
