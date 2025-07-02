'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, BookOpen, Users, Calendar, Settings, X, Save, AlertCircle, Search } from 'lucide-react'
import { CenterCourse, TeacherCourseAssignment } from '@/types/auth'
import { 
  getCenterCourses,
  getTeacherCourseAssignments,
  addTeacherCourseAssignment,
  updateTeacherCourseAssignment,
  deleteTeacherCourseAssignment,
  getAssignedCenterCourses,
  initializeCenterData
} from '@/lib/userDataManager'

interface EditingAssignment extends Partial<TeacherCourseAssignment> {
  id?: number
  centerCourseId?: number
}

const TeacherCourseSelection: React.FC = () => {
  const [centerCourses, setCenterCourses] = useState<CenterCourse[]>([])
  const [assignments, setAssignments] = useState<TeacherCourseAssignment[]>([])
  const [assignedCourses, setAssignedCourses] = useState<{ centerCourse: CenterCourse, assignment: TeacherCourseAssignment }[]>([])
  const [editingAssignment, setEditingAssignment] = useState<EditingAssignment | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showAvailableCourses, setShowAvailableCourses] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'FP Superior':
      case 'Universidad':
      case 'Máster':
      case 'Doctorado':
        return 'bg-green-100 text-green-800'
      case 'FP Medio':
      case 'Bachillerato':
      case 'BUP':
        return 'bg-blue-100 text-blue-800'
      case 'FP Básica':
      case 'ESO':
        return 'bg-yellow-100 text-yellow-800'
      case 'Primaria':
        return 'bg-purple-100 text-purple-800'
      case 'Formación Continua':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    initializeCenterData()
    loadData()
  }, [])

  const loadData = () => {
    const courses = getCenterCourses().filter(c => c.isActive)
    const userAssignments = getTeacherCourseAssignments()
    const assigned = getAssignedCenterCourses()
    
    setCenterCourses(courses)
    setAssignments(userAssignments)
    setAssignedCourses(assigned)
  }

  // Obtener cursos del centro que aún no están asignados al profesor
  const availableCourses = centerCourses.filter(course => 
    !assignments.some(assignment => assignment.centerCourseId === course.id && assignment.isActive)
  )

  // Filtrar cursos según búsqueda y filtros
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course => {
      const matchesSearch = searchTerm === '' || 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLevel = levelFilter === '' || course.level === levelFilter
      
      return matchesSearch && matchesLevel
    })
  }, [availableCourses, searchTerm, levelFilter])

  // Obtener niveles únicos para el filtro
  const uniqueLevels = useMemo(() => {
    const levels = availableCourses.map(course => course.level)
    return Array.from(new Set(levels)).sort()
  }, [availableCourses])

  const handleAssignCourse = (centerCourseId: number) => {
    const centerCourse = centerCourses.find(c => c.id === centerCourseId)
    if (!centerCourse) return

    const currentYear = new Date().getFullYear()
    const academicYear = `${currentYear}/${currentYear + 1}`
    
    setEditingAssignment({
      centerCourseId,
      academicYear,
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear + 1}-06-30`,
      customName: '',
      description: '',
      isActive: true
    })
    setIsCreating(true)
    setShowAvailableCourses(false)
    // Resetear filtros al cerrar
    setSearchTerm('')
    setLevelFilter('')
  }

  const handleEditAssignment = (assignment: TeacherCourseAssignment) => {
    setEditingAssignment(assignment)
    setIsCreating(false)
  }

  const handleSaveAssignment = () => {
    if (!editingAssignment || !editingAssignment.centerCourseId || !editingAssignment.academicYear) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    try {
      if (isCreating) {
        addTeacherCourseAssignment({
          centerCourseId: editingAssignment.centerCourseId,
          academicYear: editingAssignment.academicYear,
          startDate: editingAssignment.startDate || '',
          endDate: editingAssignment.endDate || '',
          customName: editingAssignment.customName || '',
          description: editingAssignment.description || '',
          isActive: editingAssignment.isActive !== false
        })
      } else if (editingAssignment.id) {
        updateTeacherCourseAssignment(editingAssignment.id, {
          academicYear: editingAssignment.academicYear,
          startDate: editingAssignment.startDate,
          endDate: editingAssignment.endDate,
          customName: editingAssignment.customName,
          description: editingAssignment.description,
          isActive: editingAssignment.isActive
        })
      }

      loadData()
      setEditingAssignment(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error al guardar asignación:', error)
      alert('Error al guardar la asignación')
    }
  }

  const handleDeleteAssignment = (id: number) => {
    if (confirm('¿Estás seguro de que quieres dejar de gestionar este curso?')) {
      deleteTeacherCourseAssignment(id)
      loadData()
    }
  }

  const handleCancel = () => {
    setEditingAssignment(null)
    setIsCreating(false)
  }

  const handleToggleActive = (assignment: TeacherCourseAssignment) => {
    updateTeacherCourseAssignment(assignment.id, { isActive: !assignment.isActive })
    loadData()
  }

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate).toLocaleDateString()
    const end = new Date(endDate).toLocaleDateString()
    return `${start} - ${end}`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Cursos Asignados
          </h1>
          <p className="text-gray-600">
            Gestiona los cursos del centro que vas a impartir
          </p>
        </div>
        <button
          onClick={() => setShowAvailableCourses(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Asignar Curso
        </button>
      </div>

      {/* Cursos asignados */}
      {assignedCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {assignedCourses.map(({ centerCourse, assignment }) => (
            <div
              key={assignment.id}
              className={`bg-white p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${
                !assignment.isActive ? 'opacity-75 bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(centerCourse.level)}`}>
                    {centerCourse.level}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleActive(assignment)}
                    className={`p-1 rounded text-xs transition-colors ${
                      assignment.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title={assignment.isActive ? 'Desactivar asignación' : 'Activar asignación'}
                  >
                    {assignment.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => handleEditAssignment(assignment)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Configurar asignación"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Dejar de gestionar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {assignment.customName || centerCourse.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{centerCourse.code}</span>
                  <span>• {centerCourse.family}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{assignment.academicYear}</span>
                </div>

                {assignment.startDate && assignment.endDate && (
                  <div className="text-xs text-gray-500">
                    {formatDateRange(assignment.startDate, assignment.endDate)}
                  </div>
                )}
              </div>

              {assignment.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {assignment.description}
                </p>
              )}

              {assignment.customName && assignment.customName !== centerCourse.name && (
                <p className="text-xs text-blue-600 mt-2">
                  Nombre original: {centerCourse.name}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes cursos asignados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza asignándote algunos cursos del centro para gestionar
          </p>
          <button
            onClick={() => setShowAvailableCourses(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Ver Cursos Disponibles
          </button>
        </div>
      )}

      {/* Modal de cursos disponibles - Diseño de tarjetas mejorado */}
      {showAvailableCourses && (
        <div className="modal-overlay">
          <div className="modal-container w-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="modal-header-sticky">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cursos Disponibles del Centro</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Busca y asigna cursos para gestionar en tu interfaz personal
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAvailableCourses(false)
                    setSearchTerm('')
                    setLevelFilter('')
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Filtros de búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, código, familia..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Todos los niveles</option>
                    {uniqueLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                {(searchTerm || levelFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setLevelFilter('')
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col"
                    >
                      {/* Header de la tarjeta */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {course.code}
                        </span>
                      </div>

                      {/* Título del curso */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                        {course.name}
                      </h3>
                      
                      {/* Información del curso */}
                      <div className="space-y-1 text-xs text-gray-600 mb-3 flex-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="truncate">{course.family}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{course.modalidad}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 text-center">⏱️</span>
                          <span>{course.duration}h</span>
                        </div>
                      </div>

                      {/* Descripción si existe */}
                      {course.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      {/* Botón de asignar */}
                      <button
                        onClick={() => handleAssignCourse(course.id)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Asignar
                      </button>
                    </div>
                  ))}
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay cursos disponibles
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Todos los cursos activos del centro ya están asignados a ti, 
                    o no hay cursos configurados en el centro.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron cursos
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No hay cursos que coincidan con tu búsqueda. 
                    Prueba con otros términos o ajusta los filtros.
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal con información adicional */}
            {availableCourses.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>
                    {filteredCourses.length} de {availableCourses.length} curso{availableCourses.length !== 1 ? 's' : ''} 
                    {(searchTerm || levelFilter) && ' (filtrado)'}
                  </span>
                  <span className="text-xs">
                    💡 Tip: Puedes personalizar el nombre y configuración después de asignar
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de edición/configuración de asignación */}
      {editingAssignment && (
        <div className="modal-overlay">
          <div className="modal-container w-full max-w-2xl max-h-[95vh]">
            <div className="modal-header-sticky p-6 pb-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreating ? 'Configurar Asignación' : 'Editar Asignación'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isCreating ? 'Configura los detalles de tu nueva asignación' : 'Modifica los detalles de esta asignación'}
              </p>
            </div>

            <div className="modal-content px-6">
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año Académico *
                </label>
                <input
                  type="text"
                  value={editingAssignment.academicYear || ''}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, academicYear: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: 2024/2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={editingAssignment.startDate || ''}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, startDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={editingAssignment.endDate || ''}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, endDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Personalizado
                </label>
                <input
                  type="text"
                  value={editingAssignment.customName || ''}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, customName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Deja vacío para usar el nombre del centro"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes personalizar el nombre que aparecerá en tu interfaz
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción/Notas
                </label>
                <textarea
                  value={editingAssignment.description || ''}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                  placeholder="Notas personales sobre este curso..."
                />
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={editingAssignment.isActive !== false}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Asignación activa
                  </label>
                  <p className="text-xs text-gray-500">
                    Solo las asignaciones activas aparecen en tu dashboard principal
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="modal-footer-sticky p-6 pt-3">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAssignment}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {isCreating ? 'Crear Asignación' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherCourseSelection
