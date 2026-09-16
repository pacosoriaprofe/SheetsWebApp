import React, { useState } from 'react';
import { StudentProgress, Chapter, UserProfile } from '../types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  Flame,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Save,
  Check,
  School,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface Props {
  progress: StudentProgress;
  chapters: Chapter[];
  onUpdateProgress: (updated: StudentProgress) => void;
  onOpenSheetsSync: () => void;
  onSelectChapter: (id: number) => void;
  currentUser?: UserProfile | null;
  onOpenClassSelector?: () => void;
}

export const AnalyticsDashboard: React.FC<Props> = ({
  progress,
  chapters,
  onUpdateProgress,
  onOpenSheetsSync,
  onSelectChapter,
  currentUser,
  onOpenClassSelector,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'instructor'>('student');
  const [feedbackNote, setFeedbackNote] = useState(progress.instructorFeedback.notes);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Compute metrics
  const totalChapters = 9;
  const completedChaptersCount = progress.completedChapters.length;
  const chaptersPct = Math.round((completedChaptersCount / totalChapters) * 100);

  const totalExercises = 8;
  const completedExercisesCount = Object.keys(progress.completedExercises).length;
  const exercisesPct = Math.round((completedExercisesCount / totalExercises) * 100);

  const quizScoresArr = Object.values(progress.quizScores) as Array<{ percentage: number }>;
  let sumScore = 0;
  for (const q of quizScoresArr) {
    sumScore += q.percentage;
  }
  const averageQuizScore = quizScoresArr.length > 0 ? Math.round(sumScore / quizScoresArr.length) : 0;

  const overallMastery = Math.round((chaptersPct * 0.4) + (exercisesPct * 0.4) + (averageQuizScore * 0.2));

  // Category breakdown data for BarChart
  const categoryStats = [
    {
      category: 'Fundamentos',
      completed: progress.completedChapters.includes(1) ? 100 : 30,
      color: '#0F9D58',
    },
    {
      category: 'Fórmulas ($)',
      completed: progress.completedChapters.includes(2) ? 90 : 20,
      color: '#4285F4',
    },
    {
      category: 'Diseño/Gráficos',
      completed: progress.completedChapters.includes(3) ? 85 : 15,
      color: '#EA4335',
    },
    {
      category: 'Gestión & Filtros',
      completed: progress.completedChapters.includes(4) ? 80 : 10,
      color: '#FBBC05',
    },
    {
      category: 'Colaboración',
      completed: progress.completedChapters.includes(5) ? 95 : 10,
      color: '#10B981',
    },
    {
      category: 'Análisis & Pivot',
      completed: progress.completedChapters.includes(6) ? 75 : 0,
      color: '#8B5CF6',
    },
    {
      category: 'Macros & Script',
      completed: progress.completedChapters.includes(7) ? 60 : 0,
      color: '#EC4899',
    },
  ];

  // Long-term growth trend data (simulated longitudinal days)
  const growthTrendData = [
    { day: 'Día 1', progreso: 15, horas: 0.5 },
    { day: 'Día 2', progreso: 30, horas: 1.0 },
    { day: 'Día 3', progreso: 45, horas: 1.8 },
    { day: 'Día 4', progreso: 60, horas: 2.5 },
    { day: 'Día 5', progreso: 75, horas: 3.2 },
    { day: 'Día 6', progreso: 88, horas: 4.0 },
    { day: 'Hoy', progreso: Math.max(overallMastery, 65), horas: Math.round((progress.studyTimeMinutes / 60) * 10) / 10 },
  ];

  const handleSaveFeedback = () => {
    onUpdateProgress({
      ...progress,
      instructorFeedback: {
        ...progress.instructorFeedback,
        notes: feedbackNote,
        updatedAt: new Date().toISOString(),
      },
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleToggleRecommendedChapter = (chId: number) => {
    const current = progress.instructorFeedback.recommendedChapters || [];
    const updated = current.includes(chId)
      ? current.filter((id) => id !== chId)
      : [...current, chId];

    onUpdateProgress({
      ...progress,
      instructorFeedback: {
        ...progress.instructorFeedback,
        recommendedChapters: updated,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Panel de Analíticas y Seguimiento
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualiza tu curva de crecimiento en Google Sheets y sincroniza tus métricas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'student'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vista Estudiante
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeTab === 'instructor'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Modo Instructor</span>
            </button>
          </div>

          <button
            onClick={onOpenSheetsSync}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            title="Sincronizar métricas con Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Educational Account & Class Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                IES Diego Torrente Ballester
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold">
                {currentUser?.className || 'Sin clase seleccionada'}
              </span>
              {currentUser?.email && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ({currentUser.email})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              Profesor tutor: <strong className="text-emerald-700 dark:text-emerald-400">Paco Soria (pacosoriaprofe@iesdiegotorrente.es)</strong> • Sincronización en la nube activa para evaluación.
            </p>
          </div>
        </div>

        {onOpenClassSelector && (
          <button
            onClick={onOpenClassSelector}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-slate-800 transition shrink-0 flex items-center gap-1 shadow-xs"
          >
            <span>{currentUser?.className ? 'Cambiar Clase' : 'Elegir mi Clase'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dominio Global</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {overallMastery}%
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${overallMastery}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Capítulos</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {completedChaptersCount} <span className="text-xs font-normal text-slate-400">/ 9</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{chaptersPct}% cubierto</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ejercicios</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {completedExercisesCount} <span className="text-xs font-normal text-slate-400">/ 8</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{exercisesPct}% resueltos</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quizzes</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {averageQuizScore}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{quizScoresArr.length} evaluaciones</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Insignias</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {progress.unlockedBadges.length} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Logros ganados</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Racha</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {progress.streakDays} <span className="text-xs font-normal text-slate-400">días</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{progress.studyTimeMinutes} min de estudio</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend AreaChart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Tendencia de Crecimiento a Largo Plazo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Evolución porcentual de destreza a lo largo de los días</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              +{overallMastery}% total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F9D58" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F9D58" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    borderColor: '#1e293b',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="progreso" stroke="#0F9D58" strokeWidth={3} fillOpacity={1} fill="url(#growthGradient)" name="Progreso (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competence BarChart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Dominio por Bloques Temáticos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Porcentaje de asimilación según el currículo del libro</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    borderColor: '#1e293b',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} name="Dominio (%)">
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Instructor View & Feedback Loop Module */}
      {activeTab === 'instructor' ? (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/50 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Herramientas del Instructor
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Bucle de Retroalimentación Personalizada y Ajuste Curricular
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajusta las metas individuales del alumno y proporciona feedback específico basado en sus métricas.
              </p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Alumno: <strong className="text-slate-900 dark:text-white">{progress.studentName}</strong> ({progress.studentEmail})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback Editor */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Comentarios y Recomendaciones del Profesor:
              </label>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                rows={4}
                placeholder="Escribe aquí observaciones sobre el desempeño del alumno, recomendaciones de repaso o felicitaciones..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Visible en el panel del estudiante y exportable a Google Sheets.
                </span>
                <button
                  onClick={handleSaveFeedback}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedFeedback ? '¡Guardado!' : 'Guardar Feedback'}</span>
                </button>
              </div>
            </div>

            {/* Curriculum Adjustment */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Ajuste Curricular: Asignar Capítulos Prioritarios
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Marca los capítulos que el estudiante debe priorizar según sus debilidades:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {chapters.map((ch) => {
                  const isRec = progress.instructorFeedback.recommendedChapters.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleToggleRecommendedChapter(ch.id)}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isRec
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">Capítulo {ch.id}: {ch.title.split(':')[0]}</span>
                      {isRec ? <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Student Feedback View */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Feedback del Instructor para ti:
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 italic">
                "{progress.instructorFeedback.notes || 'Aún no hay feedback registrado por tu tutor.'}"
              </p>
              {progress.instructorFeedback.recommendedChapters.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                    Capítulos prioritarios recomendados:
                  </span>
                  {progress.instructorFeedback.recommendedChapters.map((chId) => (
                    <button
                      key={chId}
                      onClick={() => onSelectChapter(chId)}
                      className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 text-xs font-bold hover:underline"
                    >
                      Capítulo {chId}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('instructor')}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline shrink-0"
          >
            Cambiar a panel de tutor
          </button>
        </div>
      )}
    </div>
  );
};
