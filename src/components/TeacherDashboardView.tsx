import React, { useState, useEffect, useMemo } from 'react';
import { StudentRecord, ClassGroup, ClassroomCourse, UserProfile } from '../types';
import {
  fetchClasses,
  createClassGroup,
  deleteClassGroup,
  fetchAllStudentsProgress,
  getAccessToken,
  googleSignIn,
  switchAccountToOfficialTeacher,
  OFFICIAL_TEACHER_EMAIL,
} from '../services/firebase';
import {
  fetchClassroomCourses,
  createClassroomCourseWork,
  downloadClassroomGradebookCSV,
} from '../services/classroomService';
import {
  Users,
  GraduationCap,
  School,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Award,
  BookOpen,
  Table,
  Clock,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Send,
  Eye,
  X,
  Share2,
} from 'lucide-react';

interface Props {
  currentUser: UserProfile | null;
  onRefreshAll?: () => void;
}

// Sample fallback students if database is newly initialized
const INITIAL_DEMO_STUDENTS: StudentRecord[] = [
  {
    userId: 'student-demo-1',
    userEmail: 'lucia.garcia@iesdiegotorrente.es',
    userName: 'Lucía García Moreno',
    classId: '1eso-a',
    className: '1º ESO A - Digitalización y Ofimática',
    completedChapters: [1, 2, 3, 4],
    completedExercises: {
      'ex-1-sum': { completedAt: new Date().toISOString(), userFormula: '=SUM(B2:B8)', isCorrect: true },
      'ex-2-abs': { completedAt: new Date().toISOString(), userFormula: '=B3*$C$1', isCorrect: true },
      'ex-3-vlookup': { completedAt: new Date().toISOString(), userFormula: '=VLOOKUP(E2,A2:C10,3,FALSE)', isCorrect: true },
      'ex-4-average': { completedAt: new Date().toISOString(), userFormula: '=AVERAGE(C2:C12)', isCorrect: true },
    },
    quizScores: {
      'ch-1': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-2': { score: 4, total: 5, completedAt: new Date().toISOString(), percentage: 80 },
    },
    unlockedBadges: ['badge-basics', 'badge-formulas'],
    studyTimeMinutes: 85,
    lastActiveDate: new Date().toISOString(),
    averageGrade: 9.0,
    totalScore: 130,
  },
  {
    userId: 'student-demo-2',
    userEmail: 'marcos.navarro@iesdiegotorrente.es',
    userName: 'Marcos Navarro Gil',
    classId: '1eso-a',
    className: '1º ESO A - Digitalización y Ofimática',
    completedChapters: [1, 2],
    completedExercises: {
      'ex-1-sum': { completedAt: new Date().toISOString(), userFormula: '=SUM(B2:B8)', isCorrect: true },
      'ex-2-abs': { completedAt: new Date().toISOString(), userFormula: '=B3*$C$1', isCorrect: true },
    },
    quizScores: {
      'ch-1': { score: 4, total: 5, completedAt: new Date().toISOString(), percentage: 80 },
    },
    unlockedBadges: ['badge-basics'],
    studyTimeMinutes: 45,
    lastActiveDate: new Date(Date.now() - 86400000).toISOString(),
    averageGrade: 8.0,
    totalScore: 100,
  },
  {
    userId: 'student-demo-3',
    userEmail: 'elena.sanchez@iesdiegotorrente.es',
    userName: 'Elena Sánchez Pérez',
    classId: '4eso-tic',
    className: '4º ESO - TIC y Digitalización',
    completedChapters: [1, 2, 3, 4, 5, 6, 7],
    completedExercises: {
      'ex-1-sum': { completedAt: new Date().toISOString(), userFormula: '=SUM(B2:B8)', isCorrect: true },
      'ex-2-abs': { completedAt: new Date().toISOString(), userFormula: '=B3*$C$1', isCorrect: true },
      'ex-3-vlookup': { completedAt: new Date().toISOString(), userFormula: '=VLOOKUP(E2,A2:C10,3,FALSE)', isCorrect: true },
      'ex-4-average': { completedAt: new Date().toISOString(), userFormula: '=AVERAGE(C2:C12)', isCorrect: true },
      'ex-5-filter': { completedAt: new Date().toISOString(), userFormula: '=FILTER(A2:D10,C2:C10="Aprobado")', isCorrect: true },
      'ex-6-pivot': { completedAt: new Date().toISOString(), userFormula: '=QUERY(A1:D20,"SELECT B, SUM(C) GROUP BY B",1)', isCorrect: true },
    },
    quizScores: {
      'ch-1': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-2': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-3': { score: 4, total: 5, completedAt: new Date().toISOString(), percentage: 80 },
    },
    unlockedBadges: ['badge-basics', 'badge-formulas', 'badge-data-analyst', 'badge-collaboration'],
    studyTimeMinutes: 140,
    lastActiveDate: new Date().toISOString(),
    averageGrade: 9.5,
    totalScore: 155,
  },
  {
    userId: 'student-demo-4',
    userEmail: 'alvaro.ruiz@iesdiegotorrente.es',
    userName: 'Álvaro Ruiz Morales',
    classId: '1bach-tic',
    className: '1º Bachillerato - Tecnologías de la Información',
    completedChapters: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    completedExercises: {
      'ex-1-sum': { completedAt: new Date().toISOString(), userFormula: '=SUM(B2:B8)', isCorrect: true },
      'ex-2-abs': { completedAt: new Date().toISOString(), userFormula: '=B3*$C$1', isCorrect: true },
      'ex-3-vlookup': { completedAt: new Date().toISOString(), userFormula: '=VLOOKUP(E2,A2:C10,3,FALSE)', isCorrect: true },
      'ex-4-average': { completedAt: new Date().toISOString(), userFormula: '=AVERAGE(C2:C12)', isCorrect: true },
      'ex-5-filter': { completedAt: new Date().toISOString(), userFormula: '=FILTER(A2:D10,C2:C10="Aprobado")', isCorrect: true },
      'ex-6-pivot': { completedAt: new Date().toISOString(), userFormula: '=QUERY(A1:D20,"SELECT B, SUM(C) GROUP BY B",1)', isCorrect: true },
      'ex-7-macros': { completedAt: new Date().toISOString(), userFormula: '=COUNTIF(D2:D20, ">10")', isCorrect: true },
    },
    quizScores: {
      'ch-1': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-2': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-3': { score: 5, total: 5, completedAt: new Date().toISOString(), percentage: 100 },
      'ch-4': { score: 4, total: 5, completedAt: new Date().toISOString(), percentage: 80 },
    },
    unlockedBadges: ['badge-basics', 'badge-formulas', 'badge-data-analyst', 'badge-master'],
    studyTimeMinutes: 210,
    lastActiveDate: new Date().toISOString(),
    averageGrade: 9.8,
    totalScore: 168,
  },
];

