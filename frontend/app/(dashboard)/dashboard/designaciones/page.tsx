"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Eye, Edit, Calendar, Trophy, Users, Filter, Copy, Trash2 } from "lucide-react"
import { getDesignaciones, getArbitros, getCampeonatos, type Designacion, type Arbitro, type Campeonato } from "@/services/api"
import PartidoHeader from "@/components/designaciones/PartidoHeader"
import DesignacionStatusBadge from "@/components/designaciones/DesignacionStatusBadge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function DesignacionesPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [championships, setCampeonatos] = useState<Campeonato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [championshipFilter, setChampionshipFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"lista" | "grid">("lista")

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

  // Filtrar designaciones por búsqueda
  const designacionesFiltradas = useMemo(() => {
    let result = designaciones

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((d) =>
        d.equipoLocal?.toLowerCase().includes(term) ||
        d.equipoVisitante?.toLowerCase().includes(term) ||
        arbitros.find((a) => a.id === d.arbitroPrincipal)?.nombres?.toLowerCase().includes(term)
      )
    }

    // Filtro por campeonato
    if (championshipFilter !== "todos") {
      result = result.filter((d) => d.campeonatoId === championshipFilter)
    }

    // Filtro por estado
    if (statusFilter !== "todos") {
      const hoy = new Date()
      result = result.filter((d) => {
        const fechaPartido = new Date(d.fecha)
        const diasDiferencia = Math.ceil((fechaPartido.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
        
        if (statusFilter === "finalizado") return diasDiferencia < 0
        if (statusFilter === "hoy") return diasDiferencia === 0
        if (statusFilter === "proximo") return diasDiferencia > 0 && diasDiferencia <= 3
        if (statusFilter === "programado") return diasDiferencia > 3
        return true
      })
    }

    return result
  }, [searchTerm, statusFilter, championshipFilter, designaciones, arbitros])

  const getArbitroNombre = (arbitroId: string) => {
    const arbitro = arbitros.find((a) => a.id === arbitroId)
    return arbitro?.nombres || arbitro?.apellidoPaterno || "N/A"
  }

  const getCampeonatoInfo = (campeonatoId: string) => {
    return championships.find((c) => c.id === campeonatoId)
  }

  // Calcular porcentaje de asistencia para un árbitro
  const calcularAsistencia = (arbitroId: string): number => {
    // Simulación - en producción esto vendría del backend
    const arbitro = arbitros.find((a) => a.id === arbitroId)
    return (arbitro as any)?.asistenciaReciente || 0
  }

  // Estadísticas rápidas
  const stats = useMemo(() => ({
    total: designaciones.length,
    esteMes: designaciones.filter((d) => {
      const fecha = new Date(d.fecha)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }).length,
    proximos: designaciones.filter((d) => {
      const fecha = new Date(d.fecha)
      const hoy = new Date()
      const diasDiferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
      return diasDiferencia > 0 && diasDiferencia <= 3
    }).length,
    hoy: designaciones.filter((d) => {
      const fecha = new Date(d.fecha)
      const hoy = new Date()
      return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }).length,
    activos: new Set([
      ...designaciones.map((d) => d.arbitroPrincipal),
      ...designaciones.map((d) => d.arbitrosAsistente1),
      ...designaciones.map((d) => d.arbitrosAsistente2),
      ...designaciones.map((d) => d.cuartoArbitro),
    ]).size,
  }), [designaciones])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-8 border-slate-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando designaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden md:inline font-medium">Volver</span>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Designaciones</h1>
                  <p className="text-slate-500 text-sm">Gestiona las asignaciones de árbitros</p>
                </div>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg">
              <Link href="/dashboard/designaciones/nueva">
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden md:inline">Nueva Designación</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-100 text-sm">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Users className="h-5 w-5" />
              <span className="text-sm">Designaciones</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-3xl font-bold">{stats.esteMes}</p>
                <p className="text-emerald-100 text-sm">Este Mes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="text-sm">{new Date().toLocaleDateString("es-ES", { month: "long" })}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-3xl font-bold">{stats.proximos}</p>
                <p className="text-amber-100 text-sm">Próximos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-100">
              <span className="text-sm">Próximos 7 días</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-3xl font-bold">{stats.hoy}</p>
                <p className="text-red-100 text-sm">Hoy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-100">
              <span className="text-sm">Partidos hoy</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-slate-200 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Buscar por equipos, árbitros o estadio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filtro por campeonato */}
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-2">Campeonato</label>
                  <select
                    value={championshipFilter}
                    onChange={(e) => setChampionshipFilter(e.target.value)}
                    className="w-full h-12 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="todos">Todos los torneos</option>
                    {championships.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por estado */}
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-12 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="programado">Programado</option>
                    <option value="proximo">Próximo</option>
                    <option value="hoy">Hoy</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Vista */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Vista</label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "lista" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("lista")}
                      className="px-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M4 24h16" />
                      </svg>
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="px-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v3H3v3h7v3h7v3H3z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de designaciones */}
        {designacionesFiltradas.length === 0 ? (
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron designaciones</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando la primera designación"}
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Link href="/dashboard/designaciones/nueva">
                    <Plus className="h-5 w-5 mr-2" />
                    Nueva Designación
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {designacionesFiltradas
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((designacion) => {
                const championship = getCampeonatoInfo(designacion.campeonatoId)
                const fecha = new Date(designacion.fecha)
                const principal = getArbitroNombre(designacion.arbitroPrincipal)
                const asistente1 = getArbitroNombre(designacion.arbitrosAsistente1)
                const asistente2 = getArbitroNombre(designacion.arbitrosAsistente2)
                const cuarto = getArbitroNombre(designacion.cuartoArbitro)

                return (
                  <Card key={designacion.id} className="hover:shadow-2xl transition-all duration-300 border-slate-200 overflow-hidden">
                    {/* PartidoHeader */}
                    <PartidoHeader
                      equipoLocal={designacion.equipoLocal}
                      equipoVisitante={designacion.equipoVisitante}
                      fecha={designacion.fecha}
                      hora={designacion.fecha ? designacion.fecha.split('T')[1]?.substring(0, 5) : "20:00"}
                      estadio={designacion.estadio}
                      campeonato={championship?.nombre}
                      nivelDificultad={championship?.nivelDificultad as any || "Medio"}
                      categoria={championship?.categoria as any || "Regional"}
                      showActions={true}
                      onEditar={() => {}}
                      onDuplicar={() => {}}
                      onEliminar={() => {}}
                    />

                    {/* Árbitros asignados */}
                    <CardContent className="p-6 pt-0">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Principal */}
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <p className="text-xs font-medium text-green-700 mb-1">⭐ Principal</p>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                              {principal.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{principal}</p>
                              <Badge className="text-xs bg-green-100 text-green-700">
                                {calcularAsistencia(designacion.arbitroPrincipal)}% asistencia
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Asistente 1 */}
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">👤 Asistente 1</p>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                              {asistente1.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{asistente1}</p>
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                {calcularAsistencia(designacion.arbitrosAsistente1)}% asistencia
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Asistente 2 */}
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">👤 Asistente 2</p>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                              {asistente2.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{asistente2}</p>
                              <Badge className="text-xs bg-blue-100 text-blue-700">
                                {calcularAsistencia(designacion.arbitrosAsistente2)}% asistencia
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Cuarto */}
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <p className="text-xs font-medium text-purple-700 mb-1">👤 Cuarto</p>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center font-bold text-white text-sm">
                              {cuarto.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{cuarto}</p>
                              <Badge className="text-xs bg-purple-100 text-purple-700">
                                {calcularAsistencia(designacion.cuartoArbitro)}% asistencia
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 hover:bg-blue-50"
                        >
                          <Link href={`/dashboard/designaciones/${designacion.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 hover:bg-blue-50"
                        >
                          <Link href={`/dashboard/designaciones/${designacion.id}/editar`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-slate-50"
                          onClick={() => {}}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="hover:bg-red-50"
                          onClick={() => {}}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
