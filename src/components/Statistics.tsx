'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { getStudents, getSubjects, getEnrollments, getTestScores, getEvaluationSystems, getTeacherCourseAssignments } from '@/lib/userDataManager'
import { Student, Subject, TestScore, EvaluationSystem } from '@/types/auth'

interface StatData {
  totalStudents: number
  totalSubjects: number
  totalCourseAssignments: number
  totalEnrollments: number
  totalGrades: number
  averageGrade: number
  passRate: number
  subjectStats: { subject: string; average: number; total: number }[]
  gradeDistribution: { range: string; count: number }[]
}

export default function Statistics() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StatData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  useEffect(() => {
    if (user) {
      const calculateStats = () => {
        const students = getStudents()
        const subjects = getSubjects()
        const enrollments = getEnrollments()
        const testScores = getTestScores()
        const evaluationSystems = getEvaluationSystems()
        const teacherCourseAssignments = getTeacherCourseAssignments()

        // Estadísticas básicas
        const activeStudents = students.filter(s => s.isActive)
        const activeSubjects = subjects.filter(s => s.isActive)
        const activeEnrollments = enrollments.filter(e => e.isActive)
        const activeCourseAssignments = teacherCourseAssignments.filter(assignment => assignment.isActive)
        
        // Calcular alumnos únicos matriculados
        const uniqueEnrolledStudents = new Set(activeEnrollments.map(e => e.studentId)).size

        // Calcular estadísticas de notas
        let totalGrades = 0
        let gradeSum = 0
        let passedGrades = 0
        const gradeRanges = { '9-10': 0, '7-8.9': 0, '5-6.9': 0, '0-4.9': 0 }

        testScores.forEach(score => {
          const normalizedScore = (score.score / score.maxScore) * 10
          totalGrades++
          gradeSum += normalizedScore
          
          if (normalizedScore >= 5) passedGrades++
          
          if (normalizedScore >= 9) gradeRanges['9-10']++
          else if (normalizedScore >= 7) gradeRanges['7-8.9']++
          else if (normalizedScore >= 5) gradeRanges['5-6.9']++
          else gradeRanges['0-4.9']++
        })

        const averageGrade = totalGrades > 0 ? gradeSum / totalGrades : 0
        const passRate = totalGrades > 0 ? (passedGrades / totalGrades) * 100 : 0

        // Estadísticas por materia
        const subjectStats = activeSubjects.map(subject => {
          const subjectScores = testScores.filter(score => {
            // Buscar si esta puntuación pertenece a esta materia
            const evalSystem = evaluationSystems.find(es => es.subjectId === subject.id)
            if (!evalSystem) return false
            
            return evalSystem.evaluations.some(evaluation => 
              evaluation.tests.some(test => test.id === score.testId)
            )
          })

          const subjectEnrollments = activeEnrollments.filter(e => e.subjectId === subject.id)
          const avgScore = subjectScores.length > 0 
            ? subjectScores.reduce((sum, score) => sum + (score.score / score.maxScore) * 10, 0) / subjectScores.length 
            : 0

          return {
            subject: subject.name,
            average: avgScore,
            total: subjectEnrollments.length
          }
        })

        const statsData: StatData = {
          totalStudents: activeStudents.length,
          totalSubjects: activeSubjects.length,
          totalCourseAssignments: activeCourseAssignments.length,
          totalEnrollments: uniqueEnrolledStudents,
          totalGrades: totalGrades,
          averageGrade,
          passRate,
          subjectStats,
          gradeDistribution: [
            { range: '9-10', count: gradeRanges['9-10'] },
            { range: '7-8.9', count: gradeRanges['7-8.9'] },
            { range: '5-6.9', count: gradeRanges['5-6.9'] },
            { range: '0-4.9', count: gradeRanges['0-4.9'] }
          ]
        }

        setStats(statsData)
      }

      calculateStats()

      // Escuchar cambios en los datos
      const handleDataUpdate = () => calculateStats()
      
      window.addEventListener('studentsUpdated', handleDataUpdate)
      window.addEventListener('subjectsUpdated', handleDataUpdate)
      window.addEventListener('enrollmentsUpdated', handleDataUpdate)
      window.addEventListener('testScoresUpdated', handleDataUpdate)
      window.addEventListener('evaluationSystemsUpdated', handleDataUpdate)
      window.addEventListener('teacherCourseAssignmentsUpdated', handleDataUpdate)

      return () => {
        window.removeEventListener('studentsUpdated', handleDataUpdate)
        window.removeEventListener('subjectsUpdated', handleDataUpdate)
        window.removeEventListener('enrollmentsUpdated', handleDataUpdate)
        window.removeEventListener('testScoresUpdated', handleDataUpdate)
        window.removeEventListener('evaluationSystemsUpdated', handleDataUpdate)
        window.removeEventListener('teacherCourseAssignmentsUpdated', handleDataUpdate)
      }
    }
  }, [user, selectedPeriod])

  if (!stats) {
    return <div className="card">Cargando estadísticas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
          <select
            className="input-field w-auto"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="current">Curso Actual</option>
            <option value="previous">Curso Anterior</option>
            <option value="comparison">Comparativa</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Estudantes Rexistrados</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Nota Media</p>
              <p className="text-3xl font-bold">{stats.averageGrade.toFixed(1)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Tasa Aprobados</p>
              <p className="text-3xl font-bold">{stats.passRate.toFixed(1)}%</p>
            </div>
            <Award className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700">Cursos Asignados</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalCourseAssignments}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Alumnos Matriculados</p>
              <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
            </div>
            <Award className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Statistics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rendimiento por Asignatura
          </h3>
          <div className="space-y-4">
            {stats.subjectStats.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {subject.subject}
                  </span>
                  <span className="text-sm text-gray-500">
                    {subject.average.toFixed(1)} ({subject.total} alumnos)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(subject.average / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribución de Notas
          </h3>
          <div className="space-y-4">
            {stats.gradeDistribution.map((dist) => (
              <div key={dist.range} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {dist.range}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-300 ${
                        dist.range === '9-10' ? 'bg-green-500' :
                        dist.range === '7-8.9' ? 'bg-blue-500' :
                        dist.range === '5-6.9' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(dist.count / stats.totalGrades) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">
                  {dist.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Análisis de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Estadísticas Generales</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• {stats.totalStudents} estudantes rexistrados</li>
              <li>• {stats.totalCourseAssignments} cursos asignados</li>
              <li>• {stats.totalSubjects} materias impartidas</li>
              <li>• {stats.totalEnrollments} alumnos matriculados</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Rendimiento</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {stats.totalGrades} notas registradas</li>
              <li>• Nota media general: {stats.averageGrade.toFixed(1)}</li>
              <li>• Tasa de aprobados: {stats.passRate.toFixed(1)}%</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Actividad</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {stats.subjectStats.length} materias con datos</li>
              <li>• Sistema multiusuario activo</li>
              <li>• Datos actualizados en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
