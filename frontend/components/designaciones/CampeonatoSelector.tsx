"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Search, Calendar, Users } from "lucide-react"
import type { Campeonato } from "@/services/api"

interface CampeonatoSelectorProps {
  campeonatos: Campeonato[]
  campeonatoSeleccionado: Campeonato | null
  onSelect: (campeonato: Campeonato) => void
}

export default function CampeonatoSelector({
  campeonatos,
  campeonatoSeleccionado,
  onSelect,
}: CampeonatoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")

  const campeonatosFiltrados = useMemo(() => {
    return campeonatos.filter((camp) => {
      const matchSearch =
        camp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camp.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategoria =
        categoriaFilter === "todos" || camp.categoria === categoriaFilter

      return matchSearch && matchCategoria
    })
  }, [campeonatos, searchTerm, categoriaFilter])

  const categorias = Array.from(
    new Set(campeonatos.map((c) => c.categoria).filter(Boolean))
  ) as string[]

  const getStatusColors = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case "activo":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pendiente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "finalizado":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Selecciona un Campeonato
        </h2>
        <p className="text-slate-400">
          Elige el campeonato en el que deseas crear una nueva designación
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Buscar campeonato
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {categorias.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filtrar por categoría
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoriaFilter("todos")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  categoriaFilter === "todos"
                    ? "bg-yellow-400 text-slate-900"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFilter(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    categoriaFilter === cat
                      ? "bg-yellow-400 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Campeonatos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campeonatosFiltrados.map((camp) => (
          <div
            key={camp.id}
            onClick={() => onSelect(camp)}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              campeonatoSeleccionado?.id === camp.id ? "ring-2 ring-yellow-400" : ""
            }`}
          >
            <Card className="h-full border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 hover:border-yellow-400/50 transition-all">
              <CardContent className="pt-6 space-y-4">
                {/* Header with logo/icon */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  {camp.estado && (
                    <Badge
                      className={`${getStatusColors(
                        camp.estado
                      )} border`}
                    >
                      {camp.estado}
                    </Badge>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {camp.nombre}
                  </h3>
                  {camp.categoria && (
                    <p className="text-sm text-slate-400">{camp.categoria}</p>
                  )}
                </div>

                {/* Información del campeonato */}
                <div className="space-y-2 text-sm">
                  {camp.fechaInicio && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>
                        {new Date(camp.fechaInicio).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  )}
                  {camp.numeroEquipos && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span>{camp.numeroEquipos} equipos</span>
                    </div>
                  )}
                  {camp.organizador && (
                    <div className="text-slate-400">
                      Org: <span className="text-slate-300">{camp.organizador}</span>
                    </div>
                  )}
                </div>

                {/* Seleccionado indicator */}
                {campeonatoSeleccionado?.id === camp.id && (
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-center gap-2 text-yellow-400 text-sm font-medium">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    Seleccionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {campeonatosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            No se encontraron campeonatos con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  )
}
