'use client'

import { useState } from 'react'
import { Calendar, Users, BookOpen, GraduationCap, Target, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { migrateToNextAcademicYear, migrateDataWithOptions, getCurrentAcademicYear, getAcademicYears } from '@/lib/dataManager'

interface MigrationOptions {
  students: boolean
  courses: boolean
  subjects: boolean
  evaluations: boolean
}

export default function AcademicYearMigration() {
  const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
    students: true,
    courses: true,
    subjects: true,
    evaluations: true
  })
  
  const [isMigrating, setIsMigrating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  
  const currentYear = getCurrentAcademicYear()
  const availableYears = getAcademicYears()
  const currentYearIndex = availableYears.indexOf(currentYear)
  const nextYear = currentYearIndex < availableYears.length - 1 ? availableYears[currentYearIndex + 1] : null

  const handleOptionChange = (option: keyof MigrationOptions, checked: boolean) => {
    setMigrationOptions(prev => ({
      ...prev,
      [option]: checked
    }))
  }

  const handleMigration = () => {
    if (!nextYear) {
      setMessage({
        type: 'error',
        text: 'Non hai un ano académico seguinte dispoñible para migrar'
      })
      return
    }

    // Verificar que polo menos unha opción está seleccionada
    const hasSelectedOptions = Object.values(migrationOptions).some(option => option)
    if (!hasSelectedOptions) {
      setMessage({
        type: 'error',
        text: 'Debes seleccionar polo menos unha opción para migrar'
      })
      return
    }

    const confirmMigration = window.confirm(
      `🎓 MIGRACIÓN SELECTIVA DE ANO ACADÉMICO\n\n` +
      `✨ Vas migrar datos de ${currentYear} → ${nextYear}\n\n` +
      `📊 DATOS SELECCIONADOS PARA MIGRAR:\n` +
      `${migrationOptions.students ? '✅ Estudantes (promoción e graduación automática)\n' : '❌ Estudantes (non se migrarán)\n'}` +
      `${migrationOptions.courses ? '✅ Cursos (creación cos mesmos nomes)\n' : '❌ Cursos (non se migrarán)\n'}` +
      `${migrationOptions.subjects ? '✅ Materias (mantense a configuración)\n' : '❌ Materias (non se migrarán)\n'}` +
      `${migrationOptions.evaluations ? '✅ Sistemas de avaliación (conservanse as probas)\n' : '❌ Sistemas de avaliación (non se migrarán)\n'}` +
      `\n⚠️ IMPORTANTE:\n` +
      `• O ano académico activo cambiará a ${nextYear}\n` +
      `• As notas non se migran (empeza con notas limpas)\n` +
      `• Esta acción non se pode desfacer\n\n` +
      `¿Confirmas a migración?`
    )

    if (!confirmMigration) return

    try {
      setIsMigrating(true)
      
      // Usar a función de migración personalizada
      const success = migrateDataWithOptions(currentYear, nextYear, migrationOptions)
      
      if (success) {
        setMessage({
          type: 'success',
          text: `Datos migrados correctamente ao ano académico ${nextYear}`
        })
        
        // Recargar a páxina para actualizar o estado global
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: 'Erro durante a migración de datos'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro durante a migración: ${error instanceof Error ? error.message : 'Erro descoñecido'}`
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              Migración Selectiva de Ano Académico
            </h2>
            <p className="text-gray-600 mt-1">
              Escolle que datos trasladar de forma selectiva ao seguinte ano académico
            </p>
          </div>
        </div>

        {/* Current Year Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-blue-900">Ano Académico Actual: {currentYear}</div>
              {nextYear ? (
                <div className="text-sm text-blue-700 flex items-center gap-2">
                  Migrar a: {nextYear}
                  <ArrowRight className="h-4 w-4" />
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  Non hai un ano académico seguinte configurado
                </div>
              )}
            </div>
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
             <Calendar className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Migration Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona os datos a migrar
        </h3>
        
        <div className="space-y-4">
          {/* Students */}
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              id="migrate-students"
              checked={migrationOptions.students}
              onChange={(e) => handleOptionChange('students', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="migrate-students" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Estudantes</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Migra os estudantes activos. Os de segundo curso graduaranse e os de primeiro promocionaranse a segundo.
              </p>
            </div>
          </div>

          {/* Courses */}
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              id="migrate-courses"
              checked={migrationOptions.courses}
              onChange={(e) => handleOptionChange('courses', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="migrate-courses" className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Cursos</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Crea os mesmos cursos para o novo ano académico con datas actualizadas.
              </p>
            </div>
          </div>

          {/* Subjects */}
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              id="migrate-subjects"
              checked={migrationOptions.subjects}
              onChange={(e) => handleOptionChange('subjects', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="migrate-subjects" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Materias</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Mantén as mesmas materias e a súa configuración para o novo curso.
              </p>
            </div>
          </div>

          {/* Evaluations */}
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              id="migrate-evaluations"
              checked={migrationOptions.evaluations}
              onChange={(e) => handleOptionChange('evaluations', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="migrate-evaluations" className="flex items-center gap-2 cursor-pointer">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Sistemas de Avaliación</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Conserva os sistemas de avaliación, probas e pesos configurados para cada materia.
              </p>
            </div>
          </div>
        </div>

        {/* Migration Button */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleMigration}
              disabled={isMigrating || !nextYear || !Object.values(migrationOptions).some(option => option)}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              {isMigrating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Migrando datos seleccionados...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Migrar Datos Seleccionados ao Ano {nextYear || 'N/A'}
                </>
              )}
            </button>
            
            {/* Migration summary */}
            <div className="text-sm text-gray-600 sm:min-w-[200px]">
              <div className="font-medium">Datos seleccionados:</div>
              <div className="text-xs space-y-0.5">
                {Object.entries(migrationOptions).filter(([, selected]) => selected).map(([key]) => (
                  <div key={key} className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="capitalize">
                      {key === 'students' ? 'Estudantes' :
                       key === 'courses' ? 'Cursos' :
                       key === 'subjects' ? 'Materias' :
                       key === 'evaluations' ? 'Avaliacións' : key}
                    </span>
                  </div>
                ))}
                {!Object.values(migrationOptions).some(option => option) && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Ningunha opción seleccionada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Como Funciona a Migración Selectiva
        </h3>
        
        <div className="space-y-3 text-sm text-green-800">
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5" />
              <span><strong>Migración de Estudantes:</strong></span>
            </div>
            <ul className="ml-6 space-y-1 text-green-700">
              <li>• Os de 1º curso promocionan automaticamente a 2º</li>
              <li>• Os de 2º curso márcase como graduados</li>
              <li>• Mantéñense os datos persoais e historial</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-green-600 mt-0.5" />
              <span><strong>Migración de Cursos:</strong></span>
            </div>
            <ul className="ml-6 space-y-1 text-green-700">
              <li>• Créanse cursos cos mesmos nomes</li>
              <li>• Actualízanse as datas ao novo ano académico</li>
              <li>• Empézan sen estudantes matriculados</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-purple-600 mt-0.5" />
              <span><strong>Migración de Materias:</strong></span>
            </div>
            <ul className="ml-6 space-y-1 text-green-700">
              <li>• Mantéñense idénticas (non precisan cambios)</li>
              <li>• Conservan toda a configuración establecida</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-600 mt-0.5" />
              <span><strong>Migración de Avaliacións:</strong></span>
            </div>
            <ul className="ml-6 space-y-1 text-green-700">
              <li>• Mantéñense os sistemas de probas e pesos</li>
              <li>• Actualízanse as datas ao novo calendario</li>
              <li>• Conservan a configuración de avaliacións</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <span className="font-medium text-yellow-900">Importante:</span>
                <p className="text-yellow-800 mt-1">
                  As notas NON se migran. O novo curso empeza con notas limpas para todos os estudantes.
                  Asegúrate de ter feito informes do curso anterior antes de migrar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
