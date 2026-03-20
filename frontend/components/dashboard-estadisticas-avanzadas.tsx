"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Calendar, 
  AlertTriangle,
  Award,
  Activity,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { 
  getReporteConsolidado, 
  getTendenciasAsistencia, 
  getRankingArbitros,
  getDiasFaltantes
} from "@/services/api"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"

interface ReporteConsolidado {
  periodo: { inicio: string; fin: string }
  resumen: {
    totalRegistros: number
    presentes: number
    ausentes: number
    tardanzas: number
    justificaciones: number
    porcentajeAsistencia: number
    diasRegistrados: number
    diasObligatorios: number
  }
  porDia: Record<string, {
    dia: string
    numeroDia: number
    esObligatorio: boolean
    total: number
    presentes: number
    ausentes: number
    tardanzas: number
    porcentajeAsistencia: number
  }>
  tendencia: {
    porcentajeActual: number
    porcentajeAnterior: number
    cambioPorcentaje: number
    direccion: string
  }
}

interface RankingEntry {
  arbitroId: number
  nombre: string
  categoria: string
  total: number
  presentes: number
  porcentaje: number
}

interface DiaFaltante {
  fecha: string
  diaSemana: string
  actividad: string
}

export function DashboardEstadisticasAvanzadas() {
  const [reporte, setReporte] = useState<ReporteConsolidado | null>(null)
  const [tendencias, setTendencias] = useState<any>(null)
  const [ranking, setRanking] = useState<{ ranking: RankingEntry[] } | null>(null)
  const [diasFaltantes, setDiasFaltantes] = useState<{ total: number; diasFaltantes: DiaFaltante[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    
    const fin = new Date()
    const inicio = subDays(fin, 30)
    
    const inicioStr = format(inicio, "yyyy-MM-dd")
    const finStr = format(fin, "yyyy-MM-dd")
    
    try {
      const [reporteData, tendenciasData, rankingData, faltantesData] = await Promise.all([
        getReporteConsolidado(inicioStr, finStr),
        getTendenciasAsistencia(6),
        getRankingArbitros(inicioStr, finStr),
        getDiasFaltantes(inicioStr, finStr)
      ])
      
      setReporte(reporteData)
      setTendencias(tendenciasData)
      setRanking(rankingData)
      setDiasFaltantes(faltantesData)
    } catch (err) {
      console.error("Error cargando datos:", err)
      setError("No se pudieron cargar las estadísticas. Verifica la conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const getTrendIcon = (direccion: string) => {
    switch (direccion) {
      case "subiendo":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "bajando":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (direccion: string) => {
    switch (direccion) {
      case "subiendo": return "text-green-600"
      case "bajando": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getEstadoBadgeClass = (porcentaje: number) => {
    if (porcentaje >= 80) return "bg-green-100 text-green-800"
    if (porcentaje >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getActividadLabel = (actividad: string) => {
    const labels: Record<string, string> = {
      analisis_partido: "Análisis de Partido",
      preparacion_fisica: "Preparación Física",
      reunion_ordinaria: "Reunión Ordinaria",
      reunion_extraordinaria: "Reunión Extraordinaria"
    }
    return labels[actividad] || actividad
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <div>
              <p className="font-medium text-orange-800">Error al cargar estadísticas</p>
              <p className="text-sm text-orange-600">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarDatos}
              className="ml-auto border-orange-300 text-orange-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de actualizar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sky-800">Estadísticas Avanzadas</h2>
          <p className="text-sm text-sky-600">Últimos 30 días</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={cargarDatos}
          className="border-sky-300 text-sky-700"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Asistencia % */}
        <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sky-100 text-sm font-medium">Asistencia General</p>
              <Activity className="h-5 w-5 text-sky-200" />
            </div>
            <p className="text-4xl font-bold">{reporte?.resumen?.porcentajeAsistencia || 0}%</p>
            {reporte?.tendencia && (
              <div className={`flex items-center mt-2 text-sm ${
                reporte.tendencia.direccion === "subiendo" ? "text-green-200" : 
                reporte.tendencia.direccion === "bajando" ? "text-red-200" : "text-sky-200"
              }`}>
                {getTrendIcon(reporte.tendencia.direccion)}
                <span className="ml-1">
                  {reporte.tendencia.cambioPorcentaje > 0 ? "+" : ""}
                  {reporte.tendencia.cambioPorcentaje}% vs período anterior
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Registros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Total Registros</p>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-4xl font-bold text-sky-700">{reporte?.resumen?.totalRegistros || 0}</p>
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="text-green-600">✓ {reporte?.resumen?.presentes || 0} presentes</span>
              <span className="text-red-600">✗ {reporte?.resumen?.ausentes || 0} ausentes</span>
            </div>
          </CardContent>
        </Card>

        {/* Días Registrados */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Días Registrados</p>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-4xl font-bold text-sky-700">
              {reporte?.resumen?.diasRegistrados || 0}
              <span className="text-lg text-muted-foreground">/{reporte?.resumen?.diasObligatorios || 0}</span>
            </p>
            <Progress 
              value={reporte?.resumen?.diasObligatorios 
                ? (reporte.resumen.diasRegistrados / reporte.resumen.diasObligatorios) * 100 
                : 0
              } 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        {/* Días Faltantes */}
        <Card className={diasFaltantes?.total && diasFaltantes.total > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Días Faltantes</p>
              <AlertTriangle className={`h-5 w-5 ${diasFaltantes?.total && diasFaltantes.total > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-4xl font-bold ${diasFaltantes?.total && diasFaltantes.total > 0 ? "text-orange-600" : "text-green-600"}`}>
              {diasFaltantes?.total || 0}
            </p>
            {diasFaltantes?.total && diasFaltantes.total > 0 ? (
              <p className="text-xs text-orange-600 mt-2">Días obligatorios sin registro</p>
            ) : (
              <p className="text-xs text-green-600 mt-2">¡Sin días pendientes!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por Día de la Semana */}
      {reporte?.porDia && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Asistencia por Día de la Semana
            </CardTitle>
            <CardDescription>Distribución de asistencia en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(reporte.porDia)
                .filter(([_, data]) => data.esObligatorio)
                .map(([dia, data]) => (
                  <div key={dia} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-sky-700">{data.dia}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {data.presentes}/{data.total} presentes
                        </span>
                        <span className={`text-xs font-bold ${
                          data.porcentajeAsistencia >= 80 ? "text-green-600" :
                          data.porcentajeAsistencia >= 60 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {data.porcentajeAsistencia}%
                        </span>
                      </div>
                      <Progress 
                        value={data.porcentajeAsistencia} 
                        className="h-2"
                      />
                    </div>
                    <Badge className={getEstadoBadgeClass(data.porcentajeAsistencia)}>
                      {data.porcentajeAsistencia >= 80 ? "Bueno" : 
                       data.porcentajeAsistencia >= 60 ? "Regular" : "Bajo"}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking de Árbitros */}
      {ranking?.ranking && ranking.ranking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Ranking de Árbitros por Asistencia
            </CardTitle>
            <CardDescription>Top árbitros con mejor asistencia en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranking.ranking.slice(0, 10).map((entry, index) => (
                <div key={entry.arbitroId} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-gray-100 text-gray-700" :
                    index === 2 ? "bg-amber-100 text-amber-700" :
                    "bg-sky-50 text-sky-700"
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{entry.nombre}</p>
                      <span className={`text-sm font-bold ${
                        entry.porcentaje >= 80 ? "text-green-600" :
                        entry.porcentaje >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {entry.porcentaje}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{entry.categoria || "Sin categoría"}</Badge>
                      <span className="text-xs text-muted-foreground">{entry.presentes}/{entry.total} sesiones</span>
                    </div>
                    <Progress value={entry.porcentaje} className="mt-1 h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Días Faltantes Detalle */}
      {diasFaltantes?.total && diasFaltantes.total > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Días Obligatorios Sin Registro ({diasFaltantes.total})
            </CardTitle>
            <CardDescription>Estos días deben ser subsanados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {diasFaltantes.diasFaltantes.slice(0, 20).map((dia, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="bg-orange-50 text-orange-700 border-orange-300"
                >
                  {format(new Date(dia.fecha + "T00:00:00"), "dd MMM", { locale: es })} - {dia.diaSemana}
                </Badge>
              ))}
              {diasFaltantes.total > 20 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-600">
                  +{diasFaltantes.total - 20} más
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tendencias Mensuales */}
      {tendencias?.meses && tendencias.meses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sky-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencia de Asistencia (Últimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tendencias.meses.map((mes: any, idx: number) => {
                const prevMes = idx > 0 ? tendencias.meses[idx - 1] : null
                const cambio = prevMes ? mes.porcentaje - prevMes.porcentaje : 0
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium text-sky-700 capitalize">
                      {mes.mes?.toLowerCase()} {mes.anio}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{mes.total} registros</span>
                        <div className="flex items-center gap-1">
                          {cambio !== 0 && (
                            <span className={`text-xs ${cambio > 0 ? "text-green-600" : "text-red-600"}`}>
                              {cambio > 0 ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}
                              {Math.abs(cambio).toFixed(1)}%
                            </span>
                          )}
                          <span className={`text-xs font-bold ${
                            mes.porcentaje >= 80 ? "text-green-600" :
                            mes.porcentaje >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {mes.porcentaje}%
                          </span>
                        </div>
                      </div>
                      <Progress value={mes.porcentaje} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
