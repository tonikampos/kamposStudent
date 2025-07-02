'use client'

import { useState } from 'react'
import { User, LogOut, Settings, ChevronDown, Building, Mail } from 'lucide-react'
import { logout } from '@/lib/authManager'
import { useAuth } from './AuthProvider'

export default function UserHeader() {
  const { user } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'coordinator': return 'Coordinador'
      case 'professor': return 'Profesor'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'coordinator': return 'bg-purple-100 text-purple-800'
      case 'professor': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Xestión Académica</h1>
            <div className="text-xs text-gray-500">Versión 2.0 - Multiusuario</div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>

            {/* Info usuario */}
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
              showUserMenu ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Menú desplegable */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* Información del usuario */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 truncate">@{user.username}</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.institution && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="h-4 w-4" />
                    <span className="truncate">{user.institution}</span>
                  </div>
                )}
                {user.department && (
                  <div className="text-gray-500 text-xs">
                    Departamento: {user.department}
                  </div>
                )}
                {user.lastLogin && (
                  <div className="text-gray-500 text-xs">
                    Último acceso: {new Date(user.lastLogin).toLocaleString('gl')}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    // TODO: Abrir configuración de perfil
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Configuración de Perfil
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Pechar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop para cerrar el menú */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}
