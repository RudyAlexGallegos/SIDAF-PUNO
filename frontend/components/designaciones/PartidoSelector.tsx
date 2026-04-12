"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Search,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Zap,
} from "lucide-react"
import type { Campeonato } from "@/services/api"

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

interface PartidoSelectorProps {
  campeonato: Campeonato
  partidoSeleccionado: Partido | null
  onSelect: (partido: Partido) => void
  onBack: () => void
}

export default function PartidoSelector({
  campeonato,
  partidoSeleccionado,
  onSelect,
  onBack,
}: PartidoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [ordenarPor, setOrdenarPor] = useState<"fecha" | "equipo">("fecha")

  // Simulamos partidos - en el backend habrá un endpoint para obtenerlos
  const partidos: Partido[] = [
    {
      id: "1",
      equipoLocalId: 1,
      equipoVisitanteId: 2,
      equipoLocal: "UDT Femenino",
      equipoVisitante: "Municipal Juliaca",
      fecha: "2026-04-10",
      hora: "14:30",
      estadio: "Estadio Enrique Torres Beltrán",
      modalidad: "Femenino",
    },
    {
      id: "2",
      equipoLocalId: 3,
      equipoVisitanteId: 4,
      equipoLocal: "Deportivo Binacional",
      equipoVisitante: "Socoteña",
      fecha: "2026-04-10",
      hora: "16:00",
      estadio: "Estadio Enrique Torres Beltrán",
      modalidad: "Masculino",
    },
    {
      id: "3",
      equipoLocalId: 5,
      equipoVisitanteId: 6,
      equipoLocal: "Puno FC",
      equipoVisitante: "San Román",
      fecha: "2026-04-11",
      hora: "10:00",
      estadio: "Estadio Ciudad de Puno",
      modalidad: "Masculino",
    },
  ]

  const partidosFiltrados = useMemo(() => {
    let resultado = partidos.filter((p) => {
      const matchSearch =
        p.equipoLocal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.equipoVisitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.estadio.toLowerCase().includes(searchTerm.toLowerCase())
      return matchSearch
    })

    if (ordenarPor === "fecha") {
      resultado.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    }

    return resultado
  }, [searchTerm, ordenarPor])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Selecciona un Partido
          </h2>
          <p className="text-slate-400">
            {campeonato.nombre} - Elige el partido para la designación
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="hover:bg-white/10 text-white border-slate-600"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Buscar por equipos o estadio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Nombre del equipo o estadio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Ordenar por
          </label>
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value as "fecha" | "equipo")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="fecha">Fecha del partido</option>
            <option value="equipo">Nombre del equipo</option>
          </select>
        </div>
      </div>

      {/* Partidos List */}
      <div className="space-y-3">
        {partidosFiltrados.map((partido) => (
          <div
            key={partido.id}
            onClick={() => onSelect(partido)}
            className={`group cursor-pointer transition-all duration-300 ${
              partidoSeleccionado?.id === partido.id ? "ring-2 ring-yellow-400 rounded-lg" : ""
            }`}
          >
            <Card className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 hover:border-yellow-400/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Teams */}
                  <div className="flex-1 min-w-48">
                    <div className="flex items-center justify-between text-center gap-3">
                      <div>
                        <p className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                          {partido.equipoLocal}
                        </p>
                        <p className="text-xs text-slate-500">Local</p>
                      </div>
                      <div className="px-3 py-1 bg-slate-700 rounded-full">
                        <p className="text-xs font-bold text-slate-300">VS</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                          {partido.equipoVisitante}
                        </p>
                        <p className="text-xs text-slate-500">Visitante</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>{new Date(partido.fecha).toLocaleDateString("es-ES")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span>{partido.hora}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span className="truncate">{partido.estadio}</span>
                    </div>
                  </div>

                  {/* Modalidad Badge */}
                  {partido.modalidad && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border">
                      {partido.modalidad}
                    </Badge>
                  )}

                  {/* Selected indicator */}
                  {partidoSeleccionado?.id === partido.id && (
                    <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0">
                      <Zap className="w-4 h-4 text-slate-900" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {partidosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            No se encontraron partidos con los criterios de búsqueda
          </p>
        </div>
      )}

      {/* Estilos */}
    </div>
  )
}
