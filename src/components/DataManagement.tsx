'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { resetUserData, clearUserData } from '@/lib/userDataManager'

export default function DataManagement() {
  const { user } = useAuth()
  const [isClearing, setIsClearing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  const handleResetData = async () => {
    try {
      setIsClearing(true)
      const success = resetUserData()
      if (success) {
        setMessage({
          type: 'success',
          text: 'Datos reinicializados correctamente. Base de datos limpia con datos de ejemplo.'
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Error al reinicializar datos: No se pudo completar la operación.'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error al reinicializar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearAllData = async () => {
    try {
      setIsClearing(true)
      const success = clearUserData()
      if (success) {
        setMessage({
          type: 'success',
          text: 'Todos los datos han sido eliminados. Base de datos completamente limpia.'
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Error al limpiar datos: No se pudo completar la operación.'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error al limpiar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Xestión de Datos
            </h2>
            <p className="text-gray-600 mt-1">
              Administra e reinicia os teus datos de usuario ({user.firstName} {user.lastName})
            </p>
            <p className="text-sm text-blue-600 mt-1">
              ⚠️ As operacións só afectan aos teus datos, non aos doutros usuarios
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
             <Database className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reset Data */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reinicializar Datos</h3>
              <p className="text-sm text-gray-600">Limpiar teus datos e crear exemplos</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div>🔄 Elimina todos os teus datos actuais</div>
                <div>📊 Crea datos de exemplo para probar</div>
                <div>� Só afecta aos teus datos de usuario</div>
                <div>⚡ Rápido e seguro</div>
              </div>
            </div>

            <button
              onClick={handleResetData}
              disabled={isClearing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Reinicializando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reinicializar Datos
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Limpiar Todo</h3>
              <p className="text-sm text-gray-600">Eliminar absolutamente todos os teus datos</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>¡PERIGO!</strong> Esta acción eliminará os teus:
                  <ul className="mt-1 list-disc list-inside">
                    <li>Todos os estudantes</li>
                    <li>Todas as materias e cursos</li>
                    <li>Todas as notas e avaliacións</li>
                    <li>Configuracións persoais</li>
                  </ul>
                  <div className="mt-2 font-medium">👤 Os datos doutros usuarios non se verán afectados</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearAllData}
              disabled={isClearing}
              className="btn-danger w-full flex items-center justify-center gap-2"
            >
              {isClearing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar Todos los Datos
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="card bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Información Importante
        </h3>
        
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Reinicializar:</strong> Limpia todos los datos pero mantiene la estructura de años académicos y configuración básica.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <span><strong>Limpiar Todo:</strong> Elimina absolutamente todos los datos, incluyendo configuraciones y copias de seguridad.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <span><strong>Recomendación:</strong> Crea una copia de seguridad antes de limpiar datos si quieres conservar algo.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span><strong>Después de limpiar:</strong> Puedes empezar a añadir tus propios datos desde cero o importar desde CSV.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
