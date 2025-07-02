'use client'

import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, X, Eye } from 'lucide-react'
import { parseCSV, processStudentsFromCSV, validateStudents, findDuplicates, ProcessedStudent } from '@/lib/csvImport'
import { Student } from '@/types/auth'

interface CSVImportProps {
  existingStudents: Student[]
  onImport: (students: Omit<Student, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => void
  onClose: () => void
}

export default function CSVImport({ existingStudents, onImport, onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string>('')
  const [processedStudents, setProcessedStudents] = useState<ProcessedStudent[]>([])
  const [validationResults, setValidationResults] = useState<any>(null)
  const [duplicates, setDuplicates] = useState<any>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvData(content)
        processCSVData(content)
      }
      reader.readAsText(selectedFile)
    } else {
      alert('Por favor, selecciona un archivo CSV válido')
    }
  }

  const processCSVData = (csvContent: string) => {
    setLoading(true)
    try {
      // Parsear CSV
      const csvStudents = parseCSV(csvContent)
      
      // Procesar estudiantes (sen curso asignado)
      const processed = processStudentsFromCSV(csvStudents)
      setProcessedStudents(processed)
      
      // Validar datos
      const validation = validateStudents(processed)
      setValidationResults(validation)
      
      // Buscar duplicados
      const duplicateCheck = findDuplicates(processed, existingStudents)
      setDuplicates(duplicateCheck)
      
      setStep('preview')
    } catch (error) {
      console.error('Error procesando CSV:', error)
      alert('Error al procesar el archivo CSV. Verifica que el formato sea correcto.')
    }
    setLoading(false)
  }

  const handleConfirmImport = () => {
    if (validationResults?.valid) {
      const studentsToImport = validationResults.valid.map((student: ProcessedStudent) => ({
        name: student.name,
        surname: student.surname,
        email: student.email,
        course: student.course,
        enrollmentDate: student.enrollmentDate,
        isActive: student.isActive,
        phone: '',
        birthDate: '',
        address: '',
        emergencyContact: '',
        photo: ''
      }))
      
      onImport(studentsToImport)
      onClose()
    }
  }

  const downloadTemplate = () => {
    const templateContent = `Nome,Apelidos,Enderezo de correo
Juan,Pérez García,juan.perez@email.com
María,López Rodríguez,maria.lopez@email.com
Pedro,González Martín,pedro.gonzalez@email.com`
    
    const blob = new Blob([templateContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_alumnos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-4xl w-full max-h-[90vh]">
        {/* Header */}
        <div className="modal-header-sticky">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Importar Alumnos desde CSV</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Steps indicator */}
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${step === 'upload' ? 'text-primary-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'upload' ? 'bg-primary-100 text-primary-600' : 'bg-green-100 text-green-600'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Subir archivo</span>
            </div>
            
            <div className={`ml-4 h-px w-16 ${step !== 'upload' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            
            <div className={`ml-4 flex items-center ${
              step === 'preview' ? 'text-primary-600' : step === 'confirm' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'preview' ? 'bg-primary-100 text-primary-600' : 
                step === 'confirm' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Revisar datos</span>
            </div>
            
            <div className={`ml-4 h-px w-16 ${step === 'confirm' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
            
            <div className={`ml-4 flex items-center ${step === 'confirm' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'confirm' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmar</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Subir arquivo CSV</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Arrastra e solta un arquivo CSV ou fai clic para seleccionar
                </p>
                <p className="mt-2 text-xs text-blue-600">
                  Os alumnos importaranse sen curso asignado para maior flexibilidade
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="text-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                  >
                    Seleccionar archivo CSV
                  </button>
                  
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Archivo seleccionado: {file.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Formato del archivo CSV:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Primera columna: Nombre</li>
                  <li>• Segunda columna: Apellidos</li>
                  <li>• Tercera columna: Email</li>
                  <li>• Cuarta columna: Grupos (opcional)</li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar plantilla de exemplo
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 Información importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Os alumnos importaranse <strong>sen curso asignado</strong></li>
                  <li>• Deberás asignalos manualmente aos cursos correspondentes</li>
                  <li>• Isto permite maior flexibilidade na organización</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">
                      {validationResults?.valid?.length || 0} válidos
                    </span>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">
                      {validationResults?.invalid?.length || 0} con errores
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">
                      {(duplicates?.duplicateEmails?.length || 0) + (duplicates?.duplicateNames?.length || 0)} duplicados
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation errors */}
              {validationResults?.invalid && validationResults.invalid.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Errores encontrados:</h4>
                  <div className="space-y-2">
                    {validationResults.invalid.map((item: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{item.student.name} {item.student.surname}:</span>
                        <span className="text-red-700 ml-2">{item.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates warning */}
              {(duplicates?.duplicateEmails?.length > 0 || duplicates?.duplicateNames?.length > 0) && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Posibles duplicados:</h4>
                  {duplicates.duplicateEmails.length > 0 && (
                    <div className="text-sm text-yellow-800">
                      <strong>Emails duplicados:</strong> {duplicates.duplicateEmails.join(', ')}
                    </div>
                  )}
                  {duplicates.duplicateNames.length > 0 && (
                    <div className="text-sm text-yellow-800 mt-1">
                      <strong>Nombres duplicados:</strong> {duplicates.duplicateNames.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Preview table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-900">Vista previa de alumnos válidos</h4>
                </div>
                
                <div className="overflow-x-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apelidos</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validationResults?.valid?.map((student: ProcessedStudent, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{student.surname}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{student.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-400 italic">
                            {student.course || '(Sen asignar)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Nota sobre cursos */}
                <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mt-0.5">ℹ️</div>
                    <div className="ml-2 text-sm text-yellow-800">
                      <strong>Nota:</strong> Os alumnos importaranse sen curso asignado. 
                      Podes asignalos posteriormente desde a xestión de alumnos.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="btn-secondary"
                >
                  Volver
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!validationResults?.valid || validationResults.valid.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Confirmar importación</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Importaranse {validationResults?.valid?.length || 0} alumnos
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">📋 Resumo da importación:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>{validationResults?.valid?.length || 0}</strong> alumnos válidos serán importados</li>
                  <li>• <strong>Sen curso asignado</strong> - poderás asignalos posteriormente</li>
                  <li>• Data de matrícula: <strong>{new Date().toLocaleDateString('gl')}</strong></li>
                  <li>• Estado: <strong>Activo</strong></li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">⚠️ Importante:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Despois da importación deberás asignar manualmente os alumnos aos cursos</li>
                  <li>• Isto permítelle maior control sobre a organización</li>
                  <li>• Podes facelo desde a xestión de alumnos</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('preview')}
                  className="btn-secondary"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="btn-primary"
                >
                  Confirmar e importar
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-600">Procesando archivo...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
