# 🔧 Guía de Solución de Problemas

## Problemas Comúns e Solucions

### 🚫 O servidor non arrinca ou se colga

**Síntomas:**
- O comando `npm run dev` queda colgado
- Non se mostra a URL do servidor
- A aplicación non carga no navegador

**Solucións:**

1. **Limpar cache e reiniciar:**
   ```bash
   npm run clean
   npm run reset
   npm run dev
   ```

2. **Verificar portos ocupados:**
   - O servidor buscará automaticamente un porto libre (3000, 3001, 3002, etc.)
   - Se todos están ocupados, mata os procesos:
   ```bash
   # En Windows PowerShell
   Get-Process -Name "node" | Stop-Process -Force
   
   # Ou usar netstat para buscar procesos
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```

3. **Usar modo turbo para maior velocidade:**
   ```bash
   npm run dev:clean
   ```

### 💾 Problemas con localStorage

**Síntomas:**
- Datos non se gardan
- Errores de "localStorage is not defined"

**Solucións:**

1. **Limpar localStorage no navegador:**
   - Abrir DevTools (F12)
   - Ir a Application/Storage → Local Storage
   - Borrar todo o contenido

2. **Reinicializar datos desde a aplicación:**
   - Ir a Configuración → Xestión de Datos
   - Usar "Limpar todos os datos"

### 🔄 Problemas de migración de datos

**Síntomas:**
- A migración ao seguinte ano non funciona
- Datos non aparecen no novo ano

**Solucións:**

1. **Verificar que hai anos académicos configurados:**
   - A aplicación precisa ter polo menos 2 anos académicos
   - Formato: "2024-25", "2025-26", etc.

2. **Usar migración selectiva:**
   - Ir a Configuración → Migración Selectiva
   - Marcar só os datos que necesites migrar
   - Confirmar a operación

### 📱 Problemas de responsive design

**Síntomas:**
- Interface non se adapta ao móbil
- Botóns ou textos moi pequenos

**Solucións:**

1. **Limpar cache do navegador:**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

2. **Verificar zoom do navegador:**
   - Debe estar ao 100%

### 🎯 Problemas de compilación TypeScript

**Síntomas:**
- Erros de tipos en consola
- Aplicación non compila

**Solucions:**

1. **Verificar todos os erros:**
   ```bash
   npm run lint
   ```

2. **Compilar en modo produción para verificar:**
   ```bash
   npm run build
   ```

## 🆘 Se nada funciona

1. **Backup dos datos importantes:**
   - Ir a Configuración → Copias de Seguridade
   - Descargar copia antes de facer cambios drásticos

2. **Reinstalación completa:**
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   npm run dev
   ```

3. **Verificar versións:**
   ```bash
   node --version  # Debe ser >= 18
   npm --version   # Debe ser >= 8
   ```

## 📞 Soporte

Se o problema persiste:
1. Anota o erro exacto da consola
2. Indica que estabas a facer cando ocorreu
3. Menciona o navegador e sistema operativo
4. Proporciona os logs da consola do navegador (F12)

---

**Última actualización:** Xuño 2025  
**Versión da aplicación:** 1.0.0
