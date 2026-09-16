import React from 'react';
import { Chapter } from '../types';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Layers,
  Binary,
  Palette,
  SlidersHorizontal,
  Share2,
  PieChart,
  Zap,
  Keyboard,
  Wrench,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  chapter: Chapter;
  isCompleted: boolean;
  onRead: () => void;
  onToggleComplete: () => void;
  onOpenExercises?: () => void;
  isOfflineDownloaded?: boolean;
  isDownloading?: boolean;
  onDownloadPDF?: () => void;
  onViewPDF?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  Binary: <Binary className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  Palette: <Palette className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
  SlidersHorizontal: <SlidersHorizontal className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  Share2: <Share2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
  PieChart: <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
  Keyboard: <Keyboard className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
  Wrench: <Wrench className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
};

export const ChapterCard: React.FC<Props> = ({
  chapter,
  isCompleted,
  onRead,
  onToggleComplete,
  onOpenExercises,
  isOfflineDownloaded = false,
  isDownloading = false,
  onDownloadPDF,
  onViewPDF,
}) => {
  return (
    <div
      id={`chapter-card-${chapter.id}`}
      className={`group rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isCompleted
          ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition">
              {ICON_MAP[chapter.icon] || <BookOpen className="w-5 h-5 text-emerald-600" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {chapter.numberText}
            </span>
            {isOfflineDownloaded && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full"
                title="Capítulo descargado y disponible sin internet"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Offline
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {chapter.readTime}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              className={`p-1.5 rounded-lg text-xs transition ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              title={isCompleted ? 'Capítulo completado' : 'Marcar como leído'}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h3
            onClick={onRead}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition cursor-pointer leading-snug"
          >
            {chapter.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {chapter.subtitle}
          </p>
        </div>

        {/* Section Pill Previews */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {chapter.sections.slice(0, 3).map((sec) => (
            <span
              key={sec.id}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]"
            >
              {sec.title}
            </span>
          ))}
          {chapter.sections.length > 3 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold">
              +{chapter.sections.length - 3} más
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onRead}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>Leer Capítulo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>

          {onOpenExercises && (
            <button
              onClick={onOpenExercises}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Ejercicios
            </button>
          )}
        </div>

        {/* PDF Download / View Offline Button */}
        <div className="flex items-center gap-1.5">
          {isOfflineDownloaded && onViewPDF && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewPDF();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-100/70 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition"
              title="Abrir visor PDF guardado"
            >
              <FileText className="w-3 h-3" />
              <span>Ver PDF</span>
            </button>
          )}

          {onDownloadPDF && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadPDF();
              }}
              disabled={isDownloading}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                isOfflineDownloaded
                  ? 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
              }`}
              title={isOfflineDownloaded ? 'Descargar archivo PDF al dispositivo' : 'Guardar y descargar PDF para lectura offline'}
            >
              {isDownloading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              <span>{isOfflineDownloaded ? 'Guardar' : 'PDF Offline'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
