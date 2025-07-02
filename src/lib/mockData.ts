// Datos simulados para el desarrollo de la aplicación - LIMPIOS PARA EMPEZAR DESDE CERO
import { Student, Grade, Subject, Evaluation, Course, Enrollment, EvaluationSystem, SubjectEvaluation, EvaluationTest, TestScore } from '@/types/auth'

// Arrays vacíos para empezar con una base de datos limpia
export const mockStudents: Student[] = []

export const mockSubjects: Subject[] = []

export const mockCourses: Course[] = []

export const mockEnrollments: Enrollment[] = []

export const mockEvaluationSystems: EvaluationSystem[] = []

export const mockTestScores: TestScore[] = []

export const mockGrades: Grade[] = []

export const mockEvaluations: Evaluation[] = []

// Funciones auxiliares para obtener datos (ahora retornan arrays vacíos)
export const getStudentsByCourse = (course: string): Student[] => {
  return mockStudents.filter(student => student.course === course)
}

export const getGradesByStudent = (studentId: number): Grade[] => {
  return mockGrades.filter(grade => grade.studentId === studentId)
}

export const getGradesBySubject = (subject: string): Grade[] => {
  return mockGrades.filter(grade => grade.subject === subject)
}

export const getSubjectsByCourse = (course: string): Subject[] => {
  return mockSubjects.filter(subject => subject.course === course)
}

export const getActiveEvaluations = (): Evaluation[] => {
  return mockEvaluations.filter(evaluation => evaluation.isActive)
}

// Estadísticas (adaptadas para arrays vacíos)
export const getStudentStats = () => {
  const totalStudents = mockStudents.length
  const activeStudents = mockStudents.filter(s => s.isActive).length
  const courseDistribution = mockStudents.reduce((acc, student) => {
    acc[student.course] = (acc[student.course] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalStudents,
    activeStudents,
    courseDistribution
  }
}

export const getGradeStats = () => {
  const totalGrades = mockGrades.length
  const averageGrade = totalGrades > 0 ? mockGrades.reduce((sum, grade) => sum + grade.grade, 0) / totalGrades : 0
  const passedGrades = mockGrades.filter(grade => grade.grade >= 5).length
  const failedGrades = totalGrades - passedGrades
  const passRate = totalGrades > 0 ? (passedGrades / totalGrades) * 100 : 0

  return {
    totalGrades,
    averageGrade: Math.round(averageGrade * 100) / 100,
    passedGrades,
    failedGrades,
    passRate: Math.round(passRate * 100) / 100
  }
}