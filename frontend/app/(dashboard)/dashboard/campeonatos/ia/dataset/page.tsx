"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, AlertCircle, Download } from "lucide-react"
import {
  getCampeonatos,
  generarDatasetCsv,
  generarDatasetJson,
  type Campeonato,
} from "@/services/api"

export default function IaDatasetPage() {
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [loading, setLoading] = useState(true)
  const [campeonatoFiltro, setCampeonatoFiltro] = useState<number | "">("")
  const [error, setError] = useState("")
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const data = await getCampeonatos()
      setCampeonatos(data)
    } catch (e) {
      setError("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  async function generarCsv() {
    if (!campeonatoFiltro) return
    setGenerando(true)
    setError("")
    try {
      const csv = await generarDatasetCsv(Number(campeonatoFiltro))
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dataset_campeonato_${campeonatoFiltro}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError("Error al generar dataset CSV")
    } finally {
      setGenerando(false)
    }
  }

  async function generarJson() {
    if (!campeonatoFiltro) return
    setGenerando(true)
    setError("")
    try {
      const json = await generarDatasetJson(Number(campeonatoFiltro))
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dataset_campeonato_${campeonatoFiltro}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError("Error al generar dataset JSON")
    } finally {
      setGenerando(false)
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
          <h1 className="text-xl font-bold">IA - Dataset</h1>
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
            <CardTitle>Generar Dataset para Entrenamiento LSTM</CardTitle>
            <CardDescription>
              Selecciona un campeonato y genera el dataset en formato CSV o JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campeonato</label>
              <select
                value={campeonatoFiltro}
                onChange={(e) => setCampeonatoFiltro(e.target.value ? Number(e.target.value) : "")}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm w-full"
              >
                <option value="">Seleccionar campeonato</option>
                {campeonatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generarCsv}
                disabled={!campeonatoFiltro || generando}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar CSV
              </Button>
              <Button
                onClick={generarJson}
                disabled={!campeonatoFiltro || generando}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
