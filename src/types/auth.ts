// Tipos para la aplicación de gestión académica multiusuario

// === TIPOS DE USUARIO E AUTENTICACIÓN ===
export interface User {
  id: number
  username: string
  email: string
  password: string // Hash da contrasinal
  firstName: string
  lastName: string
  institution?: string
  department?: string
  specialization?: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLogin?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export type UserRole = 'professor' | 'admin' | 'coordinator'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'es' | 'gl' | 'ca' | 'eu'
  defaultAcademicYear?: string
  dashboardLayout?: string[]
  notifications: {
    email: boolean
    inApp: boolean
    gradeReminders: boolean
    reportGeneration: boolean
  }
}

export interface AuthSession {
  userId: number
  token: string
  expiresAt: string
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  institution?: string
  department?: string
}

// === TIPOS DE DATOS ACADÉMICOS (con soporte multiusuario) ===
export interface Student {
  id: number
  userId: number // ID del profesor propietario
  name: string
  surname: string
  email: string
  phone?: string
  course: string
  enrollmentDate: string
  academicYear?: string
  birthDate?: string
  address?: string
  emergencyContact?: string
  photo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Grade {
  id: number
  userId: number // ID del profesor propietario
  studentId: number
  studentName: string
  subject: string
  evaluation: Evaluation
  grade: number
  maxGrade: number
  date: string
  comments?: string
  teacherId?: number
  isRetake?: boolean
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: number
  userId: number // ID del profesor propietario
  name: string
  code: string
  course: string
  credits: number
  color?: string
  description?: string
  teacherId?: number
  isActive: boolean
  evaluationSystem?: EvaluationSystem
  numberOfEvaluations: 1 | 2 | 3 // Número de evaluaciones para esta materia (requerido)
}

// === TIPOS DE CURSOS DEL CENTRO (NIVEL ADMINISTRATIVO) ===
export interface CenterCourse {
  id: number
  name: string
  code: string
  level: 'Primaria' | 'ESO' | 'Bachillerato' | 'BUP' | 'Universidad' | 'FP Básica' | 'FP Medio' | 'FP Superior' | 'Máster' | 'Doctorado' | 'Formación Continua' | 'Otros'
  family: string // Familia profesional
  duration: number // En horas
  modalidad: 'Presencial' | 'Semipresencial' | 'Online'
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// === TIPOS DE CURSOS POR PROFESOR ===
export interface TeacherCourseAssignment {
  id: number
  userId: number // ID del profesor
  centerCourseId: number // Referencia al curso del centro
  academicYear: string
  startDate: string
  endDate: string
  customName?: string // Nombre personalizado por el profesor
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  userId: number // ID del profesor propietario
  name: string
  code: string
  academicYear: string
  startDate: string
  endDate: string
  description?: string
  students: number[]
  subjects?: string[]
  isActive: boolean
  centerCourseId?: number // Referencia opcional al curso del centro
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: number
  userId: number // ID del profesor propietario
  studentId: number
  subjectId: number
  academicYear: string
  enrollmentDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EvaluationSystem {
  id: number
  userId: number // ID del profesor propietario
  subjectId: number
  evaluations: SubjectEvaluation[]
  createdAt: string
  updatedAt: string
  numberOfEvaluations?: number // Número de evaluaciones configuradas
}

export interface SubjectEvaluation {
  id: number
  name: string
  weight: number // Peso en % (debe sumar 100% entre todas)
  startDate: string
  endDate: string
  tests: EvaluationTest[]
  isActive: boolean
  description?: string // Descripción opcional de la evaluación
  evaluationSystemId?: number // ID del sistema de evaluación al que pertenece
  order?: number // Orden de la evaluación
}

export interface EvaluationTest {
  id: number
  name: string
  description?: string
  type?: string // Tipo de prueba (examen, trabajo, práctica, etc.)
  weight: number // Peso dentro de esta evaluación
  maxGrade: number
  maxScore?: number // Alias para compatibilidad con otros componentes
  minPassingGrade: number
  isActive: boolean
  subjectEvaluationId?: number // ID de la evaluación a la que pertenece
}

export interface TestScore {
  id: number
  userId: number // ID del profesor propietario
  studentId: number
  testId: number
  evaluationId: number
  score: number
  maxScore: number
  date: string
  comments?: string
  createdAt: string
  updatedAt: string
}

export interface Evaluation {
  id: number
  name: string
  type: 'Primera' | 'Segunda' | 'Tercera' | 'Final' | 'Extraordinaria'
  startDate: string
  endDate: string
  isActive: boolean
  academicYear: string
}

// === TIPOS DE INFORMES E ESTATÍSTICAS ===
export interface StudentReport {
  student: Student
  grades: Grade[]
  averageGrade: number
  subjectCount: number
  passedSubjects: number
  failedSubjects: number
  academicYear: string
}

export interface SubjectReport {
  subject: Subject
  grades: Grade[]
  studentsCount: number
  averageGrade: number
  passRate: number
  failRate: number
  gradeDistribution: Record<string, number>
}

export interface AcademicYearStats {
  academicYear: string
  totalStudents: number
  activeStudents: number
  totalSubjects: number
  totalGrades: number
  averageGrade: number
  passRate: number
  courseDistribution: Record<string, number>
}

export type ReportType = 
  | 'student-grades'
  | 'subject-summary'
  | 'course-statistics'
  | 'academic-year-overview'
  | 'evaluation-analysis'

export interface ReportConfig {
  type: ReportType
  academicYear?: string
  courseFilter?: string
  subjectFilter?: string
  evaluationFilter?: string
  dateRange?: {
    start: string
    end: string
  }
  includeInactive?: boolean
  format: 'pdf' | 'excel' | 'csv'
}

// === TIPOS DE BACKUPS E MIGRACIÓN ===
export interface BackupData {
  metadata: {
    version: string
    createdAt: string
    academicYear: string
    userId: number
    userName: string
    dataTypes: string[]
  }
  data: {
    students: Student[]
    subjects: Subject[]
    courses: Course[]
    enrollments: Enrollment[]
    evaluationSystems: EvaluationSystem[]
    testScores: TestScore[]
    grades: Grade[]
    evaluations: Evaluation[]
  }
}

export interface MigrationOptions {
  students: boolean
  courses: boolean
  subjects: boolean
  evaluations: boolean
}

// === TIPOS DE CONTEXTO DA APLICAÇÃO ===
export interface AppContext {
  user: User | null
  isAuthenticated: boolean
  currentAcademicYear: string
  availableAcademicYears: string[]
  permissions: UserPermissions
}

export interface UserPermissions {
  canCreateStudents: boolean
  canEditStudents: boolean
  canDeleteStudents: boolean
  canCreateCourses: boolean
  canEditCourses: boolean
  canDeleteCourses: boolean
  canCreateSubjects: boolean
  canEditSubjects: boolean
  canDeleteSubjects: boolean
  canManageGrades: boolean
  canGenerateReports: boolean
  canManageBackups: boolean
  canMigrateDates: boolean
  canManageUsers?: boolean // Só para admins
}
