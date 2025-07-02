import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Student, Subject, EvaluationSystem, TestScore } from '@/types/auth'

interface SubjectGradeData {
  subject: Subject
  evaluationSystem?: EvaluationSystem
  enrollmentId: number
  evaluationGrades: {
    evaluationId: number
    evaluationName: string
    weight: number
    tests: {
      testId: number
      testName: string
      testWeight: number
      score?: number
      maxScore: number
      percentage?: number
    }[]
    evaluationGrade?: number
    evaluationPercentage?: number
  }[]
  finalGrade?: number
  finalPercentage?: number
  status: 'active' | 'completed' | 'withdrawn'
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export const generateStudentGradeReportPDF = (
  student: Student,
  subjectGrades: SubjectGradeData[],
  overallAverage?: number
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORME DE CALIFICACIONES', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  // Student info
  doc.setFontSize(16)
  doc.text(`${student.name} ${student.surname}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Curso: ${student.course}`, 20, yPosition)
  doc.text(`Email: ${student.email}`, 20, yPosition + 7)
  doc.text(`Fecha de Matrícula: ${new Date(student.enrollmentDate).toLocaleDateString('es-ES')}`, 20, yPosition + 14)
  
  if (overallAverage !== undefined) {
    doc.text(`Nota Media General: ${overallAverage.toFixed(2)}`, 120, yPosition)
  }
  
  yPosition += 30

  // Line separator
  doc.setDrawColor(0, 0, 0)
  doc.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 15

  // Subjects grades
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CALIFICACIONES POR ASIGNATURA', 20, yPosition)
  yPosition += 15

  subjectGrades.forEach((subjectGrade, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Subject header
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${subjectGrade.subject.name} (${subjectGrade.subject.code})`, 20, yPosition)
    
    if (subjectGrade.finalGrade !== undefined) {
      doc.text(`Nota Final: ${subjectGrade.finalGrade.toFixed(2)}`, pageWidth - 80, yPosition)
    }
    
    yPosition += 10

    if (subjectGrade.evaluationGrades.length > 0) {
      // Evaluations table
      const evaluationRows = subjectGrade.evaluationGrades.map(evalGrade => [
        evalGrade.evaluationName,
        `${evalGrade.weight}%`,
        evalGrade.evaluationGrade !== undefined ? evalGrade.evaluationGrade.toFixed(2) : 'N/A',
        `${evalGrade.tests.length} pruebas`
      ])

      doc.autoTable({
        startY: yPosition,
        head: [['Evaluación', 'Peso', 'Nota', 'Pruebas']],
        body: evaluationRows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [70, 130, 180] },
        margin: { left: 30, right: 30 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' }
        }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10

      // Tests details for each evaluation
      subjectGrade.evaluationGrades.forEach(evalGrade => {
        if (evalGrade.tests.length > 0 && yPosition < 250) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text(`Pruebas de ${evalGrade.evaluationName}:`, 30, yPosition)
          yPosition += 7

          const testRows = evalGrade.tests.map(test => [
            test.testName,
            `${test.testWeight}%`,
            test.score !== undefined ? `${test.score}/${test.maxScore}` : 'Pendiente',
            test.percentage !== undefined ? `${test.percentage.toFixed(1)}%` : 'N/A'
          ])

          if (yPosition + (testRows.length * 7) > 270) {
            doc.addPage()
            yPosition = 20
          }

          doc.autoTable({
            startY: yPosition,
            head: [['Prueba', 'Peso', 'Puntuación', 'Porcentaje']],
            body: testRows,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [100, 150, 200] },
            margin: { left: 40, right: 40 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 30, halign: 'center' },
              3: { cellWidth: 30, halign: 'center' }
            }
          })

          yPosition = (doc as any).lastAutoTable.finalY + 10
        }
      })
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Sin sistema de evaluación configurado', 30, yPosition)
      yPosition += 15
    }

    yPosition += 10
  })

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Save the PDF
  const fileName = `Informe_${student.name}_${student.surname}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export const generateSubjectSummaryPDF = (
  subject: Subject,
  students: Student[],
  grades: { studentId: number; finalGrade?: number }[]
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`RESUMEN DE CALIFICACIONES`, pageWidth / 2, 20, { align: 'center' })
  doc.text(`${subject.name} (${subject.code})`, pageWidth / 2, 35, { align: 'center' })

  // Statistics
  const completedGrades = grades.filter(g => g.finalGrade !== undefined)
  const average = completedGrades.length > 0 
    ? completedGrades.reduce((sum, g) => sum + g.finalGrade!, 0) / completedGrades.length 
    : 0
  const passRate = completedGrades.filter(g => g.finalGrade! >= 5).length / completedGrades.length * 100

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Curso: ${subject.course}`, 20, 55)
  doc.text(`Total estudiantes: ${students.length}`, 20, 65)
  doc.text(`Calificados: ${completedGrades.length}`, 20, 75)
  doc.text(`Nota media: ${average.toFixed(2)}`, 120, 55)
  doc.text(`Tasa de aprobados: ${passRate.toFixed(1)}%`, 120, 65)

  // Students table
  const tableRows = students.map(student => {
    const gradeData = grades.find(g => g.studentId === student.id)
    return [
      `${student.name} ${student.surname}`,
      student.email,
      gradeData?.finalGrade !== undefined ? gradeData.finalGrade.toFixed(2) : 'Sin calificar',
      gradeData?.finalGrade !== undefined ? (gradeData.finalGrade >= 5 ? 'Aprobado' : 'Suspendido') : 'Pendiente'
    ]
  })

  doc.autoTable({
    startY: 90,
    head: [['Estudiante', 'Email', 'Nota Final', 'Estado']],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [70, 130, 180] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' }
    }
  })

  const fileName = `Resumen_${subject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
