"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CalendarioAsistencia } from "@/components/calendario-asistencia"
import { useDataStore } from "@/lib/data-store"

export default function CalendarioAsistenciaPage() {
  const { loadData } = useDataStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/asistencia" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendario de Asistencia</h1>
              <p className="text-sm sm:text-base text-gray-600">Vista mensual de actividades</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CalendarioAsistencia />
      </main>
    </div>
  )
}
