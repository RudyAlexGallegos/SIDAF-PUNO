/**
 * SELECTOR DE EQUIPOS - Selecciona 2 equipos (local y visitante)
 */

"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Team, Match, RefereeRole, MatchStatus } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"
import { Search, Plus, X } from "lucide-react"

interface TeamSelectorProps {
  teams: Team[]
  championship: any
  stage: any
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  championship,
  stage,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [localTeam, setLocalTeam] = useState<Team | null>(null)
  const [visitantTeam, setVisitantTeam] = useState<Team | null>(null)
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("15:00")

  const { allMatches, setMatches } = useDesignationStore()

  const filteredTeams = useMemo(() => {
    return teams.filter((team) =>
      team.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [teams, searchTerm])

  const handleCreateMatch = () => {
    if (!localTeam || !visitantTeam) {
      alert("Selecciona 2 equipos diferentes")
      return
    }

    if (localTeam.id === visitantTeam.id) {
      alert("Los equipos deben ser diferentes")
      return
    }

    if (!fecha) {
      alert("Especifica la fecha del partido")
      return
    }

    // Crear nuevo partido temporal
    const newMatch: Match = {
      id: `match-new-${Date.now()}`, // ID temporal
      idCampeonato: championship.id,
      idEtapa: stage.id,
      equipoLocal: localTeam,
      equipoVisitante: visitantTeam,
      fecha,
      hora,
      estadio: "Por definir",
      importancia: 5,
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
    }

    // Agregar a lista de matches
    setMatches([...allMatches, newMatch])

    // Limpiar selección
    setLocalTeam(null)
    setVisitantTeam(null)
    setFecha("")
    setHora("15:00")
    setSearchTerm("")

    alert("✅ Partido creado. Puedes seleccionarlo en la sección de Partidos")
  }

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <CardTitle className="text-white text-xs sm:text-sm md:text-base flex items-center gap-2">
          ➕ Crear Partido
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Selecciona 2 equipos para crear un nuevo partido
        </p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs text-slate-300 mb-2">
            Buscar Equipos
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-xs bg-slate-700 border-slate-600"
            />
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredTeams.map((team) => {
            const isLocalSelected = localTeam?.id === team.id
            const isVisitantSelected = visitantTeam?.id === team.id
            const isSelected = isLocalSelected || isVisitantSelected

            return (
              <div
                key={team.id}
                className="p-2 rounded-lg bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-300 truncate font-medium">
                      {team.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {team.provincia && `${team.provincia}`}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={isLocalSelected ? "default" : "outline"}
                      onClick={() =>
                        isLocalSelected ? setLocalTeam(null) : setLocalTeam(team)
                      }
                      className="text-xs h-6 px-2"
                      title="Equipo Local"
                    >
                      L
                    </Button>
                    <Button
                      size="sm"
                      variant={isVisitantSelected ? "default" : "outline"}
                      onClick={() =>
                        isVisitantSelected
                          ? setVisitantTeam(null)
                          : setVisitantTeam(team)
                      }
                      className="text-xs h-6 px-2"
                      title="Equipo Visitante"
                    >
                      V
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTeams.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              No se encontraron equipos
            </p>
          )}
        </div>

        {/* Selección Actual */}
        {(localTeam || visitantTeam) && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-300">
              Equipos Seleccionados
            </p>
            <div className="flex items-center gap-2">
              {localTeam ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-600 text-xs">
                  L: {localTeam.nombre}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-slate-500">
                  Local
                </Badge>
              )}
              <span className="text-xs text-slate-400">VS</span>
              {visitantTeam ? (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-600 text-xs">
                  V: {visitantTeam.nombre}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-slate-500">
                  Visitante
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Fecha y Hora */}
        {localTeam && visitantTeam && (
          <div className="space-y-3 bg-slate-700/20 border border-slate-600/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-300">
              Detalles del Partido
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full h-8 text-xs bg-slate-700 border border-slate-600 rounded px-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full h-8 text-xs bg-slate-700 border border-slate-600 rounded px-2 text-white"
                />
              </div>
            </div>

            {/* Botón Crear */}
            <Button
              onClick={handleCreateMatch}
              className="w-full h-9 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" />
              Crear Partido
            </Button>
          </div>
        )}

        {/* Empty State */}
        {teams.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-500">
              No hay equipos disponibles. Selecciona un campeonato primero.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
