"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Trophy, Users, Save, Zap, Calendar, MapPin, Star, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

type TipoArbitro = {
  id: number
  nombre: string
  apellido: string
  categoria: string
  disponible: boolean
}

type TipoEquipo = {
  id: number
  nombre: string
  provincia: string
}

type TipoCampeonato = {
  id: number
  nombre: string
  nivelDificultad: string
  categoria: string
  numeroEquipos: number
}

type TipoDesignacion = {
  idCampeonato?: number
  nombreCampeonato?: string
  nombreEquipoLocal?: string
  nombreEquipoVisitante?: string
  fecha?: string
  hora?: string
  estadio?: string
  arbitroPrincipal?: number
  arbitroAsistente1?: number
  arbitroAsistente2?: number
  cuartoArbitro?: number
  estado?: string
}

const API_URL = "http://localhost:8083/api"

export default function NuevaDesignacionPage() {
  const router = useRouter()

  const [arbitrosData, setArbitrosData] = useState<TipoAritro[]>([])
  const [equiposData, setEquiposData] = useState<TipoEquipo[]>([])
  const [championshipData, setChampionshipData] = useState<TipoCampeonato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [designacionMode, setDesignacionMode] = useState<"manual" | "automatica">("automatica")
  const [arbitrosSeleccionados, setArbitrosSeleccionados] = useState({
    principal: "",
    asistente1: "",
    asistente2: "",
    cuarto: "",
  })

  const [partidoData, setPartidoData] = useState({
    criterioId: "",
    equipoLocal: "",
    equipoVisitante: "",
    fecha: "",
    hora: "20:00",
    estadio: "",
  })

  const [designacionAutomatica, setDesignacionAutomatica] = useState<{
    arbitroPrincipal: number
    arbitroAsistente1: number
    arbitroAsistente2: number
    cuartoArbitro: number
  } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      setError(null)
      try {
        const arbResp = await fetch(`${API_URL}/arbitros`)
        const arbData = arbResp.ok ? await arbResp.json() : []
        setArbitrosData(arbData || [])
        
        const eqResp = await fetch(`${API_URL}/equipos`)
        const eqData = eqResp.ok ? await eqResp.json() : []
        setEquiposData(eqData || [])
        
        const campResp = await fetch(`${API_URL}/campeonato`)
        const campData = campResp.ok ? await campResp.json() : []
        setChampionshipData(campData || [])
      } catch (err: any) {
        console.error("Error cargando datos:", err)
        setError("Error al conectar con el backend.")
      } finally {
        setLoading(false)
      }
    }
    
    cargarDatos()

    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    setPartidoData((prev) => ({
      ...prev,
      fecha: manana.toISOString().split("T")[0],
    }))
  }, [])

  const equiposDisponibles = equiposData.length > 0 
    ? equiposData.map((e) => ({ id: e.id, nombre: e.nombre || "Sin nombre" }))
    : []

  const CampeotosList = championshipData.length > 0 
    ? championshipData.map((c) => ({
        id: c.id,
        nombre: c.nombre || "Sin nombre",
        nivelDificultad: c.nivelDificultad || "Medio",
        categoria: c.categoria || "Primera",
        numeroEquipos: c.numeroEquipos || 10
      }))
    : []

  const arbitrosDisponibles = arbitrosData.filter((a) => a.disponible === true)

  const kampionatoSeleccionado = CampeotosList.find((c) => c.id.toString() === partidoData.criterioId)

  const handleGenerarDesignacionAutomatica = async () => {
    if (!partidoData.criterioId) {
      toast({ title: "⚠️ Error", description: "Selecciona un campeón primero", variant: "destructive" })
      return
    }

    if (arbitrosDisponibles.length < 4) {
      toast({ title: "⚠️ Árbitros insuficientes", description: `Solo hay ${arbitrosDisponibles.length} árbitros disponibles. Se necesitan al menos 4.`, variant: "destructive" })
      return
    }

    setIsGenerating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const disponibles = [...arbitrosDisponibles].sort(() => Math.random() - 0.5)
      
      const designacion = {
        arbitroPrincipal: disponibles[0].id,
        arbitroAsistente1: disponibles[1].id,
        arbitroAsistente2: disponibles[2].id,
        cuartoArbitro: disponibles[3].id,
      }

      setDesignacionAutomatica(designacion)
      toast({ title: "✅ Designación generada", description: "El sistema ha seleccionado los mejores árbitros disponibles" })
    } catch (error) {
      toast({ title: "❌ Error", description: "Error al generar la designación automática", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDesignacion = async () => {
    if (!partidoData.criterioId || !partidoData.equipoLocal || !partidoData.equipoVisitante || !partidoData.fecha || !partidoData.estadio) {
      toast({ title: "⚠️ Error", description: "Completa todos los campos requeridos", variant: "destructive" })
      return
    }

    if (partidoData.equipoLocal === partidoData.equipoVisitante) {
      toast({ title: "⚠️ Error", description: "Los equipos deben ser diferentes", variant: "destructive" })
      return
    }

    let arbitrosResult = { principal: "", asistente1: "", asistente2: "", cuartoArtero: "" }

    if (designacionMode === "automatica") {
      if (!designacionAutomatica) {
        toast({ title: "⚠️ Error", description: "Genera primero la designación automática", variant: "destructive" })
        return
      }
      arbitrosResult.principal = designacionAutomatica.arbitrationPrincipal.toString()
      arbitrosResult.asistente1 = designacionAutomatica.arbitrationAsistente1.toString()
      arbitrosResult.asistente2 = designacionAutomatica.arbitrationAsistente2.toString()
      arbitrosResult.cuartoArtero = designacionAutomatica.cuartaArbitration.toString()
    } else {
      if (!arbitrosSeleccionados.principal || !arbitrosSeleccionados.asistente1 || !arbitrosSeleccionados.asistente2 || !arbitrosSeleccionados.cuarto) {
        toast({ title: "⚠️ Error", description: "Selecciona todos los árbitros requeridos", variant: "destructive" })
        return
      }
      arbitrosResult.principal = arbitrosSeleccionados.principal
      arbitrosResult.asistente1 = arbitrosSeleccionados.asistente1
      arbitrosResult.asistente2 = arbitrosSeleccionados.asistente2
      arbitrosResult.cuartoArtero = arbitrosSeleccionados.cuarto
    }

    setIsSaving(true)

    try {
      const nuevaDesignacion: TipoDesignacion = {
        idCampeonato: parseInt(partidoData.criterioId),
        nombreCampeonato: kampionatoSeleccionado?.nombre,
        nombreEquipoLocal: partidoData.equipoLocal,
        nombreEquipoVisitante: partidoData.equipoVisitante,
        fecha: `${partidoData.fecha}T${partidoData.hora}:00`,
        hora: partidoData.hora,
        estadio: partidoData.estadio,
        arbitroPrincipal: parseInt(arbitrosResult.principal),
        arbitroAsistente1: parseInt(arbitrosResult.asistente1),
        arbitroAsistente2: parseInt(arbitrosResult.asistente2),
        cuartoArtero: parseInt(arbitrosResult.cuartoArtero),
        estado: "programada",
      }

      const response = await fetch(`${API_URL}/designaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaDesignacion),
      })

      if (!response.ok) {
        throw new Error("Error al guardar")
      }

      toast({ title: "✅ Designación guardada", description: `Partido ${partidoData.equipoLocal} vs ${partidoData.equipoVisitante} designado exitosamente` })
      router.push("/dashboard/designaciones")
    } catch (error) {
      toast({ title: "❌ Error", description: "No se pudo guardar la designación", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleArteroSelection = (posicion: string, arbitroId: string) => {
    setArbitrosSeleccionados((prev) => ({ ...prev, [posicion]: arbitroId }))
  }

  const getArteroInfo = (arberoId: number) => {
    return arbitrosData.find((a) => a.id === arberoId)
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "FIFA": return "bg-yellow-500"
      case "Nacional": return "bg-blue-500"
      case "Regional": return "bg-green-500"
      case "Provincial": return "bg-purple-500"
      default: return "bg-slate-500"
    }
  }

  const getArteroDisplayName = (arbero: TipoAritro | undefined) => {
    if (!arbero) return "No asignado"
    return `${arbero.nombre || ""} ${arbero.apellido || ""}`.trim() || "Árbero"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando datos del backend...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error de conexión</h3>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
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
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
          <Label htmlFor="auto-mode" className="text-sm font-medium">
            {designacionMode === "automatica" ? "🤖 Automático" : "👤 Manual"}
          </Label>
          <Switch
            id="auto-mode"
            checked={designacionMode === "automatica"}
            onCheckedChange={(checked) => setDesignacionMode(checked ? "automatica" : "manual")}
          />
        </div>
      </div>

      {CampeotosList.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div><p className="font-medium text-amber-800">No hay Campeonatos registrados</p><p className="text-sm text-amber-600">Crea un campeón en la sección de Campeonatos primero</p></div>
        </div>
      )}

      {equiposData.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div><p className="font-medium text-amber-800">No hay equipos registrados</p><p className="text-sm text-amber-600">Crea equipos en la sección de Equipos primero</p></div>
        </div>
      )}

      {arbitrosDisponibles.length < 4 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div><p className="font-medium text-red-800">No hay suficientes árbitros disponibles</p><p className="text-sm text-red-600">Se necesitan al menos 4 árbitros con disponible=true</p></div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Información del Partido</CardTitle>
            <CardDescription className="text-purple-100">Complete los datos del encuentro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="criterio">Campeonato *</Label>
              <Select value={partidoData.criterioId} onValueChange={(value) => setPartidoData((prev) => ({ ...prev, criterioId: value }))} disabled={CampeotosList.length === 0}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={CampeotosList.length > 0 ? "Seleccionar campeão" : "No hay Campeonatos"} /></SelectTrigger>
                <SelectContent>
                  {CampeotosList.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge className={c.nivelDificultad === "Alto" ? "bg-red-500" : c.nivelDificultad === "Medio" ? "bg-yellow-500" : "bg-green-500"}>{c.nivelDificultad}</Badge>
                        <span>{c.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipo-local">Equipo Local *</Label>
                <Select value={partidoData.equipoLocal} onValueChange={(value) => setPartidoData((prev) => ({ ...prev, equipoLocal: value }))} disabled={equiposData.length === 0}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder={equiposData.length > 0 ? "Equipo local" : "No hay equipos"} /></SelectTrigger>
                  <SelectContent>
                    {equiposData.map((equipo) => (<SelectItem key={equipo.id} value={equipo.nombre} disabled={equipo.nombre === partidoData.equipoVisitante}>{equipo.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="equipo-visitante">Equipo Visitante *</Label>
                <Select value={partidoData.equipoVisitante} onValueChange={(value) => setPartidoData((prev) => ({ ...prev, equipoVisitante: value }))} disabled={equiposData.length === 0}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder={equiposData.length > 0 ? "Equipo visitante" : "No hay equipos"} /></SelectTrigger>
                  <SelectContent>
                    {equiposData.map((equipo) => (<SelectItem key={equipo.id} value={equipo.nombre} disabled={equipo.nombre === partidoData.equipoLocal}>{equipo.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha del Partido *</Label>
                <Input id="fecha" type="date" className="mt-2" value={partidoData.fecha} onChange={(e) => setPartidoData((prev) => ({ ...prev, fecha: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="hora">Hora del Partido</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <Input id="hora" type="time" value={partidoData.hora} onChange={(e) => setPartidoData((prev) => ({ ...prev, hora: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="estadio">Estadio *</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="estadio" placeholder="Nombre del estadio" className="pl-10" value={partidoData.estadio} onChange={(e) => setPartidoData((prev) => ({ ...prev, Estadio: e.target.value }))} />
              </div>
            </div>
            {kampionatoSeleccionado && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">{kampionatoSeleccionado.nombre} - Nivel {kampionatoSeleccionado.nivelDificultad}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Designación de Árbitros</CardTitle>
            <CardDescription className="text-purple-100">{designacionMode === "automatica" ? "El sistema seleccionará automáticamente" : "Selecciona manualmente"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {designacionMode === "automatica" ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Button onClick={handleGenerarDesignacionAutomatica} disabled={isGenerating || !partidoData.criterioId || arbitrosDisponibles.length < 4} className="h-12 px-8 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30">
                    {isGenerating ? (<div className="flex items-center gap-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div><span>Generando...</span></div>) : (<div className="flex items-center gap-2"><Zap className="h-5 w-5" /><span>Generar Designación Automática</span></div>)}
                  </Button>
                </div>
                {designacionAutomatica && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600"><Badge className="bg-green-500">✅ Designación Generada</Badge></div>
                    {[
                      { role: "Árbero Principal", id: designacionAutomatica.arbitrationPrincipal, color: "from-green-400 to-emerald-500" },
                      { role: "Asistente 1", id: designacionAutomatica.arbitrationAsistente1, color: "from-blue-400 to-indigo-500" },
                      { role: "Asistente 2", id: designacionAutomatica.arbitrationAsistente2, color: "from-blue-400 to-indigo-500" },
                      { role: "Cuarto Árbero", id: designacionAutomatica.cuartaArbitration, color: "from-purple-400 to-pink-500" },
                    ].map((item) => {
                      const info = getArteroInfo(item.id)
                      return (
                        <div key={item.role} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}><Users className="h-5 w-5 text-white" /></div>
                            <div><p className="text-sm font-medium text-slate-600">{item.role}</p><p className="font-semibold text-slate-900">{getArteroDisplayName(info)}</p></div>
                          </div>
                          <div className="text-right"><Badge className={`${getCategoriaColor(info?.categoria || "")} text-white`}>{info?.categoria || "N/A"}</Badge></div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: "principal", label: "Árbero Principal", color: "green" },
                  { key: "asistente1", label: "Asistente 1", color: "blue" },
                  { key: "asistente2", label: "Asistente 2", color: "blue" },
                  { key: "cuarto", label: "Cuarto Árbero", color: "purple" },
                ].map((posicion) => (
                  <div key={posicion.key} className="space-y-2">
                    <Label>{posicion.label}</Label>
                    <Select value={arbitrosSeleccionados[posicion.key as keyof typeof arbitrosSeleccionados]} onValueChange={(value) => handleArteroSelection(posicion.key, value)} disabled={arbitrosDisponibles.length === 0}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder={arbitrosDisponibles.length > 0 ? "Seleccionar árbol" : "No hay árbitros"} /></SelectTrigger>
                      <SelectContent>
                        {arbitrosDisponibles.map((arbero: any) => (<SelectItem key={arbero.id} value={arbero.id.toString()}><div className="flex items-center gap-2"><Badge className={`${getCategoriaColor(arbero.categoria)} text-white text-xs`}>{arbero.categoria}</Badge><span>{arbero.nombre} {arbero.apellido}</span></div></SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-6 border-t border-slate-200">
              <Button onClick={handleSaveDesignacion} disabled={isSaving || (!designacionAutomatica && designacionMode === "automatica")} className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-600 text-white text-lg shadow-lg shadow-purple-500/30">
                {isSaving ? (<div className="flex items-center gap-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div><span>Guardando...</span></div>) : (<div className="flex items-center gap-2"><Save className="h-5 w-5" /><span>Guardar Designación</span></div>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}