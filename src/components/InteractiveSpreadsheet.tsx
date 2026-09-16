import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  exercise: Exercise;
  isCompleted: boolean;
  onComplete: (userFormula: string, isCorrect: boolean) => void;
}

export const InteractiveSpreadsheet: React.FC<Props> = ({
  exercise,
  isCompleted,
  onComplete,
}) => {
  const [selectedCell, setSelectedCell] = useState<string>(exercise.initialGrid.targetCell);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    computedValue?: string | number;
  }>({
    status: isCompleted ? 'success' : 'idle',
    message: isCompleted ? '¡Ejercicio resuelto correctamente!' : '',
    computedValue: isCompleted ? exercise.expectedValue : undefined,
  });
  const [showHint, setShowHint] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  useEffect(() => {
    setSelectedCell(exercise.initialGrid.targetCell);
    setFormulaInput('');
    setFeedback({
      status: isCompleted ? 'success' : 'idle',
      message: isCompleted ? '¡Ejercicio resuelto correctamente!' : '',
      computedValue: isCompleted ? exercise.expectedValue : undefined,
    });
    setShowHint(false);
  }, [exercise.id, isCompleted]);

  const handleEvaluate = () => {
    const cleanInput = formulaInput.trim();
    if (!cleanInput) {
      setFeedback({
        status: 'error',
        message: 'Por favor, escribe una fórmula en la barra de fórmulas.',
      });
      return;
    }

    // Normalize formula
    const normalizedInput = cleanInput.toUpperCase().replace(/\s+/g, '');
    const isFormulaMatch = exercise.expectedFormula.some((formula) => {
      const normExpected = formula.toUpperCase().replace(/\s+/g, '');
      return normalizedInput === normExpected;
    });

    if (isFormulaMatch) {
      setFeedback({
        status: 'success',
        message: `¡Correcto! ${exercise.formulaExplanation}`,
        computedValue: exercise.expectedValue,
      });
      onComplete(cleanInput, true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Fallback gracefully
      }
    } else {
      setFeedback({
        status: 'error',
        message: 'La fórmula no coincide con el resultado esperado. Revisa los argumentos o consulta la pista.',
      });
    }
  };

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const handleReset = () => {
    setFormulaInput('');
    setFeedback({ status: 'idle', message: '' });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Exercise Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {exercise.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Dificultad: <strong className="text-slate-700 dark:text-slate-300">{exercise.difficulty}</strong>
            </span>
          </div>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              Completado
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
          {exercise.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {exercise.scenario}
        </p>

        {/* Step-by-step instructions */}
        <div className="mt-3 bg-white dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block mb-1">Instrucciones:</span>
          {exercise.instructions.map((inst, idx) => (
            <p key={idx} className="leading-relaxed">{inst}</p>
          ))}
        </div>
      </div>

      {/* Spreadsheet Simulator Work Area */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Formula Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-12 text-center text-xs font-mono font-bold py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">
              {selectedCell}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">fx</span>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
              placeholder="Introduce la fórmula aquí (ej. =SUM(B2:B5))"
              className="w-full text-xs sm:text-sm font-mono px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluate}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verificar</span>
            </button>
            <button
              onClick={handleReset}
              title="Restablecer"
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Spreadsheet Grid */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-300 dark:border-slate-700">
                <th className="w-10 p-2 text-center border-r border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                  #
                </th>
                {exercise.initialGrid.headers.map((h, i) => (
                  <th key={i} className="p-2 border-r border-slate-300 dark:border-slate-700 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exercise.initialGrid.rows.map((row, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-2 text-center bg-slate-50 dark:bg-slate-900 text-slate-400 font-semibold border-r border-slate-200 dark:border-slate-800">
                      {rowNum}
                    </td>
                    {row.map((cellVal, cIdx) => {
                      const colLetter = String.fromCharCode(65 + cIdx); // A, B, C...
                      const cellId = `${colLetter}${rowNum}`;
                      const isTarget = cellId === exercise.initialGrid.targetCell;

                      return (
                        <td
                          key={cIdx}
                          onClick={() => setSelectedCell(cellId)}
                          className={`p-2 border-r border-slate-100 dark:border-slate-800 cursor-pointer transition select-none ${
                            selectedCell === cellId
                              ? 'bg-blue-50 dark:bg-blue-950/70 ring-2 ring-blue-500 font-bold'
                              : ''
                          } ${
                            isTarget && feedback.status === 'success'
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold'
                              : ''
                          }`}
                        >
                          {isTarget ? (
                            feedback.status === 'success' ? (
                              <span>{feedback.computedValue}</span>
                            ) : (
                              <span className="text-slate-400 italic">
                                {formulaInput || '[Escribe fórmula]'}
                              </span>
                            )
                          ) : (
                            <span>{cellVal}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Feedback Alert */}
        {feedback.status !== 'idle' && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in duration-200 ${
              feedback.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {feedback.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold block">{feedback.status === 'success' ? '¡Excelente trabajo!' : 'Revisa tu fórmula'}</span>
              <p className="mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Hint and Real Sheets Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Ocultar pista' : 'Ver pista de solución'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyFormula(exercise.expectedFormula[0])}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 transition"
              title="Copiar fórmula modelo"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedFormula ? '¡Copiada!' : 'Copiar fórmula'}</span>
            </button>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <span>Abrir en Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {showHint && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            <strong>Pista sugerida:</strong> Prueba utilizando la fórmula{' '}
            <code className="bg-amber-200 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">
              {exercise.expectedFormula[0]}
            </code>
            . {exercise.sheetsTip}
          </div>
        )}
      </div>
    </div>
  );
};
