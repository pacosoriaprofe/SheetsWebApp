import React, { useState } from 'react';
import { ClassGroup } from '../types';
import { Users, Check, X, School, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  currentClassId?: string;
  onSelectClass: (classId: string, className: string) => void;
}

export const ClassSelectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  classes,
  currentClassId,
  onSelectClass,
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentClassId || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const found = classes.find((c) => c.id === selectedId);
    if (found) {
      onSelectClass(found.id, found.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Selecciona tu Clase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                IES Diego Torrente Ballester • Curso 2025/2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Elige el grupo o clase en el que estás matriculado con el profesor Paco Soria para que tu progreso y ejercicios se registren en la lista correcta:
          </p>

          <div className="space-y-2">
            {classes.map((cls) => {
              const isSelected = selectedId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedId(cls.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {cls.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {cls.code}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cls.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            Puedes cambiar de clase en cualquier momento.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedId}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              Confirmar Clase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
