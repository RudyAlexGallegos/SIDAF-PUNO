"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Eye, Edit, Calendar, Trophy, Users, Filter, ChevronDown } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export default function DesignacionesPage() {
  const { designaciones, arbitros, campeonatos, loadData } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [campeonatoFilter, setCampeonatoFilter] = useState<string>("todos")

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar designaciones por búsqueda
  const designacionesFiltradas = useMemo(() => {
    let result = designaciones

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((d) =>
        d.equipoLocal?.toLowerCase().includes(term) ||
        d.equipoVisitante?.toLowerCase().includes(term) ||
        arbitros.find((a) => a.id === d.arbitroPrincipal)?.nombre?.toLowerCase().includes(term)
      )
    }

    // Filtro por campeonato
    if (campeonatoFilter !== "todos") {
      result = result.filter((d) => d.campeonatoId === campeonatoFilter)
    }

    return result
  }, [searchTerm, statusFilter, campeonatoFilter, designaciones, arbitros])

  const getArbitroNombre = (arbitroId: string) => {
    const arbitro = arbitros.find((a) => a.id === arbitroId)
    return arbitro?.nombre || "N/A"
  }

  const getCampeonatoInfo = (campeonatoId: string) => {
    return campeonatos.find((c) => c.id === campeonatoId)
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
      ...designaciones.map((d) => d.arbitroAsistente1),
      ...designaciones.map((d) => d.arbitroAsistente2),
      ...designaciones.map((d) => d.cuartoArbitro),
    ]).size,
  }), [designaciones])

  const getStatusBadge = (fecha: string) => {
    const fechaPartido = new Date(fecha)
    const hoy = new Date()
    const diasDiferencia = Math.ceil((fechaPartido.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diasDiferencia < 0) {
      return <Badge className="bg-slate-500">Finalizado</Badge>
    } else if (diasDiferencia === 0) {
      return <Badge className="bg-red-500 animate-pulse">Hoy</Badge>
    } else if (diasDiferencia <= 3) {
      return <Badge className="bg-orange-500">Próximo</Badge>
    } else {
      return <Badge className="bg-green-500">Programado</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="h-6 w-px bg-slate-300" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Designaciones</h1>
              <p className="text-slate-500">Gestiona las asignaciones de árbitros</p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30">
          <Link href="/dashboard/designaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Designación
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Total Designaciones</p>
                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Este Mes</p>
                <p className="text-3xl font-bold text-blue-600">{stats.esteMes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Árbitros Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por equipos o árbitro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={campeonatoFilter}
            onChange={(e) => setCampeonatoFilter(e.target.value)}
            className="h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos los campeonatos</option>
            {campeonatos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <Button
            variant={statusFilter === "todos" ? "default" : "outline"}
            onClick={() => setStatusFilter(statusFilter === "todos" ? "activos" : "todos")}
            className={statusFilter !== "todos" ? "bg-purple-600" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Lista de designaciones */}
      {designacionesFiltradas.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {searchTerm ? "No se encontraron designaciones" : "No hay designaciones"}
              </h3>
              <p className="text-slate-500 mt-2">
                {searchTerm ? "Intenta con otro término de búsqueda" : "Crea tu primera designación de árbitros"}
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white mt-4">
              <Link href="/dashboard/designaciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Crear Designación
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {designacionesFiltradas
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((designacion) => {
              const campeonato = getCampeonatoInfo(designacion.campeonatoId)
              const fecha = new Date(designacion.fecha)
              const principal = getArbitroNombre(designacion.arbitroPrincipal)
              const asistente1 = getArbitroNombre(designacion.arbitroAsistente1)
              const asistente2 = getArbitroNombre(designacion.arbitroAsistente2)
              const cuarto = getArbitroNombre(designacion.cuartoArbitro)

              return (
                <Card key={designacion.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Información del partido */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Trophy className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {designacion.equipoLocal} <span className="text-purple-600">vs</span> {designacion.equipoVisitante}
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

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {campeonato && (
                            <>
                              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500">
                                {campeonato.nombre}
                              </Badge>
                              <Badge
                                className={
                                  campeonato.nivelDificultad === "Alto"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : campeonato.nivelDificultad === "Medio"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-green-100 text-green-700 border-green-200"
                                }
                              >
                                {campeonato.nivelDificultad}
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Árbitros asignados */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                            <p className="text-xs font-medium text-green-800 mb-1">Principal</p>
                            <p className="text-sm font-semibold text-green-700 truncate">{principal}</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-800 mb-1">Asistente 1</p>
                            <p className="text-sm font-semibold text-blue-700 truncate">{asistente1}</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-800 mb-1">Asistente 2</p>
                            <p className="text-sm font-semibold text-blue-700 truncate">{asistente2}</p>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <p className="text-xs font-medium text-purple-800 mb-1">Cuarto</p>
                            <p className="text-sm font-semibold text-purple-700 truncate">{cuarto}</p>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px]">
                        <Button variant="outline" size="sm" className="flex-1 hover:bg-purple-50 hover:border-purple-300" asChild>
                          <Link href={`/dashboard/designaciones/${designacion.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white" asChild>
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
    </div>
  )
}
