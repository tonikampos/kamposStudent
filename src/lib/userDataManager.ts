// Utilidades para gestionar los datos por usuario
import { 
  Student, 
  Subject, 
  Course, 
  Enrollment, 
  EvaluationSystem, 
  TestScore, 
  BackupData,
  CenterCourse,
  TeacherCourseAssignment
} from '@/types/auth'
import { getCurrentUser } from './authManager'

// Función auxiliar para obtener el prefijo del usuario actual
const getUserStoragePrefix = (): string => {
  const user = getCurrentUser()
  if (!user) return 'guest_' // Usuario temporal para pruebas
  return `user_${user.id}_`
}

// Claves para localStorage con prefijo de usuario
const getStorageKeys = () => {
  const prefix = getUserStoragePrefix()
  return {
    students: `${prefix}gestion_students`,
    subjects: `${prefix}gestion_subjects`,
    courses: `${prefix}gestion_courses`,
    enrollments: `${prefix}gestion_enrollments`,
    evaluationSystems: `${prefix}gestion_evaluation_systems`,
    testScores: `${prefix}gestion_test_scores`,
    teacherCourseAssignments: `${prefix}gestion_teacher_course_assignments`,
    currentAcademicYear: `${prefix}gestion_current_academic_year`,
    initialized: `${prefix}gestion_initialized`
  }
}

// Claves para datos del centro (globales, sin prefijo de usuario)
const getCenterStorageKeys = () => {
  return {
    centerCourses: 'gestion_center_courses',
    centerInitialized: 'gestion_center_initialized'
  }
}

// Función auxiliar para parsear JSON de forma segura
const safeJsonParse = <T>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Error parsing JSON from localStorage:', error)
    return fallback
  }
}

// Inicializar datos por primera vez para el usuario actual
export const initializeUserData = () => {
  if (typeof window === 'undefined') return

  const keys = getStorageKeys()
  const isInitialized = localStorage.getItem(keys.initialized)
  
  if (!isInitialized) {
    localStorage.setItem(keys.students, JSON.stringify([]))
    localStorage.setItem(keys.subjects, JSON.stringify([]))
    localStorage.setItem(keys.courses, JSON.stringify([]))
    localStorage.setItem(keys.enrollments, JSON.stringify([]))
    localStorage.setItem(keys.evaluationSystems, JSON.stringify([]))
    localStorage.setItem(keys.testScores, JSON.stringify([]))
    localStorage.setItem(keys.teacherCourseAssignments, JSON.stringify([]))
    localStorage.setItem(keys.currentAcademicYear, new Date().getFullYear() + '/' + (new Date().getFullYear() + 1))
    localStorage.setItem(keys.initialized, 'true')
  }
}

