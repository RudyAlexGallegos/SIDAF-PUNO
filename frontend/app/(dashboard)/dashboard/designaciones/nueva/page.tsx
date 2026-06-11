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

// ============================================================
// TIPOS
// ============================================================

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

// ============================================================
// DATOS ESTÁTICOS
// ============================================================

const PROVINCIAS_PUNO = [
  "Puno", "Azángaro", "Carabaya", "Chucuito", "El Collao",
  "Huancané", "Lampa", "Melgar", "Moho", "San Antonio de Putina",
  "San Román", "Sandia", "Yunguyo"
]

const ETAPAS = [
  "Etapa Distrital",
  "Etapa Provincial",
  "Etapa Departamental",
  "Etapa Nacional"
]

const DISTRITOS_PUNO = [
  "Puno (Capital)", "Acora", "Amantaní", "Atuncolla", "Capachica", "Chucuito",
  "Coata", "Huata", "Mañazo", "Paucarcolla", "Pichacani", "Platería",
  "San Antonio", "Tiquillaca", "Vilque"
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

    // Todos los distritos deben tener al menos un campeón
    return DISTRITOS_PUNO.every((distrito) => {
      const campeones = distritoCampeones[distrito]
      return campeones?.campeón !== null && campeones?.campeón !== undefined
    })
  }

  const obtenerDistritosPendientes = (): string[] => {
    if (!esCopaPeruActual) return []

    return DISTRITOS_PUNO.filter((distrito) => {
      const campeones = distritoCampeones[distrito]
      return !campeones?.campeón
    })
  }

const validarProvinciasCompletas = (): boolean => {
     if (!esCopaPeruActual) return true

     // En Etapa Provincial: todos los distritos deben tener campeón (subcampeón es opcional)
     if (etapaSeleccionada === "Etapa Provincial" && provinciaSeleccionada) {
       return DISTRITOS_PUNO.every((distrito) => {
         const campeones = provinciaCampeones[distrito]
         return campeones?.campeón !== null && campeones?.campeón !== undefined
       })
     }

     return true
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
         const todosTienenCampeon = DISTRITOS_PUNO.every((distrito) => mapping[distrito]?.campeón)
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
   }, [campeonatoSeleccionado, esCopaPeruActual])

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg">Cargando sistema de designación...</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 1: CAMPEONATO
  // ============================================================

  if (currentStep === "campeonato") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/designaciones">
              <Button variant="ghost" size="icon" className="mb-4 hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-blue-600" />
              Nueva Designación
            </h1>
            <p className="text-gray-600 text-lg">Paso 1 de 7: Selecciona un campeonato</p>
          </div>

          {/* Grid de campeonatos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campeonatos.map((camp) => {
              const esCopaPeruProtegida = camp.nombre === "COPA PERÚ 2026"
              
              return (
                <div
                  key={camp.id}
                  onClick={() => {
                    setCampeonatoSeleccionado(camp)
                    setEtapaSeleccionada(null)
                    setProvinciaSeleccionada(null)
                    setDistritoSeleccionado(null)
                    setPartidos([])
                    setArbitrosSeleccionados([])
                    // CAMPEONATO FUNDAMENTAL va directo a designación general
                    if (camp.categoria === "CAMPEONATO FUNDAMENTAL") {
                      setCurrentStep("designacionGeneral")
                    } else {
                      setCurrentStep("etapa")
                    }
                  }}
                  className="cursor-pointer group transition-all duration-300 transform hover:scale-105"
                >
                  <Card className="h-full border-2 border-gray-200 bg-white hover:border-blue-600/50 shadow-sm transition-all">
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                      {/* Header */}
                      <div>
