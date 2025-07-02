// Utilidades para gestionar los datos globalmente entre componentes
import { Student, Subject, Course, Enrollment, EvaluationSystem, TestScore, BackupData } from '@/types/auth'
import { mockStudents, mockSubjects, mockCourses, mockEnrollments, mockEvaluationSystems, mockTestScores } from './mockData'

// Claves para localStorage
const STORAGE_KEYS = {
  students: 'gestion_students',
  subjects: 'gestion_subjects',
  courses: 'gestion_courses',
  enrollments: 'gestion_enrollments',
  evaluationSystems: 'gestion_evaluation_systems',
  testScores: 'gestion_test_scores',
  currentAcademicYear: 'gestion_current_academic_year',
  initialized: 'gestion_initialized'
}

// Inicializar datos por primera vez
export const initializeData = () => {
  if (typeof window === 'undefined') return

  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized)
  
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(mockStudents))
    localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(mockSubjects))
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(mockCourses))
    localStorage.setItem(STORAGE_KEYS.enrollments, JSON.stringify(mockEnrollments))
    localStorage.setItem(STORAGE_KEYS.evaluationSystems, JSON.stringify(mockEvaluationSystems))
    localStorage.setItem(STORAGE_KEYS.testScores, JSON.stringify(mockTestScores))
    localStorage.setItem(STORAGE_KEYS.currentAcademicYear, '2024-25') // Año académico por defecto
    localStorage.setItem(STORAGE_KEYS.initialized, 'true')
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

// Estudiantes
export const getStudents = (): Student[] => {
  if (typeof window === 'undefined') return mockStudents
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.students)
  return safeJsonParse(stored, mockStudents)
}

export const saveStudents = (students: Student[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students))
  // Disparar evento personalizado para notificar a otros componentes
  window.dispatchEvent(new CustomEvent('studentsUpdated', { detail: students }))
}

export const addStudent = (student: Omit<Student, 'id'>) => {
  const students = getStudents()
  const newStudent = {
    ...student,
    id: Math.max(...students.map(s => s.id), 0) + 1
  }
  const updatedStudents = [...students, newStudent]
  saveStudents(updatedStudents)
  return newStudent
}

export const updateStudent = (updatedStudent: Student) => {
  const students = getStudents()
  const updatedStudents = students.map(s => 
    s.id === updatedStudent.id ? updatedStudent : s
  )
  saveStudents(updatedStudents)
}

export const deleteStudent = (id: number) => {
  const students = getStudents()
  const updatedStudents = students.map(s => 
    s.id === id ? { ...s, isActive: false } : s
  )
  saveStudents(updatedStudents)
}

// Asignaturas
export const getSubjects = (): Subject[] => {
  if (typeof window === 'undefined') return mockSubjects
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.subjects)
  return safeJsonParse(stored, mockSubjects)
}

export const saveSubjects = (subjects: Subject[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects))
  window.dispatchEvent(new CustomEvent('subjectsUpdated', { detail: subjects }))
}

// Cursos
export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return mockCourses
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.courses)
  return safeJsonParse(stored, mockCourses)
}

export const saveCourses = (courses: Course[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses))
  window.dispatchEvent(new CustomEvent('coursesUpdated', { detail: courses }))
}

// Matriculaciones
export const getEnrollments = (): Enrollment[] => {
  if (typeof window === 'undefined') return mockEnrollments
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.enrollments)
  return safeJsonParse(stored, mockEnrollments)
}

export const saveEnrollments = (enrollments: Enrollment[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.enrollments, JSON.stringify(enrollments))
  window.dispatchEvent(new CustomEvent('enrollmentsUpdated', { detail: enrollments }))
}

export const addEnrollment = (enrollment: Omit<Enrollment, 'id'>) => {
  const enrollments = getEnrollments()
  const newEnrollment = {
    ...enrollment,
    id: Math.max(...enrollments.map(e => e.id), 0) + 1
  }
  const updatedEnrollments = [...enrollments, newEnrollment]
  saveEnrollments(updatedEnrollments)
  return newEnrollment
}

export const updateEnrollment = (updatedEnrollment: Enrollment) => {
  const enrollments = getEnrollments()
  const updatedEnrollments = enrollments.map(e => 
    e.id === updatedEnrollment.id ? updatedEnrollment : e
  )
  saveEnrollments(updatedEnrollments)
}

