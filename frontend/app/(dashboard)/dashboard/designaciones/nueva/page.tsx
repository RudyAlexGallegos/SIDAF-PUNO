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
import { MatchList } from "./components/MatchList"
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
  // Generar etapas de ejemplo si no existen
  const etapas: Stage[] = [
    {
      id: 1,
      nombre: "Fase 1: Grupos",
      idCampeonato: camp.id || 0,
      fecha_inicio: camp.estado ? new Date().toISOString() : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: camp.estado === "ACTIVO" ? StageStatus.ACTIVE : StageStatus.PLANNING,
      orden: 1,
      descripcion: "Fase de grupos",
    },
    {
      id: 2,
      nombre: "Fase 2: Eliminación Directa",
      idCampeonato: camp.id || 0,
      fecha_inicio: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_fin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: StageStatus.PLANNING,
      orden: 2,
      descripcion: "Fase eliminación",
    },
  ]

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

  // ZUSTAND STORE
  const {
    championships,
    referees,
    allMatches,
    selectedStage,
    selectedChampionship,
    showSimulationResult,
    simulationResult,
    setChampionships,
    setReferees,
    setMatches,
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
      {/* HEADER - Responsive */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button + Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link href="/dashboard/designaciones">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white/10 flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                  🤖 Designación de Árbitros
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                  Sistema inteligente con algoritmo heurístico
                </p>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="flex gap-3 lg:hidden">
              <div className="text-center">
                <p className="text-xs text-slate-400">Campeonatos</p>
                <p className="text-sm font-semibold text-yellow-400">
                  {championships.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Árbitros</p>
                <p className="text-sm font-semibold text-green-400">
                  {referees.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Desktop */}
        <div className="hidden lg:block border-t border-slate-700 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Campeonatos:</span>
                <span className="font-semibold text-yellow-400">
                  {championships.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Árbitros:</span>
                <span className="font-semibold text-green-400">
                  {referees.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  Partidos en {selectedStage?.nombre || "selecciona etapa"}:
                </span>
                <span className="font-semibold text-blue-400">
                  {getMatchesforStage().length}
                </span>
              </div>
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

      {/* MAIN CONTENT - Responsive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* SIDEBAR - Hidden on mobile, 25% on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <CompetitionSidebar championships={championships} />
            </div>
          </div>

          {/* MAIN CONTENT - Full width mobile, 75% desktop */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Mobile Championship Selector */}
            <div className="lg:hidden">
              {selectedChampionship ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">
                    Campeonato Seleccionado
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-yellow-400 mb-3">
                    {selectedChampionship.nombre}
                  </p>
                  <div className="space-y-2">
                    {selectedChampionship.etapas?.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          useDesignationStore.setState({ selectedStage: stage })
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedStage?.id === stage.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {stage.nombre}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      useDesignationStore.setState({ selectedChampionship: null })
                    }
                    className="w-full mt-3 px-3 py-2 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    Cambiar Campeonato
                  </button>
                </div>
              ) : (
                <CompetitionSidebar championships={championships} />
              )}
            </div>

            {/* Error Panel */}
            <ErrorPanel />

            {/* Simulation Result */}
            {showSimulationResult && simulationResult && (
              <div className="animate-in fade-in slide-in-from-top-2">
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

            {/* Matches and Algorithm - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Match List - Takes 2 cols on desktop, full on mobile */}
              <div className="lg:col-span-2">
                <MatchList matches={getMatchesforStage()} />
              </div>

              {/* Algorithm Config - Takes 1 col on desktop, full on mobile */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 sm:top-32 lg:top-20">
                  <AlgorithmConfigPanel />
                </div>
              </div>
            </div>

            {/* Assignment Panel - Full width */}
            <AssignmentPanel
              matches={getMatchesforStage()}
              referees={referees}
              onSimulate={(result) => {
                console.log("Simulación completada:", result)
              }}
            />

            {/* Footer Info - Responsive */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="min-w-0">
                  <p className="text-slate-400 truncate">Campeonatos</p>
                  <p className="text-lg sm:text-xl font-semibold text-yellow-400">
                    {championships.length}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 truncate">Árbitros</p>
                  <p className="text-lg sm:text-xl font-semibold text-green-400">
                    {referees.length}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 truncate">Partidos</p>
                  <p className="text-lg sm:text-xl font-semibold text-blue-400">
                    {getMatchesforStage().length}
                  </p>
                </div>
              </div>

              {selectedStage && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs sm:text-sm">
                  <p className="text-slate-400 mb-2">Etapa Seleccionada</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">
                      {selectedStage.nombre}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedStage.status === "active"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {selectedStage.status === "active"
                        ? "Activa"
                        : "Planificación"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
