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
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-700 flex-shrink-0">
        <CardTitle className="text-white text-xs sm:text-sm md:text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            ⚽ Partidos
          </span>
          <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
            {matches.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          {selectedMatches.length} / {matches.length} seleccionados
        </p>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 flex-1 overflow-y-auto">
        <div className="space-y-2 sm:space-y-3">
          {matches.map((match) => {
            const importanceInfo = getImportanceBadge(match.importancia)
            const isSelected = selectedMatches.includes(match.id)

            return (
              <div
                key={match.id}
                onClick={() => toggleMatchSelection(match.id)}
                className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                    : "border-slate-700 bg-slate-700/30 hover:bg-slate-700/50 active:bg-slate-700"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleMatchSelection(match.id)}
                    className="mt-1 flex-shrink-0 h-4 w-4"
                  />

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    {/* Equipos - Responsive */}
                    <div className="text-xs sm:text-sm font-semibold text-white mb-2 line-clamp-2">
                      <span className="truncate inline">
                        {match.equipoLocal.nombre || "Local"}
                      </span>
                      <span className="text-slate-400 mx-0.5 sm:mx-1">vs</span>
                      <span className="truncate inline">
                        {match.equipoVisitante.nombre || "Visitante"}
                      </span>
                    </div>

                    {/* Metadata - Grid responsive */}
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs text-slate-300 mb-2">
                      <div className="flex items-center gap-1 min-w-0">
                        <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(match.fecha).toLocaleDateString("es-PE", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span>{match.hora}</span>
                      </div>
                    </div>

                    {/* Badges - Responsive wrap */}
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
                        {match.status === MatchStatus.ASSIGNED && "✓ Asignado"}
                        {match.status === MatchStatus.COMPLETED && "✓ Completado"}
                        {match.status === MatchStatus.CANCELLED && "✗ Cancelado"}
                      </Badge>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-slate-700 text-slate-200 cursor-help"
                            >
                              <Users className="w-2.5 h-2.5 mr-0.5" />
                              {match.rolesRequeridos?.length || 0}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {match.rolesRequeridos?.join(", ")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
