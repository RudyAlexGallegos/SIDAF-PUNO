"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Trophy, Users, Save, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useDataStore } from "@/lib/data-store"
import { designarArbitrosMejorado } from "@/lib/algoritmo-designacion-mejorado"
import { toast } from "@/hooks/use-toast"

export default function NuevaDesignacionPage() {
  const router = useRouter()
  const { arbitros, campeonatos, addDesignacion, asistencias, loadData } = useDataStore()

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

  const equiposDisponibles = [
    "FC Barcelona",
    "Real Madrid",
    "Atlético Madrid",
    "Sevilla FC",
    "Valencia CF",
    "Villarreal",
    "Real Sociedad",
    "Athletic Bilbao",
    "Real Betis",
    "Celta de Vigo",
    "Espanyol",
    "Getafe CF",
  ]

  const handleGenerarDesignacionAutomatica = () => {
    if (!partidoData.campeonatoId) {
      toast({
        title: "Error",
        description: "Selecciona un campeonato primero",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const campeonato = campeonatos.find((c) => c.id === partidoData.campeonatoId)
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
        title: "Error",
        description: "Completa todos los datos del partido",
        variant: "destructive",
      })
      return
    }

    if (partidoData.equipoLocal === partidoData.equipoVisitante) {
      toast({
        title: "Error",
        description: "Los equipos local y visitante deben ser diferentes",
        variant: "destructive",
      })
      return
    }

    // Validar árbitros seleccionados
    let arbitrosParaGuardar
    if (designacionMode === "automatica") {
      if (!designacionAutomatica) {
        toast({
          title: "Error",
          description: "Genera primero la designación automática",
          variant: "destructive",
        })
        return
      }
      arbitrosParaGuardar = {
        principal: designacionAutomatica.arbitroPrincipal,
        asistente1: designacionAutomatica.arbitroAsistente1,
        asistente2: designacionAutomatica.arbitroAsistente2,
        cuarto: designacionAutomatica.cuartoArbitro,
      }
    } else {
      if (
        !arbitrosSeleccionados.principal ||
        !arbitrosSeleccionados.asistente1 ||
        !arbitrosSeleccionados.asistente2 ||
        !arbitrosSeleccionados.cuarto
      ) {
        toast({
          title: "Error",
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
          title: "Error",
          description: "No puedes asignar el mismo árbitro a múltiples posiciones",
          variant: "destructive",
        })
        return
      }

      arbitrosParaGuardar = arbitrosSeleccionados
    }

    setIsSaving(true)

    try {
      const campeonato = campeonatos.find((c) => c.id === partidoData.campeonatoId)

      // Crear la designación
      addDesignacion({
        partidoId: `partido-${Date.now()}`,
        campeonatoId: partidoData.campeonatoId,
        equipoLocal: partidoData.equipoLocal,
        equipoVisitante: partidoData.equipoVisitante,
        fecha: `${partidoData.fecha}T${partidoData.hora}:00.000Z`,
        estadio: partidoData.estadio,
        arbitroPrincipal: arbitrosParaGuardar.principal,
        arbitroAsistente1: arbitrosParaGuardar.asistente1,
        arbitroAsistente2: arbitrosParaGuardar.asistente2,
        cuartoArbitro: arbitrosParaGuardar.cuarto,
        fechaDesignacion: new Date().toISOString(),
      })

      toast({
        title: "✅ Designación guardada",
        description: `Partido ${partidoData.equipoLocal} vs ${partidoData.equipoVisitante} designado exitosamente`,
      })

      // Redirigir al listado de designaciones
      router.push("/designaciones")
    } catch (error) {
      toast({
        title: "Error",
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

  const arbitrosDisponibles = arbitros.filter((a) => a.disponible)
  const campeonatoSeleccionado = campeonatos.find((c) => c.id === partidoData.campeonatoId)

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nueva Designación</h1>
              <p className="text-sm sm:text-base text-gray-600">Asignar árbitros a partido</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Selector de modo */}
        <Card className="bg-white shadow-md mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Modo de Designación</CardTitle>
                <CardDescription>Elige cómo asignar los árbitros al partido</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <Label htmlFor="auto-mode" className="text-base font-medium">
                  {designacionMode === "automatica" ? "Automática" : "Manual"}
                </Label>
                <Switch
                  id="auto-mode"
                  checked={designacionMode === "automatica"}
                  onCheckedChange={(checked) => setDesignacionMode(checked ? "automatica" : "manual")}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información del Partido */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-purple-600" />
                <span>Información del Partido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {campeonatos.map((campeonato) => (
                      <SelectItem key={campeonato.id} value={campeonato.id}>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={
                              campeonato.nivelDificultad === "Alto"
                                ? "bg-red-50 text-red-700"
                                : campeonato.nivelDificultad === "Medio"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-green-50 text-green-700"
                            }
                          >
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
                        <SelectItem key={equipo} value={equipo} disabled={equipo === partidoData.equipoVisitante}>
                          {equipo}
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
                        <SelectItem key={equipo} value={equipo} disabled={equipo === partidoData.equipoLocal}>
                          {equipo}
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
                    <Clock className="h-4 w-4 text-gray-400" />
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
                <Input
                  id="estadio"
                  placeholder="Nombre del estadio"
                  className="mt-2"
                  value={partidoData.estadio}
                  onChange={(e) => setPartidoData((prev) => ({ ...prev, estadio: e.target.value }))}
                />
              </div>

              {campeonatoSeleccionado && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      {campeonatoSeleccionado.nombre} - Nivel {campeonatoSeleccionado.nivelDificultad}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {campeonatoSeleccionado.nivelDificultad === "Alto" &&
                      "Requiere árbitros FIFA o Nacionales con alta preparación y asistencia"}
                    {campeonatoSeleccionado.nivelDificultad === "Medio" &&
                      "Requiere árbitros con buena preparación y asistencia regular"}
                    {campeonatoSeleccionado.nivelDificultad === "Bajo" && "Apto para árbitros de todas las categorías"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Designación de Árbitros */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <span>Designación de Árbitros</span>
              </CardTitle>
              <CardDescription>
                {designacionMode === "automatica"
                  ? "El sistema seleccionará automáticamente los mejores árbitros"
                  : "Selecciona manualmente los árbitros para cada posición"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {designacionMode === "automatica" ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <Button
                      onClick={handleGenerarDesignacionAutomatica}
                      disabled={isGenerating || !partidoData.campeonatoId}
                      className="h-12 px-8 text-lg bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Generando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5" />
                          <span>Generar Designación Automática</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {designacionAutomatica && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-800 text-center">✅ Designación Generada</h3>

                      {[
                        {
                          role: "Árbitro Principal",
                          id: designacionAutomatica.arbitroPrincipal,
                          color: "bg-green-500",
                        },
                        { role: "Asistente 1", id: designacionAutomatica.arbitroAsistente1, color: "bg-blue-500" },
                        { role: "Asistente 2", id: designacionAutomatica.arbitroAsistente2, color: "bg-blue-500" },
                        { role: "Cuarto Árbitro", id: designacionAutomatica.cuartoArbitro, color: "bg-purple-500" },
                      ].map((item, index) => {
                        const arbitro = getArbitroInfo(item.id)
                        const asistencia = calcularAsistencia(item.id)

                        return arbitro ? (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {arbitro.nombre
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{arbitro.nombre}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={
                                      arbitro.categoria === "FIFA"
                                        ? "bg-green-50 text-green-700"
                                        : arbitro.categoria === "Nacional"
                                          ? "bg-blue-50 text-blue-700"
                                          : arbitro.categoria === "Regional"
                                            ? "bg-purple-50 text-purple-700"
                                            : "bg-orange-50 text-orange-700"
                                    }
                                  >
                                    {arbitro.categoria}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {arbitro.nivelPreparacion}% prep. | {asistencia}% asist.
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className={item.color}>{item.role}</Badge>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Tabs defaultValue="principal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="principal">Principal</TabsTrigger>
                    <TabsTrigger value="asistente1">Asistente 1</TabsTrigger>
                    <TabsTrigger value="asistente2">Asistente 2</TabsTrigger>
                    <TabsTrigger value="cuarto">Cuarto</TabsTrigger>
                  </TabsList>

                  {["principal", "asistente1", "asistente2", "cuarto"].map((posicion) => (
                    <TabsContent key={posicion} value={posicion} className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Seleccionar{" "}
                        {posicion === "principal"
                          ? "Árbitro Principal"
                          : posicion === "asistente1"
                            ? "Primer Asistente"
                            : posicion === "asistente2"
                              ? "Segundo Asistente"
                              : "Cuarto Árbitro"}
                      </h3>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {arbitrosDisponibles.map((arbitro) => {
                          const asistencia = calcularAsistencia(arbitro.id)
                          const isSelected =
                            arbitrosSeleccionados[posicion as keyof typeof arbitrosSeleccionados] === arbitro.id
                          const isUsed = Object.values(arbitrosSeleccionados).includes(arbitro.id) && !isSelected

                          return (
                            <div
                              key={arbitro.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-purple-500 bg-purple-50"
                                  : isUsed
                                    ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                                    : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => !isUsed && handleArbitroSelection(posicion, arbitro.id)}
                            >
                              <div className="flex items-center space-x-4">
                                <Avatar>
                                  <AvatarFallback>
                                    {arbitro.nombre
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{arbitro.nombre}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        arbitro.categoria === "FIFA"
                                          ? "bg-green-50 text-green-700"
                                          : arbitro.categoria === "Nacional"
                                            ? "bg-blue-50 text-blue-700"
                                            : arbitro.categoria === "Regional"
                                              ? "bg-purple-50 text-purple-700"
                                              : "bg-orange-50 text-orange-700"
                                      }
                                    >
                                      {arbitro.categoria}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {arbitro.nivelPreparacion}% prep. | {asistencia}% asist.
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                className={
                                  isSelected ? "bg-purple-500" : isUsed ? "bg-gray-400" : "bg-gray-200 text-gray-600"
                                }
                              >
                                {isSelected ? "Seleccionado" : isUsed ? "En uso" : "Disponible"}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button variant="outline" size="lg" className="h-12 text-lg flex-1" onClick={() => router.push("/")}>
            Cancelar
          </Button>

          <Button
            onClick={handleSaveDesignacion}
            disabled={isSaving}
            size="lg"
            className="h-12 text-lg bg-purple-600 hover:bg-purple-700 flex-1"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Guardar Designación</span>
              </div>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
