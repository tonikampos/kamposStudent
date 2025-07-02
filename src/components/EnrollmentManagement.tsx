'use client'

import { useState, useEffect } from 'react'
import { Plus, UserPlus, UserMinus, Search, Users, BookOpen, Calendar, Check, X, GraduationCap } from 'lucide-react'
import { Student, Subject, Course, Enrollment } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { getStudents, getSubjects, getCourses, getEnrollments, saveEnrollments } from '@/lib/userDataManager'

export default function EnrollmentManagement() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('todos')
  const [selectedSubject, setSelectedSubject] = useState<string>('todos')
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [selectedStudentForEnrollment, setSelectedStudentForEnrollment] = useState<Student | null>(null)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos
  useEffect(() => {
    if (user) {
      setStudents(getStudents())
      setSubjects(getSubjects())
      setCourses(getCourses())
      setEnrollments(getEnrollments())
    }
  }, [user])

  // Escuchar cambios en estudiantes
  useEffect(() => {
    const handleStudentsUpdate = () => {
      setStudents(getStudents())
    }

    window.addEventListener('studentsUpdated', handleStudentsUpdate)
    return () => window.removeEventListener('studentsUpdated', handleStudentsUpdate)
  }, [])

  // Obtener cursos activos únicos
  const activeCourses = courses.filter(c => c.isActive)
  const courseNames = Array.from(new Set(subjects.map(s => s.course)))

  // Filtrar asignaturas por curso seleccionado
  const filteredSubjects = selectedCourse === 'todos' 
    ? subjects 
    : subjects.filter(s => s.course === selectedCourse)

  // Obtener estudiantes matriculados en una asignatura específica
  const getEnrolledStudents = (subjectId: number) => {
    const subjectEnrollments = enrollments.filter(e => 
      e.subjectId === subjectId && 
      e.isActive
    )
    return subjectEnrollments.map(e => {
      const student = students.find(s => s.id === e.studentId)
      return student ? { ...student, enrollmentId: e.id, enrollmentDate: e.enrollmentDate } : null
    }).filter(Boolean)
  }

  // Obtener estudiantes NO matriculados en una asignatura específica
  const getAvailableStudents = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId)
    if (!subject) return []

    const enrolledStudentIds = enrollments
      .filter(e => e.subjectId === subjectId && e.isActive)
      .map(e => e.studentId)

    // Permitir matricular cualquier estudiante activo, independientemente del curso
    // Los estudiantes importados pueden no tener curso asignado inicialmente
    return students.filter(s => 
      s.isActive && 
      !enrolledStudentIds.includes(s.id)
    )
  }

  // Matricular estudiante en asignatura
  const handleEnrollStudent = (studentId: number, subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId)
    const course = courses.find(c => c.subjects?.some(sub => parseInt(sub) === subjectId))
    
    const currentEnrollments = getEnrollments()
    const newEnrollment: Enrollment = {
      id: Math.max(...currentEnrollments.map(e => e.id), 0) + 1,
      userId: user.id,
      studentId,
      subjectId,
      academicYear: '2024-2025',
      enrollmentDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedEnrollments = [...currentEnrollments, newEnrollment]
    saveEnrollments(updatedEnrollments)
    setEnrollments(updatedEnrollments)
  }

  // Desmatricular estudiante de asignatura
  const handleUnenrollStudent = (enrollmentId: number) => {
    if (confirm('¿Estás seguro de que quieres desmatricular a este alumno?')) {
      const currentEnrollments = getEnrollments()
      const updatedEnrollments = currentEnrollments.map(e => 
        e.id === enrollmentId 
          ? { ...e, isActive: false, updatedAt: new Date().toISOString() }
          : e
      )
      saveEnrollments(updatedEnrollments)
      setEnrollments(updatedEnrollments)
    }
  }

  // Filtrar asignaturas para mostrar
  const displaySubjects = filteredSubjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubjectFilter = selectedSubject === 'todos' || subject.id.toString() === selectedSubject
    return matchesSearch && matchesSubjectFilter && subject.isActive
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Matriculación de Alumnos</h2>
          <div className="text-sm text-gray-600">
            Gestiona las matriculaciones de alumnos en tus asignaturas
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar asignaturas..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input-field"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="todos">Todos los cursos</option>
            {courseNames.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select
            className="input-field"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="todos">Todas las asignaturas</option>
            {filteredSubjects.map(subject => (
              <option key={subject.id} value={subject.id.toString()}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Asignaturas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{displaySubjects.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Matriculaciones Activas</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {enrollments.filter(e => e.isActive).length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Alumnos Activos</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {students.filter(s => s.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects and Enrollments */}
      <div className="space-y-6">
        {displaySubjects.map((subject) => {
          const enrolledStudents = getEnrolledStudents(subject.id)
          const availableStudents = getAvailableStudents(subject.id)

          return (
            <div key={subject.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color || '#3b82f6' }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subject.code} • {subject.course} • {subject.credits} ECTS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {enrolledStudents.length} alumnos matriculados
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStudentForEnrollment(null)
                      setShowEnrollForm(true)
                    }}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Matricular
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alumnos matriculados */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Alumnos Matriculados ({enrolledStudents.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {enrolledStudents.length > 0 ? (
                      enrolledStudents.map((student: any) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name} {student.surname}
                              </p>
                              <p className="text-xs text-gray-600">
                                Matriculado: {new Date(student.enrollmentDate).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnenrollStudent(student.enrollmentId)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Desmatricular alumno"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic p-4 text-center">
                        No hay alumnos matriculados en esta asignatura
                      </p>
                    )}
                  </div>
                </div>

                {/* Alumnos disponibles para matricular */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Alumnos Disponibles ({availableStudents.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableStudents.length > 0 ? (
                      availableStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name} {student.surname}
                              </p>
                              <p className="text-xs text-gray-600">{student.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnrollStudent(student.id, subject.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Matricular alumno"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 text-sm italic mb-2">
                          No hay alumnos disponibles para matricular
                        </p>
                        <p className="text-xs text-gray-400">
                          {students.filter(s => s.isActive).length > 0 
                            ? 'Todos los alumnos activos ya están matriculados en esta asignatura'
                            : 'No hay alumnos activos en el sistema. Ve a "Alumnado" para añadir estudiantes.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {displaySubjects.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay asignaturas disponibles
          </h3>
          <p className="text-gray-600">
            {selectedCourse !== 'todos' 
              ? `No se encontraron asignaturas para el curso ${selectedCourse}`
              : 'No se encontraron asignaturas que coincidan con los filtros'
            }
          </p>
        </div>
      )}
    </div>
  )
}