// Inicializar datos del centro (solo se hace una vez globalmente)
export const initializeCenterData = () => {
  if (typeof window === 'undefined') return

  const centerKeys = getCenterStorageKeys()
  const isInitialized = localStorage.getItem(centerKeys.centerInitialized)
  
  if (!isInitialized) {
    // Datos de ejemplo de cursos del centro
    const sampleCenterCourses: CenterCourse[] = [
      {
        id: 1,
        name: 'Administración de Sistemas Informáticos en Red',
        code: 'ASIR',
        level: 'FP Superior',
        family: 'Informática y Comunicaciones',
        duration: 2000,
        modalidad: 'Presencial',
        description: 'Ciclo formativo de grado superior en administración de sistemas informáticos',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Desarrollo de Aplicaciones Web',
        code: 'DAW',
        level: 'FP Superior',
        family: 'Informática y Comunicaciones',
        duration: 2000,
        modalidad: 'Presencial',
        description: 'Ciclo formativo de grado superior en desarrollo de aplicaciones web',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Sistemas Microinformáticos y Redes',
        code: 'SMR',
        level: 'FP Medio',
        family: 'Informática y Comunicaciones',
        duration: 1300,
        modalidad: 'Presencial',
        description: 'Ciclo formativo de grado medio en sistemas microinformáticos y redes',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Bachillerato Científico-Tecnológico',
        code: 'BCT',
        level: 'Bachillerato',
        family: 'Ciencias y Tecnología',
        duration: 1400,
        modalidad: 'Presencial',
        description: 'Bachillerato modalidad Ciencias y Tecnología',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        name: 'ESO',
        code: 'ESO',
        level: 'ESO',
        family: 'Educación Secundaria',
        duration: 1000,
        modalidad: 'Presencial',
        description: 'Educación Secundaria Obligatoria',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    localStorage.setItem(centerKeys.centerCourses, JSON.stringify(sampleCenterCourses))
    localStorage.setItem(centerKeys.centerInitialized, 'true')
  }
}

// === FUNCIONES DE ESTUDIANTES ===
export const getStudents = (): Student[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.students)
  const allStudents: Student[] = safeJsonParse(data, [])
  
  // Filtrar solo los estudiantes del usuario actual
  return allStudents.filter(student => student.userId === currentUser.id)
}

export const saveStudents = (students: Student[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todos los estudiantes pertenecen al usuario actual
  const userStudents = students.map(student => ({
    ...student,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.students, JSON.stringify(userStudents))
  window.dispatchEvent(new CustomEvent('studentsUpdated'))
}

export const addStudent = (student: Omit<Student, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Student => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  const students = getStudents()
  const now = new Date().toISOString()
  
  const newStudent: Student = {
    ...student,
    id: Math.max(...students.map(s => s.id), 0) + 1,
    userId: currentUser.id,
    createdAt: now,
    updatedAt: now
  }
  
  const updatedStudents = [...students, newStudent]
  saveStudents(updatedStudents)
  return newStudent
}

export const updateStudent = (id: number, updates: Partial<Student>): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const students = getStudents()
  const updatedStudents = students.map(student =>
    student.id === id && student.userId === currentUser.id
      ? { ...student, ...updates, updatedAt: new Date().toISOString() }
      : student
  )
  
  saveStudents(updatedStudents)
  return true
}

// Función para verificar si un estudiante puede ser eliminado
export const canDeleteStudent = (studentId: number): { canDelete: boolean, reason?: string } => {
  const currentUser = getCurrentUser()
  if (!currentUser) return { canDelete: false, reason: 'Usuario non autenticado' }
  
  // Verificar si el estudiante tiene puntuaciones de pruebas asignadas
  const testScores = getTestScores()
  const studentTestScores = testScores.filter(score => score.studentId === studentId)
  
  if (studentTestScores.length > 0) {
    return { 
      canDelete: false, 
      reason: `O estudante ten ${studentTestScores.length} puntuación(s) de proba(s) rexistrada(s). Elimina primeiro as puntuacións antes de eliminar o estudante.`
    }
  }
  
  // Verificar si el estudiante tiene matrículas activas
  const enrollments = getEnrollments()
  const studentEnrollments = enrollments.filter(enrollment => 
    enrollment.studentId === studentId && enrollment.isActive
  )
  
  if (studentEnrollments.length > 0) {
    return { 
      canDelete: false, 
      reason: `O estudante ten ${studentEnrollments.length} matrícula(s) activa(s). Desactiva primeiro as matrículas antes de eliminar o estudante.`
    }
  }
  
  return { canDelete: true }
}

export const deleteStudent = (id: number): { success: boolean, message?: string } => {
  const currentUser = getCurrentUser()
  if (!currentUser) return { success: false, message: 'Usuario non autenticado' }
  
  // Verificar si el estudiante puede ser eliminado
  const validation = canDeleteStudent(id)
  if (!validation.canDelete) {
    return { success: false, message: validation.reason }
  }
  
  const students = getStudents()
  const filteredStudents = students.filter(student => 
    !(student.id === id && student.userId === currentUser.id)
  )
  
  saveStudents(filteredStudents)
  return { success: true, message: 'Estudante eliminado correctamente' }
}

// === FUNCIONES DE MATERIAS ===
// Función de migración para asegurar que todas las materias tengan numberOfEvaluations
const migrateSubjectsToIncludeEvaluations = (subjects: any[]): Subject[] => {
  return subjects.map(subject => ({
    ...subject,
    numberOfEvaluations: subject.numberOfEvaluations || 3 // Valor por defecto: 3 evaluaciones
  }))
}

export const getSubjects = (): Subject[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) {
    console.log('[getSubjects] No hay usuario actual')
    return []
  }
  
  console.log('[getSubjects] Usuario actual:', currentUser.id, currentUser.username)
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.subjects)
  const rawSubjects: Subject[] = safeJsonParse(data, [])
  
  console.log('[getSubjects] Materias en localStorage:', rawSubjects.length, rawSubjects.map(s => ({ 
    id: s.id, 
    name: s.name, 
    code: s.code,
    userId: s.userId 
  })))
  
  // Aplicar migración si es necesario
  const migratedSubjects = migrateSubjectsToIncludeEvaluations(rawSubjects)
  
  // Si hubo cambios en la migración, guardar los datos actualizados
  if (JSON.stringify(rawSubjects) !== JSON.stringify(migratedSubjects)) {
    saveSubjects(migratedSubjects)
  }
  
  // Filtrar solo las materias del usuario actual
  const filteredSubjects = migratedSubjects.filter(subject => subject.userId === currentUser.id)
  console.log('[getSubjects] Materias filtradas para usuario', currentUser.id, ':', filteredSubjects.length, filteredSubjects.map(s => ({ 
    id: s.id, 
    name: s.name, 
    code: s.code,
    userId: s.userId 
  })))
  
  return filteredSubjects
}

export const saveSubjects = (subjects: Subject[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // NO cambiar userId de materias existentes, solo guardar las que ya pertenecen al usuario
  // Esta función solo debería ser llamada con materias que ya pertenecen al usuario actual
  const keys = getStorageKeys()
  localStorage.setItem(keys.subjects, JSON.stringify(subjects))
  window.dispatchEvent(new CustomEvent('subjectsUpdated'))
}

export const addSubject = (subject: Omit<Subject, 'id' | 'userId'>): Subject => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  // Obtener TODAS las materias para calcular ID único
  const keys = getStorageKeys()
  const allSubjectsData = localStorage.getItem(keys.subjects)
  const allSubjects: Subject[] = safeJsonParse(allSubjectsData, [])
  
  // Obtener solo las materias del usuario actual para la lista
  const userSubjects = getSubjects()
  
  const newSubject: Subject = {
    ...subject,
    id: Math.max(...allSubjects.map(s => s.id), 0) + 1, // ID basado en TODAS las materias
    userId: currentUser.id
  }
  
  // Agregar la nueva materia a todas las materias
  const updatedAllSubjects = [...allSubjects, newSubject]
  
  // Guardar TODAS las materias (no solo las del usuario)
  localStorage.setItem(keys.subjects, JSON.stringify(updatedAllSubjects))
  window.dispatchEvent(new CustomEvent('subjectsUpdated'))
  
  return newSubject
}

export const updateSubject = (id: number, updates: Partial<Subject>): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const subjects = getSubjects()
  const updatedSubjects = subjects.map(subject =>
    subject.id === id && subject.userId === currentUser.id
      ? { ...subject, ...updates }
      : subject
  )
  
  saveSubjects(updatedSubjects)
  return true
}

