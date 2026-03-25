"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Plus, Calendar, MapPin, Users, TrendingUp, Edit, Trash2 } from "lucide-react"
import { getCampeonatos, type Campeonato } from "@/services/api"

export default function CampeonatosPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
    const [filtro, setFiltro] = useState<string>("todos")
    
    useEffect(() => {
        async function loadCampeonatos() {
            try {
                const data = await getCampeonatos()
                setCampeonatos(data)
            } catch (err) {
                console.error("Error al cargar campeonatos:", err)
                setError("Error al cargar campeonatos")
            } finally {
                setLoading(false)
            }
        }
        loadCampeonatos()
    }, [])
    
    const campeonatosFiltrados = campeonatos.filter(campeonato => {
        if (filtro === "todos") return true
        if (filtro === "programado") return campeonato.estado === "PROGRAMADO"
        if (filtro === "activo") return campeonato.estado === "ACTIVO"
        if (filtro === "finalizado") return campeonato.estado === "FINALIZADO"
        return true
    })
    
    const getEstadoBadge = (estado?: string) => {
        switch (estado) {
            case "PROGRAMADO":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Programado</span>
            case "ACTIVO":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Activo</span>
            case "FINALIZADO":
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Finalizado</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{estado}</span>
        }
    }
    
    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este campeonato?")) return
        
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"}/campeonatos/${id}`, {
                method: "DELETE"
            })
            setCampeonatos(campeonatos.filter(c => c.id !== id))
        } catch (err) {
            console.error("Error al eliminar campeonato:", err)
            alert("Error al eliminar campeonato")
        }
    }
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-slate-600">Cargando campeonatos...</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Campeonatos</h1>
                    <p className="text-slate-600 mt-1">Gestiona los campeonatos de fútbol de la región de Puno</p>
                </div>
                <Button onClick={() => router.push("/dashboard/campeonato/nuevo")} className="gap-2">
                    <Plus className="h-5 w-5" />
                    Nuevo Campeonato
                </Button>
            </div>
            
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{campeonatos.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-600">Programados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{campeonatos.filter(c => c.estado === "PROGRAMADO").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-600">Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{campeonatos.filter(c => c.estado === "ACTIVO").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-600">Finalizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-600">{campeonatos.filter(c => c.estado === "FINALIZADO").length}</div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={filtro === "todos" ? "default" : "outline"}
                            onClick={() => setFiltro("todos")}
                            size="sm"
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filtro === "programado" ? "default" : "outline"}
                            onClick={() => setFiltro("programado")}
                            size="sm"
                        >
                            Programados
                        </Button>
                        <Button
                            variant={filtro === "activo" ? "default" : "outline"}
                            onClick={() => setFiltro("activo")}
                            size="sm"
                        >
                            Activos
                        </Button>
                        <Button
                            variant={filtro === "finalizado" ? "default" : "outline"}
                            onClick={() => setFiltro("finalizado")}
                            size="sm"
                        >
                            Finalizados
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {/* Lista de Campeonatos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campeonatosFiltrados.map((campeonato) => (
                    <Card key={campeonato.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {campeonato.nombre}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                            <span className="truncate">{campeonato.ciudad}, {campeonato.provincia}</span>
                                        </div>
                                        {campeonato.categoria && (
                                            <div className="flex items-center gap-2 text-sm mt-1">
                                                <Users className="h-4 w-4 flex-shrink-0 text-slate-500" />
                                                <span className="truncate">{campeonato.categoria}</span>
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    {getEstadoBadge(campeonato.estado)}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Trophy className="h-4 w-4 flex-shrink-0" />
                                    <span>{campeonato.numeroEquipos} equipos</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">Formato</p>
                                        <p className="font-medium text-slate-900">{campeonato.formato}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Nivel</p>
                                        <p className="font-medium text-slate-900">{campeonato.nivelDificultad}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <Link href={`/dashboard/campeonato/${campeonato.id}`}>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Edit className="h-4 w-4" />
                                            Editar
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(campeonato.id!)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {campeonatosFiltrados.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Trophy className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay campeonatos</h3>
                        <p className="text-slate-600 mb-6">
                            {filtro === "todos" 
                                ? "No hay campeonatos registrados. Crea el primero para comenzar."
                                : "No hay campeonatos en este estado."}
                        </p>
                        <Button onClick={() => router.push("/dashboard/campeonato/nuevo")} className="gap-2">
                            <Plus className="h-5 w-5" />
                            Crear Campeonato
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            {error && (
                <Card>
                    <CardContent className="py-6 bg-red-50 border-red-200">
                        <p className="text-red-800 text-center font-medium">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