// Sistemas de evaluación
export const getEvaluationSystems = (): EvaluationSystem[] => {
  if (typeof window === 'undefined') return mockEvaluationSystems
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.evaluationSystems)
  return safeJsonParse(stored, mockEvaluationSystems)
}

export const saveEvaluationSystems = (systems: EvaluationSystem[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.evaluationSystems, JSON.stringify(systems))
  window.dispatchEvent(new CustomEvent('evaluationSystemsUpdated', { detail: systems }))
}

export const getEvaluationSystemBySubject = (subjectId: number): EvaluationSystem | null => {
  const systems = getEvaluationSystems()
  return systems.find(s => s.subjectId === subjectId) || null
}

export const saveEvaluationSystem = (system: EvaluationSystem) => {
  const systems = getEvaluationSystems()
  const existingIndex = systems.findIndex(s => s.subjectId === system.subjectId)
  
  let updatedSystems
  if (existingIndex >= 0) {
    updatedSystems = systems.map(s => s.subjectId === system.subjectId ? system : s)
  } else {
    updatedSystems = [...systems, system]
  }
  
  saveEvaluationSystems(updatedSystems)
}

// Puntuaciones de pruebas
export const getTestScores = (): TestScore[] => {
  if (typeof window === 'undefined') return mockTestScores
  
  initializeData()
  const stored = localStorage.getItem(STORAGE_KEYS.testScores)
  return safeJsonParse(stored, mockTestScores)
}

export const saveTestScores = (scores: TestScore[]) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.testScores, JSON.stringify(scores))
  window.dispatchEvent(new CustomEvent('testScoresUpdated', { detail: scores }))
}

// Gestión del año académico activo
export const getCurrentAcademicYear = (): string => {
  if (typeof window === 'undefined') return '2024-25'
  
  const stored = localStorage.getItem(STORAGE_KEYS.currentAcademicYear)
  return stored || '2024-25'
}

export const setCurrentAcademicYear = (year: string) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.currentAcademicYear, year)
  // Disparar evento para notificar cambio de año académico
  window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: year }))
}

export const getAcademicYears = (): string[] => {
  return ['2023-24', '2024-25', '2025-26', '2026-27']
}

// Filtrar datos por año académico
export const getFilteredData = () => {
  const currentYear = getCurrentAcademicYear()
  
  return {
    students: getStudents().filter(s => {
      // Si tiene academicYear definido, usarlo; si no, deducir del enrollmentDate
      const studentYear = s.academicYear || deduceAcademicYearFromDate(s.enrollmentDate)
      return studentYear === currentYear
    }),
    subjects: getSubjects(),
    courses: getCourses().filter(c => c.academicYear === currentYear),
    enrollments: getEnrollments().filter(e => e.academicYear === currentYear)
  }
}

