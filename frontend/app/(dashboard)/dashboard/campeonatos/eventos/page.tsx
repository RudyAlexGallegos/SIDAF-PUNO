"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle, Play } from "lucide-react"
import {
  getEventos,
  getCampeonatos,
  type EventoCampeonato,
  type Campeonato,
} from "@/services/api"

export default function EventosPage() {
  const [eventos, setEventos] = useState<EventoCampeonato[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [eventosData, campeonatosData] = await Promise.all([
        getEventos(),
        getCampeonatos(),
      ])
      setEventos(eventosData)
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
          <h1 className="text-xl font-bold">Event Store</h1>
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
            <CardTitle>Eventos Registrados ({eventos.length})</CardTitle>
            <CardDescription>Historial cronológico de cambios del campeonato</CardDescription>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No hay eventos registrados</p>
            ) : (
              <div className="space-y-3">
                {eventos.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{ev.entidadTipo}</Badge>
                        <p className="font-medium text-slate-900">{ev.evento}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Entidad ID: {ev.entidadId}
                      </p>
                      {ev.estadoAnterior && ev.estadoNuevo && (
                        <p className="text-xs text-slate-500">
                          {ev.estadoAnterior} → {ev.estadoNuevo}
                        </p>
                      )}
                      {ev.fechaEvento && (
                        <p className="text-xs text-slate-400 mt-1">{ev.fechaEvento}</p>
                      )}
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
