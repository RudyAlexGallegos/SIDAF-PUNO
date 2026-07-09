"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  ClipboardList,
  Download,
  Eye,
  Edit,
  Trash2,
  Trophy,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import {
  getDesignaciones,
  getArbitros,
  getCampeonatos,
  deleteDesignacion,
  type Designacion,
} from "@/services/api"
import { useCache } from "@/hooks/useCache"

interface Campeonato {
  id?: number | null
  nombre?: string
  categoria?: string
  estadio?: string
}

interface Arbitro {
  id?: number | null
  nombre?: string
  apellido?: string
  categoria?: string
  disponible?: boolean
}

export default function ResumenSemanalDesignacionesPage() {
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const cacheDesignaciones = useCache("designaciones", async () => {
    const data = await getDesignaciones()
    return Array.isArray(data) ? data : []
  })
  const cacheArbitros = useCache("arbitros", async () => {
    const data = await getArbitros()
    return Array.isArray(data) ? data : []
  })
  const cacheCampeonatos = useCache("campeonatos", async () => {
    const data = await getCampeonatos()
    return Array.isArray(data) ? data : []
  })

  const designaciones = (cacheDesignaciones.data as Designacion[] | null) || []
  const arbitros = (cacheArbitros.data as Arbitro[] | null) || []
  const championships = (cacheCampeonatos.data as Campeonato[] | null) || []

  const loading =
    cacheDesignaciones.isLoading || cacheArbitros.isLoading || cacheCampeonatos.isLoading

  const hoy = new Date()
  const lunesSemana = startOfWeek(hoy, { weekStartsOn: 1 })
  const domingoSemana = endOfWeek(hoy, { weekStartsOn: 1 })
  const rangoSemana = `${format(lunesSemana, "EEE dd 'de' MMMM", { locale: es })} al ${format(
    domingoSemana,
    "EEE dd 'de' MMMM yyyy",
    { locale: es },
  )}`
  const titulo = `Resumen Semanal de Designaciones de Árbitros`

  const championshipsById = useMemo(() => {
    const map = new Map<number, Campeonato>()
    championships.forEach((c) => {
      if (c.id != null) map.set(Number(c.id), c)
    })
    return map
  }, [championships])

  const getArbNombre = (arb: Arbitro | undefined) =>
    arb ? `${arb.nombre || ""} ${arb.apellido || ""}`.trim() : "-"
  const getArbCategoria = (arb: Arbitro | undefined) => arb?.categoria || ""

  const formatoFechaConDia = (f: string | null | undefined) =>
    f ? format(new Date(f), "EEE dd/MM/yyyy", { locale: es }) : "-"

  const celdaArbitro = (arb: Arbitro | undefined) => getArbNombre(arb)

  const resolverCampeonato = (d: Designacion) => {
    const id = d.idCampeonato != null ? Number(d.idCampeonato) : null
    const camp = id != null ? championshipsById.get(id) : undefined
    const nombre = (camp?.nombre || d.nombreCampeonato || "Sin campeonato") as string
    const categoria = (camp?.categoria || "") as string
    return { id, nombre, categoria }
  }

  const esGeneral = (d: Designacion) => {
    const cat = resolverCampeonato(d).categoria.toUpperCase()
    return cat === "CAMPEONATO FUNDAMENTAL" || cat === "CAMPEONATO OFICIAL"
  }

  const getEstadoBadge = (estado?: string | null) => {
    const estadoUpper = estado?.toUpperCase() || ""
    const variants: Record<string, { bg: string; text: string; dot: string }> = {
      PROGRAMADA: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
      CONFIRMADA: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
      COMPLETADA: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
      CANCELADA: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    }
    const variant = variants[estadoUpper] || variants.PROGRAMADA
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${variant.dot}`} />
        <Badge className={`${variant.bg} ${variant.text}`}>{estadoUpper}</Badge>
      </div>
    )
  }

  const designacionesSemana = useMemo(() => {
    return designaciones
      .filter((d) => {
        if (!d?.fecha) return false
        try {
          return isWithinInterval(new Date(d.fecha), { start: lunesSemana, end: domingoSemana })
        } catch {
          return false
        }
      })
      .sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
        return dateA - dateB
      })
  }, [designaciones, lunesSemana, domingoSemana])

  // Escenario A: COPA PERÚ 2026 y demás campeonatos (cuenta completa, sin consolidar)
  const designacionesDetalladas = useMemo(
    () => designacionesSemana.filter((d) => !esGeneral(d)),
    [designacionesSemana],
  )

  // Escenario B: Fundamental / Oficial (Designación General) -> consolidar por campeonato+fecha+hora
  const filasGenerales = useMemo(() => {
    const generales = designacionesSemana.filter((d) => esGeneral(d))
    const grupos = new Map<string, Designacion[]>()
    generales.forEach((d) => {
      const key = `${d.idCampeonato ?? d.nombreCampeonato}|${d.fecha || ""}|${d.hora || ""}`
      if (!grupos.has(key)) grupos.set(key, [])
      grupos.get(key)!.push(d)
    })

    return Array.from(grupos.values())
      .map((lista) => {
        const primera = lista[0]
        const { nombre: nombreCampeonato, categoria } = resolverCampeonato(primera)
        const estadio =
          championshipsById.get(Number(primera.idCampeonato))?.estadio || primera.estadio || "-"

        const arbitrosResueltos = lista
          .flatMap((d) =>
            [d.arbitroPrincipal, d.arbitroAsistente1, d.arbitroAsistente2, d.cuartoArbitro]
              .filter(Boolean)
              .map((id) => {
                const arb = arbitros.find((a) => a.id?.toString() === id?.toString())
                return { nombre: getArbNombre(arb), categoria: getArbCategoria(arb) }
              }),
          )
          .filter((a) => a.nombre && a.nombre !== "-")
          .filter((a, i, arr) => arr.findIndex((x) => x.nombre === a.nombre) === i)

        return {
          key: `${primera.idCampeonato}|${primera.fecha}|${primera.hora}`,
          nombreCampeonato,
          categoria,
          fecha: primera.fecha,
          hora: primera.hora,
          estadio,
          arbitros: arbitrosResueltos,
          estado: primera.estado,
          ids: lista.map((d) => d.id || null),
        }
      })
      .sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
        return dateA - dateB
      })
  }, [designacionesSemana, arbitros, championshipsById])

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const success = await deleteDesignacion(deleteId)
      if (success) {
        cacheDesignaciones.refetch()
        toast({
          title: "✅ Designación eliminada",
          description: "La designación fue eliminada exitosamente",
        })
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo eliminar la designación",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error eliminando:", error)
      toast({ title: "❌ Error", description: "Ocurrió un error al eliminar", variant: "destructive" })
    } finally {
      setDeleteId(null)
      setIsDeleting(false)
    }
  }

  const exportarPDFResumen = async () => {
    try {
      const jsPDF = (await import("jspdf")).jsPDF
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

      let yPosition = 15

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("RESUMEN SEMANAL DE DESIGNACIONES DE ÁRBITROS", 105, yPosition, { align: "center" })
      yPosition += 8
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Comisión Departamental de Árbitros · Puno`, 105, yPosition, { align: "center" })
      yPosition += 6
      doc.text(
        `Semana: ${rangoSemana} · Generado: ${format(new Date(), "EEE dd/MM/yyyy HH:mm", { locale: es })}`,
        105,
        yPosition,
        { align: "center" },
      )
      yPosition += 10

      if (designacionesSemana.length === 0) {
        doc.text("No hay designaciones registradas para esta semana.", 15, yPosition)
      } else {
        // Escenario A: COPA PERÚ y demás campeonatos (detallado)
        if (designacionesDetalladas.length > 0) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
          doc.text("COPA PERÚ 2026 Y CAMPEONATOS OFICIALES", 15, yPosition)
          yPosition += 4

          const tableDataA = designacionesDetalladas.map((d, idx) => {
            const arbPrincipal = arbitros.find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
            const arbAsist1 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
            const arbAsist2 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
            const arbCuarto = arbitros.find((a) => a.id?.toString() === d.cuartoArbitro?.toString())
            return [
              (idx + 1).toString(),
              formatoFechaConDia(d.fecha),
              d.hora || "-",
              `${d.nombreEquipoLocal || "-"} vs ${d.nombreEquipoVisitante || "-"}`,
              d.estadio || "-",
              celdaArbitro(arbPrincipal),
              celdaArbitro(arbAsist1),
              celdaArbitro(arbAsist2),
              celdaArbitro(arbCuarto),
              d.estado || "-",
            ]
          })

          autoTable(doc, {
            head: [
              [
                "N°",
                "FECHA",
                "HORA",
                "PARTIDO",
                "ESTADIO",
                "PRINCIPAL",
                "ASIS. 1",
                "ASIS. 2",
                "4TO",
                "ESTADO",
              ],
            ],
            body: tableDataA,
            startY: yPosition,
            margin: { left: 10, right: 10 },
            styles: { fontSize: 9, cellPadding: 3, halign: "center", valign: "middle", minCellHeight: 9 },
            headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columnStyles: {
              0: { cellWidth: 9 },
              1: { cellWidth: 28 },
              2: { cellWidth: 14 },
              3: { cellWidth: 45 },
              4: { cellWidth: 28 },
              5: { cellWidth: 33 },
              6: { cellWidth: 33 },
              7: { cellWidth: 33 },
              8: { cellWidth: 33 },
              9: { cellWidth: 21 },
            },
          })

          // @ts-ignore
          yPosition = (doc as any).lastAutoTable.finalY + 10
        }

        // Escenario B: Fundamental / Oficial (consolidado) -> dos sub-secciones
        const filasOficiales = filasGenerales.filter(
          (f) => (f.categoria || "").toUpperCase() === "CAMPEONATO OFICIAL",
        )
        const filasFundamentales = filasGenerales.filter(
          (f) => (f.categoria || "").toUpperCase() === "CAMPEONATO FUNDAMENTAL",
        )

        const renderSeccionGeneral = (titulo: string, filas: typeof filasGenerales) => {
          if (filas.length === 0) return
          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
          doc.text(titulo, 15, yPosition)
          yPosition += 4

          const tableData = filas.map((f, idx) => {
            const arbitrosTexto = f.arbitros.map((a) => a.nombre).join("\n")
            return [
              (idx + 1).toString(),
              f.nombreCampeonato,
              formatoFechaConDia(f.fecha),
              f.hora || "-",
              "Designación General",
              f.estadio,
              arbitrosTexto,
              f.estado || "-",
            ]
          })

          autoTable(doc, {
            head: [["N°", "CAMPEONATO", "FECHA", "HORA", "TIPO", "UBICACIÓN", "ÁRBITROS", "ESTADO"]],
            body: tableData,
            startY: yPosition,
            margin: { left: 10, right: 10 },
            styles: { fontSize: 9, cellPadding: 3, halign: "center", valign: "middle", minCellHeight: 9 },
            headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            columnStyles: {
              1: { cellWidth: 38, halign: "left" },
              2: { cellWidth: 26 },
              5: { cellWidth: 30 },
              6: { cellWidth: 55, halign: "left" },
            },
          })

          // @ts-ignore
          yPosition = (doc as any).lastAutoTable.finalY + 10
        }

        renderSeccionGeneral("CAMPEONATOS OFICIALES (DESIGNACIÓN GENERAL)", filasOficiales)
        renderSeccionGeneral("CAMPEONATOS FUNDAMENTALES (DESIGNACIÓN GENERAL)", filasFundamentales)
      }

      doc.save(`resumen-semanal-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`)
      toast({
        title: "✅ PDF exportado",
        description: `Se exportaron ${designacionesSemana.length} designaciones de la semana`,
      })
    } catch (error) {
      console.error("Error exportando:", error)
      toast({ title: "❌ Error", description: "Error al exportar PDF", variant: "destructive" })
    }
  }

  if (loading && designacionesSemana.length === 0) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const renderAcciones = (ids: (number | null)[]) => (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 hover:bg-blue-50" title="Ver detalles">
        <Link href={`/dashboard/designaciones/${ids[0]}`}>
          <Eye className="w-3.5 h-3.5 text-blue-600" />
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 hover:bg-slate-100" title="Editar">
        <Link href={`/dashboard/designaciones/${ids[0]}/editar`}>
          <Edit className="w-3.5 h-3.5 text-slate-600" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDeleteId(ids[0] || null)}
        className="h-7 w-7 p-0 hover:bg-red-50"
        title="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600" />
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <section className="border-b pb-3 md:pb-4 lg:pb-6">
        <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
          Comisión Departamental de Árbitros · Puno
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">{titulo}</h1>
            <p className="text-slate-600 mt-2 text-xs md:text-sm font-semibold">
              Semana: {rangoSemana}
            </p>
            <p className="text-slate-500 mt-1 text-xs md:text-sm">
              {designacionesSemana.length} designaciones esta semana · Copa Perú 2026 se muestra en
              formato detallado; Fundamental/Oficial se consolida por fecha y hora.
            </p>
          </div>
          <Button
            onClick={exportarPDFResumen}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={designacionesSemana.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div ref={printRef} className="space-y-6">
          {designacionesSemana.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No hay designaciones registradas para la semana actual
                </p>
                <p className="text-slate-400 text-sm mt-1">{rangoSemana}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Escenario A: COPA PERÚ 2026 y demás campeonatos (detallado) */}
              {designacionesDetalladas.length > 0 && (
                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 p-4 bg-slate-50/60 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                        Copa Perú 2026 y Campeonatos Oficiales
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 font-medium">
                        {designacionesDetalladas.length}{" "}
                        {designacionesDetalladas.length === 1 ? "designación" : "designaciones"} ·
                        formato detallado
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="text-sm">
                      <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Fecha
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Hora
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Partido
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Estadio
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Principal
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Asist. 1
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Asist. 2
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            4to Árbitro
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Estado
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3 text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {designacionesDetalladas.map((d, idx) => {
                          const arbPrincipal = arbitros.find(
                            (a) => a.id?.toString() === d.arbitroPrincipal?.toString(),
                          )
                          const arbAsist1 = arbitros.find(
                            (a) => a.id?.toString() === d.arbitroAsistente1?.toString(),
                          )
                          const arbAsist2 = arbitros.find(
                            (a) => a.id?.toString() === d.arbitroAsistente2?.toString(),
                          )
                          const arbCuarto = arbitros.find(
                            (a) => a.id?.toString() === d.cuartoArbitro?.toString(),
                          )
                          return (
                            <TableRow
                              key={d.id}
                              className={`border-b border-slate-100 ${
                                idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                              } hover:bg-blue-50/70 transition-colors`}
                            >
                              <TableCell className="text-sm font-semibold px-3 whitespace-nowrap">
                                <div className="text-slate-900 font-bold text-xs">
                                  {d.fecha
                                    ? format(new Date(d.fecha), "EEE dd MMM", { locale: es }).toUpperCase()
                                    : "-"}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium px-3 whitespace-nowrap">
                                {d.fecha ? format(new Date(d.fecha), "HH:mm", { locale: es }) : "-"}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-slate-900 px-3">
                                <div className="space-y-1">
                                  <div>
                                    <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold border border-blue-100">
                                      {(d.nombreEquipoLocal || "-").substring(0, 12)}
                                    </span>
                                  </div>
                                  <div className="text-slate-400 text-xs font-bold">vs</div>
                                  <div>
                                    <span className="inline-block bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-semibold border border-orange-100">
                                      {(d.nombreEquipoVisitante || "-").substring(0, 12)}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-[140px]">
                                {d.estadio || "-"}
                              </TableCell>
                              <TableCell className="text-xs px-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs leading-tight">
                                    {getArbNombre(arbPrincipal)}
                                  </div>
                                  <div className="text-xs text-slate-500">{getArbCategoria(arbPrincipal)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs px-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs leading-tight">
                                    {getArbNombre(arbAsist1)}
                                  </div>
                                  <div className="text-xs text-slate-500">{getArbCategoria(arbAsist1)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs px-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs leading-tight">
                                    {getArbNombre(arbAsist2)}
                                  </div>
                                  <div className="text-xs text-slate-500">{getArbCategoria(arbAsist2)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs px-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs leading-tight">
                                    {getArbNombre(arbCuarto)}
                                  </div>
                                  <div className="text-xs text-slate-500">{getArbCategoria(arbCuarto)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 text-xs">{getEstadoBadge(d.estado)}</TableCell>
                              <TableCell className="text-xs px-3">{renderAcciones([d.id || null])}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Escenario B: Fundamental / Oficial (consolidado) */}
              {filasGenerales.length > 0 && (
                <Card className="overflow-hidden border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 p-4 bg-slate-50/60 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                        Campeonatos Fundamentales y Oficiales
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 font-medium">
                        {filasGenerales.length}{" "}
                        {filasGenerales.length === 1 ? "designación agrupada" : "designaciones agrupadas"}{" "}
                        · Designación General
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="text-sm">
                      <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Campeonato
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Fecha
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Hora
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Tipo de Designación
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Ubicación
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Árbitros
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Estado
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3 text-right">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filasGenerales.map((f, idx) => (
                          <TableRow
                            key={f.key}
                            className={`border-b border-slate-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                            } hover:bg-blue-50/70 transition-colors`}
                          >
                            <TableCell className="text-xs font-bold text-slate-900 px-3 align-top">
                              <div className="space-y-0.5">
                                <span>{f.nombreCampeonato}</span>
                                {f.categoria ? (
                                  <span className="block text-[11px] font-medium text-slate-500 uppercase">
                                    {f.categoria}
                                  </span>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-semibold px-3 whitespace-nowrap align-top">
                              <div className="text-slate-900 font-bold text-xs">
                                {f.fecha
                                  ? format(new Date(f.fecha), "EEE dd MMM", { locale: es }).toUpperCase()
                                  : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium px-3 whitespace-nowrap align-top">
                              {f.fecha ? format(new Date(f.fecha), "HH:mm", { locale: es }) : "-"}
                            </TableCell>
                            <TableCell className="text-xs px-3 align-top">
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200">
                                <ClipboardList className="w-3.5 h-3.5" />
                                Designación General
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-[160px] align-top">
                              {f.estadio}
                            </TableCell>
                            <TableCell className="text-xs px-3 align-top">
                              <div className="space-y-1">
                                {f.arbitros.length > 0 ? (
                                  f.arbitros.map((a, i) => (
                                    <div key={i} className="leading-tight">
                                      <span className="font-semibold text-slate-900 text-xs">{a.nombre}</span>
                                      {a.categoria ? (
                                        <span className="text-xs text-slate-500"> ({a.categoria})</span>
                                      ) : null}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-3 text-xs align-top">{getEstadoBadge(f.estado)}</TableCell>
                            <TableCell className="text-xs px-3 align-top">{renderAcciones(f.ids)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogDescription>
            ¿Está seguro de eliminar esta designación? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
