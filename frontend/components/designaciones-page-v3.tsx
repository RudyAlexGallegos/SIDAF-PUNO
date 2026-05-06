"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Trophy,
  Plus,
  Download,
  MapPin,
  ChevronDown,
  ChevronRight,
  FileText,
  Eye,
  Edit,
  Trash2,
  Filter,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { getDesignaciones, getArbitros, getCampeonatos, getEquipos, deleteDesignacion } from "@/services/api"
import { useCache } from "@/hooks/useCache"

interface Designacion {
  id?: number | null
  nombreEquipoLocal?: string
  nombreEquipoVisitante?: string
  arbitroPrincipal?: number | string | null
  arbitroAsistente1?: number | string | null
  arbitroAsistente2?: number | string | null
  cuartoArbitro?: number | string | null
  fecha?: string | Date
  hora?: string
  estadio?: string
  nombreCampeonato?: string
  estado?: string
}

interface Arbitro {
  id?: number | null
  nombre?: string
  apellido?: string
  categoria?: string
  disponible?: boolean
}

interface Campeonato {
  id?: number | null
  nombre?: string
}

interface Equipo {
  id?: number | null
  nombre?: string
  provincia?: string
  distrito?: string
}

export default function DesignacionesPageClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <DesignacionesPageContent />
}

