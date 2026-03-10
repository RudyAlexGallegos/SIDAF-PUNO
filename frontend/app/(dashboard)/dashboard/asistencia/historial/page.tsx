"use client"

import { useEffect, useState } from "react"
import { getAsistencias, getArbitros, updateAsistencia, deleteAsistencia, Asistencia, Arbitro } from "@/services/api"
import { format, isAfter, parseISO, eachDayOfInterval, getDay, startOfDay } from "date-fns"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Filter, 
  Users,
  FileDown,
  Edit,
  Pencil,
  Trash2,
  Plus
} from "lucide-react"

interface RegistroArbitro {
  arbitroId: string
  estado: string
  horaRegistro: string
  observaciones: string
}

export default function HistorialAsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroArbitro, setFiltroArbitro] = useState<string>("todos")
  const [filtroActividad, setFiltroActividad] = useState<string>("todos")
  const [filtroMes, setFiltroMes] = useState<string>(format(new Date(), "yyyy-MM"))
  const [paginaActual, setPaginaActual] = useState(1)
  const elementosPorPagina = 20
  
  // Estado para modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [registroEditando, setRegistroEditando] = useState<any>(null)
  const [editEstado, setEditEstado] = useState("")
  const [editObservaciones, setEditObservaciones] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  // Estado para editar múltiples árbitros
  const [arbitrosEditando, setArbitrosEditando] = useState<any[]>([])
  
  // Estado para modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [registroEliminando, setRegistroEliminando] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const parsearRegistros = (asistencia: Asistencia): RegistroArbitro[] => {
    try {
      if (asistencia.observaciones) {
        return JSON.parse(asistencia.observaciones)
      }
    } catch (e) {
      console.warn("Error parseando:", e)
    }
    return []
  }

  const getNombreArbitro = (id?: string) => {
    if (!id) return "General"
    const arb = arbitros.find(a => a.id?.toString() === id)
    return arb ? `${arb.nombre || ""} ${arb.apellido || ""}`.trim() : `Árbitro ${id}`
  }

  const getActividadLabel = (actividad?: string) => {
    const labels: Record<string, string> = {
      analisis_partido: "Análisis de Partido",
      preparacion_fisica: "Preparación Física",
      reunion_ordinaria: "Reunión Ordinaria",
      reunion_extraordinaria: "Reunión Extraordinaria"
    }
    return labels[actividad || ""] || actividad || "-"
  }

  const getHoraRegistro = (item: any): string => {
    // Primero intentar obtener de horaEntrada
    if (item.horaEntrada) {
      const hora = item.horaEntrada.toString()
      if (hora.includes('T')) {
        return hora.split('T')[1]?.substring(0, 5) || hora.substring(11, 16) || "-"
      }
      return hora.substring(0, 5)
    }
    // Si no hay horaEntrada, buscar en los registros expandidos
    if (item.horaRegistro) {
      const hora = item.horaRegistro.toString()
      if (hora.includes('T')) {
        return hora.split('T')[1]?.substring(0, 5) || hora.substring(11, 16) || "-"
      }
      return hora.substring(0, 5)
    }
    return "-"
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

  // Días obligatorios: Lunes(1), Martes(2), Jueves(4), Viernes(5), Sábado(6)
  const DIAS_OBLIGATORIOS = [1, 2, 4, 5, 6]
  const FECHA_INICIO_OBLIGATORIOS = parseISO("2026-01-01")

  const esDiaObligatorio = (fechaStr?: string): boolean => {
    if (!fechaStr) return false
    try {
      const fecha = new Date(fechaStr)
      // Verificar si es desde 01/01/2026
      if (!isAfter(fecha, FECHA_INICIO_OBLIGATORIOS) && !isAfter(FECHA_INICIO_OBLIGATORIOS, fecha)) {
        return true // La misma fecha 01/01/2026
      }
      if (isAfter(FECHA_INICIO_OBLIGATORIOS, fecha)) {
        return false // Antes de la fecha de inicio
      }
      const diaSemana = fecha.getDay() + 1 // getDay() devuelve 0-6 (Dom-Sáb), convertimos a 1-7
      return DIAS_OBLIGATORIOS.includes(diaSemana)
    } catch {
      return false
    }
  }

  // Abrir modal de edición
  const abrirEditar = (registro: any) => {
    setRegistroEditando(registro)
    setEditEstado(registro.estadoItem || registro.estado || "")
    setEditObservaciones(registro.observaciones || "")
    
    // Cargar todos los arbitros del dia desde observaciones
    try {
      if (registro.observaciones) {
        const registros = JSON.parse(registro.observaciones)
        // Mapear cada registro con el nombre del arbitro
        const arbitradoresConNombre = registros.map((reg: any) => {
          // Buscar el ID - puede ser arbitrId, arborId, o id
          const arbitrId = reg.arbitrId ?? reg.arborId ?? reg.id ?? reg.arbitroId
          // Buscar el arbitro en la lista
          const arbitro = arbitros.find(a => 
            String(a.id) === String(arbitrId) || 
            a.id === Number(arbitrId)
          )
          const nombreMostrar = arbitro 
            ? `${arbitro.nombre || ""} ${arbitro.apellido || ""}`.trim() 
            : (arbitrId ? `Arbitro ${arbitrId}` : "Sin asignar")
          return {
            ...reg,
            arbitrId: arbitrId,
            nombreArbitro: nombreMostrar
          }
        })
        setArbitrosEditando(arbitradoresConNombre)
      } else {
        setArbitrosEditando([])
      }
    } catch (e) {
      console.warn("Error parseando registros:", e)
      setArbitrosEditando([])
    }
    
    setEditModalOpen(true)
  }

  // Actualizar el estado de un árbitro específico
  const actualizarArbitroEnEdicion = (arbitrId: number, nuevoEstado: string) => {
    setArbitrosEditando(prev => prev.map(arb => 
      arb.arbitrId === arbitrId ? { ...arb, estado: nuevoEstado } : arb
    ))
  }

  // Guardar edición
  const handleGuardarEdicion = async () => {
    if (!registroEditando || !registroEditando.id || !Number(registroEditando.id)) return
    
    setEditLoading(true)
    try {
      // Siempre guardamos todos los árbitros del día
      if (arbitrosEditando.length > 0) {
        // Actualizar todos los árbitros
        const updatedRegistros = arbitrosEditando.map((arb: any) => ({
          arbitrId: arb.arbitrId,
          estado: arb.estado,
          horaRegistro: arb.horaRegistro,
          observaciones: arb.observaciones || ""
        }))
        
        await updateAsistencia(Number(registroEditando.id), {
          ...registroEditando,
          observaciones: JSON.stringify(updatedRegistros)
        })
      } else if (registroEditando.arbitrId) {
        // Es un registro individual, actualizar en observaciones
        const asistenciaOriginal = await getAsistencias()
        const asistencia = asistenciaOriginal.find((a: any) => a.id === Number(registroEditando.id))
        if (asistencia && asistencia.observaciones) {
          try {
            const registros = JSON.parse(asistencia.observaciones)
            const updatedRegistros = registros.map((reg: any) => {
              if (reg.arbitrId === registroEditando.arbitrId) {
                return { ...reg, estado: editEstado, observaciones: editObservaciones }
              }
              return reg
            })
            await updateAsistencia(Number(asistencia.id), {
              ...asistencia,
              observaciones: JSON.stringify(updatedRegistros)
            })
          } catch (e) {
            console.error("Error parseando registros:", e)
          }
        }
      } else {
        // Es un registro general
        await updateAsistencia(Number(registroEditando.id), {
          ...registroEditando,
          estado: editEstado,
          observaciones: editObservaciones
        })
      }
      
      // Recargar datos
      const [asistenciasData] = await Promise.all([getAsistencias()])
      setAsistencias(asistenciasData)
      setEditModalOpen(false)
    } catch (error) {
      console.error("Error guardando edición:", error)
    } finally {
      setEditLoading(false)
    }
  }

  // Abrir modal de eliminación
  const abrirEliminar = (registro: any) => {
    setRegistroEliminando(registro)
    setDeleteModalOpen(true)
  }

  // Confirmar eliminación
  const handleConfirmarEliminacion = async () => {
    if (!registroEliminando || !registroEliminando.id || !Number(registroEliminando.id)) return
    
    setDeleteLoading(true)
    try {
      await deleteAsistencia(Number(registroEliminando.id))
      // Recargar datos
      const [asistenciasData] = await Promise.all([getAsistencias()])
      setAsistencias(asistenciasData)
      setDeleteModalOpen(false)
    } catch (error) {
      console.error("Error eliminando registro:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Exportar un solo día
  const handleExportarDia = (registro: any) => {
    const fecha = registro.fecha
    const contenido = `
      <html>
        <head>
          <title>Asistencia - ${formatFecha(fecha)} - SIDAF PUNO</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #007bff; color: white; }
          </style>
        </head>
        <body>
          <h1>Registro de Asistencia</h1>
          <p><strong>Comisión Departamental de Árbitros - Puno</strong></p>
          <p><strong>Fecha:</strong> ${formatFecha(fecha)}</p>
          <p><strong>Actividad:</strong> ${getActividadLabel(registro.actividad)}</p>
          <table>
            <thead>
              <tr><th>Árbitro</th><th>Hora</th><th>Estado</th><th>Observaciones</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${registro.nombreArbitro || "General"}</td>
                <td>${registro.horaEntrada?.substring(0, 5) || "-"}</td>
                <td>${registro.estadoItem || registro.estado || "-"}</td>
                <td>${registro.observaciones || "-"}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `
    const ventana = window.open('', '_blank')
    if (ventana) {
      ventana.document.write(contenido)
      ventana.document.close()
      ventana.print()
    }
  }

  // No expandir - directo por dia
  const registrosExpandidos = asistencias.flatMap((item: any) => {
    const parsed = parsearRegistros(item)
    if (parsed.length > 0) {
      return parsed.map((reg: any) => ({
        ...item,
        arbitroId: reg.arbitrId,
        nombreArbitro: getNombreArbitro(reg.arbitrId),
        estadoItem: reg.estado
      }))
    }
    return [{
      ...item,
      arbitroId: "",
      nombreArbitro: "General",
      estadoItem: item.estado || "-"
    }]
  })

  const filtered = asistencias
    .filter(a => {
      if (!esDiaObligatorio(a.fecha)) return false
      if (filtroActividad !== "todos" && a.actividad !== filtroActividad) return false
      if (filtroMes !== "todos" && !a.fecha?.startsWith(filtroMes)) return false
      return true
    })
    .sort((a, b) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())

  const totalPaginas = Math.ceil(filtered.length / elementosPorPagina)
  const inicio = (paginaActual - 1) * elementosPorPagina
  const asistenciaPaginada = filtered.slice(inicio, inicio + elementosPorPagina)

  const stats = {
    total: filtered.length,
    presentes: filtered.filter(a => a.estadoItem === "presente").length,
    ausentes: filtered.filter(a => a.estadoItem === "ausente").length,
    tardanzas: filtered.filter(a => a.estadoItem === "tardanza").length
  }

  // Calcular días obligatorios faltantes (desde 01/01/2026)
  const getDiasFaltantes = () => {
    const fechaInicio = parseISO("2026-01-01")
    const fechaFin = new Date()
    const todosLosDias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
    
    // Días obligatorios: Lun(1), Mar(2), Jue(4), Vie(5), Sáb(6)
    const diasObligatorios = [1, 2, 4, 5, 6]
    
    // Fechas que ya tienen registro
    const fechasConRegistro = new Set(
      registrosExpandidos
        .filter(r => r.fecha)
        .map(r => r.fecha?.split('T')[0])
    )
    
    // Filtrar solo días obligatorios sin registro
    const faltantes = todosLosDias
      .filter(dia => diasObligatorios.includes(dia.getDay()))
      .filter(dia => !fechasConRegistro.has(format(dia, 'yyyy-MM-dd')))
      
    return faltantes
  }
  
  const diasFaltantes = getDiasFaltantes()

  const handleExportarPDF = () => {
    const contenido = `
      <html>
        <head>
          <title>Historial de Asistencia - SIDAF PUNO</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #007bff; color: white; }
          </style>
        </head>
        <body>
          <h1>Historial de Asistencia</h1>
          <p><strong>Comisión Departamental de Árbitros - Puno</strong></p>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr><th>Fecha</th><th>Árbitro</th><th>Actividad</th><th>Hora</th><th>Estado</th></tr>
            </thead>
            <tbody>
              ${filtered.map(r => `
                <tr>
                  <td>${formatFecha(r.fecha)}</td>
                  <td>${r.nombreArbitro}</td>
                  <td>${getActividadLabel(r.actividad)}</td>
                  <td>${r.horaEntrada?.substring(0, 5) || "-"}</td>
                  <td>${r.estadoItem || "-"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const ventana = window.open('', '_blank')
    if (ventana) {
      ventana.document.write(contenido)
      ventana.document.close()
      ventana.print()
    }
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
          <Button onClick={handleExportarPDF} className="bg-green-600 hover:bg-green-700">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
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
                <Select value={filtroArbitro} onValueChange={setFiltroArbitro}>
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
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-700">
              <strong>📅 Días obligatorios desde 01/01/2026:</strong> Lunes, Martes, Jueves, Viernes y Sábado.
              Los registros anteriores a 2026 no se muestran. Si no hay registros, debe subsanar la asistencia.
            </p>
          </CardContent>
        </Card>

        {/* Días Faltantes */}
        {diasFaltantes.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Días Obligatorios Sin Registro ({diasFaltantes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-3">
                Los siguientes días obligatorios no tienen registro de asistencia. Debe subsanarlos:
              </p>
              <div className="flex flex-wrap gap-2">
                {diasFaltantes.slice(0, 20).map((dia, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="bg-white text-red-700 border-red-300 px-3 py-1"
                  >
                    {format(dia, "dd MMM", { locale: es })}
                  </Badge>
                ))}
                {diasFaltantes.length > 20 && (
                  <Badge variant="outline" className="bg-white text-gray-600">
                    +{diasFaltantes.length - 20} más
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                    <TableHead className="text-sky-800 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asistenciaPaginada.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sky-500">
                        <p className="text-lg font-medium">No hay registros de asistencia</p>
                        <p className="text-sm mt-2 text-sky-600">
                          Los registros de días obligatorios (Lun, Mar, Jue, Vie, Sáb) desde 01/01/2026 aparecerán aquí.
                          Si no existen registros, debe <strong>subsanar la asistencia</strong> registrándolos.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    asistenciaPaginada.map((item, index) => (
                      <TableRow key={index} className="hover:bg-sky-50">
                        <TableCell className="font-medium text-sky-800">{formatFecha(item.fecha)}</TableCell>
                        <TableCell className="text-sky-700">{item.nombreArbitr}</TableCell>
                        <TableCell className="text-sky-600">{getActividadLabel(item.actividad)}</TableCell>
                        <TableCell className="text-sky-600">{getHoraRegistro(item)}</TableCell>
                        <TableCell>
                          <Badge className={getEstadoClass(item.estadoItem)}>
                            {item.estadoItem || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => abrirEditar(item)}
                              className="border-sky-300 text-sky-600 hover:bg-sky-50"
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleExportarDia(item)}
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <FileDown className="w-3 h-3 mr-1" />
                              Exportar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => abrirEliminar(item)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Modal de Edición */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Registro de Asistencia</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {/* Información del registro */}
                  <div className="bg-sky-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-sky-800">
                      📅 Fecha: {registroEditando ? formatFecha(registroEditando.fecha) : "-"}
                    </p>
                    <p className="text-sm text-sky-700">
                      📋 Actividad: {registroEditando ? getActividadLabel(registroEditando.actividad) : "-"}
                    </p>
                    <p className="text-sm text-sky-700">
                      ⏰ Hora: {registroEditando ? getHoraRegistro(registroEditando) : "-"}
                    </p>
                    <p className="text-sm text-sky-700 mt-2">
                      👥 Total árbitros: {arbitrosEditando.length}
                    </p>
                  </div>
                  
                  {/* Lista de árbitros para editar */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Estado de Árbitros</Label>
                    {arbitrosEditando.map((arb: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{arb.nombreArbitro || `Árbitro ${arb.arbitrId}`}</p>
                          <p className="text-xs text-gray-500">
                            ⏰ Registro: {arb.horaRegistro ? new Date(arb.horaRegistro).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                        <Select 
                          value={arb.estado} 
                          onValueChange={(valor) => actualizarArbitroEnEdicion(arb.arbitrId, valor)}
                        >
                          <SelectTrigger className={`w-36 ${
                            arb.estado === 'presente' ? 'bg-green-100 border-green-300 text-green-800' :
                            arb.estado === 'ausente' ? 'bg-red-100 border-red-300 text-red-800' :
                            arb.estado === 'tardanza' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                            arb.estado === 'justificado' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                            'bg-gray-100'
                          }`}>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="presente">✅ Presente</SelectItem>
                            <SelectItem value="ausente">❌ Ausente</SelectItem>
                            <SelectItem value="tardanza">⏰ Tardanza</SelectItem>
                            <SelectItem value="justificado">📝 Justificado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGuardarEdicion} disabled={editLoading}>
                    {editLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal de Eliminación */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-red-600">Eliminar Registro</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-700">
                    ¿Está seguro de que desea eliminar este registro de asistencia?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Fecha:</strong> {registroEliminando ? formatFecha(registroEliminando.fecha) : "-"}<br />
                    <strong>Árbitro:</strong> {registroEliminando?.nombreArbitro || "General"}
                  </p>
                  <p className="text-sm text-red-500 mt-2 font-medium">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmarEliminacion} 
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteLoading ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-sky-100">
                <div className="text-sm text-sky-600">
                  Página {paginaActual} de {totalPaginas}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="border-sky-300">
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="border-sky-300">
                    Siguiente
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
