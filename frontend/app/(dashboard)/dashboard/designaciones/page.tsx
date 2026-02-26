"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Eye, Edit, Calendar, Trophy, Users, Filter } from "lucide-react"
import { getDesignaciones, getArbitros, getCampeonatos, type Designacion, type Arbitro, type Campeonato } from "@/services/api"
import PageStructure, { PageCard, SearchField, FilterSelect, StatsGrid, StatCard, EmptyState } from "@/components/PageStructure"

export default function DesignacionesPage() {
  const [designaciones, setDesignaciones] = useState<Designacion[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [championships, setCampeonatos] = useState<Campeonato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [championshipFilter, setChampionshipFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)

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

    return result
  }, [searchTerm, statusFilter, championshipFilter, designaciones, arbitros])

  const getArbitroNombre = (arbitroId: string) => {
    const arbitro = arbitros.find((a) => a.id === arbitroId)
    return arbitro?.nombres || arbitro?.apellidoPaterno || "N/A"
  }

  const getCampeonatoInfo = (campeonatoId: string) => {
    return championships.find((c) => c.id === championshipFilter)
  }

  // Estadísticas rápidas
  const stats = useMemo(() => ({
    total: designaciones.length,
    esteMes: designaciones.filter((d) => {
      const fecha = new Date(d.fecha)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }).length,
    activos: new Set([
      ...designaciones.map((d) => d.arbitroPrincipal),
      ...designaciones.map((d) => d.arbitrosAsistente1),
      ...designaciones.map((d) => d.arbitrosAsistente2),
      ...designaciones.map((d) => d.cuartoArbitro),
    ]).size,
  }), [designaciones])

  const getStatusBadge = (fecha: string) => {
    const fechaPartido = new Date(fecha)
    const hoy = new Date()
    const diasDiferencia = Math.ceil((fechaPartido.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diasDiferencia < 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Finalizado</span>
    } else if (diasDiferencia === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse">Hoy</span>
    } else if (diasDiferencia <= 3) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">Próximo</span>
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">Programado</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Cargando designaciones...
      </div>
    )
  }

  return (
    <PageStructure
      title="Designaciones"
      description="Gestiona las asignaciones de árbitros"
      backHref="/dashboard"
      actions={
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/designaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Designación
          </Link>
        </Button>
      }
    >
      {/* Stats */}
      <StatsGrid>
        <StatCard
          title="Total Designaciones"
          value={stats.total}
          icon={Trophy}
          color="blue"
        />
        <StatCard
          title="Este Mes"
          value={stats.esteMes}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Árbitros Activos"
          value={stats.activos}
          icon={Users}
          color="green"
        />
      </StatsGrid>

      {/* Filtros */}
      <PageCard className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por equipos o árbitro..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={championshipFilter}
              onChange={(e) => setChampionshipFilter(e.target.value)}
              className="h-10 md:h-12 px-3 md:px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[180px]"
            >
              <option value="todos">Todos los torneos</option>
              {championships.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </PageCard>

      {/* Lista de designaciones */}
      {designacionesFiltradas.length === 0 ? (
        <EmptyState
          title="No se encontraron designaciones"
          description={searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza creando la primera designación"}
          icon={Calendar}
          action={
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/designaciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Designación
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {designacionesFiltradas
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((designacion) => {
              const championship = getCampeonatoInfo(designacion.campeonatoId)
              const fecha = new Date(designacion.fecha)
              const principal = getArbitroNombre(designacion.arbitroPrincipal)
              const asistente1 = getArbitroNombre(designacion.arbitrosAsistente1)
              const asistente2 = getArBITROSAsistente2(designacion.arbitrosAsistente2)
              const cuarto = getArbitroNombre(designacion.cuartoArbitro)

              return (
                <Card key={designacion.id} className="hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Información del partido */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-base md:text-lg font-bold text-slate-900">
                                {designacion.equipoLocal} <span className="text-blue-600">vs</span> {designacion.equipoVisitante}
                              </h3>
                              <p className="text-sm text-slate-500">{designacion.estadio}</p>
                            </div>
                          </div>
                          <div className="text-right mt-3 lg:mt-0">
                            <div className="flex items-center gap-2 justify-end">
                              {getStatusBadge(designacion.fecha)}
                            </div>
                            <p className="text-sm font-medium text-slate-700 mt-1">
                              {fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                            <p className="text-sm text-slate-500">
                              {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>

                        {/* Árbitros asignados - Grid responsivo */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                          <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs font-medium text-green-700 mb-1">Principal</p>
                            <p className="text-xs md:text-sm font-semibold text-green-800 truncate">{principal}</p>
                          </div>
                          <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-700 mb-1">Asistente 1</p>
                            <p className="text-xs md:text-sm font-semibold text-blue-800 truncate">{asistente1}</p>
                          </div>
                          <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-700 mb-1">Asistente 2</p>
                            <p className="text-xs md:text-sm font-semibold text-blue-800 truncate">{asistente2}</p>
                          </div>
                          <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-xs font-medium text-purple-700 mb-1">Cuarto</p>
                            <p className="text-xs md:text-sm font-semibold text-purple-800 truncate">{cuarto}</p>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 hover:border-blue-300" asChild>
                          <Link href={`/dashboard/designaciones/${designacion.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                          <Link href={`/dashboard/designaciones/${designacion.id}/editar`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </PageStructure>
  )
}
