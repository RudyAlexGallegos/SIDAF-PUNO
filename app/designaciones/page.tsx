"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Eye, Edit, Calendar, Trophy, Users } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export default function DesignacionesPage() {
  const { designaciones, arbitros, campeonatos, loadData } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtrar designaciones por búsqueda
  const designacionesFiltradas = designaciones.filter(
    (designacion) =>
      designacion.equipoLocal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      designacion.equipoVisitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arbitros
        .find((a) => a.id === designacion.arbitroPrincipal)
        ?.nombre.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  const getArbitroNombre = (arbitroId: string) => {
    const arbitro = arbitros.find((a) => a.id === arbitroId)
    return arbitro?.nombre || "N/A"
  }

  const getCampeonatoInfo = (campeonatoId: string) => {
    return campeonatos.find((c) => c.id === campeonatoId)
  }

  // Estadísticas rápidas
  const totalDesignaciones = designaciones.length
  const designacionesEsteMes = designaciones.filter((d) => {
    const fecha = new Date(d.fecha)
    const hoy = new Date()
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
  }).length

  const arbitrosActivos = new Set([
    ...designaciones.map((d) => d.arbitroPrincipal),
    ...designaciones.map((d) => d.arbitroAsistente1),
    ...designaciones.map((d) => d.arbitroAsistente2),
    ...designaciones.map((d) => d.cuartoArbitro),
  ]).size

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Designaciones</h1>
              <p className="text-sm sm:text-base text-gray-600">{totalDesignaciones} designaciones registradas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Acciones principales */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <Button
            asChild
            size="lg"
            className="h-12 sm:h-14 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 shadow-lg flex-1 sm:flex-none"
          >
            <Link href="/designaciones/nueva" className="flex items-center justify-center space-x-2">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Nueva Designación</span>
            </Link>
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar por equipos o árbitro..."
              className="pl-12 sm:pl-14 h-12 sm:h-14 text-base sm:text-lg bg-white border-2 border-gray-200 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8">
          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{totalDesignaciones}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Total Designaciones</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{designacionesEsteMes}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Este Mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{arbitrosActivos}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Árbitros Activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de designaciones */}
        <div className="space-y-4 sm:space-y-6">
          {designacionesFiltradas.length > 0 ? (
            designacionesFiltradas
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((designacion) => {
                const campeonato = getCampeonatoInfo(designacion.campeonatoId)
                const fecha = new Date(designacion.fecha)
                const principal = getArbitroNombre(designacion.arbitroPrincipal)
                const asistente1 = getArbitroNombre(designacion.arbitroAsistente1)
                const asistente2 = getArbitroNombre(designacion.arbitroAsistente2)
                const cuarto = getArbitroNombre(designacion.cuartoArbitro)

                return (
                  <Card key={designacion.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Información del partido */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                {designacion.equipoLocal} vs {designacion.equipoVisitante}
                              </h3>
                              <p className="text-sm text-gray-600">{designacion.estadio}</p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              <p className="text-sm font-medium text-gray-800">{fecha.toLocaleDateString("es-ES")}</p>
                              <p className="text-sm text-gray-600">
                                {fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {campeonato && (
                              <>
                                <Badge variant="outline" className="text-sm">
                                  {campeonato.nombre}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    campeonato.nivelDificultad === "Alto"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : campeonato.nivelDificultad === "Medio"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                                  }
                                >
                                  {campeonato.nivelDificultad}
                                </Badge>
                              </>
                            )}
                          </div>

                          {/* Árbitros asignados */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <p className="text-xs font-medium text-green-800 mb-1">Principal</p>
                              <p className="text-sm font-semibold text-green-700">{principal}</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-800 mb-1">Asistente 1</p>
                              <p className="text-sm font-semibold text-blue-700">{asistente1}</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-800 mb-1">Asistente 2</p>
                              <p className="text-sm font-semibold text-blue-700">{asistente2}</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <p className="text-xs font-medium text-purple-800 mb-1">Cuarto</p>
                              <p className="text-sm font-semibold text-purple-700">{cuarto}</p>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col space-y-2 lg:min-w-[120px]">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-10 text-sm border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                          >
                            <Link
                              href={`/designaciones/${designacion.id}`}
                              className="flex items-center justify-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver</span>
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-10 text-sm border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            <Link
                              href={`/designaciones/${designacion.id}/editar`}
                              className="flex items-center justify-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
          ) : (
            <Card className="bg-white shadow-md">
              <CardContent className="text-center py-12 sm:py-16">
                <Calendar className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">
                  {searchTerm ? "No se encontraron designaciones" : "No hay designaciones registradas"}
                </h3>
                <p className="text-base sm:text-lg text-gray-500 mb-6">
                  {searchTerm
                    ? "Intenta con otro término de búsqueda"
                    : "Comienza creando tu primera designación de árbitros"}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="h-12 sm:h-14 text-base sm:text-lg bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/designaciones/nueva">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    {searchTerm ? "Nueva Designación" : "Crear Primera Designación"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
