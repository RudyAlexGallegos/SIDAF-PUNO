"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCheck, Users, Calendar, Clock } from "lucide-react"
import { RegistroAsistenciaMovil } from "@/components/registro-asistencia-movil"
import { useDataStore } from "@/lib/data-store"

export default function AsistenciaPage() {
  const { arbitros, asistencias, loadData } = useDataStore()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    loadData()
  }, [loadData])

  const hoy = new Date()
  const esDiaDeActividad = [1, 2, 4, 5].includes(hoy.getDay())

  // Obtener asistencias de hoy
  const asistenciasHoy = asistencias.filter((a) => {
    const fechaAsistencia = new Date(a.fecha)
    return fechaAsistencia.toDateString() === hoy.toDateString()
  })

  const arbitrosConAsistenciaHoy = new Set(asistenciasHoy.map((a) => a.arbitroId)).size
  const porcentajeAsistenciaHoy =
    arbitros.length > 0 ? Math.round((arbitrosConAsistenciaHoy / arbitros.length) * 100) : 0

  const tipoActividad = [1, 2, 4].includes(hoy.getDay())
    ? "Preparación Física"
    : hoy.getDay() === 5
      ? "Entrenamiento"
      : "Sin Actividad"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <header className="bg-white shadow-sm border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Control de Asistencia</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Información del día - más prominente */}
        <Card className="bg-white shadow-lg mb-6 sm:mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl text-gray-900">{tipoActividad}</CardTitle>
            <CardDescription className="text-lg sm:text-xl">
              {esDiaDeActividad ? "18:00 - 20:00" : "No hay actividad programada"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl">
                <UserCheck className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2" />
                <div className="text-2xl sm:text-4xl font-bold text-green-600">{arbitrosConAsistenciaHoy}</div>
                <p className="text-sm sm:text-base text-green-700 font-medium">Presentes</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-xl">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl sm:text-4xl font-bold text-blue-600">{arbitros.length}</div>
                <p className="text-sm sm:text-base text-blue-700 font-medium">Total Árbitros</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-xl">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl sm:text-4xl font-bold text-purple-600">{porcentajeAsistenciaHoy}%</div>
                <p className="text-sm sm:text-base text-purple-700 font-medium">Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de la actividad */}
        {!esDiaDeActividad && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6 sm:mb-8">
            <CardContent className="text-center py-6 sm:py-8">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-2">No hay actividad hoy</h3>
              <p className="text-base sm:text-lg text-yellow-700">
                Las actividades son: Lunes, Martes y Jueves (Preparación Física), Viernes (Entrenamiento)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Registro de asistencia optimizado para móvil */}
        {esDiaDeActividad && <RegistroAsistenciaMovil />}

        {/* Acciones adicionales */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 mt-6 sm:mt-8">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-16 sm:h-20 text-lg sm:text-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link href="/asistencia/estadisticas" className="flex flex-col items-center space-y-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              <span>Ver Estadísticas</span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-16 sm:h-20 text-lg sm:text-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Link href="/asistencia/calendario" className="flex flex-col items-center space-y-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              <span>Ver Calendario</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
