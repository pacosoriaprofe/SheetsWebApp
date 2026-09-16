import { StudentProgress } from '../types';

const STORAGE_KEY = 'google_sheets_guide_progress_v1';

export const INITIAL_PROGRESS: StudentProgress = {
  studentName: 'Estudiante',
  studentEmail: 'alumno@ejemplo.com',
  completedChapters: [1], // Starts with Chapter 1 started
  completedExercises: {},
  quizScores: {},
  unlockedBadges: [],
  notes: {},
  studyTimeMinutes: 25,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakDays: 1,
  instructorFeedback: {
    notes: '¡Excelente inicio! Te recomendamos practicar con las referencias absolutas ($B$1) en el Capítulo 2 y probar las Tablas Dinámicas en el Capítulo 6.',
    recommendedChapters: [2, 6],
    updatedAt: new Date().toISOString(),
  },
  googleSheetSync: {
    webhookUrl: '',
    sheetName: 'Seguimiento_Alumnos',
    lastSyncedAt: null,
    status: 'idle',
  },
};

export function loadProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_PROGRESS, ...parsed };
  } catch (e) {
    console.error('Error loading progress from localStorage', e);
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage', e);
  }
}

export function generateCSVReport(progress: StudentProgress): string {
  const headers = [
    'Estudiante',
    'Email',
    'Fecha_Actualizacion',
    'Capitulos_Completados',
    'Ejercicios_Resueltos',
    'Promedio_Quizzes_Pct',
    'Insignias_Ganadas',
    'Minutos_Estudio',
    'Racha_Dias',
    'Feedback_Instructor',
  ];

  const quizScoresArr = Object.values(progress.quizScores);
  const avgQuiz = quizScoresArr.length > 0
    ? Math.round(quizScoresArr.reduce((acc, q) => acc + q.percentage, 0) / quizScoresArr.length)
    : 0;

  const row = [
    `"${progress.studentName.replace(/"/g, '""')}"`,
    `"${progress.studentEmail.replace(/"/g, '""')}"`,
    `"${new Date().toISOString()}"`,
    progress.completedChapters.length,
    Object.keys(progress.completedExercises).length,
    `${avgQuiz}%`,
    progress.unlockedBadges.length,
    progress.studyTimeMinutes,
    progress.streakDays,
    `"${(progress.instructorFeedback.notes || '').replace(/"/g, '""')}"`,
  ];

  return `${headers.join(',')}\n${row.join(',')}`;
}

export async function syncToGoogleSheetWebhook(
  webhookUrl: string,
  progress: StudentProgress
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'URL de Webhook de Google Sheets inválida o no configurada.' };
  }

  const payload = {
    timestamp: new Date().toISOString(),
    studentName: progress.studentName,
    studentEmail: progress.studentEmail,
    completedChaptersCount: progress.completedChapters.length,
    completedChaptersList: progress.completedChapters.join(','),
    completedExercisesCount: Object.keys(progress.completedExercises).length,
    exerciseDetails: progress.completedExercises,
    quizScores: progress.quizScores,
    unlockedBadges: progress.unlockedBadges,
    studyTimeMinutes: progress.studyTimeMinutes,
    streakDays: progress.streakDays,
    instructorNotes: progress.instructorFeedback.notes,
  };

  try {
    // Mode 'no-cors' is essential when invoking Google Apps Script webhooks from web browsers
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: '¡Datos sincronizados exitosamente con Google Sheets!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido de red';
    return {
      success: false,
      message: `Error al enviar a Google Sheets: ${errorMsg}`,
    };
  }
}

export const APPS_SCRIPT_TEMPLATE = `// Código para Google Apps Script (Herramientas > Extensiones > Apps Script en tu Google Sheet)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Si la hoja está vacía, añade encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", "Estudiante", "Email", "Capítulos", 
        "Ejercicios", "Insignias", "Minutos Estudio", "Racha (Días)"
      ]);
    }
    
    sheet.appendRow([
      new Date(),
      data.studentName,
      data.studentEmail,
      data.completedChaptersCount + "/9",
      data.completedExercisesCount + "/8",
      data.unlockedBadges.length,
      data.studyTimeMinutes,
      data.streakDays
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
