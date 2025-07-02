# 🎓 Sistema de Xestión Académica

Sistema completo de xestión académica para profesorado de ciclos formativos. Deseñado para xestionar alumnado, notas, xerar informes e obter estatísticas do rendemento académico.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js >= 18
- npm >= 8

### Instalación
```bash
# Clonar o repositorio
git clone [URL_DO_REPOSITORIO]
cd gestion

# Instalar dependencias
npm install

# Arrincar o servidor de desenvolvemento
npm run dev
```

A aplicación estará dispoñible en `http://localhost:3000` (ou no próximo porto libre).

### 🔧 Problemas de arrancada?
Se o servidor se colga ou non arrinca, consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## ✨ Características Principais

### 📚 Gestión de Alumnos
- ✅ Registro completo de estudiantes
- ✅ Información de contacto y matrícula
- ✅ Organización por cursos y ciclos
- ✅ Búsqueda y filtrado avanzado

### 📊 Gestión de Notas
- ✅ Registro de calificaciones por evaluación
- ✅ Seguimiento por asignaturas
- ✅ Comentarios y observaciones
- ✅ Cálculo automático de medias

### 📈 Estadísticas y Análisis
- ✅ Dashboards interactivos
- ✅ Análisis de rendimiento por asignatura
- ✅ Tasas de aprobado y evolución
- ✅ Identificación de áreas de mejora

### 📄 Generación de Informes
- ✅ Informes en PDF personalizables
- ✅ Listados de alumnos
- ✅ Resúmenes de evaluaciones
- ✅ Estadísticas detalladas

### 📱 Diseño Responsive
- ✅ Optimizado para móviles y tablets
- ✅ Interfaz intuitiva y moderna
- ✅ Acceso desde cualquier dispositivo
- ✅ Funcionalidad completa en móvil

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: SQLite (migrable a PostgreSQL)
- **Iconos**: Lucide React
- **PDFs**: jsPDF + jsPDF-AutoTable
- **Gráficos**: Chart.js + React-ChartJS-2

## 📋 Requisitos del Sistema

- Node.js 18 o superior
- npm o yarn
- Navegador web moderno
- 50MB de espacio en disco

## 🚀 Instalación y Configuración

### 1. Instalar Node.js
Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos
La aplicación creará automáticamente la base de datos SQLite en el primer uso.

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5. Compilar para producción
```bash
npm run build
npm start
```

## 🌐 Acceso Remoto

### Configuración para acceso desde exterior:

1. **Configurar router**:
   - Abrir puerto 3000 en el router
   - Crear regla de port forwarding

2. **Configurar Next.js**:
   ```bash
   npm start -- -H 0.0.0.0 -p 3000
   ```

3. **Seguridad recomendada**:
   - Usar HTTPS (certificado SSL)
   - Configurar autenticación
   - Firewall local activado

### Alternativas para acceso remoto:
- **ngrok**: Túnel temporal para pruebas
- **Tailscale**: VPN personal fácil
- **CloudFlare Tunnel**: Acceso seguro sin abrir puertos

## 📊 Base de Datos

### SQLite (Recomendado para empezar)
- **Ventajas**: 
  - Sin configuración adicional
  - Archivo único fácil de respaldar
  - Perfecto para datos moderados (hasta 100GB)
  
- **Respaldos**:
  ```bash
  # Copiar archivo de base de datos
  cp database.sqlite database_backup_$(date +%Y%m%d).sqlite
  ```

### Migración a PostgreSQL (Para crecimiento)
```bash
# Instalar PostgreSQL
# Modificar configuración en lib/database.ts
# Migrar datos existentes
```

## 📁 Estructura del Proyecto

```
gestion/
├── src/
│   ├── app/           # Páginas y rutas (App Router)
│   ├── components/    # Componentes React
│   ├── lib/          # Utilidades y configuración
│   └── types/        # Definiciones TypeScript
├── public/           # Archivos estáticos
├── database/         # Base de datos SQLite
└── docs/            # Documentación
```

## 🔧 Funcionalidades Detalladas

