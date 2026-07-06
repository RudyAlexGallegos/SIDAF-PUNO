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
  ClipboardList,
  Calendar,
  CheckCircle2,
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
   asesor?: number | string | null
   fecha?: string | Date
   hora?: string
   estadio?: string
   nombreCampeonato?: string
   estado?: string
   provinciaEquipo?: string
   distritoEquipo?: string
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
     }
   )

   // Fetch arbitros
   const cacheArbitros = useCache(
     "arbitros",
     async () => {
       const data = await getArbitros()
       return Array.isArray(data) ? data : []
     }
   )

   // Fetch campeonatos
   const cacheCampeonatos = useCache(
     "campeonatos",
     async () => {
       const data = await getCampeonatos()
       return Array.isArray(data) ? data : []
     }
   )

   // Fetch equipos
   const cacheEquipos = useCache(
     "equipos",
     async () => {
       const data = await getEquipos()
       return Array.isArray(data) ? data : []
     }
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

   const getSemanaLabel = (fecha: string | Date | undefined) => {
     if (!fecha) return "Sin fecha"
     try {
       const fechaObj = new Date(fecha)
       const lunes = startOfWeek(fechaObj, { weekStartsOn: 1 })
       const domingo = endOfWeek(fechaObj, { weekStartsOn: 1 })
       const lunesStr = format(lunes, "dd", { locale: es })
       const domingoStr = format(domingo, "dd MMM", { locale: es })
       return `${lunesStr} al ${domingoStr}`.toUpperCase()
     } catch {
       return "Fecha inválida"
     }
   }

   const designacionesAgrupadas = useMemo(() => {
     const grupos: Record<string, Record<string, Designacion[]>> = {}

     designacionesFiltradas.forEach((d) => {
       if (!d) return
       const campeonato = d.nombreCampeonato || "Sin campeonato"
       const semanaLabel = getSemanaLabel(d.fecha)
       if (!grupos[campeonato]) grupos[campeonato] = {}
       if (!grupos[campeonato][semanaLabel]) grupos[campeonato][semanaLabel] = []
       grupos[campeonato][semanaLabel].push(d)
     })

     return grupos
   }, [designacionesFiltradas])

   const campeonatos = useMemo(() => {
     return Object.keys(designacionesAgrupadas).sort()
   }, [designacionesAgrupadas])

useEffect(() => {
     const camps = Object.keys(designacionesAgrupadas)
     if (camps.length > 0 && expandedProvincias.size === 0) {
       setExpandedProvincias(new Set([camps[0]]))
     }
   }, [designacionesAgrupadas])

   const toggleCampeonato = (campeonato: string) => {
     const newSet = new Set(expandedProvincias)
     if (newSet.has(campeonato)) {
       newSet.delete(campeonato)
     } else {
       newSet.add(campeonato)
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
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <section className="border-b pb-3 md:pb-4 lg:pb-6">
        <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
          Comisión Departamental de Árbitros · Puno
        </p>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
          Gestión de Designaciones
        </h1>
        <p className="text-slate-500 mt-2 max-w-3xl text-xs md:text-sm lg:text-base">
          Administra árbitros y asignaciones de partidos • {designacionesFiltradas.length} designaciones
        </p>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
            <div className="rounded-xl bg-white border border-gray-200 p-3 md:p-4 lg:p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ClipboardList className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 md:mt-3">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">Total</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3 md:p-4 lg:p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Calendar className="h-4 md:h-5 w-4 md:w-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2 md:mt-3">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">{stats.hoy}</p>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">Hoy</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3 md:p-4 lg:p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-4 md:h-5 w-4 md:w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 md:mt-3">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">{stats.semana}</p>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">Esta Semana</p>
              </div>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3 md:p-4 lg:p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 md:h-5 w-4 md:w-5 text-indigo-600" />
                </div>
              </div>
              <div className="mt-2 md:mt-3">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">{stats.confirmadas}</p>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">Confirmadas</p>
              </div>
            </div>
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-2 block">Búsqueda</label>
                  <Input
                    placeholder="Buscar por equipo, estadio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-2 block">Campeonato</label>
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
                  <label className="text-xs font-semibold text-slate-700 mb-2 block">Estado</label>
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
            {campeonatos.length === 0 ? (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No hay designaciones que coincidan con los filtros</p>
                </CardContent>
              </Card>
            ) : (
              campeonatos.map((campeonato) => (
                <Card key={campeonato} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <button
                    onClick={() => toggleCampeonato(campeonato)}
                    className="w-full bg-white hover:bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 md:h-11 md:w-11 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-lg text-slate-900">{campeonato}</span>
                        <span className="ml-2 text-sm text-slate-600 font-medium">
                          {Object.values(designacionesAgrupadas[campeonato] || {}).reduce((sum, arr) => sum + arr.length, 0)} designaciones
                        </span>
                      </div>
                    </div>
                    {expandedProvincias.has(campeonato) ? (
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                    )}
                  </button>

                   {expandedProvincias.has(campeonato) && (
                     <CardContent className="p-0 space-y-3 bg-gray-50">
                     {Object.entries(designacionesAgrupadas[campeonato] || {})
                       .sort(([, a], [, b]) => b.length - a.length)
                       .map(([semana, designacionesSemana]) => (
                         <div key={semana} className="border-l-4 border-emerald-500 bg-white p-4 m-4 rounded-lg">
                           <div className="flex items-center justify-between mb-4">
                             <div>
                               <h3 className="text-lg font-bold text-slate-900">Semana {semana}</h3>
                               <p className="text-sm text-gray-600">{designacionesSemana.length} partidos</p>
                             </div>
                           </div>

                          <div className="overflow-x-auto">
                            <Table className="text-sm">
                              <TableHeader className="bg-gray-100 border-t border-b border-gray-200">
                              <TableRow>
<TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Fecha</TableHead>
                                 <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Hora</TableHead>
                                 <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Partido</TableHead>
                                 <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Estadio</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Principal</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Asist. 1</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Asist. 2</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">4to Árbitro</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Estado</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
<TableBody>
                               {designacionesSemana
                                 .sort((a, b) => {
                                   const dateA = a.fecha ? new Date(a.fecha).getTime() : 0
                                   const dateB = b.fecha ? new Date(b.fecha).getTime() : 0
                                   return dateA - dateB
                                 })
                                 .map((designacion, idx) => {
                                  const arbPrincipal = arbitros.find((a) => a.id?.toString() === designacion.arbitroPrincipal?.toString())
                                  const arbAsist1 = arbitros.find((a) => a.id?.toString() === designacion.arbitroAsistente1?.toString())
                                  const arbAsist2 = arbitros.find((a) => a.id?.toString() === designacion.arbitroAsistente2?.toString())
                                  const arbCuarto = arbitros.find((a) => a.id?.toString() === designacion.cuartoArbitro?.toString())

                                  const getArbNombre = (arb: any) => arb ? `${arb.nombre || ""} ${arb.apellido || ""}`.trim() : "-"
                                  const getArbCategoria = (arb: any) => arb?.categoria || ""

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
                                         </div>
                                       </TableCell>
                                       <TableCell className="text-sm font-medium px-3 whitespace-nowrap">
                                         {designacion.fecha ? format(new Date(designacion.fecha), "HH:mm", { locale: es }) : "-"}
                                       </TableCell>
                                       <TableCell className="text-xs font-bold text-slate-900 px-3">
                                         <div className="space-y-1">
                                           <div>
                                             <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                               {(designacion.nombreEquipoLocal || "-").substring(0, 10)}
                                             </span>
                                           </div>
                                           <div className="text-slate-400 text-xs font-bold">vs</div>
                                           <div>
                                             <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">
                                               {(designacion.nombreEquipoVisitante || "-").substring(0, 10)}
                                             </span>
                                           </div>
                                         </div>
                                       </TableCell>
                                       <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-[120px]">
                                         {designacion.estadio || "-"}
                                       </TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {getArbNombre(arbPrincipal)}
                                          </div>
                                          <div className="text-xs text-slate-500">{getArbCategoria(arbPrincipal)}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {getArbNombre(arbAsist1)}
                                          </div>
                                          <div className="text-xs text-slate-500">{getArbCategoria(arbAsist1)}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {getArbNombre(arbAsist2)}
                                          </div>
                                          <div className="text-xs text-slate-500">{getArbCategoria(arbAsist2)}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {getArbNombre(arbCuarto)}
                                          </div>
                                          <div className="text-xs text-slate-500">{getArbCategoria(arbCuarto)}</div>
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