export const deleteSubject = (id: number): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const subjects = getSubjects()
  const filteredSubjects = subjects.filter(subject => 
    !(subject.id === id && subject.userId === currentUser.id)
  )
  
  saveSubjects(filteredSubjects)
  return true
}

// Función para limpiar materias con userId inconsistente
export const cleanInconsistentSubjects = (): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.subjects)
  const allSubjects: Subject[] = safeJsonParse(data, [])
  
  console.log('[cleanInconsistentSubjects] Limpiando materias para usuario:', currentUser.id)
  console.log('[cleanInconsistentSubjects] Materias antes de limpiar:', allSubjects.length, allSubjects.map(s => ({ id: s.id, name: s.name, userId: s.userId })))
  
  // Filtrar solo materias del usuario actual y eliminar as demás
  const userSubjects = allSubjects.filter(subject => subject.userId === currentUser.id)
  
  console.log('[cleanInconsistentSubjects] Materias despois de limpar:', userSubjects.length, userSubjects.map(s => ({ id: s.id, name: s.name, userId: s.userId })))
  
  // Gardar só as materias do usuario actual
  localStorage.setItem(keys.subjects, JSON.stringify(userSubjects))
}

// === FUNCIONES DE CURSOS ===
export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.courses)
  return safeJsonParse(data, [])
}

