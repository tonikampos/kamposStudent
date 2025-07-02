'use client'

import { useState, useCallback, useEffect } from 'react'
import { Users, BookOpen, BarChart3, FileText, Settings, Menu, X, GraduationCap, Calendar, UserCheck, Target, Shield, Building } from 'lucide-react'
import StudentManagement from '@/components/StudentManagement'
import SubjectManagement from '@/components/SubjectManagement'
import CenterCourseManagement from '@/components/CenterCourseManagement'
import TeacherCourseSelection from '@/components/TeacherCourseSelection'
import EnrollmentManagement from '@/components/EnrollmentManagement'
import EvaluationSystemManagement from '@/components/EvaluationSystemManagement'
import GradeManagement from '@/components/GradeManagement'
import SubjectReports from '@/components/SubjectReports'
import Statistics from '@/components/Statistics'
import Reports from '@/components/Reports'
import AcademicYearSelector from '@/components/AcademicYearSelector'
import AcademicYearDashboard from '@/components/AcademicYearDashboard'
import BackupManager from '@/components/BackupManager'
import ConfigurationManager from '@/components/ConfigurationManager'
import UserHeader from '@/components/UserHeader'

export default function Home() {
  const [activeTab, setActiveTab] = useState('students')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Efecto para marcar la aplicación como cargada
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Función optimizada para cambiar de pestaña con transición suave y estable
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === activeTab) return
    
    // Evitar múltiples transiciones simultáneas
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // Transición optimizada con RAF para mejor rendimiento
    requestAnimationFrame(() => {
      setTimeout(() => {
        setActiveTab(newTab)
        
        // Pequeño delay adicional para asegurar renderizado estable
        requestAnimationFrame(() => {
          setIsTransitioning(false)
          setIsMobileMenuOpen(false)
          
          // Scroll suave al inicio del contenido principal
          const mainContent = document.querySelector('.main-content')
          if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
      }, 100)
    })
  }, [activeTab, isTransitioning])

  // Cerrar menú móvil al hacer clic fuera
  const handleOverlayClick = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Manejar tecla Escape para cerrar menú móvil
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Opciones de gestión personal del profesor
  const personalTabs = [
    { id: 'students', label: 'Alumnado', icon: Users },
    { id: 'my-courses', label: 'Mis Cursos', icon: Calendar },
    { id: 'subjects', label: 'Materias', icon: GraduationCap },
    { id: 'enrollments', label: 'Matrículas', icon: UserCheck },
    { id: 'evaluations', label: 'Avaliacións', icon: Target },
    { id: 'grades', label: 'Notas', icon: BookOpen },
    { id: 'subject-reports', label: 'Informes Materia', icon: FileText },
    { id: 'statistics', label: 'Estatísticas', icon: BarChart3 },
    { id: 'reports', label: 'Outros Informes', icon: FileText },
  ]

  // Opciones de configuración general (afectan a todos los profesores)
  const generalConfigTabs = [
    { id: 'center-courses', label: 'Cursos del Centro', icon: Building },
    { id: 'backup', label: 'Copias de Seguridade', icon: Shield },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <>
            <AcademicYearDashboard />
            <StudentManagement />
          </>
        )
      case 'my-courses':
        return <TeacherCourseSelection />
      case 'center-courses':
        return <CenterCourseManagement />
      case 'subjects':
        return <SubjectManagement />
      case 'enrollments':
        return <EnrollmentManagement />
      case 'evaluations':
        return <EvaluationSystemManagement />
      case 'grades':
        return <GradeManagement />
      case 'subject-reports':
        return <SubjectReports />
      case 'statistics':
        return <Statistics />
      case 'reports':
        return <Reports />
      case 'backup':
        return <BackupManager />
      case 'settings':
        return <ConfigurationManager />
      default:
        return (
          <>
            <AcademicYearDashboard />
            <StudentManagement />
          </>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* User Header */}
      <UserHeader />
      
      {/* Main Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 text-smooth">
              Xestión Académica
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Academic Year Selector */}
              <AcademicYearSelector className="hidden sm:block" />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay md:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout principal con grid estabilizado */}
        <div className="main-layout">
          {/* Sidebar para desktop */}
          <aside className="sidebar-container hidden md:block" role="navigation" aria-label="Navegación principal">
            <div className="p-6">
              <nav className="space-y-4">
                {/* Sección de Gestión Personal */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 no-select">
                    Gestión Personal
                  </h3>
                  <div className="space-y-2" role="list">
                    {personalTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`nav-button ${
                            activeTab === tab.id ? 'active-personal' : ''
                          }`}
                          aria-current={activeTab === tab.id ? 'page' : undefined}
                          role="listitem"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Separador */}
                <div className="border-t border-gray-200 my-4" role="separator"></div>

                {/* Sección de Configuración General */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 no-select">
                    Configuración Xeral
                  </h3>
                  <div className="space-y-2" role="list">
                    {generalConfigTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`nav-button ${
                            activeTab === tab.id ? 'active-config' : ''
                          }`}
                          aria-current={activeTab === tab.id ? 'page' : undefined}
                          role="listitem"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              </nav>
            </div>
          </aside>

          {/* Mobile menu panel */}
          <aside 
            className={`mobile-menu-panel md:hidden ${isMobileMenuOpen ? 'open' : ''}`}
            role="navigation" 
            aria-label="Navegación principal móvil"
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="p-6">
              {/* Header del menú móvil */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Academic Year Selector para móvil */}
              <div className="mb-6">
                <AcademicYearSelector className="w-full" />
              </div>
              
              <nav className="space-y-4">
                {/* Sección de Gestión Personal */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 no-select">
                    Gestión Personal
                  </h3>
                  <div className="space-y-2">
                    {personalTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`nav-button ${
                            activeTab === tab.id ? 'active-personal' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* Separador */}
                <div className="border-t border-gray-200 my-4" role="separator"></div>

                {/* Sección de Configuración General */}
                <section>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 no-select">
                    Configuración Xeral
                  </h3>
                  <div className="space-y-2">
                    {generalConfigTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`nav-button ${
                            activeTab === tab.id ? 'active-config' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              </nav>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="main-content" role="main">
            <div className="content-wrapper">
              <div className={`content-transition gpu-accelerated ${isTransitioning ? 'transitioning' : ''}`}>
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
