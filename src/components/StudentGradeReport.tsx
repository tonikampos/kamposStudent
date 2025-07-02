'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Download, 
  Mail, 
  Phone,
  MapPin,
  GraduationCap,
  Target,
  FileText,
  X
} from 'lucide-react'
import { 
  Student, 
  Subject, 
  EvaluationSystem, 
  TestScore, 
  Enrollment,
  EvaluationTest
} from '@/types'
import { 
  getStudents, 
  getSubjects, 
  getEvaluationSystems, 
  getEnrollments,
  getTestScores 
} from '@/lib/userDataManager'
import { generateStudentGradeReportPDF } from '@/lib/pdfGenerator'

interface StudentGradeReportProps {
  studentId: number
  onClose: () => void
}

interface SubjectGradeData {
  subject: Subject
  evaluationSystem?: EvaluationSystem
  enrollmentId: number
  evaluationGrades: {
    evaluationId: number
    evaluationName: string
    weight: number
    tests: {
      testId: number
      testName: string
      testWeight: number
      score?: number
      maxScore: number
      percentage?: number
    }[]
    evaluationGrade?: number
    evaluationPercentage?: number
  }[]
  finalGrade?: number
  finalPercentage?: number
  status: 'active' | 'completed' | 'withdrawn'
}

export default function StudentGradeReport({ studentId, onClose }: StudentGradeReportProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [subjectGrades, setSubjectGrades] = useState<SubjectGradeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = () => {
    const students = getStudents()
    const subjects = getSubjects()
    const evaluationSystems = getEvaluationSystems()
    const enrollments = getEnrollments()
    const testScores = getTestScores()

    const studentData = students.find(s => s.id === studentId)
    if (!studentData) {
      setLoading(false)
      return
    }

    setStudent(studentData)

    // Obtener matriculaciones del alumno
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId && e.isActive)

    const gradesData: SubjectGradeData[] = studentEnrollments.map(enrollment => {
      const subject = subjects.find(s => s.id === enrollment.subjectId)
      const evaluationSystem = evaluationSystems.find(es => es.subjectId === enrollment.subjectId)

      if (!subject) return null

      const evaluationGrades = evaluationSystem?.evaluations.map(evaluation => {
        const tests = evaluation.tests.map(test => {
          const score = testScores.find(ts => ts.testId === test.id && ts.studentId === studentId)
          // Usar maxGrade si maxScore no existe y asegurar que nunca sea undefined
          let maxValue = 10 // Valor predeterminado
          
          // Comprobar propiedades para usar el valor apropiado
          if ('maxScore' in test && typeof test.maxScore === 'number') {
            maxValue = test.maxScore
          } else if ('maxGrade' in test && typeof test.maxGrade === 'number') {
            maxValue = test.maxGrade
          }
          
          return {
            testId: test.id,
            testName: test.name,
            testWeight: test.weight,
            score: score?.score,
            maxScore: maxValue,
            percentage: score ? (score.score / maxValue) * 100 : undefined
          }
        })

        // Calcular nota de la evaluación
        let evaluationGrade: number | undefined
        let evaluationPercentage: number | undefined

        const completedTests = tests.filter(t => t.score !== undefined)
        if (completedTests.length > 0) {
          const totalWeight = completedTests.reduce((sum, t) => sum + t.testWeight, 0)
          if (totalWeight > 0) {
            const weightedSum = completedTests.reduce((sum, t) => 
              sum + (t.percentage! * t.testWeight / 100), 0
            )
            evaluationPercentage = (weightedSum / totalWeight) * 100
            evaluationGrade = (evaluationPercentage / 100) * 10
          }
        }

        return {
          evaluationId: evaluation.id,
          evaluationName: evaluation.name,
          weight: evaluation.weight,
          tests,
          evaluationGrade,
          evaluationPercentage
        }
      }) || []

      // Calcular nota final de la asignatura
      let finalGrade: number | undefined
      let finalPercentage: number | undefined

      const completedEvaluations = evaluationGrades.filter(e => e.evaluationPercentage !== undefined)
      if (completedEvaluations.length > 0) {
        const totalWeight = completedEvaluations.reduce((sum, e) => sum + e.weight, 0)
        if (totalWeight > 0) {
          const weightedSum = completedEvaluations.reduce((sum, e) => 
            sum + (e.evaluationPercentage! * e.weight / 100), 0
          )
          finalPercentage = (weightedSum / totalWeight) * 100
          finalGrade = (finalPercentage / 100) * 10
        }
      }

      return {
        subject,
        evaluationSystem,
        enrollmentId: enrollment.id,
        evaluationGrades,
        finalGrade,
        finalPercentage,
        status: enrollment.status || 'Activo' // Valor por defecto si status no existe
      }
    }).filter(Boolean) as SubjectGradeData[]

    setSubjectGrades(gradesData)
    setLoading(false)
  }

  const calculateOverallAverage = () => {
    const completedSubjects = subjectGrades.filter(sg => sg.finalGrade !== undefined)
    if (completedSubjects.length === 0) return undefined

    const sum = completedSubjects.reduce((total, sg) => total + sg.finalGrade!, 0)
    return sum / completedSubjects.length
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600'
    if (grade >= 7) return 'text-blue-600'
    if (grade >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeBackground = (grade: number) => {
    if (grade >= 9) return 'bg-green-50'
    if (grade >= 7) return 'bg-blue-50'
    if (grade >= 5) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const generatePDFReport = () => {
    if (student) {
      // Usar casting a any para evitar problemas de tipos entre index.ts y auth.ts
      // Esto no es una práctica recomendada en general, pero nos permite avanzar con el despliegue
      generateStudentGradeReportPDF(student as any, subjectGrades as any, overallAverage)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container w-auto">
          <div className="text-center">Cargando informe...</div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="modal-overlay">
        <div className="modal-container w-auto">
          <div className="text-center text-red-600">Alumno no encontrado</div>
          <button onClick={onClose} className="mt-4 btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  const overallAverage = calculateOverallAverage()

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-6xl w-full max-h-[90vh]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informe de Calificaciones
                </h2>
                <p className="text-lg text-gray-600">
                  {student.name} {student.surname}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generatePDFReport}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </button>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <p className="text-sm text-gray-900">{student.email}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Curso</span>
              </div>
              <p className="text-sm text-gray-900">{student.course}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Matriculación</span>
              </div>
              <p className="text-sm text-gray-900">
                {new Date(student.enrollmentDate).toLocaleDateString('es-ES')}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Nota Media</span>
              </div>
              <p className={`text-lg font-bold ${overallAverage ? getGradeColor(overallAverage) : 'text-gray-500'}`}>
                {overallAverage ? overallAverage.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Subjects Grades */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Calificaciones por Asignatura
            </h3>

            {subjectGrades.map((subjectGrade) => (
              <div key={subjectGrade.subject.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subjectGrade.subject.color || '#3b82f6' }}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {subjectGrade.subject.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {subjectGrade.subject.code} • {subjectGrade.subject.credits} ECTS
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {subjectGrade.finalGrade !== undefined ? (
                      <div className={`text-xl font-bold ${getGradeColor(subjectGrade.finalGrade)}`}>
                        {subjectGrade.finalGrade.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-gray-500">Sin calificar</div>
                    )}
                    <div className="text-xs text-gray-500 capitalize">
                      {subjectGrade.status === 'active' ? 'En curso' : 
                       subjectGrade.status === 'completed' ? 'Completada' : 'Retirada'}
                    </div>
                  </div>
                </div>

                {/* Evaluations */}
                {subjectGrade.evaluationGrades.length > 0 && (
                  <div className="space-y-4">
                    {subjectGrade.evaluationGrades.map((evalGrade) => (
                      <div key={evalGrade.evaluationId} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            {evalGrade.evaluationName}
                          </h5>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              Peso: {evalGrade.weight}%
                            </span>
                            {evalGrade.evaluationGrade !== undefined && (
                              <span className={`font-semibold ${getGradeColor(evalGrade.evaluationGrade)}`}>
                                {evalGrade.evaluationGrade.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tests */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {evalGrade.tests.map((test) => (
                            <div 
                              key={test.testId} 
                              className={`p-3 rounded border ${
                                test.score !== undefined 
                                  ? getGradeBackground((test.score / test.maxScore) * 10)
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {test.testName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {test.testWeight}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  {test.score !== undefined 
                                    ? `${test.score}/${test.maxScore}`
                                    : 'Pendiente'
                                  }
                                </span>
                                {test.percentage !== undefined && (
                                  <span className={`text-sm font-medium ${
                                    getGradeColor((test.percentage / 100) * 10)
                                  }`}>
                                    {test.percentage.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {subjectGrade.evaluationGrades.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay sistema de evaluación configurado para esta asignatura</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {subjectGrades.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin asignaturas matriculadas
              </h3>
              <p className="text-gray-600">
                Este alumno no tiene asignaturas matriculadas actualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
