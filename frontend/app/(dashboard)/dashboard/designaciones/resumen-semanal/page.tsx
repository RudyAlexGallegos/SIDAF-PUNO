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
  const weekLabel = `${format(lunesSemana, "dd").toUpperCase()} AL ${format(
    domingoSemana,
    "dd MMM",
    { locale: es },
  ).toUpperCase()}`
  const titulo = `Designación de Árbitros - ${weekLabel}`

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

  const resolverCampeonato = (d: Designacion) => {
    const id = d.idCampeonato != null ? Number(d.idCampeonato) : null
    const camp = id != null ? championshipsById.get(id) : undefined
    const nombre = (camp?.nombre || d.nombreCampeonato || "Sin campeonato") as string
    const categoria = (camp?.categoria || "") as string
    return { id, nombre, categoria }
  }

  const esCopaPeru = (d: Designacion) => {
    const { nombre } = resolverCampeonato(d)
    return nombre === "COPA PERÚ 2026"
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

  const designacionesGenerales = useMemo(
    () => designacionesSemana.filter((d) => esGeneral(d)),
    [designacionesSemana],
  )

  const designacionesCopa = useMemo(
    () => designacionesSemana.filter((d) => !esGeneral(d)),
    [designacionesSemana],
  )

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
      doc.text("DESIGNACIÓN DE ÁRBITROS", 105, yPosition, { align: "center" })
      yPosition += 8
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Comisión Departamental de Árbitros · Puno`, 105, yPosition, { align: "center" })
      yPosition += 6
      doc.text(`Resumen Semanal: ${weekLabel} · Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 105, yPosition, { align: "center" })
      yPosition += 10

      const getEstadio = (d: Designacion) =>
        championshipsById.get(Number(d.idCampeonato))?.estadio || d.estadio || "-"

      // Escenario A: COPA PERÚ / otros (cuenta completa)
      if (designacionesCopa.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("COPA PERÚ 2026 Y CAMPEONATOS OFICIALES", 15, yPosition)
        yPosition += 4

        const tableDataA = designacionesCopa.map((d, idx) => {
          const arbPrincipal = arbitros.find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
          const arbAsist1 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
          const arbAsist2 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
          const arbCuarto = arbitros.find((a) => a.id?.toString() === d.cuartoArbitro?.toString())
          return [
            (idx + 1).toString(),
            d.fecha ? format(new Date(d.fecha), "dd/MM/yyyy", { locale: es }) : "-",
            d.hora || "-",
            `${d.nombreEquipoLocal || "-"} vs ${d.nombreEquipoVisitante || "-"}`,
            d.estadio || "-",
            getArbNombre(arbPrincipal),
            getArbCategoria(arbPrincipal),
            getArbNombre(arbAsist1),
            getArbCategoria(arbAsist1),
            getArbNombre(arbAsist2),
            getArbCategoria(arbAsist2),
            getArbNombre(arbCuarto),
            getArbCategoria(arbCuarto),
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
              "CAT.",
              "ASIS. 1",
              "CAT.",
              "ASIS. 2",
              "CAT.",
              "4TO",
              "CAT.",
              "ESTADO",
            ],
          ],
          body: tableDataA,
          startY: yPosition,
          margin: { left: 10, right: 10 },
          styles: { fontSize: 8, cellPadding: 3, halign: "center" },
          headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: {
            3: { cellWidth: 38 },
            5: { cellWidth: 26 },
            7: { cellWidth: 26 },
            9: { cellWidth: 26 },
            11: { cellWidth: 26 },
          },
        })

        // @ts-ignore - autoTable añade lastAutoTable
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      // Escenario B: Fundamental / Oficial (designación general)
      if (designacionesGenerales.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("CAMPEONATOS FUNDAMENTALES Y OFICIALES (DESIGNACIÓN GENERAL)", 15, yPosition)
        yPosition += 4

        const tableDataB = designacionesGenerales.map((d, idx) => {
          const arbPrincipal = arbitros.find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
          const arbAsist1 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
          const arbAsist2 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
          const arbCuarto = arbitros.find((a) => a.id?.toString() === d.cuartoArbitro?.toString())
          const arbUnico = arbPrincipal || arbAsist1 || arbAsist2 || arbCuarto
          return [
            (idx + 1).toString(),
            d.fecha ? format(new Date(d.fecha), "dd/MM/yyyy", { locale: es }) : "-",
            d.hora || "-",
            "Designación General",
            getEstadio(d),
            getArbNombre(arbUnico),
            getArbCategoria(arbUnico),
            d.estado || "-",
          ]
        })

        autoTable(doc, {
          head: [["N°", "FECHA", "HORA", "ASIGNACIÓN", "ESTADIO", "ÁRBITRO", "CAT.", "ESTADO"]],
          body: tableDataB,
          startY: yPosition,
          margin: { left: 10, right: 10 },
          styles: { fontSize: 8, cellPadding: 3, halign: "center" },
          headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: { 3: { cellWidth: 35 }, 5: { cellWidth: 40 } },
        })

        // @ts-ignore
        yPosition = (doc as any).lastAutoTable.finalY + 10
      }

      if (designacionesSemana.length === 0) {
        doc.text("No hay designaciones registradas para esta semana.", 15, yPosition)
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

  const renderAcciones = (d: Designacion) => (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 hover:bg-blue-50" title="Ver detalles">
        <Link href={`/dashboard/designaciones/${d.id}`}>
          <Eye className="w-3.5 h-3.5 text-blue-600" />
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 hover:bg-slate-100" title="Editar">
        <Link href={`/dashboard/designaciones/${d.id}/editar`}>
          <Edit className="w-3.5 h-3.5 text-slate-600" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDeleteId(d.id || null)}
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
            <p className="text-slate-500 mt-2 text-xs md:text-sm">
              Resumen consolidado de designaciones de la semana actual · {designacionesSemana.length}{" "}
              {designacionesSemana.length === 1 ? "designación" : "designaciones"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {format(lunesSemana, "dd MMM", { locale: es })} al{" "}
              {format(domingoSemana, "dd MMM yyyy", { locale: es })}
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
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Escenario B: Fundamental / Oficial */}
              {designacionesGenerales.length > 0 && (
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
                        {designacionesGenerales.length}{" "}
                        {designacionesGenerales.length === 1 ? "designación" : "designaciones"} ·
                        Designación General
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
                            Asignación
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Estadio
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold text-slate-600 uppercase tracking-wide px-3">
                            Árbitro
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
                        {designacionesGenerales.map((d, idx) => {
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
                          const arbUnico = arbPrincipal || arbAsist1 || arbAsist2 || arbCuarto
                          const estadio =
                            championshipsById.get(Number(d.idCampeonato))?.estadio || d.estadio || "-"
                          return (
                            <TableRow
                              key={d.id}
                              className={`border-b border-slate-100 ${
                                idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                              } hover:bg-blue-50/70 transition-colors`}
                            >
                              <TableCell className="text-sm font-semibold px-3 whitespace-nowrap">
                                <div className="text-slate-900 font-bold text-xs">
                                  {d.fecha ? format(new Date(d.fecha), "dd MMM", { locale: es }).toUpperCase() : "-"}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium px-3 whitespace-nowrap">
                                {d.fecha ? format(new Date(d.fecha), "HH:mm", { locale: es }) : "-"}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-slate-900 px-3">
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200">
                                  <ClipboardList className="w-3.5 h-3.5" />
                                  Designación General
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-[140px]">
                                {estadio}
                              </TableCell>
                              <TableCell className="text-xs px-3">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs leading-tight">
                                    {getArbNombre(arbUnico)}
                                  </div>
                                  <div className="text-xs text-slate-500">{getArbCategoria(arbUnico)}</div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 text-xs">{getEstadoBadge(d.estado)}</TableCell>
                              <TableCell className="text-xs px-3">{renderAcciones(d)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* Escenario A: COPA PERÚ y demás campeonatos */}
              {designacionesCopa.length > 0 && (
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
                        {designacionesCopa.length}{" "}
                        {designacionesCopa.length === 1 ? "designación" : "designaciones"}
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
                        {designacionesCopa.map((d, idx) => {
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
                                  {d.fecha ? format(new Date(d.fecha), "dd MMM", { locale: es }).toUpperCase() : "-"}
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
                              <TableCell className="text-xs px-3">{renderAcciones(d)}</TableCell>
                            </TableRow>
                          )
                        })}
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