export const saveCourses = (courses: Course[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todos los cursos pertenecen al usuario actual
  const userCourses = courses.map(course => ({
    ...course,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.courses, JSON.stringify(userCourses))
  window.dispatchEvent(new CustomEvent('coursesUpdated'))
}

export const addCourse = (course: Omit<Course, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Course => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  const courses = getCourses()
  const now = new Date().toISOString()
  
  const newCourse: Course = {
    ...course,
    id: Math.max(...courses.map(c => c.id), 0) + 1,
    userId: currentUser.id,
    createdAt: now,
    updatedAt: now
  }
  
  const updatedCourses = [...courses, newCourse]
  saveCourses(updatedCourses)
  return newCourse
}

export const updateCourse = (id: number, updates: Partial<Course>): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const courses = getCourses()
  const updatedCourses = courses.map(course =>
    course.id === id && course.userId === currentUser.id
      ? { ...course, ...updates, updatedAt: new Date().toISOString() }
      : course
  )
  
  saveCourses(updatedCourses)
  return true
}

export const deleteCourse = (id: number): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const courses = getCourses()
  const filteredCourses = courses.filter(course => 
    !(course.id === id && course.userId === currentUser.id)
  )
  
  saveCourses(filteredCourses)
  return true
}

// === FUNCIONES DE CURSOS DEL CENTRO (DATOS GLOBALES) ===
export const getCenterCourses = (): CenterCourse[] => {
  if (typeof window === 'undefined') return []
  
  const centerKeys = getCenterStorageKeys()
  const data = localStorage.getItem(centerKeys.centerCourses)
  return safeJsonParse(data, [])
}

export const saveCenterCourses = (centerCourses: CenterCourse[]): void => {
  if (typeof window === 'undefined') return
  
  const centerKeys = getCenterStorageKeys()
  localStorage.setItem(centerKeys.centerCourses, JSON.stringify(centerCourses))
  window.dispatchEvent(new CustomEvent('centerCoursesUpdated'))
}

export const addCenterCourse = (course: Omit<CenterCourse, 'id' | 'createdAt' | 'updatedAt'>): CenterCourse => {
  const centerCourses = getCenterCourses()
  const now = new Date().toISOString()
  
  const newCourse: CenterCourse = {
    ...course,
    id: Math.max(...centerCourses.map(c => c.id), 0) + 1,
    createdAt: now,
    updatedAt: now
  }
  
  const updatedCourses = [...centerCourses, newCourse]
  saveCenterCourses(updatedCourses)
  return newCourse
}

export const updateCenterCourse = (id: number, updates: Partial<CenterCourse>): boolean => {
  const centerCourses = getCenterCourses()
  const updatedCourses = centerCourses.map(course =>
    course.id === id ? { ...course, ...updates, updatedAt: new Date().toISOString() } : course
  )
  
  saveCenterCourses(updatedCourses)
  return true
}

export const deleteCenterCourse = (id: number): boolean => {
  const centerCourses = getCenterCourses()
  const filteredCourses = centerCourses.filter(course => course.id !== id)
  
  saveCenterCourses(filteredCourses)
  return true
}

// === FUNCIONES DE ASIGNACIONES PROFESOR-CURSO ===
export const getTeacherCourseAssignments = (): TeacherCourseAssignment[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.teacherCourseAssignments)
  const allAssignments: TeacherCourseAssignment[] = safeJsonParse(data, [])
  
  // Filtrar solo las asignaciones del usuario actual
  return allAssignments.filter(assignment => assignment.userId === currentUser.id)
}

