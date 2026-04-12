/**
 * PÁGINA PRINCIPAL DE DESIGNACIÓN DE ÁRBITROS
 * 
 * Sistema completo y profesional para:
 * - Gestión de campeonatos y etapas
 * - Creación y gestión de partidos
 * - Designación manual de árbitros
 * - Designación automática inteligente con algoritmo heurístico
 * - Simulación y validación
 * 
 * TODO CONTENIDO EN ESTA RUTA: /dashboard/designaciones/nueva
 */

"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  getCampeonatos,
  getArbitros,
  getDesignacionesByCampeonato,
  getEquiposByCampeonato,
  type Campeonato,
  type Arbitro,
  type Designacion,
  type Equipo,
} from "@/services/api"

// IMPORTAR TIPOS
import {
  Championship,
  Stage,
  Match,
  Referee,
  RefereeRole,
 MatchStatus,
  StageStatus,
} from "./lib/types"

// IMPORTAR COMPONENTES
import { CompetitionSidebar } from "./components/CompetitionSidebar"
import { DesignationDashboard } from "./components/DesignationDashboard"
import { StageProgressPanel } from "./components/StageProgressPanel"
import { MatchList } from "./components/MatchList"
import { TeamSelector } from "./components/TeamSelector"
import { AssignmentPanel } from "./components/AssignmentPanel"
import { AlgorithmConfigPanel } from "./components/AlgorithmConfigPanel"
import { SimulationResultComponent } from "./components/SimulationResult"
import { ErrorPanel } from "./components/ErrorPanel"

// IMPORTAR STORE
import { useDesignationStore } from "./hooks/useDesignationStore"

// ============================================================
// MAPEO DE DATOS - Transformar API a tipos internos
// ============================================================

const mapCampeonatoToChampionship = (camp: Campeonato): Championship => {
  // Mapear SOLO etapas customizadas del campeonato (sin fallback a etapas por defecto)
  let etapas: Stage[] = []
  
  // Parsear etapas desde JSON string si es necesario
  let etapasArray: any[] = []
  if (camp.etapas) {
    try {
      // Si es string, hace JSON.parse; si es array, lo usa directamente
      etapasArray = typeof camp.etapas === 'string' 
        ? JSON.parse(camp.etapas) 
        : Array.isArray(camp.etapas) 
          ? camp.etapas 
          : []
    } catch (error) {
      console.error(`Error parseando etapas del campeonato ${camp.id}:`, error)
      etapasArray = []
    }
  }

  // Mapear etapas si existen
  if (etapasArray && Array.isArray(etapasArray) && etapasArray.length > 0) {
    // Usar etapas customizadas del campeonato
    etapas = etapasArray.map((etapa, index) => ({
      id: etapa.id || index + 1,
      nombre: etapa.nombre || `Etapa ${etapa.orden || index + 1}`,
      idCampeonato: camp.id || 0,
      fecha_inicio: etapa.fechaInicio || camp.fechaInicio || new Date().toISOString(),
      fecha_fin: etapa.fechaFin || camp.fechaFin || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: camp.estado === "ACTIVO" && index === 0 ? StageStatus.ACTIVE : StageStatus.PLANNING,
      orden: etapa.orden || index + 1,
      descripcion: `Etapa ${etapa.orden || index + 1} - ${etapa.nombre}`,
    }))
  }

  return {
    id: camp.id || 0,
    nombre: camp.nombre || "Sin nombre",
    categoria: camp.categoria,
    estado: camp.estado,
    numeroEquipos: camp.numeroEquipos || 0,
    etapas,
    etapaActiva: etapas.find(
      (e) => e.status === StageStatus.ACTIVE
    ),
  }
}

