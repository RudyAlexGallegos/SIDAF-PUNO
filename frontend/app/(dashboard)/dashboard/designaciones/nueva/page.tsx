"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader,
  MapPin,
  Users,
  Plus,
  Trash2,
  Lock,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getCampeonatos, type Campeonato, getArbitros, type Arbitro, getEquipos, type Equipo, createDesignacion, getCopaPeruResultados, saveCopaPeruResultadosBatch } from "@/services/api"
import { PROVINCIAS_PUNO, getDistritosByProvincia } from "@/lib/provincias-puno"

interface Partido {
  id: string
  equipoLocal: Equipo
  equipoVisitante: Equipo
  arbitroPrincipal?: Arbitro | null
  asistente1?: Arbitro | null
  asistente2?: Arbitro | null
  cuartoArbitro?: Arbitro | null
  asesor?: Arbitro | null
}

interface DistritoCampeones {
  campeón: Equipo | null
  subcampeón: Equipo | null
}

interface EtapaState {
  etapas: {
    [key: string]: {
      completada: boolean
      desbloqueada: boolean
      error?: string
    }
  }
}

type Step = "campeonato" | "etapa" | "provincia" | "distrito" | "partidos" | "designar" | "confirmacion" | "designacionGeneral"

const ETAPAS = [
  "Etapa Distrital",
  "Etapa Provincial",
  "Etapa Departamental",
  "Etapa Nacional"
]

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function NuevaDesignacionPage() {
const router = useRouter()
   const [currentStep, setCurrentStep] = useState<Step>("campeonato")
   const [loading, setLoading] = useState(true)
   const [isSaving, setIsSaving] = useState(false)
   
   // Datos cargados
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [equiposReales, setEquiposReales] = useState<Equipo[]>([])
  
  // Selecciones del usuario
  const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState<Campeonato | null>(null)
  const [etapaSeleccionada, setEtapaSeleccionada] = useState<string | null>(null)
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string | null>(null)
  
  // Gestión de partidos
  const [equipoLocal, setEquipoLocal] = useState<Equipo | null>(null)
  const [equipoVisitante, setEquipoVisitante] = useState<Equipo | null>(null)
  const [partidos, setPartidos] = useState<Partido[]>([])

  // 🔐 SISTEMA DE DESBLOQUEO PROGRESIVO (SOLO COPA PERÚ 2026)
  const esCopaPeruActual = campeonatoSeleccionado?.nombre === "COPA PERÚ 2026"

// Campeones/subcampeones por distrito en etapa distrital
    const [distritoCampeones, setDistritoCampeones] = useState<Record<string, DistritoCampeones>>({})

    // Campeones/subcampeones por distrito en etapa provincial
    const [provinciaCampeones, setProvinciaCampeones] = useState<Record<string, DistritoCampeones>>({})

    // 🔒 Control: ¿Ya se guardaron los campeones provinciales en backend?
    const [provincialCampeonesFinalizados, setProvincialCampeonesFinalizados] = useState(false)

    // Distritos que no participan (se retiran)
    const [distritosNoParticipantes, setDistritosNoParticipantes] = useState<string[]>([])

    // Obtener distritos según la provincia seleccionada (para COPA PERÚ)
    const distritosDeProvinciaSeleccionada = provinciaSeleccionada
      ? getDistritosByProvincia(provinciaSeleccionada).map(d => d.nombre)
      : []

    // Estado de desbloqueo de etapas
   const [etapasState, setEtapasState] = useState<EtapaState>({
     etapas: {
       "Etapa Distrital": { completada: false, desbloqueada: true }, // Siempre desbloqueada
       "Etapa Provincial": { completada: false, desbloqueada: false },
       "Etapa Departamental": { completada: false, desbloqueada: false },
       "Etapa Nacional": { completada: false, desbloqueada: false },
     },
   })

// Árbitros asignados (para validar duplicados)
   const [arbitrosAsignados, setArbitrosAsignados] = useState<Record<string, Arbitro[]>>({})

   // Árbitros seleccionados (para CAMPEONATO FUNDAMENTAL)
   const [arbitrosSeleccionados, setArbitrosSeleccionados] = useState<Arbitro[]>([])

   // Detectar si es CAMPEONATO FUNDAMENTAL
   const esCampeonatoFundamental = campeonatoSeleccionado?.categoria === "CAMPEONATO FUNDAMENTAL"

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [campData, arbData, equiposData] = await Promise.all([
          getCampeonatos(),
          getArbitros(),
          getEquipos(),
        ])
        setCampeonatos(campData)
        setArbitros(arbData)
        setEquiposReales(equiposData)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // ============================================================
  // 🔐 FUNCIONES DE VALIDACIÓN Y DESBLOQUEO
  // ============================================================

  const validarDistritosCompletos = (): boolean => {
    if (!esCopaPeruActual || etapaSeleccionada !== "Etapa Distrital") return true

    const distritos = distritosDeProvinciaSeleccionada.length > 0
      ? distritosDeProvinciaSeleccionada
      : getDistritosByProvincia("Puno").map(d => d.nombre)

    // Todos los distritos deben tener al menos un campeón
    return distritos.every((distrito) => {
      const campeones = distritoCampeones[distrito]
      return campeones?.campeón !== null && campeones?.campeón !== undefined
    })
  }

  const obtenerDistritosPendientes = (): string[] => {
    if (!esCopaPeruActual) return []

    const distritos = distritosDeProvinciaSeleccionada.length > 0
      ? distritosDeProvinciaSeleccionada
      : getDistritosByProvincia("Puno").map(d => d.nombre)

    return distritos.filter((distrito) => {
      const campeones = distritoCampeones[distrito]
      return !campeones?.campeón
    })
  }

const validarProvinciasCompletas = (): boolean => {
      if (!esCopaPeruActual) return true

      // En Etapa Provincial: todos los distritos deben tener campeón (subcampeón es opcional)
      // EXCEPTUANDO los distritos marcados como "no participantes"
      if (etapaSeleccionada === "Etapa Provincial" && provinciaSeleccionada) {
        const distritos = distritosDeProvinciaSeleccionada.length > 0
          ? distritosDeProvinciaSeleccionada
          : getDistritosByProvincia("Puno").map(d => d.nombre)
        return distritos.every((distrito) => {
          // Si el distrito está marcado como no participante, no requiere campeón
          if (distritosNoParticipantes.includes(distrito)) return true
          const campeones = provinciaCampeones[distrito]
          return campeones?.campeón !== null && campeones?.campeón !== undefined
        })
      }

      return true
    }

  // Toggle distrito como no participante
  const toggleDistritoParticipa = (distrito: string) => {
    setDistritosNoParticipantes(prev => {
      const nuevos = prev.includes(distrito)
        ? prev.filter(d => d !== distrito)
        : [...prev, distrito]
      // Si no participa, limpiar su selección
      if (prev.includes(distrito)) {
        setProvinciaCampeones((c) => {
          const nuevosC = { ...c }
          delete nuevosC[distrito]
          return nuevosC
        })
      }
      return nuevos
    })
  }

  const validarPartidosCompletos = (): boolean => {
    if (!partidos.length) return false

    return partidos.every((partido) => {
      return (
        partido.equipoLocal &&
        partido.equipoVisitante &&
        partido.arbitroPrincipal &&
        partido.asistente1 &&
        partido.asistente2 &&
        partido.cuartoArbitro &&
        partido.asesor
      )
    })
  }

  const validarEquipoNoRepetido = (equipoId: number): boolean => {
    // Un equipo no puede estar en múltiples partidos
    return !partidos.some(
      (p) => p.equipoLocal?.id === equipoId || p.equipoVisitante?.id === equipoId
    )
  }

  const validarArbitroNoRepetido = (arbitroId: number, partidoActualId: string): boolean => {
    // Un árbitro no puede estar en múltiples partidos simultáneamente
    return !partidos.some(
      (p) =>
        p.id !== partidoActualId &&
        (p.arbitroPrincipal?.id === arbitroId ||
          p.asistente1?.id === arbitroId ||
          p.asistente2?.id === arbitroId ||
          p.cuartoArbitro?.id === arbitroId ||
          p.asesor?.id === arbitroId)
    )
  }

const calcularEtapasDesbloqueadas = () => {
     if (!esCopaPeruActual) return

     const nuevasEtapas = { ...etapasState.etapas }

     // 🔒 Distrital se BLOQUEA cuando Provincial está guardado
     nuevasEtapas["Etapa Distrital"].desbloqueada = !provincialCampeonesFinalizados

     // Provincial se desbloquea si todos los distritos tienen campeón (En Etapa Distrital)
     if (validarDistritosCompletos()) {
       nuevasEtapas["Etapa Distrital"].completada = true
       nuevasEtapas["Etapa Provincial"].desbloqueada = true
     } else {
       nuevasEtapas["Etapa Provincial"].desbloqueada = false
     }

     // Departamental se desbloquea si los partidos están completos en Etapa Provincial
     if (
       etapaSeleccionada === "Etapa Provincial" &&
       validarPartidosCompletos()
     ) {
       nuevasEtapas["Etapa Provincial"].completada = true
       nuevasEtapas["Etapa Departamental"].desbloqueada = true
     }

     // Nacional se desbloquea si Departamental está completa
     if (
       etapaSeleccionada === "Etapa Departamental" &&
       validarPartidosCompletos()
     ) {
       nuevasEtapas["Etapa Departamental"].completada = true
       nuevasEtapas["Etapa Nacional"].desbloqueada = true
     }

     // Marcar provincial como completada si está finalizado
     if (provincialCampeonesFinalizados) {
       nuevasEtapas["Etapa Provincial"].completada = true
     }

     setEtapasState({ etapas: nuevasEtapas })
   }

// Recalcular desbloqueos cuando cambia el estado
   useEffect(() => {
     calcularEtapasDesbloqueadas()
   }, [distritoCampeones, provinciaCampeones, partidos, etapaSeleccionada, campeonatoSeleccionado, provincialCampeonesFinalizados])

   // 🔒 Cargar resultados de etapa provincial guardados desde backend
   useEffect(() => {
     const loadProvincial = async () => {
       try {
         if (!campeonatoSeleccionado || !esCopaPeruActual) {
           setProvinciaCampeones({})
           setProvincialCampeonesFinalizados(false)
           return
         }

         const resultados = await getCopaPeruResultados(campeonatoSeleccionado.id as number, 'PROVINCIAL')
         const mapping: Record<string, DistritoCampeones> = {}
         resultados.forEach((r: any) => {
           const equipo = r.equipo || {}
           // En etapa provincial, los equipos están agrupados por distrito
           const distrito = equipo.distrito || 'Sin Distrito'
           if (!mapping[distrito]) mapping[distrito] = { campeón: null, subcampeón: null }
           const equipoObj: Equipo = { id: equipo.id, nombre: equipo.nombre, provincia: equipo.provincia, distrito: equipo.distrito }
           if (r.posicion === 1) mapping[distrito].campeón = equipoObj
           if (r.posicion === 2) mapping[distrito].subcampeón = equipoObj
         })
setProvinciaCampeones(mapping)

          // Verificar si todos los distritos tienen campeón asignado
          const distritos = distritosDeProvinciaSeleccionada.length > 0
            ? distritosDeProvinciaSeleccionada
            : getDistritosByProvincia("Puno").map(d => d.nombre)
          const todosTienenCampeon = distritos.every((distrito) => mapping[distrito]?.campeón)
          if (todosTienenCampeon) {
            setProvincialCampeonesFinalizados(true)
          }
        } catch (e) {
          console.warn('No se pudo cargar campeones provinciales desde backend', e)
          setProvinciaCampeones({})
          setProvincialCampeonesFinalizados(false)
        }
      }

      loadProvincial()
    }, [campeonatoSeleccionado, esCopaPeruActual, distritosDeProvinciaSeleccionada])

   // 🔒 Cargar resultados de etapa distrital para detectar equipos participantes
   useEffect(() => {
     const loadDistrital = async () => {
       try {
         if (!campeonatoSeleccionado || !esCopaPeruActual) {
           setDistritoCampeones({})
           return
         }

         const resultados = await getCopaPeruResultados(campeonatoSeleccionado.id as number, 'DISTRITAL')
         const mapping: Record<string, DistritoCampeones> = {}
         resultados.forEach((r: any) => {
           const equipo = r.equipo || {}
           const distrito = equipo.distrito || 'Sin Distrito'
           if (!mapping[distrito]) mapping[distrito] = { campeón: null, subcampeón: null }
           const equipoObj: Equipo = { id: equipo.id, nombre: equipo.nombre, provincia: equipo.provincia, distrito: equipo.distrito }
           if (r.posicion === 1) mapping[distrito].campeón = equipoObj
           if (r.posicion === 2) mapping[distrito].subcampeón = equipoObj
         })
         setDistritoCampeones(mapping)
       } catch (e) {
         console.warn('No se pudo cargar resultados distritales desde backend', e)
         setDistritoCampeones({})
       }
     }

     loadDistrital()
   }, [campeonatoSeleccionado, esCopaPeruActual])

   // 🔒 Detectar y bloquear etapa distrital automáticamente cuando provincial está guardado
   useEffect(() => {
     if (!campeonatoSeleccionado || !esCopaPeruActual) return

     // Si los campeones provinciales están finalizados, bloquear etapa distrital
     if (provincialCampeonesFinalizados) {
       setEtapasState(prev => ({
         etapas: {
           ...prev.etapas,
           "Etapa Distrital": { desbloqueada: false, completada: false }
         }
       }))
     }
   }, [provincialCampeonesFinalizados, campeonatoSeleccionado, esCopaPeruActual])

if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 text-lg">Cargando sistema de designación...</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 1: CAMPEONATO
  // ============================================================

  if (currentStep === "campeonato") {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Designación
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-600" />
            Selecciona un Campeonato
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 1 de 7 • 7 pasos para completar</p>
        </section>

        <div className="flex justify-between items-center">
          <Link href="/dashboard/designaciones">
            <Button variant="outline" size="sm" className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver al Listado
            </Button>
          </Link>
        </div>

        {/* Grid de campeonatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {campeonatos.map((camp) => {
            const esCopaPeruProtegida = camp.nombre === "COPA PERÚ 2026"

            return (
              <Card
                key={camp.id}
                className={`h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                  esCopaPeruProtegida ? "border-red-200 hover:border-red-300" : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => {
                  setCampeonatoSeleccionado(camp)
                  setEtapaSeleccionada(null)
                  setProvinciaSeleccionada(null)
                  setDistritoSeleccionado(null)
                  setPartidos([])
                  setArbitrosSeleccionados([])
                  if (camp.categoria === "CAMPEONATO FUNDAMENTAL") {
                    setCurrentStep("designacionGeneral")
                  } else {
                    setCurrentStep("etapa")
                  }
                }}
              >
                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
                      {esCopaPeruProtegida && (
                        <div title="Campeonato protegido">
                          <Lock className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        </div>
                      )}
                      {camp.categoria === "CAMPEONATO FUNDAMENTAL" && (
                        <Badge className="bg-purple-600 text-white text-xs">SIN REQUISITOS</Badge>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                      {camp.nombre}
                    </h3>

                    <div className="space-y-2 text-sm text-slate-600">
                      {camp.categoria && (
                        <p className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white">{camp.categoria}</Badge>
                        </p>
                      )}
                      {camp.numeroEquipos && (
                        <p className="flex items-center gap-2">
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                          {camp.numeroEquipos} equipos
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Badge className={`${
                      camp.estado === "ACTIVO"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-600 text-slate-200"
                    }`}>
                      {camp.estado || "Sin estado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 2: ETAPA
  // ============================================================

  if (currentStep === "etapa" && campeonatoSeleccionado) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Etapas del Campeonato
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 2 de 7</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("campeonato")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Campeonato
          </Button>
        </div>

        {/* 🔐 ADVERTENCIA DE DESBLOQUEO (COPA PERÚ) */}
        {esCopaPeruActual && !validarDistritosCompletos() && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ Debes completar la <strong className="text-amber-700">Etapa Distrital</strong> seleccionando los campeones de todos los distritos para desbloquear las siguientes etapas.
            </p>
            {obtenerDistritosPendientes().length > 0 && (
              <p className="text-amber-600 text-xs mt-2">
                Distritos pendientes: <strong className="text-amber-700">{obtenerDistritosPendientes().join(", ")}</strong>
              </p>
            )}
          </div>
        )}

        {/* Grid de etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {ETAPAS.map((etapa) => {
            const estadoEtapa = esCopaPeruActual ? etapasState.etapas[etapa] : { desbloqueada: true, completada: false }
            const estaDesbloqueada = estadoEtapa?.desbloqueada ?? true

            return (
              <Card
                key={etapa}
                className={`h-32 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  estaDesbloqueada ? "border-blue-200 hover:border-blue-300" : "border-red-200 opacity-50"
                }`}
                onClick={() => {
                  if (estaDesbloqueada) {
                    setEtapaSeleccionada(etapa)
                    setProvinciaSeleccionada(null)
                    setDistritoSeleccionado(null)
                    setPartidos([])
                    if (etapa === "Etapa Distrital") {
                      setDistritoCampeones({})
                      setProvinciaCampeones({})
                    } else if (etapa === "Etapa Provincial") {
                      setProvinciaCampeones({})
                    }
                    setCurrentStep("provincia")
                  } else if (esCopaPeruActual) {
                    toast({
                      title: "Etapa Bloqueada",
                      description: `Debes completar etapas anteriores para acceder a "${etapa}"`,
                      variant: "destructive",
                    })
                  }
                }}
              >
                <CardContent className="text-center p-4 md:p-6 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <h3 className={`text-lg md:text-2xl font-bold ${
                      estaDesbloqueada ? "text-slate-900" : "text-slate-500"
                    }`}>
                      {etapa}
                    </h3>
                    {!estaDesbloqueada && esCopaPeruActual && (
                      <p className="text-xs text-red-600 font-medium">Bloqueada</p>
                    )}
                    {estadoEtapa?.completada && esCopaPeruActual && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

// ============================================================
  // STEP 3: PROVINCIA
  // ============================================================

  if (currentStep === "provincia" && campeonatoSeleccionado && etapaSeleccionada) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-cyan-600" />
            Provincias de Puno
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">
            {etapaSeleccionada} • Paso 3 de 7
          </p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("etapa")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Etapa
          </Button>
        </div>

        {/* Grid de provincias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVINCIAS_PUNO.map((prov) => (
            <Card
              key={prov.nombre}
              className="h-24 cursor-pointer border-2 border-gray-200 bg-card transition-all duration-200 hover:shadow-md hover:border-blue-300"
              onClick={() => {
                setProvinciaSeleccionada(prov.nombre)
                setCurrentStep("distrito")
              }}
            >
              <CardContent className="text-center p-4 h-full flex items-center justify-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  {prov.nombre}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 4: DISTRITO
  // ============================================================

  if (currentStep === "distrito" && provinciaSeleccionada) {
    const esEtapaProvincial = etapaSeleccionada === "Etapa Provincial"
    const equiposFiltrados = equiposReales.filter(
      (eq) => eq.provincia === provinciaSeleccionada
    )

    // VISTA PARA ETAPA PROVINCIAL CON SELECTORES DE CAMPEONES
    if (esEtapaProvincial && esCopaPeruActual) {
      return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <section className="border-b pb-3 md:pb-4">
            <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
              {campeonatoSeleccionado?.nombre} · {provinciaSeleccionada}
            </p>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
              Clasificación Provincial
            </h1>
            <p className="text-slate-500 mt-2 text-xs md:text-sm">Selecciona campeones y subcampeones • Paso 4 de 7</p>
          </section>

          {/* Botón de retroceso */}
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep("provincia")} className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cambiar Provincia
            </Button>
          </div>

          {/* 🔐 INSTRUCCIONES */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              📋 Selecciona el equipo <strong>campeón</strong> y opcionalmente el <strong>subcampeón</strong> de cada distrito.
            </p>
          </div>

          {/* CARD POR DISTRITO */}
          <div className="space-y-4">
            {distritosDeProvinciaSeleccionada.map((distrito) => {
              // Para etapa provincial, filtrar equipos por distrito específico
              const equiposDelDistrito = equiposReales.filter(
                (eq) => eq.distrito === distrito
              )
              const campeones = provinciaCampeones[distrito] || { campeón: null, subcampeón: null }
              const tieneCompletado = !!campeones?.campeón
              const noParticipa = distritosNoParticipantes.includes(distrito)

              return (
                <Card key={distrito} className={`border-2 ${
                  noParticipa ? "border-slate-300 bg-slate-50" : "border-gray-200 bg-card"
                }`}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-bold ${
                          noParticipa ? "text-slate-500 line-through" : "text-slate-900"
                        }`}>{distrito}</h3>
                        {noParticipa && (
                          <Badge className="bg-slate-400 text-white text-xs">NO PARTICIPA</Badge>
                        )}
                        {tieneCompletado && !noParticipa ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          !noParticipa && (
                            <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                              <span className="text-xs text-amber-500">!</span>
                            </div>
                          )
                        )}
                      </div>
                      {/* Botón NO PARTICIPA */}
                      <Button
                        type="button"
                        variant={noParticipa ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDistritoParticipa(distrito)}
                        className={`text-xs ${
                          noParticipa
                            ? "bg-slate-600 text-white hover:bg-slate-700"
                            : "border-slate-300 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {noParticipa ? "✓ Participa" : "No Participa"}
                      </Button>
                    </div>

                    {/* GRID DE SELECTORES - OCULTOS SI NO PARTICIPA */}
                    {!noParticipa && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CAMPEÓN (OBLIGATORIO) */}
                        <div>
                          <label className="block text-sm font-semibold text-amber-700 mb-2">
                            🥇 Equipo Campeón *
                          </label>
                          <select
                            value={campeones?.campeón?.id ? String(campeones.campeón.id) : ""}
                            onChange={(e) => {
                              const equipoId = Number(e.target.value)
                              const equipo = equiposDelDistrito.find((eq) => eq.id === equipoId) || null

                              console.log("Seleccionado campeón:", equipoId, equipo?.nombre, "distrito:", distrito)

                              setProvinciaCampeones((prev) => ({
                                ...prev,
                                [distrito]: {
                                  ...prev[distrito],
                                  campeón: equipo,
                                },
                              }))
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                          >
                            <option value="">-- Selecciona campeón --</option>
                            {equiposDelDistrito.length > 0 ? (
                              equiposDelDistrito.map((eq) => (
                                <option key={eq.id} value={String(eq.id)} className="bg-white text-slate-900">
                                  {eq.nombre}
                                </option>
                              ))
                            ) : (
                              <option disabled value="">No hay equipos registrados</option>
                            )}
                          </select>
                        </div>

                        {/* SUBCAMPEÓN (OPCIONAL) */}
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">
                            🥈 Equipo Subcampeón (Opcional)
                          </label>
                          <select
                            value={campeones?.subcampeón?.id ? String(campeones.subcampeón.id) : ""}
                            onChange={(e) => {
                              const equipoId = Number(e.target.value)
                              const equipo = equiposDelDistrito.find((eq) => eq.id === equipoId) || null

                              setProvinciaCampeones((prev) => ({
                                ...prev,
                                [distrito]: {
                                  ...prev[distrito],
                                  subcampeón: equipo,
                                },
                              }))
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
                          >
                            <option value="">-- Selecciona subcampeón --</option>
                            {equiposDelDistrito
                              .filter((eq) => eq.id !== campeones?.campeón?.id)
                              .map((eq) => (
                                <option key={eq.id} value={String(eq.id)} className="bg-white text-slate-900">
                                  {eq.nombre}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}

            {/* BOTÓN DE AVANCE */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("provincia")}
                className="flex-1 border-gray-200 text-slate-700 hover:bg-gray-50"
              >
                ← Atrás
              </Button>
              <Button
                onClick={() => setCurrentStep("partidos")}
                disabled={!validarProvinciasCompletas()}
                className={`flex-1 ${
                  validarProvinciasCompletas()
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-slate-300 cursor-not-allowed opacity-50"
                }`}
              >
                ✅ Continuar a Partidos →
              </Button>
            </div>

            {!validarProvinciasCompletas() && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  ⛔ Debes seleccionar el campeón de <strong>todos los distritos</strong> para continuar.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // VISTA POR DEFECTO (ETAPA DISTRITAL - SIN SELECTORES)
    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado?.nombre} · {provinciaSeleccionada}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-cyan-600" />
            Distritos de {provinciaSeleccionada}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 4 de 7</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("provincia")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Provincia
          </Button>
        </div>

        {/* Grid de distritos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {distritosDeProvinciaSeleccionada.map((distrito) => (
            <Card
              key={distrito}
              className="h-24 cursor-pointer border-2 border-gray-200 bg-card transition-all duration-200 hover:shadow-md hover:border-blue-300 flex items-center justify-center"
              onClick={() => {
                setDistritoSeleccionado(distrito)
                setCurrentStep("partidos")
              }}
            >
              <CardContent className="text-center p-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {distrito}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 5: CREAR PARTIDOS
  // ============================================================

  if (currentStep === "partidos" && (distritoSeleccionado || provinciaSeleccionada)) {
    // 🔒 Filtrar equipos disponibles según el contexto
    let equiposDisponibles: Equipo[] = equiposReales
    if (distritoSeleccionado) {
      // 1. Etapa Distrital: mostrar solo equipos del distrito seleccionado
      equiposDisponibles = equiposReales.filter((eq) => eq.distrito === distritoSeleccionado)
    } else if (esCopaPeruActual && etapaSeleccionada === "Etapa Provincial" && provinciaSeleccionada) {
      // 2. Etapa Provincial (Copa Perú): usar campeón/subcampeón de cada distrito
      equiposDisponibles = Object.values(provinciaCampeones)
        .flatMap((c) => [c.campeón, c.subcampeón].filter(Boolean) as Equipo[])
    } else if (provinciaSeleccionada) {
      // 3. Otros campeonatos / etapas: filtrar por provincia seleccionada
      equiposDisponibles = equiposReales.filter((eq) => eq.provincia === provinciaSeleccionada)
    }

    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Nueva Designación · {campeonatoSeleccionado?.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Crear Partidos
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">
            {provinciaSeleccionada || distritoSeleccionado} • Paso 5 de 7
          </p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("distrito")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Distrito/Provincia
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* SELECTOR DE EQUIPOS */}
            <div className="lg:col-span-3">
              <Card className="border-2 border-gray-200 bg-card">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Crear Partido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Equipo Local */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-3">
                      ⚽ Equipo Local
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {equiposDisponibles.map((eq) => {
                        const estaRepetido = partidos.some(
                          (p) => p.equipoLocal?.id === eq.id || p.equipoVisitante?.id === eq.id
                        )
                        return (
                          <button
                            key={eq.id}
                            onClick={() => !estaRepetido && setEquipoLocal(eq)}
                            disabled={estaRepetido}
                            className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                              equipoLocal?.id === eq.id
                                ? "border-purple-500 bg-purple-600 text-white"
                                : estaRepetido
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                  : "border-gray-200 bg-white text-slate-700 hover:border-purple-400"
                            }`}
                          >
                            {eq.nombre.split(" ").slice(0, 2).join(" ")}
                            {estaRepetido && <span className="text-xs block">Asignado</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Equipo Visitante */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-3">
                      ✈️ Equipo Visitante
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {equiposDisponibles.filter((eq) => eq.id !== equipoLocal?.id).map((eq) => {
                        const estaRepetido = partidos.some(
                          (p) => p.equipoLocal?.id === eq.id || p.equipoVisitante?.id === eq.id
                        )
                        return (
                          <button
                            key={eq.id}
                            onClick={() => !estaRepetido && setEquipoVisitante(eq)}
                            disabled={estaRepetido}
                            className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                              equipoVisitante?.id === eq.id
                                ? "border-orange-500 bg-orange-600 text-white"
                                : estaRepetido
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                  : "border-gray-200 bg-white text-slate-700 hover:border-orange-400"
                            }`}
                          >
                            {eq.nombre.split(" ").slice(0, 2).join(" ")}
                            {estaRepetido && <span className="text-xs block">Asignado</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

{/* Botones */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() => {
                          if (!equipoLocal || !equipoVisitante) {
                            toast({
                              title: "Validación",
                              description: "Selecciona ambos equipos",
                              variant: "destructive",
                            })
                            return
                          }

                          const equipoLocalRepetido = partidos.some(
                            (p) => p.equipoLocal?.id === equipoLocal.id || p.equipoVisitante?.id === equipoLocal.id
                          )
                          const equipoVisitanteRepetido = partidos.some(
                            (p) => p.equipoLocal?.id === equipoVisitante.id || p.equipoVisitante?.id === equipoVisitante.id
                          )

                          if (equipoLocalRepetido || equipoVisitanteRepetido) {
                            toast({
                              title: "Equipos duplicados",
                              description: "Un equipo no puede participar en múltiples partidos",
                              variant: "destructive",
                            })
                            return
                          }

                          const nuevoPartido: Partido = {
                            id: `partido-${Date.now()}`,
                            equipoLocal,
                            equipoVisitante,
                          }

                          setPartidos([...partidos, nuevoPartido])
                          setEquipoLocal(null)
                          setEquipoVisitante(null)

                          toast({
                            title: "✅ Partido creado",
                            description: `${equipoLocal.nombre} vs ${equipoVisitante.nombre}`,
                          })
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Partido
                      </Button>

                    <Button
                      onClick={() => {
                        if (partidos.length === 0) {
                          toast({
                            title: "Sin partidos",
                            description: "Crea al menos un partido antes de continuar",
                            variant: "destructive",
                          })
                          return
                        }

                        setCurrentStep("designar")
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continuar
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LISTA DE PARTIDOS */}
            {partidos.length > 0 && (
              <div className="lg:col-span-3">
                <Card className="border-2 border-gray-200 bg-card">
                  <CardHeader>
                    <CardTitle className="text-slate-900">
                      Partidos Creados ({partidos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {partidos.map((partido, idx) => (
                        <div key={partido.id} className="p-4 border border-gray-200 rounded-lg bg-white/50">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-blue-600 text-white">Partido {idx + 1}</Badge>
                            <button
                              onClick={() => {
                                setPartidos(partidos.filter((p) => p.id !== partido.id))
                                toast({ title: "Partido eliminado" })
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-slate-900 font-semibold">{partido.equipoLocal.nombre}</p>
                          <p className="text-center text-slate-500 text-sm my-1">VS</p>
                          <p className="text-slate-900 font-semibold">{partido.equipoVisitante.nombre}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
      </div>
    )
  }

  // ============================================================
  // STEP 6: DESIGNACIÓN DE ÁRBITROS
  // ============================================================

  if (currentStep === "designar" && partidos.length > 0) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Designación de Árbitros · {campeonatoSeleccionado?.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Asignar Árbitros
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 6 de 7</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("partidos")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a Partidos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* PANEL LATERAL: ÁRBITROS */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-gray-200 bg-card sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-lg">
                      Árbitros Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {arbitros.map((arb) => (
                        <div
                          key={arb.id}
                          className="p-2 bg-white rounded border border-gray-200 hover:border-blue-600/50 transition-all cursor-pointer"
                        >
                          <p className="font-semibold text-slate-900 text-sm">
                            {arb.nombre}
                          </p>
                          <Badge className="text-xs mt-1 bg-blue-600 text-white">
                            {arb.categoria}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PRINCIPAL: PARTIDOS Y DESIGNACIÓN */}
              <div className="lg:col-span-3 space-y-6">
                {partidos.map((partido, idx) => (
                  <Card key={partido.id} className="border-2 border-gray-200 bg-card">
                    {/* Header del partido */}
                    <CardHeader className="bg-blue-600/10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                          <Badge className="bg-purple-600 text-white">Partido {idx + 1}</Badge>
                        </CardTitle>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{partido.equipoLocal.nombre}</p>
                          <p className="text-xs text-slate-500 my-1">vs</p>
                          <p className="font-semibold text-slate-900">{partido.equipoVisitante.nombre}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Árbitro Principal */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            🛡️ Principal
                          </label>
                          <select
                            value={partido.arbitroPrincipal?.id || ""}
                            onChange={(e) => {
                              const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].arbitroPrincipal = arb || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          >
                            <option value="">Seleccionar</option>
                            {arbitros.map((arb) => (
                              <option key={arb.id} value={arb.id}>
                                {arb.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Asistente 1 */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            👤 Asistente 1
                          </label>
                          <select
                            value={partido.asistente1?.id || ""}
                            onChange={(e) => {
                              const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].asistente1 = arb || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="">Seleccionar</option>
                            {arbitros.map((arb) => (
                              <option key={arb.id} value={arb.id}>
                                {arb.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Asistente 2 */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            👤 Asistente 2
                          </label>
                          <select
                            value={partido.asistente2?.id || ""}
                            onChange={(e) => {
                              const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].asistente2 = arb || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                          >
                            <option value="">Seleccionar</option>
                            {arbitros.map((arb) => (
                              <option key={arb.id} value={arb.id}>
                                {arb.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cuarto Árbitro */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            🔄 Cuarto
                          </label>
                          <select
                            value={partido.cuartoArbitro?.id || ""}
                            onChange={(e) => {
                              const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].cuartoArbitro = arb || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          >
                            <option value="">Seleccionar</option>
                            {arbitros.map((arb) => (
                              <option key={arb.id} value={arb.id}>
                                {arb.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Asesor */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            📋 Asesor
                          </label>
                          <select
                            value={partido.asesor?.id || ""}
                            onChange={(e) => {
                              const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].asesor = arb || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            <option value="">Seleccionar</option>
                            {arbitros.map((arb) => (
                              <option key={arb.id} value={arb.id}>
                                {arb.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

{/* Botones finales */}
                <div className="space-y-4">
                  {/* 🔐 MENSAJE DE VALIDACIÓN COPA PERÚ */}
                  {esCopaPeruActual &&
                    (etapaSeleccionada === "Etapa Provincial" ||
                      etapaSeleccionada === "Etapa Departamental") && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm">
                          ✅ Todos los partidos deben tener los 5 árbitros asignados. Los árbitros no pueden repetirse en diferentes partidos.
                        </p>
                      </div>
                    )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-white text-slate-900"
                      onClick={() => setCurrentStep("partidos")}
                    >
                      ← Volver
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        // Validar que todos los partidos tengan los 5 árbitros
                        const partidosSinArbitros = partidos.filter(
                          (p) =>
                            !p.arbitroPrincipal ||
                            !p.asistente1 ||
                            !p.asistente2 ||
                            !p.cuartoArbitro ||
                            !p.asesor
                        )

                        if (partidosSinArbitros.length > 0) {
                          toast({
                            title: "Designación incompleta",
                            description: `${partidosSinArbitros.length} partido(s) sin árbitros completos`,
                            variant: "destructive",
                          })
                          return
                        }

                        // Validar árbitros únicos dentro del mismo partido
                        for (const [pIdx, partido] of partidos.entries()) {
                          const arbitrosEnPartido = [
                            partido.arbitroPrincipal?.id,
                            partido.asistente1?.id,
                            partido.asistente2?.id,
                            partido.cuartoArbitro?.id,
                            partido.asesor?.id,
                          ].filter(Boolean) as number[]

                          const duplicadosEnPartido = arbitrosEnPartido.length !== new Set(arbitrosEnPartido).size

                          if (duplicadosEnPartido) {
                            toast({
                              title: "Árbitros duplicados",
                              description: `Partido ${pIdx + 1}: Un árbitro no puede tener múltiples roles`,
                              variant: "destructive",
                            })
                            return
                          }
                        }

                        // 🔐 Validar árbitros únicos en partidos diferentes (solo COPA PERÚ)
                        if (
                          esCopaPeruActual &&
                          (etapaSeleccionada === "Etapa Provincial" ||
                            etapaSeleccionada === "Etapa Departamental")
                        ) {
                          const arbitrosGlobales = new Map<number, number>()

                          for (const partido of partidos) {
                            const arbitros = [
                              partido.arbitroPrincipal?.id,
                              partido.asistente1?.id,
                              partido.asistente2?.id,
                              partido.cuartoArbitro?.id,
                              partido.asesor?.id,
                            ].filter(Boolean) as number[]

                            for (const arbId of arbitros) {
                              arbitrosGlobales.set(arbId, (arbitrosGlobales.get(arbId) || 0) + 1)
                            }
                          }

                          const arbitrosDuplicadosGlobales = Array.from(arbitrosGlobales.entries())
                            .filter(([_, count]) => count > 1)
                            .map(([id, _]) => arbitros.find((a) => a.id === id)?.nombre)
                            .filter(Boolean)

                          if (arbitrosDuplicadosGlobales.length > 0) {
                            toast({
                              title: "Árbitros asignados en múltiples partidos",
                              description: `${arbitrosDuplicadosGlobales.join(", ")} ya están asignados en otro partido`,
                              variant: "destructive",
                            })
                            return
                          }
                        }

                        setCurrentStep("confirmacion")
                      }}
                    >
                      Confirmar ✓
                    </Button>
                  </div>
                </div>
              </div>
            </div>
      </div>
    )
  }

// ============================================================
  // STEP 7: CONFIRMACIÓN
  // ============================================================

  if (currentStep === "confirmacion") {
    const totalDesignaciones = esCampeonatoFundamental
      ? arbitrosSeleccionados.length
      : partidos.length

    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full">
          <Card className="border-2 border-emerald-600 bg-emerald-600/10">
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-emerald-600" />
              </div>

              <h1 className="text-4xl font-bold text-slate-900">
                ¡Designaciones Confirmadas!
              </h1>

              <p className="text-slate-600 text-lg">
                {esCampeonatoFundamental
                  ? `Se han asignado ${arbitrosSeleccionados.length} árbitros al campeonato.`
                  : `Se han creado exitosamente ${partidos.length} designaciones.`
                }
              </p>

              <div className="space-y-2 text-left max-h-48 overflow-y-auto bg-white p-4 rounded border border-gray-200">
                {esCampeonatoFundamental ? (
                  <>
                    {arbitrosSeleccionados.map((arb, idx) => (
                      <div key={arb.id} className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">
                          Árbitro {idx + 1}: {arb.nombre}
                        </p>
                        <p className="text-xs text-slate-500 pl-2">
                          • Categoría: {arb.categoria}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {partidos.map((partido, idx) => (
                      <div key={partido.id} className="text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">
                          Partido {idx + 1}: {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                        </p>
                        {partido.arbitroPrincipal && (
                          <p className="text-xs text-slate-500 pl-2">
                            • Principal: {partido.arbitroPrincipal.nombre}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-white text-slate-900"
                  onClick={() => router.push("/dashboard/designaciones")}
                >
                  Ver Designaciones
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Reset todo
                    setCurrentStep("campeonato")
                    setCampeonatoSeleccionado(null)
                    setEtapaSeleccionada(null)
                    setProvinciaSeleccionada(null)
                    setDistritoSeleccionado(null)
                    setPartidos([])
                  }}
                >
                  Nueva Designación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP: DESIGNACIÓN GENERAL (CAMPEONATO FUNDAMENTAL)
  // ============================================================

  if (currentStep === "designacionGeneral" && campeonatoSeleccionado && esCampeonatoFundamental) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Designar Árbitros · {campeonatoSeleccionado.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Designar Árbitros
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">
            CAMPEONATO FUNDAMENTAL (Sin requisitos)
          </p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("campeonato")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Campeonato
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Panel de árbitros disponibles */}
          <Card className="border-2 border-gray-200 bg-card">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Árbitros Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {arbitros.map((arb) => {
                  const estaSeleccionado = arbitrosSeleccionados.some((a) => a.id === arb.id)
                  return (
                    <div
                      key={arb.id}
                      onClick={() => {
                        if (estaSeleccionado) {
                          setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))
                        } else {
                          setArbitrosSeleccionados(prev => [...prev, arb])
                        }
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        estaSeleccionado
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white hover:border-blue-600/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{arb.nombre}</p>
                          <Badge className={`${
                            estaSeleccionado ? "bg-white/20 text-white" : "bg-blue-600 text-white"
                          } text-xs mt-1`}>
                            {arb.categoria}
                          </Badge>
                        </div>
                        {estaSeleccionado && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Árbitros seleccionados */}
          <Card className="border-2 border-gray-200 bg-card">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Árbitros Seleccionados ({arbitrosSeleccionados.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {arbitrosSeleccionados.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Selecciona al menos 1 árbitro
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {arbitrosSeleccionados.map((arb) => (
                    <div key={arb.id} className="p-3 bg-blue-600/10 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{arb.nombre}</p>
                        <Badge className="bg-blue-600 text-white text-xs">{arb.categoria}</Badge>
                      </div>
                      <button
                        onClick={() => setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botón de confirmar */}
        <div className="mt-8">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("campeonato")}
              className="flex-1"
            >
              ← Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (arbitrosSeleccionados.length < 1) {
                  toast({
                    title: "Validación",
                    description: "Selecciona al menos 1 árbitro",
                    variant: "destructive"
                  })
                  return
                }

                setIsSaving(true)
                try {
                  console.log("Guardando designaciones para campeonato:", campeonatoSeleccionado?.nombre)
                  console.log("Árbitros a guardar:", arbitrosSeleccionados.length)
                  // Crear designación individual para cada árbitro seleccionado
                  for (const arbitro of arbitrosSeleccionados) {
                    console.log("Guardando árbitro:", arbitro.id, arbitro.nombre)
                    const result = await createDesignacion({
                      idCampeonato: campeonatoSeleccionado?.id,
                      nombreCampeonato: campeonatoSeleccionado?.nombre?.toUpperCase(),
                      fecha: new Date().toISOString().split('T')[0],
                      estado: "PROGRAMADA",
                      arbitroPrincipal: String(arbitro.id),
                    })
                    console.log("Resultado:", result)
                  }

                  toast({
                    title: "¡Éxito!",
                    description: `Se asignaron ${arbitrosSeleccionados.length} árbitros al campeonato`,
                  })

                  setCurrentStep("confirmacion")
                } catch (error) {
                  console.error("Error al guardar designaciones:", error)
                  toast({
                    title: "Error",
                    description: "No se pudieron guardar las designaciones",
                    variant: "destructive",
                  })
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={arbitrosSeleccionados.length < 1 || isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? "Guardando..." : "Confirmar Designación"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

return null
}
