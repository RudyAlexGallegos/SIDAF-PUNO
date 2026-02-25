"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trophy, Calendar, Users, Search, MapPin } from "lucide-react"
import { getCampeonatos, type Campeonato } from "@/services/api"

export default function CampeonatosPage() {
    const [campeonato, setCampeonato] = useState<Campeonato[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("todos")

    // Cargar campeonatos del backend
    useEffect(() => {
        async function load() {
            try {
                const data = await getCampeonatos()
                setCampeonato(data)
            } catch (error) {
                console.error("Error cargando campeonatos:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        let result = campeonato

        if (statusFilter !== "todos") {
            result = result.filter(c => c.estado === statusFilter)
        }

        if (!q) return result
        return result.filter((c: Campeonato) =>
            c.nombre?.toLowerCase().includes(q) ||
            c.categoria?.toLowerCase().includes(q)
        )
    }, [query, statusFilter, campeonato])

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

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <div className="text-center py-12">Cargando...</div>
            </div>
        )
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-sm text-slate-500">Total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-green-600">{stats.activos}</div>
                        <p className="text-sm text-slate-500">Activos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-blue-600">{stats.programados}</div>
                        <p className="text-sm text-slate-500">Programados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-600">{stats.finalizados}</div>
                        <p className="text-sm text-slate-500">Finalizados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nombre o categoría..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="programado">Programado</SelectItem>
                                <SelectItem value="finalizado">Finalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            {filtered.length === 0 ? (
                <Card className="mb-8">
                    <CardContent className="py-12 text-center">
                        <Trophy className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No hay campeonatos</h3>
                        <p className="text-slate-500 mb-4">Crea tu primer campeonato para comenzar</p>
                        <Button asChild>
                            <Link href="/dashboard/campeonato/nuevo">
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Campeonato
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((c: Campeonato) => (
                        <Card key={c.id} className="hover:shadow-lg transition">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{c.nombre}</CardTitle>
                                        <CardDescription>{c.categoria}</CardDescription>
                                    </div>
                                    {getStatusBadge(c.estado)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {c.ciudad && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="h-4 w-4" />
                                        <span>{c.ciudad}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4" />
                                    <span>{c.numeroEquipos || 0} equipos</span>
                                </div>
                                {c.fechaInicio && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(c.fechaInicio).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button asChild size="sm" variant="outline" className="flex-1">
                                        <Link href={`/dashboard/campeonato/${c.id}`}>
                                            Ver detalles
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
