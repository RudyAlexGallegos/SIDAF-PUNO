"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MoreHorizontal,
  Edit
} from "lucide-react"
import type { Arbitro } from "@/types/asistencia"

interface ArbitroCardProps {
  arbitro: Arbitro
  asistenciaPorcentaje?: number
  disponible?: boolean
  seleccionado?: boolean
  onSeleccionar?: (arbitroId: string) => void
  onVerDetalles?: (arbitroId: string) => void
  compact?: boolean
  showActions?: boolean
}

export default function ArbitroCard({
  arbitro,
  asistenciaPorcentaje = 0,
  disponible = true,
  seleccionado = false,
  onSeleccionar,
  onVerDetalles,
  compact = false,
  showActions = true
}: ArbitroCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!(e.target instanceof Node)) return
      if (!menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [menuOpen])

  // Obtener iniciales del nombre
  const getInitials = (nombre?: string, apellido?: string) => {
    const a = (apellido || "").trim().split(" ")[0] || ""
    const b = (nombre || "").trim().split(" ")[0] || ""
    return (a.charAt(0) + b.charAt(0)).toUpperCase()
  }

  // Obtener color por categoría
  const getCategoriaColor = (categoria?: string) => {
    switch (categoria?.toLowerCase()) {
      case "fifa":
        return {
          bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
          text: "text-white",
          border: "border-yellow-300"
        }
      case "nacional":
        return {
          bg: "bg-gradient-to-br from-blue-500 to-indigo-500",
          text: "text-white",
          border: "border-blue-300"
        }
      case "regional":
        return {
          bg: "bg-gradient-to-br from-green-500 to-emerald-500",
          text: "text-white",
          border: "border-green-300"
        }
      case "provincial":
        return {
          bg: "bg-gradient-to-br from-purple-500 to-pink-500",
          text: "text-white",
          border: "border-purple-300"
        }
      default:
        return {
          bg: "bg-gradient-to-br from-slate-400 to-slate-500",
          text: "text-white",
          border: "border-slate-300"
        }
    }
  }

  // Obtener color por porcentaje de asistencia
  const getAsistenciaColor = (porcentaje: number) => {
    if (porcentaje >= 90) {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300"
      }
    } else if (porcentaje >= 70) {
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300"
      }
    } else if (porcentaje >= 50) {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300"
      }
    } else {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300"
      }
    }
  }

  const categoria = arbitro.categoria || (arbitro as any).categoria || "Local"
  const categoriaColor = getCategoriaColor(categoria)
  const asistenciaColor = getAsistenciaColor(asistenciaPorcentaje)
  const nombreCompleto = `${arbitro.nombres || arbitro.nombre || ""} ${arbitro.apellidoPaterno || arbitro.apellido || ""}`.trim()
  const iniciales = getInitials(arbitro.nombres || arbitro.nombre, arbitro.apellidoPaterno || arbitro.apellido)

  // Vista compacta
  if (compact) {
    return (
      <div
        className={`
          relative group p-3 rounded-xl border-2 transition-all duration-300
          ${seleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-lg hover:-translate-y-0.5'}
          ${!disponible ? 'opacity-50 grayscale' : ''}
          ${categoriaColor.border}
        `}
        onClick={() => onSeleccionar?.(arbitro.id)}
      >
        {/* Indicador de selección */}
        {seleccionado && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Indicador de disponibilidad */}
        {!disponible && (
          <div className="absolute -top-1 -left-1">
            <Badge variant="destructive" className="text-xs">
              No disponible
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Avatar con iniciales */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-md ${categoriaColor.bg}`}>
            {iniciales}
          </div>

          {/* Información básica */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate text-sm">{nombreCompleto}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs ${categoriaColor.bg} ${categoriaColor.text}`}>
                {categoria.toUpperCase()}
              </Badge>
              {asistenciaPorcentaje > 0 && (
                <Badge className={`text-xs ${asistenciaColor.bg} ${asistenciaColor.text}`}>
                  {asistenciaPorcentaje}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista completa
  return (
    <div
      className={`
        relative group bg-white rounded-2xl border-2 shadow-md transition-all duration-300
        ${seleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-xl hover:-translate-y-1'}
        ${!disponible ? 'opacity-50 grayscale' : ''}
        ${categoriaColor.border}
      `}
    >
      {/* Header con gradiente */}
      <div className={`px-4 py-3 rounded-t-xl ${categoriaColor.bg} ${categoriaColor.text}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar grande */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg bg-white/20">
              {iniciales}
            </div>
            <div>
              <p className="font-bold text-lg">{nombreCompleto}</p>
              <p className="text-sm opacity-90">{arbitro.dni || (arbitro as any).codigoCODAR || "—"}</p>
            </div>
          </div>

          {/* Badge de categoría */}
          <Badge className={`${categoriaColor.bg} ${categoriaColor.text} text-sm px-3 py-1`}>
            {categoria.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Estadísticas de asistencia */}
        {asistenciaPorcentaje > 0 && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${asistenciaColor.text}`} />
              <div>
                <p className="text-xs text-slate-600">Asistencia reciente</p>
                <p className={`text-lg font-bold ${asistenciaColor.text}`}>
                  {asistenciaPorcentaje}%
                </p>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${asistenciaColor.bg}`}>
              <span className={`text-2xl font-bold ${asistenciaColor.text}`}>
                {asistenciaPorcentaje}
              </span>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="space-y-2 text-sm">
          {arbitro.telefono && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{arbitro.telefono}</span>
            </div>
          )}
          {arbitro.email && (
            <div className="flex items-center gap-2 text-slate-600 truncate">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{arbitro.email}</span>
            </div>
          )}
        </div>

        {/* Estado de disponibilidad */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${disponible ? 'bg-green-50' : 'bg-red-50'}`}>
          {disponible ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Disponible</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">No disponible</span>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="px-4 pb-4 flex gap-2">
          {onVerDetalles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalles(arbitro.id)}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Ver Detalles
            </Button>
          )}
          {onSeleccionar && !seleccionado && (
            <Button
              onClick={() => onSeleccionar(arbitro.id)}
              disabled={!disponible}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Seleccionar
            </Button>
          )}
          {seleccionado && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSeleccionar(arbitro.id)}
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Cambiar
            </Button>
          )}
        </div>
      )}

      {/* Menú de acciones rápidas */}
      {showActions && (
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg bg-white/80 hover:bg-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                Ver perfil
              </button>
              <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ver historial
              </button>
              <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Ver estadísticas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
