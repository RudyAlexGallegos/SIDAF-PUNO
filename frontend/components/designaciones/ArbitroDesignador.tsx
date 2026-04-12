"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users,
  Search,
  ChevronLeft,
  Star,
  MapPin,
  Shield,
  Shuffle,
  AlertCircle,
} from "lucide-react"
import type { Arbitro } from "@/services/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ArbitroDesignadorProps {
  arbitros: Arbitro[]
  arbitroPrincipal: Arbitro | null
  setArbitroPrincipal: (arbitro: Arbitro | null) => void
  arbitroAsistente1: Arbitro | null
  setArbitroAsistente1: (arbitro: Arbitro | null) => void
  arbitroAsistente2: Arbitro | null
  setArbitroAsistente2: (arbitro: Arbitro | null) => void
  arbitroCuarto: Arbitro | null
  setArbitroCuarto: (arbitro: Arbitro | null) => void
  onAsignacionAutomatica: () => void
  onContinuar: () => void
  onBack: () => void
}

interface PosicionArbitro {
  titulo: string
  descripcion: string
  arbitro: Arbitro | null
  onChange: (arbitro: Arbitro | null) => void
  requerido: boolean
}

export default function ArbitroDesignador({
  arbitros,
  arbitroPrincipal,
  setArbitroPrincipal,
  arbitroAsistente1,
  setArbitroAsistente1,
  arbitroAsistente2,
  setArbitroAsistente2,
  arbitroCuarto,
  setArbitroCuarto,
  onAsignacionAutomatica,
  onContinuar,
  onBack,
}: ArbitroDesignadorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [posicionActual, setPosicionActual] = useState<"principal" | "asistente1" | "asistente2" | "cuarto" | null>(null)

  const arbitrosFiltrados = useMemo(() => {
    return arbitros.filter((a) => {
      const nombre = `${a.nombres || a.nombre || ""} ${a.apellidoPaterno || a.apellido || ""}`.toLowerCase()
      const dni = (a.dni || "").toLowerCase()
      return nombre.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm.toLowerCase())
    })
  }, [arbitros, searchTerm])

  const posiciones: PosicionArbitro[] = [
    {
      titulo: "Árbitro Principal",
      descripcion: "Árbitro central del partido",
      arbitro: arbitroPrincipal,
      onChange: setArbitroPrincipal,
      requerido: true,
    },
    {
      titulo: "Árbitro Asistente 1",
      descripcion: "Línea izquierda",
      arbitro: arbitroAsistente1,
      onChange: setArbitroAsistente1,
      requerido: false,
    },
    {
      titulo: "Árbitro Asistente 2",
      descripcion: "Línea derecha",
      arbitro: arbitroAsistente2,
      onChange: setArbitroAsistente2,
      requerido: false,
    },
    {
      titulo: "Cuarto Árbitro",
      descripcion: "Suplente",
      arbitro: arbitroCuarto,
      onChange: setArbitroCuarto,
      requerido: false,
    },
  ]

  const todosLlenosRequeridos = posiciones
    .filter((p) => p.requerido)
    .every((p) => p.arbitro !== null)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-yellow-400" />
            Designa los Árbitros
          </h2>
          <p className="text-slate-400">
            Asigna árbitros manualmente o usa la asignación automática
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

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={onAsignacionAutomatica}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Asignar Automáticamente
        </Button>
      </div>

      {/* Posiciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posiciones.map((posicion, idx) => (
          <Dialog key={idx}>
            <DialogTrigger asChild>
              <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-yellow-400/50 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                        {posicion.titulo}
                      </h3>
                      <p className="text-sm text-slate-400">{posicion.descripcion}</p>
                    </div>
                    {posicion.requerido && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 border">
                        Requerido
                      </Badge>
                    )}
                  </div>

                  {/* Selected Arbitro */}
                  {posicion.arbitro ? (
                    <div className="bg-slate-700/50 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-green-300">
                            {posicion.arbitro.nombres || posicion.arbitro.nombre}
                          </p>
                          <p className="text-sm text-slate-400">
                            {posicion.arbitro.dni}
                          </p>
                        </div>
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getCategoriaColor(posicion.arbitro.categoria)}>
                          {posicion.arbitro.categoria || "N/A"}
                        </Badge>
                        {posicion.arbitro.provincia && (
                          <Badge className="bg-slate-600/50 text-slate-300 border-slate-600">
                            {posicion.arbitro.provincia}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/30 border border-dashed border-slate-600 rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">
                        Haz clic para seleccionar un árbitro
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Dialog para seleccionar árbitro */}
            <DialogContent className="border-slate-700 bg-slate-900">
              <DialogHeader>
                <DialogTitle className="text-white">{posicion.titulo}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {posicion.descripcion}
                </DialogDescription>
              </DialogHeader>

              {/* Búsqueda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Buscar árbitro
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      placeholder="Nombre o DNI..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Lista de árbitros */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {arbitrosFiltrados.map((arb) => (
                    <button
                      key={arb.id}
                      onClick={() => {
                        posicion.onChange(arb)
                        setPosicionActual(null)
                      }}
                      className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {arb.nombres || arb.nombre}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            DNI: {arb.dni}
                          </p>
                        </div>
                        <div className="text-right">
                          {arb.categoria && (
                            <Badge className={getCategoriaColor(arb.categoria)}>
                              {arb.categoria}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {arb.provincia && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {arb.provincia}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {arbitrosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    No se encontraron árbitros
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Warning si faltan requeridos */}
      {!todosLlenosRequeridos && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            Debe completar todos los árbitros requeridos antes de continuar
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex gap-3 justify-end">
        <Button 
          variant="outline"
          onClick={onBack}
          className="hover:bg-white/10 text-white border-slate-600"
        >
          Volver
        </Button>
        <Button 
          onClick={onContinuar}
          disabled={!todosLlenosRequeridos}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
