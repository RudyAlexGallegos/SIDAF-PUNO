"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Users, Search, Shield, MapPin, Phone, Mail, Edit, Trash2, Building } from "lucide-react"
import { useDataStore, type Equipo } from "@/lib/data-store"

export default function EquiposPage() {
    const { equipos, deleteEquipo } = useDataStore()
    const [query, setQuery] = useState("")
    const [provinciaFilter, setProvinciaFilter] = useState<string>("todos")
    const [divisionFilter, setDivisionFilter] = useState<string>("todos")

    const provincias = ["Puno", "Azángaro", "Carabaya", "Chucuito", "El Collao", "Huancané", "Lampa", "Melgar", "Moho", "San Antonio de Putina", "San Román", "Sandia", "Yunguyo"]
    const divisiones = ["Primera División", "Segunda División"]

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        let result = equipos

        if (provinciaFilter !== "todos") {
            result = result.filter((e: Equipo) => e.provincia === provinciaFilter)
        }

        if (divisionFilter !== "todos") {
            result = result.filter((e: Equipo) => e.division === divisionFilter)
        }

        if (!q) return result
        return result.filter((e: Equipo) =>
            e.nombre?.toLowerCase().includes(q) ||
            e.ciudad?.toLowerCase().includes(q)
        )
    }, [query, provinciaFilter, divisionFilter, equipos])

    const stats = useMemo(() => ({
        total: filtered.length,
        primera: filtered.filter((e: Equipo) => e.division === "Primera División").length,
        segunda: filtered.filter((e: Equipo) => e.division === "Segunda División").length,
    }), [filtered])

    const getDivisionBadge = (division?: string) => {
        switch (division) {
            case "Primera División":
                return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">Primera</Badge>
            case "Segunda División":
                return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">Segunda</Badge>
            default:
                return <Badge variant="outline">{division}</Badge>
        }
    }

    const getProvinciaColor = (provincia?: string) => {
        const colors: Record<string, string> = {
            "Puno": "from-blue-400 to-blue-600",
            "Azángaro": "from-green-400 to-green-600",
            "Carabaya": "from-purple-400 to-purple-600",
            "Chucuito": "from-red-400 to-red-600",
            "El Collao": "from-yellow-400 to-yellow-600",
            "Huancané": "from-pink-400 to-pink-600",
            "Lampa": "from-indigo-400 to-indigo-600",
            "Melgar": "from-orange-400 to-orange-600",
            "Moho": "from-teal-400 to-teal-600",
            "San Antonio de Putina": "from-cyan-400 to-cyan-600",
            "San Román": "from-violet-400 to-violet-600",
            "Sandia": "from-lime-400 to-lime-600",
            "Yunguyo": "from-rose-400 to-rose-600",
        }
        return colors[provincia || ""] || "from-gray-400 to-gray-600"
    }

    const handleDelete = (id: string) => {
        if (confirm("¿Estás seguro de eliminar este equipo?")) {
            deleteEquipo(id)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/campeonato" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Volver</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-300" />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Equipos</h1>
                            <p className="text-slate-500">Gestiona los equipos participantes</p>
                        </div>
                    </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                    <Link href="/dashboard/campeonato/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Equipo
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">Total Equipos</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-amber-600">Primera División</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.primera}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Segunda División</p>
                                <p className="text-3xl font-bold text-green-600">{stats.segunda}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Buscar equipos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-12 h-12 bg-white"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select
                        value={provinciaFilter}
                        onChange={(e) => setProvinciaFilter(e.target.value)}
                        className="h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todas las provincias</option>
                        {provincias.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <select
                        value={divisionFilter}
                        onChange={(e) => setDivisionFilter(e.target.value)}
                        className="h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todas las divisiones</option>
                        {divisiones.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de equipos */}
            {filtered.length === 0 ? (
                <Card className="p-12 text-center border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Shield className="h-10 w-10 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">No hay equipos</h3>
                            <p className="text-slate-500 mt-2">Agrega tu primer equipo para comenzar</p>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-600 text-white mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Equipo
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((equipo: Equipo) => (
                        <Card key={equipo.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                            <div className={`h-2 bg-gradient-to-r ${getProvinciaColor(equipo.provincia)}`} />
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getProvinciaColor(equipo.provincia)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg text-slate-900 truncate">{equipo.nombre}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                <span className="truncate">{equipo.provincia}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-4">
                                    {getDivisionBadge(equipo.division)}
                                </div>
                                <div className="space-y-2 text-sm">
                                    {equipo.estadio && (
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <Building className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{equipo.estadio}</span>
                                        </div>
                                    )}
                                    {equipo.telefono && (
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span>{equipo.telefono}</span>
                                        </div>
                                    )}
                                    {equipo.email && (
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                                            <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{equipo.email}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600" onClick={() => handleDelete(equipo.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-600 text-white">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
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
