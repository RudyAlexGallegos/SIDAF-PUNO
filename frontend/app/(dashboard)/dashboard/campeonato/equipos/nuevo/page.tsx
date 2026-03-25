"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Save, Building, MapPin, Phone, Mail, Palette } from "lucide-react"
import { createEquipo, type Equipo } from "@/services/api"

export default function NuevoEquipoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [form, setForm] = useState<Equipo>({
        nombre: "",
        categoria: "Primera División",
        provincia: "Puno",
        nombreEstadio: "",
        estadio: "",
        direccion: "",
        telefono: "",
        email: "",
        colores: "",
    })

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
            const response = await createEquipo(form)
            console.log('Equipo creado:', response)
            router.push("/dashboard/campeonato/equipos")
        } catch (err: any) {
            console.error("Error completo:", err)
            setError(err.message || "Error al crear el equipo. Intente de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const categorias = ["Primera División", "Segunda División"]
    
    const provincias = [
        { nombre: "Azángaro", capital: "Azángaro" },
        { nombre: "Carabaya", capital: "Macusani" },
        { nombre: "Chucuito", capital: "Juli" },
        { nombre: "El Collao", capital: "Ilave" },
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
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Nuevo Equipo</CardTitle>
                            <CardDescription className="text-blue-100">Registra un nuevo equipo de fútbol</CardDescription>
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
                                        onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {provincias.map((prov) => (
                                            <option key={prov.nombre} value={prov.nombre}>
                                                {prov.nombre} - Capital: {prov.capital}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombreEstadio">Nombre del Estadio</Label>
                                    <Input
                                        id="nombreEstadio"
                                        placeholder="Nombre del estadio"
                                        value={form.nombreEstadio}
                                        onChange={(e) => setForm({ ...form, nombreEstadio: e.target.value })}
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
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-600"
                            >
                                {loading ? (
                                    "Guardando..."
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Equipo
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
