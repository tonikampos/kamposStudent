# Instrucciones para GitHub Copilot

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexto del Proyecto

Este es un sistema de gestión académica desarrollado con Next.js, TypeScript y Tailwind CSS para profesores de ciclos formativos. La aplicación incluye:

- Gestión de alumnos con CRUD completo
- Sistema de notas por evaluaciones y asignaturas
- Generación de informes PDF
- Panel de estadísticas y análisis
- Diseño responsive optimizado para móviles

## Pautas de Desarrollo

### Tecnologías Principales
- **Frontend**: Next.js 14 con App Router + React 18 + TypeScript
- **Estilos**: Tailwind CSS con clases personalizadas
- **Base de datos**: SQLite con better-sqlite3
- **Iconos**: Lucide React
- **PDFs**: jsPDF y jsPDF-autoTable

### Patrones de Código
1. **Componentes**: Usar TypeScript interfaces para props
2. **Estados**: Usar useState para estado local, considerar Context para estado global
3. **Estilos**: Preferir clases de Tailwind, usar clases personalizadas definidas en globals.css
4. **Formularios**: Validación en cliente y servidor
5. **Datos**: Simular con datos de ejemplo hasta implementar base de datos real

### Estructura de Archivos
- `/src/app/`: Páginas y rutas (App Router)
- `/src/components/`: Componentes reutilizables
- `/src/lib/`: Utilidades, helpers y configuración
- `/src/types/`: Definiciones de tipos TypeScript

### Estilo de Código
- Usar nombres descriptivos en español para variables relacionadas con el dominio académico
- Comentarios en español para lógica de negocio
- Interfaces y tipos en inglés siguiendo convenciones
- Preferir arrow functions para componentes
- Usar const assertions donde sea apropiado

### Funcionalidades Específicas
- **Responsive**: Todas las interfaces deben funcionar en móvil (uso en aula)
- **PDF**: Generar informes con formato profesional
- **Filtros**: Implementar búsqueda y filtrado en todas las listas
- **Validación**: Validar datos académicos (notas 0-10, emails, etc.)
- **Accesibilidad**: Seguir estándares WCAG para formularios y navegación

### Base de Datos
- Usar SQLite para desarrollo y demos
- Diseñar schema pensando en migración futura a PostgreSQL
- Incluir campos para archivado de cursos anteriores
- Considerar soft deletes para mantener histórico

Cuando generes código, ten en cuenta que es para uso educativo real por profesores, así que prioriza la usabilidad y funcionalidad práctica.
