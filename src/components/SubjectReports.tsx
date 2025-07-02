'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Users, BarChart3, Filter, Calendar, RefreshCw } from 'lucide-react'
import { Subject, Student, Enrollment, EvaluationSystem, TestScore, SubjectEvaluation, EvaluationTest } from '@/types/auth'
import { 
  getSubjects, 
  getStudents, 
  getEnrollments, 
  getEvaluationSystems,
  getTestScores 
} from '@/lib/userDataManager'
import { useAuth } from '@/components/AuthProvider'
import { generateSubjectSummaryPDF, generateSubjectDetailedPDF } from '@/lib/subjectReportGenerator'

interface StudentGrade {
  student: Student
  finalGrade: number
  evaluationGrades: { [evaluationId: number]: number }
  testScores: { [testId: number]: TestScore }
  status: 'pass' | 'fail' | 'pending'
}

export default function SubjectReports() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(false)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  useEffect(() => {
    if (user) {
      setSubjects(getSubjects().filter(s => s.isActive))
    }
  }, [user])

  // Efecto para recalcular las notas cuando se actualice la materia seleccionada
  useEffect(() => {
    if (selectedSubject) {
      const grades = calculateStudentGrades(selectedSubject)
      setStudentGrades(grades)
    }
  }, [selectedSubject])

  // Función para actualizar estadísticas en tiempo real
  const refreshStudentGrades = () => {
    if (selectedSubject) {
      const grades = calculateStudentGrades(selectedSubject)
      setStudentGrades(grades)
    }
  }

  // Función para obtener el sistema de evaluación de una materia
  const getEvaluationSystemBySubject = (subjectId: number): EvaluationSystem | null => {
    const evaluationSystems = getEvaluationSystems()
    return evaluationSystems.find(system => system.subjectId === subjectId) || null
  }

  const calculateStudentGrades = (subject: Subject): StudentGrade[] => {
    const enrollments = getEnrollments().filter(e => e.subjectId === subject.id && e.isActive)
    const students = getStudents().filter(s => s.isActive)
    const enrolledStudents = students.filter(s => 
      enrollments.some(e => e.studentId === s.id)
    )
    
    const evaluationSystem = getEvaluationSystemBySubject(subject.id)
    const allTestScores = getTestScores()

    return enrolledStudents.map(student => {
      const studentTestScores: { [testId: number]: TestScore } = {}
      const evaluationGrades: { [evaluationId: number]: number } = {}
      
      // Obtener todas las puntuaciones del estudiante para esta materia
      const studentScores = allTestScores.filter(score => score.studentId === student.id)
      
      studentScores.forEach(score => {
        studentTestScores[score.testId] = score
      })

      let finalGrade = 0
      let hasAnyGrade = false

      if (evaluationSystem) {
        // Calcular notas por evaluación
        evaluationSystem.evaluations.forEach(evaluation => {
          let evaluationScore = 0
          let totalWeight = 0
          let evaluationHasScores = false

          evaluation.tests.forEach(test => {
            const score = studentTestScores[test.id]
            if (score && score.score !== undefined && score.score !== null) {
              // Normalizar a escala 0-10 usando maxScore del test
              const normalizedScore = (score.score / (score.maxScore || 10)) * 10
              evaluationScore += normalizedScore * (test.weight / 100)
              totalWeight += test.weight
              evaluationHasScores = true
              hasAnyGrade = true
            }
          })

          // Solo calcular si hay puntuaciones para esta evaluación
          if (evaluationHasScores && totalWeight > 0) {
            // Si no están todas las pruebas, calcular proporcionalmente
            const evaluationFinalScore = totalWeight < 100 
              ? (evaluationScore / totalWeight) * 100
              : evaluationScore

            evaluationGrades[evaluation.id] = Math.round(evaluationFinalScore * 100) / 100
            
            // Agregar al promedio final según el peso de la evaluación
            finalGrade += evaluationFinalScore * (evaluation.weight / 100)
          } else {
            evaluationGrades[evaluation.id] = 0
          }
        })
      }

      // Determinar estado del estudiante
      let status: 'pass' | 'fail' | 'pending' = 'pending'
      if (hasAnyGrade) {
        status = finalGrade >= 5 ? 'pass' : 'fail'
      }

      return {
        student,
        finalGrade: Math.round(finalGrade * 100) / 100,
        evaluationGrades,
        testScores: studentTestScores,
        status
      }
    })
  }

  const handleSubjectSelect = (subject: Subject) => {
    setLoading(true)
    setSelectedSubject(subject)
    
    // Simular carga breve
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  const handleGenerateSummaryPDF = () => {
    if (!selectedSubject) return
    
    const reportData = {
      subject: selectedSubject,
      studentGrades,
      evaluationSystem: getEvaluationSystemBySubject(selectedSubject.id),
      generatedAt: new Date().toISOString()
    }
    
    generateSubjectSummaryPDF(reportData)
  }

  const handleGenerateDetailedPDF = () => {
    if (!selectedSubject) return
    
    const reportData = {
      subject: selectedSubject,
      studentGrades,
      evaluationSystem: getEvaluationSystemBySubject(selectedSubject.id),
      generatedAt: new Date().toISOString()
    }
    
    generateSubjectDetailedPDF(reportData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50'
      case 'fail': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass': return 'Aprobado'
      case 'fail': return 'Suspenso'
      case 'pending': return 'Pendiente'
      default: return 'Sin evaluar'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Informes por Materia</h2>
          <div className="text-sm text-gray-600">
            Genera informes de notas de tus materias asignadas
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Aviso:</strong> No tienes materias creadas todavía. Crea materias en "Gestión de Materias" para poder generar informes.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Materias disponibles:</strong> Tienes {subjects.length} materia{subjects.length !== 1 ? 's' : ''} para generar informes.
            </p>
          </div>
        )}
      </div>

      {/* Subject Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Seleccionar Materia</h3>
        {subjects.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay materias disponibles
            </h3>
            <p className="text-gray-600">
              Crea materias en "Gestión de Materias" para poder generar informes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedSubject?.id === subject.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{subject.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{subject.code}</p>
                    <p className="text-xs text-gray-400 mt-1">{subject.course}</p>
                  </div>
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subject.credits} créditos
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Subject Report */}
      {selectedSubject && (
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Informe de {selectedSubject.name}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedSubject.code} • {selectedSubject.course} • {selectedSubject.credits} ECTS
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={refreshStudentGrades}
                disabled={loading}
                className="btn-secondary btn-sm flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              
              <button
                onClick={handleGenerateSummaryPDF}
                disabled={loading || studentGrades.length === 0}
                className="btn-secondary btn-sm flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Resumen PDF
              </button>
              
              <button
                onClick={handleGenerateDetailedPDF}
                disabled={loading || studentGrades.length === 0}
                className="btn-primary btn-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Detallado PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Calculando notas...
              </div>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total Alumnos</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{studentGrades.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Matriculados en la materia</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Aprobados</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {studentGrades.filter(g => g.status === 'pass').length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {studentGrades.length > 0 
                      ? `${((studentGrades.filter(g => g.status === 'pass').length / studentGrades.length) * 100).toFixed(1)}%`
                      : '0%'
                    } del total
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Suspensos</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {studentGrades.filter(g => g.status === 'fail').length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {studentGrades.length > 0 
                      ? `${((studentGrades.filter(g => g.status === 'fail').length / studentGrades.length) * 100).toFixed(1)}%`
                      : '0%'
                    } del total
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Nota Media</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {(() => {
                      const gradesWithScores = studentGrades.filter(g => g.status !== 'pending')
                      return gradesWithScores.length > 0 
                        ? (gradesWithScores.reduce((sum, g) => sum + g.finalGrade, 0) / gradesWithScores.length).toFixed(2)
                        : '0.00'
                    })()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    De {studentGrades.filter(g => g.status !== 'pending').length} evaluados
                  </p>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota Final
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentGrades.map((studentGrade) => (
                      <tr key={studentGrade.student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {studentGrade.student.name} {studentGrade.student.surname}
                            </div>
                            <div className="text-sm text-gray-500">{studentGrade.student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {studentGrade.finalGrade.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(studentGrade.status)}`}>
                            {getStatusText(studentGrade.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            {Object.entries(studentGrade.evaluationGrades).map(([evalId, grade]) => (
                              <span key={evalId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {grade.toFixed(1)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {studentGrades.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay estudiantes matriculados en esta asignatura
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
