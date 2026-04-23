"use client"

export const dynamic = 'force-dynamic'

import React, { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, Download, Trophy, Filter, ChevronDown, ChevronRight, MapPin, FileText } from "lucide-react"
import { getDesignaciones, getArbitros, getCampeonatos, getEquipos, deleteDesignacion, type Designacion, type Arbitro, type Campeonato, type Equipo } from "@/services/api"
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCache } from "@/hooks/useCache"
import { TableSkeleton } from "@/components/Skeletons"

export default function DesignacionesPage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [weekFilter, setWeekFilter] = useState<string>("actual")
  const [championshipFilter, setChampionshipFilter] = useState<string>("todos")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>("todas")
  const [expandedProvincias, setExpandedProvincias] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetcher functions for useCache hook
  const fetchDesignaciones = async () => {
    const data = await getDesignaciones()
    return data || []
  }

  const fetchArbitros = async () => {
    const data = await getArbitros()
    return data || []
  }

  const fetchCampeonatos = async () => {
    const data = await getCampeonatos()
    return data || []
  }

  const fetchEquipos = async () => {
    const data = await getEquipos()
    return data || []
  }

  // Use cache hooks for data fetching with 5-minute TTL
  const cacheDesignaciones = useCache(
    "designaciones",
    fetchDesignaciones,
    { ttl: 5 * 60 * 1000 }
  )
  
  const loadingDesignaciones = cacheDesignaciones.isLoading
  const refetchDesignaciones = cacheDesignaciones.refetch

  const cacheArbitros = useCache(
    "arbitros",
    fetchArbitros,
    { ttl: 5 * 60 * 1000 }
  )
  const arbitros = Array.isArray(cacheArbitros.data) ? cacheArbitros.data : []
  const loadingArbitros = cacheArbitros.isLoading

  const cacheCampeonatos = useCache(
    "campeonatos",
    fetchCampeonatos,
    { ttl: 5 * 60 * 1000 }
  )
  const championships = Array.isArray(cacheCampeonatos.data) ? cacheCampeonatos.data : []
  const loadingCampeonatos = cacheCampeonatos.isLoading

  const cacheEquipos = useCache(
    "equipos",
    fetchEquipos,
    { ttl: 5 * 60 * 1000 }
  )
  const equipos = Array.isArray(cacheEquipos.data) ? cacheEquipos.data : []
  const loadingEquipos = cacheEquipos.isLoading

  const loading = loadingDesignaciones || loadingArbitros || loadingCampeonatos || loadingEquipos

  useEffect(() => {
    // Initialize expanded provincias when equipos load
    const provincias = [...new Set((equipos ?? []).map((e: Equipo) => e.provincia).filter(Boolean))] as string[]
    if (provincias.length > 0 && expandedProvincias.size === 0) {
      setExpandedProvincias(new Set([provincias[0]]))
    }
  }, [equipos])

  // Filtrar designaciones - versión simplificada para evitar el error
  let designacionesFiltradas: any[] = [];
  
  try {
    const dataSource = cacheDesignaciones.data;
    if (Array.isArray(dataSource)) {
      designacionesFiltradas = [...dataSource];
      
      // Aplicar filtros
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        designacionesFiltradas = designacionesFiltradas.filter((d: any) => {
          if (!d) return false;
          const local = String(d.nombreEquipoLocal || '').toLowerCase();
          const visitante = String(d.nombreEquipoVisitante || '').toLowerCase();
          const estadio = String(d.estadio || '').toLowerCase();
          return local.includes(term) || visitante.includes(term) || estadio.includes(term);
        });
      }
    }
  } catch (err) {
    console.error("Error filtering designaciones:", err);
    designacionesFiltradas = [];
  }

  // Estadísticas
  const stats = useMemo(() => {
    try {
      const today = new Date()
      const filteredData = Array.isArray(designacionesFiltradas) ? designacionesFiltradas : []
      
      return {
        total: filteredData.length,
        hoy: filteredData.filter((d) => {
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
        semana: filteredData.filter((d) => {
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
        confirmadas: filteredData.filter((d) => d?.estado?.toUpperCase() === "CONFIRMADA").length,
      }
    } catch (error) {
      console.error('Error in stats:', error)
      return { total: 0, hoy: 0, semana: 0, confirmadas: 0 }
    }
  }, [designacionesFiltradas])

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const success = await deleteDesignacion(deleteId)
      if (success) {
        refetchDesignaciones()
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

  // ============ FUNCIONES PARA AGRUPAR Y EXPORTAR POR DISTRITO ============
  
  const getProvinciaDistritoDeLaDesignacion = (designacion: Designacion) => {
    const equipoLocal = (equipos ?? []).find((e) => e.nombre === designacion.nombreEquipoLocal)
    const equipoVisitante = (equipos ?? []).find((e) => e.nombre === designacion.nombreEquipoVisitante)
    const equipo = equipoLocal || equipoVisitante
    return {
      provincia: equipo?.provincia || "Sin provincia",
      distrito: equipo?.distrito || "Sin distrito",
    }
  }

  const designacionesAgrupadas = useMemo(() => {
    try {
      const grupos: Record<string, Record<string, Designacion[]>> = {}
      
      const data = Array.isArray(designacionesFiltradas) ? designacionesFiltradas : []
      data.forEach((d) => {
        if (!d) return
        const { provincia, distrito } = getProvinciaDistritoDeLaDesignacion(d)
        if (!grupos[provincia]) grupos[provincia] = {}
        if (!grupos[provincia][distrito]) grupos[provincia][distrito] = []
        grupos[provincia][distrito].push(d)
      })
      
      return grupos
    } catch (error) {
      console.error('Error in designacionesAgrupadas:', error)
      return {}
    }
  }, [designacionesFiltradas, equipos])

  const provincias = useMemo(() => {
    return Object.keys(designacionesAgrupadas).sort()
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

  const exportToPDFByDistrito = async (provincia: string, distrito: string) => {
    const designacionesDistrito = designacionesAgrupadas[provincia]?.[distrito] || []
    
    if (designacionesDistrito.length === 0) {
      toast({ title: "⚠️ Sin datos", description: "No hay designaciones en este distrito", variant: "destructive" })
      return
    }

    try {
      const jsPDF = (await import("jspdf")).jsPDF
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      let yPosition = 15

      // ============ ENCABEZADO ============
      doc.setFont("Arial", "bold")
      doc.setFontSize(11)
      doc.text("FEDERACIÓN DEPORTIVA NACIONAL PERUANA DE FÚTBOL", 105, yPosition, { align: "center" })
      yPosition += 5

      doc.setFont("Arial", "bold")
      doc.setFontSize(10)
      doc.text("COMISIÓN NACIONAL DE ÁRBITROS", 105, yPosition, { align: "center" })
      yPosition += 8

      doc.setFont("Arial", "bold")
      doc.setFontSize(11)
      doc.text("DESIGNACIÓN DE ÁRBITROS - DISTRITO", 105, yPosition, { align: "center" })
      yPosition += 5

      doc.setFont("Arial", "normal")
      doc.setFontSize(10)
      doc.text(`${distrito}, ${provincia}`, 105, yPosition, { align: "center" })
      yPosition += 10

      // ============ TABLA PRINCIPAL ============
      const tableData = designacionesDistrito.map((d, idx) => {
        const arbPrincipal = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
        const arbAsist1 = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
        const arbAsist2 = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
        const arb4to = (arbitros ?? []).find((a) => a.id?.toString() === d.cuartoArbitro?.toString())
        
        return [
          (idx + 1).toString(),
          d.fecha ? format(new Date(d.fecha), "dd MMM", { locale: es }) : "-",
          d.fecha ? format(new Date(d.fecha), "HH:mm", { locale: es }) : "-",
          d.estadio || "-",
          d.nombreCampeonato || "-",
          d.nombreEquipoLocal || "-",
          d.nombreEquipoVisitante || "-",
          arbPrincipal ? `${arbPrincipal.nombre} ${arbPrincipal.apellido}`.trim() : "-",
          arbAsist1 ? `${arbAsist1.nombre} ${arbAsist1.apellido}`.trim() : "-",
          arbAsist2 ? `${arbAsist2.nombre} ${arbAsist2.apellido}`.trim() : "-",
          arb4to ? `${arb4to.nombre} ${arb4to.apellido}`.trim() : "-",
          d.estado || "-",
        ]
      })

      autoTable(doc, {
        head: [
          ["N°", "DÍA", "HORA", "ESTADIO", "CAMPEONATO", "E. LOCAL", "E. VISITA", "ÁRBITRO PRINCIPAL", "ÁRBITRO ASIST. 1", "ÁRBITRO ASIST. 2", "4° ÁRBITRO", "ESTADO"],
        ],
        body: tableData,
        startY: yPosition,
        margin: 8,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          font: "Arial",
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10

      // ============ PIE DE PÁGINA ============
      doc.setFont("Arial", "normal")
      doc.setFontSize(8)
      doc.text("Documento generado por el Sistema SIDAF", 105, yPosition, { align: "center" })
      doc.text(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }), 105, yPosition + 4, { align: "center" })

      const nombreArchivo = `designaciones-${distrito.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      doc.save(nombreArchivo)
      toast({ title: "✅ PDF exportado", description: `Designaciones de ${distrito}` })
    } catch (error) {
      console.error("Error exportando:", error)
      toast({ title: "❌ Error", description: "Error al exportar PDF", variant: "destructive" })
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

      // ============ ENCABEZADO PROFESIONAL ============
      doc.setFont("Arial", "bold")
      doc.setFontSize(11)
      doc.text("FEDERACIÓN DEPORTIVA NACIONAL PERUANA DE FÚTBOL", 105, yPosition, { align: "center" })
      yPosition += 5

      doc.setFont("Arial", "bold")
      doc.setFontSize(10)
      doc.text("COMISIÓN NACIONAL DE ÁRBITROS", 105, yPosition, { align: "center" })
      yPosition += 8

      doc.setFont("Arial", "bold")
      doc.setFontSize(11)
      doc.text("DESIGNACIÓN DE ÁRBITROS, ASESORES Y EQUIPO VAR", 105, yPosition, { align: "center" })
      yPosition += 10

      // ============ TABLA PRINCIPAL ============
      const tableData = designacionesFiltradas.map((d, idx) => {
        const arbPrincipal = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
        const arbAsist1 = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
        const arbAsist2 = (arbitros ?? []).find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
        const arb4to = (arbitros ?? []).find((a) => a.id?.toString() === d.cuartoArbitro?.toString())
        
        return [
          (idx + 1).toString(),
          d.fecha ? format(new Date(d.fecha), "dd MMM", { locale: es }) : "-",
          d.fecha ? format(new Date(d.fecha), "HH:mm", { locale: es }) : "-",
          d.estadio || "-",
          d.nombreCampeonato || "-",
          d.nombreEquipoLocal || "-",
          d.nombreEquipoVisitante || "-",
          arbPrincipal ? `${arbPrincipal.nombre} ${arbPrincipal.apellido}`.trim() : "-",
          arbAsist1 ? `${arbAsist1.nombre} ${arbAsist1.apellido}`.trim() : "-",
          arbAsist2 ? `${arbAsist2.nombre} ${arbAsist2.apellido}`.trim() : "-",
          arb4to ? `${arb4to.nombre} ${arb4to.apellido}`.trim() : "-",
          d.estado || "-",
        ]
      })

      autoTable(doc, {
        head: [
          ["N°", "DÍA", "HORA", "ESTADIO", "CAMPEONATO", "E. LOCAL", "E. VISITA", "ÁRBITRO PRINCIPAL", "ÁRBITRO ASIST. 1", "ÁRBITRO ASIST. 2", "4° ÁRBITRO", "ESTADO"],
        ],
        body: tableData,
        startY: yPosition,
        margin: 8,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: "center",
          valign: "middle",
          font: "Arial",
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { halign: "center", cellWidth: 12 },
          2: { halign: "center", cellWidth: 12 },
        },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10

      // ============ SECCIÓN DE ÁRBITROS DESIGNADOS ============
      doc.setFont("Arial", "bold")
      doc.setFontSize(10)
      doc.text("ÁRBITROS DESIGNADOS", 15, yPosition)
      yPosition += 7

      // Obtener árbitros únicos designados
      const arbitrosDesignados = new Set<number>()
      designacionesFiltradas.forEach((d) => {
        if (d.arbitroPrincipal) arbitrosDesignados.add(d.arbitroPrincipal)
        if (d.arbitroAsistente1) arbitrosDesignados.add(d.arbitroAsistente1)
        if (d.arbitroAsistente2) arbitrosDesignados.add(d.arbitroAsistente2)
        if (d.cuartoArbitro) arbitrosDesignados.add(d.cuartoArbitro)
      })

      doc.setFont("Arial", "normal")
      doc.setFontSize(9)

      Array.from(arbitrosDesignados).forEach((arbitroId, idx) => {
        const arbitro = (arbitros ?? []).find((a) => a.id === arbitroId)
        if (arbitro) {
          doc.text(`${idx + 1}. ${arbitro.nombre} ${arbitro.apellido}`.trim(), 15, yPosition)
          doc.setFont("Arial", "normal")
          doc.setFontSize(8)
          doc.text(`Categoría: ${arbitro.categoria || "N/A"}`, 20, yPosition + 3)
          doc.text(`${arbitro.disponible ? "✓ Disponible" : "✗ No Disponible"}`, 20, yPosition + 6)
          doc.setFont("Arial", "normal")
          doc.setFontSize(9)
          yPosition += 10
        }
      })

      // ============ PIE DE PÁGINA ============
      yPosition += 5
      doc.setFont("Arial", "normal")
      doc.setFontSize(8)
      doc.text("Documento generado por el Sistema SIDAF", 105, yPosition, { align: "center" })
      doc.text(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }), 105, yPosition + 4, { align: "center" })

      doc.save(`designaciones-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`)
      toast({ title: "✅ PDF exportado", description: "El archivo se descargó correctamente" })
    } catch (error) {
      console.error("Error exportando:", error)
      toast({ title: "❌ Error", description: "Error al exportar PDF", variant: "destructive" })
    }
  }

  if (loading && (designacionesFiltradas ?? []).length === 0) {
    return (
      <div className="p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Gestión de Designaciones</h1>
          <div className="space-y-4">
            <TableSkeleton rows={10} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-sm shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/40 to-purple-500/40 flex items-center justify-center border border-indigo-400/30">
            <Trophy className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Designaciones</h1>
            <p className="text-sm text-indigo-100">Gestión de árbitros y partidos • {designacionesFiltradas.length} designaciones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white border-0 font-medium">
            <Link href="/dashboard/designaciones/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Designación
            </Link>
          </Button>
          <Button onClick={exportToPDF} className="bg-slate-700/50 hover:bg-slate-600 text-slate-100 border-slate-600/50">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 border-t-2 border-t-slate-500 backdrop-blur-sm shadow-lg shadow-slate-900/20">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Total</div>
            <div className="text-2xl font-bold text-slate-200">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border-indigo-500/40 border-t-2 border-t-indigo-500 backdrop-blur-sm shadow-lg shadow-indigo-500/20">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2">Hoy</div>
            <div className="text-2xl font-bold text-indigo-200">{stats.hoy}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-500/40 border-t-2 border-t-emerald-500 backdrop-blur-sm shadow-lg shadow-emerald-500/20">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-2">Esta Semana</div>
            <div className="text-2xl font-bold text-emerald-200">{stats.semana}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 border-green-500/40 border-t-2 border-t-green-500 backdrop-blur-sm shadow-lg shadow-green-500/20">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-2">Confirmadas</div>
            <div className="text-2xl font-bold text-green-200">{stats.confirmadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700/50 p-4 space-y-4 backdrop-blur-sm shadow-lg shadow-slate-900/20">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Búsqueda</label>
            <Input
              placeholder="Buscar por equipo, estadio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Semana</label>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="actual">Esta Semana</SelectItem>
                <SelectItem value="proxima">Próxima Semana</SelectItem>
                <SelectItem value="pasadas">Pasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Campeonato</label>
            <Select value={championshipFilter} onValueChange={setChampionshipFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(championships ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id?.toString() || ""}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Estado</label>
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
      </div>

      {/* Tabla de Designaciones Agrupada por Provincia y Distrito */}
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
            <Card key={provincia} className="overflow-hidden shadow-sm">
              {/* Encabezado de Provincia */}
              <button
                onClick={() => toggleProvincia(provincia)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold text-lg">{provincia}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {Object.values(designacionesAgrupadas[provincia] || {}).reduce((sum, arr) => sum + arr.length, 0)} designaciones
                  </span>
                </div>
                {expandedProvincias.has(provincia) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              {/* Distritos */}
              {expandedProvincias.has(provincia) && (
                <CardContent className="p-0 space-y-3 bg-slate-50">
                  {Object.entries(designacionesAgrupadas[provincia] || {})
                    .sort(([, a], [, b]) => b.length - a.length)
                    .map(([distrito, designacionesDistrito]) => (
                      <div key={distrito} className="border-l-4 border-blue-500 bg-white p-4 m-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{distrito}</h3>
                            <p className="text-sm text-slate-500">{designacionesDistrito.length} designaciones</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDFByDistrito(provincia, distrito)}
                            className="hover:bg-blue-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Exportar PDF
                          </Button>
                        </div>

                        {/* Tabla del Distrito */}
                        <div className="overflow-x-auto">
                          <Table className="text-sm">
                            <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                              <TableRow>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Fecha</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Campeonato</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Partido</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3">Estadio</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3 min-w-[180px]">Árbitro Principal</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3 min-w-[160px]">Asist. 1</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3 min-w-[160px]">Asist. 2</TableHead>
                                <TableHead className="h-10 text-xs font-bold text-slate-700 uppercase tracking-wide px-3 min-w-[160px]">4° Árbitro</TableHead>
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
                                  const arbitroPrincipal = (arbitros ?? []).find((a) => a.id?.toString() === designacion.arbitroPrincipal?.toString())
                                  const arbitroAsist1 = (arbitros ?? []).find((a) => a.id?.toString() === designacion.arbitroAsistente1?.toString())
                                  const arbitroAsist2 = (arbitros ?? []).find((a) => a.id?.toString() === designacion.arbitroAsistente2?.toString())
                                  const cuartoArbitro = (arbitros ?? []).find((a) => a.id?.toString() === designacion.cuartoArbitro?.toString())

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
                                            <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                                              {designacion.nombreEquipoVisitante?.substring(0, 8) || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs text-slate-600 px-3 font-medium truncate max-w-xs">
                                        {designacion.estadio || "-"}
                                      </TableCell>
                                      <TableCell className="text-xs px-3 min-w-[180px]">
                                        <div className="space-y-0.5">
                                          <div className="font-semibold text-slate-900 text-xs">
                                            {arbitroPrincipal ? `${arbitroPrincipal.nombre?.substring(0, 20)} ${arbitroPrincipal.apellido?.substring(0, 15)}`.trim() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">{arbitroPrincipal?.categoria || ""}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3 min-w-[160px]">
                                        <div className="space-y-0.5">
                                          <div className="font-medium text-slate-800 text-xs">
                                            {arbitroAsist1 ? `${arbitroAsist1.nombre?.substring(0, 18)}`.trim() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">{arbitroAsist1?.categoria || ""}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3 min-w-[160px]">
                                        <div className="space-y-0.5">
                                          <div className="font-medium text-slate-800 text-xs">
                                            {arbitroAsist2 ? `${arbitroAsist2.nombre?.substring(0, 18)}`.trim() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">{arbitroAsist2?.categoria || ""}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs px-3 min-w-[160px]">
                                        <div className="space-y-0.5">
                                          <div className="font-medium text-slate-800 text-xs">
                                            {cuartoArbitro ? `${cuartoArbitro.nombre?.substring(0, 18)}`.trim() : "-"}
                                          </div>
                                          <div className="text-xs text-slate-500">{cuartoArbitro?.categoria || ""}</div>
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

      {/* Diálogo de eliminación */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar designación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La designación será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