export const saveTeacherCourseAssignments = (assignments: TeacherCourseAssignment[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todas las asignaciones pertenecen al usuario actual
  const userAssignments = assignments.map(assignment => ({
    ...assignment,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.teacherCourseAssignments, JSON.stringify(userAssignments))
  window.dispatchEvent(new CustomEvent('teacherCourseAssignmentsUpdated'))
}

export const addTeacherCourseAssignment = (assignment: Omit<TeacherCourseAssignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TeacherCourseAssignment => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  const assignments = getTeacherCourseAssignments()
  const now = new Date().toISOString()
  
  const newAssignment: TeacherCourseAssignment = {
    ...assignment,
    id: Math.max(...assignments.map(a => a.id), 0) + 1,
    userId: currentUser.id,
    createdAt: now,
    updatedAt: now
  }
  
  const updatedAssignments = [...assignments, newAssignment]
  saveTeacherCourseAssignments(updatedAssignments)
  return newAssignment
}

export const updateTeacherCourseAssignment = (id: number, updates: Partial<TeacherCourseAssignment>): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const assignments = getTeacherCourseAssignments()
  const updatedAssignments = assignments.map(assignment =>
    assignment.id === id && assignment.userId === currentUser.id
      ? { ...assignment, ...updates, updatedAt: new Date().toISOString() }
      : assignment
  )
  
  saveTeacherCourseAssignments(updatedAssignments)
  return true
}

export const deleteTeacherCourseAssignment = (id: number): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const assignments = getTeacherCourseAssignments()
  const filteredAssignments = assignments.filter(assignment => 
    !(assignment.id === id && assignment.userId === currentUser.id)
  )
  
  saveTeacherCourseAssignments(filteredAssignments)
  return true
}

// Función auxiliar para obtener cursos del centro asignados al profesor actual
export const getAssignedCenterCourses = (): { centerCourse: CenterCourse, assignment: TeacherCourseAssignment }[] => {
  const currentUser = getCurrentUser()
  console.log('[getAssignedCenterCourses] Usuario actual:', currentUser?.id, currentUser?.username)
  
  const assignments = getTeacherCourseAssignments()
  console.log('[getAssignedCenterCourses] Asignaciones de profesor:', assignments.length, assignments)
  
  const centerCourses = getCenterCourses()
  console.log('[getAssignedCenterCourses] Cursos del centro:', centerCourses.length)
  
  const result = assignments
    .filter(a => a.isActive)
    .map(assignment => {
      const centerCourse = centerCourses.find(c => c.id === assignment.centerCourseId)
      return centerCourse ? { centerCourse, assignment } : null
    })
    .filter(Boolean) as { centerCourse: CenterCourse, assignment: TeacherCourseAssignment }[]
  
  console.log('[getAssignedCenterCourses] Resultado final:', result.length, result)
  return result
}

// === FUNCIONES DE MATRICULACIONES ===
export const getEnrollments = (): Enrollment[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.enrollments)
  const allEnrollments: Enrollment[] = safeJsonParse(data, [])
  
  // Filtrar solo las matrículas del usuario actual
  return allEnrollments.filter(enrollment => enrollment.userId === currentUser.id)
}

