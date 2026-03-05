"use client"

import { useEffect, useState, useMemo } from "react"
import { getDesignaciones, getArbitros, Designacion, Arbitro } from "@/services/api"
import { Trophy, Medal, Award, Users, Calendar, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Días de designación: Lunes, Martes, Jueves, Viernes
const DIAS_DESIGNACION = [1, 2, 4, 5]

// Obtener el rango de la semana actual (lunes a domingo)
function getSemanaActual() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  
  const lunes = new Date(now.setDate(diff))
  lunes.setHours(0, 0, 0, 0)
  
  const domingo = new Date(lunes)
  domingo.setDate(domingo.getDate() + 6)
  domingo.setHours(23, 59, 59, 999)
  
  return { lunes, domingo }
}

// Obtener número de semana del año
function getNumeroSemana(date: Date): number {
  const d = new Date(date.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dayNr + 3)
  const firstThursday = d.valueOf()
  d.setMonth(0, 1)
  return Math.ceil((((d.valueOf() - firstThursday) / 86400000) + 1) / 7)
}

// Obtener las fechas de los días de designación en una semana
function getFechasDesignacionSemana(lunes: Date, domingo: Date): Date[] {
  const fechas: Date[] = []
  const current = new Date(lunes)
  
  while (current <= domingo) {
    if (DIAS_DESIGNACION.includes(current.getDay())) {
      fechas.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  
  return fechas
}

interface RankingEntry {
  arbitro: Arbitro
  totalDesignaciones: number
  comoPrincipal: number
  comoAsistente: number
  comoCuarto: number
  comoVAR: number
}

export default function RankingSemanalPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [loading, setLoading] = useState(true)
  const [semana, setSemana] = useState(getSemanaActual())

  useEffect(() => {
    async function load() {
      try {
        const [desigs, arbs] = await Promise.all([
          getDesignaciones(),
          getArbitros()
        ])
        setDesignaciones(desigs)
        setArbitros(arbs)
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const designacionesSemana = useMemo(() => {
    return designaciones.filter(d => {
      if (!d.fecha) return false
      const fecha = new Date(d.fecha)
      return fecha >= semana.lunes && fecha <= semana.domingo
    })
  }, [designaciones, semana])

  const ranking = useMemo((): RankingEntry[] => {
    const stats: Record<number, RankingEntry> = {}
    
    arbitros.forEach(arb => {
      if (arb.id) {
        stats[arb.id] = {
          arbitro: arb,
          totalDesignaciones: 0,
          comoPrincipal: 0,
          comoAsistente: 0,
          comoCuarto: 0,
          comoVAR: 0
        }
      }
    })
    
    designacionesSemana.forEach(d => {
      if (d.idArbitro && stats[d.idArbitro]) {
        stats[d.idArbitro].totalDesignaciones++
        
        const posicion = d.posicion?.toLowerCase() || ""
        if (posicion.includes("principal") || posicion.includes("árbitro")) {
          stats[d.idArbitro].comoPrincipal++
        } else if (posicion.includes("asistente")) {
          stats[d.idArbitro].comoAsistente++
        } else if (posicion.includes("cuarto")) {
          stats[d.idArbitro].comoCuarto++
        } else if (posicion.includes("var")) {
          stats[d.idArbitro].comoVAR++
        }
      }
    })
    
    return Object.values(stats).sort((a, b) => b.totalDesignaciones - a.totalDesignaciones)
  }, [arbitros, designacionesSemana])

  const fechasSemana = useMemo(() => {
    return getFechasDesignacionSemana(semana.lunes, semana.domingo)
  }, [semana])

  const cambiarSemana = (direccion: number) => {
    const nuevaFecha = new Date(semana.lunes)
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7))
    
    const nuevoDomingo = new Date(nuevaFecha)
    nuevoDomingo.setDate(nuevoDomingo.getDate() + 6)
    
    setSemana({ lunes: nuevaFecha, domingo: nuevoDomingo })
  }

  const irSemanaActual = () => {
    setSemana(getSemanaActual())
  }

  const esSemanaActual = useMemo(() => {
    const actual = getSemanaActual()
    return semana.lunes.getTime() === actual.lunes.getTime()
  }, [semana])

  const formatFecha = (date: Date) => {
    return date.toLocaleDateString("es-PE", { 
      day: "numeric", 
      month: "short" 
    })
  }

  const getDiaSemana = (date: Date) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    return dias[date.getDay()]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sky-200 rounded w-1/3"></div>
            <div className="h-64 bg-sky-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const arbitrosConDesignaciones = ranking.filter(r => r.totalDesignaciones > 0)
  const arbitrosSinDesignaciones = ranking.filter(r => r.totalDesignaciones === 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-800 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              Ranking Semanal
            </h1>
            <p className="text-sky-600 mt-1">
              Designaciones de árbitros por semana
            </p>
          </div>
          
          {!esSemanaActual && (
            <Button 
              onClick={irSemanaActual}
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              Volver a semana actual
            </Button>
          )}
        </div>

        {/* Navegación de semanas */}
        <Card className="border-sky-200 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cambiarSemana(-1)}
                className="text-sky-600 hover:bg-sky-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <CardTitle className="text-lg text-sky-800">
                  Semana {getNumeroSemana(semana.lunes)}
                </CardTitle>
                <p className="text-sm text-sky-500">
                  {formatFecha(semana.lunes)} - {formatFecha(semana.domingo)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cambiarSemana(1)}
                disabled={esSemanaActual}
                className="text-sky-600 hover:bg-sky-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-2">
              {fechasSemana.map((fecha, idx) => (
                <div 
                  key={idx}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{getDiaSemana(fecha)}</span>
                  <span className="text-sky-100">{formatFecha(fecha)}</span>
                </div>
              ))}
              {fechasSemana.length === 0 && (
                <p className="text-sky-400 text-sm">No hay días de designación esta semana</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-3xl font-bold text-amber-700">{designacionesSemana.length}</p>
              <p className="text-xs text-amber-500">designaciones</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Árbitros</span>
              </div>
              <p className="text-3xl font-bold text-sky-700">
                {arbitrosConDesignaciones.length}
              </p>
              <p className="text-xs text-sky-500">designados</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Principales</span>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {ranking.reduce((acc, r) => acc + r.comoPrincipal, 0)}
              </p>
              <p className="text-xs text-green-500">partidos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Asistentes</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">
                {ranking.reduce((acc, r) => acc + r.comoAsistente, 0)}
              </p>
              <p className="text-xs text-purple-500">partidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de árbitros */}
        <Card className="border-sky-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-6 h-6 text-amber-300" />
              Ranking de Árbitros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {arbitrosConDesignaciones.length === 0 ? (
              <div className="p-8 text-center text-sky-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay designaciones esta semana</p>
              </div>
            ) : (
              <div className="divide-y divide-sky-100">
                {arbitrosConDesignaciones.map((entry, index) => (
                  <div 
                    key={entry.arbitro.id}
                    className={`p-4 flex items-center gap-4 hover:bg-sky-50 transition-colors ${
                      index === 0 ? "bg-amber-50" : 
                      index === 1 ? "bg-slate-50" : 
                      index === 2 ? "bg-orange-50" : ""
                    }`}
                  >
                    {/* Posición */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white" :
                      index === 1 ? "bg-gradient-to-r from-slate-400 to-slate-600 text-white" :
                      index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white" :
                      "bg-sky-100 text-sky-600"
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Info del árbitro */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sky-800 truncate">
                          {entry.arbitro.nombre} {entry.arbitro.apellido}
                        </h3>
                        {entry.arbitro.categoria && (
                          <Badge className={`text-xs ${
                            entry.arbitro.categoria.includes("FIFA") ? "bg-yellow-500" :
                            entry.arbitro.categoria.includes("Nacional") ? "bg-blue-500" :
                            entry.arbitro.categoria.includes("Regional") ? "bg-green-500" :
                            "bg-purple-500"
                          }`}>
                            {entry.arbitro.categoria}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-sky-500 truncate">
                        {entry.arbitro.provincia || "Puno"}
                      </p>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm">
                      {entry.comoPrincipal > 0 && (
                        <div className="text-center">
                          <p className="font-bold text-green-600">{entry.comoPrincipal}</p>
                          <p className="text-xs text-green-500">Principal</p>
                        </div>
                      )}
                      {entry.comoAsistente > 0 && (
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{entry.comoAsistente}</p>
                          <p className="text-xs text-purple-500">Asist.</p>
                        </div>
                      )}
                      {entry.comoCuarto > 0 && (
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{entry.comoCuarto}</p>
                          <p className="text-xs text-blue-500">4to</p>
                        </div>
                      )}
                      {entry.comoVAR > 0 && (
                        <div className="text-center">
                          <p className="font-bold text-red-600">{entry.comoVAR}</p>
                          <p className="text-xs text-red-500">VAR</p>
                        </div>
                      )}
                      <div className="bg-sky-600 text-white px-3 py-2 rounded-lg text-center min-w-[60px]">
                        <p className="font-bold text-lg">{entry.totalDesignaciones}</p>
                        <p className="text-xs text-sky-200">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Árbitros sin designaciones */}
                {arbitrosSinDesignaciones.length > 0 && (
                  <div className="p-4 bg-slate-50">
                    <p className="text-sm text-slate-500 font-medium mb-2">
                      Árbitros sin designaciones esta semana:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {arbitrosSinDesignaciones.map(entry => (
                        <span 
                          key={entry.arbitro.id}
                          className="text-sm text-slate-600 bg-white px-2 py-1 rounded border border-slate-200"
                        >
                          {entry.arbitro.nombre} {entry.arbitro.apellido}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Las designaciones se realizan los días <strong>Lunes, Martes, Jueves y Viernes</strong>. 
            El ranking muestra el número de partidos designados por cada árbitro durante la semana seleccionada.
          </p>
        </div>
      </div>
    </div>
  )
}
