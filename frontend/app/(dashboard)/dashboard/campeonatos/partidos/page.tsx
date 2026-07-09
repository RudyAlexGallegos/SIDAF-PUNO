"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, X, Eye, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react"
import {
  getPartidos,
  getPartidosByCampeonato,
  createPartido,
  updatePartido,
  deletePartido,
  cambiarEstadoPartido,
  getCampeonatos,
  type Partido,
  type Campeonato,
} from "@/services/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: "bg-slate-100 text-slate-700",
  PROGRAMADO: "bg-blue-50 text-blue-700",
  DESIGNACION_PENDIENTE: "bg-yellow-50 text-yellow-700",
  DESIGNADO: "bg-purple-50 text-purple-700",
  CONFIRMADO: "bg-emerald-50 text-emerald-700",
  EN_JUEGO: "bg-orange-50 text-orange-700",
  FINALIZADO: "bg-red-50 text-red-700",
  HOMOLOGADO: "bg-green-100 text-green-800",
}

export default function PartidosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [loading, setLoading] = useState(true)
  const [campeonatoFiltro, setCampeonatoFiltro] = useState<number | "">("")
  const [error, setError] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [partidosData, campeonatosData] = await Promise.all([
        getPartidos(),
        getCampeonatos(),
      ])
      setPartidos(partidosData)
      setCampeonatos(campeonatosData)
    } catch (e) {
      setError("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const partidosFiltrados = campeonatoFiltro
    ? partidos.filter((p) => p.campeonatoId === campeonatoFiltro)
    : partidos

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
          <h1 className="text-xl font-bold">Partidos</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra partidos por campeonato</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={campeonatoFiltro}
              onChange={(e) => setCampeonatoFiltro(e.target.value ? Number(e.target.value) : "")}
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
            <CardTitle>Listado de Partidos ({partidosFiltrados.length})</CardTitle>
            <CardDescription>Gestión del motor de campeonato</CardDescription>
          </CardHeader>
          <CardContent>
            {partidosFiltrados.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No hay partidos registrados</p>
            ) : (
              <div className="space-y-3">
                {partidosFiltrados.map((partido) => (
                  <div key={partido.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">
                          Partido #{partido.id}
                        </p>
                        <Badge className={ESTADO_COLORS[partido.estado || "BORRADOR"] || ESTADO_COLORS.BORRADOR}>
                          {partido.estado || "BORRADOR"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {partido.fecha} {partido.hora} · {partido.estadio || "Sin estadio"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Campeonato ID: {partido.campeonatoId}
                      </p>
                    </div>
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
