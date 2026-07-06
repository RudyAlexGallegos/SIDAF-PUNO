"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ChevronLeft } from "lucide-react"

interface DistritosStepProps {
  distritos: string[]
  provinciaSeleccionada?: string | null
  onSelectDistrito: (distrito: string) => void
  onBack: () => void
}

export default function DistritosStep({
  distritos,
  provinciaSeleccionada,
  onSelectDistrito,
  onBack,
}: DistritosStepProps) {
  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <section className="border-b pb-3 md:pb-4">
        <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
          {provinciaSeleccionada}
        </p>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
          <MapPin className="w-8 h-8 text-cyan-600" />
          Distritos de {provinciaSeleccionada}
        </h1>
        <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 4 de 7</p>
      </section>

      <div className="flex justify-start">
        <Button variant="outline" size="sm" onClick={onBack} className="border-gray-200">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Cambiar Provincia
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {distritos.map((distrito) => (
          <Card
            key={distrito}
            className="h-24 cursor-pointer border-2 border-gray-200 bg-card transition-all duration-200 hover:shadow-md hover:border-blue-300 flex items-center justify-center"
            onClick={() => onSelectDistrito(distrito)}
          >
            <CardContent className="text-center p-4">
              <h3 className="text-lg font-bold text-slate-900">{distrito}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
