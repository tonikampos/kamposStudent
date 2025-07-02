'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { isAuthenticated, getCurrentUser, initializeAuth } from '@/lib/authManager'
import { initializeUserData, initializeCenterData } from '@/lib/userDataManager'
import { User } from '@/types/auth'
import AuthForm from './AuthForm'

// Contexto de autenticación
interface AuthContextType {
  user: User | null
  isLoading: boolean
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: () => {}
})

// Exportar el contexto para que otros componentes puedan usarlo
export { AuthContext }

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }

  useEffect(() => {
    // Inicializar sistema de autenticación
    initializeAuth()
    
    // Inicializar datos del centro (global)
    initializeCenterData()
    
    // Verificar se hai usuario autenticado
    if (isAuthenticated()) {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      
      // Inicializar datos do usuario
      if (currentUser) {
        initializeUserData()
      }
    }
    
    setIsLoading(false)

    // Escoitar eventos de autenticación
    const handleUserLoggedOut = () => {
      setUser(null)
    }

    const handleUserProfileUpdated = (event: CustomEvent) => {
      setUser(event.detail)
    }

    window.addEventListener('userLoggedOut', handleUserLoggedOut)
    window.addEventListener('userProfileUpdated', handleUserProfileUpdated as EventListener)

    return () => {
      window.removeEventListener('userLoggedOut', handleUserLoggedOut)
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdated as EventListener)
    }
  }, [])

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    initializeUserData()
  }

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando sistema...</div>
        </div>
      </div>
    )
  }

  // Pantalla de login se non hai usuario autenticado
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  // Aplicación principal para usuario autenticado
  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
