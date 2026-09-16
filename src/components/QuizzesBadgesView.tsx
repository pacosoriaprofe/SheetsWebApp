import React, { useState } from 'react';
import { Quiz, Badge, StudentProgress } from '../types';
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  quizzes: Quiz[];
  badges: Badge[];
  progress: StudentProgress;
  onUpdateProgress: (updated: StudentProgress) => void;
}

export const QuizzesBadgesView: React.FC<Props> = ({
  quizzes,
  badges,
  progress,
  onUpdateProgress,
}) => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(quizzes[0]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; pct: number } | null>(null);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz) return;

    let score = 0;
    selectedQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const total = selectedQuiz.questions.length;
    const pct = Math.round((score / total) * 100);
    setScoreResult({ score, total, pct });
    setSubmitted(true);

    const isPassed = pct >= 75;
    const badgeUnlocked = isPassed && selectedQuiz.badgeId;

    let updatedBadges = [...progress.unlockedBadges];
    if (badgeUnlocked && !updatedBadges.includes(selectedQuiz.badgeId)) {
      updatedBadges.push(selectedQuiz.badgeId);

      // Trigger badge celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }

    // Check if master badge unlocked (e.g. 5 or more badges)
    if (updatedBadges.length >= 6 && !updatedBadges.includes('badge-master')) {
      updatedBadges.push('badge-master');
    }

    const updated: StudentProgress = {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [selectedQuiz.id]: {
          score,
          total,
          completedAt: new Date().toISOString(),
          percentage: pct,
        },
      },
      unlockedBadges: updatedBadges,
    };

    onUpdateProgress(updated);
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScoreResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Badges Showcase Section */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Tus Insignias y Logros de Certificación
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supera las evaluaciones con al menos 75% para desbloquear cada insignia y obtener tu certificación final.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{progress.unlockedBadges.length} de {badges.length} desbloqueadas</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-5">
          {badges.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-between relative ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale'
                }`}
              >
                {isUnlocked && (
                  <span className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400" title="Desbloqueada">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm"
                  style={{ backgroundColor: isUnlocked ? badge.color : '#94a3b8' }}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
                <span
                  className={`mt-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isUnlocked ? '¡Ganada!' : 'Bloqueada'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quizzes Interactive Test Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Selector Sidebar */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white px-1">
            Selecciona una Evaluación:
          </h4>
          <div className="space-y-2">
            {quizzes.map((quiz) => {
              const quizRecord = progress.quizScores[quiz.id];
              const isSelected = selectedQuiz?.id === quiz.id;

              return (
                <button
                  key={quiz.id}
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    handleResetQuiz();
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block line-clamp-1">{quiz.title}</span>
                    <span className="text-[11px] text-slate-500">
                      {quiz.questions.length} preguntas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {quizRecord && (
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {quizRecord.percentage}%
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Quiz Work Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {selectedQuiz && (
            <>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Test Interactivo
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedQuiz.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedQuiz.description}
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {selectedQuiz.questions.map((q, qIndex) => {
                  const selectedOpt = answers[q.id];
                  const isAnswered = selectedOpt !== undefined;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isChosen = selectedOpt === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let btnStyle = 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200';
                          if (isChosen && !submitted) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-medium ring-1 ring-emerald-500';
                          } else if (submitted) {
                            if (isCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isChosen && !isCorrect) {
                              btnStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              disabled={submitted}
                              className={`p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span className="leading-snug">{opt}</span>
                              {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {submitted && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation after submission */}
                      {submitted && (
                        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit or Score Banner */}
              {scoreResult ? (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Resultado: {scoreResult.score} de {scoreResult.total} aciertos ({scoreResult.pct}%)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {scoreResult.pct >= 75
                        ? '¡Excelente! Has aprobado la evaluación y conseguido la insignia correspondiente.'
                        : 'No alcanzaste el 75%. Te recomendamos repasar el capítulo e intentarlo de nuevo.'}
                    </p>
                  </div>
                  <button
                    onClick={handleResetQuiz}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reintentar Test</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length < selectedQuiz.questions.length}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    Calificar Evaluación
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
