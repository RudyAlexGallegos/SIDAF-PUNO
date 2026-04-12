/**
 * PANEL DE CONFIGURACIÓN DEL ALGORITMO
 */

"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Zap, Settings, AlertCircle } from "lucide-react"
import { AlgorithmConfig, AlgorithmPreset } from "../lib/types"
import { useDesignationStore } from "../hooks/useDesignationStore"
import { ALGORITHM_PRESETS } from "../lib/algorithm"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const AlgorithmConfigPanel: React.FC = () => {
  const {
    algorithmConfig,
    algorithmPreset,
    setAlgorithmConfig,
    setAlgorithmPreset,
  } = useDesignationStore()

  const [isCustomizing, setIsCustomizing] = React.useState(false)
  const [config, setConfig] = React.useState<AlgorithmConfig>(algorithmConfig)

  // Normalizamos los valores a 0-100 para el slider
  const getNormalizedValue = (value: number) => Math.round(value * 100)
  const getActualValue = (normalized: number) => normalized / 100

  const handleWeightChange = (
    key: keyof AlgorithmConfig,
    value: number[]
  ) => {
    const newValue = getActualValue(value[0])
    const newConfig = {
      ...config,
      [key]: newValue,
    }
    setConfig(newConfig)
  }

  const handleSaveConfig = () => {
    // Validar que los weights sumen relativamente 1
    const total =
      config.weightLevel + config.weightLoad + config.weightDiversity
    if (Math.abs(total - 1) > 0.01) {
      // Normalizar automáticamente
      const normalized = {
        weightLevel: config.weightLevel / total,
        weightLoad: config.weightLoad / total,
        weightDiversity: config.weightDiversity / total,
      }
      setAlgorithmConfig(normalized)
      setConfig(normalized)
    } else {
      setAlgorithmConfig(config)
    }
    setIsCustomizing(false)
  }

  const handlePresetSelect = (preset: AlgorithmPreset) => {
    setAlgorithmPreset(preset)
    setConfig(ALGORITHM_PRESETS[preset])
    setIsCustomizing(false)
  }

  const total = config.weightLevel + config.weightLoad + config.weightDiversity

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="pb-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-sm md:text-base">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            Configuración del Algoritmo
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCustomizing ? "Cerrar personalización" : "Personalizar pesos"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Ajusta la prioridad del algoritmo de designación
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* PRESETS */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Presets</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(AlgorithmPreset).map((preset) => (
              <TooltipProvider key={preset}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePresetSelect(preset)}
                      className={`text-xs ${
                        algorithmPreset === preset
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                          : "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {preset === AlgorithmPreset.CALIDAD && "🏅 Calidad"}
                      {preset === AlgorithmPreset.BALANCE && "⚖️ Balance"}
                      {preset === AlgorithmPreset.EQUITATIVO && "👥 Equitativo"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {preset === AlgorithmPreset.CALIDAD &&
                      "Prioriza árbitros con alto nivel"}
                    {preset === AlgorithmPreset.BALANCE &&
                      "Balance entre nivel, carga y diversidad"}
                    {preset === AlgorithmPreset.EQUITATIVO &&
                      "Prioriza distribución equitativa"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* CONFIGURACIÓN ACTUAL */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-slate-400">Nivel</p>
              <Badge className="bg-purple-500/20 text-purple-300 mt-1">
                {getNormalizedValue(config.weightLevel)}%
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-400">Carga</p>
              <Badge className="bg-blue-500/20 text-blue-300 mt-1">
                {getNormalizedValue(config.weightLoad)}%
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-400">Diversidad</p>
              <Badge className="bg-green-500/20 text-green-300 mt-1">
                {getNormalizedValue(config.weightDiversity)}%
              </Badge>
            </div>
          </div>

          {total !== 1 && (
            <Alert className="bg-yellow-500/10 border-yellow-600 text-yellow-300 text-xs">
              <AlertCircle className="w-3 h-3" />
              <AlertDescription>
                Total: {getNormalizedValue(total)}% (debe ser ~100%)
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* PERSONALIZADOR */}
        {isCustomizing && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            {/* Weight Level */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Peso Nivel (Jerarquía)
                </label>
                <span className="text-xs text-purple-400">
                  {getNormalizedValue(config.weightLevel)}%
                </span>
              </div>
              <Slider
                value={[getNormalizedValue(config.weightLevel)]}
                onValueChange={(value) =>
                  handleWeightChange("weightLevel", value)
                }
                min={0}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mayor peso = prioriza árbitros con nivel más alto
              </p>
            </div>

            {/* Weight Load */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Peso Carga (Disponibilidad)
                </label>
                <span className="text-xs text-blue-400">
                  {getNormalizedValue(config.weightLoad)}%
                </span>
              </div>
              <Slider
                value={[getNormalizedValue(config.weightLoad)]}
                onValueChange={(value) =>
                  handleWeightChange("weightLoad", value)
                }
                min={0}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mayor peso = prioriza árbitros con menos partidos hoy
              </p>
            </div>

            {/* Weight Diversity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Peso Diversidad (Rotación)
                </label>
                <span className="text-xs text-green-400">
                  {getNormalizedValue(config.weightDiversity)}%
                </span>
              </div>
              <Slider
                value={[getNormalizedValue(config.weightDiversity)]}
                onValueChange={(value) =>
                  handleWeightChange("weightDiversity", value)
                }
                min={0}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mayor peso = evita saturar siempre los mismos árbitros
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveConfig}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 text-xs font-semibold"
            >
              Guardar Configuración
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
