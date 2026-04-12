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
import { RefereeTeamDeployment } from "./RefereeTeamDeployment"
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
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 w-full">
      <CardHeader className="pb-3 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-base md:text-lg">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            Panel de Asignación
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-300 text-xs sm:text-sm w-fit">
            {matchesToProcess.length} partido{matchesToProcess.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        <Tabs defaultValue="auto" className="w-full space-y-4">
          {/* TABS - Responsive */}
          <TabsList className="grid w-full grid-cols-2 bg-slate-700 h-auto p-1">
            <TabsTrigger
              value="auto"
              className="text-xs sm:text-sm py-2"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Automática</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-xs sm:text-sm py-2"
            >
              <MousePointer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Manual</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
          </TabsList>

          {/* MODE: AUTOMÁTICA */}
          <TabsContent value="auto" className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-600/30 rounded-lg p-3 space-y-2">
              <p className="text-xs sm:text-sm text-blue-300 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                Modo Simulación
              </p>
              <p className="text-xs text-blue-400">
                El algoritmo procesará {matchesToProcess.length} partido{matchesToProcess.length !== 1 ? "s" : ""} y
                asignará {rolesRequeridos.length} rol{rolesRequeridos.length !== 1 ? "es" : ""}.
              </p>
            </div>

            {/* Resumen de configuración - Responsive */}
            <div className="bg-slate-700/30 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peso Nivel:</span>
                <span className="text-purple-400 font-semibold">
                  {Math.round(algorithmConfig.weightLevel * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peso Carga:</span>
                <span className="text-blue-400 font-semibold">
                  {Math.round(algorithmConfig.weightLoad * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peso Diversidad:</span>
                <span className="text-green-400 font-semibold">
                  {Math.round(algorithmConfig.weightDiversity * 100)}%
                </span>
              </div>
            </div>

            {/* Botón - Responsive */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleRunSimulation}
                    disabled={
                      isRunning || matchesToProcess.length === 0
                    }
                    className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-semibold text-sm sm:text-base disabled:opacity-50 py-2 sm:py-3"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                        <span className="hidden sm:inline">Simulando...</span>
                        <span className="sm:hidden">Simulación...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">Ejecutar Simulación</span>
                        <span className="sm:hidden">Ejecutar</span>
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

            <p className="text-xs text-slate-400 italic text-center">
              💡 Simulación sin guardar. Confirma en el siguiente paso.
            </p>
          </TabsContent>

          {/* MODE: MANUAL - TERNA ARBITRAL */}
          <TabsContent value="manual" className="space-y-3">
            <RefereeTeamDeployment 
              matches={matchesToProcess} 
              referees={referees} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
