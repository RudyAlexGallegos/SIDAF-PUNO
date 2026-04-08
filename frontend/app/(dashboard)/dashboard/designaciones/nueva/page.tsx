"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Trophy, MapPin, Users, Shield, Calendar, Save, ArrowRight, Lock, CheckCircle2 } from "lucide-react"
import { getCampeonatos, getEquipos, getArbitros, type Campeonato as CampeonatoApi, type Equipo as EquipoApi, type Arbitro as ArbitroApi } from "@/services/api"

interface Campeonato extends CampeonatoApi {}
interface Equipo extends EquipoApi {}
interface Arbitro extends ArbitroApi {}

interface Partido {
  id: number
  equipo1: Equipo
  equipo2: Equipo
  fecha?: string
  hora?: string
  estadio?: string
}

interface DistritoDatos {
  nombre: string
  provincia: string
  equipos: Equipo[]
}

interface ProvinciaResultados {
  nombre: string
  distrito: string
  campeon: Equipo | null
  subcampeon: Equipo | null
}

export default function NuevaDesignacionPage() {
  const { toast } = useToast()
  const [paso, setPaso] = useState(0)
  const [loading, setLoading] = useState(true)
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  
  // Selecciones principales
  const [campSelec, setCampSelec] = useState<Campeonato | null>(null)
  const [etapa, setEtapa] = useState("")
  const [etapasCompletas, setEtapasCompletas] = useState<Set<string>>(new Set())
  
  // Para etapa DISTRITAL
  const [distritosDisponibles, setDistritosDisponibles] = useState<DistritoDatos[]>([])
  const [distritoSelec, setDistritoSelec] = useState<DistritoDatos | null>(null)
  const [partidosDistrital, setPartidosDistrital] = useState<Partido[]>([])
  const [partidoSelecDistrital, setPartidoSelecDistrital] = useState<Partido | null>(null)
  
  // Para etapa PROVINCIAL
  const [resultadosDistritales, setResultadosDistritales] = useState<ProvinciaResultados[]>([])
  const [camponesProvincialesSelec, setCamponesProvincialesSelec] = useState<Map<string, Equipo>>(new Map())
  const [subcamponesProvincialesSelec, setSubcamponesProvincialesSelec] = useState<Map<string, Equipo>>(new Map())
  
  // Para etapa DEPARTAMENTAL
  const [camponsDepartamentalSelec, setCamponsDepartamentalSelec] = useState<Equipo | null>(null)
  const [subcamponsDepartamentalSelec, setSubcamponsDepartamentalSelec] = useState<Equipo | null>(null)
  
  // Detalles del partido (común a todas las etapas)
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [estadio, setEstadio] = useState("")
  
  // Designación de árbitros
  const [arbPrinc, setArbPrinc] = useState("")
  const [arbAsis1, setArbAsis1] = useState("")
  const [arbAsis2, setArbAsis2] = useState("")
  const [arbCuarto, setArbCuarto] = useState("")

  // ===== EFECTOS =====
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        
        // Cargar datos reales de la API
        const [campsData, equiposData, arbitrosData] = await Promise.all([
          getCampeonatos(),
          getEquipos(),
          getArbitros(),
        ])

        // Procesar campeonatos
        const camps = Array.isArray(campsData) ? campsData : []
        setCampeonatos(camps)

        // Procesar equipos y agrupar por distrito/provincia
        const equips = Array.isArray(equiposData) ? equiposData : []
        
        // Agrupar equipos por distrito
        const equiposPorDistrito = new Map<string, EquipoApi[]>()
        equips.forEach(eq => {
          const distrito = eq.provincia || "Sin clasificar"
          if (!equiposPorDistrito.has(distrito)) {
            equiposPorDistrito.set(distrito, [])
          }
          equiposPorDistrito.get(distrito)?.push(eq)
        })

        // Crear datos de distritos
        const distritosData: DistritoDatos[] = Array.from(equiposPorDistrito.entries()).map(([distrito, eqs]) => ({
          nombre: distrito,
          provincia: distrito,
          equipos: eqs,
        }))
        
        setDistritosDisponibles(distritosData)

        // Procesar árbitros
        const arbs = Array.isArray(arbitrosData) ? arbitrosData : []
        setArbitros(arbs)
        
        console.log("✅ Datos cargados exitosamente")
      } catch (error) {
        console.error("❌ Error cargando datos:", error)
        toast({ 
          title: "⚠️ Error al cargar datos", 
          description: "Algunos datos pueden no estar disponibles",
          variant: "destructive" 
        })
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [toast])

  // ===== LÓGICA =====
  const etapaHabilitada = (e: string): boolean => {
    if (e === "DISTRITAL") return true
    if (e === "PROVINCIAL") return etapasCompletas.has("DISTRITAL")
    if (e === "DEPARTAMENTAL") return etapasCompletas.has("PROVINCIAL")
    return false
  }

  const puedeSiguiente = (): boolean => {
    if (etapa === "DISTRITAL") return !!partidoSelecDistrital && !!fecha && !!hora && !!estadio
    if (etapa === "PROVINCIAL") return camponesProvincialesSelec.size > 0 && !!fecha && !!hora && !!estadio
    if (etapa === "DEPARTAMENTAL") return !!camponsDepartamentalSelec && !!fecha && !!hora && !!estadio
    return false
  }

  const avanzarAArbitros = () => {
    if (!puedeSiguiente()) {
      toast({ title: "❌ Completa todos los campos", variant: "destructive" })
      return
    }
    setPaso(4)
  }

  const guardarDesignacion = async () => {
    if (!arbPrinc) {
      toast({ title: "❌ Selecciona al menos árbitro principal", variant: "destructive" })
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
      toast({ title: "✅ Designación guardada exitosamente" })
      resetForm()
    } catch {
      toast({ title: "❌ Error al guardar", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setPaso(0)
    setCampSelec(null)
    setEtapa("")
    setPartidoSelecDistrital(null)
    setFecha("")
    setHora("")
    setEstadio("")
    setArbPrinc("")
  }

  // ===== RENDERIZADO =====
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Indicador de pasos */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
              paso === i ? "bg-blue-600 text-white border-blue-600 shadow-lg" :
              paso > i ? "bg-green-200 border-green-600" :
              "bg-gray-100 border-gray-300"
            }`}
          >
            {paso > i ? <CheckCircle2 className="w-5 h-5" /> : i}
          </div>
        ))}
      </div>

      {/* PASO 0: SELECCIONAR CAMPEONATO */}
      {paso === 0 && (
        <Card className="border-2 border-red-300">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Selecciona el Campeonato
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">⏳</div>
                <p className="mt-3 text-gray-600">Cargando campeonatos...</p>
              </div>
            ) : campeonatos.length === 0 ? (
              <p className="text-center text-gray-500">No hay campeonatos disponibles</p>
            ) : (
              <div className="grid gap-3">
                {campeonatos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCampSelec(c)
                      setEtapa("")
                      setEtapasCompletas(new Set())
                      setPaso(1)
                    }}
                    className="p-4 border-2 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-left font-semibold hover:shadow-md"
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PASO 1: SELECCIONAR ETAPA */}
      {paso === 1 && campSelec && (
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Selecciona la Etapa: {campSelec.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {["DISTRITAL", "PROVINCIAL", "DEPARTAMENTAL"].map((etName) => {
                const habilitada = etapaHabilitada(etName)
                const completa = etapasCompletas.has(etName)
                return (
                  <button
                    key={etName}
                    disabled={!habilitada}
                    onClick={() => {
                      setEtapa(etName)
                      setPartidoSelecDistrital(null)
                      setPaso(2)
                    }}
                    className={`p-4 rounded-lg border-2 font-semibold transition text-center relative ${
                      !habilitada ? "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed" :
                      completa ? "bg-green-100 border-green-500 hover:shadow-md" :
                      "bg-white border-blue-300 hover:border-blue-500 hover:shadow-md"
                    }`}
                  >
                    {!habilitada && <Lock className="w-4 h-4 absolute top-2 right-2" />}
                    {etName}
                    {completa && <CheckCircle2 className="w-4 h-4 ml-2 inline" />}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPaso(0)} variant="outline">← Atrás</Button>
              <Button onClick={() => setPaso(2)} className="ml-auto bg-blue-600 hover:bg-blue-700">
                Continuar →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 2: CONTENIDO DINÁMICO POR ETAPA */}
      {paso === 2 && etapa && campSelec && (
        <Card className="border-2 border-green-300">
          <CardHeader className={`bg-gradient-to-r ${
            etapa === "DISTRITAL" ? "from-purple-500 to-purple-600" :
            etapa === "PROVINCIAL" ? "from-cyan-500 to-cyan-600" :
            "from-amber-500 to-amber-600"
          } text-white`}>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Etapa: {etapa}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* ETAPA DISTRITAL */}
            {etapa === "DISTRITAL" && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-semibold">ℹ️ Etapa Distrital</p>
                  <p className="text-xs text-gray-600 mt-1">Los equipos se detectan automáticamente. Selecciona el distrito para ver sus equipos.</p>
                </div>
                
                <div>
                  <Label>📍 Selecciona Distrito</Label>
                  <Select value={distritoSelec?.nombre || ""} onValueChange={(nombre) => {
                    const dist = distritosDisponibles.find(d => d.nombre === nombre)
                    setDistritoSelec(dist || null)
                    setPartidoSelecDistrital(null)
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un distrito" /></SelectTrigger>
                    <SelectContent>
                      {distritosDisponibles.map(d => (
                        <SelectItem key={d.nombre} value={d.nombre}>
                          {d.nombre} ({d.provincia}) - {d.equipos.length} equipos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {distritoSelec && (
                  <div>
                    <Label>⚽ Equipos del Distrito {distritoSelec.nombre}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {distritoSelec.equipos.map(eq => (
                        <Badge key={eq.id} variant="outline" className="p-2 justify-center cursor-default">
                          {eq.nombre}
                        </Badge>
                      ))}
                    </div>
                    {distritoSelec.equipos.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-semibold">✓ {distritoSelec.equipos.length} equipos listos para competir</p>
                        <p className="text-xs text-gray-600 mt-1">Los árbitros serán designados cuando se definan los partidos.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ETAPA PROVINCIAL */}
            {etapa === "PROVINCIAL" && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm font-semibold">ℹ️ Etapa Provincial</p>
                  <p className="text-xs text-gray-600 mt-1">Selecciona los campeones y subcampeones de cada distrito de la etapa anterior.</p>
                </div>
                
                <div className="space-y-3">
                  <p className="font-semibold text-gray-700">Resultados Distritales a Procesar:</p>
                  {distritosDisponibles.map(d => (
                    <div key={d.nombre} className="border rounded-lg p-3 space-y-2">
                      <p className="font-semibold text-sm">{d.nombre}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">🏆 Campeón</Label>
                          <Select value={camponesProvincialesSelec.get(d.nombre)?.id?.toString() || ""} onValueChange={(id) => {
                            const eq = d.equipos.find(e => e.id === parseInt(id))
                            if (eq) {
                              const newMap = new Map(camponesProvincialesSelec)
                              newMap.set(d.nombre, eq)
                              setCamponesProvincialesSelec(newMap)
                            }
                          }}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                              {d.equipos.map(eq => (
                                <SelectItem key={eq.id} value={eq.id.toString()}>
                                  {eq.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">🥈 Subcampeón</Label>
                          <Select value={subcamponesProvincialesSelec.get(d.nombre)?.id?.toString() || ""} onValueChange={(id) => {
                            const eq = d.equipos.find(e => e.id === parseInt(id))
                            if (eq) {
                              const newMap = new Map(subcamponesProvincialesSelec)
                              newMap.set(d.nombre, eq)
                              setSubcamponesProvincialesSelec(newMap)
                            }
                          }}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                              {d.equipos.map(eq => (
                                <SelectItem key={eq.id} value={eq.id.toString()}>
                                  {eq.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPA DEPARTAMENTAL */}
            {etapa === "DEPARTAMENTAL" && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm font-semibold">ℹ️ Etapa Departamental</p>
                  <p className="text-xs text-gray-600 mt-1">Selecciona el campeón y subcampeón departamental de los resultados provinciales.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>🏆 Campeón Departamental</Label>
                    <Select value={camponsDepartamentalSelec?.id?.toString() || ""} onValueChange={(id) => {
                      const eq = equiposDM.find(e => e.id === parseInt(id))
                      setCamponsDepartamentalSelec(eq || null)
                    }}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {equiposDM.map(eq => (
                          <SelectItem key={eq.id} value={eq.id.toString()}>
                            {eq.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>🥈 Subcampeón Departamental</Label>
                    <Select value={subcamponsDepartamentalSelec?.id?.toString() || ""} onValueChange={(id) => {
                      const eq = equiposDM.find(e => e.id === parseInt(id))
                      setSubcamponsDepartamentalSelec(eq || null)
                    }}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {equiposDM.map(eq => (
                          <SelectItem key={eq.id} value={eq.id.toString()}>
                            {eq.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Detalles comunes */}
            <div className="border-t pt-4">
              <p className="font-semibold mb-3">📅 Detalles del Evento</p>
              <div className="grid grid-cols-3 gap-3">
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
                  <Input value={estadio} onChange={(e) => setEstadio(e.target.value)} placeholder="Nombre del estadio" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setPaso(1)} variant="outline">← Atrás</Button>
              <Button 
                onClick={avanzarAArbitros} 
                disabled={!puedeSiguiente()}
                className="ml-auto bg-green-600 hover:bg-green-700"
              >
                Continuar → <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 4: DESIGNACIÓN DE ÁRBITROS */}
      {paso === 4 && (
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Designación de Árbitros - {etapa}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>🏴 Árbitro Principal *</Label>
                <Select value={arbPrinc} onValueChange={setArbPrinc}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nombre} {a.apellido} ({a.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>🏳️ Asistente 1</Label>
                <Select value={arbAsis1} onValueChange={setArbAsis1}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nombre} {a.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>🏳️ Asistente 2</Label>
                <Select value={arbAsis2} onValueChange={setArbAsis2}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nombre} {a.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>🟣 Cuarto Árbitro</Label>
                <Select value={arbCuarto} onValueChange={setArbCuarto}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {arbitros.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nombre} {a.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setPaso(2)} variant="outline">← Atrás</Button>
              <Button 
                onClick={guardarDesignacion}
                disabled={!arbPrinc}
                className="ml-auto bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Designación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}