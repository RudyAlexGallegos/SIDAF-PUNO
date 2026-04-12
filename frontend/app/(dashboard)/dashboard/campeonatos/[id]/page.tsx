"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Calendar, Users, MapPin, Clock, Shield, Edit2, CalendarDays } from "lucide-react"
import { useDataStore, type Campeonato } from "@/lib/data-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"

export default function DetalleCampeonatoPage() {
    const params = useParams()
    const { campeonatos, equipos } = useDataStore()
    const [loading, setLoading] = useState(true)
    const [championship, setChampionship] = useState<Campeonato | null>(null)
    const [error, setError] = useState<string>("")

    const championshipId = params.id as string

    useEffect(() => {
        let active = true
        const found = campeonatos.find((c) => String(c.id) === championshipId)

        if (found) {
            setChampionship(found)
            setLoading(false)
            setError("")
            return
        }

        async function fetchChampionship() {
            try {
                setLoading(true)
                setError("")

                const res = await fetch(`${API_URL}/campeonato/${championshipId}`)
                if (!res.ok) throw new Error("Campeonato no encontrado")

                const data = await res.json()
                if (!active) return

                setChampionship({ ...data, id: String(data.id) })
            } catch (err: any) {
                if (!active) return
                console.error("Error cargando campeonato:", err)
                setChampionship(null)
                setError("No se pudo cargar el campeonato. Intenta nuevamente más tarde.")
            } finally {
                if (active) setLoading(false)
            }
        }

        fetchChampionship()

        return () => {
            active = false
        }
    }, [championshipId, campeonatos])

    // Obtener equipos seleccionados
    const equiposParticipantes = equipos.filter(eq =>
        championship?.equipoIds?.includes(eq.id)
    )

    const getStatusBadge = (estado?: string) => {
        switch (estado) {
            case "activo":
                return <Badge className="bg-green-500">Activo</Badge>
            case "programado":
                return <Badge variant="outline" className="border-blue-500 text-blue-600">Programado</Badge>
            case "finalizado":
                return <Badge variant="secondary">Finalizado</Badge>
            default:
                return <Badge variant="outline">{estado}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 rounded w-1/4" />
                    <div className="h-64 bg-slate-200 rounded" />
                </div>
            </div>
        )
    }

    if (!championship) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900">Campeonato no encontrado</h2>
                <p className="text-slate-500 mt-2">
                    {error || "El campeonato que buscas no existe o ha sido eliminado."}
                </p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard/campeonatos">Volver a Campeonatos</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/campeonatos" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Volver</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-300" />
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{championship.nombre}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(championship.estado)}
                                <span className="text-sm text-slate-500">{championship.categoria}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Link href={`/dashboard/campeonatos/${championship.id}/editar`}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{equiposParticipantes.length}</p>
                                <p className="text-sm text-blue-600">Equipos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                                <CalendarDays className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{championship.numeroJornadas || 0}</p>
                                <p className="text-sm text-green-600">Jornadas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">{championship.numeroArbitrosRequeridos || 0}</p>
                                <p className="text-sm text-purple-600">Árbitros/Partido</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">{championship.formato || "N/A"}</p>
                                <p className="text-sm text-amber-600">Formato</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Información General */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Información General
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Nombre</span>
                                <span className="font-medium text-slate-900">{championship.nombre}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Categoría</span>
                                <span className="font-medium text-slate-900">{championship.categoria || "No definida"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Nivel de Dificultad</span>
                                <Badge variant={
                                    championship.nivelDificultad === "Alto" ? "default" :
                                        championship.nivelDificultad === "Medio" ? "secondary" : "outline"
                                }>
                                    {championship.nivelDificultad || "No definido"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Estado</span>
                                {getStatusBadge(championship.estado)}
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-slate-500">Formato</span>
                                <span className="font-medium text-slate-900">{championship.formato || "No definido"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendario */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            Calendario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Inicio
                                </span>
                                <span className="font-medium text-slate-900">
                                    {championship.fechaInicio || "No definida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    Finalización
                                </span>
                                <span className="font-medium text-slate-900">
                                    {championship.fechaFin || "No definida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Ciudad/Sede
                                </span>
                                <span className="font-medium text-slate-900">
                                    {championship.ciudad || "No definida"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Días de Juego
                                </span>
                                <div className="flex gap-1">
                                    {championship.diasJuego?.length ? (
                                        championship.diasJuego.map(dia => (
                                            <Badge key={dia} variant="outline" className="text-xs">
                                                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-slate-400">No definidos</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-slate-500 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Horario
                                </span>
                                <span className="font-medium text-slate-900">
                                    {championship.horaInicio || "--:--"} - {championship.horaFin || "--:--"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Equipos Participantes */}
            <Card className="mt-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-500" />
                        Equipos Participantes ({equiposParticipantes.length})
                    </CardTitle>
                    <CardDescription>
                        Equipos registrados en este campeonato
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {equiposParticipantes.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No hay equipos seleccionados para este campeonato</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {equiposParticipantes.map(equipo => (
                                <div
                                    key={equipo.id}
                                    className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{equipo.nombre}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {equipo.provincia}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={
                                        equipo.categoria === "Primera División" ? "border-amber-500 text-amber-600" :
                                            equipo.categoria === "Segunda División" ? "border-green-500 text-green-600" : ""
                                    }>
                                        {equipo.categoria?.includes("Primera") ? "1ª" : equipo.categoria?.includes("Segunda") ? "2ª" : equipo.categoria}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
