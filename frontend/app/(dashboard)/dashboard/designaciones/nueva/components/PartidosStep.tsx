"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, ChevronRight, Trash2, ClipboardList } from "lucide-react"
import { Equipo, Partido as PartidoType } from "@/services/api"

interface Partido {
  id: string
  equipoLocal: Equipo
  equipoVisitante: Equipo
  arbitroPrincipal?: any
  asistente1?: any
  asistente2?: any
  cuartoArbitro?: any
  asesor?: any
}

interface PartidosStepProps {
  equiposDisponibles: Equipo[]
  partidos: Partido[]
  equipoLocal: Equipo | null
  equipoVisitante: Equipo | null
  onEquipoLocalChange: (equipo: Equipo | null) => void
  onEquipoVisitanteChange: (equipo: Equipo | null) => void
  onAgregarPartido: () => void
  onEliminarPartido: (id: string) => void
  onContinuar: () => void
}

export default function PartidosStep({
  equiposDisponibles,
  partidos,
  equipoLocal,
  equipoVisitante,
  onEquipoLocalChange,
  onEquipoVisitanteChange,
  onAgregarPartido,
  onEliminarPartido,
  onContinuar,
}: PartidosStepProps) {
  const equiposYaAsignados = new Set(
    partidos.flatMap((p) => [p.equipoLocal?.id, p.equipoVisitante?.id].filter(Boolean) as number[])
  )

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <section className="border-b pb-3 md:pb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
          Crear Partidos
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* SELECTOR DE EQUIPOS */}
        <div className="lg:col-span-3">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Arma el Partido
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Elige un equipo local y un visitante. Los equipos ya asignados aparecen deshabilitados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Equipo Local */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-3">
                  ⚽ Equipo Local
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {equiposDisponibles.map((eq) => {
                    const estaRepetido = equiposYaAsignados.has(eq.id)
                    return (
                      <button
                        key={eq.id}
                        onClick={() => !estaRepetido && onEquipoLocalChange(eq)}
                        disabled={estaRepetido}
                        className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                          equipoLocal?.id === eq.id
                            ? "border-purple-500 bg-purple-600 text-white shadow-md"
                            : estaRepetido
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                              : "border-gray-200 bg-white text-slate-700 hover:border-purple-400"
                        }`}
                      >
                        {eq.nombre.split(" ").slice(0, 2).join(" ")}
                        {estaRepetido && <span className="text-xs block">Asignado</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Equipo Visitante */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-3">
                  ✈️ Equipo Visitante
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {equiposDisponibles
                    .filter((eq) => eq.id !== equipoLocal?.id)
                    .map((eq) => {
                      const estaRepetido = equiposYaAsignados.has(eq.id)
                      return (
                        <button
                          key={eq.id}
                          onClick={() => !estaRepetido && onEquipoVisitanteChange(eq)}
                          disabled={estaRepetido}
                          className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                            equipoVisitante?.id === eq.id
                              ? "border-orange-500 bg-orange-600 text-white shadow-md"
                              : estaRepetido
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                : "border-gray-200 bg-white text-slate-700 hover:border-orange-400"
                          }`}
                        >
                          {eq.nombre.split(" ").slice(0, 2).join(" ")}
                          {estaRepetido && <span className="text-xs block">Asignado</span>}
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={onAgregarPartido}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar Partido
                </Button>
                <Button
                  onClick={onContinuar}
                  disabled={partidos.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LISTA DE PARTIDOS */}
        {partidos.length > 0 && (
          <div className="lg:col-span-3">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Partidos Creados ({partidos.length})
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Revisa los partidos antes de asignar árbitros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partidos.map((partido, idx) => (
                    <div
                      key={partido.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-blue-600 text-white">Partido {idx + 1}</Badge>
                        <button
                          onClick={() => onEliminarPartido(partido.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <p className="text-xs font-semibold text-slate-500 mb-1">LOCAL</p>
                          <p className="text-slate-900 font-semibold">{partido.equipoLocal.nombre}</p>
                        </div>
                        <div className="px-3">
                          <span className="text-slate-400 font-bold text-lg">VS</span>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-xs font-semibold text-slate-500 mb-1">VISITA</p>
                          <p className="text-slate-900 font-semibold">{partido.equipoVisitante.nombre}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
