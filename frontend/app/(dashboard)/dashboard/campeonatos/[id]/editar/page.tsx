"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trophy, MapPin, Calendar, Users, Clock, Shield, Check, Plus, Search, Filter, Trash2 } from "lucide-react"
import { useDataStore, type Campeonato } from "@/lib/data-store"

export default function EditarCampeonatoPage() {
    const router = useRouter()
    const params = useParams()
    const { campeonatos, equipos, updateCampeonato, deleteCampeonato, loadData } = useDataStore()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<Partial<Campeonato>>({})
    const [searchEquipos, setSearchEquipos] = useState("")
    const [championship, setChampionship] = useState<Campeonato | null>(null)

    const championshipId = params.id as string

    useEffect(() => {
        const loadCampeonato = async () => {
            setLoading(true)
            try {
                // Primero intenta buscar en el store
                let champ = campeonatos.find((c) => c.id === championshipId)
                
                // Si no está en el store, carga todos los datos
                if (!champ && campeonatos.length === 0) {
                    await loadData()
                    champ = campeonatos.find((c) => c.id === championshipId)
                }
                
                // Si aún no encuentra, intenta obtener del API backend
                if (!champ) {
                    try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"
                        const res = await fetch(`${API_URL}/campeonatos/${championshipId}`)
                        if (res.ok) {
                            const data = await res.json()
                            champ = { ...data, id: String(data.id) }
                        }
                    } catch (apiError) {
                        console.error("Error fetching from API:", apiError)
                    }
                }
                
                if (champ) {
                    setChampionship(champ)
                    setFormData(champ)
                } else {
                    // Si no consigue nada, muestra la página de "no encontrado"
                    setChampionship(null)
                }
            } catch (error) {
                console.error("Error cargando campeonato:", error)
                setChampionship(null)
            } finally {
                setLoading(false)
            }
        }
        
        if (championshipId) {
            loadCampeonato()
        }
    }, [championshipId])

    // Cargar equipos al montar si no existen
    useEffect(() => {
        if (equipos.length === 0) {
            loadData()
        }
    }, [])

    const diasOptions = [
        { value: "lunes", label: "Lunes" },
        { value: "martes", label: "Martes" },
        { value: "miercoles", label: "Miércoles" },
        { value: "jueves", label: "Jueves" },
        { value: "viernes", label: "Viernes" },
        { value: "sabado", label: "Sábado" },
        { value: "domingo", label: "Domingo" },
    ]

    // Filtrar equipos
    const filteredEquipos = equipos.filter(eq =>
        eq.nombre.toLowerCase().includes(searchEquipos.toLowerCase()) ||
        eq.provincia?.toLowerCase().includes(searchEquipos.toLowerCase())
    )

    // Agrupar por división
    const equiposPrimera = filteredEquipos.filter(eq => eq.categoria === "Primera División")
    const equiposSegunda = filteredEquipos.filter(eq => eq.categoria === "Segunda División")
    const equiposSinDivision = filteredEquipos.filter(eq => !eq.categoria || (!eq.categoria.includes("Primera") && !eq.categoria.includes("Segunda")))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value) || 0 : value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleDia = (dia: string) => {
        setFormData(prev => {
            const current = prev.diasJuego || []
            if (current.includes(dia as any)) {
                return { ...prev, diasJuego: current.filter(d => d !== dia) }
            } else {
                return { ...prev, diasJuego: [...current, dia] }
            }
        })
    }

    const toggleEquipo = (equipoId: string) => {
        setFormData(prev => {
            const current = prev.equipoIds || []
            if (current.includes(equipoId)) {
                return { ...prev, equipoIds: current.filter(id => id !== equipoId) }
            } else {
                return { ...prev, equipoIds: [...current, equipoId] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateCampeonato(championshipId, {
                ...formData,
                numeroEquipos: formData.equipoIds?.length || formData.numeroEquipos || 0,
            })
            router.push("/dashboard/campeonatos")
        } catch (error) {
            console.error("Error actualizando campeonato:", error)
            alert("Error al guardar los cambios. Por favor intenta de nuevo.")
        }
    }

    const handleDelete = async () => {
        if (confirm("¿Estás seguro de eliminar este campeonato? Esta acción no se puede deshacer.")) {
            try {
                await deleteCampeonato(championshipId)
                router.push("/dashboard/campeonatos")
            } catch (error) {
                console.error("Error eliminando campeonato:", error)
                alert("Error al eliminar el campeonato. Por favor intenta de nuevo.")
            }
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-slate-200 rounded w-1/3" />
                    <div className="h-64 bg-slate-200 rounded" />
                    <div className="h-96 bg-slate-200 rounded" />
                </div>
            </div>
        )
    }

    if (!championship) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Campeonato no encontrado</h2>
                    <p className="text-slate-600 mb-6">El campeonato que buscas no existe, ha sido eliminado o el ID es inválido.</p>
                    <div className="flex gap-3">
                        <Button asChild className="flex-1 bg-amber-500 hover:bg-amber-600">
                            <Link href="/dashboard/campeonatos">Volver a Campeonatos</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/dashboard">Ir al Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/campeonatos"
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="hidden sm:inline">Campeonatos</span>
                            </Link>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                                    <Trophy className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-slate-900">Editar Campeonato</h1>
                                    <p className="text-xs text-slate-500">{championship.nombre}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Button>
                            <Button
                                type="submit"
                                form="championship-form"
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <form id="championship-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Sección 1: Información Básica */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-amber-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Información del Campeonato</h2>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                                    <Input
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Campeonato Departamental 2024"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoría</Label>
                                    <Input
                                        id="categoria"
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                        placeholder="Primera División"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nivelDificultad">Nivel de Dificultad</Label>
                                    <Select
                                        value={formData.nivelDificultad}
                                        onValueChange={(v) => handleSelectChange("nivelDificultad", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bajo">Bajo</SelectItem>
                                            <SelectItem value="Medio">Medio</SelectItem>
                                            <SelectItem value="Alto">Alto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select
                                        value={formData.estado}
                                        onValueChange={(v) => handleSelectChange("estado", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="programado">Programado</SelectItem>
                                            <SelectItem value="activo">Activo</SelectItem>
                                            <SelectItem value="finalizado">Finalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Sección 2: Equipos Participantes */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-blue-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Equipos Participantes</h2>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Selecciona los equipos que participarán
                            </CardTitle>
                            <CardDescription className="flex items-center justify-between">
                                <span>Selecciona los equipos para este campeonato</span>
                                <Button asChild variant="link" className="text-blue-500 p-0">
                                    <Link href="/dashboard/campeonatos/equipos">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Crear nuevo equipo
                                    </Link>
                                </Button>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filtros de equipos */}
                            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
                                <div className="flex-1 min-w-[200px]">
                                    <Label className="text-xs mb-1 flex items-center gap-1">
                                        <Search className="h-3 w-3" />
                                        Buscar equipo
                                    </Label>
                                    <Input
                                        placeholder="Buscar por nombre o provincia..."
                                        value={searchEquipos}
                                        onChange={(e) => setSearchEquipos(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            {/* Contador */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-800">
                                    <strong>{formData.equipoIds?.length || 0}</strong> equipos seleccionados
                                </span>
                            </div>

                            {/* Lista de equipos */}
                            {equipos.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-4">No hay equipos registrados aún</p>
                                    <Button asChild className="bg-blue-500 hover:bg-blue-600">
                                        <Link href="/dashboard/campeonatos/equipos">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear Primer Equipo
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-[400px] overflow-y-auto pr-4">
                                    <EquipoGrupo
                                        title="PRIMERA DIVISIÓN"
                                        equiposList={equiposPrimera}
                                        badgeColor="bg-amber-500"
                                    />
                                    <EquipoGrupo
                                        title="SEGUNDA DIVISIÓN"
                                        equiposList={equiposSegunda}
                                        badgeColor="bg-green-500"
                                    />
                                    {equiposSinDivision.length > 0 && (
                                        <EquipoGrupo
                                            title="SIN DIVISIÓN"
                                            equiposList={equiposSinDivision}
                                            badgeColor="bg-slate-400"
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Sección 3: Estructura del Torneo */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Estructura del Torneo</h2>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="formato">Formato</Label>
                                    <Select
                                        value={formData.formato}
                                        onValueChange={(v) => handleSelectChange("formato", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Liga">Liga</SelectItem>
                                            <SelectItem value="Eliminatoria">Eliminatoria</SelectItem>
                                            <SelectItem value="Liga + Eliminatoria">Liga + Eliminatoria</SelectItem>
                                            <SelectItem value="Torneo Relámpago">Torneo Relámpago</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numeroJornadas">Número de Jornadas</Label>
                                    <Input
                                        id="numeroJornadas"
                                        name="numeroJornadas"
                                        type="number"
                                        min="0"
                                        value={formData.numeroJornadas}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numeroArbitrosRequeridos">Árbitros por Partido</Label>
                                    <Input
                                        id="numeroArbitrosRequeridos"
                                        name="numeroArbitrosRequeridos"
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={formData.numeroArbitrosRequeridos}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Sección 4: Sede y Calendario */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-orange-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Sede y Calendario</h2>
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ciudad">Ciudad / Provincia</Label>
                                    <Input
                                        id="ciudad"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        placeholder="Puno"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Estadio / Campo Deportivo</Label>
                                    <Input
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Estadio Enrique Torres Belón"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-3 block">Días de Juego</Label>
                                <div className="flex flex-wrap gap-2">
                                    {diasOptions.map((dia) => {
                                        const isSelected = formData.diasJuego?.includes(dia.value as any)
                                        return (
                                            <Button
                                                key={dia.value}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleDia(dia.value)}
                                                className={isSelected ? "bg-slate-900" : ""}
                                            >
                                                {dia.label}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="horaInicio">Hora de Inicio</Label>
                                    <Input
                                        id="horaInicio"
                                        name="horaInicio"
                                        type="time"
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horaFin">Hora de Fin</Label>
                                    <Input
                                        id="horaFin"
                                        name="horaFin"
                                        type="time"
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                                    <Input
                                        id="fechaInicio"
                                        name="fechaInicio"
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaFin">Fecha de Finalización</Label>
                                    <Input
                                        id="fechaFin"
                                        name="fechaFin"
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Resumen */}
                <Card className="bg-slate-900 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="h-5 w-5 text-amber-400" />
                            <h3 className="font-semibold">Resumen del Campeonato</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-5 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span>{formData.equipoIds?.length || formData.numeroEquipos || 0} equipos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>{formData.numeroJornadas || 0} jornadas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-slate-400" />
                                <span>{formData.numeroArbitrosRequeridos || 0} árbitros/partido</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>{formData.ciudad || "Sin definir"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>{formData.diasJuego?.length || 0} días/semana</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Botones */}
                <div className="flex gap-4 justify-end pb-8">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/campeonatos">Cancelar</Link>
                    </Button>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    )
}
