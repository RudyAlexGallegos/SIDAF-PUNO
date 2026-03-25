"use client"

import React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  XCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react"

interface DesignacionStatusBadgeProps {
  fecha: string
  hora?: string
  compact?: boolean
  showIcon?: boolean
  showLabel?: boolean
}

export default function DesignacionStatusBadge({
  fecha,
  hora = "20:00",
  compact = false,
  showIcon = true,
  showLabel = true
}: DesignacionStatusBadgeProps) {
  const fechaPartido = new Date(fecha)
  const hoy = new Date()
  const diasDiferencia = Math.ceil((fechaPartido.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  const horasDiferencia = Math.abs(Math.ceil((fechaPartido.getTime() - hoy.getTime()) / (1000 * 60 * 60)))

  // Determinar estado
  const getEstado = () => {
    if (diasDiferencia < 0) {
      return {
        estado: "finalizado",
        label: "Finalizado",
        icon: CheckCircle2,
        color: "bg-slate-100 text-slate-600 border-slate-300",
        gradient: "from-slate-400 to-slate-500",
        animate: false
      }
    } else if (diasDiferencia === 0) {
      return {
        estado: "hoy",
        label: "Hoy",
        icon: Play,
        color: "bg-red-100 text-red-600 border-red-300 animate-pulse",
        gradient: "from-red-500 to-rose-600",
        animate: true
      }
    } else if (diasDiferencia <= 3) {
      return {
        estado: "proximo",
        label: `Próximo (${diasDiferencia} días)`,
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-600 border-amber-300",
        gradient: "from-amber-500 to-orange-600",
        animate: false
      }
    } else if (diasDiferencia <= 7) {
      return {
        estado: "programado",
        label: `En ${diasDiferencia} días`,
        icon: Calendar,
        color: "bg-blue-100 text-blue-600 border-blue-300",
        gradient: "from-blue-500 to-indigo-600",
        animate: false
      }
    } else {
    return {
      estado: "programado",
      label: format(fechaPartido, "dd MMM", { locale: es }),
      icon: Calendar,
      color: "bg-emerald-100 text-emerald-600 border-emerald-300",
      gradient: "from-emerald-500 to-green-600",
      animate: false
    }
    }
  }

  const estado = getEstado()

  // Vista compacta
  if (compact) {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          ${estado.color}
          transition-all duration-300
        `}
      >
        {showIcon && <estado.icon className="w-3.5 h-3.5" />}
        {showLabel && <span>{estado.label}</span>}
      </div>
    )
  }

  // Vista completa con barra de progreso
  return (
    <div className="space-y-3">
      {/* Badge principal */}
      <div
        className={`
          inline-flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold
          bg-gradient-to-r ${estado.gradient} text-white
          shadow-lg
          ${estado.animate ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
      >
        {showIcon && <estado.icon className="w-5 h-5" />}
        <span>{estado.label}</span>
      </div>

      {/* Información adicional */}
      <div className="space-y-2">
        {/* Fecha y hora */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
                  {format(fechaPartido, "EEEE, dd MMMM yyyy", { locale: es })}
                </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{hora}</span>
          </div>
        </div>

        {/* Indicador de días restantes */}
        {diasDiferencia > 0 && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Faltan</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${
                diasDiferencia <= 3 ? 'text-red-600' :
                diasDiferencia <= 7 ? 'text-amber-600' :
                'text-blue-600'
              }`}>
                {diasDiferencia}
              </span>
              <span className="text-sm text-slate-600">días</span>
            </div>
          </div>
        )}

        {/* Barra de progreso de tiempo */}
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-all duration-500
              bg-gradient-to-r ${estado.gradient}
            `}
            style={{
              width: diasDiferencia < 0 ? '100%' :
                     diasDiferencia <= 3 ? '90%' :
                     diasDiferencia <= 7 ? '60%' :
                     '30%'
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Tendencia */}
        {diasDiferencia > 0 && (
          <div className={`flex items-center gap-2 text-xs ${
            diasDiferencia <= 3 ? 'text-red-600' :
            diasDiferencia <= 7 ? 'text-amber-600' :
            'text-blue-600'
          }`}>
            {diasDiferencia <= 3 ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Próximamente</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" />
                <span>Programado</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente auxiliar para badge simple
export function SimpleStatusBadge({ 
  estado, 
  compact = false 
}: { 
  estado: "programado" | "proximo" | "hoy" | "en-curso" | "finalizado" | "cancelado"
  compact?: boolean
}) {
  const getEstadoConfig = () => {
    switch (estado) {
      case "programado":
        return {
          label: "Programado",
          icon: Calendar,
          color: "bg-emerald-100 text-emerald-600 border-emerald-300",
          gradient: "from-emerald-500 to-green-600"
        }
      case "proximo":
        return {
          label: "Próximo",
          icon: AlertCircle,
          color: "bg-amber-100 text-amber-600 border-amber-300",
          gradient: "from-amber-500 to-orange-600"
        }
      case "hoy":
        return {
          label: "Hoy",
          icon: Play,
          color: "bg-red-100 text-red-600 border-red-300 animate-pulse",
          gradient: "from-red-500 to-rose-600"
        }
      case "en-curso":
        return {
          label: "En curso",
          icon: Clock,
          color: "bg-blue-100 text-blue-600 border-blue-300",
          gradient: "from-blue-500 to-indigo-600"
        }
      case "finalizado":
        return {
          label: "Finalizado",
          icon: CheckCircle2,
          color: "bg-slate-100 text-slate-600 border-slate-300",
          gradient: "from-slate-400 to-slate-500"
        }
      case "cancelado":
        return {
          label: "Cancelado",
          icon: XCircle,
          color: "bg-red-100 text-red-600 border-red-300",
          gradient: "from-red-500 to-rose-600"
        }
      default:
        return {
          label: "Desconocido",
          icon: AlertCircle,
          color: "bg-gray-100 text-gray-600 border-gray-300",
          gradient: "from-gray-400 to-gray-500"
        }
    }
  }

  const config = getEstadoConfig()

  if (compact) {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
          ${config.color}
        `}
      >
        <config.icon className="w-3 h-3" />
      </div>
    )
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
        bg-gradient-to-r ${config.gradient} text-white
        shadow-md
        transition-all duration-300
      `}
    >
      <config.icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  )
}