### Gestión de Alumnos
- Formulario completo de registro
- Datos de contacto y académicos
- Historial académico
- Fotos de perfil (opcional)

### Sistema de Notas
- Evaluaciones: 1ª, 2ª, 3ª y Final
- Múltiples asignaturas por curso
- Comentarios del profesor
- Histórico de modificaciones

### Informes PDF
- Plantillas personalizables
- Logos institucionales
- Filtros por fecha/curso/asignatura
- Firmas digitales

### Panel de Estadísticas
- Gráficos interactivos
- Comparativas entre evaluaciones
- Análisis de tendencias
- Alertas de rendimiento

## 📱 Uso en Móvil

### Funciones optimizadas para móvil:
- **Pasar lista**: Interfaz táctil rápida
- **Consultar notas**: Vista optimizada
- **Añadir calificaciones**: Formularios móviles
- **Ver estadísticas**: Gráficos responsive

### PWA (Progressive Web App):
- Funciona offline (datos locais)
- Instalable como app nativa
- Notificaciones push (futuro)

## 🔒 Seguridad

### Medidas implementadas:
- Autenticación JWT
- Validación de datos
- Protección CSRF
- Encriptación de contraseñas

### Recomendaciones adicionales:
- Cambiar contraseñas regularmente
- Usar HTTPS en producción
- Respaldar datos regularmente

## 📦 Respaldo y Archivado

### Respaldos automáticos:
```bash
# Cron job para respaldo diario
0 2 * * * cp /ruta/database.sqlite /respaldos/backup_$(date +\%Y\%m\%d).sqlite
```

### Archivado de cursos anteriores:
- Exportar datos a PDF
- Comprimir base de datos antiga
- Mantener histórico accesible

## 🆘 Resolución de Problemas

### Problemas comunes:

1. **No se ven las notas**:
   - Verificar filtros aplicados
   - Comprobar permisos de usuario

2. **Error al generar PDF**:
   - Verificar espacio en disco
   - Comprobar permisos de escritura

3. **Lentitud en la aplicación**:
   - Limpiar caché do navegador
   - Optimizar base de datos

### Logs de error:
```bash
# Ver logs de la aplicación
tail -f logs/app.log
```

## 🔄 Actualizaciones

### Mantener actualizado:
```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

## 📞 Soporte

Para soporte técnico ou consultas:
- Documentación: `/docs`
- GitHub Issues: Para reportar bugs
- Email: [tu-email@educacion.es]

## 📜 Licencia

Este proxecto está baixo a licencia MIT. Ver arquivo `LICENSE` para máis detalles.

## 🚀 Roadmap

### Próximas funcionalidades:
- [ ] Módulo de asistencia
- [ ] Chat profesor-alumno
- [ ] Calendario de exámenes
- [ ] Integración con Moodle
- [ ] App móvil nativa
- [ ] Módulo de pais/tutores

### Mejoras planificadas:
- [ ] Más tipos de gráficos
- [ ] Plantillas de informes avanzadas
- [ ] Sistema de notificaciones
- [ ] Backup automático en la nube
- [ ] Multi-idioma

---

**¡Listo para revolucionar tu gestión académica!** 🎓

A aplicación está deseñada pensando na experiencia do profesor de ciclos formativos, combinando simplicidade de uso cunha potencia funcional.

## 🌐 Despliegue en Netlify

Este proxecto está configurado para ser despregado en Netlify. Para despregar na túa propia instancia de Netlify:

1. Fai un fork deste repositorio ou clónalo e súbeo ao teu propio repositorio en GitHub
2. Inicia sesión en [Netlify](https://www.netlify.com/)
3. Fai clic en "New site from Git" e selecciona GitHub
4. Atopa e selecciona o teu repositorio
5. Configuración de despregue:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Fai clic en "Deploy site"

Netlify detectará automaticamente que é un proxecto Next.js e aplicará a configuración necesaria grazas ao arquivo `netlify.toml` incluído no repositorio.

### ⚙️ Variables de entorno (se son necesarias)

Se necesitas configurar variables de entorno para o teu despregue, podes facelo na sección "Site settings" > "Build & deploy" > "Environment variables" do teu panel de control de Netlify.
