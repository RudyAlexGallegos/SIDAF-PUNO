/**
 * COMPETICIÓN SIDEBAR - Selección de campeonatos y etapas
 */

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronDown, ChevronRight } from "lucide-react"
import { Championship, Stage } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"

interface CompetitionSidebarProps {
  championships: Championship[]
}

export const CompetitionSidebar: React.FC<CompetitionSidebarProps> = ({
  championships,
}) => {
  const {
    selectedChampionship,
    selectedStage,
    selectChampionship,
    selectStage,
  } = useDesignationStore()

  const [expandedChampionshipId, setExpandedChampionshipId] = React.useState<
    number | null
  >(null)

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full">
      <CardHeader className="pb-3 border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-white text-sm md:text-base">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          Campeonatos
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {championships.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-400">
            No hay campeonatos disponibles
          </p>
        ) : (
          championships.map((championship) => {
            const isExpanded = expandedChampionshipId === championship.id
            const isSelected = selectedChampionship?.id === championship.id

            return (
              <div key={championship.id} className="space-y-1">
                {/* Championship Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectChampionship(championship)
                    setExpandedChampionshipId(
                      isExpanded ? null : championship.id
                    )
                  }}
                  className={`w-full justify-start text-xs md:text-sm ${
                    isSelected
                      ? "bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 mr-1 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate flex-1 text-left">
                    {championship.nombre}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs bg-slate-700 text-slate-300 flex-shrink-0"
                  >
                    {championship.etapas?.length || 0}
                  </Badge>
                </Button>

                {/* Stages */}
                {isExpanded && championship.etapas && (
                  <div className="ml-4 space-y-1">
                    {championship.etapas.map((stage) => {
                      const isStageSelected =
                        selectedStage?.id === stage.id &&
                        selectedChampionship?.id === championship.id

                      return (
                        <Button
                          key={stage.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            selectStage(stage)
                          }}
                          className={`w-full justify-start text-xs ${
                            isStageSelected
                              ? "bg-blue-400/20 text-blue-300 hover:bg-blue-400/30"
                              : "text-slate-400 hover:bg-slate-700"
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0 bg-current" />
                          <span className="truncate flex-1 text-left">
                            {stage.nombre}
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-1 text-xs flex-shrink-0 ${
                              stage.status === "active"
                                ? "border-green-600 text-green-400"
                                : stage.status === "finished"
                                  ? "border-slate-600 text-slate-400"
                                  : "border-blue-600 text-blue-400"
                            }`}
                          >
                            {stage.status === "active"
                              ? "Activa"
                              : stage.status === "finished"
                                ? "Finalizada"
                                : "Planeación"}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
