"use client"

import { useEffect, useState } from "react"
import { getAsistencias, getArbitros, updateAsistencia, deleteAsistencia, createAsistencia, Asistencia, Arbitro as ArbitroAPI } from "@/services/api"
import { Arbitro } from "@/types/asistencia"
import { generateReporteResumenEjecutivo, generateReportePorArbitro, generateReporteMensual, generateReporteFaltantes, generateReporteDiario, generateReporteSemanalPDF, exportAsistenciaToExcel } from "@/lib/pdf-generator"
import { format, isAfter, parseISO, eachDayOfInterval, getDay, startOfDay, addDays, subDays, getWeek, getWeekOfMonth, getYear, getMonth } from "date-fns"
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
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import RegistroCompactoArbitro from "@/components/asistencia/RegistroCompactoArbitro"
import { EstadoAsistencia } from "@/types/asistencia"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

interface RegistroArbitro {
  arbitrId: string
  estado: string
  horaRegistro: string
  observaciones: string
}

export default function HistorialAsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [arbitros, setArbitros] = useState<ArbitroAPI[]>([])
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
  
  // Estado para previsualización de exportación
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [previewTitulo, setPreviewTitulo] = useState("")
  const [previewTipo, setPreviewTipo] = useState<"pdf" | "excel">("pdf")

  useEffect(() => {
    async function load() {
      try {
        const [asistenciasData, arbitrosData] = await Promise.all([
          getAsistencias(),
          getArbitros()
        ])
        console.log('DEBUG - Asistencias cargadas del backend:', asistenciasData?.length)
        console.log('DEBUG - Primera asistencia:', JSON.stringify(asistenciasData?.[0], null, 2))
        console.log('DEBUG - Arbitros cargados:', arbitrosData?.length)
        console.log('DEBUG - Primer arbitro:', JSON.stringify(arbitrosData?.[0], null, 2))
        console.log('>>>>>> ARBITROS IDs:', arbitrosData?.map((a: any) => a.id) || 'none')
        
        // Verificar si hay datos guardados localmente que no estén en el backend
        try {
          const lastRegistro = localStorage.getItem("sidaf_registro_last")
          if (lastRegistro) {
            const reg = JSON.parse(lastRegistro)
            const fechaReg = reg.fecha
            console.log("📝 Registro local encontrado para fecha:", fechaReg)
            
            // Ver si este registro ya existe en asistenciasData
            const yaExiste = asistenciasData?.some((a: any) => 
              a.fecha?.startsWith(fechaReg) 
            )
            if (!yaExiste && reg.arbitros && reg.arbitros.length > 0) {
              console.log("⚠️ Registro local no está en backend, añadiendo a la lista")
              asistenciasData?.push({
                id: `local-${Date.now()}`,
                fecha: reg.fecha + "T00:00:00",
                horaEntrada: reg.horaInicio,
                horaSalida: reg.horaFin,
                actividad: reg.tipoActividad,
                evento: reg.descripcion,
                estado: reg.estado || "completado",
                observaciones: JSON.stringify(reg.arbitros)
              })
            }
          }
        } catch (e) {
          console.warn("Error verificando datos locales:", e)
        }
        
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
        console.log('DEBUG parsearRegistros - observaciones:', asistencia.observaciones?.substring(0, 200))
        const parsed = JSON.parse(asistencia.observaciones)
        console.log('DEBUG parsearRegistros - parsed:', parsed)
        
        // Validar que sea un array
        if (Array.isArray(parsed)) {
          return parsed
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Si es un objeto, convertirlo a array con ese objeto
          console.warn('DEBUG parsearRegistros - observaciones es un objeto, convirtiéndolo a array')
          return [parsed]
        }
      }
    } catch (e) {
      console.warn("Error parseando observaciones:", e)
    }
    return []
  }

  const getNombreArbitro = (id?: string | number) => {
    if (!id) return "General"
    // Normalizar el ID a string para la comparación
    const idStr = String(id)
    const idNum = Number(id)
    
    // Buscar en la lista de árbitros comparando como string y número
    const arb = arbitros.find(a => 
      String(a.id) === idStr || 
      a.id?.toString() === idStr ||
      Number(a.id) === idNum ||
      a.id === id
    )
    
    if (arb) {
      const nombre = `${arb.nombre || ""} ${arb.apellido || ""}`.trim()
      if (nombre) return nombre
      return `${arb.nombres || ""} ${arb.apellidoPaterno || ""}`.trim() || `Árbitro ${id}`
    }
    
    // Debug logging
    console.log(`DEBUG getNombreArbitro - No encontrado para id: ${id}, árbitros disponibles:`, arbitros.map(a => ({ id: a.id, nombre: a.nombre })))
    return `Árbitro ${id}`
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
      // Parsear la fecha usando formato YYYY-MM-DD para evitar problemas de zona horaria
      const [year, month, day] = fechaStr.split('-').map(Number)
      // Crear fecha usando componentes explícitos (sin zona horaria)
      const fecha = new Date(year, month - 1, day)
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

  // Exportar un solo día con todos los árbitros - mostrar previsualización
  const handleExportarDia = (registro: any) => {
    const fecha = registro.fecha?.split('T')[0]
    const actividad = registro.actividad
    
    // Obtener todos los registros de árbitros para esta fecha
    const arbitrosDelDia = registrosExpandidos.filter((r: any) => {
      const fechaRegistro = r.fecha?.split('T')[0]
      return fechaRegistro === fecha
    })
    
    // Convertir al formato requerido por el generador de PDF
    const asistenciaData = arbitrosDelDia.map((r: any) => ({
      id: r.id,
      fecha: r.fecha,
      horaEntrada: r.horaEntrada || r.horaRegistro,
      horaSalida: r.horaSalida,
      actividad: r.actividad,
      estado: r.estadoItem || r.estado,
      nombreArbitro: r.nombreArbitro || "General",
      arbitroId: r.arbitroId
    }))
    
    // Mostrar previsualización antes de exportar
    setPreviewData(asistenciaData)
    setPreviewTitulo(`Reporte Diario - ${fecha}`)
    setPreviewTipo("pdf")
    setPreviewOpen(true)
  }

  // No expandir - directo por dia
  const registrosExpandidos = asistencias.flatMap((item: any) => {
    const parsed = parsearRegistros(item)
    if (parsed.length > 0) {
      return parsed.map((reg: any) => ({
        ...item,
        arbitroId: reg.arbitrId,
        nombreArbitro: getNombreArbitro(reg.arbitrId),
        estadoItem: reg.estado,
        horaEntrada: reg.horaRegistro || item.horaEntrada
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
      if (filtroArbitro !== "todos" && a.idArbitro !== Number(filtroArbitro)) return false
      return true
    })
    .sort((a: any, b: any) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())

  // ✅ Crear registros expandidos FILTRADOS - combina expansión con filtros
  const registrosExpandidosFiltrados = filtered.flatMap((item: any) => {
    const parsed = parsearRegistros(item)
    if (parsed.length > 0) {
      return parsed.map((reg: any) => ({
        ...item,
        arbitroId: reg.arbitrId,
        nombreArbitro: getNombreArbitro(reg.arbitrId),
        estadoItem: reg.estado,
        horaEntrada: reg.horaRegistro || item.horaEntrada
      }))
    }
    return [{
      ...item,
      arbitroId: "",
      nombreArbitro: "General",
      estadoItem: item.estado || "-"
    }]
  })

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

  // Agrupar datos por mes para acordeones
  const agruparPorMes = () => {
    const meses: Record<string, { dias: any[], total: number, completados: number }> = {}
    
    diasCompletos.forEach(dia => {
      const mesKey = format(dia.fechaDate, 'yyyy-MM')
      const mesNombre = format(dia.fechaDate, 'MMMM yyyy', { locale: es })
      
      if (!meses[mesKey]) {
        meses[mesKey] = {
          dias: [],
          total: 0,
          completados: 0
        }
      }
      
      meses[mesKey].dias.push(dia)
      meses[mesKey].total++
      if (dia.tieneRegistro) {
        meses[mesKey].completados++
      }
    })
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.entries(meses)
      .map(([key, data]) => ({
        key,
        nombre: format(parseISO(key + '-01'), 'MMMM yyyy', { locale: es }),
        dias: data.dias,
        total: data.total,
        completados: data.completados,
        porcentaje: data.total > 0 ? Math.round((data.completados / data.total) * 100) : 0
      }))
      .sort((a, b) => b.key.localeCompare(a.key))
  }

  const mesesData = agruparPorMes()

  // Obtener gradiente según porcentaje
  const getGradientByPercentage = (porcentaje: number) => {
    if (porcentaje >= 90) {
      return 'from-green-500 to-emerald-600'
    } else if (porcentaje >= 70) {
      return 'from-blue-500 to-cyan-600'
    } else if (porcentaje >= 50) {
      return 'from-yellow-500 to-orange-600'
    } else if (porcentaje >= 30) {
      return 'from-orange-500 to-red-500'
    } else {
      return 'from-red-500 to-rose-600'
    }
  }

  // Obtener color de texto según porcentaje
  const getTextColorByPercentage = (porcentaje: number) => {
    if (porcentaje >= 70) return 'text-white'
    return 'text-white'
  }

  // Obtener icono según porcentaje
  const getIconByPercentage = (porcentaje: number) => {
    if (porcentaje >= 90) return <CheckCircle2 className="w-5 h-5" />
    if (porcentaje >= 70) return <TrendingUp className="w-5 h-5" />
    if (porcentaje >= 50) return <Clock className="w-5 h-5" />
    return <AlertCircle className="w-5 h-5" />
  }

  const handleExportarPDF = (tipoReporte: string = 'resumen') => {
    const fechaInicio = parseISO("2026-01-01")
    const fechaFin = new Date()
    
    // Usar EXACTAMENTE los mismos datos que se muestran en la tabla
    const datosReporte = registrosExpandidosFiltrados.map((item: any) => ({
      id: item.id,
      fecha: item.fecha,
      actividad: item.actividad,
      estado: item.estadoItem || item.estado || '-',
      horaEntrada: item.horaEntrada,
      arbitroId: item.arbitroId,
      nombreArbitro: item.nombreArbitro
    }))
    
    // Mostrar previsualización antes de exportar
    setPreviewData(datosReporte)
    setPreviewTitulo("Reporte de Asistencia - Resumen")
    setPreviewTipo("pdf")
    setPreviewOpen(true)
  }

  const handleExportarExcel = () => {
    const fechaInicio = parseISO("2026-01-01")
    // Usar EXACTAMENTE los mismos datos que se muestran en la tabla
    const datosReporte = registrosExpandidosFiltrados.map((item: any) => ({
      id: item.id,
      fecha: item.fecha,
      actividad: item.actividad,
      estado: item.estadoItem || item.estado || '-',
      horaEntrada: item.horaEntrada,
      arbitroId: item.arbitroId,
      nombreArbitro: item.nombreArbitro
    }))
    // Mostrar previsualización antes de exportar
    setPreviewData(datosReporte)
    setPreviewTitulo("Reporte de Asistencia - Excel")
    setPreviewTipo("excel")
    setPreviewOpen(true)
  }

  // Confirmar y ejecutar exportación desde previsualización
  const confirmarExportacion = () => {
    const fechaInicio = parseISO("2026-01-01")
    const fechaFin = new Date()
    
    // Verificar si es un reporte diario (el título contiene "Diario")
    if (previewTitulo.includes("Diario")) {
      // Extraer la fecha del título
      const fechaMatch = previewTitulo.match(/(\d{4}-\d{2}-\d{2})/)
      const fecha = fechaMatch ? fechaMatch[1] : format(new Date(), 'yyyy-MM-dd')
      const actividad = previewData[0]?.actividad || 'analisis_partido'
      generateReporteDiario(previewData as any, arbitros as any, fecha, actividad)
    } else if (previewTitulo.includes("Semanal")) {
      // Es reporte semanal - calcular fechas de la semana
      const hoy = new Date()
      const diaSemana = hoy.getDay()
      const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
      const lunes = addDays(hoy, diffLunes)
      const viernes = addDays(lunes, 4)
      generateReporteSemanalPDF(previewData as any, lunes, viernes)
    } else if (previewTipo === "pdf") {
      generateReporteResumenEjecutivo(previewData as any, arbitros as any, fechaInicio, fechaFin, previewTitulo)
    } else {
      exportAsistenciaToExcel(previewData as any, arbitros as any, `asistencia-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    }
    setPreviewOpen(false)
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

  // Exportar reporte semanal - mostrar previsualización primero
  const handleExportarReporteSemanal = () => {
    const hoy = new Date()
    const diaSemana = hoy.getDay()
    const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana
    const lunes = addDays(hoy, diffLunes)
    const viernes = addDays(lunes, 4)
    
    // Preparar datos para previsualización
    const datosPreview: any[] = semanaData.map((fila: any) => ({
      nombre: fila.nombre,
      arbitroId: fila.arbitroId,
      dias: Object.entries(fila.dias).map(([fecha, data]: [string, any]) => ({
        fecha,
        estado: data?.estado || null,
        actividad: data?.actividad || null
      }))
    }))
    
    // Mostrar previsualización antes de exportar
    setPreviewData(datosPreview)
    setPreviewTitulo(`Reporte Semanal - ${format(lunes, 'dd/MM')} al ${format(viernes, 'dd/MM/yyyy')}`)
    setPreviewTipo("pdf")
    setPreviewOpen(true)
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
          <Button onClick={() => handleExportarPDF('resumen')} className="bg-green-600 hover:bg-green-700">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleExportarExcel} className="bg-emerald-600 hover:bg-emerald-700">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar Excel
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

        {/* Ranking de Asistencia */}
        {(() => {
          // Calcular ranking de árbitros - versión mejorada
          // Primero, recopilar todos los registros de asistencia por árbitro
          const statsPorArbitro: Record<string, {total: number, presentes: number, tardanzas: number, justificados: number, nombre: string}> = {}
          
          // Inicializar con todos los árbitros conocidos
          ;(arbitros || []).forEach((a: any) => {
            // Soportar tanto números como strings para el ID
            const idNum = a.id
            const idStr = String(a.id || a.arbitrId || '')
            // Usar el número como key también
            statsPorArbitro[idStr] = {
              total: 0,
              presentes: 0,
              tardanzas: 0,
              justificados: 0,
              nombre: `${a.nombre || a.nombres || ''} ${a.apellido || a.apellidoPaterno || ''}`.trim() || idStr
            }
            // También guardar con número si es diferente
            if (idNum && idStr !== String(idNum)) {
              statsPorArbitro[String(idNum)] = statsPorArbitro[idStr]
            }
          })
          
          // ✅ Procesar registros expandidos FILTRADOS - usar solo los registros que se muestran en la tabla
          ;(registrosExpandidosFiltrados || []).forEach((r: any) => {
            // En registrosExpandidosFiltrados, el campo se llama 'arbitroId' (con 'o') - ver línea 444
            const arbitroIdValue = r.arbitroId
            const id = String(arbitroIdValue ?? r.idArbitro ?? r.id ?? '')
            if (id && statsPorArbitro[id]) {
              statsPorArbitro[id].total++
              const estado = r.estadoItem || r.estado || ''
              if (estado === 'presente') statsPorArbitro[id].presentes++
              else if (estado === 'tardanza') statsPorArbitro[id].tardanzas++
              else if (estado === 'justificado') statsPorArbitro[id].justificados++
            }
          })
          
          // Convertir a array y calcular porcentajes
          const ranking = Object.entries(statsPorArbitro)
            .map(([id, stats]) => ({
              id,
              nombre: stats.nombre,
              total: stats.total,
              presentes: stats.presentes,
              tardanzas: stats.tardanzas,
              justificados: stats.justificados,
              porcentaje: stats.total > 0 ? Math.round(((stats.presentes + stats.justificados) / stats.total) * 100) : 0
            }))
            .filter(r => r.total > 0)
            .sort((a, b) => b.porcentaje - a.porcentaje)
          
          // Si no hay datos, mostrar mensaje de depuración
          if (ranking.length === 0) {
            return (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    🏆 Top 5 Árbitros con Mejor Asistencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-600 text-sm">
                    No hay suficientes datos para mostrar el ranking.
                    <br/>
                    Árbitros cargados: {arbitros?.length || 0}
                    <br/>
                    Registros expandidos filtrados: {registrosExpandidosFiltrados?.length || 0}
                  </p>
                </CardContent>
              </Card>
            )
          }
          
          return (
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  🏆 Top 5 Árbitros con Mejor Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ranking.slice(0, 5).map((arb, idx) => (
                    <div key={arb.id} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{arb.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {arb.presentes} presentes, {arb.tardanzas} tardanzas, {arb.justificados} justificados
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          arb.porcentaje >= 90 ? 'text-green-600' :
                          arb.porcentaje >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {arb.porcentaje}%
                        </p>
                        <p className="text-xs text-slate-500">{arb.total} días</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })()}

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

        {/* Acordeones Mensuales */}
        <Card className="border-sky-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Registros por Mes ({diasCompletos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {mesesData.length === 0 ? (
              <div className="text-center py-8 text-sky-500">
                <p className="text-lg font-medium">No hay registros de asistencia</p>
                <p className="text-sm mt-2 text-sky-600">
                  Los registros de días obligatorios (Lun, Mar, Jue, Vie, Sáb) desde 01/01/2026 aparecerán aquí.
                  Si no existen registros, debe <strong>subsanar la asistencia</strong> registrándolos.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {mesesData.map((mes) => (
                  <AccordionItem key={mes.key} value={mes.key} className="border-2 rounded-xl overflow-hidden shadow-md">
                    <AccordionTrigger className={`
                      bg-gradient-to-r ${getGradientByPercentage(mes.porcentaje)}
                      ${getTextColorByPercentage(mes.porcentaje)}
                      hover:opacity-90 transition-all duration-300
                      px-6 py-4
                    `}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          {getIconByPercentage(mes.porcentaje)}
                          <div>
                            <p className="text-xl font-bold capitalize">{mes.nombre}</p>
                            <p className="text-sm opacity-90">
                              {mes.completados} de {mes.total} días registrados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${mes.porcentaje >= 70 ? 'text-white' : 'text-white'}`}>
                              {mes.porcentaje}%
                            </p>
                          </div>
                          <ChevronDown className="w-6 h-6 transition-transform duration-300" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white">
                      <div className="p-4">
                        {/* Barra de progreso elegante */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-600">Progreso del mes</span>
                            <span className={`text-sm font-bold ${
                              mes.porcentaje >= 90 ? 'text-green-600' :
                              mes.porcentaje >= 70 ? 'text-blue-600' :
                              mes.porcentaje >= 50 ? 'text-yellow-600' :
                              mes.porcentaje >= 30 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {mes.porcentaje}% completado
                            </span>
                          </div>
                          <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`
                                h-full rounded-full transition-all duration-500 ease-out
                                ${mes.porcentaje >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                  mes.porcentaje >= 70 ? 'bg-gradient-to-r from-blue-400 to-cyan-600' :
                                  mes.porcentaje >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-600' :
                                  mes.porcentaje >= 30 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                                  'bg-gradient-to-r from-red-400 to-rose-600'}
                              `}
                              style={{ width: `${mes.porcentaje}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {/* Tabla de días del mes */}
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
                              {mes.dias.map((item: any) => (
                                <TableRow key={item.fecha} className={item.tieneRegistro ? "hover:bg-sky-50" : "bg-amber-50 hover:bg-amber-100"}>
                                  <TableCell className="font-medium text-sky-800">{format(item.fechaDate, 'dd/MM/yyyy')}</TableCell>
                                  <TableCell className="text-sky-700">
                                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][item.diaSemana]}
                                  </TableCell>
                                  <TableCell className="text-sky-600">{getActividadLabel(item.actividad)}</TableCell>
                                  <TableCell>
                                    {item.tieneRegistro ? (
                                      <Badge className="bg-green-100 text-green-800">
                                        ✅ Completado
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
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

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
                        const arbitroParaComponente: Arbitro = arbitroCompleto ? {
                          id: String(arbitroCompleto.id),
                          nombres: arbitroCompleto.nombre || '',
                          apellidoPaterno: arbitroCompleto.apellido || '',
                          apellidoMaterno: '',
                          categoria: '',
                          codigoCODAR: ''
                        } : {
                          id: String(arb.arbitrId),
                          nombres: nombreMostrar,
                          apellidoPaterno: nombreMostrar,
                          apellidoMaterno: '',
                          categoria: '',
                          codigoCODAR: ''
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

            {/* Modal de Previsualización de Exportación */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50">
                <DialogHeader className="border-b border-slate-200 pb-4">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                      <FileDown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="block text-lg text-slate-500 font-normal">Previsualización</span>
                      <span className="block text-slate-800">{previewTitulo}</span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                {/* Estadísticas */}
                {(() => {
                  const esSemanal = previewTitulo.includes("Semanal")
                  let stats = { total: previewData.length, presentes: 0, ausentes: 0, tardanzas: 0 }
                  
                  if (esSemanal) {
                    previewData.forEach((item: any) => {
                      if (item.dias) {
                        item.dias.forEach((dia: any) => {
                          if (dia?.estado === 'presente') stats.presentes++
                          else if (dia?.estado === 'ausente') stats.ausentes++
                          else if (dia?.estado === 'tardanza') stats.tardanzas++
                        })
                      }
                    })
                  } else {
                    stats.presentes = previewData.filter((i: any) => i.estado === 'presente').length
                    stats.ausentes = previewData.filter((i: any) => i.estado === 'ausente').length
                    stats.tardanzas = previewData.filter((i: any) => i.estado === 'tardanza').length
                  }
                  
                  return (
                    <div className="grid grid-cols-4 gap-3 py-4">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-green-200 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.presentes}</div>
                        <div className="text-xs text-green-600 uppercase tracking-wide">Presentes</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-red-200 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.ausentes}</div>
                        <div className="text-xs text-red-600 uppercase tracking-wide">Ausentes</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-yellow-200 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.tardanzas}</div>
                        <div className="text-xs text-yellow-600 uppercase tracking-wide">Tardanzas</div>
                      </div>
                    </div>
                  )
                })()}
                
                <div className="py-2">
                  {previewTitulo.includes("Semanal") ? (
                    // Vista especial para reporte semanal
                    <>
                      <div className="flex gap-4 mb-3 text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded-full"></span> Presente</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full"></span> Ausente</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded-full"></span> Tardanza</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 rounded-full"></span> Justificado</span>
                      </div>
                      
                      <div className="overflow-x-auto border-2 border-slate-200 rounded-xl max-h-80">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50">
                              <TableHead className="text-slate-700 font-bold">Árbitro</TableHead>
                              <TableHead className="text-slate-700 font-bold text-center bg-blue-50/50">Lun</TableHead>
                              <TableHead className="text-slate-700 font-bold text-center bg-blue-50/50">Mar</TableHead>
                              <TableHead className="text-slate-700 font-bold text-center bg-blue-50/50">Mié</TableHead>
                              <TableHead className="text-slate-700 font-bold text-center bg-blue-50/50">Jue</TableHead>
                              <TableHead className="text-slate-700 font-bold text-center bg-blue-50/50">Vie</TableHead>
                              <TableHead className="text-green-700 font-bold text-center bg-green-50">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.slice(0, 15).map((item: any, idx: number) => {
                              let totalPresentes = 0
                              if (item.dias) {
                                item.dias.forEach((dia: any) => {
                                  if (dia?.estado && ['presente', 'tardanza', 'justificado'].includes(dia.estado)) totalPresentes++
                                })
                              }
                              
                              return (
                                <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <TableCell className="font-medium text-slate-700">{item.nombre || 'Sin nombre'}</TableCell>
                                  {item.dias?.slice(0, 5).map((dia: any, diaIdx: number) => (
                                    <TableCell key={diaIdx} className="text-center">
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                        dia?.estado === 'presente' ? 'bg-green-500 text-white shadow-sm' :
                                        dia?.estado === 'ausente' ? 'bg-red-500 text-white shadow-sm' :
                                        dia?.estado === 'tardanza' ? 'bg-yellow-500 text-white shadow-sm' :
                                        dia?.estado === 'justificado' ? 'bg-blue-500 text-white shadow-sm' :
                                        'bg-slate-200 text-slate-400'
                                      }`}>
                                        {dia?.estado ? getSimboloEstado(dia.estado) : '-'}
                                      </span>
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-center font-bold text-green-600 bg-green-50">{totalPresentes}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      {previewData.length > 15 && (
                        <p className="text-sm text-slate-500 mt-3 text-center">
                          Mostrando 15 de {previewData.length} árbitros
                        </p>
                      )}
                    </>
                  ) : (
                    // Vista normal para reportes diarios, resumen, Excel
                    <>
                      <div className="overflow-x-auto border-2 border-slate-200 rounded-xl max-h-80">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-green-100 to-emerald-50">
                              <TableHead className="text-green-800 font-bold">Fecha</TableHead>
                              <TableHead className="text-green-800 font-bold">Actividad</TableHead>
                              <TableHead className="text-green-800 font-bold">Estado</TableHead>
                              <TableHead className="text-green-800 font-bold">Hora</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previewData.slice(0, 15).map((item: any, idx: number) => (
                              <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <TableCell className="font-medium text-slate-700">{item.fecha ? format(new Date(item.fecha), 'dd/MM/yyyy') : '-'}</TableCell>
                                <TableCell className="capitalize text-slate-600">
                                {item.actividad === 'analisis_partido' ? 'Análisis de Partido' :
                                 item.actividad === 'preparacion_fisica' ? 'Preparación Física' :
                                 item.actividad === 'reunion_ordinaria' ? 'Reunión Ordinaria' :
                                 item.actividad === 'reunion_extraordinaria' ? 'Reunión Extraordinaria' :
                                 item.actividad?.replace(/_/g, ' ') || '-'}
                              </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.estado === 'presente' ? 'bg-green-100 text-green-800' :
                                    item.estado === 'ausente' ? 'bg-red-100 text-red-800' :
                                    item.estado === 'tardanza' ? 'bg-yellow-100 text-yellow-800' :
                                    item.estado === 'justificado' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-800'
                                  }`}>
                                    {item.estado === 'presente' ? 'Completado' :
                                     item.estado === 'ausente' ? 'Ausente' :
                                     item.estado === 'tardanza' ? 'Tardanza' :
                                     item.estado === 'justificado' ? 'Justificado' :
                                     item.estado || '-'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-slate-600">{item.horaEntrada ? (typeof item.horaEntrada === 'string' ? item.horaEntrada.substring(0, 5) : '-') : '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {previewData.length > 15 && (
                        <p className="text-sm text-slate-500 mt-3 text-center">
                          Mostrando 15 de {previewData.length} registros
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                <DialogFooter className="border-t border-slate-200 pt-4 mt-2">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-slate-400">
                      SIDAF-PUNO | Previsualización de reporte
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPreviewOpen(false)} className="border-slate-300 hover:bg-slate-100">
                        Cancelar
                      </Button>
                      <Button 
                        onClick={confirmarExportacion} 
                        className={`shadow-lg shadow-${previewTipo === 'pdf' ? 'green' : 'emerald'}-500/25 ${
                          previewTipo === 'pdf' 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                        } text-white`}
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        {previewTipo === "pdf" ? "Descargar PDF" : "Descargar Excel"}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



