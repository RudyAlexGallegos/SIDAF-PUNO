"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Trophy, MapPin, Users, Shield, Calendar, Save } from "lucide-react"

interface Campeonato {
  id: number
  nombre: string
}

interface Equipo {
  id: number
  nombre: string
}

interface Arbitro {
  id: number
  nombre: string
  apellido: string
}

export default function NuevaDesignacionPage() {
  const { toast } = useToast()
  const [paso, setPaso] = useState(0)
  const [loading, setLoading] = useState(true)
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [campSelec, setCampSelec] = useState<Campeonato | null>(null)
  const [etapa, setEtapa] = useState("")
  const [campeones, setCampeones] = useState<Record<string, number>>({})
  const [subcampeones, setSubcampeones] = useState<Record<string, number>>({})
  const [etapasCompletas, setEtapasCompletas] = useState<Set<string>>(new Set())
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [estadio, setEstadio] = useState("")
  const [arbPrinc, setArbPrinc] = useState("")
  const [arbAsis1, setArbAsis1] = useState("")
  const [arbAsis2, setArbAsis2] = useState("")
  const [arbCuarto, setArbCuarto] = useState("")

  // Datos de prueba
  const campeonatosDM: Campeonato[] = [
    { id: 1, nombre: "🏆 COPA PERÚ PUNO 2026" },
    { id: 2, nombre: "Campeonato Distrital Juliaca" },
    { id: 3, nombre: "Campeonato Provincial Puno" },
  ]

  const equiposDM: Equipo[] = [
    { id: 1, nombre: "Sport Puno" },
    { id: 2, nombre: "Juliaca FC" },
    { id: 3, nombre: "Ayaviri United" },
    { id: 4, nombre: "Azangaro Futbol Club" },
    { id: 5, nombre: "Yunguyo Sports" },
  ]

  const arbitrosDM: Arbitro[] = [
    { id: 1, nombre: "Juan", apellido: "Pérez" },
    { id: 2, nombre: "Carlos", apellido: "López" },
    { id: 3, nombre: "Miguel", apellido: "García" },
    { id: 4, nombre: "Roberto", apellido: "Martínez" },
    { id: 5, nombre: "Fernando", apellido: "Rodríguez" },
  ]

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const [c, e, a] = await Promise.all([
          fetch("/api/campeonatos").then(r => r.json()).catch(() => campeonatosDM),
          fetch("/api/equipos").then(r => r.json()).catch(() => equiposDM),
          fetch("/api/arbitros").then(r => r.json()).catch(() => arbitrosDM),
        ])
        setCampeonatos(c?.length ? c : campeonatosDM)
        setEquipos(e?.length ? e : equiposDM)
        setArbitros(a?.length ? a : arbitrosDM)
      } catch {
        setCampeonatos(campeonatosDM)
        setEquipos(equiposDM)
        setArbitros(arbitrosDM)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const etapaHabilitada = (e: string): boolean => {
    if (e === "DISTRITAL") return true
    if (e === "PROVINCIAL") return etapasCompletas.has("DISTRITAL")
    if (e === "DEPARTAMENTAL") return etapasCompletas.has("PROVINCIAL")
    return false
  }

  const guardarEtapa = () => {
    if (!campeones[etapa] || !subcampeones[etapa]) {
      toast({ title: "Selecciona campeón y subcampeón", variant: "destructive" })
      return
    }
    const nuevas = new Set(etapasCompletas)
    nuevas.add(etapa)
    setEtapasCompletas(nuevas)
    if (nuevas.size === 3) {
      setPaso(3)
    } else {
      setEtapa("")
      toast({ title: `${etapa} completada` })
    }
  }

  const guardarDesignacion = async () => {
    if (!fecha || !hora || !estadio || !arbPrinc) {
      toast({ title: "Completa todos los campos", variant: "destructive" })
      return
    }
    try {
      await fetch("/api/designaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campeonato: campSelec,
          etapa,
          fecha,
          hora,
          estadio,
          arbPrincipal: arbPrinc,
          arbAsistente1: arbAsis1,
          arbAsistente2: arbAsis2,
          arbCuarto,
        }),
      })
      toast({ title: "Guardado exitosamente" })
      setPaso(0)
      setCampSelec(null)
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${paso === i ? "bg-blue-600 text-white border-blue-600" : paso > i ? "bg-green-100 border-green-600" : "bg-gray-100 border-gray-300"}`}>
            {i}
          </div>
        ))}
      </div>

      {paso === 0 && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" />Campeonatos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                <p className="mt-3">Cargando campeonatos...</p>
              </div>
            ) : campeonatos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay campeonatos disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {campeonatos.map((c) => (
                  <button key={c.id} onClick={() => { setCampSelec(c); setPaso(1); }} className="w-full p-4 text-left border rounded-lg hover:bg-blue-50 transition font-semibold">
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {paso === 1 && campSelec && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Etapa</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {["DISTRITAL", "PROVINCIAL", "DEPARTAMENTAL"].map((e) => {
                const activa = etapaHabilitada(e)
                const completa = etapasCompletas.has(e)
                return (
                  <button key={e} disabled={!activa} onClick={() => { setEtapa(e); setPaso(2); }} className={`p-4 rounded-lg border-2 font-semibold ${!activa ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed" : completa ? "bg-green-100 border-green-500" : "bg-white border-blue-300 hover:border-blue-500"}`}>
                    {e} {completa && "✓"}
                  </button>
                )
              })}
            </div>
            <Button onClick={() => setPaso(0)} variant="outline">← Atrás</Button>
          </CardContent>
        </Card>
      )}

      {paso === 2 && etapa && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{etapa}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>🏆 Campeón</Label>
                <Select value={String(campeones[etapa] || "")} onValueChange={(v) => setCampeones({...campeones, [etapa]: parseInt(v)})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {equipos.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>{eq.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>🥈 Subcampeón</Label>
                <Select value={String(subcampeones[etapa] || "")} onValueChange={(v) => setSubcampeones({...subcampeones, [etapa]: parseInt(v)})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {equipos.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>{eq.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setPaso(1)} variant="outline">← Atrás</Button>
              <Button onClick={guardarEtapa} disabled={!campeones[etapa] || !subcampeones[etapa]} className="flex-1 bg-green-600 hover:bg-green-700">Guardar Etapa →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 3 && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Detalles</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div>
                <Label>Hora</Label>
                <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
              <div>
                <Label>Estadio</Label>
                <Input value={estadio} onChange={(e) => setEstadio(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setPaso(1)} variant="outline">← Atrás</Button>
              <Button onClick={() => setPaso(4)} disabled={!fecha || !hora || !estadio} className="flex-1 bg-orange-600 hover:bg-orange-700">Siguiente →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paso === 4 && (
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Árbitros</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Árbitro Principal</Label>
                <Select value={arbPrinc} onValueChange={setArbPrinc}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre} {a.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Asistente 1</Label>
                <Select value={arbAsis1} onValueChange={setArbAsis1}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre} {a.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Asistente 2</Label>
                <Select value={arbAsis2} onValueChange={setArbAsis2}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre} {a.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cuarto Árbitro</Label>
                <Select value={arbCuarto} onValueChange={setArbCuarto}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre} {a.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setPaso(3)} variant="outline">← Atrás</Button>
              <Button onClick={guardarDesignacion} disabled={!arbPrinc} className="flex-1 bg-purple-600 hover:bg-purple-700"><Save className="w-4 h-4 mr-2" />Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}