export const saveEnrollments = (enrollments: Enrollment[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todas las matriculaciones pertenecen al usuario actual
  const userEnrollments = enrollments.map(enrollment => ({
    ...enrollment,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.enrollments, JSON.stringify(userEnrollments))
  window.dispatchEvent(new CustomEvent('enrollmentsUpdated'))
}

// === FUNCIONES DE SISTEMAS DE EVALUACIÓN ===
export const getEvaluationSystems = (): EvaluationSystem[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.evaluationSystems)
  const allSystems: EvaluationSystem[] = safeJsonParse(data, [])
  
  // Filtrar solo los sistemas de evaluación del usuario actual
  return allSystems.filter(system => system.userId === currentUser.id)
}

export const saveEvaluationSystems = (systems: EvaluationSystem[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todos los sistemas pertenecen al usuario actual
  const userSystems = systems.map(system => ({
    ...system,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.evaluationSystems, JSON.stringify(userSystems))
  window.dispatchEvent(new CustomEvent('evaluationSystemsUpdated'))
}

// === FUNCIONES DE ANO ACADÉMICO ===
export const getCurrentAcademicYear = (): string => {
  if (typeof window === 'undefined') return '2024-25'
  
  const keys = getStorageKeys()
  const year = localStorage.getItem(keys.currentAcademicYear)
  return year || '2024-25'
}

export const setCurrentAcademicYear = (year: string): void => {
  if (typeof window === 'undefined') return
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.currentAcademicYear, year)
  window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: year }))
}

export const getAcademicYears = (): string[] => {
  // Generar años académicos desde 2020 hasta 2030
  const years: string[] = []
  for (let year = 2020; year <= 2030; year++) {
    const nextYear = (year + 1).toString().slice(-2)
    years.push(`${year}-${nextYear}`)
  }
  return years
}

// === FUNCIONES DE DATOS FILTRADOS ===
export const getFilteredData = () => {
  const currentYear = getCurrentAcademicYear()
  const students = getStudents().filter(s => s.academicYear === currentYear || !s.academicYear)
  const courses = getCourses().filter(c => c.academicYear === currentYear)
  const enrollments = getEnrollments().filter(e => e.academicYear === currentYear)
  
  return {
    students,
    courses,
    enrollments,
    subjects: getSubjects(),
    evaluationSystems: getEvaluationSystems(),
    testScores: getTestScores()
  }
}

// === FUNCIONES DE TEST SCORES ===
export const getTestScores = (): TestScore[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const data = localStorage.getItem(keys.testScores)
  const allTestScores: TestScore[] = safeJsonParse(data, [])
  
  // Filtrar solo las puntuaciones del usuario actual
  return allTestScores.filter(score => score.userId === currentUser.id)
}

export const saveTestScores = (scores: TestScore[]): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  // Asegurar que todos los scores pertenecen al usuario actual
  const userScores = scores.map(score => ({
    ...score,
    userId: currentUser.id
  }))
  
  const keys = getStorageKeys()
  localStorage.setItem(keys.testScores, JSON.stringify(userScores))
  window.dispatchEvent(new CustomEvent('testScoresUpdated'))
}

// Función auxiliar para añadir puntuación de prueba (para testing)
export const addTestScore = (score: Omit<TestScore, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): TestScore => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  const testScores = getTestScores()
  const now = new Date().toISOString()
  
  const newScore: TestScore = {
    ...score,
    id: Math.max(...testScores.map(s => s.id), 0) + 1,
    userId: currentUser.id,
    createdAt: now,
    updatedAt: now
  }
  
  const updatedScores = [...testScores, newScore]
  saveTestScores(updatedScores)
  return newScore
}

// === FUNCIONES DE DATOS DE RESPALDO ===
export const exportUserBackup = (academicYear?: string): BackupData => {
  const currentUser = getCurrentUser()
  if (!currentUser) throw new Error('Usuario non autenticado')
  
  const targetYear = academicYear || getCurrentAcademicYear()
  const data = getFilteredData()
  
  return {
    metadata: {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      academicYear: targetYear,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      dataTypes: ['students', 'subjects', 'courses', 'enrollments', 'evaluationSystems', 'testScores']
    },
    data: {
      students: data.students,
      subjects: data.subjects,
      courses: data.courses,
      enrollments: data.enrollments,
      evaluationSystems: data.evaluationSystems,
      testScores: data.testScores,
      grades: [], // Por implementar
      evaluations: [] // Por implementar
    }
  }
}

