import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDocFromServer,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole, ClassGroup, StudentProgress, StudentRecord } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider factory with Google Classroom scopes and domain restriction
export const SCHOOL_DOMAIN = 'iesdiegotorrente.es';
export const OFFICIAL_TEACHER_EMAIL = 'pacosoriaprofe@iesdiegotorrente.es';

export const createGoogleProvider = (
  loginHint: string = OFFICIAL_TEACHER_EMAIL,
  forceDomain: boolean = true
) => {
  const p = new GoogleAuthProvider();
  p.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
  p.addScope('https://www.googleapis.com/auth/classroom.coursework.students');
  p.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly');

  const customParams: Record<string, string> = {
    prompt: 'select_account',
  };

  if (loginHint) {
    customParams.login_hint = loginHint;
  }

  if (forceDomain) {
    customParams.hd = SCHOOL_DOMAIN;
  }

  p.setCustomParameters(customParams);
  return p;
};

// Default provider instance
const defaultProvider = createGoogleProvider(OFFICIAL_TEACHER_EMAIL, true);

// In-memory token caching as mandated
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore está en modo offline.');
    }
  }
}
testFirestoreConnection();

export const TEACHER_EMAILS = [
  OFFICIAL_TEACHER_EMAIL,
];

export function isTeacherAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    normalized === OFFICIAL_TEACHER_EMAIL ||
    (normalized.endsWith(`@${SCHOOL_DOMAIN}`) && normalized.includes('profe'))
  );
}

export function isSchoolAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith(`@${SCHOOL_DOMAIN}`);
}

export const initAuth = (
  onAuthChange: (user: User | null, profile: UserProfile | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      // Fetch or build user profile
      const profile = await getUserProfile(firebaseUser.uid, firebaseUser);
      onAuthChange(firebaseUser, profile, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onAuthChange(null, null, null);
    }
  });
};

export const googleSignIn = async (
  requestedLoginHint: string = OFFICIAL_TEACHER_EMAIL
): Promise<{
  user: User;
  profile: UserProfile;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const provider = createGoogleProvider(requestedLoginHint, true);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    const email = result.user.email?.toLowerCase().trim() || '';
    const role: UserRole = isTeacherAccount(email) ? 'teacher' : 'student';

    // Fetch existing or initialize profile
    let profile = await getUserProfile(result.user.uid, result.user);
    if (!profile) {
      profile = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Usuario',
        photoURL: result.user.photoURL || undefined,
        role,
        classId: undefined,
        className: undefined,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      await saveUserProfile(profile);
    } else {
      // Update role and last active
      profile.role = role;
      await updateDoc(doc(db, 'users', profile.uid), {
        role,
        lastActive: new Date().toISOString(),
      }).catch(() => {});
    }

    return {
      user: result.user,
      profile,
      accessToken: cachedAccessToken || '',
    };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Specifically signs out any current user (such as an inadvertent @gmail.com account)
 * and opens the Google selector directly for pacosoriaprofe@iesdiegotorrente.es
 */
export const switchAccountToOfficialTeacher = async (): Promise<{
  user: User;
  profile: UserProfile;
  accessToken: string;
} | null> => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (e) {
    console.warn('Sign out before switch error:', e);
  }
  return googleSignIn(OFFICIAL_TEACHER_EMAIL);
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ========================
// USER PROFILE MANAGEMENT
// ========================

export async function getUserProfile(uid: string, fallbackUser?: User): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    if (fallbackUser) {
      const role: UserRole = isTeacherAccount(fallbackUser.email) ? 'teacher' : 'student';
      const newProfile: UserProfile = {
        uid: fallbackUser.uid,
        email: fallbackUser.email || '',
        displayName: fallbackUser.displayName || fallbackUser.email?.split('@')[0] || 'Estudiante',
        photoURL: fallbackUser.photoURL || undefined,
        role,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), newProfile);
      return newProfile;
    }
    return null;
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export async function updateUserClass(uid: string, classId: string, className: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      classId,
      className,
      lastActive: new Date().toISOString(),
    });
    // Also update studentProgress record if exists
    await updateDoc(doc(db, 'studentProgress', uid), {
      classId,
      className,
    }).catch(() => {});
  } catch (err) {
    console.error('Error updating user class:', err);
  }
}

// ========================
// CLASS GROUPS MANAGEMENT
// ========================

