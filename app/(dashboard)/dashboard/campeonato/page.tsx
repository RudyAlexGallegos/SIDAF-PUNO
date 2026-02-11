"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trophy, Calendar, Users, Search, Filter, MapPin } from "lucide-react"
import { useDataStore, type Campeonato } from "@/lib/data-store"

export default function CampeonatosPage() {
    const { campeonatos } = useDataStore()
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("todos")

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        let result = campeonatos

        if (statusFilter !== "todos") {
            result = result.filter(c => c.estado === statusFilter)
        }

        if (!q) return result
        return result.filter((c: Campeonato) =>
            c.nombre?.toLowerCase().includes(q) ||
            c.categoria?.toLowerCase().includes(q)
        )
    }, [query, statusFilter, campeonatos])

    const stats = useMemo(() => ({
        total: filtered.length,
        activos: filtered.filter((c: Campeonato) => c.estado === "activo").length,
        programados: filtered.filter((c: Campeonato) => c.estado === "programado").length,
        finalizados: filtered.filter((c: Campeonato) => c.estado === "finalizado").length,
    }), [filtered])

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

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Volver</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-300" />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Trophy className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Campeonatos</h1>
                            <p className="text-slate-500">Gestiona tus torneos y competiciones</p>
                        </div>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
                    <Link href="/dashboard/campeonato/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Campeonato
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card className="bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">Programados</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.programados}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600">Finalizados</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.finalizados}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-200 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar campeonatos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-12 h-12 bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === "todos" ? "default" : "outline"}
                        onClick={() => setStatusFilter("todos")}
                        className={statusFilter === "todos" ? "bg-slate-900" : ""}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={statusFilter === "activo" ? "default" : "outline"}
                        onClick={() => setStatusFilter("activo")}
                        className={statusFilter === "activo" ? "bg-green-600" : ""}
                    >
                        Activos
                    </Button>
                    <Button
                        variant={statusFilter === "programado" ? "default" : "outline"}
                        onClick={() => setStatusFilter("programado")}
                        className={statusFilter === "programado" ? "bg-blue-600" : ""}
                    >
                        Programados
                    </Button>
                </div>
            </div>

            {/* Grid de campeonatos */}
            {filtered.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <Trophy className="h-10 w-10 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">No hay campeonatos</h3>
                            <p className="text-slate-500 mt-2">Crea tu primer campeonato para comenzar</p>
                        </div>
                        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white mt-4">
                            <Link href="/dashboard/campeonato/nuevo">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Campeonato
                            </Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((campeonato: Campeonato) => (
                        <Card key={campeonato.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Trophy className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-slate-900">{campeonato.nombre}</CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {campeonato.categoria || "Sin categoría"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {getStatusBadge(campeonato.estado)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span>{campeonato.numeroEquipos || 0} equipos participantes</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>Inicio: {campeonato.fechaInicio || "No definida"}</span>
                                    </div>
                                    {campeonato.ciudad && (
                                        <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            <span>{campeonato.ciudad}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 hover:bg-slate-50" asChild>
                                        <Link href={`/dashboard/campeonato/${campeonato.id}`}>
                                            Ver detalles
                                        </Link>
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" asChild>
                                        <Link href={`/dashboard/campeonato/${campeonato.id}/editar`}>
                                            Editar
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