export const importUserBackup = (backupData: BackupData): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  try {
    // Verificar que el backup es del usuario actual (opcional)
    if (backupData.metadata.userId && backupData.metadata.userId !== currentUser.id) {
      const confirmImport = window.confirm(
        `Este backup pertence a outro usuario (${backupData.metadata.userName}). ¿Queres importalo igualmente?`
      )
      if (!confirmImport) return false
    }
    
    // Importar datos
    if (backupData.data.students) saveStudents(backupData.data.students)
    if (backupData.data.subjects) saveSubjects(backupData.data.subjects)
    if (backupData.data.courses) saveCourses(backupData.data.courses)
    if (backupData.data.enrollments) saveEnrollments(backupData.data.enrollments)
    if (backupData.data.evaluationSystems) saveEvaluationSystems(backupData.data.evaluationSystems)
    if (backupData.data.testScores) saveTestScores(backupData.data.testScores)
    
    return true
  } catch (error) {
    console.error('Error importing backup:', error)
    return false
  }
}

// Gestión del historial de backups (simulado con localStorage)
export const getBackupHistory = (): BackupData[] => {
  if (typeof window === 'undefined') return []
  
  const currentUser = getCurrentUser()
  if (!currentUser) return []
  
  const keys = getStorageKeys()
  const historyKey = `${keys.students.replace('students', 'backup_history')}`
  
  try {
    const historyData = localStorage.getItem(historyKey)
    return historyData ? JSON.parse(historyData) : []
  } catch (error) {
    console.warn('Error loading backup history:', error)
    return []
  }
}

export const saveBackupToHistory = (backupData: BackupData): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  const keys = getStorageKeys()
  const historyKey = `${keys.students.replace('students', 'backup_history')}`
  
  try {
    const history = getBackupHistory()
    const newHistory = [backupData, ...history.slice(0, 9)] // Mantener solo los últimos 10
    localStorage.setItem(historyKey, JSON.stringify(newHistory))
  } catch (error) {
    console.warn('Error saving backup to history:', error)
  }
}

export const deleteBackupFromHistory = (backupId: string): boolean => {
  if (typeof window === 'undefined') return false
  
  const currentUser = getCurrentUser()
  if (!currentUser) return false
  
  const keys = getStorageKeys()
  const historyKey = `${keys.students.replace('students', 'backup_history')}`
  
  try {
    const history = getBackupHistory()
    const filteredHistory = history.filter(backup => 
      backup.metadata.createdAt !== backupId
    )
    localStorage.setItem(historyKey, JSON.stringify(filteredHistory))
    return true
  } catch (error) {
    console.warn('Error deleting backup from history:', error)
    return false
  }
}

export const createBackup = (academicYear?: string): BackupData => {
  const backupData = exportUserBackup(academicYear)
  saveBackupToHistory(backupData)
  return backupData
}

export const restoreBackup = (backupData: BackupData): boolean => {
  return importUserBackup(backupData)
}

// === FUNCIONES DE GESTIÓN DE DATOS ===

// Reinicializar datos del usuario (limpiar y agregar datos de ejemplo)
export const resetUserData = (): boolean => {
  try {
    const user = getCurrentUser()
    if (!user) return false

    // Limpiar todos los datos del usuario
    clearUserData()

    // Reinicializar con datos de ejemplo básicos
    initializeUserData()
    
    // También inicializar datos del centro si no existen
    initializeCenterData()

    return true
  } catch (error) {
    console.error('Error al reinicializar datos del usuario:', error)
    return false
  }
}

// Limpiar todos los datos del usuario
export const clearUserData = (): boolean => {
  try {
    const user = getCurrentUser()
    if (!user) return false

    const keys = getStorageKeys()
    
    // Eliminar todas las claves de datos del usuario
    Object.values(keys).forEach(key => {
      localStorage.removeItem(key)
    })

    // Disparar evento para notificar que los datos se han limpiado
    window.dispatchEvent(new CustomEvent('userDataCleared'))
    window.dispatchEvent(new CustomEvent('studentsUpdated'))
    window.dispatchEvent(new CustomEvent('coursesUpdated'))
    window.dispatchEvent(new CustomEvent('subjectsUpdated'))
    window.dispatchEvent(new CustomEvent('teacherCourseAssignmentsUpdated'))

    return true
  } catch (error) {
    console.error('Error al limpiar datos del usuario:', error)
    return false
  }
}

