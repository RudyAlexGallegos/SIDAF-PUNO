/**
 * Componente para administrar equipos participantes en un campeonato
 * Flujo mejorado: Provincia → Distrito → Equipos (sin reseteos)
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, ChevronRight, X, Search, Users, MapPin, Loader2 } from "lucide-react"
import { PROVINCIAS_PUNO, getDistritosByProvincia } from "@/lib/provincias-puno"
import { getEquiposByProvinciaAndDistrito, type Equipo } from "@/services/api"
import { toast } from "@/hooks/use-toast"

interface ElegirEquiposCampeonatoProps {
  equiposSeleccionados?: number[]
  onEquiposChange?: (equipos: number[]) => void
  campeonatoId?: string
}

const MAX_EQUIPOS = 16

export default function ElegirEquiposCampeonato({
  equiposSeleccionados = [],
  onEquiposChange,
  campeonatoId,
}: ElegirEquiposCampeonatoProps) {
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string | null>(null)
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
  const [todosEquipos, setTodosEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [equiposPorDistrito, setEquiposPorDistrito] = useState<Record<string, Equipo[]>>({})

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
      setTodosEquipos([...todosEquipos, ...equipos])
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
    if (equiposSeleccionados.includes(equipoId)) {
      const nuevosEquipos = equiposSeleccionados.filter((id) => id !== equipoId)
      onEquiposChange?.(nuevosEquipos)
    } else if (equiposSeleccionados.length < MAX_EQUIPOS) {
      onEquiposChange?.([...equiposSeleccionados, equipoId])
    } else {
      toast({
        title: "Límite alcanzado",
        description: `Máximo ${MAX_EQUIPOS} equipos por campeonato`,
        variant: "destructive",
      })
    }
  }

  const handleDeselectEquipo = (equipoId: number) => {
    const nuevosEquipos = equiposSeleccionados.filter((id) => id !== equipoId)
    onEquiposChange?.(nuevosEquipos)
  }

  const distritos = provinciaSeleccionada
    ? getDistritosByProvincia(provinciaSeleccionada).map((d) => d.nombre)
    : []

  const equiposFiltrados = useMemo(() => {
    return equiposDisponibles.filter((e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [equiposDisponibles, busqueda])

  const equiposNombresMap = useMemo(() => {
    const map: Record<number, string> = {}
    todosEquipos.forEach(e => {
      if (e.id) map[e.id] = e.nombre
    })
    return map
  }, [todosEquipos])

  const provinciaEquiposCount = useMemo(() => {
    const count: Record<string, number> = {}
    PROVINCIAS_PUNO.forEach(p => {
      count[p.nombre] = equiposSeleccionados.filter(id => {
        const equipo = todosEquipos.find(e => e.id === id)
        return equipo?.provincia === p.nombre
      }).length
    })
    return count
  }, [equiposSeleccionados, todosEquipos])

  return (
    <div className="space-y-6">
      {/* Progreso */}
      <Card className="border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Progreso de Selección</h3>
            </div>
            <span className="text-xl font-bold text-blue-600">{equiposSeleccionados.length}/{MAX_EQUIPOS}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(equiposSeleccionados.length / MAX_EQUIPOS) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección de Provincias */}
      <Card className="border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Paso 1: Seleccionar Provincia
          </CardTitle>
          <CardDescription>Elige una de las 13 provincias de Puno</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PROVINCIAS_PUNO.map((provincia) => {
              const count = provinciaEquiposCount[provincia.nombre] || 0
              return (
                <button
                  key={provincia.codigo}
                  onClick={() => {
                    setProvinciaSeleccionada(provincia.nombre)
                    setDistritoSeleccionado(null)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all font-medium text-sm text-center relative group ${
                    provinciaSeleccionada === provincia.nombre
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-slate-200 bg-white hover:border-blue-300 text-slate-700"
                  }`}
                >
                  {provincia.nombre}
                  {count > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sección de Distritos */}
      {provinciaSeleccionada && (
        <Card className="border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardTitle className="text-lg text-slate-900">
              Paso 2: Seleccionar Distrito
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {provinciaSeleccionada} • {distritos.length} distritos disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ScrollArea className="h-64 w-full rounded-lg border border-slate-200 p-4">
              <div className="space-y-2">
                {distritos.map((distrito) => (
                  <button
                    key={distrito}
                    onClick={() => setDistritoSeleccionado(distrito)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
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
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Paso 3: Seleccionar Equipos
                </CardTitle>
                <CardDescription>
                  {provinciaSeleccionada} • {distritoSeleccionado}
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" disabled={equiposSeleccionados.length >= MAX_EQUIPOS}>
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
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : equiposFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {equiposFiltrados.map((equipo) => {
                  const isSelected = equiposSeleccionados.includes(equipo.id!)
                  const isFull = equiposSeleccionados.length >= MAX_EQUIPOS && !isSelected
                  
                  return (
                    <button
                      key={equipo.id}
                      onClick={() => handleSelectEquipo(equipo.id!)}
                      disabled={isFull}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : isFull
                            ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                            : "border-slate-200 bg-white hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">{equipo.nombre}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {equipo.categoria || "Sin categoría"}
                          </p>
                          {equipo.estadio && (
                            <p className="text-xs text-slate-600 mt-1 truncate">📍 {equipo.estadio}</p>
                          )}
                        </div>
                        <Badge
                          className={`ml-2 flex-shrink-0 ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isSelected ? "✓" : "•"}
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

      {/* Equipos Seleccionados Resumen */}
      {equiposSeleccionados.length > 0 && (
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipos Seleccionados
              </span>
              <span className="text-sm font-normal text-green-700">
                {equiposSeleccionados.length}/{MAX_EQUIPOS}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {equiposSeleccionados.map((equipoId) => (
                <Badge
                  key={equipoId}
                  variant="secondary"
                  className="px-3 py-2 bg-green-200 text-green-900 hover:bg-green-300 transition-colors cursor-pointer group"
                  onClick={() => handleDeselectEquipo(equipoId)}
                >
                  {equiposNombresMap[equipoId] || `Equipo #${equipoId}`}
                  <X className="h-3 w-3 ml-2 group-hover:opacity-100" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
