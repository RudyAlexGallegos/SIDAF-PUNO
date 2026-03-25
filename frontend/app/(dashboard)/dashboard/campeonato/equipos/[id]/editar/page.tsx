"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Save, Building, MapPin, Phone, Mail, Palette, Loader2 } from "lucide-react"
import { getEquipoById, updateEquipo, type Equipo } from "@/services/api"
import { getDistritosPorProvincia } from "@/lib/distritos-puno"

export default function EditarEquipoPage() {
    const router = useRouter()
    const params = useParams()
    const equipoId = Number(params.id)
    
    const [loading, setLoading] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")
    const [equipoOriginal, setEquipoOriginal] = useState<Equipo | null>(null)
    
    const [form, setForm] = useState<Equipo>({
        nombre: "",
        categoria: "Primera División",
        provincia: "Puno",
        distrito: "",
        estadio: "",
        direccion: "",
        telefono: "",
        email: "",
        colores: ""
    })
    
    const distritosDisponibles = useMemo(() => {
        return getDistritosPorProvincia(form.provincia)
    }, [form.provincia])
    
    // Cargar datos del equipo
    useEffect(() => {
        async function loadEquipo() {
            try {
                const data = await getEquipoById(equipoId)
                if (data) {
                    setEquipoOriginal(data)
                    setForm({
                        nombre: data.nombre || "",
                        categoria: data.categoria || "Primera División",
                        provincia: data.provincia || "Puno",
                        estadio: data.estadio || "",
                        direccion: data.direccion || "",
                        telefono: data.telefono || "",
                        email: data.email || "",
                        colores: data.colores || "",
                    })
                }
            } catch (err) {
                console.error("Error cargando equipo:", err)
                setError("Error al cargar los datos del equipo")
            } finally {
                setCargando(false)
            }
        }
        
        if (equipoId) {
            loadEquipo()
        }
    }, [equipoId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!form.nombre?.trim()) {
            setError("El nombre del equipo es requerido")
            setLoading(false)
            return
        }

        try {
            const response = await updateEquipo(equipoId, form)
            console.log('Equipo actualizado:', response)
            router.push("/dashboard/campeonato/equipos")
        } catch (err: any) {
            console.error("Error completo:", err)
            setError(err.message || "Error al actualizar el equipo. Intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const categorias = ["Primera División", "Segunda División"]
    
    const provincias = [
        { nombre: "Azángaro" },
        { nombre: "Carabaya" },
        { nombre: "Chucuito"},
        { nombre: "El Collao" },
        { nombre: "Huancané", capital: "Huancané" },
        { nombre: "Lampa", capital: "Lampa" },
        { nombre: "Melgar", capital: "Ayaviri" },
        { nombre: "Moho", capital: "Moho" },
        { nombre: "Puno", capital: "Puno (capital del departamento)" },
        { nombre: "San Antonio de Putina", capital: "Putina" },
        { nombre: "San Román", capital: "Juliaca (ciudad más poblada)" },
        { nombre: "Sandia", capital: "Sandia" },
        { nombre: "Yunguyo", capital: "Yunguyo" }
    ]

    const colores = [
        { value: "Rojo", label: "Rojo", bg: "bg-red-500" },
        { value: "Azul", label: "Azul", bg: "bg-blue-500" },
        { value: "Verde", label: "Verde", bg: "bg-green-500" },
        { value: "Amarillo", label: "Amarillo", bg: "bg-yellow-500" },
        { value: "Blanco", label: "Blanco", bg: "bg-gray-200" },
        { value: "Negro", label: "Negro", bg: "bg-black" },
        { value: "Naranja", label: "Naranja", bg: "bg-orange-500" },
        { value: "Violeta", label: "Violeta", bg: "bg-purple-500" },
    ]

    if (cargando) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-slate-500">Cargando equipo...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/campeonato/equipos" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Volver</span>
                </Link>
            </div>

            <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Editar Equipo</CardTitle>
                            <CardDescription className="text-amber-100">Actualiza los datos del equipo</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Información Principal */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre del Equipo *</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej: Club Deportivo Puno"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    required
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
                                    {categorias.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Ubicación
                            </Label>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="provincia">Provincia</Label>
                                    <select
                                        id="provincia"
                                        value={form.provincia}
                                        onChange={(e) => setForm({ ...form, provincia: e.target.value, distrito: "" })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {provincias.map((prov) => (
                                            <option key={prov.nombre} value={prov.nombre}>
                                                {prov.nombre} : {prov.capital}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="distrito">Distrito</Label>
                                    <select
                                        id="distrito"
                                        value={form.distrito}
                                        onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={distritosDisponibles.length === 0}
                                    >
                                        <option value="">Seleccione un distrito</option>
                                        {distritosDisponibles.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    {distritosDisponibles.length === 0 && form.provincia !== "" && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Distritos no disponibles para esta provincia
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estadio">Estadio</Label>
                                    <Input
                                        id="estadio"
                                        placeholder="Nombre del estadio"
                                        value={form.estadio}
                                        onChange={(e) => setForm({ ...form, estadio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input
                                    id="direccion"
                                    placeholder="Dirección del club o sede"
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Información de Contacto
                            </Label>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input
                                        id="telefono"
                                        placeholder="Número de teléfono"
                                        value={form.telefono}
                                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="correo@equipo.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colores */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Colores del Equipo
                            </Label>
                            <div className="grid grid-cols-4 gap-3">
                                {colores.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, colores: color.value })}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            form.colores === color.value 
                                                ? "border-blue-500 ring-2 ring-blue-200" 
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className={`w-full h-8 rounded-md ${color.bg} mb-2`}></div>
                                        <span className="text-xs font-medium">{color.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            >
                                {loading ? (
                                    "Guardando..."
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Actualizar Equipo
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
