"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Calendar } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export function EstadisticasAsistencia() {
  const { arbitros, asistencias } = useDataStore()

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
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Asistencias</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalAsistencias}</div>
            <p className="text-xs text-gray-500">registros totales</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Preparación Física</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{asistenciasPreparacion}</div>
            <p className="text-xs text-gray-500">sesiones L, M, J</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Entrenamientos</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{asistenciasEntrenamiento}</div>
            <p className="text-xs text-gray-500">sesiones viernes</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{promedioAsistencia}%</div>
            <p className="text-xs text-gray-500">últimas 4 semanas</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de asistencia */}
      <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Ranking de Asistencia</CardTitle>
          <CardDescription className="text-gray-600">
            Porcentaje de asistencia por árbitro en las últimas 4 semanas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {arbitrosOrdenados.slice(0, 10).map((stats, index) => (
              <div key={stats.arbitro.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold w-6 text-center ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                            ? "text-gray-600"
                            : index === 2
                              ? "text-amber-600"
                              : "text-gray-500"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {stats.arbitro.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-800">{stats.arbitro.nombre}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
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
                        <span
                          className={`text-sm font-bold ${
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
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Prep. Física: {stats.preparacionFisica}</span>
                      <span>Entrenamientos: {stats.entrenamientos}</span>
                      <span>Total: {stats.totalAsistencias}</span>
                    </div>

                    <Progress value={stats.porcentajeAsistencia} className="mt-2 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis por categoría */}
      <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Análisis por Categoría</CardTitle>
          <CardDescription className="text-gray-600">Promedio de asistencia por categoría de árbitro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["FIFA", "Nacional", "Regional", "Provincial"].map((categoria) => {
              const arbitrosCategoria = arbitrosOrdenados.filter((a) => a.arbitro.categoria === categoria)
              const promedioCategoria =
                arbitrosCategoria.length > 0
                  ? Math.round(
                      arbitrosCategoria.reduce((sum, a) => sum + a.porcentajeAsistencia, 0) / arbitrosCategoria.length,
                    )
                  : 0

              return (
                <div key={categoria} className="text-center p-4 rounded-lg bg-white/50">
                  <Badge
                    variant="outline"
                    className={`mb-2 ${
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
                  <div className="text-2xl font-bold text-gray-800">{promedioCategoria}%</div>
                  <p className="text-xs text-gray-500">{arbitrosCategoria.length} árbitros</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
