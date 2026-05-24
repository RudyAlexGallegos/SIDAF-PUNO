"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { getStoredUser, getAsistencias, getArbitros } from "@/services/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, FileDown, BarChart3, Calendar } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { addDays, format, getDay, parseISO, isAfter } from "date-fns"

interface RegistroArbitro {
  arbitrId: string
  estado: string
  horaRegistro: string
  observaciones: string
}

interface RankingItem {
  nombre: string
  lunes: string
  martes: string
  miercoles: string
  jueves: string
  viernes: string
  total: number
  porcentaje: number
  presentes: number
  tardanzas: number
  justificados: number
}

const formatearNombre = (nombre: string) =>
  nombre
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ")

const getEstadoSimbolo = (estado?: string): string => {
  switch (estado) {
    case 'presente': return '✅'
    case 'ausente': return '❌'
    case 'tardanza': return '⏰'
    case 'justificado': return '📝'
    default: return '-'
  }
}

export default function RankingSemanalPage() {
  const [usuario, setUsuario] = useState<any | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [asistencias, setAsistencias] = useState<any[]>([])
  const [arbitros, setArbitros] = useState<any[]>([])

  useEffect(() => {
    const user = getStoredUser()
    if (!user) {
      router.push("/login")
      return
    }
    
    if (user.rol !== "ADMIN" && user.rol !== "PRESIDENCIA_CODAR") {
      setError("No tienes permisos para acceder a esta página")
      setLoading(false)
      return
    }

    setUsuario(user)
    cargarDatos()
  }, [router])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [asistenciasData, arbitrosData] = await Promise.all([
        getAsistencias(),
        getArbitros()
      ])
      setAsistencias(asistenciasData || [])
      setArbitros(arbitrosData || [])
      setError("")
    } catch (err: any) {
      setError("Error al cargar los datos: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calcular ranking cuando cambien asistencias o arbitros
  useEffect(() => {
    if (asistencias.length > 0 && arbitros.length > 0) {
      setRanking(calcularRankingSemanal(asistencias, arbitros))
    }
  }, [asistencias, arbitros])

  const parsearRegistros = (asistencia: any): RegistroArbitro[] => {
    try {
      if (asistencia.observaciones) {
        const parsed = JSON.parse(asistencia.observaciones)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (e) {
      console.warn("Error parseando observaciones:", e)
    }
    return []
  }

  const calcularRankingSemanal = (asistenciasData: any[], arbitrosData: any[]): RankingItem[] => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
    const lunes = addDays(hoy, diffLunes)
    
    // Fechas de la semana: lunes, martes, jueves, viernes, sábado (misma lógica que historial)
    const fechasSemana = [
      format(lunes, 'yyyy-MM-dd'),
      format(addDays(lunes, 1), 'yyyy-MM-dd'),
      format(addDays(lunes, 3), 'yyyy-MM-dd'),
      format(addDays(lunes, 4), 'yyyy-MM-dd'),
      format(addDays(lunes, 6), 'yyyy-MM-dd')
    ]

    // Función para encontrar un árbitro por ID con múltiples estrategias
    const findArbitroById = (id: any): any => {
      if (!id) return null
      const idStr = String(id)
      const idNum = Number(id)
      return arbitrosData.find((a: any) => 
        String(a.id) === idStr || 
        a.id?.toString() === idStr ||
        Number(a.id) === idNum ||
        a.id === id
      )
    }

    const statsPorArbitro: Record<string, { nombre: string; dias: Record<string, { estado: string }> }> = {}
    
    // Inicializar estadísticas con todos los árbitros
    arbitrosData.forEach((a: any) => {
      const idStr = String(a.id || '')
      if (idStr) {
        const nombre = `${a.nombre || a.nombres || ''} ${a.apellido || a.apellidoPaterno || ''}`.trim() || idStr
        statsPorArbitro[idStr] = {
          nombre: nombre,
          dias: {}
        }
      }
    })

    // Procesar registros de asistencia - MISMA LÓGICA QUE HISTORIAL
    asistenciasData.forEach((item: any) => {
      const parsed = parsearRegistros(item)
      if (parsed.length > 0) {
        parsed.forEach((reg: any) => {
          const arbitroId = reg.arbitroId ?? reg.arbitrId ?? reg.aribroId ?? reg.aritroId ?? reg.id ?? ''
          const arbitroEncontrado = findArbitroById(arbitroId)
          
          if (arbitroEncontrado && item.fecha) {
            const arbitroIdStr = String(arbitroEncontrado.id)
            const fechaStr = item.fecha.split('T')[0]
            
            // Solo procesar si la fecha está en la semana actual
            if (fechasSemana.includes(fechaStr)) {
              statsPorArbitro[arbitroIdStr].dias[fechaStr] = { estado: reg.estado || item.estado }
            }
          }
        })
      }
    })

    // Construir resultado
    const resultado: RankingItem[] = []
    
    Object.entries(statsPorArbitro).forEach(([id, stats]) => {
      const item: RankingItem = {
        nombre: stats.nombre,
        lunes: '-',
        martes: '-',
        miercoles: '-',
        jueves: '-',
        viernes: '-',
        total: 0,
        porcentaje: 0,
        presentes: 0,
        tardanzas: 0,
        justificados: 0
      }

      fechasSemana.forEach((fecha, idx) => {
        const diaNombre = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'][idx] as keyof RankingItem
        const registro = stats.dias[fecha]
        
        if (registro) {
          const simbolo = getEstadoSimbolo(registro.estado)
          item[diaNombre] = simbolo
          item.total++
          
          if (registro.estado === 'presente') item.presentes++
          else if (registro.estado === 'tardanza') item.tardanzas++
          else if (registro.estado === 'justificado') item.justificados++
        }
      })

      item.porcentaje = item.total > 0 ? Math.round(((item.presentes + item.justificados) / 5) * 100) : 0
      resultado.push(item)
    })

    return resultado.sort((a, b) => b.porcentaje - a.porcentaje)
  }

  const obtenerFechasSemana = () => {
    const hoy = new Date()
    const dia = hoy.getDay()
    const diferencia = hoy.getDate() - dia + (dia === 0 ? -6 : 1)
    const lunes = new Date(hoy.setDate(diferencia))
    const viernes = new Date(lunes)
    viernes.setDate(viernes.getDate() + 4)

    const formatearFecha = (fecha: Date) => {
      return fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
    }

    return {
      lunes: formatearFecha(lunes),
      viernes: formatearFecha(viernes),
    }
  }

  const generarPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const fechas = obtenerFechasSemana()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12

    const colorSky = { r: 14, g: 165, b: 233 }
    const colorSkyDark = { r: 2, g: 132, b: 199 }

    let yPos = margin

    doc.setFillColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
    doc.rect(0, 0, pageWidth, 30, "F")
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("COMISIÓN DE ÁRBITROS - SIDAF PUNO", pageWidth / 2, 10, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("REPORTE SEMANAL DE ASISTENCIA Y DESEMPEÑO", pageWidth / 2, 18, { align: "center" })
    doc.text("Sistema de Gestión Arbitral", pageWidth / 2, 24, { align: "center" })
    
    yPos = 35

    doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(`Período: ${fechas.lunes} - ${fechas.viernes}`, margin, yPos)
    yPos += 5

    const hoy = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text(`Generado: ${hoy}`, margin, yPos)
    yPos += 8

    if (ranking.length > 0) {
      doc.setFillColor(240, 249, 255)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 35, "F")
      doc.setDrawColor(colorSky.r, colorSky.g, colorSky.b)
      doc.setLineWidth(0.5)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 35)

      const totalAsistencias = ranking.reduce((sum, item) => sum + item.total, 0)
      const promedioPorcentaje = ranking.length > 0
        ? (ranking.reduce((sum, item) => sum + item.porcentaje, 0) / ranking.length).toFixed(1)
        : "0"
      const arbitrosActivos = ranking.filter((r) => r.total > 0).length

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
      doc.text("INDICADORES GENERALES DE DESEMPEÑO", margin + 5, yPos + 5)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60, 60, 60)
      const colWidth = (pageWidth - 2 * margin) / 2
      doc.text(`Total de árbitros: ${ranking.length}`, margin + 5, yPos + 13)
      doc.text(`Árbitros activos: ${arbitrosActivos}`, margin + 5 + colWidth, yPos + 13)
      doc.text(`Total registros: ${totalAsistencias}`, margin + 5, yPos + 21)
      doc.text(`Promedio asistencia: ${promedioPorcentaje}%`, margin + 5 + colWidth, yPos + 21)
      doc.text(`Mayor desempeño: ${Math.max(...ranking.map((r) => r.total), 0)} días`, margin + 5, yPos + 29)
      doc.text(`Cobertura promedio: ${((totalAsistencias / (ranking.length * 5)) * 100).toFixed(1)}%`, margin + 5 + colWidth, yPos + 29)

      yPos += 40

      autoTable(doc, {
        startY: yPos,
        head: [["N.º", "Árbitro", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Total", "% Asistencia"]],
        body: ranking.map((item, index) => [
          String(index + 1),
          formatearNombre(item.nombre),
          item.lunes,
          item.martes,
          item.miercoles,
          item.jueves,
          item.viernes,
          String(item.total ?? 0),
          `${item.porcentaje.toFixed(1)}%`,
        ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          overflow: "linebreak",
          valign: "middle",
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [2, 132, 199],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [240, 249, 255],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },
          1: { cellWidth: 44, halign: "left" },
          2: { cellWidth: 18, halign: "center" },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 18, halign: "center" },
          5: { cellWidth: 18, halign: "center" },
          6: { cellWidth: 18, halign: "center" },
          7: { cellWidth: 14, halign: "center" },
          8: { cellWidth: 18, halign: "center" },
        },
        margin: { left: margin, right: margin },
      })

      yPos = (doc as any).lastAutoTable.finalY + 8

      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
      doc.text("ANÁLISIS Y CONCLUSIONES", margin, yPos)
      yPos += 7

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60, 60, 60)

      const topThree = ranking
        .slice(0, 3)
        .map((a, i) => `${i + 1}. ${formatearNombre(a.nombre)} (${a.porcentaje.toFixed(1)}%)`)
        .join(" | ")
      doc.text(`Mejor desempeño (Top 3): ${topThree}`, margin + 3, yPos)
      yPos += 6

      const bottomThree = ranking
        .slice(-3)
        .reverse()
        .map((a, i) => `${i + 1}. ${formatearNombre(a.nombre)} (${a.porcentaje.toFixed(1)}%)`)
        .join(" | ")
      doc.text(`Menor desempeño (Bottom 3): ${bottomThree}`, margin + 3, yPos)
      yPos += 6

      const absentees = ranking.filter((r) => r.total === 0).length
      const docText = absentees > 0
        ? `Árbitros sin registro: ${absentees} (${((absentees / ranking.length) * 100).toFixed(1)}%)`
        : "Todos los árbitros tienen registros en la semana"
      doc.text(docText, margin + 3, yPos)

    } else {
      doc.setFontSize(11)
      doc.setTextColor(150, 150, 150)
      doc.text("No hay datos de asistencia para esta semana", pageWidth / 2, yPos + 10, { align: "center" })
    }

    const pageCount = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.setFont("helvetica", "normal")
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10)
      doc.text(`Comisión de Árbitros - SIDAF Puno | Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: "center" })
      doc.text("Documento generado automáticamente por el Sistema de Gestión Arbitral", pageWidth / 2, pageHeight - 3, { align: "center" })
    }

    return doc
  }

  const exportarPDF = () => {
    try {
      const doc = generarPDF()
      doc.save(`ranking-semanal-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err: any) {
      console.error("Error al generar PDF:", err)
      setError("Error al generar el PDF: " + err.message)
    }
  }

  const vistaPreviaPDF = () => {
    try {
      const doc = generarPDF()
      const pdfBlob = doc.output("blob")
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setShowPreview(true)
    } catch (err: any) {
      console.error("Error al generar vista previa:", err)
      setError("Error al generar vista previa: " + err.message)
    }
  }

  const cerrarPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
    }
    setPdfUrl(null)
    setShowPreview(false)
  }

  const descargarDesdePreview = () => {
    if (pdfUrl) {
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = `ranking-semanal-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    cerrarPreview()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-10 h-10 text-sky-600" />
          <h1 className="text-4xl font-bold text-sky-900">Ranking Semanal</h1>
        </div>
        <p className="text-sky-600">Visualiza y exporta el ranking de asistencias de la semana actual</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!error && (
          <Card className="border-2 border-sky-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />

            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sky-900">Árbitros por Asistencia</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={vistaPreviaPDF}
                    disabled={loading || ranking.length === 0}
                    variant="outline"
                    className="gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Vista Previa
                  </Button>
                  <Button
                    onClick={exportarPDF}
                    disabled={loading || ranking.length === 0}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <FileDown className="w-4 h-4" />
                    Descargar PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-sky-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : ranking.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-sky-300 mx-auto mb-3" />
                  <p className="text-sky-600 text-lg">No hay datos de asistencia para esta semana</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-sky-50 border-b-2 border-sky-200">
                        <th className="px-3 py-3 text-left text-sky-900 font-semibold w-12">Pos.</th>
                        <th className="px-3 py-3 text-left text-sky-900 font-semibold">Nombre</th>
                        <th className="px-2 py-3 text-center text-sky-900 font-semibold">Lun</th>
                        <th className="px-2 py-3 text-center text-sky-900 font-semibold">Mar</th>
                        <th className="px-2 py-3 text-center text-sky-900 font-semibold">Mié</th>
                        <th className="px-2 py-3 text-center text-sky-900 font-semibold">Jue</th>
                        <th className="px-2 py-3 text-center text-sky-900 font-semibold">Vie</th>
                        <th className="px-4 py-3 text-center text-sky-900 font-semibold">Total</th>
                        <th className="px-4 py-3 text-center text-sky-900 font-semibold">Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((item, index) => (
                        <tr
                          key={index}
                          className={`border-b border-sky-100 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-sky-50/50"
                          } hover:bg-sky-100/50`}
                        >
                          <td className="px-3 py-3">
                            <Badge
                              variant="outline"
                              className="bg-sky-100 text-sky-900 border-sky-300 font-bold"
                            >
                              {index + 1}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-sky-900 font-medium">{formatearNombre(item.nombre)}</td>
                          <td className="px-2 py-3 text-center text-slate-700 font-semibold">{item.lunes}</td>
                          <td className="px-2 py-3 text-center text-slate-700 font-semibold">{item.martes}</td>
                          <td className="px-2 py-3 text-center text-slate-700 font-semibold">{item.miercoles}</td>
                          <td className="px-2 py-3 text-center text-slate-700 font-semibold">{item.jueves}</td>
                          <td className="px-2 py-3 text-center text-slate-700 font-semibold">{item.viernes}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">
                              {item.total}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${
                              item.porcentaje >= 90 ? 'text-green-600' :
                              item.porcentaje >= 70 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {item.porcentaje.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showPreview && pdfUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-lg text-sky-900">Vista Previa del Reporte</h3>
              <div className="flex gap-2">
                <Button onClick={descargarDesdePreview} className="bg-emerald-600 hover:bg-emerald-700">
                  <FileDown className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="outline" onClick={cerrarPreview}>
                  Cerrar
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border rounded-lg"
                title="Vista previa del PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}