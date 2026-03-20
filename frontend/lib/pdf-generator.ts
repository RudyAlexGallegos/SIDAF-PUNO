"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format, eachDayOfInterval, addDays } from "date-fns"
import { es } from "date-fns/locale"

// Colores corporativos SIDAF-PUNO
const COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  secondary: [124, 58, 237] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
}

// Tipos
export interface ReporteAsistenciaData {
  id?: number
  fecha: string
  horaEntrada?: string
  horaSalida?: string
  actividad?: string
  evento?: string
  estado: string
  observaciones?: string
  responsable?: string
  arbitroId?: string
}

export interface ArbitroReport {
  id: string | number
  nombre?: string
  nombres?: string
  apellido?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  categoria?: string
  telefono?: string
  email?: string
}

// Utilidades
const getActividadLabel = (actividad?: string): string => {
  const labels: Record<string, string> = {
    analisis_partido: "Análisis de Partido",
    preparacion_fisica: "Preparación Física",
    reunion_ordinaria: "Reunión Ordinaria",
    reunion_extraordinaria: "Reunión Extraordinaria",
  }
  return labels[actividad || ""] || actividad || "-"
}

const getEstadoLabel = (estado?: string): string => {
  const labels: Record<string, string> = {
    presente: "Completado",
    ausente: "Ausente",
    tardanza: "Tardanza",
    justificado: "Justificado",
    licencia: "Licencia",
    justificacion: "Justificado",
  }
  return labels[estado || ""] || estado || "-"
}

// Función helper para formatear hora correctamente
const formatHora = (hora: any): string => {
  if (!hora) return "-"
  // Si es un string ISO (contiene T)
  if (typeof hora === "string" && hora.includes("T")) {
    const parts = hora.split("T")
    if (parts[1]) {
      return parts[1].substring(0, 5)
    }
    return "-"
  }
  // Si es un string con formato HH:mm:ss
  if (typeof hora === "string" && hora.includes(":")) {
    return hora.substring(0, 5)
  }
  // Si es un objeto Date
  if (hora instanceof Date) {
    return hora.toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  // Si es un objeto con formato ISO
  if (typeof hora === "object" && hora.toString) {
    const str = hora.toString()
    if (str.includes("T")) {
      return str.split("T")[1]?.substring(0, 5) || "-"
    }
  }
  return String(hora).substring(0, 5) || "-"
}

function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.gray)
    doc.text(`Pagina ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" })
    doc.text(`Generado por SIDAF-PUNO | ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth / 2, pageHeight - 5, { align: "center" })
  }
}

