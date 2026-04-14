/**
 * Componente para administrar equipos participantes en un campeonato
 * Flujo: Provincia → Distrito → Equipos Disponibles
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronRight, X, Search } from "lucide-react"
import { PROVINCIAS_PUNO, getDistritosByProvincia } from "@/lib/provincias-puno"
import { getEquiposByProvinciaAndDistrito, type Equipo } from "@/services/api"
import { toast } from "@/hooks/use-toast"

interface ElegirEquiposCampeonatoProps {
  equiposSeleccionados?: number[]
  onEquiposChange?: (equipos: number[]) => void
  campeonatoId?: string
}

export default function ElegirEquiposCampeonato({
  equiposSeleccionados = [],
  onEquiposChange,
  campeonatoId,
}: ElegirEquiposCampeonatoProps) {
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string | null>(null)
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  // Cargar equipos cuando se selecciona provincia y distrito
  useEffect(() => {
    if (provinciaSeleccionada && distritoSeleccionado) {
      loadEquipos()
    }
  }, [provinciaSeleccionada, distritoSeleccionado])

  const loadEquipos = async () => {
    setLoading(true)
    try {
      const equipos = await getEquiposByProvinciaAndDistrito(
        provinciaSeleccionada!,
        distritoSeleccionado!
      )
      setEquiposDisponibles(equipos)
    } catch (error) {
      console.error("Error cargando equipos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEquipo = (equipoId: number) => {
    const nuevosEquipos = equiposSeleccionados.includes(equipoId)
      ? equiposSeleccionados.filter((id) => id !== equipoId)
      : [...equiposSeleccionados, equipoId]

    onEquiposChange?.(nuevosEquipos)
  }

  const handleDeselectEquipo = (equipoId: number) => {
    const nuevosEquipos = equiposSeleccionados.filter((id) => id !== equipoId)
    onEquiposChange?.(nuevosEquipos)
  }

  const distritos = provinciaSeleccionada
    ? getDistritosByProvincia(provinciaSeleccionada).map((d) => d.nombre)
    : []

  const equiposFiltrados = equiposDisponibles.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Sección de Provincias */}
      <Card className="border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-lg text-slate-900">Paso 1: Seleccionar Provincia</CardTitle>
          <CardDescription>Elige una de las 13 provincias de Puno</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PROVINCIAS_PUNO.map((provincia) => (
              <button
                key={provincia.codigo}
                onClick={() => {
                  setProvinciaSeleccionada(provincia.nombre)
                  setDistritoSeleccionado(null)
                  setEquiposDisponibles([])
                  setBusqueda("")
                }}
                className={`p-3 rounded-lg border-2 transition-all font-medium text-sm text-center ${
                  provinciaSeleccionada === provincia.nombre
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-300 text-slate-700"
                }`}
              >
                {provincia.nombre}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Distritos */}
      {provinciaSeleccionada && (
        <Card className="border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardTitle className="text-lg text-slate-900">
              Paso 2: Seleccionar Distrito de {provinciaSeleccionada}
            </CardTitle>
            <CardDescription>{distritos.length} distritos disponibles</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-64 w-full rounded-lg border border-slate-200 p-4">
              <div className="space-y-2">
                {distritos.map((distrito) => (
                  <button
                    key={distrito}
                    onClick={() => setDistritoSeleccionado(distrito)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      distritoSeleccionado === distrito
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{distrito}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Sección de Equipos */}
      {distritoSeleccionado && (
        <Card className="border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  Paso 3: Seleccionar Equipos
                </CardTitle>
                <CardDescription>
                  {provinciaSeleccionada} • {distritoSeleccionado} • {equiposFiltrados.length}{" "}
                  equipo{equiposFiltrados.length !== 1 ? "s" : ""} disponible
                  {equiposFiltrados.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/campeonatos/equipos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Equipo
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar equipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : equiposFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">
                  {equiposDisponibles.length === 0
                    ? "No hay equipos en este distrito"
                    : "No se encontraron equipos que coincidan"}
                </p>
                {equiposDisponibles.length === 0 && (
                  <Button asChild size="sm">
                    <Link href="/dashboard/campeonatos/equipos/nuevo">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Equipo
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {equiposFiltrados.map((equipo) => {
                  const isSelected = equiposSeleccionados.includes(equipo.id!)
                  return (
                    <button
                      key={equipo.id}
                      onClick={() => handleSelectEquipo(equipo.id!)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{equipo.nombre}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {equipo.categoria || "Sin categoría"}
                          </p>
                          {equipo.estadio && (
                            <p className="text-xs text-slate-600 mt-1">📍 {equipo.estadio}</p>
                          )}
                        </div>
                        <Badge
                          className={
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }
                        >
                          {isSelected ? "✓ Seleccionado" : "Disponible"}
                        </Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipos Seleccionados */}
      {equiposSeleccionados.length > 0 && (
        <Card className="border border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">
              Equipos Seleccionados ({equiposSeleccionados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {equiposSeleccionados.map((equipoId) => {
                const equipo = equiposDisponibles.find((e) => e.id === equipoId)
                const equipoName = equipo?.nombre || `Equipo #${equipoId}`
                return (
                  <Badge key={equipoId} variant="secondary" className="px-3 py-2">
                    {equipoName}
                    <button
                      onClick={() => handleDeselectEquipo(equipoId)}
                      className="ml-2 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
