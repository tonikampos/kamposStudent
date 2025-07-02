import jsPDF from 'jspdf'
import { Subject, EvaluationSystem, TestScore } from '@/types/auth'

interface StudentGrade {
  student: {
    id: number
    name: string
    surname: string
    email: string
    course: string
  }
  finalGrade: number
  evaluationGrades: { [evaluationId: number]: number }
  testScores: { [testId: number]: TestScore }
  status: 'pass' | 'fail' | 'pending'
}

interface SubjectReportData {
  subject: Subject
  studentGrades: StudentGrade[]
  evaluationSystem: EvaluationSystem | null
  generatedAt: string
}

export const generateSubjectSummaryPDF = (data: SubjectReportData) => {
  const pdf = new jsPDF()
  const { subject, studentGrades } = data
  
  // Configuración del documento
  pdf.setFont('helvetica')
  
  // Título principal
  pdf.setFontSize(20)
  pdf.text('INFORME RESUMEN DE CALIFICACIONES', 20, 25)
  
  // Información de la asignatura
  pdf.setFontSize(14)
  pdf.text(`Asignatura: ${subject.name}`, 20, 40)
  pdf.setFontSize(12)
  pdf.text(`Código: ${subject.code}`, 20, 50)
  pdf.text(`Curso: ${subject.course}`, 20, 60)
  pdf.text(`Créditos: ${subject.credits} ECTS`, 20, 70)
  pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 80)
  
  // Estadísticas
  const totalStudents = studentGrades.length
  const passedStudents = studentGrades.filter(g => g.status === 'pass').length
  const failedStudents = studentGrades.filter(g => g.status === 'fail').length
  const averageGrade = totalStudents > 0 
    ? (studentGrades.reduce((sum, g) => sum + g.finalGrade, 0) / totalStudents).toFixed(2)
    : '0.00'
  
  pdf.setFontSize(14)
  pdf.text('ESTADÍSTICAS GENERALES', 20, 100)
  pdf.setFontSize(12)
  pdf.text(`Total de alumnos: ${totalStudents}`, 20, 115)
  pdf.text(`Aprobados: ${passedStudents} (${totalStudents > 0 ? ((passedStudents/totalStudents)*100).toFixed(1) : '0'}%)`, 20, 125)
  pdf.text(`Suspensos: ${failedStudents} (${totalStudents > 0 ? ((failedStudents/totalStudents)*100).toFixed(1) : '0'}%)`, 20, 135)
  pdf.text(`Nota media: ${averageGrade}`, 20, 145)
  
  // Tabla de calificaciones
  pdf.setFontSize(14)
  pdf.text('CALIFICACIONES POR ALUMNO', 20, 165)
  
  // Encabezados de tabla
  pdf.setFontSize(10)
  pdf.text('Apellidos, Nombre', 20, 180)
  pdf.text('Nota Final', 120, 180)
  pdf.text('Estado', 160, 180)
  
  // Línea separadora
  pdf.line(20, 185, 190, 185)
  
  let yPosition = 195
  const pageHeight = pdf.internal.pageSize.height
  
  // Ordenar estudiantes por apellido
  const sortedStudents = [...studentGrades].sort((a, b) => 
    `${a.student.surname} ${a.student.name}`.localeCompare(`${b.student.surname} ${b.student.name}`)
  )
  
  sortedStudents.forEach((studentGrade, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = 30
      
      // Repetir encabezados
      pdf.setFontSize(10)
      pdf.text('Apellidos, Nombre', 20, yPosition - 10)
      pdf.text('Nota Final', 120, yPosition - 10)
      pdf.text('Estado', 160, yPosition - 10)
      pdf.line(20, yPosition - 5, 190, yPosition - 5)
    }
    
    const studentName = `${studentGrade.student.surname}, ${studentGrade.student.name}`
    const finalGrade = studentGrade.finalGrade.toFixed(2)
    const status = studentGrade.status === 'pass' ? 'APROBADO' : 
                  studentGrade.status === 'fail' ? 'SUSPENSO' : 'PENDIENTE'
    
    pdf.text(studentName.substring(0, 35), 20, yPosition)
    pdf.text(finalGrade, 120, yPosition)
    pdf.text(status, 160, yPosition)
    
    yPosition += 10
  })
  
  // Pie de página
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(`Página ${i} de ${totalPages}`, 170, pageHeight - 10)
  }
  
  // Descargar PDF
  const fileName = `${subject.code}_${subject.name.replace(/[^a-zA-Z0-9]/g, '_')}_resumen.pdf`
  pdf.save(fileName)
}

