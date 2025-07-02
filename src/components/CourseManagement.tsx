'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Calendar, Users, BookOpen, Archive, Eye } from 'lucide-react'
import { Course } from '@/types/auth'
import { useAuth } from '@/components/AuthProvider'
import { getCourses, saveCourses } from '@/lib/userDataManager'

export default function CourseManagement() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025')
  const [showArchived, setShowArchived] = useState(false)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos
  useEffect(() => {
    if (user) {
      setCourses(getCourses())
    }
  }, [user])

  // Obtener años académicos únicos
  const academicYears = Array.from(new Set(courses.map(c => c.academicYear))).sort().reverse()

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesYear = selectedYear === 'todos' || course.academicYear === selectedYear
    const matchesActiveFilter = showArchived ? !course.isActive : course.isActive
    
    return matchesSearch && matchesYear && matchesActiveFilter
  })

  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const currentCourses = getCourses()
    const newCourse = {
      ...courseData,
      id: Math.max(...currentCourses.map(c => c.id), 0) + 1
    }
    const updatedCourses = [...currentCourses, newCourse]
    saveCourses(updatedCourses)
    setCourses(updatedCourses)
    setShowAddForm(false)
  }

  const handleEditCourse = (courseData: Course) => {
    const currentCourses = getCourses()
    const updatedCourses = currentCourses.map(c => c.id === courseData.id ? courseData : c)
    saveCourses(updatedCourses)
    setCourses(updatedCourses)
    setEditingCourse(null)
  }

  const handleDeleteCourse = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      const currentCourses = getCourses()
      const updatedCourses = currentCourses.map(c => c.id === id ? { ...c, isActive: false } : c)
      saveCourses(updatedCourses)
      setCourses(updatedCourses)
    }
  }

  const handleArchiveCourse = (id: number) => {
    if (confirm('¿Estás seguro de que quieres archivar este curso?')) {
      const currentCourses = getCourses()
      const updatedCourses = currentCourses.map(c => c.id === id ? { ...c, isActive: false } : c)
      saveCourses(updatedCourses)
      setCourses(updatedCourses)
    }
  }

  const handleRestoreCourse = (id: number) => {
    const currentCourses = getCourses()
    const updatedCourses = currentCourses.map(c => c.id === id ? { ...c, isActive: true } : c)
    saveCourses(updatedCourses)
    setCourses(updatedCourses)
  }

  const getTotalStudents = () => {
    return filteredCourses.reduce((total, course) => total + course.students.length, 0)
  }

  const getTotalSubjects = () => {
    return filteredCourses.reduce((total, course) => total + (course.subjects?.length || 0), 0)
  }

  const getCurrentYearCourses = () => {
    return courses.filter(c => c.academicYear === '2024-2025' && c.isActive).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Cursos Académicos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`btn-secondary flex items-center gap-2 ${showArchived ? 'bg-orange-100 text-orange-800' : ''}`}
            >
              {showArchived ? <Eye className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              {showArchived ? 'Ver Activos' : 'Ver Archivados'}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Añadir Curso
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input-field"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="todos">Todos los años</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Cursos Activos</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{getCurrentYearCourses()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Alumnos</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{getTotalStudents()}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Asignaturas</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{getTotalSubjects()}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Años Académicos</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{academicYears.length}</p>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año Académico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumnos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignaturas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {course.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.academicYear === '2024-2025' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {course.academicYear}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(course.startDate).toLocaleDateString('es-ES')}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(course.endDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.subjects?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isActive ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar curso"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {course.isActive ? (
                        <button
                          onClick={() => handleArchiveCourse(course.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Archivar curso"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestoreCourse(course.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Restaurar curso"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar curso"
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

      {/* Add/Edit Course Modal */}
      {(showAddForm || editingCourse) && (
        <CourseForm
          course={editingCourse}
          onSave={editingCourse ? handleEditCourse : handleAddCourse}
          onCancel={() => {
            setShowAddForm(false)
            setEditingCourse(null)
          }}
        />
      )}
    </div>
  )
}

interface CourseFormProps {
  course?: Course | null
  onSave: (course: any) => void
  onCancel: () => void
}

function CourseForm({ course, onSave, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    academicYear: course?.academicYear || '2024-2025',
    startDate: course?.startDate || '2024-09-16',
    endDate: course?.endDate || '2025-06-20',
    isActive: course?.isActive ?? true,
    subjects: course?.subjects || [],
    students: course?.students || []
  })

  const currentYear = new Date().getFullYear()
  const years = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear - 1}-${currentYear}`,
    `${currentYear - 2}-${currentYear - 1}`,
    `${currentYear + 1}-${currentYear + 2}`
  ]

  const courseTypes = [
    { code: 'DAM1', name: 'Desarrollo de Aplicaciones Multiplataforma - Primer Curso' },
    { code: 'DAM2', name: 'Desarrollo de Aplicaciones Multiplataforma - Segundo Curso' },
    { code: 'DAW1', name: 'Desarrollo de Aplicaciones Web - Primer Curso' },
    { code: 'DAW2', name: 'Desarrollo de Aplicaciones Web - Segundo Curso' },
    { code: 'ASIR1', name: 'Administración de Sistemas Informáticos en Red - Primer Curso' },
    { code: 'ASIR2', name: 'Administración de Sistemas Informáticos en Red - Segundo Curso' },
    { code: 'SMR1', name: 'Sistemas Microinformáticos y Redes - Primer Curso' },
    { code: 'SMR2', name: 'Sistemas Microinformáticos y Redes - Segundo Curso' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (course) {
      onSave({ ...course, ...formData })
    } else {
      onSave(formData)
    }
  }

  const handleCourseTypeChange = (value: string) => {
    const selectedType = courseTypes.find(t => t.code === value)
    if (selectedType) {
      setFormData({
        ...formData,
        code: selectedType.code,
        name: selectedType.name
      })
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl w-full max-h-[95vh]">
        <div className="modal-header-sticky">
          <h3 className="text-lg font-medium">
            {course ? 'Editar Curso' : 'Añadir Curso'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Curso
            </label>
            <select
              className="input-field"
              value={formData.code}
              onChange={(e) => handleCourseTypeChange(e.target.value)}
            >
              <option value="">Seleccionar tipo de curso...</option>
              {courseTypes.map(type => (
                <option key={type.code} value={type.code}>
                  {type.code} - {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Curso
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre completo del curso"
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
              placeholder="ej. DAM1"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año Académico
            </label>
            <select
              className="input-field"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Curso activo
            </label>
          </div>

          <div className="modal-footer-sticky">
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                {course ? 'Actualizar' : 'Añadir'}
              </button>
              <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
