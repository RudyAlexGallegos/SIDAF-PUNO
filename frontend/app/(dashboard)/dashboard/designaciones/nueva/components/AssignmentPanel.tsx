/**
 * PANEL DE ASIGNACIÓN - Interfaz principal de designación
 */

"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Play,
  MousePointer,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Match, RefereeRole, Referee } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"
import { assignReferees } from "../lib/algorithm"
import { RefereeSelector } from "./RefereeSelector"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AssignmentPanelProps {
  matches: Match[]
  referees: Referee[]
  onSimulate?: (result: any) => void
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({
  matches,
  referees,
  onSimulate,
}) => {
  const {
    algorithmConfig,
    selectedMatches,
    selectedMatchForManual,
    selectedRoleForManual,
    selectMatchForManual,
    selectRoleForManual,
    setSimulationResult,
    setIsSimulating,
    setShowSimulationResult,
  } = useDesignationStore()

  const [manualMode, setManualMode] = React.useState(false)
  const [isRunning, setIsRunning] = React.useState(false)

  // Obtener partidos para procesar
  const matchesToProcess = selectedMatches.length > 0
    ? matches.filter((m) => selectedMatches.includes(m.id))
    : matches

  // Roles requeridos por defecto
  const defaultRoles: RefereeRole[] = [
    RefereeRole.PRINCIPAL,
    RefereeRole.ASISTENTE_1,
    RefereeRole.ASISTENTE_2,
    RefereeRole.CUARTO,
  ]

  const handleRunSimulation = async () => {
    try {
      setIsRunning(true)
      setIsSimulating(true)

      // Simular delay para mostrar loading
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Ejecutar algoritmo
      const result = assignReferees(
        matchesToProcess,
        referees,
        algorithmConfig
      )

      setSimulationResult(result)
      setShowSimulationResult(true)

      if (onSimulate) {
        onSimulate(result)
      }
    } catch (error) {
      console.error("Error en simulación:", error)
    } finally {
      setIsRunning(false)
      setIsSimulating(false)
    }
  }

  const rolesRequeridos = Array.from(
    new Set(
      matchesToProcess.flatMap((m) => m.rolesRequeridos || defaultRoles)
    )
  )

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-sm md:text-base">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            Panel de Asignación
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
            {matchesToProcess.length} partidos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs defaultValue="auto" className="w-full space-y-4">
          {/* TABS */}
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger
              value="auto"
              className="text-xs md:text-sm"
            >
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Automática
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-xs md:text-sm"
            >
              <MousePointer className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Manual
            </TabsTrigger>
          </TabsList>

          {/* MODE: AUTOMÁTICA */}
          <TabsContent value="auto" className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-600/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-blue-300 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Modo Simulación
              </p>
              <p className="text-xs text-blue-400">
                El algoritmo procesará {matchesToProcess.length} partido(s) y
                asignará {rolesRequeridos.length} rol(es) basado en la
                configuración actual.
              </p>
            </div>

            {/* Resumen de configuración */}
            <div className="bg-slate-700/30 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Peso Nivel:</span>
                <span className="text-purple-400 font-semibold">
                  {Math.round(algorithmConfig.weightLevel * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peso Carga:</span>
                <span className="text-blue-400 font-semibold">
                  {Math.round(algorithmConfig.weightLoad * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Peso Diversidad:</span>
                <span className="text-green-400 font-semibold">
                  {Math.round(algorithmConfig.weightDiversity * 100)}%
                </span>
              </div>
            </div>

            {/* Botón */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleRunSimulation}
                    disabled={
                      isRunning || matchesToProcess.length === 0
                    }
                    className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-semibold text-sm disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Simulando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Ejecutar Simulación
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {matchesToProcess.length === 0
                    ? "Selecciona al menos un partido"
                    : "Ejecutar algoritmo de designación"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <p className="text-xs text-slate-400 italic">
              💡 Tip: Puedes ver una vista previa sin guardar. Los cambios se
              confirman en el siguiente paso.
            </p>
          </TabsContent>

          {/* MODE: MANUAL */}
          <TabsContent value="manual" className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-600/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-blue-300 font-semibold flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Asignación Manual
              </p>
              <p className="text-xs text-blue-400">
                Selecciona un partido, elige el rol y asigna un árbitro manualmente.
              </p>
            </div>

            {/* Seleccionar Partido */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Selecciona un Partido
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {matchesToProcess.map((match) => (
                  <Button
                    key={match.id}
                    variant="outline"
                    onClick={() => selectMatchForManual(match)}
                    className={`justify-start text-xs h-auto p-2 ${
                      selectedMatchForManual?.id === match.id
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold">
                        {match.equipoLocal.nombre} vs{" "}
                        {match.equipoVisitante.nombre}
                      </p>
                      <p className="text-slate-400">
                        {new Date(match.fecha).toLocaleDateString()} @{" "}
                        {match.hora}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Seleccionar Rol */}
            {selectedMatchForManual && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Selecciona un Rol
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedMatchForManual.rolesRequeridos ||
                    defaultRoles).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      onClick={() => selectRoleForManual(role)}
                      className={`text-xs ${
                        selectedRoleForManual === role
                          ? "border-blue-400 bg-blue-400/10 text-blue-300"
                          : "border-slate-600 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {role === RefereeRole.PRINCIPAL && "👨‍⚖️ Principal"}
                      {role === RefereeRole.ASISTENTE_1 && "🚩 Asistente 1"}
                      {role === RefereeRole.ASISTENTE_2 && "🚩 Asistente 2"}
                      {role === RefereeRole.CUARTO && "🔄 Cuarto"}
                      {role === RefereeRole.VAR && "📹 VAR"}
                      {role === RefereeRole.AVAR && "📹 AVAR"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Árbitros */}
            {selectedMatchForManual && selectedRoleForManual && (
              <div className="pt-2 border-t border-slate-700">
                <RefereeSelector
                  referees={referees}
                  match={selectedMatchForManual}
                  role={selectedRoleForManual}
                  onSelectReferee={(referee) => {
                    console.log(
                      `Asignado: ${referee.nombres} como ${selectedRoleForManual}`
                    )
                    // Aquí se podría guardar la asignación
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
