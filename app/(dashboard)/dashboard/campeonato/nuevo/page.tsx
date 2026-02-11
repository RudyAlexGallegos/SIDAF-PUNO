"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trophy, MapPin, Calendar, Users, Clock, Shield, Check, Plus, Search, Filter } from "lucide-react"
import { useDataStore, type Campeonato } from "@/lib/data-store"

// Simple ID generator
const generateId = () => `cam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export default function NuevoCampeonatoPage() {
    const router = useRouter()
    const { addCampeonato, equipos } = useDataStore()

    const [formData, setFormData] = useState<Partial<Campeonato>>({
        nombre: "",
        categoria: "",
        nivelDificultad: "Medio",
        numeroEquipos: 16,
        formato: "Liga",
        numeroJornadas: 30,
        numeroArbitrosRequeridos: 3,
        fechaInicio: "",
        fechaFin: "",
        estado: "programado",
        // Sede
        direccion: "",
        ciudad: "",
        // Días de juego
        diasJuego: [],
        horaInicio: "15:00",
        horaFin: "21:00",
        // Equipos
        equipoIds: [],
    })

    const [searchEquipos, setSearchEquipos] = useState("")
    const [provinciaFilter, setProvinciaFilter] = useState("todas")
    const [divisionFilter, setDivisionFilter] = useState("todas")

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
    const filteredEquipos = equipos.filter(eq => {
        const matchesSearch =
            eq.nombre.toLowerCase().includes(searchEquipos.toLowerCase()) ||
            eq.provincia?.toLowerCase().includes(searchEquipos.toLowerCase())
        const matchesProvincia = provinciaFilter === "todas" || eq.provincia === provinciaFilter
        const matchesDivision = divisionFilter === "todas" || eq.categoria === divisionFilter
        return matchesSearch && matchesProvincia && matchesDivision
    })

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

    const selectAllInGroup = (equiposList: typeof filteredEquipos) => {
        const ids = equiposList.map(e => e.id)
        setFormData(prev => {
            const current = prev.equipoIds || []
            const allSelected = ids.every(id => current.includes(id))
            if (allSelected) {
                return { ...prev, equipoIds: current.filter(id => !ids.includes(id)) }
            } else {
                return { ...prev, equipoIds: [...new Set([...current, ...ids])] }
            }
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const nuevoCampeonato: Campeonato = {
            id: generateId(),
            nombre: formData.nombre || "",
            categoria: formData.categoria || "",
            nivelDificultad: formData.nivelDificultad || "Medio",
            numeroEquipos: formData.equipoIds?.length || formData.numeroEquipos || 0,
            formato: formData.formato || "Liga",
            numeroJornadas: formData.numeroJornadas || 0,
            numeroArbitrosRequeridos: formData.numeroArbitrosRequeridos || 0,
            fechaInicio: formData.fechaInicio || "",
            fechaFin: formData.fechaFin || "",
            estado: formData.estado || "programado",
            direccion: formData.direccion || "",
            ciudad: formData.ciudad || "",
            diasJuego: formData.diasJuego || [],
            horaInicio: formData.horaInicio || "",
            horaFin: formData.horaFin || "",
            equipoIds: formData.equipoIds || [],
            fechaCreacion: new Date().toISOString(),
        }

        addCampeonato(nuevoCampeonato)
        router.push("/dashboard/campeonato")
    }

    // Componente para grupo de equipos
    const EquipoGrupo = ({ title, equiposList, badgeColor }: { title: string, equiposList: typeof filteredEquipos, badgeColor: string }) => {
        if (equiposList.length === 0) return null
        const allSelected = equiposList.length > 0 && equiposList.every(e => formData.equipoIds?.includes(e.id))
        const someSelected = equiposList.some(e => formData.equipoIds?.includes(e.id))

        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge className={badgeColor}>{title}</Badge>
                        <span className="text-sm text-slate-500">{equiposList.length} equipos</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => selectAllInGroup(equiposList)}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        {allSelected ? "Deseleccionar todos" : someSelected ? "Limpiar selección" : "Seleccionar todos"}
                    </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {equiposList.map((equipo) => {
                        const isSelected = formData.equipoIds?.includes(equipo.id)
                        return (
                            <div
                                key={equipo.id}
                                onClick={() => toggleEquipo(equipo.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                                    }`}>
                                    {isSelected && <Check className="h-4 w-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{equipo.nombre}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{equipo.provincia}</span>
                                    </div>
                                </div>
                                <Shield className="h-4 w-4 text-slate-300" />
                            </div>
                        )
                    })}
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
                                href="/dashboard/campeonato"
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
                                    <h1 className="text-lg font-semibold text-slate-900">Nuevo Campeonato</h1>
                                    <p className="text-xs text-slate-500">Completa la información</p>
                                </div>
                            </div>
                        </div>
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
                                    <Link href="/dashboard/campeonato/equipos">
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
                                <div className="w-[180px]">
                                    <Label className="text-xs mb-1 flex items-center gap-1">
                                        <Filter className="h-3 w-3" />
                                        Provincia
                                    </Label>
                                    <select
                                        value={provinciaFilter}
                                        onChange={(e) => setProvinciaFilter(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                                    >
                                        <option value="todas">Todas</option>
                                        {Array.from(new Set(equipos.map(e => e.provincia).filter(Boolean))).map((p: any) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-[180px]">
                                    <Label className="text-xs mb-1 flex items-center gap-1">
                                        <Filter className="h-3 w-3" />
                                        División
                                    </Label>
                                    <select
                                        value={divisionFilter}
                                        onChange={(e) => setDivisionFilter(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                                    >
                                        <option value="todas">Todas</option>
                                        <option value="Primera División">Primera</option>
                                        <option value="Segunda División">Segunda</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contador */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-sm font-medium text-blue-800">
                                    <strong>{formData.equipoIds?.length || 0}</strong> equipos seleccionados
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const allIds = filteredEquipos.map(e => e.id)
                                        setFormData(prev => ({
                                            ...prev,
                                            equipoIds: prev.equipoIds?.length === allIds.length ? [] : allIds
                                        }))
                                    }}
                                >
                                    {formData.equipoIds?.length === filteredEquipos.length ? "Deseleccionar todos" : "Seleccionar todos"}
                                </Button>
                            </div>

                            {/* Lista de equipos */}
                            {equipos.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-4">No hay equipos registrados aún</p>
                                    <Button asChild className="bg-blue-500 hover:bg-blue-600">
                                        <Link href="/dashboard/campeonato/equipos">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear Primer Equipo
                                        </Link>
                                    </Button>
                                </div>
                            ) : filteredEquipos.length === 0 ? (
                                <div className="text-center py-8">
                                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No se encontraron equipos con los filtros aplicados</p>
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
                                    <Label htmlFor="numeroEquipos">Equipos Participantes</Label>
                                    <Input
                                        id="numeroEquipos"
                                        name="numeroEquipos"
                                        type="number"
                                        min="2"
                                        value={formData.numeroEquipos}
                                        onChange={handleChange}
                                        disabled={formData.equipoIds && formData.equipoIds.length > 0}
                                        className={formData.equipoIds && formData.equipoIds.length > 0 ? "bg-slate-100" : ""}
                                    />
                                    {formData.equipoIds && formData.equipoIds.length > 0 && (
                                        <p className="text-xs text-slate-500">
                                            Se usará el número de equipos seleccionados
                                        </p>
                                    )}
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
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Sección 4: Árbitros */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-purple-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Designación de Árbitros</h2>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
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
                                    <p className="text-xs text-slate-500">
                                        Cantidad de árbitros necesarios para cada encuentro
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-purple-800">Configuración automática</h4>
                                            <p className="text-sm text-purple-600 mt-1">
                                                El sistema calculará automáticamente el total de árbitros necesarios
                                                según el formato y número de jornadas.
                                            </p>
                                            <p className="text-sm font-medium text-purple-700 mt-2">
                                                Total estimado: {
                                                    formData.equipoIds?.length
                                                        ? Math.ceil(formData.equipoIds.length / 2) * (formData.numeroJornadas || 0)
                                                        : (formData.numeroEquipos || 0) / 2 * (formData.numeroJornadas || 0)
                                                } designaciones
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Sección 5: Sede y Calendario */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-orange-500 rounded-full" />
                        <h2 className="text-xl font-semibold text-slate-900">Sede y Calendario</h2>
                    </div>

                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            {/* Lugar */}
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

                            {/* Días de juego */}
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

                            {/* Horarios */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="horaInicio">Hora de Inicio (primer partido)</Label>
                                    <Input
                                        id="horaInicio"
                                        name="horaInicio"
                                        type="time"
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horaFin">Hora de Fin (último partido)</Label>
                                    <Input
                                        id="horaFin"
                                        name="horaFin"
                                        type="time"
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Fechas */}
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
                        <Link href="/dashboard/campeonato">Cancelar</Link>
                    </Button>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Campeonato
                    </Button>
                </div>
            </form>
        </div>
    )
}