// Función auxiliar para deducir año académico de la fecha de matriculación
const deduceAcademicYearFromDate = (enrollmentDate: string): string => {
  const year = parseInt(enrollmentDate.split('-')[0])
  const month = parseInt(enrollmentDate.split('-')[1])
  
  // Si se matriculó entre septiembre y diciembre, es del año académico que comienza ese año
  // Si se matriculó entre enero y agosto, es del año académico que comenzó el año anterior
  if (month >= 9) {
    return `${year}-${(year + 1).toString().slice(-2)}`
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`
  }
}

// Función para migrar datos al siguiente año académico
export const migrateToNextAcademicYear = (fromYear: string, toYear: string) => {
  if (typeof window === 'undefined') return false

  try {
    const students = getStudents()
    const courses = getCourses()
    const enrollments = getEnrollments()

    // Migrar estudiantes: promover a segundo año o marcar como graduados
    const migratedStudents = students.map(student => {
      if (!student.isActive) return student

      const currentCourse = student.course
      let newCourse = currentCourse

      // Promocionar estudiantes de primer a segundo año
      if (currentCourse.includes(' 1')) {
        newCourse = currentCourse.replace(' 1', ' 2')
      } else if (currentCourse.includes(' 2')) {
        // Los de segundo año se gradúan
        return {
          ...student,
          isActive: false,
          updatedAt: new Date().toISOString()
        }
      }

      return {
        ...student,
        course: newCourse,
        updatedAt: new Date().toISOString()
      }
    })

    // Crear cursos para el nuevo año académico
    const newCourses = courses
      .filter(course => course.academicYear === fromYear)
      .map(course => ({
        ...course,
        id: Math.max(...courses.map(c => c.id), 0) + Math.random() * 1000,
        academicYear: toYear,
        startDate: toYear.split('-')[0] + '-09-01',
        endDate: '20' + toYear.split('-')[1] + '-06-30',
        students: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

    // Guardar datos migrados
    saveStudents(migratedStudents)
    saveCourses([...courses, ...newCourses])

    // Establecer el nuevo año como activo
    setCurrentAcademicYear(toYear)

    return true
  } catch (error) {
    console.error('Error migrando datos:', error)
    return false
  }
}

// Interface para opcións de migración personalizada
interface MigrationOptions {
  students: boolean
  courses: boolean
  subjects: boolean
  evaluations: boolean
}

// Función para migración personalizada con opcións seleccionables
export const migrateDataWithOptions = (
  fromYear: string, 
  toYear: string, 
  options: MigrationOptions
): boolean => {
  if (typeof window === 'undefined') return false

  try {
    const students = getStudents()
    const subjects = getSubjects()
    const courses = getCourses()
    const evaluationSystems = getEvaluationSystems()

    // Migrar estudantes se está seleccionado
    if (options.students) {
      const migratedStudents = students.map(student => {
        if (!student.isActive || student.academicYear !== fromYear) return student

        const currentCourse = student.course
        let newCourse = currentCourse

        // Promocionar estudiantes de primeiro a segundo ano
        if (currentCourse.includes(' 1')) {
          newCourse = currentCourse.replace(' 1', ' 2')
          return {
            ...student,
            course: newCourse,
            academicYear: toYear,
            updatedAt: new Date().toISOString()
          }
        } else if (currentCourse.includes(' 2')) {
          // Os de segundo ano gradúanse
          return {
            ...student,
            isActive: false,
            academicYear: fromYear, // Manteñen o ano de graduación
            updatedAt: new Date().toISOString()
          }
        }

        return student
      })

      saveStudents(migratedStudents)
    }

    // Migrar cursos se está seleccionado
    if (options.courses) {
      const currentCourses = getCourses()
      const newCourses = currentCourses
        .filter(course => course.academicYear === fromYear)
        .map(course => ({
          ...course,
          id: Math.max(...currentCourses.map(c => c.id), 0) + Math.random() * 1000,
          academicYear: toYear,
          startDate: toYear.split('-')[0] + '-09-01',
          endDate: '20' + toYear.split('-')[1] + '-06-30',
          students: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))

      saveCourses([...currentCourses, ...newCourses])
    }

    // Migrar materias se está seleccionado
    if (options.subjects) {
      // As materias normalmente non cambian entre anos, xa están gardadas
      // Pero poderiamos facer unha copia se fose necesario
      console.log('Materias mantidas para o novo ano académico')
    }

    // Migrar sistemas de avaliación se está seleccionado
    if (options.evaluations) {
      // Os sistemas de avaliación normalmente mantéñense entre anos
      // Só actualizamos as datas se é necesario
      const updatedEvaluationSystems = evaluationSystems.map(system => ({
        ...system,
        // Actualizamos as datas das avaliacións para o novo ano
        evaluations: system.evaluations.map(evaluation => ({
          ...evaluation,
          startDate: updateDateToNewYear(evaluation.startDate, toYear),
          endDate: updateDateToNewYear(evaluation.endDate, toYear),
          tests: evaluation.tests.map(test => ({
            ...test,
            date: test.date ? updateDateToNewYear(test.date, toYear) : test.date
          }))
        }))
      }))

      saveEvaluationSystems(updatedEvaluationSystems)
    }

    // Estabelecer o novo ano como activo
    setCurrentAcademicYear(toYear)

    // Disparar evento de migración completa
    window.dispatchEvent(new CustomEvent('academicYearMigrated', { 
      detail: { fromYear, toYear, options } 
    }))

    return true
  } catch (error) {
    console.error('Error na migración personalizada:', error)
    return false
  }
}

// Función auxiliar para actualizar datas ao novo año académico
const updateDateToNewYear = (dateString: string, newAcademicYear: string): string => {
  const [year, month, day] = dateString.split('-')
  const newStartYear = newAcademicYear.split('-')[0]
  const newEndYear = '20' + newAcademicYear.split('-')[1]
  
  // Se é setembro ou despois, usar o primeiro ano
  // Se é antes de setembro, usar o segundo ano
  const monthNum = parseInt(month)
  const targetYear = monthNum >= 9 ? newStartYear : newEndYear
  
  return `${targetYear}-${month}-${day}`
}

// Función para limpiar y reinicializar datos (útil para desarrollo)
export const resetData = () => {
  if (typeof window === 'undefined') return
  
  // Limpiar todos los datos guardados
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Reinicializar con datos limpios (arrays vacíos)
  initializeData()
  
  // Disparar eventos para actualizar todos los componentes
  window.dispatchEvent(new CustomEvent('studentsUpdated', { detail: getStudents() }))
  window.dispatchEvent(new CustomEvent('subjectsUpdated', { detail: getSubjects() }))
  window.dispatchEvent(new CustomEvent('coursesUpdated', { detail: getCourses() }))
  window.dispatchEvent(new CustomEvent('enrollmentsUpdated', { detail: getEnrollments() }))
  window.dispatchEvent(new CustomEvent('evaluationSystemsUpdated', { detail: getEvaluationSystems() }))
  window.dispatchEvent(new CustomEvent('testScoresUpdated', { detail: getTestScores() }))
  window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: getCurrentAcademicYear() }))
  
  console.log('✅ Datos reinicializados correctamente. Base de datos limpia.')
}

// Función para limpiar y reinicializar datos completamente 
export const clearAllData = () => {
  if (typeof window === 'undefined') return
  
  // Confirmar acción
  const confirmed = window.confirm(
    '⚠️ ATENCIÓN: Esto eliminará TODOS los datos de la aplicación.\n\n' +
    'Se borrarán:\n' +
    '• Todos los estudiantes\n' +
    '• Todas las asignaturas\n' +
    '• Todos los cursos\n' +
    '• Todas las matriculaciones\n' +
    '• Todos los sistemas de evaluación\n' +
    '• Todas las notas\n' +
    '• El historial de copias de seguridad\n\n' +
    '¿Estás seguro de que quieres continuar?'
  )
  
  if (!confirmed) return
  
  // Limpiar localStorage completamente
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Limpiar también referencias de backup
  localStorage.removeItem('gestion_backup_references')
  
  // Reinicializar con datos limpios
  initializeData()
  
  // Disparar eventos para actualizar todos los componentes
  window.dispatchEvent(new CustomEvent('studentsUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('subjectsUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('coursesUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('enrollmentsUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('evaluationSystemsUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('testScoresUpdated', { detail: [] }))
  window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: getCurrentAcademicYear() }))
  window.dispatchEvent(new CustomEvent('dataRestored', { detail: null }))
  
  alert('✅ Todos los datos han sido eliminados. Ahora tienes una base de datos completamente limpia.')
}

// Hook para escuchar cambios en los datos
export const useDataSubscription = (
  dataType: 'students' | 'subjects' | 'courses' | 'enrollments',
  callback: (data: any) => void
) => {
  if (typeof window === 'undefined') return

  const eventName = `${dataType}Updated`
  
  const handleUpdate = (event: CustomEvent) => {
    callback(event.detail)
  }

  window.addEventListener(eventName, handleUpdate as EventListener)
  
  return () => {
    window.removeEventListener(eventName, handleUpdate as EventListener)
  }
}

// Sistema de copias de seguridad
// Crear copia de seguridad del año académico actual
export const createBackup = (): BackupData => {
  const currentYear = getCurrentAcademicYear()
  const filteredData = getFilteredData()
  
  const backup: BackupData = {
    version: '1.0.0',
    academicYear: currentYear,
    timestamp: new Date().toISOString(),
    data: {
      students: filteredData.students,
      subjects: filteredData.subjects,
      courses: filteredData.courses,
      enrollments: filteredData.enrollments,
      evaluationSystems: getEvaluationSystems(),
      testScores: getTestScores().filter(score => {
        // Incluir solo las puntuaciones de estudiantes del año actual
        return filteredData.students.some(student => student.id === score.studentId)
      })
    },
    metadata: {
      totalStudents: filteredData.students.length,
      totalCourses: filteredData.courses.length,
      totalSubjects: filteredData.subjects.length,
      totalEnrollments: filteredData.enrollments.length,
      generatedBy: 'Sistema de Gestión Académica'
    }
  }
  
  return backup
}

// Exportar copia de seguridad como archivo JSON
export const exportBackup = (filename?: string) => {
  const backup = createBackup()
  const currentYear = getCurrentAcademicYear()
  const defaultFilename = `backup_${currentYear}_${new Date().toISOString().split('T')[0]}.json`
  
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = filename || defaultFilename
  link.click()
  
  // Guardar referencia de la copia en localStorage
  saveBackupReference(backup)
}

// Importar y restaurar copia de seguridad
export const importBackup = async (file: File): Promise<{ success: boolean; message: string; backup?: BackupData }> => {
  try {
    const content = await file.text()
    const backup: BackupData = safeJsonParse(content, {} as BackupData)
    
    // Validar estructura del backup
    if (!backup.version || !backup.academicYear || !backup.data) {
      return { success: false, message: 'Archivo de copia de seguridad inválido' }
    }
    
    // Confirmar restauración
    const confirmRestore = window.confirm(
      `¿Estás seguro de que quieres restaurar la copia de seguridad?\n\n` +
      `Año académico: ${backup.academicYear}\n` +
      `Fecha: ${new Date(backup.timestamp).toLocaleString('es-ES')}\n` +
      `Estudiantes: ${backup.metadata.totalStudents}\n` +
      `Cursos: ${backup.metadata.totalCourses}\n\n` +
      `ATENCIÓN: Esto sobrescribirá todos los datos actuales.`
    )
    
    if (!confirmRestore) {
      return { success: false, message: 'Restauración cancelada por el usuario' }
    }
    
    // Restaurar datos
    restoreFromBackup(backup)
    
    return { 
      success: true, 
      message: `Copia de seguridad restaurada correctamente para el año ${backup.academicYear}`,
      backup 
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }
  }
}

// Restaurar datos desde una copia de seguridad
const restoreFromBackup = (backup: BackupData) => {
  if (typeof window === 'undefined') return
  
  // Cambiar al año académico del backup
  setCurrentAcademicYear(backup.academicYear)
  
  // Restaurar todos los datos
  saveStudents(backup.data.students)
  saveSubjects(backup.data.subjects)
  saveCourses(backup.data.courses)
  saveEnrollments(backup.data.enrollments)
  saveEvaluationSystems(backup.data.evaluationSystems)
  saveTestScores(backup.data.testScores)
  
  // Disparar eventos de actualización
  window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: backup.academicYear }))
  window.dispatchEvent(new CustomEvent('dataRestored', { detail: backup }))
}

// Guardar referencia de copias de seguridad
const saveBackupReference = (backup: BackupData) => {
  if (typeof window === 'undefined') return
  
  const backupsKey = 'gestion_backup_references'
  const existingBackups = localStorage.getItem(backupsKey)
  const backups: any[] = safeJsonParse(existingBackups, [])
  
  const reference = {
    id: `backup_${Date.now()}`,
    academicYear: backup.academicYear,
    timestamp: backup.timestamp,
    filename: `backup_${backup.academicYear}_${backup.timestamp.split('T')[0]}.json`,
    metadata: backup.metadata
  }
  
  backups.unshift(reference) // Añadir al principio
  
  // Mantener solo las últimas 10 copias
  if (backups.length > 10) {
    backups.splice(10)
  }
  
  localStorage.setItem(backupsKey, JSON.stringify(backups))
}

// Obtener historial de copias de seguridad
export const getBackupHistory = () => {
  if (typeof window === 'undefined') return []
  
  const backupsKey = 'gestion_backup_references'
  const existingBackups = localStorage.getItem(backupsKey)
  return safeJsonParse(existingBackups, [])
}

// Crear copia de seguridad automática al cambiar de año
export const createAutoBackup = (fromYear: string) => {
  try {
    const previousYear = getCurrentAcademicYear()
    setCurrentAcademicYear(fromYear)
    
    const backup = createBackup()
    const filename = `auto_backup_${fromYear}_${new Date().toISOString().split('T')[0]}.json`
    
    // Restaurar año anterior
    setCurrentAcademicYear(previousYear)
    
    // Guardar referencia
    saveBackupReference({
      ...backup,
      metadata: {
        ...backup.metadata,
        generatedBy: 'Copia automática'
      }
    })
    
    return { success: true, filename }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
