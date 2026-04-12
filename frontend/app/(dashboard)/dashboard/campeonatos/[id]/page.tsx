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

        async function fetchChampionship() {
            try {
                setLoading(true)
                setError("")

                // SIEMPRE cargar desde el backend para datos completos y actualizados
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
    }, [championshipId])

    // Obtener equipos seleccionados - convertir IDs a string para comparación
    const equiposParticipantes = championship?.equipos && Array.isArray(championship.equipos)
        ? equipos.filter(eq => championship.equipos.includes(Number(eq.id)))
        : []

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header Hero */}
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>
                
                <div className="relative container mx-auto px-4 py-8 max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/dashboard/campeonatos" 
                                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div className="h-px w-8 bg-white/20" />
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl border-2 border-white/20">
                                    <Trophy className="h-9 w-9 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{championship.nombre}</h1>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {getStatusBadge(championship.estado)}
                                        <span className="text-sm text-white/80 font-medium">{championship.categoria}</span>
                                        {championship.tipo && (
                                            <span className="text-sm text-white/80 font-medium">•</span>
                                        )}
                                        {championship.tipo && (
                                            <span className="text-sm text-white/80 font-medium">{championship.tipo}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                            <Link href={`/dashboard/campeonatos/${championship.id}/editar`}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Stats Grid - 4 columns responsive */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transform duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 mb-1">Equipos</p>
                                    <p className="text-3xl font-bold text-blue-900">{equiposParticipantes.length}</p>
                                    <p className="text-xs text-blue-600 mt-2">participantes</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transform duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 mb-1">Duración</p>
                                    <p className="text-3xl font-bold text-green-900">
                                        {championship.fechaInicio && championship.fechaFin 
                                            ? Math.ceil((new Date(championship.fechaFin).getTime() - new Date(championship.fechaInicio).getTime()) / (1000 * 60 * 60 * 24))
                                            : '--'}
                                    </p>
                                    <p className="text-xs text-green-600 mt-2">días</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                                    <CalendarDays className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105 transform duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 mb-1">Etapas</p>
                                    <p className="text-3xl font-bold text-purple-900">
                                        {(() => {
                                            try {
                                                const etapas = championship.etapas ? JSON.parse(championship.etapas) : []
                                                return Array.isArray(etapas) ? etapas.length : 0
                                            } catch {
                                                return 0
                                            }
                                        })()}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-2">fases</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
                                    <Trophy className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105 transform duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 mb-1">Estado</p>
                                    <p className="text-2xl font-bold text-orange-900">{championship.estado}</p>
                                    <p className="text-xs text-orange-600 mt-2">campeonato</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-8 md:grid-cols-3 mb-8">
                    {/* Left Column - 2/3 */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Información General */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-400" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="pb-4 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">Nombre</p>
                                        <p className="text-slate-900 font-medium">{championship.nombre}</p>
                                    </div>
                                    <div className="pb-4 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">Categoría</p>
                                        <p className="text-slate-900 font-medium">{championship.categoria || "No definida"}</p>
                                    </div>
                                    <div className="pb-4 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">Nivel</p>
                                        <Badge className="bg-blue-100 text-blue-700">{championship.nivelDificultad || "Medio"}</Badge>
                                    </div>
                                    <div className="pb-4 border-b border-slate-200">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">Formato</p>
                                        <p className="text-slate-900 font-medium">{championship.formato || "No definido"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Calendario */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-400" />
                                    Calendario
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                        <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">Fecha Inicio</p>
                                        <p className="text-2xl font-bold text-slate-900">{championship.fechaInicio || "No definida"}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                        <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">Fecha Fin</p>
                                        <p className="text-2xl font-bold text-slate-900">{championship.fechaFin || "No definida"}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Horario</p>
                                    <p className="text-lg font-semibold text-slate-900">{championship.horaInicio || "--:--"} - {championship.horaFin || "--:--"}</p>
                                </div>
                                {championship.diasJuego && (
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Días de Juego</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(typeof championship.diasJuego === 'string' 
                                                ? championship.diasJuego.split(',') 
                                                : championship.diasJuego
                                            ).map(dia => (
                                                <Badge key={dia?.trim()} className="bg-blue-600 text-white font-semibold">
                                                    {dia?.trim().charAt(0).toUpperCase() + dia?.trim().slice(1)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Equipos Participantes */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-amber-400" />
                                    Equipos Participantes ({equiposParticipantes.length})
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    Equipos registrados en este campeonato
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {equiposParticipantes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No hay equipos seleccionados para este campeonato</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {equiposParticipantes.map(equipo => (
                                            <div
                                                key={equipo.id}
                                                className="group flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 cursor-pointer"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Shield className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{equipo.nombre}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {equipo.provincia}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 font-semibold">
                                                    {equipo.categoria?.includes("Primera") ? "1ª" : equipo.categoria?.includes("Segunda") ? "2ª" : equipo.categoria}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Etapas */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-purple-400" />
                                    Etapas del Campeonato
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    Fases de competencia
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {(() => {
                                    try {
                                        const etapas = championship.etapas ? JSON.parse(championship.etapas) : []
                                        if (!Array.isArray(etapas) || etapas.length === 0) {
                                            return (
                                                <div className="text-center py-12">
                                                    <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                                    <p className="text-slate-500 font-medium">No hay etapas definidas</p>
                                                </div>
                                            )
                                        }
                                        return (
                                            <div className="space-y-3">
                                                {etapas.map((etapa: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center font-bold text-purple-600 shadow-lg">
                                                            {etapa.orden}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-slate-900">{etapa.nombre}</p>
                                                            <p className="text-sm text-slate-500">Etapa {etapa.orden}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-12">
                                                <p className="text-slate-500 font-medium">Error al cargar las etapas</p>
                                            </div>
                                        )
                                    }
                                })()}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - 1/3 */}
                    <div className="space-y-8">
                        {/* Organización */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-400" />
                                    Organización
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Organizador</p>
                                    <p className="text-slate-900 font-medium text-sm">{championship.organizador || "No definido"}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Contacto</p>
                                    <p className="text-slate-900 font-medium text-sm">{championship.contacto || "No definido"}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Provincia</p>
                                    <p className="text-slate-900 font-medium text-sm">{championship.provincia || "No definida"}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Estadio</p>
                                    <p className="text-slate-900 font-medium text-sm">{championship.estadio || "No definido"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reglamentación */}
                        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 border-0">
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-400" />
                                    Reglamentación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {championship.reglas && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Reglas</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{championship.reglas}</p>
                                    </div>
                                )}
                                {championship.premios && (
                                    <div className="pt-3 border-t border-slate-200">
                                        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Premios</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{championship.premios}</p>
                                    </div>
                                )}
                                {championship.observaciones && (
                                    <div className="pt-3 border-t border-slate-200">
                                        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Observaciones</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{championship.observaciones}</p>
                                    </div>
                                )}
                                {!championship.reglas && !championship.premios && !championship.observaciones && (
                                    <p className="text-slate-500 text-center py-6 text-sm">No hay información reglamentaria</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
