/**
 * LISTA DE PARTIDOS - Visualización y selección de partidos
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Clock,
  Zap,
  Users,
  AlertCircle,
} from "lucide-react"
import { Match, MatchStatus } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MatchListProps {
  matches: Match[]
}

export const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  const { selectedMatches, toggleMatchSelection } = useDesignationStore()

  const getStatusBadgeColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.ASSIGNED:
        return "bg-green-500/20 text-green-300 border-green-600"
      case MatchStatus.COMPLETED:
        return "bg-blue-500/20 text-blue-300 border-blue-600"
      case MatchStatus.CANCELLED:
        return "bg-red-500/20 text-red-300 border-red-600"
      default:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-600"
    }
  }

  const getImportanceBadge = (importancia: number) => {
    if (importancia >= 8) return { label: "🔴 Crítico", bg: "bg-red-500/20 text-red-300" }
    if (importancia >= 5) return { label: "🟠 Alto", bg: "bg-orange-500/20 text-orange-300" }
    return { label: "🟡 Normal", bg: "bg-yellow-500/20 text-yellow-300" }
  }

  if (matches.length === 0) {
    return (
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">
            Selecciona una etapa para ver los partidos
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <CardTitle className="text-white text-sm md:text-base flex items-center justify-between">
          <span>Partidos</span>
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
            {matches.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          {selectedMatches.length} seleccionados
        </p>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {matches.map((match) => {
            const importanceInfo = getImportanceBadge(match.importancia)
            const isSelected = selectedMatches.includes(match.id)

            return (
              <div
                key={match.id}
                onClick={() => toggleMatchSelection(match.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-slate-700 bg-slate-700/50 hover:bg-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleMatchSelection(match.id)}
                    className="mt-1 flex-shrink-0"
                  />

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    {/* Equipos */}
                    <div className="text-xs md:text-sm font-semibold text-white mb-2">
                      <span className="truncate">
                        {match.equipoLocal.nombre || "Local"}
                      </span>
                      <span className="text-slate-400 mx-1">vs</span>
                      <span className="truncate">
                        {match.equipoVisitante.nombre || "Visitante"}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(match.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{match.hora}</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={`text-xs cursor-help ${importanceInfo.bg}`}
                            >
                              <Zap className="w-2.5 h-2.5 mr-0.5" />
                              {importanceInfo.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Importancia: {match.importancia}/10
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Badge
                        variant="outline"
                        className={`text-xs border ${getStatusBadgeColor(match.status)}`}
                      >
                        {match.status === MatchStatus.PENDING && "Pendiente"}
                        {match.status === MatchStatus.ASSIGNED && "Asignado"}
                        {match.status === MatchStatus.COMPLETED && "Completado"}
                        {match.status === MatchStatus.CANCELLED && "Cancelado"}
                      </Badge>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-slate-700 text-slate-200 cursor-help"
                            >
                              <Users className="w-2.5 h-2.5 mr-0.5" />
                              {match.rolesRequeridos?.length || 0} roles
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {match.rolesRequeridos?.join(", ")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Estadio */}
                    {match.estadio && (
                      <p className="text-xs text-slate-400 mt-2">
                        📍 {match.estadio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
