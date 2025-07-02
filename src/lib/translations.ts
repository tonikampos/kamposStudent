// Diccionario de traducciones español-gallego para la aplicación

export const translations: Record<string, string> = {
  // Títulos principales
  'Gestión de Alumnos': 'Xestión do Alumnado',
  'Gestión de Asignaturas': 'Xestión de Materias', 
  'Gestión de Cursos': 'Xestión de Cursos',
  'Gestión de Matriculaciones': 'Xestión de Matrículas',
  'Gestión de Evaluaciones': 'Xestión de Avaliacións',
  'Gestión de Notas': 'Xestión de Notas',
  'Gestión Académica': 'Xestión Académica',
  'Copias de Seguridad': 'Copias de Seguridade',
  
  // Acciones
  'Añadir': 'Engadir',
  'Añadir Alumno': 'Engadir Estudante',
  'Añadir Asignatura': 'Engadir Materia',
  'Añadir Curso': 'Engadir Curso',
  'Editar': 'Editar',
  'Editar Alumno': 'Editar Estudante',
  'Editar Asignatura': 'Editar Materia',
  'Eliminar': 'Eliminar',
  'Buscar': 'Buscar',
  'Guardar': 'Gardar',
  'Cancelar': 'Cancelar',
  'Confirmar': 'Confirmar',
  'Aceptar': 'Aceptar',
  'Cerrar': 'Pechar',
  
  // Campos de formulario
  'Nombre': 'Nome',
  'Apellidos': 'Apelidos',
  'Email': 'Email',
  'Teléfono': 'Teléfono',
  'Curso': 'Curso',
  'Fecha de Matrícula': 'Data de Matrícula',
  'Fecha Matrícula': 'Data Matrícula',
  'Fecha de Nacimiento': 'Data de Nacemento',
  'Dirección': 'Enderezo',
  'Contacto de Emergencia': 'Contacto de Emerxencia',
  'Descripción': 'Descrición',
  'Código': 'Código',
  'Créditos': 'Créditos',
  'Color': 'Cor',
  
  // Estados y mensajes
  'Activo': 'Activo',
  'Inactivo': 'Inactivo',
  'Todos': 'Todos',
  'Ninguno': 'Ningún',
  'Sí': 'Si',
  'No': 'Non',
  
  // Plurales
  'Alumnos': 'Estudantes',
  'Estudiantes': 'Estudantes',
  'Asignaturas': 'Materias',
  'Cursos': 'Cursos',
  'Matriculaciones': 'Matrículas',
  'Evaluaciones': 'Avaliacións',
  'Notas': 'Notas',
  'Acciones': 'Accións',
  
  // Mensajes de confirmación
  '¿Estás seguro?': '¿Tes a certeza?',
  '¿Estás seguro de que quieres eliminar': '¿Tes a certeza de que queres eliminar',
  'este alumno': 'este estudante',
  'este estudiante': 'este estudante',
  'esta asignatura': 'esta materia',
  'este curso': 'este curso',
  
  // Placeholders
  'Buscar alumnos...': 'Buscar estudantes...',
  'Buscar asignaturas...': 'Buscar materias...',
  'Buscar cursos...': 'Buscar cursos...',
  
  // Informes y estadísticas
  'Informes': 'Informes',
  'Estadísticas': 'Estatísticas',
  'Ver Informe': 'Ver Informe',
  'Generar Informe': 'Xerar Informe',
  'Exportar': 'Exportar',
  'Importar': 'Importar',
  
  // Navegación
  'Configuración': 'Configuración',
  'Ajustes': 'Axustes',
  'Perfil': 'Perfil',
  
  // Copias de seguridad
  'Crear Copia': 'Crear Copia',
  'Restaurar': 'Restaurar',
  'Descargar': 'Descargar',
  'Subir': 'Subir',
  
  // Años académicos
  'Año Académico': 'Ano Académico',
  'Cambiar Año': 'Cambiar Ano',
  
  // Evaluaciones
  'Primera Evaluación': 'Primeira Avaliación',
  'Segunda Evaluación': 'Segunda Avaliación', 
  'Tercera Evaluación': 'Terceira Avaliación',
  'Evaluación Final': 'Avaliación Final',
  'Examen': 'Exame',
  'Práctica': 'Práctica',
  'Proyecto': 'Proxecto',
  'Presentación': 'Presentación',
  
  // Otros términos comunes
  'Seleccionar': 'Seleccionar',
  'Opcional': 'Opcional',
  'Obligatorio': 'Obrigatorio',
  'Completado': 'Completado',
  'Pendiente': 'Pendente',
  'Error': 'Erro',
  'Éxito': 'Éxito',
  'Información': 'Información',
  'Advertencia': 'Advertencia'
}

// Función para aplicar traducciones a un texto
export const translateText = (text: string): string => {
  return translations[text] || text
}

// Función para aplicar traducciones a múltiples textos
export const translateTexts = (texts: string[]): string[] => {
  return texts.map(text => translateText(text))
}