export const generateSubjectDetailedPDF = (data: SubjectReportData) => {
  const pdf = new jsPDF()
  const { subject, studentGrades, evaluationSystem } = data
  
  // Configuración del documento
  pdf.setFont('helvetica')
  
  // Título principal
  pdf.setFontSize(20)
  pdf.text('INFORME DETALLADO DE CALIFICACIONES', 20, 25)
  
  // Información de la asignatura
  pdf.setFontSize(14)
  pdf.text(`Asignatura: ${subject.name}`, 20, 40)
  pdf.setFontSize(12)
  pdf.text(`Código: ${subject.code}`, 20, 50)
  pdf.text(`Curso: ${subject.course}`, 20, 60)
  pdf.text(`Créditos: ${subject.credits} ECTS`, 20, 70)
  pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 80)
  
  // Sistema de evaluación
  if (evaluationSystem) {
    pdf.setFontSize(14)
    pdf.text('SISTEMA DE EVALUACIÓN', 20, 100)
    pdf.setFontSize(10)
    
    let yPos = 115
    evaluationSystem.evaluations.forEach((evaluation, index) => {
      pdf.text(`${evaluation.name}: ${evaluation.weight}% de la nota final`, 25, yPos)
      yPos += 8
      
      evaluation.tests.forEach((test, testIndex) => {
        pdf.text(`  • ${test.name} (${test.type}): ${test.weight}% de la evaluación`, 30, yPos)
        yPos += 6
      })
      yPos += 3
    })
  }
  
  // Ordenar estudiantes por apellido
  const sortedStudents = [...studentGrades].sort((a, b) => 
    `${a.student.surname} ${a.student.name}`.localeCompare(`${b.student.surname} ${b.student.name}`)
  )
  
  // Detalles por estudiante
  sortedStudents.forEach((studentGrade, studentIndex) => {
    pdf.addPage()
    
    // Información del estudiante
    pdf.setFontSize(16)
    pdf.text(`${studentGrade.student.surname}, ${studentGrade.student.name}`, 20, 30)
    
    pdf.setFontSize(12)
    pdf.text(`Email: ${studentGrade.student.email}`, 20, 45)
    pdf.text(`Curso: ${studentGrade.student.course}`, 20, 55)
    pdf.text(`Nota Final: ${studentGrade.finalGrade.toFixed(2)}`, 20, 65)
    
    const status = studentGrade.status === 'pass' ? 'APROBADO' : 
                  studentGrade.status === 'fail' ? 'SUSPENSO' : 'PENDIENTE'
    pdf.text(`Estado: ${status}`, 20, 75)
    
    // Línea separadora
    pdf.line(20, 85, 190, 85)
    
    let yPosition = 100
    
    if (evaluationSystem) {
      pdf.setFontSize(14)
      pdf.text('CALIFICACIONES POR EVALUACIÓN', 20, yPosition)
      yPosition += 20
      
      evaluationSystem.evaluations.forEach((evaluation) => {
        pdf.setFontSize(12)
        pdf.text(`${evaluation.name} (${evaluation.weight}% del total)`, 20, yPosition)
        
        const evalGrade = studentGrade.evaluationGrades[evaluation.id] || 0
        pdf.text(`Nota: ${evalGrade.toFixed(2)}`, 140, yPosition)
        yPosition += 15
        
        // Detalles de las pruebas
        pdf.setFontSize(10)
        evaluation.tests.forEach((test) => {
          const testScore = Object.values(studentGrade.testScores).find(score => score.testId === test.id)
          
          pdf.text(`• ${test.name} (${test.weight}%):`, 25, yPosition)
          
          if (testScore) {
            const normalizedScore = (testScore.score / testScore.maxScore) * 10
            pdf.text(`${testScore.score}/${testScore.maxScore} (${normalizedScore.toFixed(2)})`, 140, yPosition)
          } else {
            pdf.text('Sin calificar', 140, yPosition)
          }
          
          yPosition += 8
        })
        
        yPosition += 10
      })
    }
    
    // Pie de página
    pdf.setFontSize(8)
    pdf.text(`Alumno ${studentIndex + 1} de ${sortedStudents.length}`, 20, 280)
    pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 140, 280)
  })
  
  // Descargar PDF
  const fileName = `${subject.code}_${subject.name.replace(/[^a-zA-Z0-9]/g, '_')}_detallado.pdf`
  pdf.save(fileName)
}