const DEFAULT_CLASSES: Omit<ClassGroup, 'createdAt'>[] = [
  {
    id: '1eso-a',
    name: '1º ESO A - Digitalización y Ofimática',
    code: '1ESOA',
    description: 'Grupo A de 1º de ESO. Hojas de cálculo básicas y formato.',
    teacherEmail: 'pacosoriaprofe@iesdiegotorrente.es',
    teacherName: 'Paco Soria',
    academicYear: '2025/2026',
  },
  {
    id: '1eso-b',
    name: '1º ESO B - Digitalización y Ofimática',
    code: '1ESOB',
    description: 'Grupo B de 1º de ESO. Hojas de cálculo básicas y formato.',
    teacherEmail: 'pacosoriaprofe@iesdiegotorrente.es',
    teacherName: 'Paco Soria',
    academicYear: '2025/2026',
  },
  {
    id: '2eso-a',
    name: '2º ESO A - Computación y Robótica',
    code: '2ESOA',
    description: 'Grupo A de 2º de ESO. Fórmulas, referencias relativas y absolutas.',
    teacherEmail: 'pacosoriaprofe@iesdiegotorrente.es',
    teacherName: 'Paco Soria',
    academicYear: '2025/2026',
  },
  {
    id: '4eso-tic',
    name: '4º ESO - TIC y Digitalización',
    code: '4ESOTIC',
    description: '4º de ESO. VLOOKUP, Tablas dinámicas y análisis de datos.',
    teacherEmail: 'pacosoriaprofe@iesdiegotorrente.es',
    teacherName: 'Paco Soria',
    academicYear: '2025/2026',
  },
  {
    id: '1bach-tic',
    name: '1º Bachillerato - Tecnologías de la Información',
    code: '1BACHTIC',
    description: '1º de Bachillerato. Fórmulas avanzadas, macros y Google Apps Script.',
    teacherEmail: 'pacosoriaprofe@iesdiegotorrente.es',
    teacherName: 'Paco Soria',
    academicYear: '2025/2026',
  },
];

export async function fetchClasses(): Promise<ClassGroup[]> {
  try {
    const snap = await getDocs(collection(db, 'classes'));
    if (snap.empty) {
      // Seed default classes
      const seeded: ClassGroup[] = [];
      for (const item of DEFAULT_CLASSES) {
        const fullClass: ClassGroup = {
          ...item,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'classes', item.id), fullClass);
        seeded.push(fullClass);
      }
      return seeded;
    }
    return snap.docs.map((d) => d.data() as ClassGroup);
  } catch (err) {
    console.error('Error fetching classes:', err);
    // Return fallback defaults if offline or permission issues
    return DEFAULT_CLASSES.map((c) => ({
      ...c,
      createdAt: new Date().toISOString(),
    }));
  }
}

export async function createClassGroup(classData: Omit<ClassGroup, 'createdAt'>): Promise<ClassGroup> {
  const newClass: ClassGroup = {
    ...classData,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'classes', newClass.id), newClass);
  return newClass;
}

export async function deleteClassGroup(classId: string): Promise<void> {
  await deleteDoc(doc(db, 'classes', classId));
}

// ========================
// STUDENT PROGRESS SYNC
// ========================

export async function saveStudentProgressToCloud(
  userId: string,
  progress: StudentProgress,
  classId: string,
  className: string,
  userEmail: string,
  userName: string,
  photoURL?: string
): Promise<void> {
  try {
    const quizValues = Object.values(progress.quizScores);
    const avgScore =
      quizValues.length > 0
        ? quizValues.reduce((acc, q) => acc + (q.score / (q.total || 1)) * 10, 0) / quizValues.length
        : 0;

    const record: StudentRecord = {
      userId,
      userEmail,
      userName,
      photoURL,
      classId: classId || 'sin-clase',
      className: className || 'Sin clase asignada',
      completedChapters: progress.completedChapters,
      completedExercises: progress.completedExercises,
      quizScores: progress.quizScores,
      unlockedBadges: progress.unlockedBadges,
      studyTimeMinutes: progress.studyTimeMinutes,
      lastActiveDate: new Date().toISOString(),
      averageGrade: parseFloat(avgScore.toFixed(1)),
      totalScore: Object.keys(progress.completedExercises).length * 10 + Math.round(avgScore * 10),
    };

    await setDoc(doc(db, 'studentProgress', userId), record, { merge: true });
  } catch (err) {
    console.error('Error saving student progress to cloud:', err);
  }
}

export async function loadStudentProgressFromCloud(userId: string): Promise<StudentRecord | null> {
  try {
    const docSnap = await getDoc(doc(db, 'studentProgress', userId));
    if (docSnap.exists()) {
      return docSnap.data() as StudentRecord;
    }
    return null;
  } catch (err) {
    console.error('Error loading student progress:', err);
    return null;
  }
}

export async function fetchAllStudentsProgress(): Promise<StudentRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'studentProgress'));
    return snap.docs.map((d) => d.data() as StudentRecord);
  } catch (err) {
    console.error('Error fetching all students progress:', err);
    return [];
  }
}
