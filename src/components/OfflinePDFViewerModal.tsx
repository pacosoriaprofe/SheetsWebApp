import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { getChapterPDFBlob, downloadChapterPDFToDevice } from '../utils/offlinePdfStorage';
import { X, Download, FileText, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface Props {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfflinePDFViewerModal: React.FC<Props> = ({ chapter, isOpen, onClose }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen || !chapter) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      return;
    }

    let active = true;
    setLoading(true);

    getChapterPDFBlob(chapter)
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar PDF:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, chapter]);

  if (!isOpen || !chapter) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadChapterPDFToDevice(chapter);
    } catch (err) {
      console.error('Error al guardar PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[94vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                  {chapter.numberText}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Almacenado localmente para lectura offline
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {chapter.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pdfBlobUrl && (
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Abrir en pestaña nueva"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Pestaña nueva</span>
              </a>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Guardar en Dispositivo</span>
              <span className="sm:hidden">Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Generando y cargando versión PDF en español...
              </p>
              <p className="text-xs text-slate-400">
                Se guardará automáticamente en el almacenamiento local de tu navegador.
              </p>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={`${pdfBlobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-none"
              title={`PDF ${chapter.title}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <p className="text-sm text-slate-500">No se pudo cargar la vista previa del PDF.</p>
              <button
                onClick={handleDownload}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Descargar directamente a tu dispositivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
