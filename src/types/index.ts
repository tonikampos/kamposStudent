// Tipos para la aplicación de gestión académica

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

// === TIPOS DE DATOS ACADÉMICOS (modificados para soporte multiusuario) ===

export interface Student {
  id: number
  name: string
  surname: string
  email: string
  phone?: string
  course: string
  enrollmentDate: string
  academicYear?: string // Campo opcional para el año académico
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
  name: string
  code: string
  course: string
  credits: number
  color?: string
  description?: string
  teacherId?: number
  isActive: boolean
  evaluationSystem?: EvaluationSystem
}

export interface EvaluationSystem {
  id: number
  subjectId: number
  numberOfEvaluations: 1 | 2 | 3
  evaluations: SubjectEvaluation[]
  createdAt: string
  updatedAt: string
}

export interface SubjectEvaluation {
  id: number
  evaluationSystemId: number
  name: string
  description?: string
  startDate: string
  endDate: string
  weight: number // Peso en la nota final de la asignatura (0-100)
  order: number // 1, 2, 3
  tests: EvaluationTest[]
  isActive: boolean
}

export interface EvaluationTest {
  id: number
  subjectEvaluationId: number
  name: string
  description?: string
  type: 'exam' | 'project' | 'homework' | 'presentation' | 'practice' | 'other'
  date?: string
  weight: number // Peso en la nota de la evaluación (0-100)
  maxScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TestScore {
  id: number
  testId: number
  studentId: number
  score: number
  maxScore: number
  comments?: string
  gradedAt: string
  gradedBy: number
}

// Mantenemos la interfaz Evaluation original para compatibilidad
export interface Evaluation {
  id: number
  name: string
  description?: string
  period?: string
  startDate: string
  endDate: string
  weight: number // Peso en la nota final (0-1)
  isActive: boolean
}

export interface Course {
  id: number
  name: string
  code: string
  academicYear: string
  startDate: string
  endDate: string
  subjects: Subject[]
  students: Student[]
  isActive: boolean
}

export interface Teacher {
  id: number
  name: string
  surname: string
  email: string
  subjects: Subject[]
  courses: Course[]
  isActive: boolean
}

export interface Attendance {
  id: number
  studentId: number
  subjectId: number
  date: string
  present: boolean
  late?: boolean
  justified?: boolean
  comments?: string
}

export interface Report {
  id: string
  name: string
  type: ReportType
  description: string
  template: string
  filters: ReportFilters
  lastGenerated?: string
  createdBy: number
}

export interface ReportFilters {
  course?: string
  subject?: string
  evaluation?: string
  dateRange?: {
    start: string
    end: string
  }
  studentIds?: number[]
}

export type ReportType = 
  | 'student-list'
  | 'grade-report' 
  | 'attendance-report'
  | 'statistics-report'
  | 'evaluation-summary'
  | 'custom'

export interface Statistics {
  totalStudents: number
  totalGrades: number
  averageGrade: number
  passRate: number
  subjectStats: SubjectStats[]
  gradeDistribution: GradeDistribution[]
  monthlyProgress: MonthlyProgress[]
  attendanceRate?: number
}

export interface SubjectStats {
  subject: string
  average: number
  total: number
  passCount: number
  failCount: number
  highestGrade: number
  lowestGrade: number
}

export interface GradeDistribution {
  range: string
  count: number
  percentage: number
}

export interface MonthlyProgress {
  month: string
  average: number
  totalGrades: number
  passRate: number
}

// Tipos para formularios
export interface StudentFormData {
  name: string
  surname: string
  email: string
  phone?: string
  course: string
  enrollmentDate: string
  birthDate?: string
  address?: string
  emergencyContact?: string
}

export interface GradeFormData {
  studentId: number
  subject: string
  evaluation: string
  grade: number
  comments?: string
  date: string
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Tipos para autenticación
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

// === TIPOS DE DATOS ACADÉMICOS (modificados para soporte multiusuario) ===
export interface Student {
  id: number
  name: string
  surname: string
  email: string
  phone?: string
  course: string
  enrollmentDate: string
  academicYear?: string // Campo opcional para el año académico
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
  name: string
  code: string
  course: string
  credits: number
  color?: string
  description?: string
  teacherId?: number
  isActive: boolean
  evaluationSystem?: EvaluationSystem
}

export interface EvaluationSystem {
  id: number
  subjectId: number
  numberOfEvaluations: 1 | 2 | 3
  evaluations: SubjectEvaluation[]
  createdAt: string
  updatedAt: string
}

export interface SubjectEvaluation {
  id: number
  evaluationSystemId: number
  name: string
  description?: string
  startDate: string
  endDate: string
  weight: number // Peso en la nota final de la asignatura (0-100)
  order: number // 1, 2, 3
  tests: EvaluationTest[]
  isActive: boolean
}

export interface EvaluationTest {
  id: number
  subjectEvaluationId: number
  name: string
  description?: string
  type: 'exam' | 'project' | 'homework' | 'presentation' | 'practice' | 'other'
  date?: string
  weight: number // Peso en la nota de la evaluación (0-100)
  maxScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TestScore {
  id: number
  testId: number
  studentId: number
  score: number
  maxScore: number
  comments?: string
  gradedAt: string
  gradedBy: number
}

// Mantenemos la interfaz Evaluation original para compatibilidad
export interface Evaluation {
  id: number
  name: string
  description?: string
  period?: string
  startDate: string
  endDate: string
  weight: number // Peso en la nota final (0-1)
  isActive: boolean
}

export interface Course {
  id: number
  name: string
  code: string
  academicYear: string
  startDate: string
  endDate: string
  subjects: Subject[]
  students: Student[]
  isActive: boolean
}

export interface Teacher {
  id: number
  name: string
  surname: string
  email: string
  subjects: Subject[]
  courses: Course[]
  isActive: boolean
}

export interface Attendance {
  id: number
  studentId: number
  subjectId: number
  date: string
  present: boolean
  late?: boolean
  justified?: boolean
  comments?: string
}

export interface Report {
  id: string
  name: string
  type: ReportType
  description: string
  template: string
  filters: ReportFilters
  lastGenerated?: string
  createdBy: number
}

export interface ReportFilters {
  course?: string
  subject?: string
  evaluation?: string
  dateRange?: {
    start: string
    end: string
  }
  studentIds?: number[]
}

export type ReportType = 
  | 'student-list'
  | 'grade-report' 
  | 'attendance-report'
  | 'statistics-report'
  | 'evaluation-summary'
  | 'custom'

export interface Statistics {
  totalStudents: number
  totalGrades: number
  averageGrade: number
  passRate: number
  subjectStats: SubjectStats[]
  gradeDistribution: GradeDistribution[]
  monthlyProgress: MonthlyProgress[]
  attendanceRate?: number
}

export interface SubjectStats {
  subject: string
  average: number
  total: number
  passCount: number
  failCount: number
  highestGrade: number
  lowestGrade: number
}

export interface GradeDistribution {
  range: string
  count: number
  percentage: number
}

export interface MonthlyProgress {
  month: string
  average: number
  totalGrades: number
  passRate: number
}

// Tipos para formularios
export interface StudentFormData {
  name: string
  surname: string
  email: string
  phone?: string
  course: string
  enrollmentDate: string
  birthDate?: string
  address?: string
  emergencyContact?: string
}

export interface GradeFormData {
  studentId: number
  subject: string
  evaluation: string
  grade: number
  comments?: string
  date: string
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}