const mapArbitroToReferee = (arb: Arbitro): Referee => {
  // Mapear categoría a nivel y roles
  const categoriaToLevel: Record<string, number> = {
    FIFA: 10,
    "Nacional A": 8,
    "Nacional B": 7,
    Regional: 5,
    Provincial: 3,
  }

  const nivel = categoriaToLevel[arb.categoria || "Provincial"] || 3
  const roles: RefereeRole[] = [
    RefereeRole.PRINCIPAL,
    RefereeRole.ASISTENTE_1,
    RefereeRole.ASISTENTE_2,
  ]

  if (nivel >= 7) {
    roles.push(RefereeRole.CUARTO)
    roles.push(RefereeRole.VAR)
  }

  return {
    id: arb.id || 0,
    nombres: arb.nombre || "Sin nombre",
    apellido: arb.apellido || "",
    nombre: arb.nombre || "",
    dni: arb.dni || "",
    categoria: arb.categoria || "Provincial",
    nivel,
    especialidad: arb.especialidad || "General",
    experiencia: arb.experiencia || 0,
    roles,
    disponible: true,
    partidosHoy: Math.random() < 0.5 ? 0 : 1,
  }
}

const mapDesignacionToMatch = (des: Designacion, championship: Championship): Match => {
  return {
    id: `match-${des.id}`,
    idCampeonato: des.idCampeonato || championship.id,
    idEtapa: championship.etapaActiva?.id || 1,
    equipoLocal: {
      id: des.idEquipoLocal || 0,
      nombre: des.nombreEquipoLocal || "Equipo Local",
    },
    equipoVisitante: {
      id: des.idEquipoVisitante || 0,
      nombre: des.nombreEquipoVisitante || "Equipo Visitante",
    },
    fecha: des.fecha || new Date().toISOString().split("T")[0],
    hora: des.hora || "15:00",
    estadio: des.estadio || "Por definir",
    importancia: 5, // Valor por defecto
    rolesRequeridos: [
      RefereeRole.PRINCIPAL,
      RefereeRole.ASISTENTE_1,
      RefereeRole.ASISTENTE_2,
      RefereeRole.CUARTO,
    ],
    status: des.estado === "PROGRAMADA" ? MatchStatus.PENDING : MatchStatus.ASSIGNED,
    designaciones: {
      [RefereeRole.PRINCIPAL]: des.arbitroPrincipal ? parseInt(String(des.arbitroPrincipal)) : null,
      [RefereeRole.ASISTENTE_1]: des.arbitroAsistente1 ? parseInt(String(des.arbitroAsistente1)) : null,
      [RefereeRole.ASISTENTE_2]: des.arbitroAsistente2 ? parseInt(String(des.arbitroAsistente2)) : null,
      [RefereeRole.CUARTO]: des.cuartoArbitro ? parseInt(String(des.cuartoArbitro)) : null,
      [RefereeRole.VAR]: null,
      [RefereeRole.AVAR]: null,
    },
    createdAt: des.createdAt || new Date().toISOString(),
  }
}