function DesignacionesPageContent() {
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [championshipFilter, setChampionshipFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [expandedProvincias, setExpandedProvincias] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch designaciones
  const cacheDesignaciones = useCache(
    "designaciones",
    async () => {
      const data = await getDesignaciones()
      return Array.isArray(data) ? data : []
    },
    { ttl: 5 * 60 * 1000 }
  )

  // Fetch arbitros
  const cacheArbitros = useCache(
    "arbitros",
    async () => {
      const data = await getArbitros()
      return Array.isArray(data) ? data : []
    },
    { ttl: 5 * 60 * 1000 }
  )

  // Fetch campeonatos
  const cacheCampeonatos = useCache(
    "campeonatos",
    async () => {
      const data = await getCampeonatos()
      return Array.isArray(data) ? data : []
    },
    { ttl: 5 * 60 * 1000 }
  )

  // Fetch equipos
  const cacheEquipos = useCache(
    "equipos",
    async () => {
      const data = await getEquipos()
      return Array.isArray(data) ? data : []
    },
    { ttl: 5 * 60 * 1000 }
  )

  const designaciones = Array.isArray(cacheDesignaciones.data) ? cacheDesignaciones.data : []
  const arbitros = Array.isArray(cacheArbitros.data) ? cacheArbitros.data : []
  const championships = Array.isArray(cacheCampeonatos.data) ? cacheCampeonatos.data : []
  const equipos = Array.isArray(cacheEquipos.data) ? cacheEquipos.data : []

  const loading = cacheDesignaciones.isLoading || cacheArbitros.isLoading || cacheCampeonatos.isLoading || cacheEquipos.isLoading

  // Filter designaciones
  const designacionesFiltradas = useMemo(() => {
    if (!Array.isArray(designaciones)) return []

    return designaciones.filter((d) => {
      if (!d) return false

      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase()
        const local = String(d.nombreEquipoLocal || "").toLowerCase()
        const visitante = String(d.nombreEquipoVisitante || "").toLowerCase()
        const estadio = String(d.estadio || "").toLowerCase()
        if (!local.includes(term) && !visitante.includes(term) && !estadio.includes(term)) return false
      }

      if (championshipFilter !== "todos" && d.nombreCampeonato !== championshipFilter) return false
      if (statusFilter !== "todos" && d.estado?.toUpperCase() !== statusFilter) return false

      return true
    })
  }, [designaciones, searchTerm, championshipFilter, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    if (!Array.isArray(designacionesFiltradas)) {
      return { total: 0, hoy: 0, semana: 0, confirmadas: 0 }
    }

    const today = new Date()
    return {
      total: designacionesFiltradas.length,
      hoy: designacionesFiltradas.filter((d) => {
        if (!d?.fecha) return false
        try {
          const fecha = new Date(d.fecha)
          return fecha.getDate() === today.getDate() && 
                 fecha.getMonth() === today.getMonth() &&
                 fecha.getFullYear() === today.getFullYear()
        } catch {
          return false
        }
      }).length,
      semana: designacionesFiltradas.filter((d) => {
        if (!d?.fecha) return false
        try {
          const fecha = new Date(d.fecha)
          const weekStart = startOfWeek(today, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
          return isWithinInterval(fecha, { start: weekStart, end: weekEnd })
        } catch {
          return false
        }
      }).length,
      confirmadas: designacionesFiltradas.filter((d) => d?.estado?.toUpperCase() === "CONFIRMADA").length,
    }
  }, [designacionesFiltradas])

  const getProvinciaDistrito = (designacion: Designacion) => {
    const equipoLocal = equipos.find((e) => e.nombre === designacion.nombreEquipoLocal)
    const equipoVisitante = equipos.find((e) => e.nombre === designacion.nombreEquipoVisitante)
    const equipo = equipoLocal || equipoVisitante
    return {
      provincia: equipo?.provincia || "Sin provincia",
      distrito: equipo?.distrito || "Sin distrito",
    }
  }

  const designacionesAgrupadas = useMemo(() => {
    const grupos: Record<string, Record<string, Designacion[]>> = {}

    designacionesFiltradas.forEach((d) => {
      if (!d) return
      const { provincia, distrito } = getProvinciaDistrito(d)
      if (!grupos[provincia]) grupos[provincia] = {}
      if (!grupos[provincia][distrito]) grupos[provincia][distrito] = []
      grupos[provincia][distrito].push(d)
    })

    return grupos
  }, [designacionesFiltradas, equipos])

  const provincias = useMemo(() => {
    return Object.keys(designacionesAgrupadas).sort()
  }, [designacionesAgrupadas])

  useEffect(() => {
    const provincias = Object.keys(designacionesAgrupadas)
    if (provincias.length > 0 && expandedProvincias.size === 0) {
      setExpandedProvincias(new Set([provincias[0]]))
    }
  }, [designacionesAgrupadas])

  const toggleProvincia = (provincia: string) => {
    const newSet = new Set(expandedProvincias)
    if (newSet.has(provincia)) {
      newSet.delete(provincia)
    } else {
      newSet.add(provincia)
    }
    setExpandedProvincias(newSet)
  }

  const getEstadoBadge = (estado?: string) => {
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

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const success = await deleteDesignacion(deleteId)
      if (success) {
        cacheDesignaciones.refetch()
        toast({ title: "✅ Designación eliminada", description: "La designación fue eliminada exitosamente" })
      } else {
        toast({ title: "❌ Error", description: "No se pudo eliminar la designación", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error eliminando:", error)
      toast({ title: "❌ Error", description: "Ocurrió un error al eliminar", variant: "destructive" })
    } finally {
      setDeleteId(null)
      setIsDeleting(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).jsPDF
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      let yPosition = 15

      doc.setFont("Arial", "bold")
      doc.setFontSize(14)
      doc.text("DESIGNACIÓN DE ÁRBITROS", 105, yPosition, { align: "center" })
      yPosition += 8

      const tableData = designacionesFiltradas.map((d, idx) => {
        const arbPrincipal = arbitros.find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())

        return [
          (idx + 1).toString(),
          d.fecha ? format(new Date(d.fecha), "dd/MM/yyyy HH:mm", { locale: es }) : "-",
          d.nombreCampeonato || "-",
          `${d.nombreEquipoLocal || "-"} vs ${d.nombreEquipoVisitante || "-"}`,
          d.estadio || "-",
          arbPrincipal ? `${arbPrincipal.nombre} ${arbPrincipal.apellido}`.trim() : "-",
          d.estado || "-",
        ]
      })

      autoTable(doc, {
        head: [["N°", "FECHA", "CAMPEONATO", "PARTIDO", "ESTADIO", "ÁRBITRO PRINCIPAL", "ESTADO"]],
        body: tableData,
        startY: yPosition,
        margin: 10,
        styles: { fontSize: 9, cellPadding: 4, halign: "center" },
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
      })

      doc.save(`designaciones-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`)
      toast({ title: "✅ PDF exportado", description: "El archivo se descargó correctamente" })
    } catch (error) {
      console.error("Error exportando:", error)
      toast({ title: "❌ Error", description: "Error al exportar PDF", variant: "destructive" })
    }
  }

  if (loading && designacionesFiltradas.length === 0) {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Comisión Departamental de Árbitros</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Gestión de Designaciones</h1>
              <p className="text-sm text-gray-600 mt-2">Administra árbitros y asignaciones de partidos • {designacionesFiltradas.length} designaciones</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-medium text-sm">
                <Link href="/dashboard/designaciones/nueva">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Designación
                </Link>
              </Button>
              <Button onClick={exportToPDF} className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Total</div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Hoy</div>
                <div className="text-3xl font-bold text-blue-600">{stats.hoy}</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Esta Semana</div>
                <div className="text-3xl font-bold text-blue-600">{stats.semana}</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Confirmadas</div>
                <div className="text-3xl font-bold text-green-600">{stats.confirmadas}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Búsqueda</label>
                  <Input
                    placeholder="Buscar por equipo, estadio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Campeonato</label>
                  <Select value={championshipFilter} onValueChange={setChampionshipFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {championships.map((c) => (
                        <SelectItem key={c.id} value={c.nombre || ""}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Estado</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="PROGRAMADA">Programada</SelectItem>
                      <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                      <SelectItem value="COMPLETADA">Completada</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div ref={printRef} className="space-y-4">
        {provincias.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No hay designaciones que coincidan con los filtros</p>
            </CardContent>
          </Card>
            ) : (
              provincias.map((provincia) => (
                <Card key={provincia} className="overflow-hidden border border-gray-200 shadow-sm">
                  <button
                    onClick={() => toggleProvincia(provincia)}
                    className="w-full bg-white hover:bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-lg text-slate-900">{provincia}</span>
                        <span className="ml-2 text-sm text-gray-600 font-medium">
                          {Object.values(designacionesAgrupadas[provincia] || {}).reduce((sum, arr) => sum + arr.length, 0)} designaciones
                        </span>
                      </div>
                    </div>
                    {expandedProvincias.has(provincia) ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {expandedProvincias.has(provincia) && (
                    <CardContent className="p-0 space-y-3 bg-gray-50">
                    {Object.entries(designacionesAgrupadas[provincia] || {})
                      .sort(([, a], [, b]) => b.length - a.length)
                      .map(([distrito, designacionesDistrito]) => (
                        <div key={distrito} className="border-l-4 border-blue-500 bg-white p-4 m-4 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{distrito}</h3>
                              <p className="text-sm text-gray-600">{designacionesDistrito.length} designaciones</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <Table className="text-sm">
                              <TableHeader className="bg-gray-100 border-t border-b border-gray-200">
                              <TableRow>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Fecha</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Campeonato</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Partido</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Estadio</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Árbitro Principal</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Estado</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {designacionesDistrito
                                .sort((a, b) => {
                                  const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
                                  const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
                                  return dateA - dateB
                                })
                                .map((designacion, idx) => {
                                  const arbPrincipal = arbitros.find((a) => a.id?.toString() === designacion.arbitroPrincipal?.toString())

                                  return (
                                    <TableRow
                                      key={designacion.id}
                                      className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors h-14`}
                                    >
                                      <TableCell className="text-sm font-semibold px-3 whitespace-nowrap">
                                        <div>
                                          <div className="text-slate-900 font-bold text-xs">
                                            {designacion.fecha ? format(new Date(designacion.fecha), "dd MMM", { locale: es }).toUpperCase() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">
                                            {designacion.fecha ? format(new Date(designacion.fecha), "HH:mm", { locale: es }) : "-"}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs text-slate-700 px-3 font-medium truncate max-w-xs">
                                        {designacion.nombreCampeonato || "-"}
                                      </TableCell>
                                      <TableCell className="text-xs font-bold text-slate-900 px-3">
                                        <div className="space-y-1">
                                          <div>
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                              {designacion.nombreEquipoLocal?.substring(0, 8) || "-"}
                                            </span>
                                          </div>
                                          <div className="text-slate-400 text-xs font-bold">vs</div>
                                          <div>
                                            <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">
                                              {designacion.nombreEquipoVisitante?.substring(0, 8) || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-xs">
                                        {designacion.estadio || "-"}
                                      </TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {arbPrincipal ? `${arbPrincipal.nombre} ${arbPrincipal.apellido}`.trim() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">{arbPrincipal?.categoria || ""}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="px-3 text-xs">{getEstadoBadge(designacion.estado)}</TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-7 w-7 p-0 hover:bg-blue-50"
                                            title="Ver detalles"
                                          >
                                            <Link href={`/dashboard/designaciones/${designacion.id}`}>
                                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                                            </Link>
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-7 w-7 p-0 hover:bg-slate-100"
                                            title="Editar"
                                          >
                                            <Link href={`/dashboard/designaciones/${designacion.id}/editar`}>
                                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                                            </Link>
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteId(designacion.id || null)}
                                            className="h-7 w-7 p-0 hover:bg-red-50"
                                            title="Eliminar"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
          </div>
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
