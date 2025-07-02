'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Upload, FileText } from 'lucide-react'
import { Student } from '@/types/auth'
import { 
  getStudents, 
  saveStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent,
  canDeleteStudent, 
  getCurrentAcademicYear, 
  getFilteredData, 
  getAssignedCenterCourses 
} from '@/lib/userDataManager'
import CSVImport from './CSVImport'
import StudentGradeReport from './StudentGradeReport'

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingGradeReport, setViewingGradeReport] = useState<number | null>(null)
  const [currentAcademicYear, setCurrentAcademicYear] = useState('')

  // Cargar datos y escuchar cambios de año académico
  useEffect(() => {
    const loadData = () => {
      const currentYear = getCurrentAcademicYear()
      setCurrentAcademicYear(currentYear)
      
      // Usar datos filtrados por año académico
      const filteredData = getFilteredData()
      setStudents(filteredData.students)
      
      // Cargar cursos disponibles (cursos asignados del centro)
      const assignedCourses = getAssignedCenterCourses()
      const courseNames = assignedCourses.map(({ centerCourse, assignment }) => 
        assignment.customName || centerCourse.name
      )
      setAvailableCourses(['Sin curso asignado', ...courseNames])
    }

    loadData()

    // Escuchar cambios en los datos
    const handleStudentsUpdate = () => loadData()
    const handleAcademicYearChange = () => loadData()

    window.addEventListener('studentsUpdated', handleStudentsUpdate)
    window.addEventListener('academicYearChanged', handleAcademicYearChange)

    return () => {
      window.removeEventListener('studentsUpdated', handleStudentsUpdate)
      window.removeEventListener('academicYearChanged', handleAcademicYearChange)
    }
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent = addStudent(studentData)
    setStudents(getStudents())
    setShowAddForm(false)
  }

  const handleImportStudents = (importedStudents: Omit<Student, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      importedStudents.forEach(studentData => {
        addStudent(studentData)
      })
      
      // Recargar datos
      const loadData = () => {
        const currentYear = getCurrentAcademicYear()
        setCurrentAcademicYear(currentYear)
        const filteredData = getFilteredData()
        setStudents(filteredData.students)
      }
      loadData()
      
      setShowCSVImport(false)
      alert(`Se han importado ${importedStudents.length} alumnos correctamente`)
    } catch (error) {
      console.error('Error al importar alumnos:', error)
      alert('Error al importar alumnos')
    }
  }

  const handleEditStudent = (studentData: Student) => {
    updateStudent(studentData.id, studentData)
    setStudents(getStudents())
    setEditingStudent(null)
  }

  const handleDeleteStudent = (id: number) => {
    // Primero verificar si el estudiante puede ser eliminado
    const validation = canDeleteStudent(id)
    
    if (!validation.canDelete) {
      alert(`Non se pode eliminar o estudante:\n\n${validation.reason}`)
      return
    }
    
    // Si puede ser eliminado, pedir confirmación
    if (confirm('¿Tes a certeza de que queres eliminar este estudante?')) {
      const result = deleteStudent(id)
      
      if (result.success) {
        // Recargar datos después de eliminar
        const loadData = () => {
          const currentYear = getCurrentAcademicYear()
          setCurrentAcademicYear(currentYear)
          const filteredData = getFilteredData()
          setStudents(filteredData.students)
        }
        loadData()
        
        if (result.message) {
          alert(result.message)
        }
      } else {
        alert(`Error ao eliminar o estudante: ${result.message}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Xestión do Alumnado</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCSVImport(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Engadir Estudante
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar estudantes..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accións
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name} {student.surname}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {student.course}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.enrollmentDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingGradeReport(student.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver informe de notas"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar estudante"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {(() => {
                        const validation = canDeleteStudent(student.id)
                        return (
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className={`${
                              validation.canDelete 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={
                              validation.canDelete 
                                ? 'Eliminar estudante' 
                                : `Non se pode eliminar: ${validation.reason}`
                            }
                            disabled={!validation.canDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCSVImport && (
        <CSVImport
          existingStudents={students}
          onImport={handleImportStudents}
          onClose={() => setShowCSVImport(false)}
        />
      )}

      {/* Add/Edit Student Modal */}
      {(showAddForm || editingStudent) && (
        <StudentForm
          student={editingStudent}
          availableCourses={availableCourses}
          onSave={editingStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => {
            setShowAddForm(false)
            setEditingStudent(null)
          }}
        />
      )}

      {/* Student Grade Report Modal */}
      {viewingGradeReport && (
        <StudentGradeReport
          studentId={viewingGradeReport}
          onClose={() => setViewingGradeReport(null)}
        />
      )}
    </div>
  )
}

interface StudentFormProps {
  student?: Student | null
  availableCourses?: string[]
  onSave: (student: any) => void
  onCancel: () => void
}

function StudentForm({ student, availableCourses = [], onSave, onCancel }: StudentFormProps) {
  const defaultCourse = student?.course || (availableCourses.length > 0 ? availableCourses[0] : '')
  
  const [formData, setFormData] = useState({
    name: student?.name || '',
    surname: student?.surname || '',
    email: student?.email || '',
    phone: student?.phone || '',
    course: defaultCourse,
    enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (student) {
      onSave({ ...student, ...formData })
    } else {
      onSave(formData)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl w-full">
        <div className="modal-header-sticky p-6 pb-3">
          <h3 className="text-lg font-medium">
            {student ? 'Editar Estudante' : 'Engadir Estudante'}
          </h3>
        </div>

        <div className="modal-content px-6">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Primera fila - Nombre y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apelidos
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                />
              </div>
            </div>

            {/* Segunda fila - Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: 666 123 456"
                />
              </div>
            </div>

            {/* Tercera fila - Curso y Fecha */}
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
                  {availableCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                {availableCourses.length === 1 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Solo está disponible "Sin curso asignado". Crea cursos en la sección de Gestión de Cursos.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Matrícula
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer-sticky p-6 pt-3">
          <div className="flex gap-2">
            <button type="submit" form="student-form" className="btn-primary flex-1">
              {student ? 'Actualizar' : 'Añadir'}
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
