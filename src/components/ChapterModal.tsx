import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { ChapterVisualContext } from './ChapterVisualContext';
import {
  X,
  BookOpen,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  chapter: Chapter | null;
  onClose: () => void;
  isCompleted: boolean;
  onToggleComplete: (chapterId: number) => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onGoToQuiz?: (chapterId: number) => void;
  onGoToExercise?: (chapterId: number) => void;
  searchHighlight?: string;
  isOfflineDownloaded?: boolean;
  isDownloading?: boolean;
  onDownloadPDF?: () => void;
  onViewPDF?: () => void;
}

export const ChapterModal: React.FC<Props> = ({
  chapter,
  onClose,
  isCompleted,
  onToggleComplete,
  onNextChapter,
  onPrevChapter,
  hasNext,
  hasPrev,
  onGoToQuiz,
  onGoToExercise,
  searchHighlight = '',
  isOfflineDownloaded = false,
  isDownloading = false,
  onDownloadPDF,
  onViewPDF,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!chapter) return null;

  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[fontSize];

  const highlightMatches = (text: string) => {
    if (!searchHighlight.trim()) return text;
    const regex = new RegExp(`(${searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/80 text-inherit px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {chapter.numberText}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {chapter.readTime}
            </span>
            {isOfflineDownloaded && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Offline listo
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font size accessibility adjuster */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setFontSize(fontSize === 'xlarge' ? 'large' : 'normal')}
                title="Reducir tamaño de fuente"
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold">Aa</span>
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'xlarge')}
                title="Aumentar tamaño de fuente"
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View PDF if downloaded */}
            {isOfflineDownloaded && onViewPDF && (
              <button
                onClick={onViewPDF}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                title="Abrir visor PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Ver PDF</span>
              </button>
            )}

            {/* Download PDF button */}
            {onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                disabled={isDownloading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isOfflineDownloaded
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                title={isOfflineDownloaded ? 'Descargar archivo PDF al dispositivo' : 'Descargar PDF en español para lectura sin internet'}
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isOfflineDownloaded ? 'Guardar PDF' : 'Descargar PDF (Offline)'}
                </span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            {/* Toggle Read */}
            <button
              onClick={() => onToggleComplete(chapter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isCompleted ? 'Leído' : 'Marcar leído'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 max-w-prose mx-auto w-full">
          {/* Chapter Title & Intro */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {highlightMatches(chapter.title)}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {highlightMatches(chapter.subtitle)}
            </p>
          </div>

          {/* Interactive Visual Context Diagram */}
          <div className="my-6">
            <ChapterVisualContext diagram={chapter.diagram} />
          </div>

          {/* Sections Content */}
          <div className="space-y-10">
            {chapter.sections.map((section) => (
              <article key={section.id} className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white border-l-4 border-emerald-500 pl-3">
                  {highlightMatches(section.title)}
                </h3>

                <div className={`space-y-3 text-slate-700 dark:text-slate-300 ${fontClasses}`}>
                  {section.content.map((p, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {highlightMatches(p)}
                    </p>
                  ))}
                </div>

                {section.subsections && (
                  <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800 mt-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.id} className="space-y-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                          {highlightMatches(sub.title)}
                        </h4>
                        <div className={`space-y-2 text-slate-600 dark:text-slate-300 ${fontClasses}`}>
                          {sub.content.map((sp, sIdx) => (
                            <p key={sIdx}>{highlightMatches(sp)}</p>
                          ))}
                        </div>
                        {sub.tip && (
                          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Consejo práctico:</strong> {highlightMatches(sub.tip)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.keyTakeaways && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4" />
                      Puntos Clave para Recordar:
                    </span>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 dark:text-slate-300">
                      {section.keyTakeaways.map((takeaway, tIdx) => (
                        <li key={tIdx}>{highlightMatches(takeaway)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Bottom Actions: Practice, Quiz, and PDF Offline */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {onGoToExercise && (
                <button
                  onClick={() => {
                    onGoToExercise(chapter.id);
                    onClose();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hacer Ejercicios</span>
                </button>
              )}
              {onGoToQuiz && (
                <button
                  onClick={() => {
                    onGoToQuiz(chapter.id);
                    onClose();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <span>Realizar Test del Capítulo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Prev / Next chapter */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={onPrevChapter}
                disabled={!hasPrev}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30"
                title="Capítulo Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextChapter}
                disabled={!hasNext}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30"
                title="Siguiente Capítulo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
