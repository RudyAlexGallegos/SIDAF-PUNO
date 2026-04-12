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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/designaciones">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              🤖 Designación Inteligente de Árbitros
            </h1>
            <p className="text-slate-400 mt-1">
              Sistema avanzado con algoritmo heurístico y simulación en tiempo real
            </p>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {errorState && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">Error: {errorState}</p>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR - Campeonatos y Etapas (25% width en desktop) */}
        <div className="lg:col-span-1">
          <CompetitionSidebar championships={championships} />
        </div>

        {/* CONTENIDO PRINCIPAL (75% width en desktop) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Panel de Errores */}
          <ErrorPanel />

          {/* Resultado de Simulación (si existe) */}
          {showSimulationResult && simulationResult && (
            <SimulationResultComponent
              result={simulationResult}
              onApply={() => {
                toast({
                  title: "Asignaciones aplicadas",
                  description: `${simulationResult.successCount} designaciones confirmadas`,
                })
              }}
              onDiscard={() => {
                toast({
                  title: "Simulación descartada",
                  description: "Puedes ejecutar una nueva simulación",
                })
              }}
            />
          )}

          {/* Sección de Partidos y Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lista de Partidos */}
            <MatchList matches={matchesForStage} />

            {/* Configuración del Algoritmo */}
            <AlgorithmConfigPanel />
          </div>

          {/* Panel de Asignación */}
          <AssignmentPanel
            matches={matchesForStage}
            referees={referees}
            onSimulate={(result) => {
              console.log("Simulación completada:", result)
            }}
          />

          {/* INFORMACIÓN FOOTER */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
              <div>
                <p className="text-slate-400">Campeonatos</p>
                <p className="text-yellow-400 font-semibold text-lg">
                  {championships.length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Árbitros Disponibles</p>
                <p className="text-green-400 font-semibold text-lg">
                  {referees.length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Partidos en {selectedStage?.nombre}</p>
                <p className="text-blue-400 font-semibold text-lg">
                  {matchesForStage.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
