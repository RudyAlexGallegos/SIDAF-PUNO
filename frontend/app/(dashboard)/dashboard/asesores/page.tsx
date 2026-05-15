"use client"

import { useState, useEffect } from "react"
import { getStoredUser, getAsesores, createAsesor, updateAsesor, deleteAsesor, cambiarEstadoAsesor, Asesor } from "@/services/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCache } from "@/hooks/useCache"
import { TableSkeleton } from "@/components/Skeletons"
import { Plus, Edit2, Trash2, Eye, BookOpen, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AsesoresPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [usuario, setUsuario] = useState<any>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    // Modal states
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [asesorEditando, setAsesorEditando] = useState<Asesor | null>(null)

    // Form states
    const [formData, setFormData] = useState<Asesor>({
        usuarioId: 0,
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        telefono: "",
        especialidad: "",
        estado: "ACTIVO",
        descripcion: "",
    })

    // Fetch asesores
    const fetchAsesores = async () => {
        const data = await getAsesores().catch(() => [])
        return data || []
    }

    const { data: asesores = [], isLoading, refetch } = useCache(
        "asesores",
        fetchAsesores,
        { ttl: 5 * 60 * 1000 }
    )

    useEffect(() => {
        try {
            const user = getStoredUser()
            if (!user) {
                router.push("/login")
                return
            }
            setUsuario(user)

            // Verificar permisos
            if (user.rol !== "ADMIN" && user.rol !== "PRESIDENCIA_CODAR") {
                setError("No tienes permisos para acceder a esta página")
                return
            }
        } catch (err: any) {
            console.error("Error en useEffect:", err)
            setError("Error al cargar la página")
        }
    }, [router])

    // Filtrar asesores por búsqueda
    const asesoreFiltrados = (asesores || []).filter(a =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.dni.includes(searchTerm) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Manejar crear asesor
    const handleCrearAsesor = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email) {
            setError("Por favor completa todos los campos requeridos")
            return
        }

        try {
            await createAsesor(formData)
            setSuccess("Asesor creado exitosamente")
            setError("")
            setFormData({
                usuarioId: 0,
                nombre: "",
                apellido: "",
                dni: "",
                email: "",
                telefono: "",
                especialidad: "",
                estado: "ACTIVO",
                descripcion: "",
            })
            setMostrarModalCrear(false)
            refetch()
            toast({
                title: "✅ Asesor creado",
                description: `${formData.nombre} ${formData.apellido}`,
            })
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    // Manejar editar asesor
    const handleEditarAsesor = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!asesorEditando?.id) return

        try {
            await updateAsesor(asesorEditando.id, asesorEditando)
            setSuccess("Asesor actualizado exitosamente")
            setError("")
            setMostrarModalEditar(false)
            setAsesorEditando(null)
            refetch()
            toast({
                title: "✅ Asesor actualizado",
                description: `${asesorEditando.nombre} ${asesorEditando.apellido}`,
            })
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    // Manejar cambiar estado
    const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await cambiarEstadoAsesor(id, nuevoEstado)
            setSuccess("Estado actualizado")
            setError("")
            refetch()
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    // Manejar eliminar asesor
    const handleEliminarAsesor = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este asesor?")) {
            return
        }
        try {
            await deleteAsesor(id)
            setSuccess("Asesor eliminado exitosamente")
            setError("")
            refetch()
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    if (error && !usuario) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <Button onClick={() => router.push("/login")} className="mt-4 bg-sky-600 hover:bg-sky-700">
                        Volver al login
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-sky-900 mb-2 flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-sky-600" />
                        Gestión de Asesores
                    </h1>
                    <p className="text-sky-600 text-lg">
                        Administra los asesores de árbitros de la comisión
                    </p>
                </div>

                {/* Alertas */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-emerald-600 text-sm">{success}</p>
                    </div>
                )}

                {/* Barra de búsqueda y botón crear */}
                <div className="mb-6 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-sky-400" />
                        <Input
                            placeholder="Buscar por nombre, DNI o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-sky-200 bg-white focus:ring-sky-500/50"
                        />
                    </div>
                    <Button
                        onClick={() => setMostrarModalCrear(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Asesor
                    </Button>
                </div>

                {/* Tabla de asesores */}
                {isLoading ? (
                    <TableSkeleton />
                ) : asesoreFiltrados.length === 0 ? (
                    <Card className="border-2 border-sky-200 bg-white">
                        <CardContent className="p-8 text-center">
                            <p className="text-sky-600 text-lg">No hay asesores registrados</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-2 border-sky-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-sky-200 bg-gradient-to-r from-sky-50 to-sky-100">
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Nombre</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">DNI</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Especialidad</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Estado</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asesoreFiltrados.map((asesor, idx) => (
                                        <tr key={asesor.id} className={`border-b border-sky-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-sky-50/30'} hover:bg-sky-100/50 transition-all`}>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-sky-900">{asesor.nombre} {asesor.apellido}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sky-600">{asesor.dni}</td>
                                            <td className="px-6 py-4 text-sky-600 text-sm">{asesor.email}</td>
                                            <td className="px-6 py-4 text-sky-600">{asesor.especialidad || "-"}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={`${
                                                    asesor.estado === "ACTIVO"
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-red-600 text-white"
                                                }`}>
                                                    {asesor.estado || "ACTIVO"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setAsesorEditando(asesor)
                                                            setMostrarModalEditar(true)
                                                        }}
                                                        className="p-2 hover:bg-sky-100 rounded transition-all text-sky-600"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarAsesor(asesor.id!)}
                                                        className="p-2 hover:bg-red-100 rounded transition-all text-red-600"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Modal Crear Asesor */}
                {mostrarModalCrear && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="border-2 border-sky-200 bg-white max-w-md w-full shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-500">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Crear Nuevo Asesor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <form onSubmit={handleCrearAsesor} className="space-y-4">
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Nombre *</Label>
                                        <Input
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            placeholder="Nombre"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Apellido *</Label>
                                        <Input
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                            placeholder="Apellido"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">DNI *</Label>
                                        <Input
                                            value={formData.dni}
                                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                            placeholder="DNI"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Email"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Teléfono</Label>
                                        <Input
                                            value={formData.telefono || ""}
                                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                            placeholder="Teléfono"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Especialidad</Label>
                                        <Input
                                            value={formData.especialidad || ""}
                                            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                                            placeholder="Especialidad"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setMostrarModalCrear(false)}
                                            className="flex-1 border-sky-200 text-sky-900 hover:bg-sky-50"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Crear
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Modal Editar Asesor */}
                {mostrarModalEditar && asesorEditando && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="border-2 border-sky-200 bg-white max-w-md w-full shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-500">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" />
                                    Editar Asesor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <form onSubmit={handleEditarAsesor} className="space-y-4">
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Nombre</Label>
                                        <Input
                                            value={asesorEditando.nombre}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, nombre: e.target.value })}
                                            placeholder="Nombre"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Apellido</Label>
                                        <Input
                                            value={asesorEditando.apellido}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, apellido: e.target.value })}
                                            placeholder="Apellido"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Email</Label>
                                        <Input
                                            type="email"
                                            value={asesorEditando.email}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, email: e.target.value })}
                                            placeholder="Email"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Teléfono</Label>
                                        <Input
                                            value={asesorEditando.telefono || ""}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, telefono: e.target.value })}
                                            placeholder="Teléfono"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Especialidad</Label>
                                        <Input
                                            value={asesorEditando.especialidad || ""}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, especialidad: e.target.value })}
                                            placeholder="Especialidad"
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sky-900 font-semibold">Estado</Label>
                                        <select
                                            value={asesorEditando.estado || "ACTIVO"}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, estado: e.target.value })}
                                            className="w-full px-3 py-2 border border-sky-200 rounded-md text-sky-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        >
                                            <option value="ACTIVO">Activo</option>
                                            <option value="INACTIVO">Inactivo</option>
                                            <option value="SUSPENDIDO">Suspendido</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setMostrarModalEditar(false)
                                                setAsesorEditando(null)
                                            }}
                                            className="flex-1 border-sky-200 text-sky-900 hover:bg-sky-50"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                                        >
                                            Guardar
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
