"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, Users, Trophy, Edit } from "lucide-react"
import { getDesignacionById, getArbitros, getCampeonatos, deleteDesignacion, type Campeonato } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function DesignacionDetallePage() {
  const router = useRouter()
  const params = useParams()
  const designacionId = params?.id ? parseInt(params.id as string) : null
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [designacion, setDesignacion] = useState<any>(null)
  const [arbitros, setArbitros] = useState<any[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        if (!designacionId) {
          toast({ title: "Error", description: "ID no válido", variant: "destructive" })
          router.push("/dashboard/designaciones")
          return
        }

        const [designacionData, arbitrosData, campeonatosData] = await Promise.all([
          getDesignacionById(designacionId),
          getArbitros(),
          getCampeonatos(),
        ])

        if (!designacionData) {
          toast({ title: "Error", description: "Designación no encontrada", variant: "destructive" })
          router.push("/dashboard/designaciones")
          return
        }

        setDesignacion(designacionData)
        setArbitros(arbitrosData || [])
        setCampeonatos(campeonatosData || [])
      } catch (error) {
        console.error("Error cargando detalle:", error)
        toast({ title: "Error", description: "No se pudo cargar la información", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [designacionId, router, toast])

  const handleDelete = async () => {
    if (!designacionId) return
    try {
      const success = await deleteDesignacion(designacionId)
      if (success) {
        toast({ title: "✅ Designación eliminada", description: "Se eliminó correctamente" })
        router.push("/dashboard/designaciones")
      } else {
        throw new Error("Error al eliminar")
      }
    } catch (error) {
      console.error("Error eliminando:", error)
      toast({ title: "❌ Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  const getArbitroNombre = (id: number | string | null | undefined) => {
    if (!id) return "-"
    const arb = arbitros.find((a) => a.id === id || a.id?.toString() === id?.toString())
    if (!arb) return `ID: ${id}`
    return `${arb.nombre || ""} ${arb.apellido || ""}`.trim() || `ID: ${id}`
  }

  const getArbitroCategoria = (id: number | string | null | undefined) => {
    if (!id) return ""
    const arb = arbitros.find((a) => a.id === id || a.id?.toString() === id?.toString())
    return arb?.categoria || ""
  }

  const getEstadoBadge = (estado?: string) => {
    const estadoUpper = estado?.toUpperCase() || ""
    const variants: Record<string, { bg: string; text: string }> = {
      PROGRAMADA: { bg: "bg-blue-100", text: "text-blue-700" },
      CONFIRMADA: { bg: "bg-green-100", text: "text-green-700" },
      COMPLETADA: { bg: "bg-slate-100", text: "text-slate-700" },
      CANCELADA: { bg: "bg-red-100", text: "text-red-700" },
    }
    const variant = variants[estadoUpper] || variants.PROGRAMADA
    return <Badge className={`${variant.bg} ${variant.text}`}>{estadoUpper}</Badge>
  }

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) return "-"
    try {
      const date = new Date(fecha)
      if (isNaN(date.getTime())) return fecha
      return format(date, "dd/MM/yyyy HH:mm", { locale: es })
    } catch {
      return fecha
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader><div className="h-6 w-48 bg-slate-200 rounded animate-pulse" /></CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!designacion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No se encontró la designación</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/designaciones">Volver al listado</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="border-b pb-3 md:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/designaciones">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Detalle de Designación
                </p>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900">
                  {designacion.nombreCampeonato || "Designación"}
                </h1>
                <p className="text-sm text-slate-500">
                  {designacion.nombreEquipoLocal} vs {designacion.nombreEquipoVisitante}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border bg-card hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Información del Partido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Campeonato</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {designacion.nombreCampeonato || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Estado</p>
                    <div className="mt-1">{getEstadoBadge(designacion.estado)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Equipo Local</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {designacion.nombreEquipoLocal || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Equipo Visitante</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {designacion.nombreEquipoVisitante || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Fecha y hora de la designación</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {formatFecha(designacion.fecha)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Cuándo se disputa el partido asignado a los árbitros
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Inicio del campeonato</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {(() => {
                        const camp = campeonatos.find(
                          (c) => c.id?.toString() === designacion.idCampeonato?.toString(),
                        )
                        if (!camp?.fechaInicio && !camp?.horaInicio) return "-"
                        const fecha = camp.fechaInicio
                          ? format(new Date(camp.fechaInicio), "dd/MM/yyyy", { locale: es })
                          : ""
                        return `${fecha}${camp.horaInicio ? ` · ${camp.horaInicio}` : ""}`.trim()
                      })()}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Fecha/hora oficial de inicio del campeonato (no la de la designación)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Estadio</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {designacion.estadio || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border bg-card hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Cuerpo Arbitral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Árbitro Principal</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {getArbitroNombre(designacion.arbitroPrincipal)}
                      {getArbitroCategoria(designacion.arbitroPrincipal) && (
                        <Badge variant="outline" className="ml-2">
                          {getArbitroCategoria(designacion.arbitroPrincipal)}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Asistente 1</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {getArbitroNombre(designacion.arbitroAsistente1)}
                      {getArbitroCategoria(designacion.arbitroAsistente1) && (
                        <Badge variant="outline" className="ml-2">
                          {getArbitroCategoria(designacion.arbitroAsistente1)}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Asistente 2</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {getArbitroNombre(designacion.arbitroAsistente2)}
                      {getArbitroCategoria(designacion.arbitroAsistente2) && (
                        <Badge variant="outline" className="ml-2">
                          {getArbitroCategoria(designacion.arbitroAsistente2)}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Cuarto Árbitro</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {getArbitroNombre(designacion.cuartoArbitro)}
                      {getArbitroCategoria(designacion.cuartoArbitro) && (
                        <Badge variant="outline" className="ml-2">
                          {getArbitroCategoria(designacion.cuartoArbitro)}
                        </Badge>
                      )}
                    </p>
                  </div>
                  {designacion.asesor && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Asesor</p>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {getArbitroNombre(designacion.asesor)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {designacion.observaciones && (
              <Card className="rounded-xl border bg-card hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {designacion.observaciones}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-xl border bg-card hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href={`/dashboard/designaciones/${designacion.id}/editar`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Designación
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border bg-card hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">ID</span>
                  <span className="font-mono text-slate-900">#{designacion.id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Creada</span>
                  <span className="text-slate-900">
                    {formatFecha(designacion.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Actualizada</span>
                  <span className="text-slate-900">
                    {formatFecha(designacion.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