// Generar reporte RESUMEN - Diseño profesional
export function generateReporteResumenEjecutivo(
  asistencia: ReporteAsistenciaData[],
  _arbitros: ArbitroReport[],
  fechaInicio: Date,
  fechaFin: Date,
  titulo?: string
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const totalRegistros = asistencia.length
  const presentes = asistencia.filter((a) => a.estado === "presente").length
  const ausentes = asistencia.filter((a) => a.estado === "ausente").length
  const tardanzas = asistencia.filter((a) => a.estado === "tardanza").length
  const justificados = asistencia.filter((a) => a.estado === "justificado").length
  const porcentaje = totalRegistros > 0 ? Math.round(((presentes + justificados) / totalRegistros) * 100) : 0

  // Header moderno
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 42, "F")
  
  // Barra decorativa
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 39, pageWidth, 3, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Sistema de Designación Inteligente de Árbitros", 14, 27)
  doc.text("Comisión Departamental de Árbitros - Puno", 14, 34)

  // Título
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(titulo || "REPORTE DE ASISTENCIA", pageWidth / 2, 55, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.gray)
  doc.text(`Período: ${format(fechaInicio, "dd MMMM")} - ${format(fechaFin, "dd MMMM yyyy", { locale: es })}`, pageWidth / 2, 63, { align: "center" })

  // Tarjetas de estadísticas
  let yPos = 75
  const cardWidth = (pageWidth - 56) / 4

  // Total
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, yPos, cardWidth, 25, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, yPos, cardWidth, 25, 2, 2, "S")
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(totalRegistros.toString(), 14 + cardWidth/2, yPos + 12, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.gray)
  doc.text("TOTAL REGISTROS", 14 + cardWidth/2, yPos + 20, { align: "center" })

  // Presentes
  doc.setFillColor(220, 252, 231)
  doc.roundedRect(14 + cardWidth + 4, yPos, cardWidth, 25, 2, 2, "F")
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(14 + cardWidth + 4, yPos, cardWidth, 25, 2, 2, "S")
  doc.setTextColor(22, 163, 74)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(presentes.toString(), 14 + cardWidth + 4 + cardWidth/2, yPos + 12, { align: "center" })
  doc.setFontSize(8)
  doc.text("PRESENTES", 14 + cardWidth + 4 + cardWidth/2, yPos + 20, { align: "center" })

  // Ausentes
  doc.setFillColor(254, 226, 226)
  doc.roundedRect(14 + (cardWidth + 4) * 2, yPos, cardWidth, 25, 2, 2, "F")
  doc.setDrawColor(254, 202, 202)
  doc.roundedRect(14 + (cardWidth + 4) * 2, yPos, cardWidth, 25, 2, 2, "S")
  doc.setTextColor(220, 38, 38)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(ausentes.toString(), 14 + (cardWidth + 4) * 2 + cardWidth/2, yPos + 12, { align: "center" })
  doc.setFontSize(8)
  doc.text("AUSENTES", 14 + (cardWidth + 4) * 2 + cardWidth/2, yPos + 20, { align: "center" })

  // % Asistencia
  doc.setFillColor(59, 130, 246, 20)
  doc.roundedRect(14 + (cardWidth + 4) * 3, yPos, cardWidth, 25, 2, 2, "F")
  doc.setDrawColor(147, 197, 253)
  doc.roundedRect(14 + (cardWidth + 4) * 3, yPos, cardWidth, 25, 2, 2, "S")
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`${porcentaje}%`, 14 + (cardWidth + 4) * 3 + cardWidth/2, yPos + 12, { align: "center" })
  doc.setFontSize(8)
  doc.text("% ASISTENCIA", 14 + (cardWidth + 4) * 3 + cardWidth/2, yPos + 20, { align: "center" })

  // Tabla
  yPos = 110
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("REGISTROS RECIENTES", 14, yPos)

  const tableData = asistencia
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 20)
    .map((a) => [
      format(new Date(a.fecha), "dd/MM/yyyy"),
      getActividadLabel(a.actividad),
      getEstadoLabel(a.estado),
    ])

  autoTable(doc, {
    startY: yPos + 4,
    head: [["Fecha", "Actividad", "Estado"]],
    body: tableData,
    theme: "grid",
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: [255, 255, 255], 
      fontStyle: "bold",
      fontSize: 10
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`reporte-resumen-${format(fechaInicio, "yyyy-MM")}.pdf`)
}

