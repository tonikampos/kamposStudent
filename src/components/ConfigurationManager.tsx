'use client'

import { useState } from 'react'
import { Settings, Database, Calendar, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import DataManagement from './DataManagement'
import AcademicYearMigration from './AcademicYearMigration'

type ConfigSection = 'main' | 'data' | 'migration'

export default function ConfigurationManager() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<ConfigSection>('main')

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'data':
        return <DataManagement />
      case 'migration':
        return <AcademicYearMigration />
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Configuración do Sistema
              </h2>
              <p className="text-gray-600 mt-1">
                Xestiona a configuración e mantemento do sistema académico
              </p>
            </div>

            {/* Configuration Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data Management */}
              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('data')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Xestión de Datos</h3>
                    <p className="text-sm text-gray-600">Administra, limpa e reinicia os datos do sistema</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Reinicializar datos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Limpar todos os datos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Empezar desde cero</span>
                  </div>
                </div>
              </div>

              {/* Academic Year Migration */}
              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveSection('migration')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Migración Selectiva de Ano</h3>
                    <p className="text-sm text-gray-600">Escolle que datos trasladar ao seguinte curso</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Migración selectiva de estudantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Conservar materias e sistemas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Opcións personalizables</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Información Rápida
              </h3>
              
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span><strong>Xestión de Datos:</strong> Para mantemento xeral, limpeza e reinicialización do sistema.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span><strong>Migración Selectiva:</strong> Para trasladar só os datos que necesites ao seguinte curso académico con opcións personalizables.</span>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      {activeSection !== 'main' && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button 
            onClick={() => setActiveSection('main')}
            className="hover:text-blue-600 transition-colors"
          >
            Configuración
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">
            {activeSection === 'data' ? 'Xestión de Datos' : 'Migración Selectiva de Ano'}
          </span>
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  )
}
