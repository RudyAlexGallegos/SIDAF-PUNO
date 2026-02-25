"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

export function RegistroAsistenciaMovil() {
  const { arbitros, asistencias, addAsistencia, removeAsistencia } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)

  const hoy = new Date()
  const esDiaDeActividad = [1, 2, 4, 5].includes(hoy.getDay())

  // Filtrar árbitros por búsqueda
  const arbitrosFiltrados = arbitros.filter((arbitro) =>
    arbitro.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Obtener asistencias de hoy
  const asistenciasHoy = asistencias.filter((a) => {
    const fechaAsistencia = new Date(a.fecha)
    return fechaAsistencia.toDateString() === hoy.toDateString()
  })

  const arbitrosConAsistenciaHoy = new Set(asistenciasHoy.map((a) => a.arbitroId))

  const marcarAsistencia = (arbitroId: string, nombreArbitro: string) => {
    if (!esDiaDeActividad) {
      toast({
        title: "Día no válido",
        description: "Solo se puede registrar asistencia los días L, M, J y V",
        variant: "destructive",
      })
      return
    }

    const tipoActividad = [1, 2, 4].includes(hoy.getDay()) ? "preparacion_fisica" : "entrenamiento"

    addAsistencia({
      arbitroId,
      fecha: hoy.toISOString(),
      presente: true,
      tipoActividad: tipoActividad as "preparacion_fisica" | "entrenamiento",
      observaciones: "",
    })

    setShowConfirmation(arbitroId)
    setTimeout(() => setShowConfirmation(null), 2000)

    toast({
      title: "✅ Asistencia registrada",
      description: `${nombreArbitro} marcado como presente`,
    })
  }

  const desmarcarAsistencia = (arbitroId: string, nombreArbitro: string) => {
    const asistencia = asistenciasHoy.find((a) => a.arbitroId === arbitroId)
    if (asistencia) {
      removeAsistencia(asistencia.id)
      toast({
        title: "❌ Asistencia removida",
        description: `${nombreArbitro} desmarcado`,
      })
    }
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-gray-900 text-center">Pasar Lista de Asistencia</CardTitle>
        <CardDescription className="text-base sm:text-lg text-center">
          Toca el nombre del árbitro para marcar su asistencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Buscador más grande para móvil */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar árbitro por nombre..."
            className="pl-12 sm:pl-14 h-12 sm:h-14 text-base sm:text-lg bg-gray-50 border-2 border-gray-200 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de árbitros optimizada para móvil */}
        <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-[500px] overflow-y-auto">
          {arbitrosFiltrados.map((arbitro) => {
            const tieneAsistencia = arbitrosConAsistenciaHoy.has(arbitro.id)
            const showingConfirmation = showConfirmation === arbitro.id

            return (
              <div
                key={arbitro.id}
                className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                  tieneAsistencia
                    ? "bg-green-50 border-green-300 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                } ${showingConfirmation ? "scale-105 shadow-lg" : ""}`}
              >
                {/* Animación de confirmación */}
                {showingConfirmation && (
                  <div className="absolute inset-0 bg-green-100 rounded-xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-2" />
                      <p className="text-lg sm:text-xl font-bold text-green-800">¡Registrado!</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                      <AvatarFallback
                        className={`text-sm sm:text-base font-bold ${
                          tieneAsistencia ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {arbitro.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg sm:text-xl font-bold truncate ${
                          tieneAsistencia ? "text-green-800" : "text-gray-800"
                        }`}
                      >
                        {arbitro.nombre}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs sm:text-sm ${
                            arbitro.categoria === "FIFA"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : arbitro.categoria === "Nacional"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : arbitro.categoria === "Regional"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {arbitro.categoria}
                        </Badge>
                        <span className="text-xs sm:text-sm text-gray-500">{arbitro.nivelPreparacion}% prep.</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción más grandes */}
                  <div className="flex flex-col space-y-2 sm:space-y-3">
                    {tieneAsistencia ? (
                      <>
                        <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 text-sm sm:text-base">
                          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                          Presente
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => desmarcarAsistencia(arbitro.id, arbitro.nombre)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-10 sm:h-12 px-3 sm:px-4"
                          disabled={!esDiaDeActividad}
                        >
                          <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => marcarAsistencia(arbitro.id, arbitro.nombre)}
                        className="bg-green-600 hover:bg-green-700 text-white h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg font-semibold shadow-md"
                        disabled={!esDiaDeActividad}
                      >
                        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                        Marcar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {arbitrosFiltrados.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg sm:text-xl text-gray-500">No se encontraron árbitros</p>
            <p className="text-sm sm:text-base text-gray-400 mt-2">Intenta con otro término de búsqueda</p>
          </div>
        )}

        {/* Resumen de asistencia */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-xl">
          <div className="text-center">
            <h4 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">Resumen de Hoy</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{arbitrosConAsistenciaHoy.size}</div>
                <p className="text-sm sm:text-base text-blue-700">Presentes</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {arbitros.length - arbitrosConAsistenciaHoy.size}
                </div>
                <p className="text-sm sm:text-base text-blue-700">Ausentes</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