<div className="flex items-start justify-between mb-4">
                           <Trophy className="w-8 h-8 text-blue-600" />
                           {esCopaPeruProtegida && (
                             <div title="Campeonato protegido">
                               <Lock className="w-5 h-5 text-red-400" />
                             </div>
                           )}
                           {camp.categoria === "CAMPEONATO FUNDAMENTAL" && (
                             <Badge className="bg-purple-600 text-white text-xs">SIN REQUISITOS</Badge>
                           )}
                         </div>

                        {/* Nombre */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {camp.nombre}
                        </h3>

                        {/* Detalles */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {camp.categoria && (
                            <p className="flex items-center gap-2">
                              <Badge className="bg-blue-600 text-slate-900">{camp.categoria}</Badge>
                            </p>
                          )}
                          {camp.numeroEquipos && (
                            <p className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {camp.numeroEquipos} equipos
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Badge className={`${
                          camp.estado === "ACTIVO"
                            ? "bg-green-600 text-slate-900"
                            : "bg-slate-600 text-gray-600"
                        }`}>
                          {camp.estado || "Sin estado"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 2: ETAPA
  // ============================================================

  if (currentStep === "etapa" && campeonatoSeleccionado) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("campeonato")}
              className="mb-4 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Etapas del Campeonato</h1>
            <p className="text-gray-600 text-lg">
              {campeonatoSeleccionado.nombre} • Paso 2 de 7
            </p>

            {/* 🔐 ADVERTENCIA DE DESBLOQUEO (COPA PERÚ) */}
            {esCopaPeruActual && !validarDistritosCompletos() && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  ⚠️ Debes completar la <strong>Etapa Distrital</strong> seleccionando los campeones de todos los distritos para desbloquear las siguientes etapas.
                </p>
                {obtenerDistritosPendientes().length > 0 && (
                  <p className="text-blue-600 text-xs mt-2">
                    Distritos pendientes: <strong>{obtenerDistritosPendientes().join(", ")}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Grid de etapas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ETAPAS.map((etapa) => {
              const estadoEtapa = esCopaPeruActual ? etapasState.etapas[etapa] : { desbloqueada: true, completada: false }
              const estaDesbloqueada = estadoEtapa?.desbloqueada ?? true

              return (
                <div
                  key={etapa}
                  onClick={() => {
                    if (estaDesbloqueada) {
                      setEtapaSeleccionada(etapa)
                      setProvinciaSeleccionada(null)
                      setDistritoSeleccionado(null)
                      setPartidos([])
                      // Limpiar estados según la etapa
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
                  className={`cursor-pointer group transition-all duration-300 ${
                    estaDesbloqueada ? "transform hover:scale-105" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Card
                    className={`h-32 border-2 ${
                      estaDesbloqueada
                        ? "border-gray-200 bg-white hover:border-blue-600/50"
                        : "border-red-200 bg-red-50"
                    } flex items-center justify-center relative transition-all shadow-sm`}
                  >
                    {!estaDesbloqueada && esCopaPeruActual && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-5 h-5 text-red-500" />
                      </div>
                    )}

                    {estadoEtapa?.completada && esCopaPeruActual && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}

                    <CardContent className="text-center p-6">
                      <div className="flex flex-col items-center gap-2">
                        <h3 className={`text-2xl font-bold ${
                          estaDesbloqueada ? "text-slate-900" : "text-gray-400"
                        }`}>
                          {etapa}
                        </h3>
                        {!estaDesbloqueada && esCopaPeruActual && (
                          <p className="text-xs text-red-400 mt-2">Bloqueada</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 3: PROVINCIA
  // ============================================================

  if (currentStep === "provincia" && campeonatoSeleccionado && etapaSeleccionada) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("etapa")}
              className="mb-4 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MapPin className="w-10 h-10 text-blue-600" />
              Provincias de Puno
            </h1>
            <p className="text-gray-600 text-lg">
              {etapaSeleccionada} • Paso 3 de 7
            </p>
          </div>

          {/* Grid de provincias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROVINCIAS_PUNO.map((provincia) => (
              <div
                key={provincia}
                onClick={() => {
                  setProvinciaSeleccionada(provincia)
                  setCurrentStep("distrito")
                }}
                className="cursor-pointer group transition-all duration-300 transform hover:scale-105"
              >
                <Card className="h-24 border-2 border-gray-200 bg-white hover:border-blue-600/50 shadow-sm transition-all flex items-center justify-center">
                  <CardContent className="text-center p-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {provincia}
                    </h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentStep("provincia")}
                className="mb-4 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Clasificación Provincial - {provinciaSeleccionada}
              </h1>
              <p className="text-gray-500 text-lg">
                Selecciona campeones y subcampeones de los distritos • Paso 4 de 7
              </p>

              {/* 🔐 INSTRUCCIONES */}
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-sm">
                  📋 Selecciona el equipo <strong>campeón</strong> y opcionalmente el <strong>subcampeón</strong> de cada distrito.
                </p>
              </div>
            </div>

            {/* CARD POR DISTRITO */}
            <div className="space-y-6">
              {DISTRITOS_PUNO.map((distrito) => {
                const campeones = provinciaCampeones[distrito] || { campeón: null, subcampeón: null }
                const tieneCompletado = !!campeones?.campeón

                return (
                  <div key={distrito} className="bg-slate-800 border-2 border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{distrito}</h3>
                        {tieneCompletado ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                            <span className="text-xs text-yellow-500">!</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GRID DE SELECTORES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CAMPEÓN (OBLIGATORIO) */}
                      <div>
                        <label className="block text-sm font-bold text-yellow-300 mb-2">
                          🥇 Equipo Campeón *
                        </label>
                        <select
                          value={campeones?.campeón?.id ?? ""}
                          onChange={(e) => {
                            const equipoId = Number(e.target.value)
                            const equipo = equiposFiltrados.find((eq) => eq.id === equipoId) || null

                            setProvinciaCampeones((prev) => ({
                              ...prev,
                              [distrito]: {
                                ...prev[distrito],
                                campeón: equipo,
                              },
                            }))
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                        >
                          <option value="">-- Selecciona campeón --</option>
                          {equiposFiltrados.map((eq) => (
                            <option key={eq.id} value={eq.id}>
                              {eq.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* SUBCAMPEÓN (OPCIONAL) */}
                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                          🥈 Equipo Subcampeón (Opcional)
                        </label>
                        <select
                          value={campeones?.subcampeón?.id ?? ""}
                          onChange={(e) => {
                            const equipoId = Number(e.target.value)
                            const equipo = equiposFiltrados.find((eq) => eq.id === equipoId) || null

                            setProvinciaCampeones((prev) => ({
                              ...prev,
                              [distrito]: {
                                ...prev[distrito],
                                subcampeón: equipo,
                              },
                            }))
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                        >
                          <option value="">-- Selecciona subcampeón --</option>
                          {equiposFiltrados
                            .filter((eq) => eq.id !== campeones?.campeón?.id)
                            .map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nombre}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* BOTÓN DE AVANCE */}
              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("provincia")}
                  className="flex-1"
                >
                  ← Atrás
                </Button>
                <Button
                  onClick={() => setCurrentStep("partidos")}
                  disabled={!validarProvinciasCompletas()}
                  className={`flex-1 ${
                    validarProvinciasCompletas()
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-slate-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  ✅ Continuar a Partidos →
                </Button>
              </div>

              {!validarProvinciasCompletas() && (
                <div className="p-4 bg-red-500/20 border border-red-600 rounded-lg">
                  <p className="text-red-300 text-sm">
                    ⛔ Debes seleccionar el campeón de <strong>todos los distritos</strong> para continuar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // VISTA POR DEFECTO (ETAPA DISTRITAL - SIN SELECTORES)
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("provincia")}
              className="mb-4 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              Distritos de {provinciaSeleccionada}
            </h1>
            <p className="text-gray-500 text-lg">Paso 4 de 7</p>
          </div>

          {/* Grid de distritos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISTRITOS_PUNO.map((distrito) => (
              <div
                key={distrito}
                onClick={() => {
                  setDistritoSeleccionado(distrito)
                  setCurrentStep("partidos")
                }}
                className="cursor-pointer group transition-all duration-300 transform hover:scale-105"
              >
                <Card className="h-24 border-2 border-gray-200 bg-white hover:border-green-400/50 transition-all flex items-center justify-center">
                  <CardContent className="text-center p-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {distrito}
                    </h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 5: CREAR PARTIDOS
  // ============================================================

  if (currentStep === "partidos" && (distritoSeleccionado || provinciaSeleccionada)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("distrito")}
              className="mb-4 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Crear Partidos</h1>
            <p className="text-gray-500 text-lg">
              {provinciaSeleccionada || distritoSeleccionado} • Paso 5 de 7
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SELECTOR DE EQUIPOS */}
            <div className="lg:col-span-3">
              <Card className="border-2 border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Crear Partido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Equipo Local */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                      ⚽ Equipo Local
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {equiposReales.map((eq) => (
                        <button
                          key={eq.id}
                          onClick={() => setEquipoLocal(eq)}
                          className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                            equipoLocal?.id === eq.id
                              ? "border-purple-400 bg-purple-600 text-slate-900"
                              : "border-gray-200 bg-white text-gray-600 hover:border-purple-400/50"
                          }`}
                        >
                          {eq.nombre.split(" ").slice(0, 2).join(" ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipo Visitante */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                      ✈️ Equipo Visitante
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {equiposReales.filter((eq) => eq.id !== equipoLocal?.id).map((eq) => (
                        <button
                          key={eq.id}
                          onClick={() => setEquipoVisitante(eq)}
                          className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                            equipoVisitante?.id === eq.id
                              ? "border-orange-400 bg-orange-600 text-slate-900"
                              : "border-gray-200 bg-white text-gray-600 hover:border-orange-400/50"
                          }`}
                        >
                          {eq.nombre.split(" ").slice(0, 2).join(" ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
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
                <Card className="border-2 border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-slate-900">
                      Partidos Creados ({partidos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {partidos.map((partido, idx) => (
                        <div key={partido.id} className="p-4 border border-gray-200 rounded-lg bg-white/30">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-blue-600 text-slate-900">Partido {idx + 1}</Badge>
                            <button
                              onClick={() => {
                                setPartidos(partidos.filter((p) => p.id !== partido.id))
                                toast({ title: "Partido eliminado" })
                              }}
                              className="p-1 hover:bg-red-600/20 rounded text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-slate-900 font-semibold">{partido.equipoLocal.nombre}</p>
                          <p className="text-center text-gray-500 text-sm my-1">VS</p>
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
      </div>
    )
  }

  // ============================================================
  // STEP 6: DESIGNACIÓN DE ÁRBITROS
  // ============================================================

  if (currentStep === "designar" && partidos.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("partidos")}
              className="mb-4 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Designación de Árbitros
            </h1>
            <p className="text-gray-500 text-lg">Paso 6 de 7</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PANEL LATERAL: ÁRBITROS */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-gray-200 bg-white sticky top-24">
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
                        className="p-2 bg-white/50 rounded border border-gray-200 hover:border-blue-600/50 transition-all cursor-pointer"
                      >
                        <p className="font-semibold text-slate-900 text-sm">
                          {arb.nombre}
                        </p>
                        <Badge className="text-xs mt-1 bg-blue-600 text-slate-900">
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
                <Card key={partido.id} className="border-2 border-gray-200 bg-white">
                  {/* Header del partido */}
                  <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-900 flex items-center gap-2">
                        <Badge className="bg-purple-600">Partido {idx + 1}</Badge>
                      </CardTitle>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{partido.equipoLocal.nombre}</p>
                        <p className="text-xs text-gray-500 my-1">vs</p>
                        <p className="font-semibold text-slate-900">{partido.equipoVisitante.nombre}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Árbitro Principal */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
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
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
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
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
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
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
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
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
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
                    <div className="p-4 bg-blue-500/20 border border-blue-600 rounded-lg">
                      <p className="text-blue-300 text-sm">
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
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
       <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
         <div className="max-w-2xl w-full">
           <Card className="border-2 border-green-600 bg-gradient-to-br from-green-600/20 to-emerald-600/20">
             <CardContent className="p-8 text-center space-y-6">
               <div className="flex justify-center">
                 <CheckCircle2 className="w-20 h-20 text-green-400 animate-pulse" />
               </div>

               <h1 className="text-4xl font-bold text-slate-900">
                 ¡Designaciones Confirmadas!
               </h1>

               <p className="text-gray-600 text-lg">
                 {esCampeonatoFundamental 
                   ? `Se han asignado ${arbitrosSeleccionados.length} árbitros al campeonato.`
                   : `Se han creado exitosamente ${partidos.length} designaciones.`
                 }
               </p>

<div className="space-y-2 text-left max-h-48 overflow-y-auto bg-white p-4 rounded border border-gray-200">
                  {esCampeonatoFundamental ? (
                    <>
                      {arbitrosSeleccionados.map((arb, idx) => (
                        <div key={arb.id} className="text-sm text-gray-600">
                          <p className="font-semibold text-slate-900">
                            Árbitro {idx + 1}: {arb.nombre}
                          </p>
                          <p className="text-xs text-gray-500 pl-2">
                            • Categoría: {arb.categoria}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {partidos.map((partido, idx) => (
                        <div key={partido.id} className="text-sm text-gray-600">
                          <p className="font-semibold text-slate-900">
                            Partido {idx + 1}: {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                          </p>
                          {partido.arbitroPrincipal && (
                            <p className="text-xs text-gray-500 pl-2">
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
       <div className="min-h-screen bg-gray-50 p-4 md:p-8">
         <div className="max-w-6xl mx-auto">
           {/* Header */}
           <div className="mb-8">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setCurrentStep("campeonato")}
               className="mb-4 hover:bg-gray-100"
             >
               <ChevronLeft className="w-5 h-5" />
             </Button>
             <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
               <Users className="w-10 h-10 text-blue-600" />
               Designar Árbitros
             </h1>
             <p className="text-gray-600 text-lg">
               {campeonatoSeleccionado.nombre} • CAMPEONATO FUNDAMENTAL (Sin requisitos)
             </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Panel de árbitros disponibles */}
             <Card className="border-2 border-gray-200 bg-white">
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
             <Card className="border-2 border-gray-200 bg-white">
               <CardHeader>
                 <CardTitle className="text-slate-900">
                   Árbitros Seleccionados ({arbitrosSeleccionados.length})
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {arbitrosSeleccionados.length === 0 ? (
                   <p className="text-gray-500 text-center py-8">
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
                           className="text-red-500 hover:text-red-700"
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
                 className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
               >
                 {isSaving ? "Guardando..." : "Confirmar Designación"}
               </Button>
             </div>
           </div>
         </div>
       </div>
     )
   }

   return null
 }
