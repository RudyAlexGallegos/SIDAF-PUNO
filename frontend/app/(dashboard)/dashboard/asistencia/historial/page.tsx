"use client"

import { useEffect, useState } from "react"
import { getAsistencias, getArbitros, Asistencia, Arbitro } from "@/services/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Calendar, 
  Filter, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function HistorialAsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroArbitro, setFiltroArbitro] = useState<string>("todos")
  const [filtroActividad, setFiltroActividad] = useState<string>("todos")
  const [filtroMes, setFiltroMes] = useState<string>(format(new Date(), "yyyy-MM"))
  const [paginaActual, setPaginaActual] = useState(1)
  const elementosPorPagina = 20

  useEffect(() => {
    async function load() {
      try {
        const [asistenciasData, arbitrosData] = await Promise.all([
          getAsistencias(),
          getArbitros()
        ])
        setAsistencias(asistenciasData)
        setArbitros(arbitrosData)
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = [...asistencias]
    .sort((a, b) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())
    .filter(a => {
      if (filtroArbitro !== "todos" && a.idArbitro?.toString() !== filtroArbitro) return false
      if (filtroActividad !== "todos" && a.actividad !== filtroActividad) return false
      if (filtroMes !== "todos" && !a.fecha?.startsWith(filtroMes)) return false
      return true
    })

  const totalPaginas = Math.ceil(filtered.length / elementosPorPagina)
  const inicio = (paginaActual - 1) * elementosPorPagina
  const asistenciaPaginada = filtered.slice(inicio, inicio + elementosPorPagina)

  const getNombreArbitro = (id?: number) => {
    const arb = arbitros.find(a => a.id === id)
    return arb ? `${arb.nombre || ""} ${arb.apellido || ""}`.trim() : "Desconocido"
  }

  const getActividadLabel = (actividad?: string) => {
    const labels: Record<string, string> = {
      analisis_partido: "Análisis de Partido",
      preparacion_fisica: "Preparación Física",
      reunion_ordinaria: "Reunión Ordinaria",
      reunion_extraordinaria: "Reunión Extraordinaria"
    }
    return labels[actividad || ""] || actividad
  }

  const getEstadoClass = (estado?: string) => {
    switch (estado) {
      case "presente": return "bg-green-100 text-green-800"
      case "ausente": return "bg-red-100 text-red-800"
      case "tardanza": return "bg-yellow-100 text-yellow-800"
      case "justificado": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "-"
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  const stats = {
    total: filtered.length,
    presentes: filtered.filter(a => a.estado === "presente").length,
    ausentes: filtered.filter(a => a.estado === "ausente").length,
    tardanzas: filtered.filter(a => a.estado === "tardanza").length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sky-200 rounded w-1/3"></div>
            <div className="h-64 bg-sky-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-800 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Historial de Asistencia
            </h1>
            <p className="text-sky-600 mt-1">Registro histórico de asistencia de árbitros</p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-sky-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-sky-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-700">Árbitro</label>
                <Select value={filtroArro} onValueChange={setFiltroArbitro}>
                  <SelectTrigger className="border-sky-300">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {arbitros.map(arb => (
                      <SelectItem key={arb.id} value={arb.id?.toString() || ""}>
                        {arb.nombre} {arb.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-700">Actividad</label>
                <Select value={filtroActividad} onValueChange={setFiltroActividad}>
                  <SelectTrigger className="border-sky-300">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="analisis_partido">Análisis</SelectItem>
                    <SelectItem value="preparacion_fisica">Preparación Física</SelectItem>
                    <SelectItem value="reunion_ordinaria">Reunión Ordinaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-sky-700">Mes</label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger className="border-sky-300">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value={format(new Date(), "yyyy-MM")}>{format(new Date(), "MMMM yyyy", { locale: es })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-sky-50 border-sky-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-sky-700">{stats.total}</p>
              <p className="text-sm text-sky-500">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.presentes}</p>
              <p className="text-sm text-green-500">Presentes</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.ausentes}</p>
              <p className="text-sm text-red-500">Ausentes</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{stats.tardanzas}</p>
              <p className="text-sm text-yellow-500">Tardanzas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <Card className="border-sky-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Registros ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="text-sky-800">Fecha</TableHead>
                    <TableHead className="text-sky-800">Árbitro</TableHead>
                    <TableHead className="text-sky-800">Actividad</TableHead>
                    <TableHead className="text-sky-800">Hora</TableHead>
                    <TableHead className="text-sky-800">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asistenciaPaginada.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sky-500">
                        No hay registros
                      </TableCell>
                    </TableRow>
                  ) : (
                    asistenciaPaginada.map((item, index) => (
                      <TableRow key={index} className="hover:bg-sky-50">
                        <TableCell className="font-medium text-sky-800">{formatFecha(item.fecha)}</TableCell>
                        <TableCell className="text-sky-700">{getNombreArbitro(item.idArbitro)}</TableCell>
                        <TableCell className="text-sky-600">{getActividadLabel(item.actividad)}</TableCell>
                        <TableCell className="text-sky-600">{item.horaEntrada?.substring(0, 5) || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getEstadoClass(item.estado)}>
                            {item.estado || "-"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-sky-100">
                <div className="text-sm text-sky-600">
                  Página {paginaActual} de {totalPaginas}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="border-sky-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="border-sky-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
