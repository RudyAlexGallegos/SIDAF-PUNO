"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { getStoredUser, getAsesores, createAsesor, updateAsesor, deleteAsesor, cambiarEstadoAsesor, Asesor, Usuario, getTodosUsuarios } from "@/services/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/Skeletons"
import {
    Plus, Edit2, Trash2, BookOpen, Search, X,
    Mail, Phone, CheckCircle, XCircle, ArrowLeft,
} from "lucide-react"

export default function AsesoresPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<any>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [asesores, setAsesores] = useState<Asesor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // Modal states
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [asesorEditando, setAsesorEditando] = useState<Asesor | null>(null)
    const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([])
    const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null)

    const [formData, setFormData] = useState<Asesor>({
        usuarioId: 0, nombre: "", apellido: "", dni: "", email: "",
        telefono: "", especialidad: "", estado: "ACTIVO", descripcion: "",
    })

    const cargarAsesores = async () => {
        setIsLoading(true)
        try {
            const data = await getAsesores()
            setAsesores(Array.isArray(data) ? data : [])
        } catch { setAsesores([]) }
        finally { setIsLoading(false) }
    }

    useEffect(() => {
        const user = getStoredUser()
        if (!user) { router.push("/login"); return }
        setUsuario(user)
        cargarAsesores()
    }, [router])

    useEffect(() => {
        if (!mostrarModalCrear) return
        const cargarUsuarios = async () => {
            try {
                const [usuarios, existentes] = await Promise.all([
                    getTodosUsuarios().catch(() => []),
                    getAsesores().catch(() => []),
                ])
                const asignados = new Set((existentes || []).map((a) => a.usuarioId).filter(Boolean))
                setUsuariosDisponibles((usuarios || []).filter((u: Usuario) => u.id && !asignados.has(u.id)))
            } catch { setUsuariosDisponibles([]) }
        }
        cargarUsuarios()
    }, [mostrarModalCrear])

    useEffect(() => {
        if (!success) return
        const t = setTimeout(() => setSuccess(""), 4000)
        return () => clearTimeout(t)
    }, [success])

    const asesoreFiltrados = asesores.filter(a => {
        const term = searchTerm.toLowerCase()
        return `${a.nombre} ${a.apellido}`.toLowerCase().includes(term) ||
            (a.dni || "").toLowerCase().includes(term) ||
            (a.email || "").toLowerCase().includes(term)
    })

    const handleCrearAsesor = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email) {
            setError("Completa todos los campos requeridos"); return
        }
        const usuarioId = formData.usuarioId || usuario?.id || 0
        if (!usuarioId) { setError("Selecciona un usuario existente"); return }
        try {
            await createAsesor({ ...formData, usuarioId })
            setSuccess("Asesor creado exitosamente")
            setError("")
            setFormData({ usuarioId: 0, nombre: "", apellido: "", dni: "", email: "", telefono: "", especialidad: "", estado: "ACTIVO", descripcion: "" })
            setUsuarioSeleccionadoId(null)
            setMostrarModalCrear(false)
            cargarAsesores()
        } catch (err: any) { setError(err.message || "Error al crear asesor") }
    }

    const handleEditarAsesor = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!asesorEditando?.id) return
        try {
            await updateAsesor(asesorEditando.id, asesorEditando)
            setSuccess("Asesor actualizado")
            setError("")
            setMostrarModalEditar(false)
            setAsesorEditando(null)
            cargarAsesores()
        } catch (err: any) { setError("Error: " + err.message) }
    }

    const handleEliminarAsesor = async (id: number) => {
        if (!confirm("¿Eliminar este asesor?")) return
        setDeletingId(id)
        try {
            await deleteAsesor(id)
            setSuccess("Asesor eliminado")
            cargarAsesores()
        } catch (err: any) { setError("Error: " + err.message) }
        finally { setDeletingId(null) }
    }

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
                <div className="container mx-auto w-full max-w-7xl px-4 py-8">
                    <h1 className="text-3xl font-bold text-sky-900 mb-8">Gestión de Asesores</h1>
                    <CardSkeleton count={8} />
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <div className="container mx-auto w-full max-w-7xl px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-sky-100">
                                    <ArrowLeft className="h-5 w-5 text-sky-900" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-sky-900">Gestión de Asesores</h1>
                                <p className="text-sky-600 mt-1">{asesoreFiltrados.length} resultado{asesoreFiltrados.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <Button onClick={() => setMostrarModalCrear(true)} className="bg-sky-600 hover:bg-sky-700 h-10">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo
                        </Button>
                    </div>

                    {/* Alertas */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                            <XCircle className="h-4 w-4 shrink-0" />{error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0" />{success}
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, email o DNI..."
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-sky-200 bg-white text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid de cards */}
                {asesoreFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BookOpen className="h-16 w-16 text-sky-200 mb-4" />
                        <h3 className="text-lg font-semibold text-sky-900 mb-2">No se encontraron asesores</h3>
                        <p className="text-sky-600 mb-6">
                            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer asesor"}
                        </p>
                        <Button onClick={() => setMostrarModalCrear(true)} className="bg-sky-600 hover:bg-sky-700">
                            <Plus className="h-4 w-4 mr-2" />Nuevo Asesor
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {asesoreFiltrados.map((asesor) => (
                            <Card key={asesor.id} className="bg-white border-sky-200 hover:shadow-lg hover:border-sky-300 transition-all">
                                <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
                                <CardContent className="p-4">
                                    {/* Nombre */}
                                    <h3 className="font-bold text-sky-900 text-center mb-2 line-clamp-2">
                                        {asesor.apellido} {asesor.nombre}
                                    </h3>

                                    {/* Especialidad badge */}
                                    {asesor.especialidad && (
                                        <div className="flex justify-center mb-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                                                {asesor.especialidad}
                                            </span>
                                        </div>
                                    )}

                                    {/* Estado */}
                                    <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-sky-100">
                                        {asesor.estado === "ACTIVO" ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                <span className="text-sm font-medium text-emerald-600">Activo</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-600">{asesor.estado || "Inactivo"}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Contacto */}
                                    <div className="space-y-2 mb-4 text-sm">
                                        {asesor.telefono && (
                                            <div className="flex items-center gap-2 text-sky-700">
                                                <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                                                <span className="truncate">{asesor.telefono}</span>
                                            </div>
                                        )}
                                        {asesor.email && (
                                            <div className="flex items-center gap-2 text-sky-700">
                                                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                                                <span className="truncate text-xs">{asesor.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-sky-600 hover:bg-sky-700"
                                            onClick={() => { setAsesorEditando(asesor); setMostrarModalEditar(true) }}
                                        >
                                            <Edit2 className="h-3 w-3 mr-1" />Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => asesor.id && handleEliminarAsesor(asesor.id)}
                                            disabled={deletingId === asesor.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear Asesor */}
            {mostrarModalCrear && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="border-2 border-sky-200 bg-white max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-500 sticky top-0">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Plus className="w-5 h-5" />Crear Nuevo Asesor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <form onSubmit={handleCrearAsesor} className="space-y-4">
                                <div>
                                    <Label className="text-sky-900 font-semibold">Usuario asociado *</Label>
                                    <select
                                        value={usuarioSeleccionadoId ?? ""}
                                        onChange={(e) => {
                                            const id = Number(e.target.value)
                                            setUsuarioSeleccionadoId(id || null)
                                            const sel = usuariosDisponibles.find((u) => u.id === id)
                                            if (sel) setFormData(prev => ({ ...prev, usuarioId: sel.id || 0, nombre: prev.nombre || sel.nombre || "", apellido: prev.apellido || sel.apellido || "", dni: prev.dni || sel.dni || "", email: prev.email || sel.email || "" }))
                                        }}
                                        className="w-full px-3 py-2 border border-sky-200 rounded-md text-sky-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="">Selecciona un usuario</option>
                                        {usuariosDisponibles.map((u) => (
                                            <option key={u.id} value={u.id}>{`${u.nombre || ""} ${u.apellido || ""}`.trim() || u.email || u.dni}</option>
                                        ))}
                                    </select>
                                </div>
                                {[
                                    { label: "Nombre *", key: "nombre", placeholder: "Nombre" },
                                    { label: "Apellido *", key: "apellido", placeholder: "Apellido" },
                                    { label: "DNI *", key: "dni", placeholder: "DNI" },
                                    { label: "Email *", key: "email", placeholder: "Email", type: "email" },
                                    { label: "Teléfono", key: "telefono", placeholder: "Teléfono" },
                                    { label: "Especialidad", key: "especialidad", placeholder: "Especialidad" },
                                ].map(({ label, key, placeholder, type }) => (
                                    <div key={key}>
                                        <Label className="text-sky-900 font-semibold">{label}</Label>
                                        <Input
                                            type={type || "text"}
                                            value={(formData as any)[key] || ""}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                            placeholder={placeholder}
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                ))}
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setMostrarModalCrear(false)} className="flex-1 border-sky-200">Cancelar</Button>
                                    <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">Crear</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal Editar Asesor */}
            {mostrarModalEditar && asesorEditando && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="border-2 border-sky-200 bg-white max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-500 sticky top-0">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5" />Editar Asesor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <form onSubmit={handleEditarAsesor} className="space-y-4">
                                {[
                                    { label: "Nombre", key: "nombre" },
                                    { label: "Apellido", key: "apellido" },
                                    { label: "Email", key: "email", type: "email" },
                                    { label: "Teléfono", key: "telefono" },
                                    { label: "Especialidad", key: "especialidad" },
                                ].map(({ label, key, type }) => (
                                    <div key={key}>
                                        <Label className="text-sky-900 font-semibold">{label}</Label>
                                        <Input
                                            type={type || "text"}
                                            value={(asesorEditando as any)[key] || ""}
                                            onChange={(e) => setAsesorEditando({ ...asesorEditando, [key]: e.target.value })}
                                            className="border-sky-200 focus:ring-sky-500/50"
                                        />
                                    </div>
                                ))}
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
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => { setMostrarModalEditar(false); setAsesorEditando(null) }} className="flex-1 border-sky-200">Cancelar</Button>
                                    <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">Guardar</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
