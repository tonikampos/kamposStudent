'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, BookOpen, Users, Award } from 'lucide-react'
import { Subject } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { getSubjects, addSubject, updateSubject, deleteSubject, getAssignedCenterCourses } from '@/lib/userDataManager'
import FullscreenModal from './FullscreenModal'

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

      {/* Add/Edit Subject Form */}
      <FullscreenModal
        isOpen={showAddForm || !!editingSubject}
        onClose={() => {
          setShowAddForm(false)
          setEditingSubject(null)
        }}
        title={editingSubject ? 'Editar Materia' : 'Engadir Materia'}
        subtitle={editingSubject ? 'Modifica los datos de la asignatura' : 'Crea una nueva asignatura para el curso'}
        maxWidth="md"
      >
        <SubjectForm
          subject={editingSubject}
          availableCourses={courses}
          onSave={editingSubject ? handleEditSubject : handleAddSubject}
          onCancel={() => {
            setShowAddForm(false)
            setEditingSubject(null)
          }}
        />
      </FullscreenModal>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Asignatura *
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ej. Programación"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="ej. PRG"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Créditos ECTS *
          </label>
          <input
            type="number"
            required
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Curso *
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          Número de Evaluaciones *
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.numberOfEvaluations}
          onChange={(e) => setFormData({ ...formData, numberOfEvaluations: parseInt(e.target.value) as 1 | 2 | 3 })}
          required
          disabled={!!subject}
        >
          <option value={1}>1 Evaluación</option>
          <option value={2}>2 Evaluaciones</option>
          <option value={3}>3 Evaluaciones</option>
        </select>
        {subject && (
          <p className="text-sm text-gray-500 mt-1">
            No se puede modificar después de crear la materia
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color de la Asignatura
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {commonColors.map(color => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded border-2 ${
                formData.color === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
        <input
          type="color"
          className="w-12 h-8 rounded border border-gray-300"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la asignatura..."
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t">
        <button 
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {subject ? 'Actualizar' : 'Crear'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
        >
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Evaluaciones *
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          value={formData.numberOfEvaluations}
          onChange={(e) => setFormData({ ...formData, numberOfEvaluations: parseInt(e.target.value) as 1 | 2 | 3 })}
          required
          disabled={!!subject}
        >
          <option value={1}>1 Evaluación</option>
          <option value={2}>2 Evaluaciones</option>
          <option value={3}>3 Evaluaciones</option>
        </select>
        {subject && (
          <p className="text-sm text-gray-500 mt-2">
            El número de evaluaciones no se puede modificar después de crear la materia
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color de la Asignatura
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {commonColors.map(color => (
            <button
              key={color}
              type="button"
              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                formData.color === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
              title={`Color ${color}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Color personalizado:</label>
          <input
            type="color"
            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
          <span className="text-sm text-gray-500 font-mono">{formData.color}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la asignatura, objetivos, contenidos principales..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Información adicional sobre la asignatura que te ayude a organizarte mejor
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button 
          type="submit"
          className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-base"
        >
          <BookOpen className="w-5 h-5" />
          {subject ? 'Actualizar Materia' : 'Crear Materia'}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-base"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
