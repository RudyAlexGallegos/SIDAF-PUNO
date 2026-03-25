"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar, MapPin, Users, Trophy, Building, Phone, Mail } from "lucide-react"
import { createCampeonato, type Campeonato } from "@/services/api"
import { getEquipos } from "@/services/api"

export default function NuevoCampeonatoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [form, setForm] = useState<Campeonato>({
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
    
    const [equiposDisponibles, setEquiposDisponibles] = useState<number[]>([])
    const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([])
    
    useEffect(() => {
        async function loadEquipos() {
            try {
                const data = await getEquipos()
                setEquiposDisponibles(data.map(e => e.id!))
            } catch (err) {
                console.error("Error al cargar equipos:", err)
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
                        </div>
                        
                        {/* Fechas */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Fechas</h3>
                            
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
