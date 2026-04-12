/**
 * DASHBOARD DE DESIGNACIONES - Vista General
 * Muestra estado de designaciones por campeonato
 */

"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { Championship, Stage } from "../lib/types"
import { Button } from "@/components/ui/button"

interface DesignationDashboardProps {
  championships: Championship[]
  selectedChampionship: Championship | null
  onSelectChampionship: (championship: Championship) => void
}

/**
 * Determina el estado de designación de un campeonato
 * Estados: PENDIENTE | EN_PROGRESO | COMPLETADO
 */
const getChampionshipStatus = (
  championship: Championship
): "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" => {
  // Por ahora, consideramos que:
  // - PENDIENTE: Campeonato sin designaciones iniciadas
  // - EN_PROGRESO: Campeonato con algunas etapas designadas
  // - COMPLETADO: Todas las etapas tienen designaciones

  if (
    !championship.etapas ||
    championship.etapas.length === 0
  ) {
    return "PENDIENTE"
  }

  // Simulación: Si el campeonato está ACTIVO, está EN_PROGRESO
  if (championship.estado === "ACTIVO") {
    return "EN_PROGRESO"
  }

  // Si está finalizado, consideramos completo
  if (championship.estado === "FINALIZADO") {
    return "COMPLETADO"
  }

  return "PENDIENTE"
}

const getStatusConfig = (
  status: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO"
) => {
  switch (status) {
    case "COMPLETADO":
      return {
        icon: CheckCircle2,
        label: "✅ Completo",
        color: "text-green-400",
        bg: "bg-green-500/10",
        borderColor: "border-green-600",
        badge: "bg-green-500/20 text-green-300 border-green-600",
      }
    case "EN_PROGRESO":
      return {
        icon: Clock,
        label: "⏳ En Progreso",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        borderColor: "border-yellow-600",
        badge: "bg-yellow-500/20 text-yellow-300 border-yellow-600",
      }
    case "PENDIENTE":
      return {
        icon: AlertCircle,
        label: "⏸ Pendiente",
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        borderColor: "border-slate-600",
        badge: "bg-slate-500/20 text-slate-300 border-slate-600",
      }
  }
}

export const DesignationDashboard: React.FC<DesignationDashboardProps> = ({
  championships,
  selectedChampionship,
  onSelectChampionship,
}) => {
  // Calcular estadísticas
  const stats = useMemo(() => {
    const completed = championships.filter(
      (c) => getChampionshipStatus(c) === "COMPLETADO"
    ).length
    const inProgress = championships.filter(
      (c) => getChampionshipStatus(c) === "EN_PROGRESO"
    ).length
    const pending = championships.filter(
      (c) => getChampionshipStatus(c) === "PENDIENTE"
    ).length

    return { completed, inProgress, pending, total: championships.length }
  }, [championships])

  return (
    <div className="space-y-6">
      {/* RESUMEN GENERAL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completados */}
        <Card className="border-green-600/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-1">Completados</p>
              <p className="text-3xl font-bold text-green-400">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                de {stats.total} campeonatos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* En Progreso */}
        <Card className="border-yellow-600/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-yellow-400">
                {stats.inProgress}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                en designación semanal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-slate-600/50 bg-slate-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-slate-400">
                {stats.pending}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                sin iniciar designación
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROGRESO GENERAL */}
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader className="pb-3 border-b border-slate-700">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Progreso General de Designaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">Completitud</span>
                <span className="text-slate-300 font-semibold">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
              <Progress
                value={(stats.completed / stats.total) * 100}
                className="h-2 bg-slate-700"
              />
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-3 gap-2 text-xs mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-slate-400">
                  {stats.completed} Completados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-slate-400">
                  {stats.inProgress} En Progreso
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-400">
                  {stats.pending} Pendientes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE CAMPEONATOS */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">
          🏆 Estado por Campeonato
        </h3>

        {championships.length === 0 ? (
          <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                No hay campeonatos disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          championships.map((championship) => {
            const status = getChampionshipStatus(championship)
            const config = getStatusConfig(status)
            const IconComponent = config.icon
            const isSelected = selectedChampionship?.id === championship.id

            return (
              <Card
                key={championship.id}
                className={`border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `${config.borderColor} ${config.bg}`
                    : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50"
                }`}
                onClick={() => onSelectChampionship(championship)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info izquierda */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`w-5 h-5 ${config.color} flex-shrink-0`} />
                        <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                          {championship.nombre}
                        </h4>
                      </div>

                      {/* Categoría y Etapas */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {championship.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {championship.categoria}
                          </Badge>
                        )}
                        {championship.etapas && championship.etapas.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-500/20 text-blue-300 border-blue-600"
                          >
                            {championship.etapas.length} Etapa
                            {championship.etapas.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>

                      {/* Etapas */}
                      {championship.etapas && championship.etapas.length > 0 && (
                        <div className="text-xs text-slate-400 space-y-1">
                          <p className="font-medium">Etapas:</p>
                          <div className="flex flex-wrap gap-1">
                            {championship.etapas.map((etapa) => (
                              <Badge
                                key={etapa.id}
                                variant="secondary"
                                className="text-xs bg-slate-700/50"
                              >
                                {etapa.nombre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info derecha */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge className={`text-xs ${config.badge}`}>
                        {config.label}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