// Reporte POR ARBITRO
export function generateReportePorArbitro(
  asistencia: ReporteAsistenciaData[],
  arbitros: ArbitroReport[],
  fechaInicio: Date,
  fechaFin: Date
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 35, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)

  doc.setFontSize(12)
  doc.text("Reporte por Arbitro", 14, 26)

  // Titulo
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE POR ARBITRO", pageWidth / 2, 48, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.gray)
  doc.text(`Periodo: ${format(fechaInicio, "dd/MM/yyyy")} - ${format(fechaFin, "dd/MM/yyyy")}`, pageWidth / 2, 56, { align: "center" })

  // Tabla vacia por ahora
  const tableData = arbitros.map((arb) => [arb.nombre || arb.nombres || "Sin nombre", arb.categoria || "-", "-", "-", "-", "0%"])

  autoTable(doc, {
    startY: 65,
    head: [["Arbitro", "Categoria", "Total", "Presentes", "Ausentes", "%"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`reporte-arbitros-${format(fechaInicio, "yyyy-MM")}.pdf`)
}

// Reporte MENSUAL
export function generateReporteMensual(
  asistencia: ReporteAsistenciaData[],
  _arbitros: ArbitroReport[],
  year: number,
  month: number
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const fechaInicio = new Date(year, month - 1, 1)
  const fechaFin = new Date(year, month, 0)

  const asistenciaMes = asistencia.filter((a) => {
    const fecha = new Date(a.fecha)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  const total = asistenciaMes.length
  const presentes = asistenciaMes.filter((a) => a.estado === "presente").length
  const ausentes = asistenciaMes.filter((a) => a.estado === "ausente").length
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 35, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)

  const mesLabel = format(fechaInicio, "MMMM yyyy", { locale: es })

  // Titulo
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`REPORTE MENSUAL - ${mesLabel.toUpperCase()}`, pageWidth / 2, 48, { align: "center" })

  // Resumen
  doc.setFontSize(12)
  doc.setFillColor(...COLORS.light)
  doc.roundedRect(14, 58, pageWidth - 28, 30, 3, 3, "F")

  doc.setTextColor(...COLORS.primary)
  doc.setFont("helvetica", "bold")
  doc.text("RESUMEN", 18, 68)

  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.dark)
  doc.text(`Registros: ${total}`, 18, 80)
  doc.text(`Presentes: ${presentes}`, 80, 80)
  doc.text(`Ausentes: ${ausentes}`, 130, 80)
  doc.text(`%: ${porcentaje}%`, 170, 80)

  // Tabla
  const tableData = asistenciaMes
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((a) => [format(new Date(a.fecha), "dd/MM/yyyy"), getActividadLabel(a.actividad), getEstadoLabel(a.estado)])

  autoTable(doc, {
    startY: 95,
    head: [["Fecha", "Actividad", "Estado"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`reporte-mensual-${year}-${String(month).padStart(2, "0")}.pdf`)
}

// Reporte FALTANTES
export function generateReporteFaltantes(
  asistencia: ReporteAsistenciaData[],
  _arbitros: ArbitroReport[],
  fechaInicio: Date,
  fechaFin: Date
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const diasObligatorios = [1, 2, 4, 5, 6]
  const todosLosDias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
  const diasObligatoriosDelPeriodo = todosLosDias.filter((d) => diasObligatorios.includes(d.getDay()))

  const fechasConRegistro = new Set(asistencia.map((a) => a.fecha.split("T")[0]))
  const diasFaltantes = diasObligatoriosDelPeriodo.filter((d) => !fechasConRegistro.has(format(d, "yyyy-MM-dd")))

  // Header
  doc.setFillColor(...COLORS.danger)
  doc.rect(0, 0, pageWidth, 35, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)
  doc.setFontSize(12)
  doc.text("Reporte de Dias Faltantes", 14, 32)

  // Titulo
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE DE DIAS SIN REGISTRO", pageWidth / 2, 48, { align: "center" })

  // Resumen
  doc.setFontSize(12)
  doc.setFillColor(254, 226, 226)
  doc.roundedRect(14, 58, pageWidth - 28, 20, 3, 3, "F")

  doc.setTextColor(...COLORS.danger)
  doc.text(`DIAS FALTANTES: ${diasFaltantes.length}`, 18, 72)

  // Tabla
  if (diasFaltantes.length > 0) {
    const tableData = diasFaltantes.slice(0, 25).map((d) => [format(d, "dd/MM/yyyy"), format(d, "EEEE", { locale: es })])

    autoTable(doc, {
      startY: 85,
      head: [["Fecha", "Dia"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: COLORS.danger, textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    })
  }

  addFooter(doc)
  doc.save(`reporte-faltantes-${format(fechaInicio, "yyyy-MM")}.pdf`)
}

// Exportar a Excel
export function exportAsistenciaToExcel(asistencia: ReporteAsistenciaData[], _arbitros: ArbitroReport[], filename: string): void {
  const data = asistencia.map((a) => ({
    Fecha: format(new Date(a.fecha), "dd/MM/yyyy"),
    Actividad: getActividadLabel(a.actividad),
    Estado: getEstadoLabel(a.estado),
    "Hora Entrada": formatHora(a.horaEntrada),
    Responsable: a.responsable || "-",
  }))

  const headers = Object.keys(data[0] || {}).join(",")
  const rows = data.map((row) => Object.values(row).join(","))
  const csv = [headers, ...rows].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename || "asistencia.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Reporte DIARIO - Diseño profesional
export function generateReporteDiario(
  asistencia: ReporteAsistenciaData[],
  arbitros: ArbitroReport[],
  fecha: string,
  actividad: string
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Filtrar registros de la fecha
  const asistenciaDia = asistencia.filter((a) => {
    const fechaStr = a.fecha?.split("T")[0]
    return fechaStr === fecha
  })

  // Header moderno
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, pageWidth, 42, "F")
  
  // Barra decorativa
  doc.setFillColor(16, 185, 129)
  doc.rect(0, 39, pageWidth, 3, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Comisión Departamental de Árbitros - Puno", 14, 27)
  doc.text("Sistema de Designación Inteligente de Árbitros", 14, 34)

  // Título
  const fechaObj = new Date(fecha + "T00:00:00")
  const diaSemana = format(fechaObj, "EEEE", { locale: es })

  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`REGISTRO DIARIO - ${format(fechaObj, "dd MMMM yyyy", { locale: es })}`.toUpperCase(), pageWidth / 2, 55, { align: "center" })
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.gray)
  doc.text(`${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} | ${getActividadLabel(actividad)}`, pageWidth / 2, 63, { align: "center" })

  // Resumen con tarjetas
  const total = asistenciaDia.length
  const presentes = asistenciaDia.filter((a) => a.estado === "presente").length
  const tardanzas = asistenciaDia.filter((a) => a.estado === "tardanza").length
  const ausentes = asistenciaDia.filter((a) => a.estado === "ausente").length
  const justificados = asistenciaDia.filter((a) => a.estado === "justificado").length
  const porcentaje = total > 0 ? Math.round(((presentes + justificados) / total) * 100) : 0

  let yPos = 75
  const cardWidth = (pageWidth - 56) / 5

  // Total
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, yPos, cardWidth, 22, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, yPos, cardWidth, 22, 2, 2, "S")
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(total.toString(), 14 + cardWidth/2, yPos + 10, { align: "center" })
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.gray)
  doc.text("TOTAL", 14 + cardWidth/2, yPos + 17, { align: "center" })

  // Presentes
  doc.setFillColor(220, 252, 231)
  doc.roundedRect(14 + cardWidth + 2, yPos, cardWidth, 22, 2, 2, "F")
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(14 + cardWidth + 2, yPos, cardWidth, 22, 2, 2, "S")
  doc.setTextColor(22, 163, 74)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(presentes.toString(), 14 + cardWidth + 2 + cardWidth/2, yPos + 10, { align: "center" })
  doc.setFontSize(7)
  doc.text("PRESENTES", 14 + cardWidth + 2 + cardWidth/2, yPos + 17, { align: "center" })

  // Tardanzas
  doc.setFillColor(254, 249, 195)
  doc.roundedRect(14 + (cardWidth + 2) * 2, yPos, cardWidth, 22, 2, 2, "F")
  doc.setDrawColor(253, 224, 71)
  doc.roundedRect(14 + (cardWidth + 2) * 2, yPos, cardWidth, 22, 2, 2, "S")
  doc.setTextColor(161, 98, 7)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(tardanzas.toString(), 14 + (cardWidth + 2) * 2 + cardWidth/2, yPos + 10, { align: "center" })
  doc.setFontSize(7)
  doc.text("TARDANZAS", 14 + (cardWidth + 2) * 2 + cardWidth/2, yPos + 17, { align: "center" })

  // Ausentes
  doc.setFillColor(254, 226, 226)
  doc.roundedRect(14 + (cardWidth + 2) * 3, yPos, cardWidth, 22, 2, 2, "F")
  doc.setDrawColor(254, 202, 202)
  doc.roundedRect(14 + (cardWidth + 2) * 3, yPos, cardWidth, 22, 2, 2, "S")
  doc.setTextColor(220, 38, 38)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(ausentes.toString(), 14 + (cardWidth + 2) * 3 + cardWidth/2, yPos + 10, { align: "center" })
  doc.setFontSize(7)
  doc.text("AUSENTES", 14 + (cardWidth + 2) * 3 + cardWidth/2, yPos + 17, { align: "center" })

  // % Asistencia
  doc.setFillColor(59, 130, 246, 20)
  doc.roundedRect(14 + (cardWidth + 2) * 4, yPos, cardWidth, 22, 2, 2, "F")
  doc.setDrawColor(147, 197, 253)
  doc.roundedRect(14 + (cardWidth + 2) * 4, yPos, cardWidth, 22, 2, 2, "S")
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`${porcentaje}%`, 14 + (cardWidth + 2) * 4 + cardWidth/2, yPos + 10, { align: "center" })
  doc.setFontSize(7)
  doc.text("% ASIST.", 14 + (cardWidth + 2) * 4 + cardWidth/2, yPos + 17, { align: "center" })

  // Tabla de árbitros
  const tableData = asistenciaDia.map((a: any) => {
    // Usar nombreArbitro directamente si está disponible
    const nombreArbitro = a.nombreArbitro || "General"
    
    // Limpiar observaciones para evitar mostrar JSON
    let observaciones = "-"
    if (a.observaciones) {
      try {
        // Verificar si es JSON
        const parsed = JSON.parse(a.observaciones)
        if (typeof parsed === "string") {
          observaciones = parsed
        }
      } catch (e) {
        // Si no es JSON, usar directamente
        if (typeof a.observaciones === "string" && a.observaciones.length > 0) {
          observaciones = a.observaciones
        }
      }
    }

    return [
      nombreArbitro,
      formatHora(a.horaEntrada),
      getEstadoLabel(a.estado),
      observaciones,
    ]
  })

  autoTable(doc, {
    startY: 95,
    head: [["Árbitro", "Hora", "Estado", "Observaciones"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: "auto" },
    },
  })

  addFooter(doc)
  doc.save(`asistencia-${fecha}.pdf`)
}

// Reporte CONSOLIDADO con estadísticas avanzadas
export function generateReporteConsolidadoPDF(
  asistencia: ReporteAsistenciaData[],
  arbitros: ArbitroReport[],
  fechaInicio: Date,
  fechaFin: Date,
  estadisticasConsolidadas?: any
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const totalRegistros = asistencia.length
  const presentes = asistencia.filter((a) => a.estado === "presente").length
  const ausentes = asistencia.filter((a) => a.estado === "ausente").length
  const tardanzas = asistencia.filter((a) => a.estado === "tardanza").length
  const justificados = asistencia.filter((a) => a.estado === "justificado" || a.estado === "justificacion").length
  const porcentaje = totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0

  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("SIDAF-PUNO", 14, 18)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("Sistema de Designacion Inteligente de Arbitros", 14, 26)
  doc.text("Comision Departamental de Arbitros - Puno", 14, 33)

  // Titulo
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE CONSOLIDADO DE ASISTENCIA", pageWidth / 2, 55, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(...COLORS.gray)
  doc.text(`Periodo: ${format(fechaInicio, "dd/MM/yyyy")} - ${format(fechaFin, "dd/MM/yyyy")}`, pageWidth / 2, 63, { align: "center" })
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth / 2, 69, { align: "center" })

  // Estadísticas generales
  let yPos = 80

  doc.setFillColor(...COLORS.light)
  doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, "F")

  doc.setTextColor(...COLORS.primary)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("ESTADISTICAS GENERALES", 18, yPos + 10)

  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(10)
  doc.text(`Total Registros: ${totalRegistros}`, 18, yPos + 20)
  doc.text(`Presentes: ${presentes}`, 70, yPos + 20)
  doc.text(`Ausentes: ${ausentes}`, 120, yPos + 20)
  doc.text(`Tardanzas: ${tardanzas}`, 160, yPos + 20)
  doc.text(`Porcentaje Asistencia: ${porcentaje}%`, 18, yPos + 28)
  doc.text(`Justificados: ${justificados}`, 70, yPos + 28)
  doc.text(`Arbitros: ${arbitros.length}`, 120, yPos + 28)

  // Tabla de asistencia por actividad
  yPos = 125
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLE POR ACTIVIDAD", 14, yPos)

  // Agrupar por actividad
  const porActividad: Record<string, { total: number; presentes: number; ausentes: number; tardanzas: number }> = {}
  asistencia.forEach((a) => {
    const act = a.actividad || "sin_especificar"
    if (!porActividad[act]) {
      porActividad[act] = { total: 0, presentes: 0, ausentes: 0, tardanzas: 0 }
    }
    porActividad[act].total++
    if (a.estado === "presente") porActividad[act].presentes++
    else if (a.estado === "ausente") porActividad[act].ausentes++
    else if (a.estado === "tardanza") porActividad[act].tardanzas++
  })

  const actividadData = Object.entries(porActividad).map(([act, stats]) => [
    getActividadLabel(act),
    stats.total.toString(),
    stats.presentes.toString(),
    stats.ausentes.toString(),
    stats.tardanzas.toString(),
    stats.total > 0 ? `${Math.round((stats.presentes / stats.total) * 100)}%` : "0%"
  ])

  autoTable(doc, {
    startY: yPos + 4,
    head: [["Actividad", "Total", "Presentes", "Ausentes", "Tardanzas", "% Asistencia"]],
    body: actividadData,
    theme: "striped",
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  })

  // Tabla de registros recientes
  const finalY = (doc as any).lastAutoTable?.finalY || 200
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("REGISTROS RECIENTES", 14, finalY + 15)

  const tableData = asistencia
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 15)
    .map((a) => [
      format(new Date(a.fecha), "dd/MM/yyyy"),
      getActividadLabel(a.actividad),
      getEstadoLabel(a.estado),
      formatHora(a.horaEntrada),
      a.responsable || "-"
    ])

  autoTable(doc, {
    startY: finalY + 19,
    head: [["Fecha", "Actividad", "Estado", "Hora", "Responsable"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: COLORS.secondary, textColor: [255, 255, 255], fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  })

  addFooter(doc)
  doc.save(`reporte-consolidado-${format(fechaInicio, "yyyy-MM-dd")}-${format(fechaFin, "yyyy-MM-dd")}.pdf`)
}

// Reporte SEMANAL con tabla por árbitro y días - Diseño profesional
export interface ReporteSemanalData {
  arbitroId: string | number
  nombre: string
  dias: Record<string, { estado: string | null; actividad: string | null }>
}

export function generateReporteSemanalPDF(
  semanaData: ReporteSemanalData[],
  fechaInicio: Date,
  fechaFin: Date
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Días de la semana a incluir (Lun=1, Mar=2, Jue=4, Vie=5)
  const diasSemana = [1, 2, 4, 5]

  // Calcular estadísticas
  let totalArbitros = semanaData.length
  let totalPresentes = 0
  let totalAusentes = 0
  let totalTardanzas = 0
  let totalJustificados = 0

  semanaData.forEach(fila => {
    Object.values(fila.dias).forEach(dia => {
      if (dia?.estado === 'presente') totalPresentes++
      else if (dia?.estado === 'ausente') totalAusentes++
      else if (dia?.estado === 'tardanza') totalTardanzas++
      else if (dia?.estado === 'justificado') totalJustificados++
    })
  })

  const totalRegistros = totalPresentes + totalAusentes + totalTardanzas + totalJustificados
  const porcentajeAsistencia = totalRegistros > 0 ? Math.round(((totalPresentes + totalJustificados) / totalRegistros) * 100) : 0

  // Header moderno con gradiente simulado
  doc.setFillColor(37, 99, 235) // primary blue
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Barra decorativa inferior
  doc.setFillColor(16, 185, 129) // emerald-500
  doc.rect(0, 42, pageWidth, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('SIDAF-PUNO', 14, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Designación Inteligente de Árbitros', 14, 28)
  doc.text('Comisión Departamental de Árbitros - Puno', 14, 35)

  // Título principal
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('REPORTE SEMANAL DE ASISTENCIA', pageWidth / 2, 58, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(...COLORS.gray)
  doc.text(`Período: ${format(fechaInicio, 'dd MMMM')} - ${format(fechaFin, 'dd MMMM yyyy', { locale: es })}`, pageWidth / 2, 67, { align: 'center' })
  doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 74, { align: 'center' })

  // Tarjetas de estadísticas modernas
  let yPos = 88
  const cardWidth = (pageWidth - 56) / 4
  const cardHeight = 28

  // Tarjeta Total
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, 'S')
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(totalArbitros.toString(), 14 + cardWidth / 2, yPos + 14, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.gray)
  doc.text('ÁRBITROS', 14 + cardWidth / 2, yPos + 23, { align: 'center' })

  // Tarjeta Presentes
  doc.setFillColor(220, 252, 231)
  doc.roundedRect(14 + cardWidth + 4, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(14 + cardWidth + 4, yPos, cardWidth, cardHeight, 3, 3, 'S')
  doc.setTextColor(22, 163, 74)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(totalPresentes.toString(), 14 + cardWidth + 4 + cardWidth / 2, yPos + 14, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('PRESENTES', 14 + cardWidth + 4 + cardWidth / 2, yPos + 23, { align: 'center' })

  // Tarjeta Ausentes
  doc.setFillColor(254, 226, 226)
  doc.roundedRect(14 + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setDrawColor(254, 202, 202)
  doc.roundedRect(14 + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight, 3, 3, 'S')
  doc.setTextColor(220, 38, 38)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(totalAusentes.toString(), 14 + (cardWidth + 4) * 2 + cardWidth / 2, yPos + 14, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('AUSENTES', 14 + (cardWidth + 4) * 2 + cardWidth / 2, yPos + 23, { align: 'center' })

  // Tarjeta % Asistencia
  doc.setFillColor(59, 130, 246, 20)
  doc.roundedRect(14 + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight, 3, 3, 'F')
  doc.setDrawColor(147, 197, 253)
  doc.roundedRect(14 + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight, 3, 3, 'S')
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${porcentajeAsistencia}%`, 14 + (cardWidth + 4) * 3 + cardWidth / 2, yPos + 14, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('% ASISTENCIA', 14 + (cardWidth + 4) * 3 + cardWidth / 2, yPos + 23, { align: 'center' })

  // Tabla de árbitros por día
  yPos = 125

  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLE DE ASISTENCIA POR ÁRBITRO', 14, yPos)

  // Preparar datos de tabla
  const tableData = semanaData.map(fila => {
    const row: any[] = [fila.nombre]
    let presentesFila = 0

    diasSemana.forEach((_, idx) => {
      const fechaStr = format(addDays(fechaInicio, idx), 'yyyy-MM-dd')
      const estado = fila.dias[fechaStr]?.estado

      if (estado === 'presente') {
        row.push('P')
        presentesFila++
      } else if (estado === 'ausente') {
        row.push('A')
      } else if (estado === 'tardanza') {
        row.push('T')
        presentesFila++
      } else if (estado === 'justificado') {
        row.push('J')
        presentesFila++
      } else {
        row.push('-')
      }
    })

    row.push(presentesFila.toString())
    return row
  })

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Árbitro', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 22, halign: 'center', fontStyle: 'bold', fillColor: [220, 252, 231] },
    },
  })

  // Leyenda
  const finalY = (doc as any).lastAutoTable?.finalY || 200
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.gray)
  doc.text('Leyenda: P = Presente | A = Ausente | T = Tardanza | J = Justificado | - = Sin registro', pageWidth / 2, finalY + 10, { align: 'center' })

  addFooter(doc)
  doc.save(`reporte-semanal-${format(fechaInicio, 'yyyy-MM-dd')}-${format(fechaFin, 'yyyy-MM-dd')}.pdf`)
}

// Funciones legacy
export function generateAsistenciaPDF(_asistencias: any[], _arbitros: any[], fechaInicio: Date, fechaFin: Date): void {
  generateReporteResumenEjecutivo([], [], fechaInicio, fechaFin, "Reporte de Asistencia")
}

export function generateDesignacionesPDF(_designaciones: any[], _arbitros: any[], _campeonato: any[], fechaInicio: Date, fechaFin: Date): void {
  const doc = new jsPDF()
  doc.text("Reporte de Designaciones", 10, 10)
  doc.text(`Periodo: ${format(fechaInicio, "dd/MM/yyyy")} - ${format(fechaFin, "dd/MM/yyyy")}`, 10, 20)
  doc.save("reporte-designaciones.pdf")
}

export function exportDataAsJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
