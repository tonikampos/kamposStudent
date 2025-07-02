'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, BookOpen, GraduationCap, Clock, Users } from 'lucide-react'
import { CenterCourse } from '@/types/auth'
import { 
  getCenterCourses, 
  addCenterCourse, 
  updateCenterCourse, 
  deleteCenterCourse,
  initializeCenterData 
} from '@/lib/userDataManager'

interface EditingCourse extends Partial<CenterCourse> {
  id?: number
}

const CenterCourseManagement: React.FC = () => {
  const [centerCourses, setCenterCourses] = useState<CenterCourse[]>([])
  const [editingCourse, setEditingCourse] = useState<EditingCourse | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFamily, setFilterFamily] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  // Obtener familias profesionales únicas
  const families = Array.from(new Set(centerCourses.map(course => course.family))).sort()
  const levels = [
    'Primaria',
    'ESO', 
    'Bachillerato',
    'BUP',
    'Universidad',
    'FP Básica',
    'FP Medio', 
    'FP Superior',
    'Máster',
    'Doctorado',
    'Formación Continua',
    'Otros'
  ] as const

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
    loadCenterCourses()
  }, [])

  const loadCenterCourses = () => {
    const courses = getCenterCourses()
    setCenterCourses(courses)
  }

  // Filtrar cursos
  const filteredCourses = centerCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFamily = !filterFamily || course.family === filterFamily
    const matchesLevel = !filterLevel || course.level === filterLevel
    
    return matchesSearch && matchesFamily && matchesLevel
  })

  const handleCreateCourse = () => {
    setEditingCourse({
      name: '',
      code: '',
      level: 'FP Medio',
      family: '',
      duration: 2000,
      modalidad: 'Presencial',
      description: '',
      isActive: true
    })
    setIsCreating(true)
  }

  const handleEditCourse = (course: CenterCourse) => {
    setEditingCourse(course)
    setIsCreating(false)
  }

  const handleSaveCourse = () => {
    if (!editingCourse || !editingCourse.name || !editingCourse.code || !editingCourse.family) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    try {
      if (isCreating) {
        addCenterCourse({
          name: editingCourse.name,
          code: editingCourse.code,
          level: editingCourse.level || 'FP Medio',
          family: editingCourse.family,
          duration: editingCourse.duration || 2000,
          modalidad: editingCourse.modalidad || 'Presencial',
          description: editingCourse.description || '',
          isActive: editingCourse.isActive !== false
        })
      } else if (editingCourse.id) {
        updateCenterCourse(editingCourse.id, {
          name: editingCourse.name,
          code: editingCourse.code,
          level: editingCourse.level,
          family: editingCourse.family,
          duration: editingCourse.duration,
          modalidad: editingCourse.modalidad,
          description: editingCourse.description,
          isActive: editingCourse.isActive
        })
      }

      loadCenterCourses()
      setEditingCourse(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error al guardar curso:', error)
      alert('Error al guardar el curso')
    }
  }

  const handleDeleteCourse = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      deleteCenterCourse(id)
      loadCenterCourses()
    }
  }

  const handleCancel = () => {
    setEditingCourse(null)
    setIsCreating(false)
  }

  const handleToggleActive = (course: CenterCourse) => {
    updateCenterCourse(course.id, { isActive: !course.isActive })
    loadCenterCourses()
  }

  const formatDuration = (hours: number): string => {
    if (hours >= 2000) {
      return `${Math.round(hours / 1000)}k horas`
    }
    return `${hours} horas`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Cursos del Centro
          </h1>
          <p className="text-gray-600">
            Administra la oferta formativa general del centro educativo
          </p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Curso
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o código..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Familia Profesional
            </label>
            <select
              value={filterFamily}
              onChange={(e) => setFilterFamily(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las familias</option>
              {families.map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los niveles</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterFamily('')
                setFilterLevel('')
              }}
              className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-white p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${
              !course.isActive ? 'opacity-75 bg-gray-50' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleToggleActive(course)}
                  className={`p-1 rounded text-xs transition-colors ${
                    course.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  title={course.isActive ? 'Desactivar curso' : 'Activar curso'}
                >
                  {course.isActive ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Editar curso"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Eliminar curso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {course.name}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">{course.code}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{course.family}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration)} • {course.modalidad}</span>
              </div>
            </div>

            {course.description && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                {course.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-gray-500">
            {centerCourses.length === 0 
              ? 'Comienza agregando el primer curso del centro.'
              : 'Ajusta los filtros para encontrar los cursos que buscas.'
            }
          </p>
        </div>
      )}

      {/* Modal de edición/creación */}
      {editingCourse && (
        <div className="modal-overlay">
          <div className="modal-container w-full max-w-2xl max-h-[95vh]">
            <div className="modal-header-sticky">
              <h2 className="text-xl font-semibold">
                {isCreating ? 'Crear Nuevo Curso' : 'Editar Curso'}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  value={editingCourse.name || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Administración de Sistemas Informáticos en Red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={editingCourse.code || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: ASIR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <select
                  value={editingCourse.level || 'FP Medio'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as CenterCourse['level'] })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Primaria">Educación Primaria</option>
                  <option value="ESO">Educación Secundaria Obligatoria (ESO)</option>
                  <option value="Bachillerato">Bachillerato</option>
                  <option value="BUP">BUP/COU</option>
                  <option value="FP Básica">Formación Profesional Básica</option>
                  <option value="FP Medio">Ciclo Formativo de Grado Medio</option>
                  <option value="FP Superior">Ciclo Formativo de Grado Superior</option>
                  <option value="Universidad">Estudios Universitarios</option>
                  <option value="Máster">Máster Universitario</option>
                  <option value="Doctorado">Doctorado</option>
                  <option value="Formación Continua">Formación Continua</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Familia Profesional *
                </label>
                <input
                  type="text"
                  value={editingCourse.family || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, family: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Informática y Comunicaciones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  value={editingCourse.duration || 2000}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: parseInt(e.target.value) || 2000 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="500"
                  max="3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad
                </label>
                <select
                  value={editingCourse.modalidad || 'Presencial'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, modalidad: e.target.value as 'Presencial' | 'Semipresencial' | 'Online' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Semipresencial">Semipresencial</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descripción opcional del curso..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingCourse.isActive !== false}
                  onChange={(e) => setEditingCourse({ ...editingCourse, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Curso activo
                </label>
              </div>
            </div>

            <div className="modal-footer-sticky">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCourse}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
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

export default CenterCourseManagement
