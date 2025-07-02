// Utilidades para procesar archivos CSV y importar alumnos

export interface CSVStudent {
  nome: string
  apelidos: string
  email: string
  grupos?: string
}

export interface ProcessedStudent {
  name: string
  surname: string
  email: string
  course: string
  enrollmentDate: string
  isActive: boolean
}

// Función para parsear CSV
export const parseCSV = (csvText: string): CSVStudent[] => {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').toLowerCase())
  
  const students: CSVStudent[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length >= 3) {
      const student: CSVStudent = {
        nome: values[0]?.replace(/"/g, '') || '',
        apelidos: values[1]?.replace(/"/g, '') || '',
        email: values[2]?.replace(/"/g, '') || '',
        grupos: values[3]?.replace(/"/g, '') || ''
      }
      
      // Solo agregar si tiene datos válidos
      if (student.nome && student.apelidos && student.email) {
        students.push(student)
      }
    }
  }
  
  return students
}

// Función auxiliar para parsear líneas CSV con comillas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// Función para procesar estudiantes del CSV y convertirlos al formato de la aplicación
export const processStudentsFromCSV = (
  csvStudents: CSVStudent[]
): ProcessedStudent[] => {
  return csvStudents.map(csvStudent => ({
    name: csvStudent.nome,
    surname: csvStudent.apelidos,
    email: csvStudent.email,
    course: '', // Deixar baleiro para que o profesor o asigne manualmente
    enrollmentDate: new Date().toISOString().split('T')[0],
    isActive: true
  }))
}

// Función para validar emails
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para detectar posibles duplicados
export const findDuplicates = (
  newStudents: ProcessedStudent[], 
  existingStudents: any[]
): { duplicateEmails: string[], duplicateNames: string[] } => {
  const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()))
  const existingNames = new Set(existingStudents.map(s => `${s.name} ${s.surname}`.toLowerCase()))
  
  const duplicateEmails = newStudents
    .filter(s => existingEmails.has(s.email.toLowerCase()))
    .map(s => s.email)
  
  const duplicateNames = newStudents
    .filter(s => existingNames.has(`${s.name} ${s.surname}`.toLowerCase()))
    .map(s => `${s.name} ${s.surname}`)
  
  return { duplicateEmails, duplicateNames }
}

// Función para validar datos de estudiantes
export const validateStudents = (students: ProcessedStudent[]): {
  valid: ProcessedStudent[]
  invalid: { student: ProcessedStudent, errors: string[] }[]
} => {
  const valid: ProcessedStudent[] = []
  const invalid: { student: ProcessedStudent, errors: string[] }[] = []
  
  students.forEach(student => {
    const errors: string[] = []
    
    if (!student.name.trim()) {
      errors.push('El nombre es obligatorio')
    }
    
    if (!student.surname.trim()) {
      errors.push('Los apellidos son obligatorios')
    }
    
    if (!student.email.trim()) {
      errors.push('El email es obligatorio')
    } else if (!isValidEmail(student.email)) {
      errors.push('El formato del email no es válido')
    }
    
    if (errors.length === 0) {
      valid.push(student)
    } else {
      invalid.push({ student, errors })
    }
  })
  
  return { valid, invalid }
}
