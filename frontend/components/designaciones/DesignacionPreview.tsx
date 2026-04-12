"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  ChevronLeft,
  Save,
  Loader,
  Trophy,
  Users,
  Shield,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react"
import type { Arbitro, Campeonato } from "@/services/api"

interface Partido {
  id: string
  equipoLocalId: number
  equipoVisitanteId: number
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  hora: string
  estadio: string
  modalidad?: string
}

interface DesignacionPreviewProps {
  campeonato: Campeonato
  partido: Partido
  arbitroPrincipal: Arbitro | null
  arbitroAsistente1: Arbitro | null
  arbitroAsistente2: Arbitro | null
  arbitroCuarto: Arbitro | null
  onConfirmar: () => void
  onBack: () => void
  saving: boolean
}

export default function DesignacionPreview({
  campeonato,
  partido,
  arbitroPrincipal,
  arbitroAsistente1,
  arbitroAsistente2,
  arbitroCuarto,
  onConfirmar,
  onBack,
  saving,
}: DesignacionPreviewProps) {
  const getNombreCompleto = (arbitro: Arbitro | null) => {
    if (!arbitro) return "-"
    return `${arbitro.nombres || arbitro.nombre} ${arbitro.apellidoPaterno || arbitro.apellido || ""}`.trim()
  }

  const getCategoriaColor = (categoria?: string) => {
    switch (categoria?.toLowerCase()) {
      case "fifa":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "nacional":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "regional":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const arbitros = [
    { titulo: "Principal", arbitro: arbitroPrincipal, icon: Shield },
    { titulo: "Asistente 1", arbitro: arbitroAsistente1, icon: Users },
    { titulo: "Asistente 2", arbitro: arbitroAsistente2, icon: Users },
    { titulo: "Cuarto", arbitro: arbitroCuarto, icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              Resumen de la Designación
            </h2>
            <p className="text-slate-400">
              Revisa los datos antes de guardar
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            disabled={saving}
            className="hover:bg-white/10 text-white border-slate-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Campeonato y Partido */}
        <div className="space-y-4">
          {/* Campeonato */}
          <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Campeonato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="text-lg font-semibold text-white">{campeonato.nombre}</p>
              </div>
              {campeonato.categoria && (
                <div>
                  <p className="text-sm text-slate-400">Categoría</p>
                  <Badge className="bg-slate-700 text-slate-300 border-slate-600">
                    {campeonato.categoria}
                  </Badge>
                </div>
              )}
              {campeonato.estado && (
                <div>
                  <p className="text-sm text-slate-400">Estado</p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border">
                    {campeonato.estado}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partido */}
          <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="text-white">Partido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teams */}
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-700/30 rounded-lg">
                <div className="text-center flex-1">
                  <p className="font-semibold text-white">{partido.equipoLocal}</p>
                  <p className="text-xs text-slate-400">Local</p>
                </div>
                <div className="px-2 py-1 bg-slate-600 rounded text-xs font-bold text-slate-300">
                  VS
                </div>
                <div className="text-center flex-1">
                  <p className="font-semibold text-white">{partido.equipoVisitante}</p>
                  <p className="text-xs text-slate-400">Visitante</p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-slate-400">Fecha</p>
                  </div>
                  <p className="font-semibold text-white text-sm">
                    {new Date(partido.fecha).toLocaleDateString("es-ES", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-slate-400">Hora</p>
                  </div>
                  <p className="font-semibold text-white text-sm">{partido.hora}</p>
                </div>
              </div>

              {/* Estadio */}
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-slate-400">Estadio</p>
                </div>
                <p className="font-semibold text-white text-sm">{partido.estadio}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Árbitros Designados */}
        <div>
          <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                Equipo Arbitral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {arbitros.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-yellow-400/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-slate-300">{item.titulo}</p>
                      </div>
                      {item.arbitro?.categoria && (
                        <Badge className={getCategoriaColor(item.arbitro.categoria)}>
                          {item.arbitro.categoria}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-white text-sm mb-1">
                      {getNombreCompleto(item.arbitro)}
                    </p>
                    {item.arbitro?.dni && (
                      <p className="text-xs text-slate-400">
                        DNI: {item.arbitro.dni}
                      </p>
                    )}
                    {item.arbitro?.provincia && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.arbitro.provincia}
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6">
        <Button 
          variant="outline"
          onClick={onBack}
          disabled={saving}
          className="hover:bg-white/10 text-white border-slate-600"
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirmar}
          disabled={saving}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Designación
            </>
          )}
        </Button>
      </div>

      {/* Info Message */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Una vez guardada, podrás editar la designación desde el listado principal
        </p>
      </div>
    </div>
  )
}
