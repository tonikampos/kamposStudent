'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, BookOpen, Calendar, Clock, Target, ChevronRight, ChevronDown, Settings } from 'lucide-react'
import { Subject, EvaluationSystem, SubjectEvaluation, EvaluationTest } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { getSubjects, getEvaluationSystems, saveEvaluationSystems } from '@/lib/userDataManager'

export default function EvaluationSystemManagement() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [evaluationSystems, setEvaluationSystems] = useState<EvaluationSystem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('todos')
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set())
  const [editingSystem, setEditingSystem] = useState<EvaluationSystem | null>(null)
  const [showSystemForm, setShowSystemForm] = useState(false)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos
  useEffect(() => {
    if (user) {
      setSubjects(getSubjects())
      setEvaluationSystems(getEvaluationSystems())
    }
  }, [user])

  const courses = ['DAM 1', 'DAM 2', 'DAW 1', 'DAW 2', 'ASIR 1', 'ASIR 2']

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === 'todos' || subject.course === selectedCourse
    return matchesSearch && matchesCourse && subject.isActive
  })

  const toggleSubjectExpansion = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const getSubjectEvaluationSystem = (subjectId: number): EvaluationSystem | null => {
    return evaluationSystems.find(system => system.subjectId === subjectId) || null
  }

  // Función para determinar el estado de configuración de una asignatura
  const getSubjectConfigurationStatus = (subject: Subject): 'complete' | 'partial' | 'none' => {
    const evaluationSystem = getSubjectEvaluationSystem(subject.id)
    
    if (!evaluationSystem) {
      return 'none'
    }

    // Verificar que el número de evaluaciones coincida con lo definido en la materia
    if (evaluationSystem.evaluations.length !== subject.numberOfEvaluations) {
      return 'partial'
    }

    // Verificar que todas las evaluaciones tengan al menos una prueba configurada
    const allEvaluationsHaveTests = evaluationSystem.evaluations.every((evaluation: SubjectEvaluation) => 
      evaluation.tests && evaluation.tests.length > 0
    )

    // Verificar que el peso total de las evaluaciones sume 100%
    const totalWeight = evaluationSystem.evaluations.reduce((total: number, evaluation: SubjectEvaluation) => total + evaluation.weight, 0)
    const weightIsCorrect = Math.abs(totalWeight - 100) < 0.01

    // Verificar que en cada evaluación las pruebas sumen 100%
    const allTestWeightsCorrect = evaluationSystem.evaluations.every((evaluation: SubjectEvaluation) => {
      if (evaluation.tests.length === 0) return false
      const testWeight = evaluation.tests.reduce((total: number, test: EvaluationTest) => total + test.weight, 0)
      return Math.abs(testWeight - 100) < 0.01
    })

    if (allEvaluationsHaveTests && weightIsCorrect && allTestWeightsCorrect) {
      return 'complete'
    } else {
      return 'partial'
    }
  }

  const handleCreateEvaluationSystem = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId)
    if (!subject) return

    // Verificar si ya existe un sistema de evaluación
    const existingSystem = getSubjectEvaluationSystem(subjectId)
    if (existingSystem) {
      // Si ya existe, editarlo en lugar de crear uno nuevo
      handleEditEvaluationSystem(existingSystem)
      return
    }

    // Crear nuevo sistema solo si no existe
    const numberOfEvaluations = subject.numberOfEvaluations

    const evaluationNames = ['1ª Evaluación', '2ª Evaluación', '3ª Evaluación']
    const dateRanges = [
      { start: '2024-09-16', end: '2024-12-20' },
      { start: '2025-01-08', end: '2025-03-28' },
      { start: '2025-04-08', end: '2025-06-20' }
    ]

    const defaultWeights = {
      1: [100],
      2: [50, 50],
      3: [33.33, 33.33, 33.34]
    }

    const weights = defaultWeights[numberOfEvaluations]
    const evaluations: SubjectEvaluation[] = []

    for (let i = 0; i < numberOfEvaluations; i++) {
      evaluations.push({
        id: i + 1,
        evaluationSystemId: 0, // Se actualizará después
        name: evaluationNames[i],
        description: `${evaluationNames[i]} del curso`,
        startDate: dateRanges[i].start,
        endDate: dateRanges[i].end,
        weight: weights[i],
        order: i + 1,
        tests: [],
        isActive: true
      })
    }

    const newSystem: EvaluationSystem = {
      id: Math.max(...evaluationSystems.map(s => s.id), 0) + 1,
      userId: user.id,
      subjectId,
      numberOfEvaluations,
      evaluations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Actualizar los IDs de evaluationSystemId
    newSystem.evaluations = newSystem.evaluations.map(evaluation => ({
      ...evaluation,
      evaluationSystemId: newSystem.id
    }))

    setEditingSystem(newSystem)
    setShowSystemForm(true)
  }

  const handleEditEvaluationSystem = (system: EvaluationSystem) => {
    setEditingSystem(system)
    setShowSystemForm(true)
  }

  const getTotalWeight = (evaluations: SubjectEvaluation[]): number => {
    return evaluations.reduce((total, evaluation) => total + evaluation.weight, 0)
  }

  const getEvaluationTestsTotal = (tests: EvaluationTest[]): number => {
    return tests.reduce((total, test) => total + test.weight, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Evaluaciones</h2>
          <div className="text-sm text-gray-600">
            Configura evaluaciones y pruebas para cada asignatura
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Asignaturas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredSubjects.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Completamente Configuradas</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {filteredSubjects.filter(s => getSubjectConfigurationStatus(s) === 'complete').length}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Parcialmente Configuradas</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {filteredSubjects.filter(s => getSubjectConfigurationStatus(s) === 'partial').length}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Evaluaciones</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {filteredSubjects.reduce((total, subject) => total + subject.numberOfEvaluations, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {filteredSubjects.map((subject) => {
          const evaluationSystem = getSubjectEvaluationSystem(subject.id)
          const isExpanded = expandedSubjects.has(subject.id)

          return (
            <div key={subject.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSubjectExpansion(subject.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  
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
                  {(() => {
                    const configurationStatus = getSubjectConfigurationStatus(subject)
                    const evaluationSystem = getSubjectEvaluationSystem(subject.id)
                    
                    switch (configurationStatus) {
                      case 'complete':
                        return (
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-700">
                              Sistema configurado
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.numberOfEvaluations} evaluación{subject.numberOfEvaluations > 1 ? 'es' : ''} completa{subject.numberOfEvaluations > 1 ? 's' : ''}
                            </div>
                          </div>
                        )
                      case 'partial':
                        return (
                          <div className="text-right">
                            <div className="text-sm font-medium text-orange-700">
                              Parcialmente configurado
                            </div>
                            <div className="text-xs text-gray-500">
                              Faltan pruebas o ajustar pesos
                            </div>
                          </div>
                        )
                      default:
                        return (
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-700">
                              Sin configurar
                            </div>
                            <div className="text-xs text-gray-500">
                              Crea el sistema de evaluación
                            </div>
                          </div>
                        )
                    }
                  })()}

                  <button
                    onClick={() => {
                      const evaluationSystem = getSubjectEvaluationSystem(subject.id)
                      if (evaluationSystem) {
                        handleEditEvaluationSystem(evaluationSystem)
                      } else {
                        handleCreateEvaluationSystem(subject.id)
                      }
                    }}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {getSubjectEvaluationSystem(subject.id) ? 'Configurar' : 'Crear Sistema'}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && evaluationSystem && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    {evaluationSystem.evaluations.map((evaluation: SubjectEvaluation, index: number) => (
                      <div key={evaluation.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {evaluation.name}
                          </h4>
                          <span className="text-sm font-medium text-blue-600">
                            {evaluation.weight}% de la nota final
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Período:</span> {' '}
                            {new Date(evaluation.startDate).toLocaleDateString('es-ES')} - {' '}
                            {new Date(evaluation.endDate).toLocaleDateString('es-ES')}
                          </div>
                          <div>
                            <span className="font-medium">Pruebas:</span> {evaluation.tests.length}
                          </div>
                        </div>

                        {evaluation.tests.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-2">Pruebas configuradas:</div>
                            <div className="space-y-1">
                              {evaluation.tests.map((test: EvaluationTest) => (
                                <div key={test.id} className="flex items-center justify-between text-xs">
                                  <span>{test.name} ({test.type})</span>
                                  <span className="font-medium">{test.weight}%</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs">
                              <span className={`font-medium ${
                                getEvaluationTestsTotal(evaluation.tests) === 100 
                                  ? 'text-green-600' 
                                  : 'text-orange-600'
                              }`}>
                                Total: {getEvaluationTestsTotal(evaluation.tests)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="text-sm text-gray-600 text-center">
                      <span className={`font-medium ${
                        getTotalWeight(evaluationSystem.evaluations) === 100 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        Peso total de evaluaciones: {getTotalWeight(evaluationSystem.evaluations).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Evaluation System Form Modal */}
      {showSystemForm && editingSystem && (
        <EvaluationSystemForm
          system={editingSystem}
          subject={subjects.find(s => s.id === editingSystem.subjectId)!}
          onSave={(system) => {
            const currentSystems = getEvaluationSystems()
            let updatedSystems
            
            // Verificar si el sistema ya existe en la base de datos
            const existingSystemIndex = currentSystems.findIndex(s => s.id === system.id)
            
            if (existingSystemIndex >= 0) {
              // Actualizar sistema existente
              updatedSystems = currentSystems.map(s => 
                s.id === system.id ? system : s
              )
            } else {
              // Agregar nuevo sistema
              updatedSystems = [...currentSystems, system]
            }
            
            saveEvaluationSystems(updatedSystems)
            setEvaluationSystems(updatedSystems)
            setShowSystemForm(false)
            setEditingSystem(null)
          }}
          onCancel={() => {
            setShowSystemForm(false)
            setEditingSystem(null)
          }}
        />
      )}
    </div>
  )
}

// Componente para el formulario de sistema de evaluación
interface EvaluationSystemFormProps {
  system: EvaluationSystem
  subject: Subject
  onSave: (system: EvaluationSystem) => void
  onCancel: () => void
}

function EvaluationSystemForm({ system, subject, onSave, onCancel }: EvaluationSystemFormProps) {
  const [formData, setFormData] = useState<EvaluationSystem>(system)
  const [activeTab, setActiveTab] = useState(0)

  // El número de evaluaciones ya no es editable, se toma de la materia
  const numberOfEvaluations = subject.numberOfEvaluations

  const updateEvaluation = (index: number, updates: Partial<SubjectEvaluation>) => {
    setFormData(prevFormData => {
      const newEvaluations = prevFormData.evaluations.map((evaluation, i) => 
        i === index ? { ...evaluation, ...updates } : evaluation
      )
      
      return {
        ...prevFormData,
        evaluations: newEvaluations
      }
    })
  }

  const addTest = (evaluationIndex: number) => {
    setFormData(prevFormData => {
      const evaluation = prevFormData.evaluations[evaluationIndex]
      
      const newTest: EvaluationTest = {
        id: Math.max(...evaluation.tests.map(t => t.id), 0) + 1,
        subjectEvaluationId: evaluation.id,
        name: 'Nueva Prueba',
        description: '',
        type: 'exam',
        weight: 0,
        maxGrade: 10,
        minPassingGrade: 5,
        isActive: true
      }

      const newTests = [...evaluation.tests, newTest]
      
      const newEvaluations = prevFormData.evaluations.map((evaluation, i) => 
        i === evaluationIndex ? { ...evaluation, tests: newTests } : evaluation
      )
      
      return {
        ...prevFormData,
        evaluations: newEvaluations
      }
    })
  }

  const updateTest = (evaluationIndex: number, testIndex: number, updates: Partial<EvaluationTest>) => {
    setFormData(prevFormData => {
      const evaluation = prevFormData.evaluations[evaluationIndex]
      const newTests = evaluation.tests.map((test, i) => 
        i === testIndex ? { ...test, ...updates } : test
      )
      
      const newEvaluations = prevFormData.evaluations.map((evaluation, i) => 
        i === evaluationIndex ? { ...evaluation, tests: newTests } : evaluation
      )
      
      return {
        ...prevFormData,
        evaluations: newEvaluations
      }
    })
  }

  const removeTest = (evaluationIndex: number, testIndex: number) => {
    setFormData(prevFormData => {
      const evaluation = prevFormData.evaluations[evaluationIndex]
      const newTests = evaluation.tests.filter((_, i) => i !== testIndex)
      
      const newEvaluations = prevFormData.evaluations.map((evaluation, i) => 
        i === evaluationIndex ? { ...evaluation, tests: newTests } : evaluation
      )
      
      return {
        ...prevFormData,
        evaluations: newEvaluations
      }
    })
  }

  const handleSave = () => {
    const updatedSystem = {
      ...formData,
      updatedAt: new Date().toISOString()
    }
    onSave(updatedSystem)
  }

  const getTotalWeight = () => {
    return formData.evaluations.reduce((total, evaluation) => total + evaluation.weight, 0)
  }

  const getTestsTotal = (tests: EvaluationTest[]) => {
    return tests.reduce((total, test) => total + test.weight, 0)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-4xl w-full max-h-[90vh]">
        <div className="modal-header-sticky">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                Sistema de Evaluación - {subject.name}
              </h3>
              <p className="text-sm text-gray-600">{subject.code} • {subject.course}</p>
            </div>
          </div>
        </div>

        <div className="modal-content">
          {/* Información de evaluaciones (no editable) */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Configuración de Evaluaciones
                </h4>
                <p className="text-sm text-blue-600">
                  Esta materia tiene {numberOfEvaluations} evaluación{numberOfEvaluations > 1 ? 'es' : ''} configurada{numberOfEvaluations > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {numberOfEvaluations}
              </div>
            </div>
          </div>

          {/* Tabs de Evaluaciones */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {formData.evaluations.map((evaluation, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {evaluation.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido de la evaluación activa */}
          {formData.evaluations[activeTab] && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.evaluations[activeTab].name}
                    onChange={(e) => updateEvaluation(activeTab, { name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso en nota final (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="input-field"
                    value={formData.evaluations[activeTab].weight}
                    onChange={(e) => updateEvaluation(activeTab, { weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.evaluations[activeTab].startDate}
                    onChange={(e) => updateEvaluation(activeTab, { startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.evaluations[activeTab].endDate}
                    onChange={(e) => updateEvaluation(activeTab, { endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.evaluations[activeTab].description}
                  onChange={(e) => updateEvaluation(activeTab, { description: e.target.value })}
                />
              </div>

              {/* Pruebas de la evaluación */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium">Pruebas de Evaluación</h4>
                  <button
                    onClick={() => addTest(activeTab)}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Prueba
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.evaluations[activeTab]?.tests?.map((test, testIndex) => (
                    <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la prueba
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={test.name}
                            onChange={(e) => updateTest(activeTab, testIndex, { name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            className="input-field"
                            value={test.type}
                            onChange={(e) => updateTest(activeTab, testIndex, { 
                              type: e.target.value as EvaluationTest['type'] 
                            })}
                          >
                            <option value="exam">Examen</option>
                            <option value="project">Proyecto</option>
                            <option value="homework">Tarea</option>
                            <option value="presentation">Presentación</option>
                            <option value="practice">Práctica</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso (%)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="input-field"
                              value={test.weight}
                              onChange={(e) => updateTest(activeTab, testIndex, { weight: parseFloat(e.target.value) || 0 })}
                            />
                            <button
                              onClick={() => removeTest(activeTab, testIndex)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={test.description || ''}
                            onChange={(e) => updateTest(activeTab, testIndex, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.evaluations[activeTab].tests.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Total peso de pruebas: </span>
                      <span className={`font-medium ${
                        getTestsTotal(formData.evaluations[activeTab].tests) === 100 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        {getTestsTotal(formData.evaluations[activeTab].tests)}%
                      </span>
                      {getTestsTotal(formData.evaluations[activeTab].tests) !== 100 && (
                        <span className="text-orange-600 ml-2">
                          (debe sumar 100%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumen total */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Peso total de evaluaciones: </span>
              <span className={`font-medium ${
                getTotalWeight() === 100 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {getTotalWeight().toFixed(2)}%
              </span>
              {getTotalWeight() !== 100 && (
                <span className="text-orange-600 ml-2">
                  (debe sumar 100%)
                </span>
              )}
            </div>
          </div>

          {/* Validación y información */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">Estado del Sistema:</p>
              <p className="text-gray-600">
                Peso total de evaluaciones: <strong>{getTotalWeight().toFixed(2)}%</strong>
                {getTotalWeight() !== 100 && (
                  <span className="text-red-600 ml-2">
                    (Debe sumar exactamente 100%)
                  </span>
                )}
              </p>
              <p className="text-gray-600 mt-1">
                Evaluaciones configuradas: <strong>{formData.evaluations.length}</strong>
              </p>
              <p className="text-gray-600 mt-1">
                Total de pruebas: <strong>{formData.evaluations.reduce((total, ev) => total + ev.tests.length, 0)}</strong>
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="modal-footer-sticky">
            <div className="flex gap-2">
              <button 
                onClick={handleSave} 
                className={`flex-1 ${
                  getTotalWeight() !== 100 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
                disabled={getTotalWeight() !== 100}
                title={getTotalWeight() !== 100 ? `El peso total debe ser 100%, actualmente es ${getTotalWeight().toFixed(2)}%` : ''}
              >
                {getTotalWeight() !== 100 
                  ? `No se puede guardar (${getTotalWeight().toFixed(2)}% ≠ 100%)` 
                  : 'Guardar Sistema'
                }
              </button>
              <button onClick={onCancel} className="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
