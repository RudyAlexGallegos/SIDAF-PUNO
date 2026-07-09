"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import {
  getEvaluaciones,
  getEvaluacionesByCampeonato,
  getCampeonatos,
  type Evaluacion,
  type Campeonato,
} from "@/services/api"

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [loading, setLoading] = useState(true)
  const [campeonatoFiltro, setCampeonatoFiltro] = useState<number | "">("")
  const [error, setError] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [evaluacionesData, campeonatosData] = await Promise.all([
        campeonatoFiltro ? getEvaluacionesByCampeonato(Number(campeonatoFiltro)) : getEvaluaciones(),
        getCampeonatos(),
      ])
      setEvaluaciones(evaluacionesData)
      setCampeonatos(campeonatosData)
    } catch (e) {
      setError("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </Link>
        <div className="ml-auto">
          <h1 className="text-xl font-bold">Evaluaciones</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Campeonato</CardTitle>
            <CardDescription>Selecciona un campeonato para ver evaluaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={campeonatoFiltro}
              onChange={(e) => {
                setCampeonatoFiltro(e.target.value ? Number(e.target.value) : "")
                if (e.target.value) cargarDatos()
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Todos los campeonatos</option>
              {campeonatos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluaciones ({evaluaciones.length})</CardTitle>
            <CardDescription>Registro de calificaciones a árbitros</CardDescription>
          </CardHeader>
          <CardContent>
            {evaluaciones.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No hay evaluaciones registradas</p>
            ) : (
              <div className="space-y-3">
                {evaluaciones.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                    <div>
                      <p className="font-medium text-slate-900">Evaluación #{ev.id}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Árbitro ID: {ev.arbitroId} · Campeonato ID: {ev.campeonatoId}
                      </p>
                      <p className="text-xs text-slate-500">
                        Total: {ev.puntajeTotal ?? 0}
                      </p>
                    </div>
                    <Badge variant="outline">{ev.etapa || "Sin etapa"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
