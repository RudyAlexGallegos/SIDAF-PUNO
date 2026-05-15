"use client"

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
    asistencias: number
    porcentaje: number
}

export default function RankingSemanalPage() {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [ranking, setRanking] = useState<RankingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        
        // Validar permisos (solo ADMIN y PRESIDENCIA_CODAR)
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
        const diferencia = hoy.getDate() - dia + (dia === 0 ? -6 : 1) // Ajustar para lunes
        const lunes = new Date(hoy.setDate(diferencia))
        const domingo = new Date(lunes)
        domingo.setDate(domingo.getDate() + 6)

        const formatearFecha = (fecha: Date) => {
            return fecha.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
        }

        return {
            lunes: formatearFecha(lunes),
            domingo: formatearFecha(domingo),
        }
    }

    const exportarPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const fechas = obtenerFechasSemana()
            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const margin = 15

            // Color sky-palette
            const colorSky = { r: 14, g: 165, b: 233 } // sky-500
            const colorSkyDark = { r: 2, g: 132, b: 199 } // sky-700

            // Encabezado con logo placeholder y título
            let yPos = margin

            // Línea decorativa superior
            doc.setDrawColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
            doc.setLineWidth(2)
            doc.line(margin, yPos, pageWidth - margin, yPos)
            yPos += 5

            // Nombre de la comisión y logo
            doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
            doc.setFontSize(16)
            doc.setFont(undefined, "bold")
            doc.text("COMISIÓN DE ÁRBITROS - SIDAF PUNO", pageWidth / 2, yPos, { align: "center" })
            yPos += 10

            // Título principal
            doc.setFontSize(14)
            doc.setFont(undefined, "bold")
            doc.setTextColor(colorSky.r, colorSky.g, colorSky.b)
            doc.text("📊 RANKING SEMANAL DE ASISTENCIAS", pageWidth / 2, yPos, { align: "center" })
            yPos += 8

            // Información del período
            doc.setFontSize(10)
            doc.setFont(undefined, "normal")
            doc.setTextColor(80, 80, 80)
            doc.text(`Período: ${fechas.lunes} - ${fechas.domingo}`, pageWidth / 2, yPos, { align: "center" })
            yPos += 5

            // Fecha de generación
            const hoy = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
            doc.setFontSize(9)
            doc.setTextColor(120, 120, 120)
            doc.text(`Generado: ${hoy}`, pageWidth / 2, yPos, { align: "center" })
            yPos += 10

            // Tabla de ranking
            if (ranking.length > 0) {
                const columnas = ["Posición", "Nombre", "Asistencias", "Porcentaje"]
                const anchos = [20, 95, 30, 30]
                const alturaFila = 8

                // Encabezado tabla
                doc.setFillColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
                doc.setTextColor(255, 255, 255)
                doc.setFont(undefined, "bold")
                doc.setFontSize(10)

                let xPos = margin
                for (let i = 0; i < columnas.length; i++) {
                    doc.rect(xPos, yPos, anchos[i], alturaFila, "F")
                    doc.text(columnas[i], xPos + 2, yPos + 5, { align: "left" })
                    xPos += anchos[i]
                }
                yPos += alturaFila

                // Filas de datos
                doc.setTextColor(0, 0, 0)
                doc.setFont(undefined, "normal")
                doc.setFontSize(9)

                ranking.forEach((item, index) => {
                    // Fondo alterno
                    if (index % 2 === 0) {
                        doc.setFillColor(240, 249, 255) // sky-50
                        doc.rect(margin, yPos, pageWidth - 2 * margin, alturaFila, "F")
                    }

                    // Datos
                    xPos = margin
                    doc.text((index + 1).toString(), xPos + 2, yPos + 5)
                    xPos += anchos[0]

                    doc.text(item.nombre, xPos + 2, yPos + 5)
                    xPos += anchos[1]

                    doc.text(item.asistencias.toString(), xPos + 2, yPos + 5, { align: "center" })
                    xPos += anchos[2]

                    doc.text(`${item.porcentaje.toFixed(1)}%`, xPos + 2, yPos + 5, { align: "center" })

                    yPos += alturaFila

                    // Salto de página si es necesario
                    if (yPos > pageHeight - margin - 10) {
                        doc.addPage()
                        yPos = margin
                    }
                })

                // Resumen al pie
                yPos += 5
                doc.setLineWidth(0.5)
                doc.setDrawColor(200, 200, 200)
                doc.line(margin, yPos, pageWidth - margin, yPos)
                yPos += 5

                doc.setFontSize(9)
                doc.setFont(undefined, "bold")
                doc.setTextColor(colorSkyDark.r, colorSkyDark.g, colorSkyDark.b)
                doc.text(`Total de árbitros registrados: ${ranking.length}`, margin, yPos)
            } else {
                doc.setFontSize(11)
                doc.setTextColor(150, 150, 150)
                doc.text("No hay datos de asistencia para esta semana", pageWidth / 2, yPos + 10, { align: "center" })
            }

            // Pie de página
            const pageCount = (doc as any).internal.pages.length - 1
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" })
            }

            // Descargar
            doc.save(`ranking-semanal-${new Date().toISOString().split("T")[0]}.pdf`)
        } catch (err: any) {
            console.error("Error al generar PDF:", err)
            setError("Error al generar el PDF: " + err.message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 md:p-8">
            {/* Encabezado */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-10 h-10 text-sky-600" />
                    <h1 className="text-4xl font-bold text-sky-900">Ranking Semanal</h1>
                </div>
                <p className="text-sky-600">Visualiza y exporta el ranking de asistencias de la semana actual</p>
            </div>

            {/* Contenido principal */}
            <div className="max-w-6xl mx-auto">
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {!error && (
                    <Card className="border-2 border-sky-200 shadow-sm">
                        {/* Top accent bar */}
                        <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />

                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sky-900">Árbitros por Asistencia</CardTitle>
                                <Button
                                    onClick={exportarPDF}
                                    disabled={loading || ranking.length === 0}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Exportar PDF
                                </Button>
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
                                                <th className="px-4 py-3 text-left text-sky-900 font-semibold w-12">Pos.</th>
                                                <th className="px-4 py-3 text-left text-sky-900 font-semibold">Nombre</th>
                                                <th className="px-4 py-3 text-center text-sky-900 font-semibold">Asistencias</th>
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
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-sky-100 text-sky-900 border-sky-300 font-bold"
                                                        >
                                                            {index + 1}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-sky-900 font-medium">{item.nombre}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-700">
                                                            {item.asistencias}
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
        </div>
    )
}
