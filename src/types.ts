export interface Section {
  id: string;
  title: string;
  subsections?: {
    id: string;
    title: string;
    content: string[];
    tip?: string;
    shortcut?: { pc: string; mac: string; desc: string };
  }[];
  content: string[];
  keyTakeaways?: string[];
}

export interface VisualDiagram {
  type: 'grid-coordinates' | 'formula-anatomy' | 'cell-references' | 'conditional-format' | 'pivot-table' | 'filter-views' | 'macro-flow' | 'shortcuts-palette' | 'troubleshooting-matrix';
  title: string;
  caption: string;
}

export interface Chapter {
  id: number;
  slug: string;
  numberText: string;
  title: string;
  subtitle: string;
  readTime: string;
  summary: string;
  category: 'Fundamentos' | 'Fórmulas' | 'Diseño' | 'Gestión' | 'Colaboración' | 'Análisis' | 'Automatización' | 'Estrategias' | 'Soporte';
  icon: string;
  diagram: VisualDiagram;
  sections: Section[];
}

export interface GridCell {
  val: string | number;
  computed?: string | number;
  format?: 'text' | 'number' | 'currency' | 'percent';
  highlight?: boolean;
  isHeader?: boolean;
}

export interface Exercise {
  id: string;
  chapterId: number;
  title: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  estimatedMinutes: number;
  objective: string;
  scenario: string;
  instructions: string[];
  initialGrid: {
    headers: string[];
    rows: (string | number)[][];
    targetCell: string; // e.g. "C6"
  };
  expectedFormula: string[]; // accepted formula strings (case-insensitive)
  expectedValue: string | number;
  formulaExplanation: string;
  sheetsTip: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  chapterId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  badgeId: string;
}

export interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  chapterId?: number;
}

export interface StudentProgress {
  studentName: string;
  studentEmail: string;
  completedChapters: number[];
  completedExercises: Record<string, {
    completedAt: string;
    userFormula: string;
    isCorrect: boolean;
  }>;
  quizScores: Record<string, {
    score: number;
    total: number;
    completedAt: string;
    percentage: number;
  }>;
  unlockedBadges: string[];
  notes: Record<string, string>;
  studyTimeMinutes: number;
  lastActiveDate: string;
  streakDays: number;
  instructorFeedback: {
    notes: string;
    recommendedChapters: number[];
    updatedAt?: string;
  };
  googleSheetSync: {
    webhookUrl: string;
    sheetName: string;
    lastSyncedAt: string | null;
    status: 'idle' | 'syncing' | 'success' | 'error';
    errorMessage?: string;
  };
}

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  classId?: string;
  className?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherEmail: string;
  teacherName: string;
  academicYear?: string;
  createdAt: string;
  studentCount?: number;
}

export interface StudentRecord {
  userId: string;
  userEmail: string;
  userName: string;
  photoURL?: string;
  classId: string;
  className: string;
  completedChapters: number[];
  completedExercises: Record<string, {
    completedAt: string;
    userFormula: string;
    isCorrect: boolean;
  }>;
  quizScores: Record<string, {
    score: number;
    total: number;
    completedAt: string;
    percentage: number;
  }>;
  unlockedBadges: string[];
  studyTimeMinutes: number;
  lastActiveDate: string;
  averageGrade: number; // 0 - 10
  totalScore: number;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface ClassroomCourseWork {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  maxPoints?: number;
  state?: string;
  alternateLink?: string;
}
