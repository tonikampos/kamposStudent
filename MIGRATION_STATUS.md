# 🔄 Migración a Sistema Multiusuario - Estado Actual

## ✅ Completado

### 1. Sistema de Autenticación
- ✅ Tipos de usuario e autenticación (`/types/auth.ts`)
- ✅ Xestor de autenticación (`/lib/authManager.ts`)
- ✅ Xestor de datos por usuario (`/lib/userDataManager.ts`)
- ✅ Compoñente de login/rexistro (`/components/AuthForm.tsx`)
- ✅ Provider de autenticación (`/components/AuthProvider.tsx`)
- ✅ Header de usuario (`/components/UserHeader.tsx`)

### 2. Estrutura Base
- ✅ Layout principal actualizado con AuthProvider
- ✅ Página principal con UserHeader integrado
- ✅ Usuario admin por defecto (admin/admin123)

### 3. Tipos e Interfaces
- ✅ Novos tipos con soporte para `userId`
- ✅ Permisos por rol de usuario
- ✅ Contexto de aplicación multiusuario

## 🔄 En Proceso

### Compoñentes que necesitan actualización:
1. **StudentManagement.tsx** - ✅ Completado
2. **SubjectManagement.tsx** - ✅ Completado
3. **CourseManagement.tsx** - ✅ Completado
4. **EnrollmentManagement.tsx** - ✅ Completado
5. **EvaluationSystemManagement.tsx** - ⚠️ Necesita reescritura (tipos incompatibles)
6. **GradeManagement.tsx** - ✅ Completado
7. **Reports.tsx** - ✅ Completado
8. **Statistics.tsx** - ✅ Completado
9. **BackupManager.tsx** - ⚠️ Necesita adaptación (funciones cambiadas)
10. **ConfigurationManager.tsx** - ✅ Completado

### Librerías de soporte:
- **csvImport.ts** - ✅ Completado
- **Outros helpers** - ⚠️ Pendente de revisión

## 📋 Próximos Pasos

### Paso 1: Actualizar Compoñentes Restantes
```bash
# Para cada compoñente, cambiar:
import { Student, Subject, ... } from '@/types'
# Por:
import { Student, Subject, ... } from '@/types/auth'

# Y cambiar:
import { ... } from '@/lib/dataManager'
# Por:
import { ... } from '@/lib/userDataManager'
```

### Paso 2: Actualizar Funcións de CRUD
- As novas funcións require `userId` nos datos
- `updateX(id, updates)` agora require ID separado
- `addX(data)` xa non require `id` nos datos de entrada

### Paso 3: Verificar Tipos
- Todos os datos agora teñen campo `userId`
- Algunhas funcións poden ter cambios na sinatura

### Paso 4: Probar Funcionalidade
1. Rexistro de novos usuarios
2. Login/logout
3. Datos separados por usuario
4. Migración de datos
5. Backup/restore por usuario

## 🔧 Script de Migración Automática

Para acelerar o proceso, podes executar estes comandos:

```bash
# Cambiar imports de tipos
find src/components -name "*.tsx" -exec sed -i 's/from "@\/types"/from "@\/types\/auth"/g' {} \;

# Cambiar imports de dataManager
find src/components -name "*.tsx" -exec sed -i 's/from "@\/lib\/dataManager"/from "@\/lib\/userDataManager"/g' {} \;
```

## 🚀 Beneficios da Nova Arquitectura

1. **Separación de datos**: Cada profesor ten os seus propios datos
2. **Seguridade**: Autenticación e autorización
3. **Escalabilidade**: Fácil engadir novos usuarios
4. **Backup individual**: Cada usuario pode facer backup dos seus datos
5. **Migración selectiva**: Por usuario e ano académico

## 📝 Notas Importantes

- O localStorage agora usa prefixos por usuario: `user_1_gestion_students`
- Os datos anónimos/temporais usan prefixo `guest_`
- As funcións de backup agora son por usuario
- A migración de ano académico mantense pero é por usuario

## 🔐 Usuarios por Defecto

```
Admin: admin / admin123
- Pode xestionar todos os usuarios
- Acceso completo ao sistema
```

Cada novo usuario rexistrado ten:
- Rol: 'professor'
- Datos baleiros iniciais
- Acceso só aos seus propios datos

---
**Estado**: 30% completado
**Último update**: Xuño 2025
