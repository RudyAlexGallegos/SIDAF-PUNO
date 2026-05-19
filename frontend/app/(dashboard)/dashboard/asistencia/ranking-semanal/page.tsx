"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { getStoredUser, getRankingSemanal, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import { Trophy, FileDown, BarChart3 } from "lucide-react"

interface RankingItem {
    nombre: string
    lunes: string
    martes: string
    miercoles: string
    jueves: string
    viernes: string
    total: number
    porcentaje: number
}

export default function RankingSemanalPage() {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [ranking, setRanking] = useState<RankingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()
    const [showPreview, setShowPreview] = useState(false)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)

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
        cargarRanking()
    }, [router])

    const cargarRanking = async () => {
        try {
            setLoading(true)
            const datos = await getRankingSemanal()
            setRanking(datos || [])
            setError("")
        } catch (err: any) {
            setError("Error al cargar el ranking: " + err.message)
        } finally {
            setLoading(false)
        }
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

    // Función que genera el PDF (reutilizable para preview y descarga)
    const generarPDF = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        })

        const fechas = obtenerFechasSemana()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 15

        const colorSky = { r: 14, g: 165, b: 233 }
        const colorSkyDark = { r: 2, g: 132, b: 199 }

        let yPos = margin

        doc.setDrawColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
        doc.setLineWidth(2)
        doc.line(margin, yPos, pageWidth - margin, yPos)
        yPos += 5

        doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("COMISIÓN DE ÁRBITROS - SIDAF PUNO", pageWidth / 2, yPos, { align: "center" })
        yPos += 10

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(colorSky.r, colorSky.g, colorSky.b)
        doc.text("📊 REPORTE SEMANAL DE ASISTENCIA", pageWidth / 2, yPos, { align: "center" })
        yPos += 8
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(80, 80, 80)
        doc.text("Informe profesional de asistencia - Semana laboral", pageWidth / 2, yPos, { align: "center" })
        yPos += 8

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(80, 80, 80)
        doc.text(`Período: ${fechas.lunes} - ${fechas.viernes}`, pageWidth / 2, yPos, { align: "center" })
        yPos += 5

        const hoy = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        doc.text(`Generado: ${hoy}`, pageWidth / 2, yPos, { align: "center" })
        yPos += 10

        if (ranking.length > 0) {
            const columnas = ["Posición", "Nombre", "Lun", "Mar", "Mié", "Jue", "Vie", "Total", "Porcentaje"]
            const anchos = [18, 55, 14, 14, 14, 14, 14, 14, 22]
            const alturaFila = 8

            doc.setFillColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.setFontSize(9)

            let xPos = margin
            for (let i = 0; i < columnas.length; i++) {
                doc.rect(xPos, yPos, anchos[i], alturaFila, "F")
                doc.text(columnas[i], xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[i]
            }
            yPos += alturaFila

            doc.setTextColor(0, 0, 0)
            doc.setFont("helvetica", "normal")
            doc.setFontSize(8)

            ranking.forEach((item, index) => {
                if (index === 0) {
                    doc.setFillColor(255, 243, 205)
                } else if (index === 1) {
                    doc.setFillColor(226, 232, 240)
                } else if (index === 2) {
                    doc.setFillColor(254, 243, 199)
                } else if (index % 2 === 0) {
                    doc.setFillColor(240, 249, 255)
                } else {
                    doc.setFillColor(255, 255, 255)
                }
                doc.rect(margin, yPos, pageWidth - 2 * margin, alturaFila, "F")

                xPos = margin
                const posText = (index + 1).toString()
                if (index < 3) {
                    doc.setFont("helvetica", "bold")
                    doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
                } else {
                    doc.setFont("helvetica", "normal")
                    doc.setTextColor(0, 0, 0)
                }
                doc.text(posText, xPos + 2, yPos + 5)
                xPos += anchos[0]

                doc.setTextColor(0, 0, 0)
                doc.setFont("helvetica", "normal")
                doc.text(item.nombre, xPos + 2, yPos + 5)
                xPos += anchos[1]

                doc.text(item.lunes || "-", xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[2]
                doc.text(item.martes || "-", xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[3]
                doc.text(item.miercoles || "-", xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[4]
                doc.text(item.jueves || "-", xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[5]
                doc.text(item.viernes || "-", xPos + 1, yPos + 5, { align: "center" })
                xPos += anchos[6]

                doc.text(item.total.toString(), xPos + 2, yPos + 5, { align: "center" })
                xPos += anchos[7]

                doc.text(`${item.porcentaje.toFixed(1)}%`, xPos + 2, yPos + 5, { align: "center" })

                yPos += alturaFila

                if (yPos > pageHeight - margin - 10) {
                    doc.addPage()
                    yPos = margin
                }
            })

            yPos += 8
            doc.setLineWidth(0.5)
            doc.setDrawColor(200, 200, 200)
            doc.line(margin, yPos, pageWidth - margin, yPos)
            yPos += 8

            const totalAsistencias = ranking.reduce((sum, item) => sum + item.total, 0)
            const promedioPorcentaje = ranking.length > 0 
                ? (ranking.reduce((sum, item) => sum + item.porcentaje, 0) / ranking.length).toFixed(1) 
                : "0"
            const mejorArbitro = ranking.length > 0 ? ranking[0] : null
            const peorArbitro = ranking.length > 0 ? ranking[ranking.length - 1] : null
            const diasCubiertos = Math.max(...ranking.map(r => r.total), 0)

            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
            doc.text("RESUMEN DETALLADO DEL PERÍODO", margin, yPos)
            yPos += 7

            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(60, 60, 60)
            doc.text(`• Árbitros en el ranking: ${ranking.length}`, margin + 5, yPos)
            yPos += 5
            doc.text(`• Total de registros de asistencia: ${totalAsistencias}`, margin + 5, yPos)
            yPos += 5
            doc.text(`• Promedio general de asistencia: ${promedioPorcentaje}%`, margin + 5, yPos)
            yPos += 5
            doc.text(`• Mejor desempeño: ${mejorArbitro ? mejorArbitro.nombre + " (" + mejorArbitro.porcentaje.toFixed(1) + "%)" : "N/A"}`, margin + 5, yPos)
            yPos += 5
            doc.text(`• Menor desempeño: ${peorArbitro ? peorArbitro.nombre + " (" + peorArbitro.porcentaje.toFixed(1) + "%)" : "N/A"}`, margin + 5, yPos)
            yPos += 5
            doc.text(`• Máximo días registrados por árbitro: ${diasCubiertos}`, margin + 5, yPos)
            yPos += 8

            doc.setFontSize(8)
            doc.setTextColor(100, 100, 100)
            doc.text("Nota: El porcentaje se calcula como (presentes + justificados) / total de registros del árbitro en la semana.", margin, yPos)
        } else {
            doc.setFontSize(11)
            doc.setTextColor(150, 150, 150)
            doc.text("No hay datos de asistencia para esta semana", pageWidth / 2, yPos + 10, { align: "center" })
        }

        const pageCount = (doc as any).internal.pages.length - 1
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(120, 120, 120)
            doc.text(`Comisión de Árbitros - SIDAF Puno | Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" })
            doc.setFontSize(7)
            doc.text("Documento generado automáticamente por el Sistema de Gestión Arbitral", pageWidth / 2, pageHeight - 4, { align: "center" })
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
                    <BarChart3 className="w-10 h-10 text-sky-600" />
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
                                                    <td className="px-3 py-3 text-sky-900 font-medium uppercase">{item.nombre}</td>
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
                                                        <span className="text-sky-900 font-semibold">
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

            {/* Modal de Vista Previa */}
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
