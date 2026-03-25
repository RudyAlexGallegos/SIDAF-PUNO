"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy,
  Users,
  ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PartidoHeaderProps {
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  hora?: string
  estadio?: string
  campeonato?: string
  nivelDificultad?: "Alto" | "Medio" | "Bajo"
  categoria?: string
  compact?: boolean
  showActions?: boolean
  onEditar?: () => void
  onDuplicar?: () => void
  onEliminar?: () => void
}

export default function PartidoHeader({
  equipoLocal,
  equipoVisitante,
  fecha,
  hora = "20:00",
  estadio = "",
  campeonato = "",
  nivelDificultad = "Medio",
  categoria = "Regional",
  compact = false,
  showActions = true,
  onEditar,
  onDuplicar,
  onEliminar
}: PartidoHeaderProps) {
  const fechaPartido = new Date(fecha)
  const diasParaPartido = Math.ceil((fechaPartido.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  // Obtener color por nivel de dificultad
  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "Alto":
        return {
          bg: "bg-gradient-to-r from-red-500 to-rose-600",
          text: "text-white",
          border: "border-red-300"
        }
      case "Medio":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
          text: "text-white",
          border: "border-yellow-300"
        }
      case "Bajo":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          text: "text-white",
          border: "border-green-300"
        }
      default:
        return {
          bg: "bg-gradient-to-r from-slate-500 to-slate-600",
          text: "text-white",
          border: "border-slate-300"
        }
    }
  }

  // Obtener color por categoría
  const getCategoriaColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "fifa":
        return {
          bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
          text: "text-white"
        }
      case "nacional":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
          text: "text-white"
        }
      case "regional":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-500",
          text: "text-white"
        }
      case "provincial":
        return {
          bg: "bg-gradient-to-r from-purple-500 to-pink-500",
          text: "text-white"
        }
      default:
        return {
          bg: "bg-gradient-to-r from-slate-400 to-slate-500",
          text: "text-white"
        }
    }
  }

  const nivelColor = getNivelColor(nivelDificultad)
  const categoriaColor = getCategoriaColor(categoria)

  // Vista compacta
  if (compact) {
    return (
      <div className="bg-white rounded-xl border-2 shadow-md p-4 hover:shadow-lg transition-all duration-300">
        {/* Encabezado del partido */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {equipoLocal} <span className="text-blue-600">vs</span> {equipoVisitante}
              </h3>
              {estadio && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {estadio}
                </p>
              )}
            </div>
          </div>

          {/* Badge de estado */}
          <Badge className={`text-xs ${diasParaPartido < 0 ? 'bg-slate-100 text-slate-600' : diasParaPartido === 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
            {diasParaPartido < 0 ? 'Finalizado' : diasParaPartido === 0 ? 'Hoy' : `En ${diasParaPartido} días`}
          </Badge>
        </div>

        {/* Fecha y hora */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(fechaPartido, "dd MMM yyyy", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{hora}</span>
          </div>
        </div>
      </div>
    )
  }

  // Vista completa
  return (
    <div className="bg-white rounded-2xl border-2 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Barra de gradiente superior */}
      <div className={`h-2 ${categoriaColor.bg}`} />

      <div className="p-6">
        {/* Header con información del partido */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          {/* Escudos y equipos */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Equipo Local */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {equipoLocal.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                    {equipoLocal}
                  </p>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-2xl font-bold text-blue-600">VS</span>
                  <div className="w-12 h-px bg-slate-300"></div>
                </div>

                {/* Equipo Visitante */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {equipoVisitante.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">
                    {equipoVisitante}
                  </p>
                </div>
              </div>

              {/* Badge de estado del partido */}
              <Badge className={`text-xs px-3 py-1 ${diasParaPartido < 0 ? 'bg-slate-100 text-slate-600' : diasParaPartido === 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                {diasParaPartido < 0 ? 'Finalizado' : diasParaPartido === 0 ? 'Hoy' : `En ${diasParaPartido} días`}
              </Badge>
            </div>
          </div>

          {/* Información del campeonato */}
          <div className={`p-4 rounded-xl ${nivelColor.bg} ${nivelColor.text}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{campeonato}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${nivelColor.bg} ${nivelColor.text} text-xs`}>
                {nivelDificultad}
              </Badge>
              <Badge className={`${categoriaColor.bg} ${categoriaColor.text} text-xs`}>
                {categoria.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Fecha, hora y estadio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500">Fecha</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(fechaPartido, "dd MMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Clock className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-xs text-slate-500">Hora</p>
              <p className="text-sm font-semibold text-slate-900">{hora}</p>
            </div>
          </div>

          {estadio && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <MapPin className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Estadio</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{estadio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {nivelDificultad === "Alto" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <strong>Importante:</strong> Este campeonato requiere árbitros FIFA o Nacionales con alta preparación y experiencia.
            </p>
          </div>
        )}

        {nivelDificultad === "Medio" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <strong>Nota:</strong> Requiere árbitros con buena preparación y asistencia regular.
            </p>
          </div>
        )}

        {/* Acciones */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Selecciona 4 árbitros
              </span>
            </div>
            <div className="flex gap-2">
              {onDuplicar && (
                <button
                  onClick={onDuplicar}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Duplicar
                </button>
              )}
              {onEditar && (
                <button
                  onClick={onEditar}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Editar Designación
                </button>
              )}
              {onEliminar && (
                <button
                  onClick={onEliminar}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
