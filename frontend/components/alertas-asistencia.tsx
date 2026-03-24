"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, TrendingDown, Users, Calendar } from "lucide-react"

interface Alerta {
  id: string
  tipo: "warning" | "danger" | "info"
  titulo: string
  descripcion: string
  accion?: string
}

interface AlertasAsistenciaProps {
  asistencias: any[]
  arbitros: any[]
  periodo: { inicio: Date; fin: Date }
}

export default function AlertasAsistencia({ asistencias, arbitros, periodo }: AlertasAsistenciaProps) {
  
  const alertas = useMemo(() => {
    const alertasGeneradas: Alerta[] = []
    
    // Calcular estadísticas generales
    const total = asistencias.length
    const presentes = asistencias.filter(a => (a.estadoItem || a.estado) === 'presente').length
    const ausentes = asistencias.filter(a => (a.estadoItem || a.estado) === 'ausente').length
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0
    
    // Alerta 1: Asistencia baja (< 80%)
    if (porcentaje < 80 && total > 0) {
      alertasGeneradas.push({
        id: "asistencia-baja",
        tipo: porcentaje < 60 ? "danger" : "warning",
        titulo: "Asistencia General Baja",
        descripcion: `El porcentaje de asistencia actual es del ${porcentaje}%, lo cual está por debajo del objetivo del 80%.`,
        accion: "Revisar causas y tomar medidas correctivas"
      })
    }
    
    // Alerta 2: Alto número de ausencias
    if (ausentes > total * 0.2) {
      alertasGeneradas.push({
        id: "alto-ausentismo",
        tipo: "warning",
        titulo: "Alto Índice de Ausentismo",
        descripcion: `Hay ${ausentes} ausencias de ${total} registros (${Math.round((ausentes/total)*100)}%).`,
        accion: "Investigar causas recurrentes de ausencias"
      })
    }
    
    // Alerta 3: Árbitros con asistencia crítica
    const asistenciasPorArbitro: Record<string, { total: number; presentes: number }> = {}
    asistencias.forEach(a => {
      const id = String(a.arbitroId || '')
      if (!id) return
      
      if (!asistenciasPorArbitro[id]) {
        asistenciasPorArbitro[id] = { total: 0, presentes: 0 }
      }
      asistenciasPorArbitro[id].total++
      const estado = a.estadoItem || a.estado
      if (estado === 'presente' || estado === 'justificado') {
        asistenciasPorArbitro[id].presentes++
      }
    })
    
    const arbitrosCriticos = Object.entries(asistenciasPorArbitro)
      .filter(([_, stats]) => {
        const pct = stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0
        return pct < 50 && stats.total >= 3
      })
      .map(([id, stats]) => {
        const arb = arbitros.find(a => String(a.id) === id)
        return {
          nombre: arb ? `${arb.nombre} ${arb.apellido}` : `Árbitro ${id}`,
          porcentaje: Math.round((stats.presentes / stats.total) * 100)
        }
      })
    
    if (arbitrosCriticos.length > 0) {
      alertasGeneradas.push({
        id: "arbitros-criticos",
        tipo: "danger",
        titulo: "Árbitros con Asistencia Crítica",
        descripcion: `${arbitrosCriticos.length} árbitro(s) tienen menos del 50% de asistencia: ${arbitrosCriticos.map(a => a.nombre).join(", ")}`,
        accion: "Revisar situación individual de cada árbitro"
      })
    }
    
    // Alerta 4: Días sin registro recientes
    const hoy = new Date()
    const diasSinRegistro: string[] = []
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() - i)
      const diaSemana = fecha.getDay()
      
      // Solo considerar días obligatorios (Lun=1, Mar=2, Jue=4, Vie=5, Sáb=6)
      if ([1, 2, 4, 5, 6].includes(diaSemana)) {
        const fechaStr = fecha.toISOString().split('T')[0]
        const tieneRegistro = asistencias.some(a => a.fecha?.startsWith(fechaStr))
        if (!tieneRegistro) {
          diasSinRegistro.push(fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' }))
        }
      }
    }
    
    if (diasSinRegistro.length > 0) {
      alertasGeneradas.push({
        id: "dias-sin-registro",
        tipo: "warning",
        titulo: "Días Obligatorios Sin Registro",
        descripcion: `Los siguientes días obligatorios no tienen registro: ${diasSinRegistro.join(", ")}`,
        accion: "Registrar la asistencia pendiente"
      })
    }
    
    // Alerta 5: Tendencia negativa (comparar con período anterior)
    const mitadPeriodo = Math.floor((periodo.fin.getTime() - periodo.inicio.getTime()) / 2)
    const puntoMedio = new Date(periodo.inicio.getTime() + mitadPeriodo)
    
    const asistenciasPrimeraMitad = asistencias.filter(a => new Date(a.fecha) <= puntoMedio)
    const asistenciasSegundaMitad = asistencias.filter(a => new Date(a.fecha) > puntoMedio)
    
    const pctPrimeraMitad = asistenciasPrimeraMitad.length > 0 
      ? Math.round((asistenciasPrimeraMitad.filter(a => (a.estadoItem || a.estado) === 'presente').length / asistenciasPrimeraMitad.length) * 100)
      : 0
    
    const pctSegundaMitad = asistenciasSegundaMitad.length > 0
      ? Math.round((asistenciasSegundaMitad.filter(a => (a.estadoItem || a.estado) === 'presente').length / asistenciasSegundaMitad.length) * 100)
      : 0
    
    if (pctSegundaMitad < pctPrimeraMitad - 10 && pctPrimeraMitad > 0) {
      alertasGeneradas.push({
        id: "tendencia-negativa",
        tipo: "warning",
        titulo: "Tendencia Negativa en Asistencia",
        descripcion: `La asistencia ha disminuido del ${pctPrimeraMitad}% al ${pctSegundaMitad}% en la segunda mitad del período.`,
        accion: "Investigar causas del deterioro"
      })
    }
    
    // Alerta informativa si no hay alertas
    if (alertasGeneradas.length === 0) {
      alertasGeneradas.push({
        id: "sin-alertas",
        tipo: "info",
        titulo: "Todo en Orden",
        descripcion: "No se detectaron alertas críticas en el período actual.",
        accion: "Continuar monitoreando"
      })
    }
    
    return alertasGeneradas
  }, [asistencias, arbitros, periodo])
  
  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case "warning":
        return <Clock className="w-6 h-6 text-yellow-600" />
      default:
        return <Users className="w-6 h-6 text-blue-600" />
    }
  }
  
  const getAlertaStyles = (tipo: string) => {
    switch (tipo) {
      case "danger":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }
  
  const getAlertaBadge = (tipo: string) => {
    switch (tipo) {
      case "danger":
        return <Badge className="bg-red-600 text-white">Crítica</Badge>
      case "warning":
        return <Badge className="bg-yellow-600 text-white">Advertencia</Badge>
      default:
        return <Badge className="bg-blue-600 text-white">Informativa</Badge>
    }
  }
  
  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          Alertas de Asistencia
        </CardTitle>
      </CardHeader>
      
      <div className="space-y-4">
        {alertas.map(alerta => (
          <Card key={alerta.id} className={getAlertaStyles(alerta.tipo)}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAlertaIcon(alerta.tipo)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg text-slate-800">
                      {alerta.titulo}
                    </h3>
                    {getAlertaBadge(alerta.tipo)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {alerta.descripcion}
                  </p>
                  {alerta.accion && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <TrendingDown className="w-4 h-4" />
                      <span>Acción recomendada: {alerta.accion}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Resumen del período */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Calendar className="w-4 h-4" />
            <p>
              Período analizado: <span className="font-semibold">
                {periodo.inicio.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span> a <span className="font-semibold">
                {periodo.fin.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
