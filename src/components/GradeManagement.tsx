'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Save, X, User, BookOpen, Target, Users, ChevronDown, ChevronRight } from 'lucide-react'
import { Student, Subject, EvaluationSystem, SubjectEvaluation, EvaluationTest, TestScore } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { 
  getStudents, 
  getSubjects, 
  getEnrollments, 
  getEvaluationSystems,
  saveTestScores,
  getTestScores
} from '@/lib/userDataManager'

export default function GradeManagement() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [evaluationSystems, setEvaluationSystems] = useState<EvaluationSystem[]>([])
  const [testScores, setTestScores] = useState<TestScore[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos
  useEffect(() => {
    if (user) {
      setSubjects(getSubjects())
      setStudents(getStudents())
      setEvaluationSystems(getEvaluationSystems())
      setTestScores(getTestScores())
    }
  }, [user])

  // Actualizar lista de estudiantes matriculados cuando cambia la asignatura
  useEffect(() => {
    if (selectedSubject) {
      const enrollments = getEnrollments()
      const subjectEnrollments = enrollments.filter(e => e.subjectId === selectedSubject && e.isActive)
      const matriculatedStudents = students.filter(student => 
        subjectEnrollments.some(e => e.studentId === student.id) && student.isActive
      )
      setEnrolledStudents(matriculatedStudents)
    } else {
      setEnrolledStudents([])
    }
  }, [selectedSubject, students])

  // Obtener sistema de evaluación de una materia
  const getSubjectEvaluationSystem = (subjectId: number): EvaluationSystem | null => {
    return evaluationSystems.find(system => system.subjectId === subjectId) || null
  }

  // Obtener nota de una prueba específica
  const getTestScore = (studentId: number, testId: number): TestScore | null => {
    return testScores.find(score => 
      score.studentId === studentId && score.testId === testId
    ) || null
  }

  // Guardar o actualizar nota de una prueba
  const saveTestScore = (studentId: number, testId: number, evaluationId: number, score: number, comments?: string) => {
    const existingScore = getTestScore(studentId, testId)
    const currentScores = getTestScores()
    
    if (existingScore) {
      // Actualizar nota existente
      const updatedScores = currentScores.map(s => 
        s.id === existingScore.id 
          ? { ...s, score, comments: comments || '', date: new Date().toISOString().split('T')[0] }
          : s
      )
      saveTestScores(updatedScores)
      setTestScores(updatedScores)
    } else {
      // Crear nueva nota
      const newScore: TestScore = {
        id: Math.max(...currentScores.map(s => s.id), 0) + 1,
        userId: user.id,
        studentId,
        testId,
        evaluationId,
        score,
        maxScore: 10, // Valor por defecto
        date: new Date().toISOString().split('T')[0],
        comments: comments || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const updatedScores = [...currentScores, newScore]
      saveTestScores(updatedScores)
      setTestScores(updatedScores)
    }
  }

  // Obtener materia seleccionada
  const selectedSubjectData = selectedSubject ? subjects.find(s => s.id === selectedSubject) : null
  
  // Obtener sistema de evaluación de la materia seleccionada
  const selectedEvaluationSystem = selectedSubject ? getSubjectEvaluationSystem(selectedSubject) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Notas</h2>
        <p className="text-gray-600 mb-4">
          Selecciona una asignatura para ver los alumnos matriculados y gestionar sus notas.
        </p>
      </div>

      {/* Selección de Asignatura */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Asignatura</h3>
        
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <BookOpen className="inline h-4 w-4 mr-1" />
            Asignatura
          </label>
          <select
            className="input-field"
            value={selectedSubject || ''}
            onChange={(e) => {
              const subjectId = e.target.value ? parseInt(e.target.value) : null
              setSelectedSubject(subjectId)
              setExpandedStudent(null)
            }}
          >
            <option value="">Seleccionar asignatura</option>
            {subjects.filter(s => s.isActive).map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Alumnos Matriculados */}
      {selectedSubjectData && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Alumnos matriculados en {selectedSubjectData.name}
              </h3>
              {selectedEvaluationSystem && (
                <p className="text-sm text-gray-600 mt-1">
                  Sistema con {selectedEvaluationSystem.evaluations.length} evaluación{selectedEvaluationSystem.evaluations.length !== 1 ? 'es' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {selectedEvaluationSystem && (
                <div className="hidden sm:flex gap-2">
                  {selectedEvaluationSystem.evaluations.map((evaluation, index) => (
                    <div key={evaluation.id} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                      {index === 0 ? '1ª' : index === 1 ? '2ª' : '3ª'} Aval. ({evaluation.weight}%)
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-700">Total: </span>
                <span className="font-bold text-blue-900">{enrolledStudents.length}</span>
              </div>
            </div>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay alumnos matriculados
              </h3>
              <p className="text-gray-600">
                Esta asignatura no tiene alumnos matriculados todavía.
              </p>
            </div>
          ) : !selectedEvaluationSystem ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sistema de evaluación no configurado
              </h3>
              <p className="text-gray-600">
                Configura el sistema de evaluación para esta asignatura antes de asignar notas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledStudents.map(student => (
                <StudentGradeCard
                  key={student.id}
                  student={student}
                  subject={selectedSubjectData}
                  evaluationSystem={selectedEvaluationSystem}
                  testScores={testScores}
                  isExpanded={expandedStudent === student.id}
                  onToggleExpand={() => setExpandedStudent(
                    expandedStudent === student.id ? null : student.id
                  )}
                  onSaveScore={saveTestScore}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensaje cuando no hay selección */}
      {!selectedSubject && (
        <div className="card bg-gray-50">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una asignatura
            </h3>
            <p className="text-gray-600">
              Para comenzar a gestionar notas, selecciona una asignatura de la lista.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para la tarjeta de notas de un estudiante
interface StudentGradeCardProps {
  student: Student
  subject: Subject
  evaluationSystem: EvaluationSystem
  testScores: TestScore[]
  isExpanded: boolean
  onToggleExpand: () => void
  onSaveScore: (studentId: number, testId: number, evaluationId: number, score: number, comments?: string) => void
}

function StudentGradeCard({ 
  student, 
  subject, 
  evaluationSystem, 
  testScores, 
  isExpanded, 
  onToggleExpand,
  onSaveScore 
}: StudentGradeCardProps) {
  const [editingTest, setEditingTest] = useState<number | null>(null)
  const [tempScore, setTempScore] = useState<number>(0)
  const [tempComments, setTempComments] = useState<string>('')

  const getTestScore = (testId: number): TestScore | null => {
    return testScores.find(score => 
      score.studentId === student.id && score.testId === testId
    ) || null
  }

  const handleEditTest = (test: EvaluationTest) => {
    const existingScore = getTestScore(test.id)
    setEditingTest(test.id)
    setTempScore(existingScore?.score || 0)
    setTempComments(existingScore?.comments || '')
  }

  const handleSaveTest = (test: EvaluationTest, evaluationId: number) => {
    onSaveScore(student.id, test.id, evaluationId, tempScore, tempComments)
    setEditingTest(null)
    setTempScore(0)
    setTempComments('')
  }

  const handleCancelEdit = () => {
    setEditingTest(null)
    setTempScore(0)
    setTempComments('')
  }

  const getGradeColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 10
    if (percentage >= 9) return 'text-green-600 bg-green-100'
    if (percentage >= 7) return 'text-blue-600 bg-blue-100'
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Calcular nota media de una evaluación específica
  const calculateEvaluationAverage = (evaluation: SubjectEvaluation): number => {
    const evalScores = evaluation.tests.map(test => getTestScore(test.id)).filter(Boolean) as TestScore[]
    if (evalScores.length === 0) return 0
    
    const weightedSum = evalScores.reduce((sum, score) => {
      const test = evaluation.tests.find(t => t.id === score.testId)
      return sum + (score.score * (test?.weight || 0) / 100)
    }, 0)
    
    const totalWeight = evalScores.reduce((sum, score) => {
      const test = evaluation.tests.find(t => t.id === score.testId)
      return sum + (test?.weight || 0)
    }, 0)
    
    return totalWeight > 0 ? (weightedSum * 100) / totalWeight : 0
  }

  // Obtener progreso de una evaluación (cuántas pruebas están evaluadas)
  const getEvaluationProgress = (evaluation: SubjectEvaluation): { completed: number, total: number } => {
    const completedTests = evaluation.tests.filter(test => getTestScore(test.id) !== null).length
    return { completed: completedTests, total: evaluation.tests.length }
  }

  // Calcular nota media general del estudiante
  const calculateOverallAverage = (): number => {
    const studentScores = evaluationSystem.evaluations.map(evaluation => {
      const evalScores = evaluation.tests.map(test => getTestScore(test.id)).filter(Boolean) as TestScore[]
      if (evalScores.length === 0) return 0
      
      const weightedSum = evalScores.reduce((sum, score) => {
        const test = evaluation.tests.find(t => t.id === score.testId)
        return sum + (score.score * (test?.weight || 0) / 100)
      }, 0)
      
      const totalWeight = evalScores.reduce((sum, score) => {
        const test = evaluation.tests.find(t => t.id === score.testId)
        return sum + (test?.weight || 0)
      }, 0)
      
      return totalWeight > 0 ? (weightedSum * 100) / totalWeight : 0
    })

    const validScores = studentScores.filter(score => score > 0)
    if (validScores.length === 0) return 0

    const weightedAverage = validScores.reduce((sum, score, index) => {
      const evaluation = evaluationSystem.evaluations[index]
      return sum + (score * evaluation.weight / 100)
    }, 0)

    return weightedAverage
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header del estudiante */}
      <div 
        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-gray-400">
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {student.name} {student.surname}
              </h4>
              <p className="text-sm text-gray-600">{student.email}</p>
            </div>
            
            {/* Notas por evaluación */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              {evaluationSystem.evaluations.map((evaluation, index) => {
                const evaluationAverage = calculateEvaluationAverage(evaluation)
                const evaluationColor = evaluationAverage >= 9 ? 'text-green-600 bg-green-100' : 
                                       evaluationAverage >= 7 ? 'text-blue-600 bg-blue-100' : 
                                       evaluationAverage >= 5 ? 'text-yellow-600 bg-yellow-100' : 
                                       evaluationAverage > 0 ? 'text-red-600 bg-red-100' : 'text-gray-400 bg-gray-100'
                
                return (
                  <div key={evaluation.id} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {index === 0 ? '1ª Aval.' : index === 1 ? '2ª Aval.' : '3ª Aval.'}
                    </p>
                    <span className={`px-2 py-1 text-sm font-semibold rounded-full ${evaluationColor}`}>
                      {evaluationAverage > 0 ? evaluationAverage.toFixed(1) : '--'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Media Final</p>
            <p className="text-lg font-bold text-gray-900">
              {calculateOverallAverage().toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Versión móvil de las notas por evaluación */}
        <div className="md:hidden mt-3 flex justify-center gap-3">
          {evaluationSystem.evaluations.map((evaluation, index) => {
            const evaluationAverage = calculateEvaluationAverage(evaluation)
            const evaluationColor = evaluationAverage >= 9 ? 'text-green-600 bg-green-100' : 
                                   evaluationAverage >= 7 ? 'text-blue-600 bg-blue-100' : 
                                   evaluationAverage >= 5 ? 'text-yellow-600 bg-yellow-100' : 
                                   evaluationAverage > 0 ? 'text-red-600 bg-red-100' : 'text-gray-400 bg-gray-100'
            
            return (
              <div key={evaluation.id} className="text-center">
                <p className="text-xs text-gray-500 mb-1">
                  {index === 0 ? '1ª Aval.' : index === 1 ? '2ª Aval.' : '3ª Aval.'}
                </p>
                <span className={`px-2 py-1 text-sm font-semibold rounded-full ${evaluationColor}`}>
                  {evaluationAverage > 0 ? evaluationAverage.toFixed(1) : '--'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {evaluationSystem.evaluations.map(evaluation => {
            const evaluationAverage = calculateEvaluationAverage(evaluation)
            const progress = getEvaluationProgress(evaluation)
            const evaluationColor = evaluationAverage >= 9 ? 'text-green-600' : 
                                   evaluationAverage >= 7 ? 'text-blue-600' : 
                                   evaluationAverage >= 5 ? 'text-yellow-600' : 
                                   evaluationAverage > 0 ? 'text-red-600' : 'text-gray-400'

            return (
              <div key={evaluation.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {evaluation.name} ({evaluation.weight}%)
                    </h5>
                    <p className="text-xs text-gray-500">
                      {progress.completed}/{progress.total} pruebas evaluadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Nota evaluación</p>
                    <p className={`text-lg font-bold ${evaluationColor}`}>
                      {evaluationAverage > 0 ? evaluationAverage.toFixed(2) : '--'}
                    </p>
                  </div>
                </div>
                
                {/* Barra de progreso de la evaluación */}
                {evaluationAverage > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          evaluationAverage >= 9 ? 'bg-green-500' : 
                          evaluationAverage >= 7 ? 'bg-blue-500' : 
                          evaluationAverage >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((evaluationAverage / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              
              {evaluation.tests.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay pruebas configuradas</p>
              ) : (
                <div className="grid gap-3">
                  {evaluation.tests.map(test => {
                    const existingScore = getTestScore(test.id)
                    const isEditing = editingTest === test.id

                    return (
                      <div key={test.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-800">{test.name}</h6>
                            {test.description && (
                              <p className="text-sm text-gray-600">{test.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Peso: {test.weight}% • Máx: {test.maxGrade}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={test.maxGrade}
                                  step="0.1"
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  value={tempScore}
                                  onChange={(e) => setTempScore(parseFloat(e.target.value) || 0)}
                                />
                                <input
                                  type="text"
                                  className="w-32 px-2 py-1 border rounded text-sm"
                                  placeholder="Comentarios..."
                                  value={tempComments}
                                  onChange={(e) => setTempComments(e.target.value)}
                                />
                                <button
                                  onClick={() => handleSaveTest(test, evaluation.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {existingScore ? (
                                  <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getGradeColor(existingScore.score, test.maxGrade)}`}>
                                    {existingScore.score.toFixed(1)} / {test.maxGrade}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">Sin nota</span>
                                )}
                                <button
                                  onClick={() => handleEditTest(test)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {existingScore?.comments && !isEditing && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Comentarios:</strong> {existingScore.comments}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Componente para la tabla de pruebas y notas (mantenido por compatibilidad)
interface TestScoresTableProps {
  student: Student
  subject: Subject
  evaluation: SubjectEvaluation
  testScores: TestScore[]
  onSaveScore: (studentId: number, testId: number, evaluationId: number, score: number, comments?: string) => void
}

function TestScoresTable({ student, subject, evaluation, testScores, onSaveScore }: TestScoresTableProps) {
  const [editingTest, setEditingTest] = useState<number | null>(null)
  const [tempScore, setTempScore] = useState<number>(0)
  const [tempComments, setTempComments] = useState<string>('')

  const getTestScore = (testId: number): TestScore | null => {
    return testScores.find(score => 
      score.studentId === student.id && score.testId === testId
    ) || null
  }

  const handleEditTest = (test: EvaluationTest) => {
    const existingScore = getTestScore(test.id)
    setEditingTest(test.id)
    setTempScore(existingScore?.score || 0)
    setTempComments(existingScore?.comments || '')
  }

  const handleSaveTest = (test: EvaluationTest) => {
    onSaveScore(student.id, test.id, evaluation.id, tempScore, tempComments)
    setEditingTest(null)
    setTempScore(0)
    setTempComments('')
  }

  const handleCancelEdit = () => {
    setEditingTest(null)
    setTempScore(0)
    setTempComments('')
  }

  const getGradeColor = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 10
    if (percentage >= 9) return 'text-green-600 bg-green-100'
    if (percentage >= 7) return 'text-blue-600 bg-blue-100'
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Calcular nota media de la evaluación
  const calculateEvaluationAverage = (): number => {
    const scores = evaluation.tests.map(test => getTestScore(test.id)).filter(Boolean) as TestScore[]
    if (scores.length === 0) return 0
    
    const weightedSum = scores.reduce((sum, score) => {
      const test = evaluation.tests.find(t => t.id === score.testId)
      return sum + (score.score * (test?.weight || 0) / 100)
    }, 0)
    
    const totalWeight = scores.reduce((sum, score) => {
      const test = evaluation.tests.find(t => t.id === score.testId)
      return sum + (test?.weight || 0)
    }, 0)
    
    return totalWeight > 0 ? (weightedSum * 100) / totalWeight : 0
  }

  if (evaluation.tests.length === 0) {
    return (
      <div className="card bg-yellow-50">
        <div className="text-center py-8">
          <div className="text-yellow-400 mb-4">
            <Target className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            No hay pruebas configuradas
          </h3>
          <p className="text-yellow-700">
            Esta evaluación no tiene pruebas configuradas. Ve a "Sistema de Evaluaciones" para añadir pruebas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Pruebas de {evaluation.name}
        </h3>
        <div className="bg-blue-50 px-3 py-2 rounded-lg">
          <span className="text-sm text-blue-700">Nota media: </span>
          <span className="font-bold text-blue-900">
            {calculateEvaluationAverage().toFixed(2)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prueba
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comentarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluation.tests.map((test) => {
              const existingScore = getTestScore(test.id)
              const isEditing = editingTest === test.id

              return (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {test.name}
                    </div>
                    {test.description && (
                      <div className="text-sm text-gray-500">
                        {test.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {test.type || 'Examen'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {test.weight}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max={test.maxGrade}
                        step="0.1"
                        className="w-20 px-2 py-1 border rounded text-sm"
                        value={tempScore}
                        onChange={(e) => setTempScore(parseFloat(e.target.value) || 0)}
                      />
                    ) : existingScore ? (
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getGradeColor(existingScore.score, test.maxGrade)}`}>
                        {existingScore.score.toFixed(1)} / {test.maxGrade}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin nota</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Comentarios..."
                        value={tempComments}
                        onChange={(e) => setTempComments(e.target.value)}
                      />
                    ) : (
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {existingScore?.comments || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveTest(test)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditTest(test)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
