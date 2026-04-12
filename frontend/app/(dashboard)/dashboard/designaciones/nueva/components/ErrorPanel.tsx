/**
 * PANEL DE ERRORES Y VALIDACIÓN
 */

"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react"
import { ValidationError } from "../lib/types"
import { Button } from "@/components/ui/button"
import { useDesignationStore } from "../hooks/useDesignationStore"

export const ErrorPanel: React.FC = () => {
  const { validationErrors, setValidationErrors } = useDesignationStore()

  if (validationErrors.length === 0) {
    return null
  }

  const errors = validationErrors.filter((e) => e.severity === "error")
  const warnings = validationErrors.filter((e) => e.severity === "warning")
  const info = validationErrors.filter((e) => e.severity === "info")

  return (
    <Card className="border-red-700/30 bg-gradient-to-br from-red-950 to-slate-900">
      <CardHeader className="pb-3 border-b border-red-700/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-300 text-sm md:text-base">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
            Validación ({validationErrors.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setValidationErrors([])}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {/* ERRORES */}
        {errors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-red-300 mb-2">
              🔴 Errores ({errors.length})
            </p>
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="bg-red-500/10 border border-red-600/30 rounded px-2 py-1.5 text-xs text-red-300"
              >
                <p className="font-semibold">{error.code}</p>
                <p className="text-red-400">{error.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* ADVERTENCIAS */}
        {warnings.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-yellow-700/30">
            <p className="text-xs font-semibold text-yellow-300 mb-2">
              🟡 Advertencias ({warnings.length})
            </p>
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className="bg-yellow-500/10 border border-yellow-600/30 rounded px-2 py-1.5 text-xs text-yellow-300"
              >
                <p className="font-semibold">{warning.code}</p>
                <p className="text-yellow-400">{warning.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* INFORMACIÓN */}
        {info.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-blue-700/30">
            <p className="text-xs font-semibold text-blue-300 mb-2">
              ℹ️ Información ({info.length})
            </p>
            {info.map((item, idx) => (
              <div
                key={idx}
                className="bg-blue-500/10 border border-blue-600/30 rounded px-2 py-1.5 text-xs text-blue-300"
              >
                <p className="font-semibold">{item.code}</p>
                <p className="text-blue-400">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