// Función para hacer limpieza completa de datos del usuario actual
export const cleanAllUserData = (): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  console.log('[cleanAllUserData] Limpiando todos los datos para usuario:', currentUser.id)
  
  const keys = getStorageKeys()
  
  // Limpiar materias
  const subjectsData = localStorage.getItem(keys.subjects)
  const allSubjects: Subject[] = safeJsonParse(subjectsData, [])
  const userSubjects = allSubjects.filter(subject => subject.userId === currentUser.id)
  localStorage.setItem(keys.subjects, JSON.stringify(userSubjects))
  console.log('[cleanAllUserData] Materias limpiadas:', userSubjects.length)
  
  // Limpiar estudiantes
  const studentsData = localStorage.getItem(keys.students)
  const allStudents: Student[] = safeJsonParse(studentsData, [])
  const userStudents = allStudents.filter(student => student.userId === currentUser.id)
  localStorage.setItem(keys.students, JSON.stringify(userStudents))
  console.log('[cleanAllUserData] Estudiantes limpiados:', userStudents.length)
  
  // Limpiar matrículas
  const enrollmentsData = localStorage.getItem(keys.enrollments)
  const allEnrollments: Enrollment[] = safeJsonParse(enrollmentsData, [])
  const userEnrollments = allEnrollments.filter(enrollment => enrollment.userId === currentUser.id)
  localStorage.setItem(keys.enrollments, JSON.stringify(userEnrollments))
  console.log('[cleanAllUserData] Matrículas limpiadas:', userEnrollments.length)
  
  // Limpiar sistemas de evaluación
  const evaluationSystemsData = localStorage.getItem(keys.evaluationSystems)
  const allEvaluationSystems: EvaluationSystem[] = safeJsonParse(evaluationSystemsData, [])
  const userEvaluationSystems = allEvaluationSystems.filter(system => system.userId === currentUser.id)
  localStorage.setItem(keys.evaluationSystems, JSON.stringify(userEvaluationSystems))
  console.log('[cleanAllUserData] Sistemas de evaluación limpiados:', userEvaluationSystems.length)
  
  // Limpiar puntuaciones de pruebas
  const testScoresData = localStorage.getItem(keys.testScores)
  const allTestScores: TestScore[] = safeJsonParse(testScoresData, [])
  const userTestScores = allTestScores.filter(score => score.userId === currentUser.id)
  localStorage.setItem(keys.testScores, JSON.stringify(userTestScores))
  console.log('[cleanAllUserData] Puntuaciones limpiadas:', userTestScores.length)
}

// Función para limpiar localStorage de datos corruptos
export const cleanCorruptedData = (): void => {
  if (typeof window === 'undefined') return
  
  const currentUser = getCurrentUser()
  if (!currentUser) return
  
  console.log('[cleanCorruptedData] Limpiando datos corruptos para usuario:', currentUser.id)
  
  // Obtener claves actuales del usuario
  const keys = getStorageKeys()
  
  // Limpiar completamente el localStorage de materias corruptas
  // Solo mantenemos las materias que realmente creó este usuario
  
  // Para materias: eliminar todas y dejar que se recreen desde cero
  localStorage.removeItem(keys.subjects)
  console.log('[cleanCorruptedData] LocalStorage de materias limpiado completamente')
  
  // También limpiar datos relacionados que podrían estar corruptos
  localStorage.removeItem(keys.enrollments)
  localStorage.removeItem(keys.evaluationSystems)
  localStorage.removeItem(keys.testScores)
  
  console.log('[cleanCorruptedData] Limpieza completa realizada. Datos corruptos eliminados.')
}

// === MIGRACIÓN ENTRE USUARIOS (para admins) ===
export const migrateDataBetweenUsers = (fromUserId: number, toUserId: number): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== 'admin') return false
  
  try {
    // Por implementar en futuras versiones
    console.log(`Migrating data from user ${fromUserId} to user ${toUserId}`)
    return true
  } catch {
    return false
  }
}
