/**
 * RESULTADOS DE SIMULACIÓN
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
import {
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  BarChart3,
  Zap,
} from "lucide-react"
import { SimulationResult, RefereeRole } from "../lib/types"
import { formatScore } from "../lib/algorithm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SimulationResultProps {
  result: SimulationResult
  onApply?: () => void
  onDiscard?: () => void
}

export const SimulationResultComponent: React.FC<SimulationResultProps> = ({
  result,
  onApply,
  onDiscard,
}) => {
  const successRate = Math.round(
    (result.successCount / Math.max(result.totalMatches, 1)) * 100
  )

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-sm md:text-base">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            Resultados de Simulación
          </CardTitle>
          <Badge
            className={`text-xs ${
              successRate >= 80
                ? "bg-green-500/20 text-green-300"
                : successRate >= 50
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-red-500/20 text-red-300"
            }`}
          >
            {successRate}% Éxito
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-green-500/10 border border-green-600 rounded-lg p-3 text-center cursor-help">
                  <p className="text-xs text-slate-400">Asignadas</p>
                  <p className="text-lg md:text-xl font-bold text-green-400">
                    {result.successCount}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Partidos con árbitros asignados correctamente
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-red-500/10 border border-red-600 rounded-lg p-3 text-center cursor-help">
                  <p className="text-xs text-slate-400">Con Error</p>
                  <p className="text-lg md:text-xl font-bold text-red-400">
                    {result.errorCount}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Partidos sin árbitros disponibles
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-blue-500/10 border border-blue-600 rounded-lg p-3 text-center cursor-help">
                  <p className="text-xs text-slate-400">Score Promedio</p>
                  <p className="text-lg md:text-xl font-bold text-blue-400">
                    {formatScore(result.statistics.averageScore)}%
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Calidad promedio de las asignaciones (0-100)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-purple-500/10 border border-purple-600 rounded-lg p-3 text-center cursor-help">
                  <p className="text-xs text-slate-400">Diversidad</p>
                  <p className="text-lg md:text-xl font-bold text-purple-400">
                    {formatScore(result.statistics.diversityMetric)}%
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Distribución equitativa entre árbitros (0-100)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-300">
              Asignaciones Exitosas
            </p>
            <span className="text-xs text-slate-400">
              {result.successCount}/{result.totalMatches}
            </span>
          </div>
          <Progress
            value={successRate}
            className="h-2 bg-slate-700"
          />
        </div>

        {/* LISTA DE ERRORES (si existen) */}
        {result.errors.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs font-semibold text-slate-300">
                Errores ({result.errors.length})
              </p>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.errors.map((error, idx) => (
                <div
                  key={idx}
                  className="bg-red-500/10 border border-red-600/30 rounded px-2 py-1.5 text-xs text-red-300"
                >
                  <p className="font-semibold">Partido {error.matchId}</p>
                  <p className="text-red-400">{error.role}: {error.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETALLES DE ASIGNACIONES */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Eye className="w-3 h-3 mr-2" />
              Ver Detalles de Asignaciones
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                Detalles de Asignaciones
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {result.assignments.map((assignment, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 p-3 rounded text-xs ${
                    assignment.selectedReferee
                      ? "border-green-600 bg-green-500/10"
                      : "border-red-600 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold">
                      {assignment.match.equipoLocal.nombre || "Local"} vs{" "}
                      {assignment.match.equipoVisitante.nombre || "Visitante"}
                    </p>
                    {assignment.selectedReferee ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-slate-400">
                    Rol: {assignment.role.toUpperCase()}
                  </p>

                  {assignment.selectedReferee ? (
                    <p className="text-green-400 mt-1">
                      ✓ {assignment.selectedReferee.nombres ||
                        assignment.selectedReferee.nombre}
                    </p>
                  ) : (
                    <p className="text-red-400 mt-1">{assignment.error}</p>
                  )}

                  {assignment.warnings.length > 0 && (
                    <div className="mt-1 text-yellow-400">
                      {assignment.warnings.map((w, widx) => (
                        <p key={widx} className="text-xs">
                          ⚠ {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* ESTADÍSTICAS */}
        <div className="bg-slate-700/30 rounded-lg p-3 space-y-1 text-xs">
          <p className="text-slate-300">
            <span className="font-semibold">Carga Promedio:</span>{" "}
            <span className="text-slate-200">
              {result.statistics.averageLoadPerReferee.toFixed(2)} partidos/árbitro
            </span>
          </p>
          <p className="text-slate-300">
            <span className="font-semibold">Fecha:</span>{" "}
            <span className="text-slate-400">
              {new Date(result.timestamp).toLocaleString("es-PE")}
            </span>
          </p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          {onApply && (
            <Button
              onClick={onApply}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Aplicar Asignaciones
            </Button>
          )}
          {onDiscard && (
            <Button
              onClick={onDiscard}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Descartar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
