"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, Users, Calendar, Award } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export default function EstadisticasAsistenciaPage() {
  const { arbitros, asistencias, loadData } = useDataStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calcular estadísticas por árbitro
  const estadisticasPorArbitro = arbitros.map((arbitro) => {
    const asistenciasArbitro = asistencias.filter((a) => a.arbitroId === arbitro.id)

    // Calcular asistencias por tipo
    const preparacionFisica = asistenciasArbitro.filter((a) => a.tipoActividad === "preparacion_fisica").length
    const entrenamientos = asistenciasArbitro.filter((a) => a.tipoActividad === "entrenamiento").length

    // Calcular asistencias de las últimas 4 semanas
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)

    const asistenciasRecientes = asistenciasArbitro.filter((a) => new Date(a.fecha) >= hace4Semanas).length

    // Calcular porcentaje de asistencia (máximo 16 sesiones en 4 semanas: 4 días x 4 semanas)
    const porcentajeAsistencia = Math.round((asistenciasRecientes / 16) * 100)

    return {
      arbitro,
      preparacionFisica,
      entrenamientos,
      totalAsistencias: asistenciasArbitro.length,
      asistenciasRecientes,
      porcentajeAsistencia,
    }
  })

  // Ordenar por porcentaje de asistencia
  const arbitrosOrdenados = estadisticasPorArbitro.sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia)

  // Calcular estadísticas generales
  const totalAsistencias = asistencias.length
  const asistenciasPreparacion = asistencias.filter((a) => a.tipoActividad === "preparacion_fisica").length
  const asistenciasEntrenamiento = asistencias.filter((a) => a.tipoActividad === "entrenamiento").length

  const promedioAsistencia =
    arbitrosOrdenados.length > 0
      ? Math.round(arbitrosOrdenados.reduce((sum, a) => sum + a.porcentajeAsistencia, 0) / arbitrosOrdenados.length)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/asistencia" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estadísticas de Asistencia</h1>
              <p className="text-sm sm:text-base text-gray-600">Análisis detallado por árbitro</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Estadísticas generales */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalAsistencias}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Total Registros</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{asistenciasPreparacion}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Prep. Física</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{asistenciasEntrenamiento}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Entrenamientos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Award className="h-8 w-8 sm:h-12 sm:w-12 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-amber-600">{promedioAsistencia}%</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de asistencia */}
        <Card className="bg-white shadow-md mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-gray-900">Ranking de Asistencia</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Porcentaje de asistencia por árbitro en las últimas 4 semanas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {arbitrosOrdenados.map((stats, index) => (
                <div
                  key={stats.arbitro.id}
                  className="p-4 sm:p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Posición y avatar */}
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                        <AvatarFallback className="text-sm sm:text-base font-bold">
                          {stats.arbitro.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{stats.arbitro.nombre}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-sm ${
                              stats.arbitro.categoria === "FIFA"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : stats.arbitro.categoria === "Nacional"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : stats.arbitro.categoria === "Regional"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {stats.arbitro.categoria}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-medium text-gray-600">Asistencia General</span>
                        <span
                          className={`text-lg sm:text-xl font-bold ${
                            stats.porcentajeAsistencia >= 80
                              ? "text-green-600"
                              : stats.porcentajeAsistencia >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {stats.porcentajeAsistencia}%
                        </span>
                      </div>
                      <Progress value={stats.porcentajeAsistencia} className="h-2 sm:h-3" />

                      <div className="grid grid-cols-3 gap-4 text-center text-sm sm:text-base">
                        <div>
                          <div className="font-bold text-purple-600">{stats.preparacionFisica}</div>
                          <div className="text-gray-500">Prep. Física</div>
                        </div>
                        <div>
                          <div className="font-bold text-green-600">{stats.entrenamientos}</div>
                          <div className="text-gray-500">Entrenamientos</div>
                        </div>
                        <div>
                          <div className="font-bold text-blue-600">{stats.totalAsistencias}</div>
                          <div className="text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>

                    {/* Badge de rendimiento */}
                    <div className="text-center sm:text-right">
                      <Badge
                        className={`text-sm sm:text-base px-3 py-2 ${
                          stats.porcentajeAsistencia >= 90
                            ? "bg-green-500 hover:bg-green-600"
                            : stats.porcentajeAsistencia >= 80
                              ? "bg-blue-500 hover:bg-blue-600"
                              : stats.porcentajeAsistencia >= 60
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {stats.porcentajeAsistencia >= 90
                          ? "Excelente"
                          : stats.porcentajeAsistencia >= 80
                            ? "Muy Bueno"
                            : stats.porcentajeAsistencia >= 60
                              ? "Bueno"
                              : "Necesita Mejorar"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Análisis por categoría */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-gray-900">Análisis por Categoría</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Promedio de asistencia por categoría de árbitro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {["FIFA", "Nacional", "Regional", "Provincial"].map((categoria) => {
                const arbitrosCategoria = arbitrosOrdenados.filter((a) => a.arbitro.categoria === categoria)
                const promedioCategoria =
                  arbitrosCategoria.length > 0
                    ? Math.round(
                        arbitrosCategoria.reduce((sum, a) => sum + a.porcentajeAsistencia, 0) /
                          arbitrosCategoria.length,
                      )
                    : 0

                return (
                  <div key={categoria} className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl">
                    <Badge
                      variant="outline"
                      className={`mb-4 text-sm sm:text-base px-3 py-2 ${
                        categoria === "FIFA"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : categoria === "Nacional"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : categoria === "Regional"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {categoria}
                    </Badge>
                    <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{promedioCategoria}%</div>
                    <p className="text-sm sm:text-base text-gray-600">{arbitrosCategoria.length} árbitros</p>
                    <Progress value={promedioCategoria} className="mt-3 h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
