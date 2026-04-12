/**
 * SELECTOR DE ÁRBITROS PARA ASIGNACIÓN MANUAL
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
  Input,
} from "@/components/ui/input"
import {
  CheckCircle2,
  Search,
  Award,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { Referee, Match, RefereeRole } from "../lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RefereeSelectorProps {
  referees: Referee[]
  match: Match | null
  role: RefereeRole | null
  onSelectReferee: (referee: Referee) => void
  isLoading?: boolean
}

export const RefereeSelector: React.FC<RefereeSelectorProps> = ({
  referees,
  match,
  role,
  onSelectReferee,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filteredReferees, setFilteredReferees] = React.useState(referees)

  React.useEffect(() => {
    const filtered = referees.filter((ref) => {
      const term = searchTerm.toLowerCase()
      const nombre = `${ref.nombres || ref.nombre || ""} ${ref.apellido || ""}`.toLowerCase()
      const dni = ref.dni?.toLowerCase() || ""
      return nombre.includes(term) || dni.includes(term)
    })
    setFilteredReferees(filtered)
  }, [searchTerm, referees])

  if (!match || !role) {
    return (
      <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Selecciona un partido y un rol para ver árbitros disponibles
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (referee: Referee) => {
    if (!referee.disponible) {
      return { label: "No disponible", color: "bg-red-500/20 text-red-300" }
    }
    if (referee.partidosHoy >= 2) {
      return {
        label: "Agenda llena",
        color: "bg-orange-500/20 text-orange-300",
      }
    }
    if (referee.partidosHoy === 1) {
      return { label: "1 partido", color: "bg-yellow-500/20 text-yellow-300" }
    }
    return { label: "Disponible", color: "bg-green-500/20 text-green-300" }
  }

  const getNivelColor = (nivel?: number) => {
    if (!nivel) return "bg-slate-600"
    if (nivel >= 8) return "bg-red-600"
    if (nivel >= 6) return "bg-orange-600"
    if (nivel >= 4) return "bg-yellow-600"
    return "bg-green-600"
  }

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-white text-sm md:text-base">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
          {match.equipoLocal.nombre || "Local"} vs{" "}
          {match.equipoVisitante.nombre || "Visitante"}
        </CardTitle>
        <p className="text-xs text-slate-400 mt-2">
          Rol requerido: <Badge className="bg-blue-500/20 text-blue-300 text-xs">{role}</Badge>
        </p>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* BÚSQUEDA */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-700 border-slate-600 text-white text-sm"
          />
        </div>

        {/* LISTA DE ÁRBITROS */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredReferees.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">
                {searchTerm
                  ? "No hay árbitros que coincidan con la búsqueda"
                  : "No hay árbitros disponibles"}
              </p>
            </div>
          ) : (
            filteredReferees.map((referee) => {
              const status = getStatusBadge(referee)
              const hasRole = referee.roles.includes(role)
              const canAssign =
                referee.disponible &&
                referee.partidosHoy < 2 &&
                hasRole

              return (
                <TooltipProvider key={referee.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() =>
                          canAssign && onSelectReferee(referee)
                        }
                        disabled={!canAssign || isLoading}
                        className={`w-full justify-between h-auto p-3 text-xs md:text-sm ${
                          canAssign
                            ? "border-green-600/30 bg-green-500/10 hover:bg-green-500/20 text-green-300 cursor-pointer"
                            : "border-red-600/30 bg-red-500/10 text-red-300 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <p className="font-semibold">
                            {referee.nombres ||
                              referee.nombre}
                          </p>
                          <p className="text-xs text-slate-400">
                            {referee.dni} • {referee.categoria}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          {/* Nivel */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getNivelColor(
                                    referee.nivel
                                  )}`}
                                >
                                  {referee.nivel || "?"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Nivel: {referee.nivel || "N/A"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Status */}
                          <Badge
                            variant="secondary"
                            className={`text-xs ${status.color}`}
                          >
                            {status.label}
                          </Badge>

                          {canAssign && (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        <p>
                          <strong>Nivel:</strong> {referee.nivel}/10
                        </p>
                        <p>
                          <strong>Especialidad:</strong>{" "}
                          {referee.especialidad || "N/A"}
                        </p>
                        <p>
                          <strong>Experiencia:</strong>{" "}
                          {referee.experiencia || 0} años
                        </p>
                        <p>
                          <strong>Roles:</strong>{" "}
                          {referee.roles?.join(", ")}
                        </p>
                        {!hasRole && (
                          <p className="text-red-400">
                            ⚠ No tiene el rol {role}
                          </p>
                        )}
                        {referee.partidosHoy >= 2 && (
                          <p className="text-orange-400">
                            ⚠ Agenda completa
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })
          )}
        </div>

        {/* RESUMEN */}
        <div className="bg-slate-700/30 rounded-lg p-3 space-y-1 text-xs border-t border-slate-700 mt-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Árbitros disponibles:</span>
            <span className="text-green-400 font-semibold">
              {filteredReferees.filter((r) => {
                const s = getStatusBadge(r)
                return s.label === "Disponible"
              }).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Búsqueda actual:</span>
            <span className="text-blue-400 font-semibold">
              {filteredReferees.length}/{referees.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
