"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, Download, Trophy, Filter } from "lucide-react"
import { getDesignaciones, getArbitros, getCampeonatos, deleteDesignacion, type Designacion, type Arbitro, type Campeonato } from "@/services/api"
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

export default function DesignacionesPage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  
  const [designaciones, setDesignaciones] = useState<Designacion[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [championships, setCampeonatos] = useState<Campeonato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [weekFilter, setWeekFilter] = useState<string>("actual")
  const [championshipFilter, setChampionshipFilter] = useState<string>("todos")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [desigData, arbitData, campData] = await Promise.all([
          getDesignaciones(),
          getArbitros(),
          getCampeonatos()
        ])
        setDesignaciones(desigData)
        setArbitros(arbitData)
        setCampeonatos(campData)
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrar designaciones
  const designacionesFiltradas = useMemo(() => {
    let result = designaciones

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((d) =>
        d.nombreEquipoLocal?.toLowerCase().includes(term) ||
        d.nombreEquipoVisitante?.toLowerCase().includes(term) ||
        d.estadio?.toLowerCase().includes(term)
      )
    }

    // Filtro por semana
    // Filtro por semana
    if (weekFilter !== "todos") {
      const today = new Date()
      result = result.filter((d) => {
        if (!d.fecha) return false
        const fechaPartido = new Date(d.fecha)
        if (weekFilter === "actual") {
          const weekStart = startOfWeek(today, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
          return isWithinInterval(fechaPartido, { start: weekStart, end: weekEnd })
        } else if (weekFilter === "proxima") {
          const nextWeekStart = startOfWeek(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 })
          const nextWeekEnd = endOfWeek(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 })
          return isWithinInterval(fechaPartido, { start: nextWeekStart, end: nextWeekEnd })
        } else if (weekFilter === "pasadas") {
          return fechaPartido < today
        }
        return true
      })
    }

    // Filtro por campeonato
    if (championshipFilter !== "todos") {
      result = result.filter((d) => d.idCampeonato?.toString() === championshipFilter)
    }

    // Filtro por estado
    if (statusFilter !== "todos") {
      result = result.filter((d) => d.estado?.toUpperCase() === statusFilter.toUpperCase())
    }

    // Filtro por estado
    if (statusFilter !== "todos") {
      result = result.filter((d) => d.estado?.toUpperCase() === statusFilter.toUpperCase())
    }

    return result.sort((a, b) => {
      if (!a.fecha || !b.fecha) return 0
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return dateB - dateA
    })
  }, [searchTerm, weekFilter, championshipFilter, statusFilter, designaciones])

  // Estadísticas
  const stats = useMemo(() => {
    const today = new Date()
    return {
      total: designacionesFiltradas.length,
      hoy: designacionesFiltradas.filter((d) => {
        if (!d.fecha) return false
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
        if (!d.fecha) return false
        try {
          const fecha = new Date(d.fecha)
          const weekStart = startOfWeek(today, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
          return isWithinInterval(fecha, { start: weekStart, end: weekEnd })
        } catch {
          return false
        }
      }).length,
      confirmadas: designacionesFiltradas.filter((d) => d.estado?.toUpperCase() === "CONFIRMADA").length,
    }
  }, [designacionesFiltradas])

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const success = await deleteDesignacion(deleteId)
      if (success) {
        setDesignaciones((prev) => prev.filter((d) => d.id !== deleteId))
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

  const exportToPDF = async () => {
    if (!printRef.current) return
    try {
      const html2pdf = (await import("html2pdf.js")).default
      const element = printRef.current
      const options: any = {
        margin: 10,
        filename: `designaciones-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        image: { type: "png", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
      }
      html2pdf().set(options).from(element).save()
      toast({ title: "✅ PDF exportado", description: "El archivo se descargó correctamente" })
    } catch (error) {
      console.error("Error exportando:", error)
      toast({ title: "❌ Error", description: "Error al exportar PDF", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Designaciones</h1>
            <p className="text-sm text-slate-500">Gestión de árbitros y partidos • {designacionesFiltradas.length} designaciones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/designaciones/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Designación
            </Link>
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="hover:bg-slate-50">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-b-2 border-b-slate-300">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-b-2 border-b-blue-400">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Hoy</div>
            <div className="text-2xl font-bold text-blue-600">{stats.hoy}</div>
          </CardContent>
        </Card>
        <Card className="border-b-2 border-b-emerald-400">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Esta Semana</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.semana}</div>
          </CardContent>
        </Card>
        <Card className="border-b-2 border-b-green-400">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Confirmadas</div>
            <div className="text-2xl font-bold text-green-600">{stats.confirmadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
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
                {championships.map((c) => (
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

      {/* Tabla de Designaciones - Para PDF */}
      <div ref={printRef} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {designacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay designaciones que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableRow>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Fecha</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Campeonato</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Partido</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Estadio</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Árbitro Principal</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Estado</TableHead>
                  <TableHead className="h-12 text-xs font-bold text-slate-700 uppercase tracking-wide">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designacionesFiltradas.map((designacion, idx) => (
                  <TableRow 
                    key={designacion.id} 
                    className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <TableCell className="text-sm whitespace-nowrap font-medium">
                      <div>
                        <div className="text-slate-900">
                          {designacion.fecha ? format(new Date(designacion.fecha), "dd MMM", { locale: es }) : "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {designacion.fecha ? format(new Date(designacion.fecha), "HH:mm", { locale: es }) : "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 max-w-xs truncate">
                      {designacion.nombreCampeonato || "-"}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded min-w-[40px] text-center">
                          {designacion.nombreEquipoLocal?.substring(0, 3).toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-xs">v</span>
                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded min-w-[40px] text-center">
                          {designacion.nombreEquipoVisitante?.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {designacion.estadio || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-medium">
                        {arbitros.find((a) => a.id?.toString() === designacion.arbitroPrincipal?.toString())?.nombre || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(designacion.estado)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                          <Link href={`/dashboard/designaciones/${designacion.id}`}>
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          <Link href={`/dashboard/designaciones/${designacion.id}/editar`}>
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(designacion.id || null)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
