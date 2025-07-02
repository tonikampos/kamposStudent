'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, BookOpen, Users, Award } from 'lucide-react'
import { Subject } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { getSubjects, addSubject, updateSubject, deleteSubject, getAssignedCenterCourses } from '@/lib/userDataManager'

export default function SubjectManagement() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string>('todos')

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos
  useEffect(() => {
    const loadData = () => {
      if (user) {
        setSubjects(getSubjects())
        // Obtener cursos asignados del centro
        const assignedCourses = getAssignedCenterCourses()
        console.log('[SubjectManagement] Cursos asignados:', assignedCourses)
        
        const courseNames = assignedCourses
          .filter(({ assignment }) => assignment.isActive)
          .map(({ centerCourse, assignment }) => assignment.customName || centerCourse.name)
        
        console.log('[SubjectManagement] Nombres de cursos filtrados:', courseNames)
        setCourses(courseNames)
      }
    }

    loadData()

    // Escuchar cambios en las asignaciones de cursos
    const handleCourseAssignmentsUpdate = () => {
      console.log('[SubjectManagement] Se actualizaron las asignaciones de cursos')
      loadData()
    }

    const handleSubjectsUpdate = () => {
      console.log('[SubjectManagement] Se actualizaron las materias')
      loadData()
    }

    window.addEventListener('teacherCourseAssignmentsUpdated', handleCourseAssignmentsUpdate)
    window.addEventListener('subjectsUpdated', handleSubjectsUpdate)

    return () => {
      window.removeEventListener('teacherCourseAssignmentsUpdated', handleCourseAssignmentsUpdate)
      window.removeEventListener('subjectsUpdated', handleSubjectsUpdate)
    }
  }, [user])

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.course.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = selectedCourse === 'todos' || subject.course === selectedCourse
    
    return matchesSearch && matchesCourse && subject.isActive
  })

  const handleAddSubject = (subjectData: Omit<Subject, 'id' | 'userId'>) => {
    try {
      addSubject(subjectData)
      // Los datos se recargarán automáticamente por el evento 'subjectsUpdated'
      setShowAddForm(false)
    } catch (error) {
      console.error('Error al añadir materia:', error)
      alert('Error al añadir la materia')
    }
  }

  const handleEditSubject = (subjectData: Subject) => {
    try {
      updateSubject(subjectData.id, subjectData)
      // Los datos se recargarán automáticamente por el evento 'subjectsUpdated'
      setEditingSubject(null)
    } catch (error) {
      console.error('Error al editar materia:', error)
      alert('Error al editar la materia')
    }
  }

  const handleDeleteSubject = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignatura?')) {
      try {
        deleteSubject(id)
        // Los datos se recargarán automáticamente por el evento 'subjectsUpdated'
      } catch (error) {
        console.error('Error al eliminar materia:', error)
        alert('Error al eliminar la materia')
      }
    }
  }

  const getTotalCredits = () => {
    return filteredSubjects.reduce((total, subject) => total + subject.credits, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Xestión de Materias</h2>
          <button
            onClick={() => {
              if (courses.length === 0) {
                alert('Primeiro debes crear algún curso antes de poder engadir materias.')
                return
              }
              setShowAddForm(true)
            }}
            className={`btn-primary flex items-center gap-2 ${courses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={courses.length === 0}
          >
            <Plus className="h-4 w-4" />
            Engadir Materia
          </button>
        </div>

        {courses.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Aviso:</strong> Non hai cursos dispoñibles. Primeiro debes crear algún curso na sección de "Xestión de Cursos" antes de poder engadir materias.
            </p>
          </div>
        )}

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

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Asignaturas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredSubjects.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Créditos</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{getTotalCredits()}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Cursos</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {new Set(filteredSubjects.map(s => s.course)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créditos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {subject.color && (
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: subject.color }}
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {subject.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {subject.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subject.course}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.credits} ECTS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {subject.numberOfEvaluations} eval{subject.numberOfEvaluations > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {subject.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Subject Modal */}
      {(showAddForm || editingSubject) && (
        <SubjectForm
          subject={editingSubject}
          availableCourses={courses}
          onSave={editingSubject ? handleEditSubject : handleAddSubject}
          onCancel={() => {
            setShowAddForm(false)
            setEditingSubject(null)
          }}
        />
      )}
    </div>
  )
}

interface SubjectFormProps {
  subject?: Subject | null
  availableCourses: string[]
  onSave: (subject: any) => void
  onCancel: () => void
}

function SubjectForm({ subject, availableCourses, onSave, onCancel }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    code: subject?.code || '',
    course: subject?.course || (availableCourses.length > 0 ? availableCourses[0] : ''),
    credits: subject?.credits || 6,
    color: subject?.color || '#3b82f6',
    description: subject?.description || '',
    numberOfEvaluations: subject?.numberOfEvaluations || 3 as 1 | 2 | 3,
    isActive: subject?.isActive ?? true
  })

  const courses = availableCourses
  const commonColors = [
    '#3b82f6', '#ef4444', '#059669', '#7c3aed', '#ea580c', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f59e0b', '#ec4899', '#64748b', '#6366f1'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (subject) {
      onSave({ ...subject, ...formData })
    } else {
      onSave(formData)
    }
  }

  return (
    <div className="modal-overlay modal-top">
      <div className="modal-container max-w-2xl w-full max-h-[95vh]">
        <div className="modal-header-sticky p-6 pb-3">
          <h3 className="text-lg font-medium">
            {subject ? 'Editar Materia' : 'Engadir Materia'}
          </h3>
        </div>

        <div className="modal-content px-6">
          <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Primera fila - 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Programación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="ej. PRG"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Segunda fila - 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <select
                  className="input-field"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Créditos ECTS
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  className="input-field"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Tercera fila - Color y Evaluaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  className="w-full h-10 rounded border border-gray-300"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Evaluaciones <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  value={formData.numberOfEvaluations}
                  onChange={(e) => setFormData({ ...formData, numberOfEvaluations: parseInt(e.target.value) as 1 | 2 | 3 })}
                  required
                  disabled={!!subject} // No editable si es una materia existente
                >
                  <option value={1}>1 Evaluación</option>
                  <option value={2}>2 Evaluaciones</option>
                  <option value={3}>3 Evaluaciones</option>
                </select>
                {subject && (
                  <p className="text-xs text-gray-500 mt-1">
                    El número de evaluaciones no se puede modificar después de crear la materia
                  </p>
                )}
              </div>
            </div>

            {/* Descripción - ancho completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la asignatura..."
              />
            </div>
          </form>
        </div>

        <div className="modal-footer-sticky p-6 pt-3">
          <div className="flex gap-2">
            <button 
              type="submit" 
              form="subject-form"
              className="btn-primary flex-1"
            >
              {subject ? 'Actualizar' : 'Añadir'}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
