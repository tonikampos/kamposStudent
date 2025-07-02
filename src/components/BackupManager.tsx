'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Download, 
  Upload, 
  Shield, 
  History, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  FileText,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { 
  getCurrentAcademicYear,
  getBackupHistory,
  saveBackupToHistory,
  deleteBackupFromHistory,
  createBackup,
  restoreBackup
} from '@/lib/userDataManager'
import { BackupData } from '@/types/auth'

export default function BackupManager() {
  const { user } = useAuth()
  const [currentYear, setCurrentYear] = useState('')

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }
  const [backupHistory, setBackupHistory] = useState<BackupData[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [lastBackup, setLastBackup] = useState<BackupData | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCurrentYear(getCurrentAcademicYear())
    loadBackupHistory()
  }, [])

  const loadBackupHistory = () => {
    const history = getBackupHistory()
    setBackupHistory(history)
  }

  const handleExportBackup = async () => {
    setIsExporting(true)
    setMessage(null)
    
    try {
      const backup = createBackup()
      setLastBackup(backup)
      
      // Guardar en historial
      saveBackupToHistory(backup)
      
      // Crear archivo y descargar
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${backup.metadata.academicYear}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setMessage({
        type: 'success',
        text: `Copia de seguridad del año ${backup.metadata.academicYear} exportada correctamente`
      })
      
      // Actualizar historial
      setTimeout(() => {
        loadBackupHistory()
      }, 500)
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error al exportar copia de seguridad: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportBackup = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const backupData: BackupData = JSON.parse(text)
      
      const success = restoreBackup(backupData)
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Copia de seguridad importada correctamente'
        })
        
        // Actualizar año actual si cambió
        setCurrentYear(backupData.metadata.academicYear)
        loadBackupHistory()
      } else {
        setMessage({
          type: 'error',
          text: 'Error al importar la copia de seguridad'
        })
      }
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Archivo inválido'}`
      })
    } finally {
      setIsImporting(false)
      // Limpiar input file
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // Funciones auxiliares para mostrar datos
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBackupTypeIcon = (generatedBy: string) => {
    if (generatedBy.includes('automática')) {
      return <RefreshCw className="h-4 w-4 text-blue-500" />
    }
    return <Shield className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Copias de Seguridade
            </h2>
            <p className="text-gray-600 mt-1">
              Protexe os teus datos académicos con copias de seguridade do ano {currentYear}
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
             message.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
             <FileText className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crear Copia de Seguridad</h3>
              <p className="text-sm text-gray-600">Exportar datos del año académico actual</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div>📅 Año académico: <strong>{currentYear}</strong></div>
                <div>💾 Formato: JSON</div>
                <div>🔒 Incluye: Estudiantes, cursos, notas, evaluaciones</div>
              </div>
            </div>

            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creando copia...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar Copia de Seguridad
                </>
              )}
            </button>
          </div>
        </div>

        {/* Import Backup */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Restaurar Copia de Seguridad</h3>
              <p className="text-sm text-gray-600">Importar y restaurar datos desde archivo</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong>Atención:</strong> Restaurar una copia sobrescribirá todos los datos actuales.
                  Asegúrate de crear una copia de seguridad antes si es necesario.
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={handleImportBackup}
              disabled={isImporting}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Seleccionar Archivo de Copia
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Last Backup Info */}
      {lastBackup && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Última Copia Creada
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Estudiantes</div>
              <div className="text-2xl font-bold text-blue-900">{lastBackup.data.students?.length || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-800">Cursos</div>
              <div className="text-2xl font-bold text-green-900">{lastBackup.data.courses?.length || 0}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-800">Asignaturas</div>
              <div className="text-2xl font-bold text-purple-900">{lastBackup.data.subjects?.length || 0}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-orange-800">Matriculaciones</div>
              <div className="text-2xl font-bold text-orange-900">{lastBackup.data.enrollments?.length || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Backup History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-600" />
          Historial de Copias de Seguridade
        </h3>

        {backupHistory.length > 0 ? (
          <div className="space-y-2">
            {backupHistory.map((backup, index) => (
              <div key={`backup-${index}`} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Año {backup.metadata.academicYear}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(backup.metadata.createdAt)}
                      </span>
                      <span>{backup.data.students?.length || 0} estudiantes</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        v{backup.metadata.version}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {backup.metadata.userName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No hay copias de seguridad en el historial</p>
            <p className="text-sm">Crea tu primera copia de seguridad para proteger tus datos</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recomendaciones de Seguridad
        </h3>
        
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <span>Crea copias de seguridad regularmente, especialmente antes de cambios importantes</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <span>Guarda las copias en un lugar seguro, fuera del sistema</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <span>Prueba periódicamente la restauración de copias de seguridad</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <span>Realiza copias antes de cambiar de año académico</span>
          </div>
        </div>
      </div>
    </div>
  )
}
