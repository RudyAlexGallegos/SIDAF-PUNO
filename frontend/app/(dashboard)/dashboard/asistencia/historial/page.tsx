"use client"

import { useEffect, useState } from "react"
import { getAsistencias, getArbitros, updateAsistencia, deleteAsistencia, createAsistencia, Asistencia, Arbitro } from "@/services/api"
import { format, isAfter, parseISO, eachDayOfInterval, getDay, startOfDay, addDays, subDays, getWeek, getWeekOfMonth, getYear } from "date-fns"
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
  Plus,
  BarChart3
} from "lucide-react"
import RegistroCompactoArbitro from "@/components/asistencia/RegistroCompactoArbitro"
import { EstadoAsistencia } from "@/types/asistencia"

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
  
  // Estado para reporte semanal
  const [reporteSemanalOpen, setReporteSemanalOpen] = useState(false)
  const [semanaData, setSemanaData] = useState<any[]>([])

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

  // Obtener tipo de actividad según el día
  const getActividadPorDia = (fechaStr: string): string => {
    try {
      const fecha = new Date(fechaStr)
      const diaSemana = fecha.getDay()
      if (diaSemana === 1) return "analisis_partido" // Lunes
      if (diaSemana === 2 || diaSemana === 4 || diaSemana === 6) return "preparacion_fisica" // Mar, Jue, Sáb
      if (diaSemana === 5) return "reunion_ordinaria" // Viernes
      return ""
    } catch {
      return ""
    }
  }

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

  // Guardar edición (crear o actualizar)
  const handleGuardarEdicion = async () => {
    if (!registroEditando) return
    
    setEditLoading(true)
    try {
      // Es un nuevo registro (subsanar)
      if (!registroEditando.id) {
        await createAsistencia({
          fecha: registroEditando.fecha,
          actividad: registroEditando.actividad || getActividadPorDia(registroEditando.fecha),
          estado: 'ausente',
          observaciones: '[]'
        })
        // Recargar datos
        const [asistenciasData] = await Promise.all([getAsistencias()])
        setAsistencias(asistenciasData)
        setEditModalOpen(false)
        return
      }
      
      // Es una actualización de registro existente
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
      if (filtroArbitro !== "todos" && a.arbitroId !== filtroArbitro) return false
      return true
    })
    .sort((a: any, b: any) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())

  // Generar todos los días obligatorios desde 01/01/2026
  const generarTodosLosDias = () => {
    const fechaInicio = parseISO("2026-01-01")
    const fechaFin = new Date()
    const todosLosDias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
    const diasObligatorios = [1, 2, 4, 5, 6]
    const fechasConRegistro = new Set([...new Set(asistencias.map(a => a.fecha?.split('T')[0]))].filter(Boolean))
    return todosLosDias
      .filter(dia => diasObligatorios.includes(dia.getDay()))
      .map(dia => {
        const fechaStr = format(dia, 'yyyy-MM-dd')
        const tieneRegistro = fechasConRegistro.has(fechaStr)
        const asistenciaRegistro = filtered.find(a => a.fecha?.startsWith(fechaStr))
        return { fecha: fechaStr, fechaDate: dia, diaSemana: dia.getDay(), tieneRegistro, registro: asistenciaRegistro || null, actividad: getActividadPorDia(fechaStr) }
      })
      .sort((a, b) => b.fechaDate.getTime() - a.fechaDate.getTime())
  }

  const diasCompletos = generarTodosLosDias()

  const totalPaginas = Math.ceil(filtered.length / elementosPorPagina)
  const inicio = (paginaActual - 1) * elementosPorPagina
  const asistenciaPaginada = filtered.slice(inicio, inicio + elementosPorPagina)

  const stats = {
    total: diasCompletos.length,
    conRegistro: diasCompletos.filter((d: any) => d.tieneRegistro).length,
    sinRegistro: diasCompletos.filter((d: any) => !d.tieneRegistro).length
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

  // Generar reporte semanal
  const generarReporteSemanal = () => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
    const lunes = addDays(hoy, diffLunes)
    
    const diasSemana = [1, 2, 4, 5]
    
    const data: any[] = []
    
    arbitros.forEach(arbitro => {
      const fila: any = {
        arbitroId: arbitro.id,
        nombre: `${arbitro.nombre || ''} ${arbitro.apellido || ''}`.trim(),
        dias: {}
      }
      
      diasSemana.forEach((dia, idx) => {
        const fechaBusqueda = addDays(lunes, idx)
        const fechaStr = format(fechaBusqueda, 'yyyy-MM-dd')
        
        const registro = registrosExpandidos.find((r: any) => 
          r.fecha?.startsWith(fechaStr) && 
          String(r.arbitroId) === String(arbitro.id)
        )
        
        fila.dias[fechaStr] = {
          estado: registro?.estadoItem || null,
          actividad: registro?.actividad || null
        }
      })
      
      data.push(fila)
    })
    
    setSemanaData(data)
    setReporteSemanalOpen(true)
  }

  const handleExportarReporteSemanal = () => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
    const lunes = addDays(hoy, diffLunes)
    const viernes = addDays(lunes, 4)
    
    const diasSemana = [1, 2, 4, 5]
    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    
    const contenido = `
      <html>
        <head>
          <title>Reporte Semanal - SIDAF PUNO</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background-color: #007bff; color: white; }
            .presente { background-color: #d4edda; }
            .ausente { background-color: #f8d7da; }
            .tardanza { background-color: #fff3cd; }
            .justificado { background-color: #cce5ff; }
          </style>
        </head>
        <body>
          <h1>Reporte Semanal de Asistencia</h1>
          <p><strong>Comisión Departamental de Árbitros - Puno</strong></p>
          <p>Semana del ${format(lunes, 'dd/MM/yyyy')} al ${format(viernes, 'dd/MM/yyyy')}</p>
          <table>
            <thead>
              <tr>
                <th>Árbitro</th>
                ${nombresDias.map(d => `<th>${d}</th>`).join('')}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${semanaData.map(fila => {
                let presentes = 0
                const diasKeys = Object.keys(fila.dias)
                diasKeys.forEach((key: string) => {
                  if (fila.dias[key]?.estado === 'presente') presentes++
                })
                return `
                  <tr>
                    <td style="text-align: left;">${fila.nombre}</td>
                    ${diasSemana.map((dia, idx) => {
                      const fechaStr = diasKeys[idx]
                      const estado = fila.dias[fechaStr]?.estado
                      let clase = ''
                      if (estado === 'presente') clase = 'presente'
                      else if (estado === 'ausente') clase = 'ausente'
                      else if (estado === 'tardanza') clase = 'tardanza'
                      else if (estado === 'justificado') clase = 'justificado'
                      return `<td class="${clase}">${estado ? getSimboloEstado(estado) : '-'}</td>`
                    }).join('')}
                    <td><strong>${presentes}</strong></td>
                  </tr>
                `
              }).join('')}
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
  
  const getSimboloEstado = (estado: string): string => {
    switch(estado) {
      case 'presente': return '✅'
      case 'ausente': return '❌'
      case 'tardanza': return '⏰'
      case 'justificado': return '📝'
      default: return '-'
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
          <Button onClick={generarReporteSemanal} className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reporte Semanal
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
              <p className="text-sm text-sky-500">Total Días</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.conRegistro}</p>
              <p className="text-sm text-green-500">Registrados</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{stats.sinRegistro}</p>
              <p className="text-sm text-amber-500">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-red-700">{Math.round((stats.conRegistro / stats.total) * 100) || 0}%</p>
              <p className="text-sm text-red-500">Asistencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla */}
        <Card className="border-sky-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Registros ({diasCompletos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead className="text-sky-800">Fecha</TableHead>
                    <TableHead className="text-sky-800">Día</TableHead>
                    <TableHead className="text-sky-800">Actividad</TableHead>
                    <TableHead className="text-sky-800">Estado</TableHead>
                    <TableHead className="text-sky-800 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diasCompletos.length === 0 ? (
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
                    diasCompletos.map((item: any) => (
                      <TableRow key={item.fecha} className={item.tieneRegistro ? "hover:bg-sky-50" : "bg-amber-50 hover:bg-amber-100"}>
                        <TableCell className="font-medium text-sky-800">{format(item.fechaDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="text-sky-700">
                          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][item.diaSemana]}
                        </TableCell>
                        <TableCell className="text-sky-600">{getActividadLabel(item.actividad)}</TableCell>
                        <TableCell>
                          {item.tieneRegistro ? (
                            <Badge className={getEstadoClass(item.registro?.estado)}>
                              {item.registro?.estado || "-"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800">
                              ⏸️ Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.tieneRegistro && item.registro ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => abrirEditar(item.registro)}
                                className="border-sky-300 text-sky-600 hover:bg-sky-50"
                              >
                                <Pencil className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleExportarDia(item.registro)}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                              >
                                <FileDown className="w-3 h-3 mr-1" />
                                Exportar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => abrirEliminar(item.registro)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                // Subsanar: crear nuevo registro para este día con todos los árbitros
                                //自动 detectar actividad según el día de la semana
                                const actividadAuto = getActividadPorDia(item.fecha)
                                const arbitrosIniciales = arbitros.map(ar => ({
                                  arbitrId: ar.id,
                                  nombreArbitro: `${ar.nombre || ''} ${ar.apellido || ''}`.trim() || `Arbitro ${ar.id}`,
                                  estado: 'ausente',
                                  horaRegistro: '',
                                  observaciones: ''
                                }))
                                const nuevoRegistro = {
                                  id: null,
                                  fecha: item.fecha,
                                  actividad: actividadAuto,
                                  estado: 'ausente',
                                  observaciones: JSON.stringify(arbitrosIniciales)
                                }
                                // precargar los árbitros en edición
                                setArbitrosEditando(arbitrosIniciales)
                                abrirEditar(nuevoRegistro)
                              }}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Subsanar
                            </Button>
                          )}
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
                  
                  {/* Lista de árbitros para editar - Diseño igual que pagina principal */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Estado de Árbitros</Label>
                    <div className="max-h-[50vh] overflow-y-auto space-y-2 p-1">
                      {arbitrosEditando.map((arb: any, index: number) => {
                        const arbitroCompleto = arbitros.find(a => String(a.id) === String(arb.arbitrId))
                        const nombreMostrar = arb.nombreArbitro || (arbitroCompleto ? `${arbitroCompleto.nombre || ''} ${arbitroCompleto.apellido || ''}`.trim() : `Árbitro ${arb.arbitrId}`)
                        const arbitroParaComponente = arbitroCompleto || {
                          id: arb.arbitrId,
                          nombre: nombreMostrar,
                          apellido: '',
                          nombres: nombreMostrar,
                          apellidoPaterno: nombreMostrar,
                          dni: '',
                          categoria: ''
                        }
                        return (
                          <RegistroCompactoArbitro
                            key={arb.arbitrId || index}
                            arbitro={arbitroParaComponente}
                            estado={(arb.estado as EstadoAsistencia) || 'ausente'}
                            onChange={(nuevoEstado: EstadoAsistencia) => actualizarArbitroEnEdicion(arb.arbitrId, nuevoEstado)}
                          />
                        )
                      })}
                    </div>
                    {arbitrosEditando.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No hay árbitros para mostrar</p>
                    )}
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

            {/* Modal de Reporte Semanal */}
            <Dialog open={reporteSemanalOpen} onOpenChange={setReporteSemanalOpen}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    📊 Reporte Semanal de Asistencia
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Semana del {semanaData.length > 0 ? format(addDays(new Date(), (new Date().getDay() === 0 ? -6 : 1 - new Date().getDay()) - (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)), 'dd/MM/yyyy') : '-'} al {semanaData.length > 0 ? format(addDays(new Date(), (new Date().getDay() === 0 ? -6 : 1 - new Date().getDay()) + 3), 'dd/MM/yyyy') : '-'}
                  </p>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="text-blue-800 font-bold">Árbitro</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Lunes</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Martes</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Miércoles</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Jueves</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Viernes</TableHead>
                          <TableHead className="text-blue-800 font-bold text-center">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semanaData.map((fila: any) => {
                          let presentes = 0
                          const diasKeys = Object.keys(fila.dias || {})
                          diasKeys.forEach((key: string) => {
                            if (fila.dias[key]?.estado === 'presente') presentes++
                          })
                          
                          return (
                            <TableRow key={fila.arbitroId} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{fila.nombre}</TableCell>
                              {[1, 2, 4, 5].map((diaNum, idx) => {
                                const fechaStr = diasKeys[idx]
                                const estado = fila.dias?.[fechaStr]?.estado
                                return (
                                  <TableCell key={diaNum} className="text-center">
                                    {estado ? (
                                      <Badge className={`${getEstadoClass(estado)} text-xs`}>
                                        {getSimboloEstado(estado)}
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </TableCell>
                                )
                              })}
                              <TableCell className="text-center font-bold">
                                {presentes}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleExportarReporteSemanal} className="bg-green-600 hover:bg-green-700">
                      <FileDown className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
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