export const TeacherDashboardView: React.FC<Props> = ({ currentUser }) => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'classroom'>('students');

  // New Class Form State
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Selected Student Detail Modal
  const [inspectingStudent, setInspectingStudent] = useState<StudentRecord | null>(null);

  // Google Classroom Integration State
  const [classroomCourses, setClassroomCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('Práctica y Tests de Google Sheets - Evaluación 1');
  const [assignmentPoints, setAssignmentPoints] = useState<number>(10);
  const [isPublishingAssignment, setIsPublishingAssignment] = useState(false);
  const [publishedAssignment, setPublishedAssignment] = useState<{ id: string; alternateLink?: string; title: string } | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  // Email status checks for Paco Soria & Google Classroom
  const isOfficialTeacherConnected = currentUser?.email?.toLowerCase().trim() === OFFICIAL_TEACHER_EMAIL;
  const isWrongAccount = currentUser != null && !isOfficialTeacherConnected;

  // Handle switching to pacosoriaprofe@iesdiegotorrente.es
  const handleSwitchToOfficialAccount = async () => {
    setIsSwitchingAccount(true);
    setClassroomError(null);
    try {
      const res = await switchAccountToOfficialTeacher();
      if (res?.accessToken) {
        setIsLoadingCourses(true);
        try {
          const courses = await fetchClassroomCourses(res.accessToken);
          setClassroomCourses(courses);
          if (courses.length > 0) setSelectedCourseId(courses[0].id);
        } catch (e: any) {
          console.error('Error fetching courses with official teacher account:', e);
          setClassroomError('Conectado a pacosoriaprofe@iesdiegotorrente.es. ' + (e.message || ''));
        } finally {
          setIsLoadingCourses(false);
        }
      }
      await loadData();
    } catch (err: any) {
      console.error('Error switching account:', err);
      setClassroomError(err.message || 'No se pudo completar el cambio a pacosoriaprofe@iesdiegotorrente.es');
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  // Fetch classes and students
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedClasses, fetchedStudents] = await Promise.all([
        fetchClasses(),
        fetchAllStudentsProgress(),
      ]);
      setClasses(fetchedClasses);

      // Merge real students with demo students if none or few
      if (fetchedStudents.length === 0) {
        setStudents(INITIAL_DEMO_STUDENTS);
      } else {
        // Ensure no duplicate IDs
        const existingIds = new Set(fetchedStudents.map((s) => s.userId));
        const merged = [...fetchedStudents];
        for (const demo of INITIAL_DEMO_STUDENTS) {
          if (!existingIds.has(demo.userId)) {
            merged.push(demo);
          }
        }
        setStudents(merged);
      }
    } catch (err) {
      console.error('Error loading teacher data:', err);
      setStudents(INITIAL_DEMO_STUDENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.userName.toLowerCase().includes(q) ||
        s.userEmail.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q);
      return matchClass && matchQuery;
    });
  }, [students, selectedClassId, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) {
      return { total: 0, avgGrade: 0, avgChapters: 0, avgExercises: 0 };
    }
    const sumGrade = filteredStudents.reduce((acc, s) => acc + s.averageGrade, 0);
    const sumChapters = filteredStudents.reduce((acc, s) => acc + s.completedChapters.length, 0);
    const sumExercises = filteredStudents.reduce((acc, s) => acc + Object.keys(s.completedExercises).length, 0);

    return {
      total,
      avgGrade: (sumGrade / total).toFixed(1),
      avgChapters: (sumChapters / total).toFixed(1),
      avgExercises: (sumExercises / total).toFixed(1),
    };
  }, [filteredStudents]);

  // Handle Class Creation
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) return;

    try {
      const id = newClassCode.toLowerCase().replace(/[^a-z0-9]/gi, '-');
      const created = await createClassGroup({
        id,
        name: newClassName.trim(),
        code: newClassCode.trim().toUpperCase(),
        description: newClassDesc.trim(),
        teacherEmail: currentUser?.email || 'pacosoriaprofe@iesdiegotorrente.es',
        teacherName: currentUser?.displayName || 'Paco Soria',
        academicYear: '2025/2026',
      });
      setClasses((prev) => [...prev, created]);
      setNewClassName('');
      setNewClassCode('');
      setNewClassDesc('');
      setIsCreatingClass(false);
    } catch (err) {
      console.error('Error creating class:', err);
    }
  };

  // Handle Class Deletion
  const handleDeleteClass = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la clase "${name}"?`)) {
      await deleteClassGroup(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (selectedClassId === id) setSelectedClassId('all');
    }
  };

  // Connect & Fetch Google Classroom Courses
  const handleFetchClassroomCourses = async () => {
    setIsLoadingCourses(true);
    setClassroomError(null);
    try {
      // If current user is not pacosoriaprofe@iesdiegotorrente.es, guide them to switch
      if (currentUser?.email?.toLowerCase().trim() !== OFFICIAL_TEACHER_EMAIL) {
        await handleSwitchToOfficialAccount();
        return;
      }

      let token = await getAccessToken();
      if (!token) {
        // Re-authenticate specifically with official account
        const res = await googleSignIn(OFFICIAL_TEACHER_EMAIL);
        token = res?.accessToken || null;
      }

      if (!token) {
        throw new Error('No se pudo obtener el token de acceso de Google Classroom.');
      }

      const courses = await fetchClassroomCourses(token);
      setClassroomCourses(courses);
      if (courses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courses[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching Classroom courses:', err);
      setClassroomError(err.message || 'Error al conectar con Google Classroom. Revisa tus permisos.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Create Assignment in Google Classroom
  const handleCreateAssignment = async () => {
    if (!selectedCourseId) {
      alert('Por favor, selecciona un curso de Google Classroom.');
      return;
    }

    setIsPublishingAssignment(true);
    setClassroomError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn(OFFICIAL_TEACHER_EMAIL);
        token = res?.accessToken || null;
      }
      if (!token) throw new Error('Token no disponible');

      const result = await createClassroomCourseWork(
        token,
        selectedCourseId,
        assignmentTitle,
        'Estimados alumnos de IES Diego Torrente:\nCompletad los módulos de fórmulas ($A$1, VLOOKUP, SUM, AVERAGE), tablas dinámicas y realizad los tests prácticos para registrar vuestra calificación automáticamente.',
        assignmentPoints
      );

      setPublishedAssignment(result);
    } catch (err: any) {
      console.error('Error creating assignment in Classroom:', err);
      setClassroomError(err.message || 'No se pudo publicar la tarea en Google Classroom.');
    } finally {
      setIsPublishingAssignment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* WARNING / SWITCH BANNER IF CONNECTED TO WRONG EMAIL */}
      {isWrongAccount && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 text-amber-950 dark:text-amber-100 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm">
                  Cuenta incorrecta vinculada a Google Classroom:
                </span>
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-mono text-xs font-bold">
                  {currentUser?.email || 'pacosoriaprofe@gmail.com'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Has iniciado sesión con tu cuenta personal. Google Classroom y los cursos del centro deben gestionarse obligatoriamente desde tu cuenta institucional: <strong className="text-indigo-600 dark:text-indigo-400 font-bold underline">pacosoriaprofe@iesdiegotorrente.es</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={handleSwitchToOfficialAccount}
            disabled={isSwitchingAccount}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSwitchingAccount ? 'animate-spin' : ''}`} />
            <span>{isSwitchingAccount ? 'Cambiando de cuenta...' : 'Conectar con pacosoriaprofe@iesdiegotorrente.es'}</span>
          </button>
        </div>
      )}

      {/* Teacher Module Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Panel Docente • IES Diego Torrente Ballester
              </span>
              <span className="text-xs text-slate-400">
                Profesor: <strong className="text-white">pacosoriaprofe@iesdiegotorrente.es</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Control de Alumnos, Clases y Google Classroom
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Supervisa en tiempo real el progreso de todos los estudiantes registrados con su cuenta educativa @iesdiegotorrente.es, gestiona las clases y exporta las calificaciones directamente a Google Classroom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Refrescar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            <button
              onClick={() => {
                const currentCls = classes.find((c) => c.id === selectedClassId);
                downloadClassroomGradebookCSV(filteredStudents, currentCls?.name || 'Todas_las_clases');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Calificaciones (CSV)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Teacher Module */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Resultados de Alumnos ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'classes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <School className="w-4 h-4 text-indigo-600" />
            <span>Gestión de Clases ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'classroom'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Exportar a Google Classroom</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENTS LIST & GRADES */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Total Alumnos
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {metrics.total}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">@iesdiegotorrente.es</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Nota Media de Clase
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {metrics.avgGrade} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Promedio de tests prácticos</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Capítulos Leídos Promedio
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {metrics.avgChapters} <span className="text-xs font-normal text-slate-400">/ 9</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Avance de lectura del libro</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Ejercicios Resueltos Promedio
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                {metrics.avgExercises} <span className="text-xs font-normal text-slate-400">/ 8</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Fórmulas validadas</span>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno por nombre o email..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Clase:
              </span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Todas las clases ({students.length} alumnos)</option>
                {classes.map((cls) => {
                  const count = students.filter((s) => s.classId === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-4">Clase / Grupo</th>
                    <th className="py-3 px-4 text-center">Capítulos</th>
                    <th className="py-3 px-4 text-center">Ejercicios</th>
                    <th className="py-3 px-4 text-center">Nota Media</th>
                    <th className="py-3 px-4 text-center">Insignias</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No se encontraron alumnos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const completedExCount = Object.keys(st.completedExercises).length;
                      return (
                        <tr
                          key={st.userId}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                                {st.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {st.userName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {st.userEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              {st.className}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {st.completedChapters.length}
                            </span>
                            <span className="text-slate-400 text-[10px]"> / 9</span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {completedExCount}
                            </span>
                            <span className="text-slate-400 text-[10px]"> / 8</span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                st.averageGrade >= 8
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : st.averageGrade >= 5
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {st.averageGrade.toFixed(1)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              {st.unlockedBadges.length}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setInspectingStudent(st)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detalle</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES MANAGEMENT */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Clases del IES Diego Torrente
              </h3>
              <p className="text-xs text-slate-500">
                Los alumnos eligen su clase al iniciar sesión para vincular sus calificaciones.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingClass(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Clase</span>
            </button>
          </div>

          {/* Form Create Class Modal */}
          {isCreatingClass && (
            <form
              onSubmit={handleCreateClass}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 shadow-md space-y-4 animate-in fade-in duration-150"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600" />
                <span>Añadir Nueva Clase o Grupo</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nombre Completo de la Clase
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. 3º ESO C - Digitalización"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Código Breve
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    placeholder="Ej. 3ESOC"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Descripción u Objetivos
                </label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Ej. Grupo de informática y ofimática con hojas de cálculo..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingClass(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Guardar Clase
                </button>
              </div>
            </form>
          )}

          {/* Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const enrolled = students.filter((s) => s.classId === cls.id);
              const avg =
                enrolled.length > 0
                  ? (enrolled.reduce((acc, s) => acc + s.averageGrade, 0) / enrolled.length).toFixed(1)
                  : 'N/A';

              return (
                <div
                  key={cls.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {cls.code}
                      </span>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition"
                        title="Eliminar clase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {cls.name}
                    </h4>
                    {cls.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cls.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {enrolled.length} alumnos
                    </span>
                    <span>
                      Nota media: <strong className="text-indigo-600 dark:text-indigo-400">{avg}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE CLASSROOM INTEGRATION */}
      {activeTab === 'classroom' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Account Status Card in Classroom Tab */}
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                    isOfficialTeacherConnected ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                >
                  {isOfficialTeacherConnected ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cuenta conectada a Classroom:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        isOfficialTeacherConnected
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {currentUser?.email || 'No iniciada'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isOfficialTeacherConnected
                      ? 'Cuenta institucional oficial (@iesdiegotorrente.es). Autorizada para gestionar cursos y tareas de Classroom.'
                      : 'Cuenta personal @gmail.com detectada. Los cursos de Classroom requieren pacosoriaprofe@iesdiegotorrente.es.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSwitchToOfficialAccount}
                disabled={isSwitchingAccount}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs ${
                  isOfficialTeacherConnected
                    ? 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSwitchingAccount ? 'animate-spin' : ''}`} />
                <span>
                  {isOfficialTeacherConnected
                    ? 'Reautenticar cuenta oficial'
                    : 'Cambiar a pacosoriaprofe@iesdiegotorrente.es'}
                </span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  OAuth Workspace Conectado
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Exportar a Cursos de Google Classroom
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Publica las tareas directamente en tu Google Classroom para que los alumnos accedan con un clic o descarga el libro de notas para calificar en un paso.
                </p>
              </div>

              <button
                onClick={handleFetchClassroomCourses}
                disabled={isLoadingCourses}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCourses ? 'animate-spin' : ''}`} />
                <span>{classroomCourses.length > 0 ? 'Actualizar Cursos' : 'Cargar Cursos de Classroom'}</span>
              </button>
            </div>

            {classroomError && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{classroomError}</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Consejo: También puedes pulsar en "Exportar Calificaciones (CSV)" para obtener la hoja de cálculo estándar de notas lista para importar a Classroom o Google Sheets.
                  </p>
                </div>
              </div>
            )}

            {/* Course Selector and Assignment Form */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Seleccionar Curso de Google Classroom
                  </label>
                  {classroomCourses.length > 0 ? (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {classroomCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.section ? `(${c.section})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
                      <span>Cursos no cargados aún. Pulsa el botón "Cargar Cursos".</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Puntuación Máxima de la Tarea
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={assignmentPoints}
                    onChange={(e) => setAssignmentPoints(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Título de la Tarea en Google Classroom
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCreateAssignment}
                  disabled={isPublishingAssignment || classroomCourses.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isPublishingAssignment ? 'Publicando en Classroom...' : 'Publicar Tarea en Google Classroom'}
                  </span>
                </button>

                <button
                  onClick={() => downloadClassroomGradebookCSV(filteredStudents, 'Google_Classroom')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargar Plantilla CSV para Classroom</span>
                </button>
              </div>

              {/* Published Result Banner */}
              {publishedAssignment && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ¡Tarea "{publishedAssignment.title}" publicada con éxito en Google Classroom!
                    </span>
                    {publishedAssignment.alternateLink && (
                      <a
                        href={publishedAssignment.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>Abrir en Classroom</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Los alumnos verán la tarea asignada con el enlace directo para practicar y validar fórmulas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  {inspectingStudent.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {inspectingStudent.userName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {inspectingStudent.userEmail} • {inspectingStudent.className}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Nota Media</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {inspectingStudent.averageGrade.toFixed(1)} / 10
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Ejercicios Hechos</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {Object.keys(inspectingStudent.completedExercises).length} / 8
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Tiempo Estudio</span>
                  <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                    {inspectingStudent.studyTimeMinutes || 0} min
                  </span>
                </div>
              </div>

              {/* Completed Exercises breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fórmulas y Ejercicios Realizados</span>
                </h4>
                {Object.keys(inspectingStudent.completedExercises).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No ha completado ejercicios aún.</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(inspectingStudent.completedExercises).map(([exId, rawRes]) => {
                      const res = rawRes as { userFormula?: string; completedAt?: string };
                      return (
                        <div
                          key={exId}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold block">
                              {exId}
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                              Fórmula: {res?.userFormula || 'Correcta'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {res?.completedAt ? new Date(res.completedAt).toLocaleDateString('es-ES') : 'Completado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quiz Scores breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Resultados de Tests por Capítulo</span>
                </h4>
                {Object.keys(inspectingStudent.quizScores).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No ha realizado tests aún.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(inspectingStudent.quizScores).map(([quizId, rawQ]) => {
                      const q = rawQ as { score?: number; total?: number; percentage?: number };
                      return (
                        <div
                          key={quizId}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {quizId.toUpperCase()}
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {q?.score ?? 0} / {q?.total ?? 5} ({q?.percentage ?? 0}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
