"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, UserCheck, UserX, Clock } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

export function RegistroAsistencia() {
  const { arbitros, asistencias, addAsistencia, removeAsistencia } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")

  const hoy = new Date()
  const esDiaDeActividad = [1, 2, 4, 5].includes(hoy.getDay()) // Lunes, Martes, Jueves, Viernes

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

  const marcarAsistencia = (arbitroId: string) => {
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

    toast({
      title: "Asistencia registrada",
      description: "La asistencia ha sido marcada correctamente",
    })
  }

  const desmarcarAsistencia = (arbitroId: string) => {
    const asistencia = asistenciasHoy.find((a) => a.arbitroId === arbitroId)
    if (asistencia) {
      removeAsistencia(asistencia.id)
      toast({
        title: "Asistencia removida",
        description: "La asistencia ha sido desmarcada",
      })
    }
  }

  return (
    <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Registro de Asistencia Diaria
        </CardTitle>
        <CardDescription className="text-gray-600">
          {esDiaDeActividad
            ? `Registra la asistencia para ${[1, 2, 4].includes(hoy.getDay()) ? "preparación física" : "entrenamiento"} de hoy`
            : "Hoy no hay actividades programadas"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar árbitro..."
              className="pl-8 bg-white/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge
            variant="outline"
            className={
              esDiaDeActividad
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }
          >
            {esDiaDeActividad
              ? [1, 2, 4].includes(hoy.getDay())
                ? "Preparación Física"
                : "Entrenamiento"
              : "Sin Actividad"}
          </Badge>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {arbitrosFiltrados.map((arbitro) => {
            const tieneAsistencia = arbitrosConAsistenciaHoy.has(arbitro.id)

            return (
              <div
                key={arbitro.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  tieneAsistencia ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={tieneAsistencia ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                    >
                      {arbitro.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-medium ${tieneAsistencia ? "text-green-800" : "text-gray-800"}`}>
                      {arbitro.nombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
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
                      <span className="text-xs text-gray-500">{arbitro.nivelPreparacion}% preparación</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {tieneAsistencia ? (
                    <>
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Presente
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => desmarcarAsistencia(arbitro.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={!esDiaDeActividad}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => marcarAsistencia(arbitro.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={!esDiaDeActividad}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Marcar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {arbitrosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron árbitros</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
