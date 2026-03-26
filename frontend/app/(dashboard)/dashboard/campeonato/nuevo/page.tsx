"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trophy, MapPin, Calendar, Users, Clock, Shield, Check, Plus, Search, Filter } from "lucide-react"
import { getEquipos, createCampeonato, type Equipo, type Campeonato as CampeonatoAPI } from "@/services/api"

export default function NuevoCampeonatoPage() {
    const router = useRouter()
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [loadingEquipos, setLoadingEquipos] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState<Partial<CampeonatoAPI>>({
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
    const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([])

    // Cargar equipos desde el backend
    useEffect(() => {
        async function loadEquipos() {
            try {
                const data = await getEquipos()
                setEquipos(data)
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
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const campeonatoData = {
                ...formData,
                equipos: equiposSeleccionados
            }

            await createCampeonato(campeonatoData)
            router.push("/dashboard/campeonatos")
        } catch (err: any) {
            console.error("Error al crear campeonato:", err)
            setError(err.message || "Error al crear el campeonato")
        } finally {
            setLoading(false)
        }
    }

    const toggleEquipo = (equipoId: number) => {
        if (equiposSeleccionados.includes(equipoId)) {
            setEquiposSeleccionados(equiposSeleccionados.filter(id => id !== equipoId))
        } else if (equiposSeleccionados.length < 16) {
            setEquiposSeleccionados([...equiposSeleccionados, equipoId])
        }
    }

    if (loadingEquipos) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando equipos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/campeonatos">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Campeonatos
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Crear Nuevo Campeonato</h1>
                            <p className="text-slate-600">Configura los detalles del nuevo torneo</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Sección 1: Información Básica */}
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Shield className="h-5 w-5" />
                                Información del Campeonato
                            </CardTitle>
                            <CardDescription>Completa los datos principales del torneo</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        name="nombre"
                                        required
                                        placeholder="Ej: Copa Puno 2026"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoría</Label>
                                    <Select
                                        value={formData.categoria}
                                        onValueChange={(value) => handleSelectChange("categoria", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Primera División">Primera División</SelectItem>
                                            <SelectItem value="Segunda División">Segunda División</SelectItem>
                                            <SelectItem value="Tercera División">Tercera División</SelectItem>
                                            <SelectItem value="Copa">Copa</SelectItem>
                                            <SelectItem value="Torneo">Torneo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select
                                        value={formData.tipo}
                                        onValueChange={(value) => handleSelectChange("tipo", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Liga">Liga</SelectItem>
                                            <SelectItem value="Eliminatoria">Eliminatoria</SelectItem>
                                            <SelectItem value="Mixto">Mixto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select
                                        value={formData.estado}
                                        onValueChange={(value) => handleSelectChange("estado", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROGRAMADO">PROGRAMADO</SelectItem>
                                            <SelectItem value="EN_CURSO">EN CURSO</SelectItem>
                                            <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                                            <SelectItem value="SUSPENDIDO">SUSPENDIDO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                                    <Input
                                        id="fechaInicio"
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={handleChange}
                                        name="fechaInicio"
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                                    <Input
                                        id="fechaFin"
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={handleChange}
                                        name="fechaFin"
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="organizador">Organizador</Label>
                                    <Input
                                        id="organizador"
                                        value={formData.organizador}
                                        onChange={handleChange}
                                        name="organizador"
                                        placeholder="Ej: CODAR Puno"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contacto">Contacto</Label>
                                    <Input
                                        id="contacto"
                                        value={formData.contacto}
                                        onChange={handleChange}
                                        name="contacto"
                                        placeholder="Ej: +51 999 999 999"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección 2: Ubicación y Días */}
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                            <CardTitle className="flex items-center gap-2 text-green-900">
                                <MapPin className="h-5 w-5" />
                                Ubicación y Horarios
                            </CardTitle>
                            <CardDescription>Define dónde y cuándo se jugará</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ciudad">Ciudad</Label>
                                    <Input
                                        id="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        name="ciudad"
                                        placeholder="Ej: Puno"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="provincia">Provincia</Label>
                                    <Input
                                        id="provincia"
                                        value={formData.provincia}
                                        onChange={handleChange}
                                        name="provincia"
                                        placeholder="Ej: Puno"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        name="direccion"
                                        placeholder="Ej: Av. Principal 123"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estadio">Estadio Principal</Label>
                                    <Input
                                        id="estadio"
                                        value={formData.estadio}
                                        onChange={handleChange}
                                        name="estadio"
                                        placeholder="Ej: Estadio Municipal"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="horaInicio">Hora Inicio</Label>
                                    <Input
                                        id="horaInicio"
                                        type="time"
                                        value={formData.horaInicio}
                                        onChange={handleChange}
                                        name="horaInicio"
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="horaFin">Hora Fin</Label>
                                    <Input
                                        id="horaFin"
                                        type="time"
                                        value={formData.horaFin}
                                        onChange={handleChange}
                                        name="horaFin"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <Label className="text-base font-semibold mb-3 block">Días de Juego</Label>
                                <div className="flex flex-wrap gap-2">
                                    {diasOptions.map(dia => (
                                        <Badge
                                            key={dia.value}
                                            variant={formData.diasJuego?.includes(dia.value) ? "default" : "outline"}
                                            className={`cursor-pointer px-4 py-2 ${
                                                formData.diasJuego?.includes(dia.value)
                                                    ? "bg-blue-600 hover:bg-blue-700"
                                                    : "hover:bg-slate-100"
                                            }`}
                                            onClick={() => toggleDia(dia.value)}
                                        >
                                            {dia.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección 3: Selección de Equipos */}
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                            <CardTitle className="flex items-center gap-2 text-purple-900">
                                <Users className="h-5 w-5" />
                                Selección de Equipos
                            </CardTitle>
                            <CardDescription>
                                Selecciona los equipos participantes ({equiposSeleccionados.length}/16)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Filtros */}
                            <div className="mb-6 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar equipos..."
                                        value={searchEquipos}
                                        onChange={(e) => setSearchEquipos(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Select
                                        value={provinciaFilter}
                                        onValueChange={setProvinciaFilter}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Todas las provincias" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todas">Todas las provincias</SelectItem>
                                            <SelectItem value="Puno">Puno</SelectItem>
                                            <SelectItem value="Azángaro">Azángaro</SelectItem>
                                            <SelectItem value="Chucuito">Chucuito</SelectItem>
                                            <SelectItem value="El Collao">El Collao</SelectItem>
                                            <SelectItem value="Huancané">Huancané</SelectItem>
                                            <SelectItem value="Lampa">Lampa</SelectItem>
                                            <SelectItem value="Melgar">Melgar</SelectItem>
                                            <SelectItem value="Moho">Moho</SelectItem>
                                            <SelectItem value="San Antonio de Putina">San Antonio de Putina</SelectItem>
                                            <SelectItem value="San Román">San Román</SelectItem>
                                            <SelectItem value="Sandia">Sandia</SelectItem>
                                            <SelectItem value="Yunguyo">Yunguyo</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={divisionFilter}
                                        onValueChange={setDivisionFilter}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Todas las divisiones" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todas">Todas las divisiones</SelectItem>
                                            <SelectItem value="Primera División">Primera División</SelectItem>
                                            <SelectItem value="Segunda División">Segunda División</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Lista de equipos */}
                            <div className="space-y-6">
                                {equiposPrimera.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Primera División</h3>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {equiposPrimera.map(equipo => (
                                                <div
                                                    key={equipo.id}
                                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        equiposSeleccionados.includes(equipo.id!)
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300"
                                                    }`}
                                                    onClick={() => toggleEquipo(equipo.id!)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{equipo.nombre}</p>
                                                            <p className="text-sm text-slate-600">{equipo.provincia}</p>
                                                        </div>
                                                        {equiposSeleccionados.includes(equipo.id!) && (
                                                            <Check className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {equiposSegunda.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Segunda División</h3>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {equiposSegunda.map(equipo => (
                                                <div
                                                    key={equipo.id}
                                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        equiposSeleccionados.includes(equipo.id!)
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300"
                                                    }`}
                                                    onClick={() => toggleEquipo(equipo.id!)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{equipo.nombre}</p>
                                                            <p className="text-sm text-slate-600">{equipo.provincia}</p>
                                                        </div>
                                                        {equiposSeleccionados.includes(equipo.id!) && (
                                                            <Check className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {equiposSinDivision.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Sin División Asignada</h3>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {equiposSinDivision.map(equipo => (
                                                <div
                                                    key={equipo.id}
                                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        equiposSeleccionados.includes(equipo.id!)
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300"
                                                    }`}
                                                    onClick={() => toggleEquipo(equipo.id!)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-slate-900">{equipo.nombre}</p>
                                                            <p className="text-sm text-slate-600">{equipo.provincia}</p>
                                                        </div>
                                                        {equiposSeleccionados.includes(equipo.id!) && (
                                                            <Check className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredEquipos.length === 0 && (
                                    <div className="text-center py-8 text-slate-600">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                        <p>No se encontraron equipos con los filtros actuales</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard/campeonatos">
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading || equiposSeleccionados.length === 0}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Crear Campeonato
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