// Generar partidos de ejemplo basado en etapas
const generateExampleMatches = (championship: Championship): Match[] => {
  if (!championship.etapaActiva) return []

  const etapa = championship.etapaActiva
  const numPartidos = Math.ceil(Math.random() * 4) + 2 // 2-6 partidos

  const matches: Match[] = []
  for (let i = 1; i <= numPartidos; i++) {
    const fecha = new Date(etapa.fecha_inicio)
    fecha.setDate(fecha.getDate() + Math.floor(Math.random() * 7))

    matches.push({
      id: `match-${etapa.id}-${i}`,
      idCampeonato: championship.id,
      idEtapa: etapa.id,
      equipoLocal: { id: i * 2 - 1, nombre: `Equipo Local ${i}` },
      equipoVisitante: { id: i * 2, nombre: `Equipo Visitante ${i}` },
      fecha: fecha.toISOString().split("T")[0],
      hora: `${String(15 + Math.floor(Math.random() * 3)).padStart(2, "0")}:00`,
      estadio: `Estadio ${String.fromCharCode(65 + (i % 26))}`,
      importancia: Math.ceil(Math.random() * 10),
      rolesRequeridos: [
        RefereeRole.PRINCIPAL,
        RefereeRole.ASISTENTE_1,
        RefereeRole.ASISTENTE_2,
        RefereeRole.CUARTO,
      ],
      status: MatchStatus.PENDING,
      designaciones: {
        [RefereeRole.PRINCIPAL]: null,
        [RefereeRole.ASISTENTE_1]: null,
        [RefereeRole.ASISTENTE_2]: null,
        [RefereeRole.CUARTO]: null,
        [RefereeRole.VAR]: null,
        [RefereeRole.AVAR]: null,
      },
      createdAt: new Date().toISOString(),
    })
  }

  return matches
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function NuevaDesignacionPage() {
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)
  const [showIntelligentMode, setShowIntelligentMode] = useState(false)

  // ZUSTAND STORE
  const {
    championships,
    referees,
    allMatches,
    teams,
    selectedStage,
    selectedChampionship,
    showSimulationResult,
    simulationResult,
    setChampionships,
    setReferees,
    setMatches,
    setTeams,
    getMatchesforStage,
  } = useDesignationStore()

  // CARGAR DATOS
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [campData, arbData] = await Promise.all([
          getCampeonatos(),
          getArbitros(),
        ])

        // Mapear datos de campeonatos
        const mappedChampionships = campData.map(mapCampeonatoToChampionship)
        const mappedReferees = arbData.map(mapArbitroToReferee)

        // Cargar designaciones reales del backend
        let allLoadedMatches: Match[] = []
        const designacionesPromises = mappedChampionships.map((camp) =>
          getDesignacionesByCampeonato(camp.id)
        )
        const designacionesArrays = await Promise.all(designacionesPromises)

        // Convertir designaciones a matches
        designacionesArrays.forEach((designaciones, index) => {
          const championship = mappedChampionships[index]
          const matches = designaciones
            .filter((des) => des.estado === "PROGRAMADA") // Solo designaciones sin asignar
            .map((des) => mapDesignacionToMatch(des, championship))
          allLoadedMatches = [...allLoadedMatches, ...matches]
        })

        setChampionships(mappedChampionships)
        setReferees(mappedReferees)
        setMatches(allLoadedMatches)

        toast({
          title: "Datos cargados",
          description: `${mappedChampionships.length} campeonatos, ${mappedReferees.length} árbitros, ${allLoadedMatches.length} partidos por designar`,
        })
      } catch (error) {
        console.error("Error cargando datos:", error)
        const message = error instanceof Error ? error.message : "Error desconocido"
        setErrorState(message)
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
  }, [setChampionships, setReferees, setMatches])

  // CARGAR EQUIPOS cuando se selecciona un campeonato
  useEffect(() => {
    async function loadTeams() {
      if (!selectedChampionship) {
        setTeams([])
        return
      }

      try {
        const equiposData = await getEquiposByCampeonato(selectedChampionship.id)
        
        // Mapear equipos a formato interno
        const mappedTeams = equiposData.map((eq) => ({
          id: eq.id || 0,
          nombre: eq.nombre || "Sin nombre",
          categoria: eq.categoria,
          provincia: eq.provincia,
          estadio: eq.estadio || eq.nombreEstadio,
        }))

        setTeams(mappedTeams)
        console.log(`✅ ${mappedTeams.length} equipos cargados para ${selectedChampionship.nombre}`)
      } catch (error) {
        console.error("Error cargando equipos:", error)
        setTeams([])
      }
    }

    loadTeams()
  }, [selectedChampionship, setTeams])

  // OBTENER PARTIDOS DE LA ETAPA ACTUAL
  const matchesForStage = getMatchesforStage()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-slate-400">Cargando sistema de designación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER - Simplificado para usuarios mayores */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button + Title */}
            <div className="flex items-center gap-3 flex-1">
              <Link href="/dashboard/designaciones">
                <Button
                  variant="ghost"
                  size="lg"
                  className="hover:bg-blue-600/20 flex-shrink-0 h-12 w-12"
                >
                  <ChevronLeft className="w-6 h-6 text-blue-400" />
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Designación de Árbitros
              </h1>
            </div>

            {/* Contador de Árbitros disponibles */}
            <div className="text-center bg-blue-600/20 rounded-lg px-4 py-2 border border-blue-600/50">
              <p className="text-xs text-blue-300 uppercase tracking-wide">Árbitros Disponibles</p>
              <p className="text-2xl font-bold text-blue-400">{referees.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {errorState && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 sm:p-4 bg-red-500/10 border border-red-600 rounded-lg">
            <p className="text-red-400 text-xs sm:text-sm">
              ⚠️ Error: {errorState}
            </p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - Dashboard Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DASHBOARD PRINCIPAL - Vista General */}
        {!selectedChampionship ? (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Selecciona un Campeonato
              </h2>
              <p className="text-base text-slate-300">
                Haz clic en un campeonato para gestionar sus designaciones semanales
              </p>
            </div>
            <DesignationDashboard
              championships={championships}
              selectedChampionship={selectedChampionship}
              onSelectChampionship={(camp) => {
                useDesignationStore.setState({ selectedChampionship: camp })
              }}
            />
          </div>
        ) : (
          /* VISTA DE CAMPEONATO SELECCIONADO */
          <div className="space-y-6 animate-in fade-in">
            {/* Header con campeonato seleccionado */}
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  ⚽ {selectedChampionship.nombre}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {selectedChampionship.categoria && `${selectedChampionship.categoria} • `}
                  {selectedChampionship.etapas?.length || 0} etapas
                </p>
              </div>
              <button
                onClick={() => {
                  useDesignationStore.setState({
                    selectedChampionship: null,
                    selectedStage: null,
                  })
                }}
                className="px-4 py-2 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors flex-shrink-0"
              >
                ← Atrás
              </button>
            </div>

            {/* Estado de designación por etapa */}
            <StageProgressPanel
              championship={selectedChampionship}
              matches={getMatchesforStage()}
            />

            {/* Selector de Etapa */}
            {selectedChampionship.etapas && selectedChampionship.etapas.length > 0 && (
              <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6">
                <p className="text-lg font-bold text-white mb-4">
                  Selecciona una Etapa
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedChampionship.etapas.map((stage) => {
                    const isSelected = selectedStage?.id === stage.id
                    const stageMatches = allMatches.filter(
                      (m) => m.idEtapa === stage.id
                    )
                    const completedMatches = stageMatches.filter(
                      (m) => m.designaciones?.principal !== null
                    )

                    return (
                      <button
                        key={stage.id}
                        onClick={() => {
                          useDesignationStore.setState({ selectedStage: stage })
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left font-semibold ${
                          isSelected
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-base font-bold">
                          {stage.nombre}
                        </p>
                        <p className="text-sm mt-2">
                          {completedMatches.length}/{stageMatches.length} designados
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contenido cuando hay etapa seleccionada */}
            {selectedStage && (
              <div className="space-y-6 animate-in fade-in">
                {/* Error Panel */}
                <ErrorPanel />

                {/* PANEL DE ASIGNACIÓN MANUAL - PRINCIPAL */}
                <div className="border-3 border-green-600 bg-green-500/15 rounded-lg p-6 shadow-lg">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-2xl font-bold text-green-200">
                      Designar Árbitros
                    </h3>
                  </div>
                  <AssignmentPanel
                    matches={getMatchesforStage()}
                    referees={referees}
                    onSimulate={(result) => {
                      console.log("Simulación completada:", result)
                    }}
                  />
                </div>

                {/* Team Selector para crear partidos - Debajo de Asignación */}
                <TeamSelector
                  teams={teams}
                  championship={selectedChampionship}
                  stage={selectedStage}
                />

                {/* SECCIÓN ASIGNACIÓN AUTOMÁTICA - COLAPSIBLE */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowIntelligentMode(!showIntelligentMode)}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 transition-all text-white font-bold text-lg flex items-center justify-between gap-3 group shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      Asignación Automática (Avanzado)
                    </span>
                    <span className={`transform transition-transform text-xl ${
                      showIntelligentMode ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>

                  {showIntelligentMode && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                      {/* Simulation Result */}
                      {showSimulationResult && simulationResult && (
                        <div>
                          <SimulationResultComponent
                            result={simulationResult}
                            onApply={() => {
                              toast({
                                title: "✅ Asignaciones aplicadas",
                                description: `${simulationResult.successCount} designaciones confirmadas`,
                              })
                            }}
                            onDiscard={() => {
                              toast({
                                title: "❌ Simulación descartada",
                                description: "Puedes ejecutar una nueva simulación",
                              })
                            }}
                          />
                        </div>
                      )}

                      {/* Partidos y Configuración del Algoritmo */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Match List - 2 cols desktop */}
                        <div className="lg:col-span-2">
                          <MatchList matches={getMatchesforStage()} />
                        </div>

                        {/* Algorithm Config - 1 col desktop */}
                        <div className="lg:col-span-1">
                          <div className="sticky top-20 sm:top-32 lg:top-20">
                            <AlgorithmConfigPanel />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
