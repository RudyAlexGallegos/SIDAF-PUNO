"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Users, Clock } from "lucide-react"
import { useDataStore } from "@/lib/data-store"

export function AsistenciaResumen() {
  const { arbitros, asistencias } = useDataStore()

  // Obtener fecha actual y calcular rangos
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // Lunes de esta semana

  // Filtrar asistencias de esta semana
  const asistenciasEstaSemana = asistencias.filter((a) => {
    const fechaAsistencia = new Date(a.fecha)
    return fechaAsistencia >= inicioSemana && fechaAsistencia <= hoy
  })

  // Calcular estadísticas por día de la semana
  const diasActividad = [
    { dia: "Lunes", numero: 1, tipo: "Preparación Física", color: "blue" },
    { dia: "Martes", numero: 2, tipo: "Preparación Física", color: "blue" },
    { dia: "Jueves", numero: 4, tipo: "Preparación Física", color: "blue" },
    { dia: "Viernes", numero: 5, tipo: "Entrenamiento", color: "green" },
  ]

  const estadisticasPorDia = diasActividad.map((diaInfo) => {
    const fechaDia = new Date(inicioSemana)
    fechaDia.setDate(inicioSemana.getDate() + diaInfo.numero - 1)

    const asistenciasDia = asistenciasEstaSemana.filter((a) => {
      const fechaAsistencia = new Date(a.fecha)
      return fechaAsistencia.toDateString() === fechaDia.toDateString()
    })

    const porcentajeAsistencia = arbitros.length > 0 ? Math.round((asistenciasDia.length / arbitros.length) * 100) : 0

    return {
      ...diaInfo,
      fecha: fechaDia,
      asistencias: asistenciasDia.length,
      porcentaje: porcentajeAsistencia,
      yaOcurrio: fechaDia <= hoy,
    }
  })

  // Calcular tendencia semanal
  const totalAsistenciasPosibles = arbitros.length * 4 // 4 días de actividad
  const totalAsistenciasReales = asistenciasEstaSemana.length
  const porcentajeSemanal =
    totalAsistenciasPosibles > 0 ? Math.round((totalAsistenciasReales / totalAsistenciasPosibles) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalAsistenciasReales}</div>
            <p className="text-xs text-gray-500">de {totalAsistenciasPosibles} posibles</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Porcentaje Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{porcentajeSemanal}%</div>
            <p className="text-xs text-gray-500">asistencia promedio</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Días Activos</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">4</div>
            <p className="text-xs text-gray-500">L, M, J, V</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Árbitros Activos</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {new Set(asistenciasEstaSemana.map((a) => a.arbitroId)).size}
            </div>
            <p className="text-xs text-gray-500">participaron esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Asistencia por Día de la Semana</CardTitle>
          <CardDescription className="text-gray-600">
            Seguimiento de asistencia para cada día de actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticasPorDia.map((dia) => (
              <div key={dia.dia} className="flex items-center gap-4 p-4 rounded-lg bg-white/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-center min-w-[80px]">
                    <p className="font-medium text-gray-800">{dia.dia}</p>
                    <p className="text-xs text-gray-500">
                      {dia.fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`${
                      dia.color === "blue"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {dia.tipo}
                  </Badge>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {dia.asistencias} / {arbitros.length} árbitros
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          dia.porcentaje >= 80
                            ? "text-green-600"
                            : dia.porcentaje >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {dia.porcentaje}%
                      </span>
                    </div>
                    <Progress value={dia.porcentaje} className="h-2" />
                  </div>

                  <div className="text-right min-w-[60px]">
                    {dia.yaOcurrio ? (
                      <Badge
                        className={
                          dia.porcentaje >= 80 ? "bg-green-500" : dia.porcentaje >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }
                      >
                        {dia.porcentaje >= 80 ? "Excelente" : dia.porcentaje >= 60 ? "Bueno" : "Bajo"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
