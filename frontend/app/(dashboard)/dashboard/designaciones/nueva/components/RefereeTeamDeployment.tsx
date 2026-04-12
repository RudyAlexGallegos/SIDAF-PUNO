/**
 * SISTEMA DE DESPLIEGUE DE TERNA ARBITRAL
 * Interfaz visual para asignar árbitros a cada posición de un partido
 * Diseñado para máxima claridad y facilidad de uso
 */

"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle2,
  User,
  Users,
} from "lucide-react"
import { Match, Referee, RefereeRole } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"

interface RefereeTeamDeploymentProps {
  matches: Match[]
  referees: Referee[]
}

// Configuración de roles para la terna arbitral
const TERNA_ROLES = [
  {
    role: RefereeRole.PRINCIPAL,
    label: "Árbitro Principal",
    description: "Controla el partido",
    color: "bg-blue-600",
    lightColor: "bg-blue-500/20",
    borderColor: "border-blue-600",
  },
  {
    role: RefereeRole.ASISTENTE_1,
    label: "Asistente 1",
    description: "Costado izquierdo",
    color: "bg-purple-600",
    lightColor: "bg-purple-500/20",
    borderColor: "border-purple-600",
  },
  {
    role: RefereeRole.ASISTENTE_2,
    label: "Asistente 2",
    description: "Costado derecho",
    color: "bg-cyan-600",
    lightColor: "bg-cyan-500/20",
    borderColor: "border-cyan-600",
  },
  {
    role: RefereeRole.CUARTO,
    label: "Árbitro Cuarto",
    description: "Suplente",
    color: "bg-orange-600",
    lightColor: "bg-orange-500/20",
    borderColor: "border-orange-600",
  },
]

export const RefereeTeamDeployment: React.FC<RefereeTeamDeploymentProps> = ({
  matches,
  referees,
}) => {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const setMatches = useDesignationStore((state) => state.setMatches)

  // Función para asignar un árbitro a un rol específico
  const assignRefereeToMatch = (
    matchId: string,
    role: RefereeRole,
    refereeId: number | null
  ) => {
    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return {
          ...match,
          designaciones: {
            ...match.designaciones,
            [role]: refereeId ? referees.find((r) => r.id === refereeId) || null : null,
          },
        }
      }
      return match
    })
    setMatches(updatedMatches)
  }

  // Contar cuántos roles están asignados en un partido
  const countAssignedRoles = (match: Match): number => {
    return TERNA_ROLES.filter((t) => match.designaciones?.[t.role]).length
  }

  if (matches.length === 0) {
    return (
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No hay partidos para designar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* ENCABEZADO */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Conformar Terna Arbitral
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Asigna árbitros a cada posición de los partidos
        </p>
      </div>

      {/* LISTA DE PARTIDOS */}
      <div className="space-y-3">
        {matches.map((match) => {
          const isExpanded = expandedMatch === match.id
          const assignedCount = countAssignedRoles(match)
          const isComplete = assignedCount === TERNA_ROLES.length

          return (
            <Card
              key={match.id}
              className={`border-2 transition-all cursor-pointer ${
                isExpanded
                  ? "border-green-600 bg-green-500/10"
                  : isComplete
                  ? "border-green-600/50 bg-green-500/5"
                  : "border-slate-700 bg-slate-800/30"
              }`}
              onClick={() =>
                setExpandedMatch(isExpanded ? null : match.id)
              }
            >
              {/* ENCABEZADO DEL PARTIDO */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isComplete && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                      <p className="text-sm font-bold text-white truncate">
                        {match.equipoLocal.nombre} vs {match.equipoVisitante.nombre}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {match.fecha} • {match.hora} • {match.estadio}
                    </p>
                  </div>

                  {/* BADGE DE PROGRESO */}
                  <div className="flex-shrink-0 text-right">
                    <Badge
                      className={`text-xs font-bold ${
                        isComplete
                          ? "bg-green-600 text-white"
                          : "bg-slate-600 text-slate-100"
                      }`}
                    >
                      {assignedCount}/{TERNA_ROLES.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* CONTENIDO EXPANDIBLE - TERNA ARBITRAL */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4">
                  <div className="border-t border-slate-700 pt-4">
                    {/* Grid de roles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {TERNA_ROLES.map((t) => {
                        const assignedReferee = match.designaciones?.[t.role]

                        return (
                          <div
                            key={t.role}
                            className={`p-4 rounded-lg border-2 ${t.lightColor} ${t.borderColor}`}
                          >
                            {/* Etiqueta del rol */}
                            <div className="mb-3">
                              <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                                {t.label}
                              </p>
                              <p className="text-xs text-slate-400">
                                {t.description}
                              </p>
                            </div>

                            {/* Selector de árbitro */}
                            <div className="space-y-2">
                              {assignedReferee ? (
                                <div className="flex items-center gap-2 p-2 bg-white/10 rounded border border-white/20">
                                  <User className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-semibold text-white flex-1 truncate">
                                    {assignedReferee.nombre}
                                  </span>
                                  <button
                                    onClick={() =>
                                      assignRefereeToMatch(match.id, t.role, null)
                                    }
                                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <Select
                                  onValueChange={(value) => {
                                    if (value === "clear") {
                                      assignRefereeToMatch(
                                        match.id,
                                        t.role,
                                        null
                                      )
                                    } else {
                                      assignRefereeToMatch(
                                        match.id,
                                        t.role,
                                        parseInt(value)
                                      )
                                    }
                                  }}
                                >
                                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-300 h-10">
                                    <SelectValue placeholder="Seleccionar árbitro" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    {referees.map((ref) => (
                                      <SelectItem
                                        key={ref.id}
                                        value={ref.id.toString()}
                                        className="text-slate-200"
                                      >
                                        {ref.nombre} ({ref.categoria || "N/D"})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* ACCIONES */}
                    <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                      {isComplete && (
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Aquí guardar si es necesario
                          }}
                        >
                          ✓ Terna Completa
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedMatch(null)
                        }}
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* NOTA INFORMATIVA */}
      <div className="bg-blue-500/10 border border-blue-600/30 rounded-lg p-4 text-xs text-blue-300">
        <p className="font-semibold mb-1">💡 Cómo usar</p>
        <p>Haz clic en cada partido para expandirlo. Selecciona un árbitro para cada posición. Los partidos completos se marcan con ✓</p>
      </div>
    </div>
  )
}
