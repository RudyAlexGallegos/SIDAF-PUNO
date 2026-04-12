/**
 * PROGRESO DE ETAPAS - Muestra progreso de designaciones por etapa
 */

"use client"

import React, { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Championship, Match } from "../lib/types"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface StageProgressPanelProps {
  championship: Championship
  matches: Match[]
}

export const StageProgressPanel: React.FC<StageProgressPanelProps> = ({
  championship,
  matches,
}) => {
  // Calcular estado por etapa
  const stageStats = useMemo(() => {
    if (!championship.etapas) return {}

    return championship.etapas.reduce(
      (acc, stage) => {
        const stageMatches = matches.filter((m) => m.idEtapa === stage.id)
        const completedMatches = stageMatches.filter((m) => {
          // Un partido se considera "designado" si tiene árbitro principal
          return m.designaciones && m.designaciones.principal !== null
        })

        acc[stage.id] = {
          total: stageMatches.length,
          completed: completedMatches.length,
          pending: stageMatches.length - completedMatches.length,
          percentage:
            stageMatches.length > 0
              ? Math.round((completedMatches.length / stageMatches.length) * 100)
              : 0,
        }

        return acc
      },
      {} as Record<
        number,
        {
          total: number
          completed: number
          pending: number
          percentage: number
        }
      >
    )
  }, [championship.etapas, matches])

  if (!championship.etapas || championship.etapas.length === 0) {
    return (
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            No hay etapas definidas para este campeonato
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <CardTitle className="text-sm text-white flex items-center gap-2">
          📊 Estado de Designaciones por Etapa
        </CardTitle>
        <CardDescription className="text-xs">
          {championship.nombre} - Progreso semanal
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {championship.etapas.map((stage) => {
          const stats = stageStats[stage.id]

          if (!stats) {
            return (
              <div key={stage.id} className="rounded-lg bg-slate-700/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-medium text-slate-300">
                    {stage.nombre}
                  </p>
                </div>
                <p className="text-xs text-slate-500">Sin partidos asignados</p>
              </div>
            )
          }

          const isComplete = stats.pending === 0 && stats.total > 0
          const isInProgress = stats.completed > 0 && stats.pending > 0
          const isPending = stats.completed === 0

          let statusIcon, statusLabel, statusColor
          if (isComplete) {
            statusIcon = <CheckCircle2 className="w-4 h-4 text-green-400" />
            statusLabel = "Completo"
            statusColor = "bg-green-500/10 border-green-600/30"
          } else if (isInProgress) {
            statusIcon = <Clock className="w-4 h-4 text-yellow-400" />
            statusLabel = "En Progreso"
            statusColor = "bg-yellow-500/10 border-yellow-600/30"
          } else {
            statusIcon = <AlertCircle className="w-4 h-4 text-slate-500" />
            statusLabel = "Pendiente"
            statusColor = "bg-slate-500/10 border-slate-600/30"
          }

          return (
            <div
              key={stage.id}
              className={`rounded-lg border p-4 ${statusColor} transition-all`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <h5 className="text-sm font-semibold text-white">
                    {stage.nombre}
                  </h5>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    isComplete
                      ? "bg-green-500/20 text-green-300 border-green-600"
                      : isInProgress
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-600"
                        : "bg-slate-500/20 text-slate-300 border-slate-600"
                  }`}
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Descripción */}
              <p className="text-xs text-slate-400 mb-3">{stage.descripcion}</p>

              {/* Estadísticas */}
              <div className="space-y-2">
                {/* Números */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Partidos designados: <span className="font-semibold text-white">{stats.completed}</span> /{" "}
                    <span className="font-semibold text-slate-300">{stats.total}</span>
                  </span>
                  <span className="font-bold text-white">{stats.percentage}%</span>
                </div>

                {/* Barra de progreso */}
                <Progress
                  value={stats.percentage}
                  className="h-2 bg-slate-700"
                />

                {/* Estado detallado */}
                <div className="flex gap-3 text-xs mt-2 pt-2 border-t border-slate-600/50">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <span className="text-slate-400">
                      {stats.completed} Completados
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-slate-400">
                      {stats.pending} Pendientes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
