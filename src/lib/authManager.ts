// Sistema de autenticación e xestión de usuarios
'use client'

import { User, LoginCredentials, RegisterData, AuthSession, UserRole } from '@/types/auth'

// === CONSTANTES ===
const AUTH_TOKEN_KEY = 'gestion_academica_token'
const CURRENT_USER_KEY = 'gestion_academica_current_user'
const USERS_STORAGE_KEY = 'gestion_academica_users'
const SESSIONS_STORAGE_KEY = 'gestion_academica_sessions'

// === UTILIDADES DE ENCRIPTACIÓN ===
const hashPassword = async (password: string): Promise<string> => {
  // En produción usaríamos bcrypt ou similar
  // Para o prototipo, usamos unha hash simple
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'gestion_salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const generateToken = (): string => {
  return crypto.randomUUID() + '_' + Date.now().toString(36)
}

// === FUNCIONES DE ALMACENAMENTO ===
const safeJsonParse = <T>(str: string | null, defaultValue: T): T => {
  if (!str) return defaultValue
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

const getUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  return safeJsonParse(localStorage.getItem(USERS_STORAGE_KEY), [])
}

const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const getSessions = (): AuthSession[] => {
  if (typeof window === 'undefined') return []
  return safeJsonParse(localStorage.getItem(SESSIONS_STORAGE_KEY), [])
}

const saveSessions = (sessions: AuthSession[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
}

// === FUNCIONES DE AUTENTICACIÓN ===
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User; token?: string }> => {
  try {
    const users = getUsers()
    const hashedPassword = await hashPassword(credentials.password)
    
    const user = users.find(u => 
      (u.username === credentials.username || u.email === credentials.username) && 
      u.password === hashedPassword && 
      u.isActive
    )

    if (!user) {
      return { success: false, message: 'Credenciais incorrectas ou usuario inactivo' }
    }

    // Crear sesión
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (credentials.rememberMe ? 24 * 30 : 8)) // 30 días ou 8 horas

    const session: AuthSession = {
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
      isActive: true
    }

    // Guardar sesión
    const sessions = getSessions().filter(s => s.userId !== user.id) // Eliminar sesións anteriores
    sessions.push(session)
    saveSessions(sessions)

    // Actualizar último login
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    )
    saveUsers(updatedUsers)

    // Guardar en localStorage para sesión actual
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...user, lastLogin: new Date().toISOString() }))

    return { 
      success: true, 
      message: 'Login correcto', 
      user: { ...user, lastLogin: new Date().toISOString() }, 
      token 
    }
  } catch (error) {
    return { success: false, message: 'Erro interno no login' }
  }
}

export const register = async (data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const users = getUsers()
    
    // Verificar se xa existe
    const existingUser = users.find(u => 
      u.username === data.username || u.email === data.email
    )

    if (existingUser) {
      return { success: false, message: 'O usuario ou email xa existe' }
    }

    // Crear novo usuario
    const hashedPassword = await hashPassword(data.password)
    const now = new Date().toISOString()
    
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      institution: data.institution,
      department: data.department,
      role: 'professor' as UserRole,
      isActive: true,
      preferences: {
        theme: 'light',
        language: 'gl',
        notifications: {
          email: true,
          inApp: true,
          gradeReminders: true,
          reportGeneration: true
        }
      },
      createdAt: now,
      updatedAt: now
    }

    users.push(newUser)
    saveUsers(users)

    return { success: true, message: 'Usuario creado correctamente', user: newUser }
  } catch (error) {
    return { success: false, message: 'Erro interno no rexistro' }
  }
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    // Marcar sesión como inactiva
    const sessions = getSessions().map(s => 
      s.token === token ? { ...s, isActive: false } : s
    )
    saveSessions(sessions)
  }

  // Limpar localStorage
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
  
  // Disparar evento
  window.dispatchEvent(new CustomEvent('userLoggedOut'))
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const user = getCurrentUser()
  
  if (!token || !user) return false
  
  // Verificar se a sesión é válida
  const sessions = getSessions()
  const session = sessions.find(s => s.token === token && s.isActive)
  
  if (!session) return false
  
  // Verificar se non expirou
  const now = new Date()
  const expiresAt = new Date(session.expiresAt)
  
  if (now > expiresAt) {
    logout()
    return false
  }
  
  return true
}

export const updateUserProfile = (updates: Partial<User>): boolean => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return false
    
    const users = getUsers()
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, ...updates, updatedAt: new Date().toISOString() }
        : u
    )
    
    saveUsers(updatedUsers)
    
    // Actualizar usuario actual
    const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }))
    
    return true
  } catch {
    return false
  }
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = getCurrentUser()
    if (!user) return { success: false, message: 'Usuario non autenticado' }
    
    const currentPasswordHash = await hashPassword(currentPassword)
    if (user.password !== currentPasswordHash) {
      return { success: false, message: 'A contrasinal actual é incorrecta' }
    }
    
    const newPasswordHash = await hashPassword(newPassword)
    const success = updateUserProfile({ password: newPasswordHash })
    
    return success 
      ? { success: true, message: 'Contrasinal cambiada correctamente' }
      : { success: false, message: 'Erro ao cambiar a contrasinal' }
  } catch {
    return { success: false, message: 'Erro interno' }
  }
}

// === FUNCIONES DE ADMINISTRACIÓN (só para admins) ===
export const getAllUsers = (): User[] => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== 'admin') return []
  
  return getUsers()
}

export const updateUserStatus = (userId: number, isActive: boolean): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== 'admin') return false
  
  try {
    const users = getUsers()
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, isActive, updatedAt: new Date().toISOString() }
        : u
    )
    
    saveUsers(updatedUsers)
    return true
  } catch {
    return false
  }
}

export const deleteUser = (userId: number): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.role !== 'admin') return false
  
  try {
    const users = getUsers().filter(u => u.id !== userId)
    saveUsers(users)
    
    // Tamén eliminar sesións
    const sessions = getSessions().filter(s => s.userId !== userId)
    saveSessions(sessions)
    
    return true
  } catch {
    return false
  }
}

// === FUNCIONES DE UTILIDADE ===
export const getUserPermissions = (user: User) => {
  const basePermissions = {
    canCreateStudents: true,
    canEditStudents: true,
    canDeleteStudents: true,
    canCreateCourses: true,
    canEditCourses: true,
    canDeleteCourses: true,
    canCreateSubjects: true,
    canEditSubjects: true,
    canDeleteSubjects: true,
    canManageGrades: true,
    canGenerateReports: true,
    canManageBackups: true,
    canMigrateDates: true
  }

  if (user.role === 'admin') {
    return {
      ...basePermissions,
      canManageUsers: true
    }
  }

  return basePermissions
}

// === INICIALIZACIÓN ===
export const initializeAuth = (): void => {
  if (typeof window === 'undefined') return
  
  // Crear usuario admin por defecto se non existe ningún usuario
  const users = getUsers()
  if (users.length === 0) {
    const defaultAdmin: RegisterData = {
      username: 'admin',
      email: 'admin@gestion.local',
      password: 'admin123',
      firstName: 'Administrador',
      lastName: 'Sistema',
      institution: 'Sistema de Xestión Académica'
    }
    
    register(defaultAdmin).then(result => {
      if (result.success && result.user) {
        // Facer admin
        const users = getUsers()
        const updatedUsers = users.map(u => 
          u.id === result.user!.id 
            ? { ...u, role: 'admin' as UserRole }
            : u
        )
        saveUsers(updatedUsers)
        console.log('Usuario admin por defecto creado: admin / admin123')
      }
    })
  }
}
