'use client'

import { useState, useEffect } from 'react'
import { Download, FileText } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { Subject, Student, Enrollment, TestScore, EvaluationSystem } from '@/types/auth'
import { getSubjects, getStudents, getEnrollments, getEvaluationSystems, getTestScores, cleanAllUserData, cleanCorruptedData } from '@/lib/userDataManager'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportData {
  id: string
  name: string
  type: string
  description: string
  format: string
}

export default function Reports() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  
  // Estados para datos reales del usuario
  const [userSubjects, setUserSubjects] = useState<Subject[]>([])

  // Mostrar mensaje si no hay usuario autenticado
  if (!user) {
    return <div>Cargando...</div>
  }

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      // Cargar materias del usuario
      const subjects = getSubjects()
      console.log(`[Reports] Materias cargadas para usuario ${user.id}:`, subjects.length, subjects.map(s => ({ 
        id: s.id, 
        name: s.name, 
        code: s.code,
        userId: s.userId 
      })))
      setUserSubjects(subjects)
    }
  }, [user])

  const reportTypes: ReportData[] = [
    {
      id: 'student-list',
      name: 'Listado de Alumnos',
      type: 'students',
      description: 'Lista completa de alumnos matriculados con información de contacto',
      format: 'PDF'
    },
    {
      id: 'grade-report',
      name: 'Informe de Notas',
      type: 'grades',
      description: 'Resumen de calificacións por materia (requiere seleccionar materia)',
      format: 'PDF'
    },
    {
      id: 'evaluation-summary',
      name: 'Resumen por Evaluación',
      type: 'evaluation',
      description: 'Análise detallado de resultados por evaluación',
      format: 'PDF'
    }
  ]

  const handleGenerateReport = () => {
    if (!selectedReport) {
      alert('Por favor, selecciona un tipo de informe')
      return
    }

    // Verificar que el usuario tenga materias disponibles
    if (userSubjects.length === 0) {
      alert('❌ Non podes xerar informes sen ter materias asignadas. Crea materias primeiro en "Xestión de Materias".')
      return
    }

    const selectedSubjectData = selectedSubject !== 'all' 
      ? userSubjects.find(s => s.id.toString() === selectedSubject) || null
      : null

    // Validación adicional: asegurar que la materia pertenece al usuario actual
    if (selectedSubject !== 'all' && !selectedSubjectData) {
      alert('❌ A materia seleccionada non é válida ou non tes permisos para acceder a ela.')
      return
    }

    const report = reportTypes.find(r => r.id === selectedReport)
    if (!report) return

    try {
      generatePDF(report, selectedSubjectData)
      
      const subjectInfo = selectedSubjectData 
        ? ` de ${selectedSubjectData.name}` 
        : ''
      
      alert(`✅ ${report.name}${subjectInfo} xerado e descargado correctamente`)
    } catch (error) {
      console.error('Error al generar informe:', error)
      alert('❌ Erro ao xerar o informe. Por favor, inténtao de novo.')
    }
  }

  const generatePDF = (report: ReportData, subjectData?: Subject | null) => {
    // Obtener datos según el tipo de informe
    const students = getStudents()
    const enrollments = getEnrollments()
    const testScores = getTestScores()
    const evaluationSystems = getEvaluationSystems()

    let reportData: any = {}
    let fileName = ''

    switch (report.id) {
      case 'student-list':
        reportData = generateStudentListData(students, enrollments, subjectData)
        fileName = `Listado_Alumnos_${subjectData ? subjectData.code : 'Todos'}_${new Date().toISOString().split('T')[0]}.pdf`
        break

      case 'grade-report':
        if (!subjectData) {
          alert('Debes seleccionar unha materia para xerar o informe de notas')
          return
        }
        reportData = generateGradeReportData(students, enrollments, testScores, evaluationSystems, subjectData)
        fileName = `Informe_Notas_${subjectData.code}_${new Date().toISOString().split('T')[0]}.pdf`
        break

      case 'evaluation-summary':
        reportData = generateEvaluationSummaryData(students, enrollments, testScores, evaluationSystems, subjectData)
        fileName = `Resumen_Evaluacion_${subjectData ? subjectData.code : 'Todas'}_${new Date().toISOString().split('T')[0]}.pdf`
        break

      default:
        throw new Error('Tipo de informe no válido')
    }

    // Generar PDF usando una librería simple
    createAndDownloadPDF(report, reportData, fileName)
  }

  const generateStudentListData = (students: Student[], enrollments: Enrollment[], subjectData?: Subject | null) => {
    if (subjectData) {
      // Estudiantes de una materia específica
      const subjectEnrollments = enrollments.filter(e => e.subjectId === subjectData.id && e.isActive)
      const enrolledStudents = students.filter(s => 
        subjectEnrollments.some(e => e.studentId === s.id) && s.isActive
      )
      return {
        title: `Listado de Alumnos - ${subjectData.name}`,
        subtitle: `Materia: ${subjectData.code} | Curso: ${subjectData.course}`,
        students: enrolledStudents,
        total: enrolledStudents.length
      }
    } else {
      // Todos los estudiantes matriculados en materias del profesor actual
      const userSubjectIds = userSubjects.map(s => s.id)
      const userEnrollments = enrollments.filter(e => 
        userSubjectIds.includes(e.subjectId) && e.isActive
      )
      const enrolledStudentIds = Array.from(new Set(userEnrollments.map(e => e.studentId)))
      const enrolledStudents = students.filter(s => 
        enrolledStudentIds.includes(s.id) && s.isActive
      )
      
      return {
        title: 'Listado de Alumnos - Todas as Materias',
        subtitle: `Alumnos matriculados nas túas ${userSubjects.length} materias`,
        students: enrolledStudents,
        total: enrolledStudents.length
      }
    }
  }

  const generateGradeReportData = (
    students: Student[], 
    enrollments: Enrollment[], 
    testScores: TestScore[], 
    evaluationSystems: EvaluationSystem[], 
    subjectData: Subject
  ) => {
    const subjectEnrollments = enrollments.filter(e => e.subjectId === subjectData.id && e.isActive)
    const enrolledStudents = students.filter(s => 
      subjectEnrollments.some(e => e.studentId === s.id) && s.isActive
    )
    const evaluationSystem = evaluationSystems.find(es => es.subjectId === subjectData.id)

    const studentsWithGrades = enrolledStudents.map(student => {
      const studentScores = testScores.filter(score => score.studentId === student.id)
      
      let finalGrade = 0
      const evaluationGrades: any[] = []

      if (evaluationSystem) {
        evaluationSystem.evaluations.forEach(evaluation => {
          let evalScore = 0
          let totalWeight = 0

          evaluation.tests.forEach(test => {
            const score = studentScores.find(s => s.testId === test.id)
            if (score) {
              const normalizedScore = (score.score / (score.maxScore || 10)) * 10
              evalScore += normalizedScore * (test.weight / 100)
              totalWeight += test.weight
            }
          })

          if (totalWeight > 0) {
            const evalFinalScore = totalWeight < 100 ? (evalScore / totalWeight) * 100 : evalScore
            evaluationGrades.push({
              name: evaluation.name,
              grade: evalFinalScore.toFixed(2),
              weight: evaluation.weight
            })
            finalGrade += evalFinalScore * (evaluation.weight / 100)
          }
        })
      }

      return {
        ...student,
        evaluationGrades,
        finalGrade: finalGrade.toFixed(2),
        status: finalGrade >= 5 ? 'Aprobado' : finalGrade > 0 ? 'Suspenso' : 'Sin evaluar'
      }
    })

    return {
      title: `Informe de Notas - ${subjectData.name}`,
      subtitle: `${subjectData.code} | ${subjectData.course} | ${subjectData.credits} créditos`,
      subject: subjectData,
      students: studentsWithGrades,
      total: studentsWithGrades.length,
      passed: studentsWithGrades.filter(s => parseFloat(s.finalGrade) >= 5).length,
      failed: studentsWithGrades.filter(s => parseFloat(s.finalGrade) > 0 && parseFloat(s.finalGrade) < 5).length,
      pending: studentsWithGrades.filter(s => parseFloat(s.finalGrade) === 0).length
    }
  }

  const generateEvaluationSummaryData = (
    students: Student[], 
    enrollments: Enrollment[], 
    testScores: TestScore[], 
    evaluationSystems: EvaluationSystem[], 
    subjectData?: Subject | null
  ) => {
    const subjects = subjectData ? [subjectData] : userSubjects
    const summaryData: any[] = []

    subjects.forEach(subject => {
      const evaluationSystem = evaluationSystems.find(es => es.subjectId === subject.id)
      if (!evaluationSystem) return

      const subjectEnrollments = enrollments.filter(e => e.subjectId === subject.id && e.isActive)
      const enrolledStudents = students.filter(s => 
        subjectEnrollments.some(e => e.studentId === s.id) && s.isActive
      )

      evaluationSystem.evaluations.forEach(evaluation => {
        const evaluationScores: number[] = []

        enrolledStudents.forEach(student => {
          const studentScores = testScores.filter(score => score.studentId === student.id)
          let evalScore = 0
          let totalWeight = 0

          evaluation.tests.forEach(test => {
            const score = studentScores.find(s => s.testId === test.id)
            if (score) {
              const normalizedScore = (score.score / (score.maxScore || 10)) * 10
              evalScore += normalizedScore * (test.weight / 100)
              totalWeight += test.weight
            }
          })

          if (totalWeight > 0) {
            const finalScore = totalWeight < 100 ? (evalScore / totalWeight) * 100 : evalScore
            evaluationScores.push(finalScore)
          }
        })

        summaryData.push({
          subject: subject.name,
          subjectCode: subject.code,
          evaluation: evaluation.name,
          weight: evaluation.weight,
          studentsEvaluated: evaluationScores.length,
          totalStudents: enrolledStudents.length,
          averageGrade: evaluationScores.length > 0 
            ? (evaluationScores.reduce((sum, score) => sum + score, 0) / evaluationScores.length).toFixed(2)
            : '0.00',
          passed: evaluationScores.filter(score => score >= 5).length,
          failed: evaluationScores.filter(score => score < 5).length
        })
      })
    })

    return {
      title: subjectData 
        ? `Resumen por Evaluación - ${subjectData.name}`
        : 'Resumen por Evaluación - Todas las Materias',
      subtitle: subjectData 
        ? `${subjectData.code} | ${subjectData.course}`
        : `${userSubjects.length} materias`,
      evaluations: summaryData
    }
  }

  const createAndDownloadPDF = (report: ReportData, data: any, fileName: string) => {
    const doc = new jsPDF()
    
    // Configurar fuente y título
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(data.title, 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(data.subtitle, 20, 30)
    
    // Información general
    doc.setFontSize(10)
    doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 20, 40)
    doc.text(`Año académico: ${new Date().getFullYear()}`, 20, 45)

    let yPosition = 60

    if (report.id === 'student-list') {
      // Listado de alumnos
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Total de alumnos: ${data.total}`, 20, yPosition)
      yPosition += 10

      // Crear tabla
      const tableData = data.students.map((student: Student, index: number) => [
        (index + 1).toString(),
        `${student.name} ${student.surname}`,
        student.email,
        student.course || '',
        student.phone || ''
      ])

      autoTable(doc, {
        head: [['#', 'Nombre Completo', 'Email', 'Curso', 'Teléfono']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 }
      })
    }

    if (report.id === 'grade-report') {
      // Informe de notas
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Estadísticas:', 20, yPosition)
      yPosition += 10

      doc.setFont('helvetica', 'normal')
      doc.text(`Total alumnos: ${data.total}`, 20, yPosition)
      doc.text(`Aprobados: ${data.passed}`, 20, yPosition + 5)
      doc.text(`Suspensos: ${data.failed}`, 20, yPosition + 10)
      doc.text(`Sin evaluar: ${data.pending}`, 20, yPosition + 15)
      yPosition += 30

      // Tabla de notas
      const gradeTableData = data.students.map((student: any) => [
        `${student.name} ${student.surname}`,
        student.finalGrade,
        student.status,
        student.evaluationGrades.map((evaluation: any) => `${evaluation.name}: ${evaluation.grade}`).join(' | ')
      ])

      autoTable(doc, {
        head: [['Alumno', 'Nota Final', 'Estado', 'Evaluaciones']],
        body: gradeTableData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          3: { cellWidth: 80 }
        }
      })
    }

    if (report.id === 'evaluation-summary') {
      // Resumen por evaluación
      const summaryTableData = data.evaluations.map((evaluation: any) => [
        evaluation.subject,
        evaluation.subjectCode,
        evaluation.evaluation,
        `${evaluation.weight}%`,
        `${evaluation.studentsEvaluated}/${evaluation.totalStudents}`,
        evaluation.averageGrade,
        evaluation.passed.toString(),
        evaluation.failed.toString()
      ])

      autoTable(doc, {
        head: [['Materia', 'Código', 'Evaluación', 'Peso', 'Evaluados', 'Media', 'Aprobados', 'Suspensos']],
        body: summaryTableData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 20, right: 20 }
      })
    }

    // Descargar PDF
    doc.save(fileName)
  }

  const handleQuickDownload = (reportId: string) => {
    setSelectedReport(reportId)
    // Simular click en generar después de un momento
    setTimeout(() => {
      handleGenerateReport()
    }, 100)
  }

  const handleCleanCorruptedData = () => {
    if (window.confirm('⚠️ ATENCIÓN: Esto eliminará todos os datos corruptos do localStorage. É unha acción irreversible. ¿Continuar?')) {
      cleanCorruptedData()
      // Recargar la página para que se actualice todo
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Outros Informes</h2>
        <p className="text-gray-600">
          Xera e descarga informes en PDF coa información das túas materias asignadas.
        </p>
        {userSubjects.length === 0 ? (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Aviso:</strong> Non tes materias creadas aínda. Crea materias en "Xestión de Materias" para poder xerar informes específicos.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Materias dispoñibles:</strong> Tes {userSubjects.length} materia{userSubjects.length !== 1 ? 's' : ''} asignada{userSubjects.length !== 1 ? 's' : ''} para xerar informes.
            </p>
          </div>
        )}
      </div>

      {/* Report Generation Form */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <FileText className="inline-block h-5 w-5 mr-2" />
          Xerar Novo Informe
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Report Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Informe
              </label>
              <select
                className="input-field"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="">Seleccionar tipo de informe</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
              {selectedReport && (
                <p className="mt-2 text-sm text-gray-500">
                  {reportTypes.find(r => r.id === selectedReport)?.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materia
                </label>
                <select
                  className="input-field"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={userSubjects.length === 0}
                >
                  <option value="all" disabled={userSubjects.length === 0}>
                    {userSubjects.length === 0 ? 'Non hai materias dispoñibles' : `Todas as materias (${userSubjects.length})`}
                  </option>
                  {userSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - {subject.course}
                    </option>
                  ))}
                </select>
                {userSubjects.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    Non tes materias creadas aínda
                  </p>
                )}
                {userSubjects.length > 0 && (
                  <p className="mt-1 text-sm text-green-600">
                    {userSubjects.length} materia{userSubjects.length !== 1 ? 's' : ''} dispoñible{userSubjects.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Preview and Generate */}
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-800">Vista Previa</h4>
                <p className="text-sm text-blue-600">
                  {selectedReport ? (
                    <>
                      {reportTypes.find(r => r.id === selectedReport)?.name}
                      {selectedSubject !== 'all' && (
                        <>
                          {' - Materia: '}
                          {userSubjects.find(s => s.id.toString() === selectedSubject)?.name || 'Seleccionada'}
                          {' ('}
                          {userSubjects.find(s => s.id.toString() === selectedSubject)?.course || ''}
                          {')'}
                        </>
                      )}
                      {selectedSubject === 'all' && selectedReport !== 'grade-report' && ' - Todas as materias'}
                      {selectedSubject === 'all' && selectedReport === 'grade-report' && ' - ⚠️ Requiere seleccionar materia'}
                    </>
                  ) : (
                    'Selecciona un informe para ver a vista previa'
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Datos do Curso Actual</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Ano académico:</strong> {new Date().getFullYear()}</p>
                <p><strong>Total de materias:</strong> {userSubjects.length}</p>
                <p><strong>Data de xeración:</strong> {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!selectedReport || userSubjects.length === 0 || (selectedReport === 'grade-report' && selectedSubject === 'all')}
            >
              <Download className="h-4 w-4" />
              Xerar e Descargar PDF
            </button>
            
            {userSubjects.length === 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                ⚠️ Necesitas crear materias primeiro para poder xerar informes
              </p>
            )}
            
            {selectedReport === 'grade-report' && selectedSubject === 'all' && userSubjects.length > 0 && (
              <p className="text-sm text-orange-600 mt-2 text-center">
                ⚠️ O informe de notas require seleccionar unha materia específica
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informes Dispoñibles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportTypes.map(report => (
            <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  {report.format}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Dispoñible para descarga
                </div>
                <button
                  onClick={() => handleQuickDownload(report.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Xerar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
