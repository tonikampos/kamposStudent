'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, BookOpen, Award, TrendingUp } from 'lucide-react'
import { getStudents, getSubjects, getEnrollments, getTeacherCourseAssignments } from '@/lib/userDataManager'
import { useAuth } from '@/components/AuthProvider'

export default function AcademicYearDashboard() {
  const { user } = useAuth()
  const [currentYear, setCurrentYear] = useState('')
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalSubjects: 0,
    activeEnrollments: 0
  })

  useEffect(() => {
    const loadStats = () => {
      // Obtener año académico actual (usar año actual por defecto)
      const now = new Date()
      const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
      const academicYear = `${year}-${year + 1}`
      setCurrentYear(academicYear)

      if (user) {
        // Cargar datos del usuario actual
        const students = getStudents()
        const subjects = getSubjects()
        const enrollments = getEnrollments()
        const teacherCourseAssignments = getTeacherCourseAssignments()
        
        // Calcular alumnos únicos matriculados (no total de matrículas)
        const activeEnrollments = enrollments.filter(e => e.isActive)
        const uniqueEnrolledStudents = new Set(activeEnrollments.map(e => e.studentId)).size
        
        setStats({
          totalStudents: students.filter(s => s.isActive).length,
          activeCourses: teacherCourseAssignments.filter(assignment => assignment.isActive).length,
          totalSubjects: subjects.filter(s => s.isActive).length,
          activeEnrollments: uniqueEnrolledStudents
        })
      }
    }

    loadStats()

    // Escuchar cambios cuando se actualicen los datos
    const handleDataUpdate = () => loadStats()
    
    // Eventos para escuchar cambios
    window.addEventListener('studentsUpdated', handleDataUpdate)
    window.addEventListener('subjectsUpdated', handleDataUpdate)
    window.addEventListener('enrollmentsUpdated', handleDataUpdate)
    window.addEventListener('teacherCourseAssignmentsUpdated', handleDataUpdate)

    return () => {
      window.removeEventListener('studentsUpdated', handleDataUpdate)
      window.removeEventListener('subjectsUpdated', handleDataUpdate)
      window.removeEventListener('enrollmentsUpdated', handleDataUpdate)
      window.removeEventListener('teacherCourseAssignmentsUpdated', handleDataUpdate)
    }
  }, [user])

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Año Académico {currentYear}
            </h3>
            <p className="text-sm text-gray-600">
              Resumen del curso actual
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Estudantes Rexistrados</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Cursos Activos</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.activeCourses}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Asignaturas</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.totalSubjects}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Alumnos Matriculados</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{stats.activeEnrollments}</p>
        </div>
      </div>
    </div>
  )
}
