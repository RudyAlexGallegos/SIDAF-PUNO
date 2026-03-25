"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trophy, MapPin, Calendar, Users, Clock, Shield, Check, Plus, Search, Filter } from "lucide-react"
import { getEquipos, type Equipo } from "@/services/api"
import type { Campeonato } from "@/lib/data-store"
import { createCampeonato, type Campeonato as CampeonatoAPI } from "@/services/api"

// Simple ID generator
const generateId = () => `cam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export default function NuevoCampeonatoPage() {
    const router = useRouter()
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [loadingEquipos, setLoadingEquipos] = useState(true)

    const [formData, setFormData] = useState<Partial<Campeonato>>({
        nombre: "",
        categoria: "Primera División",
        tipo: "Liga",
        fechaInicio: "",
        fechaFin: "",
        estado: "PROGRAMADO",
        organizador: "",
        contacto: "",
        ciudad: "Puno",
        provincia: "Puno",
        nivelDificultad: "Medio",
        numeroEquipos: 16,
        formato: "Liga",
        reglas: "",
        premios: "",
        observaciones: "",
        logo: ""
    })

    const [searchEquipos, setSearchEquipos] = useState("")
    const [provinciaFilter, setProvinciaFilter] = useState("todas")
    const [divisionFilter, setDivisionFilter] = useState("todas")

    // Cargar equipos desde el backend
    useEffect(() => {
        async function loadEquipos() {
            try {
                const data = await getEquipos()
                // Normalizar IDs a string para compatibilidad con el formulario
                const normalized = data.map(e => ({
                    ...e,
                    id: String(e.id)
                }))
                setEquipos(normalized)
            } catch (error) {
                console.error("Error cargando equipos:", error)
            } finally {
                setLoadingEquipos(false)
            }
        }
        loadEquipos()
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
        }
        loadEquipos()
    }, [])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        
        try {
            const campeonatoData = {
                ...form,
                equipos: equiposSeleccionados
            }
            
            await createCampeonato(campeonatoData)
            alert("Campeonato creado exitosamente")
            router.push("/dashboard/campeonato")
        } catch (err) {
            console.error("Error al crear campeonato:", err)
            setError("Error al crear campeonato")
        } finally {
            setLoading(false)
        }
    }
    
    const toggleEquipo = (equipoId: number) => {
        if (equiposSeleccionados.includes(equipoId)) {
            setEquiposSeleccionados(equiposSeleccionados.filter(id => id !== equipoId))
        } else if (equiposSeleccionados.length < 16) {
            setEquiposSeleccionados([...equiposSeleccionados, equipoId])
        } else {
            alert("Solo puedes seleccionar hasta 16 equipos")
        }
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/campeonato">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Nuevo Campeonato</h1>
                    <p className="text-slate-600 mt-1">Completa la información del nuevo campeonato</p>
                </div>
            </div>
            
            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-slate-600" />
                        Información del Campeonato
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        )}
                        
                        {/* Información Básica */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h3>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                                    <Input
                                        id="nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        required
                                        placeholder="Ej: Copa Puno 2026"
                                        className="w-full"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoría</Label>
                                    <select
                                        id="categoria"
                                        value={form.categoria}
                                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Primera División">Primera División</option>
                                        <option value="Segunda División">Segunda División</option>
                                        <option value="Tercera División">Tercera División</option>
                                        <option value="Copa">Copa</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <select
                                        id="tipo"
                                        value={form.tipo}
                                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Liga">Liga</option>
                                        <option value="Copa">Copa</option>
                                        <option value="Torneo">Torneo</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <select
                                        id="estado"
                                        value={form.estado}
                                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="PROGRAMADO">Programado</option>
                                        <option value="ACTIVO">Activo</option>
                                        <option value="FINALIZADO">Finalizado</option>
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
                            {loadingEquipos ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-500">Cargando equipos...</p>
                                </div>
                            ) : equipos.length === 0 ? (
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
                                        type="date"
                                        value={form.fechaInicio}
                                        onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="fechaFin">Fecha de Finalización</Label>
                                    <Input
                                        id="fechaFin"
                                        type="date"
                                        value={form.fechaFin}
                                        onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Ubicación */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ubicación</h3>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ciudad">Ciudad</Label>
                                    <Input
                                        id="ciudad"
                                        value={form.ciudad}
                                        onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                                        required
                                        placeholder="Ej: Puno"
                                        className="w-full"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="provincia">Provincia</Label>
                                    <Input
                                        id="provincia"
                                        value={form.provincia}
                                        onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                                        required
                                        placeholder="Ej: Puno"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Organizador */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Organizador</h3>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="organizador">Nombre del Organizador</Label>
                                    <Input
                                        id="organizador"
                                        value={form.organizador}
                                        onChange={(e) => setForm({ ...form, organizador: e.target.value })}
                                        required
                                        placeholder="Ej: RUDY ALEX GALLEGOS LIZARRAGA"
                                        className="w-full"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="contacto">Contacto</Label>
                                    <Input
                                        id="contacto"
                                        value={form.contacto}
                                        onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                                        placeholder="Ej: 123456789"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Configuración del Torneo */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuración del Torneo</h3>
                            
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="numeroEquipos">Número de Equipos</Label>
                                    <Input
                                        id="numeroEquipos"
                                        type="number"
                                        value={form.numeroEquipos}
                                        onChange={(e) => setForm({ ...form, numeroEquipos: parseInt(e.target.value) })}
                                        required
                                        min={2}
                                        max={32}
                                        className="w-full"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="nivelDificultad">Nivel de Dificultad</Label>
                                    <select
                                        id="nivelDificultad"
                                        value={form.nivelDificultad}
                                        onChange={(e) => setForm({ ...form, nivelDificultad: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Fácil">Fácil</option>
                                        <option value="Medio">Medio</option>
                                        <option value="Difícil">Difícil</option>
                                        <option value="Experto">Experto</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="formato">Formato</Label>
                                    <select
                                        id="formato"
                                        value={form.formato}
                                        onChange={(e) => setForm({ ...form, formato: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Liga">Liga</option>
                                        <option value="Eliminación Directa">Eliminación Directa</option>
                                        <option value="Grupos + Eliminación">Grupos + Eliminación</option>
                                        <option value="Grupos + Fase Final">Grupos + Fase Final</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Selección de Equipos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipos Participantes ({equiposSeleccionados.length}/{form.numeroEquipos})</h3>
                            
                            <div className="grid gap-3 md:grid-cols-4">
                                {equiposDisponibles.map((equipoId) => (
                                    <div
                                        key={equipoId}
                                        onClick={() => toggleEquipo(equipoId)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            equiposSeleccionados.includes(equipoId)
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div className="text-center">
                                            <div className="font-medium text-slate-900">Equipo {equipoId}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {equiposSeleccionados.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    Selecciona los equipos que participarán en este campeonato
                                </p>
                            )}
                        </div>
                        
                        {/* Reglas y Premios */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="reglas">Reglas del Torneo</Label>
                                <textarea
                                    id="reglas"
                                    value={form.reglas}
                                    onChange={(e) => setForm({ ...form, reglas: e.target.value })}
                                    rows={4}
                                    placeholder="Especifica las reglas del torneo..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="premios">Premios</Label>
                                <textarea
                                    id="premios"
                                    value={form.premios}
                                    onChange={(e) => setForm({ ...form, premios: e.target.value })}
                                    rows={4}
                                    placeholder="Especifica los premios del torneo..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        {/* Observaciones */}
                        <div className="space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <textarea
                                id="observaciones"
                                value={form.observaciones}
                                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                                rows={4}
                                placeholder="Agrega cualquier observación adicional..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        {/* Logo */}
                        <div className="space-y-2">
                            <Label htmlFor="logo">URL del Logo</Label>
                            <Input
                                id="logo"
                                value={form.logo}
                                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                placeholder="https://ejemplo.com/logo.png"
                                className="w-full"
                            />
                        </div>
                        
                        {/* Botones */}
                        <div className="flex gap-4 justify-end pt-6 border-t border-slate-200">
                            <Link href="/dashboard/campeonato">
                                <Button variant="outline" type="button" disabled={loading}>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar Campeonato
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
