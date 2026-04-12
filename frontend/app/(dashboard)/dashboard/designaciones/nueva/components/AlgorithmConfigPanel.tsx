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
    <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />
              <span className="truncate">⚙️ Algoritmo</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              Ajusta la prioridad
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 flex-shrink-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCustomizing ? "Cerrar" : "Personalizar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto">
        {/* PRESETS - Responsive */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Presets</p>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {Object.values(AlgorithmPreset).map((preset) => (
              <TooltipProvider key={preset}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePresetSelect(preset)}
                      className={`text-xs h-auto py-2 px-1 sm:px-2 ${
                        algorithmPreset === preset
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                          : "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {preset === AlgorithmPreset.CALIDAD && "🏅 Calidad"}
                        {preset === AlgorithmPreset.BALANCE && "⚖️ Balance"}
                        {preset === AlgorithmPreset.EQUITATIVO && "👥 Equit."}
                      </span>
                      <span className="sm:hidden">
                        {preset === AlgorithmPreset.CALIDAD && "🏅"}
                        {preset === AlgorithmPreset.BALANCE && "⚖️"}
                        {preset === AlgorithmPreset.EQUITATIVO && "👥"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {preset === AlgorithmPreset.CALIDAD &&
                      "Prioriza nivel"}
                    {preset === AlgorithmPreset.BALANCE &&
                      "Balance"}
                    {preset === AlgorithmPreset.EQUITATIVO &&
                      "Equitativo"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* CONFIGURACIÓN ACTUAL */}
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Nivel</p>
              <Badge className="bg-purple-500/20 text-purple-300 mt-1 justify-center text-xs">
                {getNormalizedValue(config.weightLevel)}%
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Carga</p>
              <Badge className="bg-blue-500/20 text-blue-300 mt-1 justify-center text-xs">
                {getNormalizedValue(config.weightLoad)}%
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Diversidad</p>
              <Badge className="bg-green-500/20 text-green-300 mt-1 justify-center text-xs">
                {getNormalizedValue(config.weightDiversity)}%
              </Badge>
            </div>
          </div>

          {total !== 1 && (
            <Alert className="bg-yellow-500/10 border-yellow-600 text-yellow-300 text-xs p-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <AlertDescription className="text-xs ml-2">
                Total: {getNormalizedValue(total)}%
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* PERSONALIZADOR - Responsive */}
        {isCustomizing && (
          <div className="space-y-3 pt-3 border-t border-slate-700">
            {/* Weight Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 truncate">
                  <span className="hidden sm:inline">Peso Nivel</span>
                  <span className="sm:hidden">Nivel</span>
                </label>
                <span className="text-xs text-purple-400 flex-shrink-0 ml-1">
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
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                Árbitros con nivel más alto
              </p>
            </div>

            {/* Weight Load */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 truncate">
                  <span className="hidden sm:inline">Peso Carga</span>
                  <span className="sm:hidden">Carga</span>
                </label>
                <span className="text-xs text-blue-400 flex-shrink-0 ml-1">
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
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                Menos partidos hoy
              </p>
            </div>

            {/* Weight Diversity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 truncate">
                  <span className="hidden sm:inline">Peso Diversidad</span>
                  <span className="sm:hidden">Diversidad</span>
                </label>
                <span className="text-xs text-green-400 flex-shrink-0 ml-1">
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
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                Rotación de árbitros
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveConfig}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 text-xs font-semibold py-2"
            >
              ✓ Guardar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
