import { ClassroomCourse, StudentRecord } from '../types';

export async function fetchClassroomCourses(accessToken: string): Promise<ClassroomCourse[]> {
  try {
    const res = await fetch(
      'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status} al obtener cursos de Classroom`);
    }

    const data = await res.json();
    return (data.courses || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      section: c.section,
      descriptionHeading: c.descriptionHeading,
      courseState: c.courseState,
      alternateLink: c.alternateLink,
    }));
  } catch (error) {
    console.error('Error fetching Classroom courses:', error);
    throw error;
  }
}

export async function createClassroomCourseWork(
  accessToken: string,
  courseId: string,
  title: string,
  description: string,
  maxPoints: number = 10
): Promise<{ id: string; alternateLink?: string; title: string }> {
  try {
    const appUrl = window.location.origin;
    const fullDescription = `${description}\n\n📱 Acceso a la app de aprendizaje: ${appUrl}\nIES Diego Torrente Ballester - Departamento de Tecnología e Informática`;

    const res = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: fullDescription,
          maxPoints,
          workType: 'ASSIGNMENT',
          state: 'PUBLISHED',
          materials: [
            {
              link: {
                url: appUrl,
                title: 'Google Sheets - Guía Interactiva IES Diego Torrente',
              },
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status} al crear tarea en Classroom`);
    }

    const data = await res.json();
    return {
      id: data.id,
      alternateLink: data.alternateLink,
      title: data.title,
    };
  } catch (error) {
    console.error('Error creating Classroom coursework:', error);
    throw error;
  }
}

export function downloadClassroomGradebookCSV(
  students: StudentRecord[],
  className: string = 'Todas las Clases'
) {
  const headers = [
    'Nombre del Alumno',
    'Email Educativo (@iesdiegotorrente.es)',
    'Clase / Grupo',
    'Capítulos Leídos (de 9)',
    'Ejercicios Prácticos Resueltos (de 8)',
    'Media de Tests (Escala 0-10)',
    'Nota Final Evaluación (Escala 0-10)',
    'Insignias Ganadas',
    'Minutos de Estudio',
    'Última Actividad',
  ];

  const rows = students.map((s) => {
    return [
      `"${s.userName.replace(/"/g, '""')}"`,
      `"${s.userEmail}"`,
      `"${s.className || 'Sin asignar'}"`,
      `${s.completedChapters.length}`,
      `${Object.keys(s.completedExercises).length}`,
      `${s.averageGrade.toFixed(1)}`,
      `${s.averageGrade.toFixed(1)}`,
      `${s.unlockedBadges.length}`,
      `${s.studyTimeMinutes || 0}`,
      `"${new Date(s.lastActiveDate).toLocaleDateString('es-ES')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = className.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  link.setAttribute(
    'download',
    `calificaciones_classroom_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
