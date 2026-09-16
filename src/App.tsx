import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, StudentProgress, UserProfile, ClassGroup } from './types';
import { CHAPTERS_DATA, BOOK_INTRODUCTION } from './data/bookContent';
import { EXERCISES_DATA } from './data/exercisesData';
import { QUIZZES_DATA, BADGES_DATA } from './data/quizzesData';
import { loadProgress, saveProgress } from './utils/storage';
import { ChapterCard } from './components/ChapterCard';
import { ChapterModal } from './components/ChapterModal';
import { InteractiveSpreadsheet } from './components/InteractiveSpreadsheet';
import { QuizzesBadgesView } from './components/QuizzesBadgesView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { GoogleSheetsIntegrationModal } from './components/GoogleSheetsIntegrationModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineDownloadsManagerModal } from './components/OfflineDownloadsManagerModal';
import { OfflinePDFViewerModal } from './components/OfflinePDFViewerModal';
import { StudentAccountHeader } from './components/StudentAccountHeader';
import { ClassSelectionModal } from './components/ClassSelectionModal';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { useOfflineChapters } from './hooks/useOfflineChapters';
import {
  initAuth,
  googleSignIn,
  logout,
  fetchClasses,
  updateUserClass,
  saveStudentProgressToCloud,
  loadStudentProgressFromCloud,
} from './services/firebase';
import {
  Search,
  Moon,
  Sun,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Award,
  TrendingUp,
  X,
  Filter,
  Info,
  ExternalLink,
  Table,
  Sparkles,
  Download,
  HardDrive,
  WifiOff,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Student progress state
  const [progress, setProgress] = useState<StudentProgress>(loadProgress);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'chapters' | 'exercises' | 'quizzes' | 'analytics' | 'teacher'>('chapters');

  // Education & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showOnlyOffline, setShowOnlyOffline] = useState(false);

  // Offline Hook
  const {
    offlineList,
    downloadedMap,
    downloadingMap,
    downloadChapter,
  } = useOfflineChapters();

  // Modals state
  const [readingChapterId, setReadingChapterId] = useState<number | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState(false);
  const [viewingPDFChapter, setViewingPDFChapter] = useState<Chapter | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Initialize Firebase Auth listener and fetch classes
  useEffect(() => {
    fetchClasses().then((cls) => setClasses(cls));

    const unsubscribe = initAuth(async (user, profile) => {
      if (profile) {
        setCurrentUser(profile);
        // Load cloud progress
        const cloudData = await loadStudentProgressFromCloud(profile.uid);
        if (cloudData) {
          setProgress((prev) => ({
            ...prev,
            studentName: profile.displayName,
            studentEmail: profile.email,
            completedChapters: Array.from(new Set([...prev.completedChapters, ...cloudData.completedChapters])),
            completedExercises: { ...prev.completedExercises, ...cloudData.completedExercises },
            quizScores: { ...prev.quizScores, ...cloudData.quizScores },
            unlockedBadges: Array.from(new Set([...prev.unlockedBadges, ...cloudData.unlockedBadges])),
          }));
        }
        if (!profile.classId && profile.role === 'student') {
          setIsClassSelectorOpen(true);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist progress to local storage and Cloud Firestore
  const handleUpdateProgress = (updated: StudentProgress) => {
    setProgress(updated);
    saveProgress(updated);
    if (currentUser) {
      saveStudentProgressToCloud(
        currentUser.uid,
        updated,
        currentUser.classId || 'sin-clase',
        currentUser.className || 'Sin clase',
        currentUser.email,
        currentUser.displayName,
        currentUser.photoURL
      );
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.profile);
        if (res.profile.role === 'teacher') {
          setActiveTab('teacher');
        } else if (!res.profile.classId) {
          setIsClassSelectorOpen(true);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    if (activeTab === 'teacher') {
      setActiveTab('chapters');
    }
  };

  const handleSelectClass = async (classId: string, className: string) => {
    if (currentUser) {
      const updated: UserProfile = { ...currentUser, classId, className };
      setCurrentUser(updated);
      await updateUserClass(currentUser.uid, classId, className);
      await saveStudentProgressToCloud(
        currentUser.uid,
        progress,
        classId,
        className,
        currentUser.email,
        currentUser.displayName,
        currentUser.photoURL
      );
    }
  };

  // Toggle chapter completion
  const handleToggleChapterComplete = (chId: number) => {
    const isCompleted = progress.completedChapters.includes(chId);
    const updatedChapters = isCompleted
      ? progress.completedChapters.filter((id) => id !== chId)
      : [...progress.completedChapters, chId];

    handleUpdateProgress({
      ...progress,
      completedChapters: updatedChapters,
    });
  };

  // Handle exercise completion
  const handleExerciseComplete = (exerciseId: string, userFormula: string, isCorrect: boolean) => {
    const updated = {
      ...progress,
      completedExercises: {
        ...progress.completedExercises,
        [exerciseId]: {
          completedAt: new Date().toISOString(),
          userFormula,
          isCorrect,
        },
      },
    };
    handleUpdateProgress(updated);
  };

  // Search and offline filtering logic
  const filteredChapters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CHAPTERS_DATA.filter((ch) => {
      if (showOnlyOffline && !downloadedMap[ch.id]) {
        return false;
      }

      const matchesCategory = selectedCategory === 'Todos' || ch.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inTitle = ch.title.toLowerCase().includes(q);
      const inSubtitle = ch.subtitle.toLowerCase().includes(q);
      const inSummary = ch.summary.toLowerCase().includes(q);
      const inSections = ch.sections.some(
        (sec) =>
          sec.title.toLowerCase().includes(q) ||
          sec.content.some((c) => c.toLowerCase().includes(q))
      );

      return inTitle || inSubtitle || inSummary || inSections;
    });
  }, [searchQuery, selectedCategory, showOnlyOffline, downloadedMap]);

  const categories = ['Todos', 'Fundamentos', 'Fórmulas', 'Diseño', 'Gestión', 'Colaboración', 'Análisis', 'Automatización', 'Estrategias', 'Soporte'];

  // Reading Chapter object
  const activeChapterIndex = CHAPTERS_DATA.findIndex((c) => c.id === readingChapterId);
  const activeChapter = activeChapterIndex !== -1 ? CHAPTERS_DATA[activeChapterIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Google Sheets
                </h1>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Guía en Español
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Manual Interactivo &amp; Aprendizaje
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar fórmulas, celdas, capítulos, VLOOKUP, atajos..."
                className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline PDFs Manager Button */}
            <button
              id="btn-offline-manager"
              onClick={() => setIsOfflineManagerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
              title="Gestionar descargas de capítulos en PDF para lectura offline"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Descargas PDF</span>
              {offlineList.length > 0 && (
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {offlineList.length}
                </span>
              )}
            </button>

            {/* Student & Teacher Account Header */}
            <StudentAccountHeader
              user={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onOpenClassSelector={() => setIsClassSelectorOpen(true)}
              onOpenTeacherDashboard={() => setActiveTab('teacher')}
              activeTab={activeTab}
              isLoggingIn={isLoggingIn}
            />

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Google Sheets Sync Button */}
            <button
              id="btn-sync-sheets"
              onClick={() => setIsSheetsModalOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
              title="Sincronizar progreso con Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sincronizar Sheets</span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              id="btn-theme-toggle"
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Mobile & Desktop) */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-6 py-1">
            <nav className="flex items-center space-x-1 sm:space-x-4 text-xs sm:text-sm font-semibold">
              <button
                id="nav-tab-chapters"
                onClick={() => setActiveTab('chapters')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'chapters'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Capítulos ({CHAPTERS_DATA.length})</span>
              </button>

              <button
                id="nav-tab-exercises"
                onClick={() => setActiveTab('exercises')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'exercises'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Ejercicios Prácticos ({EXERCISES_DATA.length})</span>
              </button>

              <button
                id="nav-tab-quizzes"
                onClick={() => setActiveTab('quizzes')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'quizzes'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Tests e Insignias</span>
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analítica &amp; Sheets</span>
              </button>

              {/* Teacher Portal Tab */}
              <button
                id="nav-tab-teacher"
                onClick={() => setActiveTab('teacher')}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'teacher'
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>Panel Profesor</span>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  Paco Soria
                </span>
              </button>
            </nav>

            <button
              onClick={() => setIsIntroModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Sobre el Libro</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* VIEW 1: CHAPTERS */}
        {activeTab === 'chapters' && (
          <div className="space-y-6">
            {/* Book Welcome Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl">
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  Guía Paso a Paso en Español
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Domina Google Sheets desde Cero
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Aprende el poder de la colaboración en tiempo real, fórmulas avanzadas ($A$1, VLOOKUP, INDEX/MATCH), tablas dinámicas y macros sin necesidad de conexión a internet. Descarga los capítulos en PDF a tu dispositivo para leer cuando quieras.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    id="btn-read-intro"
                    onClick={() => setIsIntroModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold hover:bg-emerald-50 transition shadow-md flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Leer Introducción</span>
                  </button>

                  <button
                    onClick={() => setReadingChapterId(1)}
                    className="px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold border border-emerald-500/40 transition flex items-center gap-2"
                  >
                    <span>Empezar Capítulo 1</span>
                  </button>

                  <button
                    onClick={() => setIsOfflineManagerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold border border-teal-500/40 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargas Offline ({offlineList.length}/{CHAPTERS_DATA.length})</span>
                  </button>
                </div>
              </div>

              {/* Decorative Subtle Grid Backdrop */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-center">
                <Table className="w-64 h-64 text-emerald-300" />
              </div>
            </div>

            {/* Filter Chips Bar (with Offline Toggle) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 pl-1">
                  <Filter className="w-3 h-3" />
                  Filtrar:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Toggle Solo Descargados Offline */}
              <button
                onClick={() => setShowOnlyOffline(!showOnlyOffline)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
                  showOnlyOffline
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Solo Descargados ({offlineList.length})</span>
              </button>
            </div>

            {/* Chapters Grid */}
            {filteredChapters.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {showOnlyOffline
                    ? 'Aún no has descargado ningún capítulo para lectura offline.'
                    : `No se encontraron capítulos con "${searchQuery}"`}
                </p>
                <p className="text-xs text-slate-500">
                  {showOnlyOffline
                    ? 'Haz clic en "Descargas PDF" o en el botón "PDF Offline" de cualquier capítulo para guardarlo en tu dispositivo.'
                    : 'Prueba buscando términos como "VLOOKUP", "F4", "inmovilizar", "formato" o "macros".'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {showOnlyOffline ? (
                    <button
                      onClick={() => setIsOfflineManagerOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs"
                    >
                      Abrir Gestor de Descargas
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Todos');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredChapters.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    isCompleted={progress.completedChapters.includes(chapter.id)}
                    onRead={() => setReadingChapterId(chapter.id)}
                    onToggleComplete={() => handleToggleChapterComplete(chapter.id)}
                    onOpenExercises={() => setActiveTab('exercises')}
                    isOfflineDownloaded={!!downloadedMap[chapter.id]}
                    isDownloading={!!downloadingMap[chapter.id]}
                    onDownloadPDF={() => downloadChapter(chapter, true)}
                    onViewPDF={() => setViewingPDFChapter(chapter)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRACTICAL EXERCISES CARDS */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Aprender Haciendo
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <Table className="w-6 h-6 text-emerald-600" />
                  Tarjetas de Ejercicios Prácticos de Google Sheets
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Prueba las fórmulas directamente en el simulador interactivo o ábrelas en Google Sheets.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {Object.keys(progress.completedExercises).length} de {EXERCISES_DATA.length} resueltos
                </span>
              </div>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {EXERCISES_DATA.map((ex) => (
                <InteractiveSpreadsheet
                  key={ex.id}
                  exercise={ex}
                  isCompleted={!!progress.completedExercises[ex.id]?.isCorrect}
                  onComplete={(formula, isCorrect) => handleExerciseComplete(ex.id, formula, isCorrect)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: TESTS AND BADGES */}
        {activeTab === 'quizzes' && (
          <QuizzesBadgesView
            quizzes={QUIZZES_DATA}
            badges={BADGES_DATA}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}

        {/* VIEW 4: ANALYTICS & GOOGLE SHEETS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            progress={progress}
            chapters={CHAPTERS_DATA}
            onUpdateProgress={handleUpdateProgress}
            onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
            onSelectChapter={(id) => {
              setReadingChapterId(id);
              setActiveTab('chapters');
            }}
            currentUser={currentUser}
            onOpenClassSelector={() => setIsClassSelectorOpen(true)}
          />
        )}

        {/* VIEW 5: TEACHER DASHBOARD FOR PACO SORIA & GOOGLE CLASSROOM */}
        {activeTab === 'teacher' && (
          <TeacherDashboardView
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Google Sheets para Principiantes</span>
            <span>• Manual Completo y Práctico</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOfflineManagerOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Capítulos Offline ({offlineList.length})</span>
            </button>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sincronizar Sheets</span>
            </button>
            <a
              href="https://sheets.google.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
            >
              <span>Ir a Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Chapter Reader Modal */}
      {activeChapter && (
        <ChapterModal
          chapter={activeChapter}
          onClose={() => setReadingChapterId(null)}
          isCompleted={progress.completedChapters.includes(activeChapter.id)}
          onToggleComplete={handleToggleChapterComplete}
          onNextChapter={() => {
            if (activeChapterIndex < CHAPTERS_DATA.length - 1) {
              setReadingChapterId(CHAPTERS_DATA[activeChapterIndex + 1].id);
            }
          }}
          onPrevChapter={() => {
            if (activeChapterIndex > 0) {
              setReadingChapterId(CHAPTERS_DATA[activeChapterIndex - 1].id);
            }
          }}
          hasNext={activeChapterIndex < CHAPTERS_DATA.length - 1}
          hasPrev={activeChapterIndex > 0}
          onGoToExercise={() => {
            setActiveTab('exercises');
            setReadingChapterId(null);
          }}
          onGoToQuiz={() => {
            setActiveTab('quizzes');
            setReadingChapterId(null);
          }}
          searchHighlight={searchQuery}
          isOfflineDownloaded={!!downloadedMap[activeChapter.id]}
          isDownloading={!!downloadingMap[activeChapter.id]}
          onDownloadPDF={() => downloadChapter(activeChapter, true)}
          onViewPDF={() => setViewingPDFChapter(activeChapter)}
        />
      )}

      {/* Offline Downloads Manager Modal */}
      <OfflineDownloadsManagerModal
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
        chapters={CHAPTERS_DATA}
        onOpenPDFViewer={(ch) => {
          setIsOfflineManagerOpen(false);
          setViewingPDFChapter(ch);
        }}
      />

      {/* Offline PDF Viewer Modal */}
      <OfflinePDFViewerModal
        chapter={viewingPDFChapter}
        isOpen={!!viewingPDFChapter}
        onClose={() => setViewingPDFChapter(null)}
      />

      {/* Google Sheets Integration Modal */}
      <GoogleSheetsIntegrationModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
      />

      {/* Introduction Modal */}
      {isIntroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {BOOK_INTRODUCTION.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {BOOK_INTRODUCTION.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIntroModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-[75vh] overflow-y-auto">
              {BOOK_INTRODUCTION.overview.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                Pilares Fundamentales de Google Sheets:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {BOOK_INTRODUCTION.pillars.map((pillar, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      {pillar.title}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setIsIntroModalOpen(false);
                  setReadingChapterId(1);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Comenzar Lectura del Capítulo 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection Modal for Students */}
      <ClassSelectionModal
        isOpen={isClassSelectorOpen}
        onClose={() => setIsClassSelectorOpen(false)}
        classes={classes}
        currentClassId={currentUser?.classId}
        onSelectClass={handleSelectClass}
      />

      {/* Offline Status Pill Notification */}
      <OfflineIndicator />
    </div>
  );
}
