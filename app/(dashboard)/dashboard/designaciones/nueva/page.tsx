"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Trophy, Users, Save, Zap, Calendar, MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useDataStore } from "@/lib/data-store"
import { designarArbitrosMejorado } from "@/lib/algoritmo-designacion-mejorado"
import { toast } from "@/hooks/use-toast"

export default function NuevaDesignacionPage() {
  const router = useRouter()
  const { arbitros, campeonatos, equipos, addDesignacion, asistencias, loadData } = useDataStore()

  const [designacionMode, setDesignacionMode] = useState<"manual" | "automatica">("automatica")
  const [arbitrosSeleccionados, setArbitrosSeleccionados] = useState<{
    principal: string
    asistente1: string
    asistente2: string
    cuarto: string
  }>({
    principal: "",
    asistente1: "",
    asistente2: "",
    cuarto: "",
  })

  const [partidoData, setPartidoData] = useState({
    campeonatoId: "",
    equipoLocal: "",
    equipoVisitante: "",
    fecha: "",
    hora: "20:00",
    estadio: "",
  })

  const [designacionAutomatica, setDesignacionAutomatica] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadData()

    // Establecer fecha por defecto (mañana)
    const mañana = new Date()
    mañana.setDate(mañana.getDate() + 1)
    setPartidoData((prev) => ({
      ...prev,
      fecha: mañana.toISOString().split("T")[0],
    }))
  }, [loadData])

  // Usar equipos reales de la base de datos, o caer en equipos por defecto
  const equiposDisponibles = equipos.length > 0 ? equipos : [
    { id: "default-1", nombre: "Real Puno", provincia: "Puno" },
    { id: "default-2", nombre: "Sportivo Juliaca", provincia: "San Román" },
    { id: "default-3", nombre: "Carlos IV", provincia: "Puno" },
    { id: "default-4", nombre: "Unión Puno", provincia: "Puno" },
    { id: "default-5", nombre: "Deportivo Azángaro", provincia: "Azángaro" },
    { id: "default-6", nombre: "Estudiantes de Lampa", provincia: "Lampa" },
  ]

  const handleGenerarDesignacionAutomatica = () => {
    if (!partidoData.campeonatoId) {
      toast({
        title: "❌ Error",
        description: "Selecciona un campeonato primero",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const campeonato = Campeonatos.find((c) => c.id === partidoData.campeonatoId)
      if (!campeonato) {
        throw new Error("Campeonato no encontrado")
      }

      // Crear objeto partido temporal para el algoritmo
      const partidoTemp = {
        id: "temp",
        campeonatoId: partidoData.campeonatoId,
        equipoLocal: partidoData.equipoLocal,
        equipoVisitante: partidoData.equipoVisitante,
        fecha: new Date(partidoData.fecha).toISOString(),
        estadio: partidoData.estadio,
      }

      // Filtrar árbitros disponibles
      const arbitrosDisponibles = arbitros.filter((a) => a.disponible)

      const designacion = designarArbitrosMejorado(partidoTemp, campeonato, arbitrosDisponibles, asistencias)

      if (designacion) {
        setDesignacionAutomatica(designacion)
        toast({
          title: "✅ Designación generada",
          description: "El sistema ha seleccionado los mejores árbitros disponibles",
        })
      } else {
        toast({
          title: "❌ No se pudo generar",
          description: "No hay suficientes árbitros disponibles que cumplan los requisitos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar la designación automática",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDesignacion = async () => {
    // Validar datos del partido
    if (
      !partidoData.campeonatoId ||
      !partidoData.equipoLocal ||
      !partidoData.equipoVisitante ||
      !partidoData.fecha ||
      !partidoData.estadio
    ) {
      toast({
        title: "❌ Error",
        description: "Completa todos los datos del partido",
        variant: "destructive",
      })
      return
    }

    if (partidoData.equipoLocal === partidoData.equipoVisitante) {
      toast({
        title: "❌ Error",
        description: "Los equipos local y visitante deben ser diferentes",
        variant: "destructive",
      })
      return
    }

    // Validar árbitros seleccionados
    const arbitrosResult: { principal: string; asistente1: string; asistente2: string; cuartoArbitro: string } = {
      principal: "",
      asistente1: "",
      asistente2: "",
      cuartoArbitro: "",
    }

    if (designacionMode === "automatica") {
      if (!designacionAutomatica) {
        toast({
          title: "❌ Error",
          description: "Genera primero la designación automática",
          variant: "destructive",
        })
        return
      }
      arbitrosResult.principal = designacionAutomatica.arbitroPrincipal
      arbitrosResult.asistente1 = designacionAutomatica.arbitroAsistente1
      arbitrosResult.asistente2 = designacionAutomatica.arbitroAsistente2
      arbitrosResult.cuartoArbitro = designacionAutomatica.cuartoArbitro
    } else {
      if (
        !arbitrosSeleccionados.principal ||
        !arbitrosSeleccionados.asistente1 ||
        !arbitrosSeleccionados.asistente2 ||
        !arbitrosSeleccionados.cuarto
      ) {
        toast({
          title: "❌ Error",
          description: "Selecciona todos los árbitros requeridos",
          variant: "destructive",
        })
        return
      }

      // Verificar que no se repitan árbitros
      const arbitrosUnicos = new Set([
        arbitrosSeleccionados.principal,
        arbitrosSeleccionados.asistente1,
        arbitrosSeleccionados.asistente2,
        arbitrosSeleccionados.cuarto,
      ])

      if (arbitrosUnicos.size !== 4) {
        toast({
          title: "❌ Error",
          description: "No puedes asignar el mismo árbitro a múltiples posiciones",
          variant: "destructive",
        })
        return
      }

      arbitrosResult.principal = arbitrosSeleccionados.principal
      arbitrosResult.asistente1 = arbitrosSeleccionados.asistente1
      arbitrosResult.asistente2 = arbitrosSeleccionados.asistente2
      arbitrosResult.cuartoArbitro = arbitrosSeleccionados.cuarto
    }

    setIsSaving(true)

    try {
      // Crear la designación
      addDesignacion({
        partidoId: `partido-${Date.now()}`,
        campeonatoId: partidoData.campeonatoId,
        equipoLocal: partidoData.equipoLocal,
        equipoVisitante: partidoData.equipoVisitante,
        fecha: `${partidoData.fecha}T${partidoData.hora}:00.000Z`,
        estadio: partidoData.estadio,
        arbitroPrincipal: arbitrosResult.principal,
        arbitroAsistente1: arbitrosResult.asistente1,
        arbitroAsistente2: arbitrosResult.asistente2,
        cuartoArbitro: arbitrosResult.cuartoArbitro,
        fechaDesignacion: new Date().toISOString(),
      })

      toast({
        title: "✅ Designación guardada",
        description: `Partido ${partidoData.equipoLocal} vs ${partidoData.equipoVisitante} designado exitosamente`,
      })

      // Redirigir al listado de designaciones
      router.push("/dashboard/designaciones")
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo guardar la designación",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleArbitroSelection = (posicion: string, arbitroId: string) => {
    setArbitrosSeleccionados((prev) => ({
      ...prev,
      [posicion]: arbitroId,
    }))
  }

  const getArbitroInfo = (arbitroId: string) => {
    return arbitros.find((a) => a.id === arbitroId)
  }

  const calcularAsistencia = (arbitroId: string) => {
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)

    const asistenciasRecientes = asistencias.filter(
      (a) => a.arbitroId === arbitroId && new Date(a.fecha) >= hace4Semanas && a.presente,
    )

    return Math.min(100, Math.round((asistenciasRecientes.length / 16) * 100))
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "FIFA": return "bg-gradient-to-r from-yellow-400 to-amber-500"
      case "Nacional": return "bg-gradient-to-r from-blue-500 to-indigo-500"
      case "Regional": return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "Provincial": return "bg-gradient-to-r from-purple-500 to-pink-500"
      default: return "bg-gradient-to-r from-slate-400 to-slate-500"
    }
  }

  // Tipos temporales para evitar errores
  type Campeonato = {
    id: string
    nombre: string
    nivelDificultad: "Alto" | "Medio" | "Bajo"
    categoria: string
    equipos: number
  }

  const Campeonatos: Campeonato[] = [{ id: "1", nombre: "Campeonato de Ejemplo", nivelDificultad: "Medio" as const, categoria: "Primera", equipos: 10 }]

  const arbitrosDisponibles = arbitros.filter((a) => a.disponible)
  const campeonatoSeleccionado = Campeonatos.find((c) => c.id === partidoData.campeonatoId)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/designaciones" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="h-6 w-px bg-slate-300" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Nueva Designación</h1>
              <p className="text-slate-500">Asignar árbitros a un partido</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <Label htmlFor="auto-mode" className="text-sm font-medium">
              {designacionMode === "automatica" ? "🤖 Automática" : "👤 Manual"}
            </Label>
            <Switch
              id="auto-mode"
              checked={designacionMode === "automatica"}
              onCheckedChange={(checked) => setDesignacionMode(checked ? "automatica" : "manual")}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Partido */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información del Partido
            </CardTitle>
            <CardDescription className="text-purple-100">
              Complete los datos del encuentro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="campeonato">Campeonato *</Label>
              <Select
                value={partidoData.campeonatoId}
                onValueChange={(value) => setPartidoData((prev) => ({ ...prev, campeonatoId: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleccionar campeonato" />
                </SelectTrigger>
                <SelectContent>
                  {Campeonatos.map((campeonato) => (
                    <SelectItem key={campeonato.id} value={campeonato.id}>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          campeonato.nivelDificultad === "Alto"
                            ? "bg-red-500"
                            : campeonato.nivelDificultad === "Medio"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }>
                          {campeonato.nivelDificultad}
                        </Badge>
                        <span>{campeonato.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipo-local">Equipo Local *</Label>
                <Select
                  value={partidoData.equipoLocal}
                  onValueChange={(value) => setPartidoData((prev) => ({ ...prev, equipoLocal: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Equipo local" />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposDisponibles.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.nombre} disabled={equipo.nombre === partidoData.equipoVisitante}>
                        {equipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="equipo-visitante">Equipo Visitante *</Label>
                <Select
                  value={partidoData.equipoVisitante}
                  onValueChange={(value) => setPartidoData((prev) => ({ ...prev, equipoVisitante: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Equipo visitante" />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposDisponibles.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.nombre} disabled={equipo.nombre === partidoData.equipoLocal}>
                        {equipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha del Partido *</Label>
                <Input
                  id="fecha"
                  type="date"
                  className="mt-2"
                  value={partidoData.fecha}
                  onChange={(e) => setPartidoData((prev) => ({ ...prev, fecha: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="hora">Hora del Partido</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <Input
                    id="hora"
                    type="time"
                    value={partidoData.hora}
                    onChange={(e) => setPartidoData((prev) => ({ ...prev, hora: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="estadio">Estadio *</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="estadio"
                  placeholder="Nombre del estadio"
                  className="pl-10"
                  value={partidoData.estadio}
                  onChange={(e) => setPartidoData((prev) => ({ ...prev, estadio: e.target.value }))}
                />
              </div>
            </div>

            {campeonatoSeleccionado && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">
                    {campeonatoSeleccionado.nombre} - Nivel {campeonatoSeleccionado.nivelDificultad}
                  </span>
                </div>
                <p className="text-sm text-purple-700">
                  {campeonatoSeleccionado.nivelDificultad === "Alto" && "Requiere árbitros FIFA o Nacionales con alta preparación"}
                  {campeonatoSeleccionado.nivelDificultad === "Medio" && "Requiere árbitros con buena preparación y asistencia regular"}
                  {campeonatoSeleccionado.nivelDificultad === "Bajo" && "Apto para árbitros de todas las categorías"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Designación de Árbitros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Designación de Árbitros
            </CardTitle>
            <CardDescription className="text-purple-100">
              {designacionMode === "automatica"
                ? "El sistema seleccionará automáticamente los mejores árbitros"
                : "Selecciona manualmente los árbitros para cada posición"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {designacionMode === "automatica" ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Button
                    onClick={handleGenerarDesignacionAutomatica}
                    disabled={isGenerating || !partidoData.campeonatoId}
                    className="h-12 px-8 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Generando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        <span>Generar Designación Automática</span>
                      </div>
                    )}
                  </Button>
                </div>

                {designacionAutomatica && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Badge className="bg-green-500">✅ Designación Generada</Badge>
                    </div>

                    {[
                      { role: "Árbitro Principal", id: designacionAutomatica.arbitroPrincipal, color: "from-green-400 to-emerald-500" },
                      { role: "Asistente 1", id: designacionAutomatica.arbitroAsistente1, color: "from-blue-400 to-indigo-500" },
                      { role: "Asistente 2", id: designacionAutomatica.arbitroAsistente2, color: "from-blue-400 to-indigo-500" },
                      { role: "Cuarto Árbitro", id: designacionAutomatica.cuartoArbitro, color: "from-purple-400 to-pink-500" },
                    ].map((arbitro) => {
                      const info = getArcritoInfo(arbitro.id)
                      return (
                        <div key={arbitro.role} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${arbitro.color} flex items-center justify-center`}>
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">{arbitro.role}</p>
                              <p className="font-semibold text-slate-900">{info?.nombre || "N/A"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getCategoriaColor(info?.categoria || "")} text-white`}>
                              {info?.categoria || "N/A"}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">
                              {calcularAsistencia(arbitro.id)}% asistencia
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "principal", label: "Árbitro Principal", color: "green" },
                  { key: "asistente1", label: "Asistente 1", color: "blue" },
                  { key: "asistente2", label: "Asistente 2", color: "blue" },
                  { key: "cuarto", label: "Cuarto Árbitro", color: "purple" },
                ].map((posicion) => (
                  <div key={posicion.key} className="space-y-2">
                    <Label>{posicion.label}</Label>
                    <Select
                      value={arbitrosSeleccionados[posicion.key as keyof typeof arbitrosSeleccionados]}
                      onValueChange={(value) => handleArbitroSelection(posicion.key, value)}
                    >
                      <SelectTrigger className={`border-${posicion.color}-200 focus:border-${posicion.color}-400`}>
                        <SelectValue placeholder="Seleccionar árbitro" />
                      </SelectTrigger>
                      <SelectContent>
                        {arbitrosDisponibles.map((arbitro) => (
                          <SelectItem key={arbitro.id} value={arbitro.id}>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getCategoriaColor(arbitro.categoria)} text-white text-xs`}>
                                {arbitro.categoria}
                              </Badge>
                              <span>{arbitro.nombre}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Botón de guardado */}
            <div className="pt-6 border-t border-slate-200">
              <Button
                onClick={handleSaveDesignacion}
                disabled={isSaving || (!designacionAutomatica && designacionMode === "automatica")}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white text-lg shadow-lg shadow-purple-500/30"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>Guardar Designación</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function
function getArcritoInfo(id: string) {
  const store = useDataStore.getState()
  return store.arbitros.find((a) => a.id === id)
}
