"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { getStoredUser, getUsuariosPendientes, getTodosUsuarios, aprobarUsuario, asignarPermisos, cambiarEstadoUsuario, logout, eliminarUsuario, Usuario, createAsesor } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users, UserCheck, UserX, RefreshCw, Search, Shield, Clock,
    CheckCircle, XCircle, AlertCircle, Eye, ChevronDown
} from "lucide-react"

const PERMISOS_DISPONIBLES = [
    { valor: "VER_ARBITROS", etiqueta: "Ver Árbitros" },
    { valor: "GESTION_ARBITROS", etiqueta: "Gestionar Árbitros" },
    { valor: "GESTION_ASISTENCIA", etiqueta: "Gestionar Asistencia" },
    { valor: "GESTION_DESIGNACIONES", etiqueta: "Gestionar Designaciones" },
    { valor: "GESTION_CAMPEONATOS", etiqueta: "Gestionar Campeonatos" },
    { valor: "GESTION_EQUIPOS", etiqueta: "Gestionar Equipos" },
    { valor: "VER_REPORTES", etiqueta: "Ver Reportes" },
]

export default function GestionUsuariosPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [tabActiva, setTabActiva] = useState<"pendientes" | "todos">("pendientes")
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([])
    const [rolSeleccionado, setRolSeleccionado] = useState<string>("UNIDAD_TECNICA_CODAR")
    const [usuarioParaAprobar, setUsuarioParaAprobar] = useState<Usuario | null>(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroRol, setFiltroRol] = useState("TODOS")
    const [filtroEstado, setFiltroEstado] = useState("TODOS")
    const [pendientes, setPendientes] = useState<Usuario[]>([])
    const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([])
    const [loadingPendientes, setLoadingPendientes] = useState(true)
    const [loadingTodos, setLoadingTodos] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)

    const cargarPendientes = useCallback(async () => {
        setLoadingPendientes(true)
        setApiError(null)
        try {
            const data = await getUsuariosPendientes()
            setPendientes(data || [])
        } catch (err: any) {
            console.error("Error cargando pendientes:", err)
            setApiError("Error al conectar con el servidor. El backend puede estar iniciando (Render cold start). Intente refrescar.")
        } finally {
            setLoadingPendientes(false)
        }
    }, [])

    const cargarTodos = useCallback(async () => {
        setLoadingTodos(true)
        setApiError(null)
        try {
            const data = await getTodosUsuarios()
            setTodosUsuarios(data || [])
        } catch (err: any) {
            console.error("Error cargando usuarios:", err)
            setApiError("Error al conectar con el servidor. El backend puede estar iniciando (Render cold start). Intente refrescar.")
        } finally {
            setLoadingTodos(false)
        }
    }, [])

    const refrescar = useCallback(() => {
        cargarPendientes()
        cargarTodos()
        setSuccess("")
        setError("")
    }, [cargarPendientes, cargarTodos])

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        cargarPendientes()
        cargarTodos()
    }, [router, cargarPendientes, cargarTodos])

    // Auto-dismiss success
    useEffect(() => {
        if (!success) return
        const t = setTimeout(() => setSuccess(""), 4000)
        return () => clearTimeout(t)
    }, [success])

    const handleAprobar = async (id: number, user?: Usuario) => {
        if (!rolSeleccionado) {
            setError("Por favor selecciona un rol")
            return
        }
        try {
            await aprobarUsuario(id, rolSeleccionado, "[]")
            
            // Si el rol es ASESOR, crear automáticamente el asesor
            if (rolSeleccionado === "ASESOR" && user) {
                try {
                    await createAsesor({
                        usuarioId: id,
                        nombre: user.nombre || "",
                        apellido: user.apellido || "",
                        dni: user.dni || "",
                        email: user.email || "",
                        telefono: user.telefono || "",
                        estado: "ACTIVO",
                    })
                } catch (err: any) {
                    console.error("Error al crear asesor:", err)
                    // No fallar la aprobación del usuario si falla la creación del asesor
                }
            }
            
            setSuccess("Usuario aprobado exitosamente")
            setError("")
            setUsuarioParaAprobar(null)
            setRolSeleccionado("UNIDAD_TECNICA_CODAR")
            cargarPendientes()
            cargarTodos()
        } catch (err: any) {
            setError("Error al aprobar: " + err.message)
        }
    }

    const abrirAprobarModal = (user: Usuario) => {
        setUsuarioParaAprobar(user)
        setRolSeleccionado("UNIDAD_TECNICA_CODAR")
    }

    const handleCambiarEstado = async (id: number, estado: string) => {
        try {
            await cambiarEstadoUsuario(id, estado)
            setSuccess("Estado actualizado")
            setError("")
            cargarPendientes()
            cargarTodos()
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    const handleEliminar = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            return
        }
        try {
            await eliminarUsuario(id)
            setSuccess("Usuario eliminado exitosamente")
            setError("")
            cargarPendientes()
            cargarTodos()
        } catch (err: any) {
            setError("Error al eliminar: " + err.message)
        }
    }

    const handleAsignarPermisos = async () => {
        if (!usuarioSeleccionado) return
        
        try {
            await asignarPermisos(usuarioSeleccionado.id!, permisosSeleccionados)
            setSuccess("Permisos actualizados")
            setError("")
            setUsuarioSeleccionado(null)
            cargarPendientes()
            cargarTodos()
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    const abrirModalPermisos = (user: Usuario) => {
        setUsuarioSeleccionado(user)
        // Parsear permisos existentes
        try {
            if (user.permisosEspecificos) {
                const permisos = typeof user.permisosEspecificos === 'string' 
                    ? JSON.parse(user.permisosEspecificos)
                    : user.permisosEspecificos
                setPermisosSeleccionados(Array.isArray(permisos) ? permisos : [])
            } else {
                setPermisosSeleccionados([])
            }
        } catch (err) {
            console.error("Error al parsear permisos:", err)
            setPermisosSeleccionados([])
        }
    }

    const togglePermiso = (permiso: string) => {
        if (permisosSeleccionados.includes(permiso)) {
            setPermisosSeleccionados(permisosSeleccionados.filter(p => p !== permiso))
        } else {
            setPermisosSeleccionados([...permisosSeleccionados, permiso])
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const getRolLabel = (rol: string | undefined) => {
        switch (rol) {
            case "ADMIN": return "Administrador"
            case "PRESIDENCIA_CODAR": return "Presidente CODAR"
            case "UNIDAD_TECNICA_CODAR": return "Unidad Técnica CODAR"
            case "ARBITRO": return "Árbitro"
            case "ASESOR": return "Asesor"
            default: return rol || "Sin rol"
        }
    }

    const usuariosFiltrados = todosUsuarios.filter(u => {
        const texto = busqueda.toLowerCase()
        const coincideTexto = !texto ||
            `${u.nombre} ${u.apellido}`.toLowerCase().includes(texto) ||
            (u.dni || "").toLowerCase().includes(texto) ||
            (u.email || "").toLowerCase().includes(texto)
        const coincideRol = filtroRol === "TODOS" || u.rol === filtroRol
        const coincideEstado = filtroEstado === "TODOS" || u.estado === filtroEstado
        return coincideTexto && coincideRol && coincideEstado
    })

    const estadoBadge = (estado: string | undefined) => {
        switch (estado) {
            case "ACTIVO":
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Activo</span>
            case "PENDING":
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3" />Pendiente</span>
            case "INACTIVO":
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Inactivo</span>
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{estado || "?"}</span>
        }
    }

    const isLoading = loadingPendientes || loadingTodos

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-gray-500 mt-1">Administra los usuarios del sistema SIDAF-PUNO</p>
                </div>
                <Button
                    variant="outline"
                    onClick={refrescar}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Cargando..." : "Refrescar"}
                </Button>
            </div>

            {/* Error del API */}
            {apiError && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Error de conexión</p>
                        <p className="text-sm">{apiError}</p>
                        <button onClick={refrescar} className="text-sm underline mt-1 font-medium">Reintentar</button>
                    </div>
                </div>
            )}

            {/* Feedback de acciones */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <XCircle className="h-4 w-4 shrink-0" />{error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />{success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                            <div>
                                <p className="text-2xl font-bold">{todosUsuarios.length}</p>
                                <p className="text-xs text-gray-500">Total usuarios</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg"><UserCheck className="h-5 w-5 text-green-600" /></div>
                            <div>
                                <p className="text-2xl font-bold">{todosUsuarios.filter(u => u.estado === "ACTIVO").length}</p>
                                <p className="text-xs text-gray-500">Activos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                            <div>
                                <p className="text-2xl font-bold">{pendientes.length}</p>
                                <p className="text-xs text-gray-500">Pendientes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg"><UserX className="h-5 w-5 text-red-600" /></div>
                            <div>
                                <p className="text-2xl font-bold">{todosUsuarios.filter(u => u.estado === "INACTIVO").length}</p>
                                <p className="text-xs text-gray-500">Inactivos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-0">
                <button
                    onClick={() => setTabActiva("todos")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        tabActiva === "todos"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Todos los Usuarios
                        <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{todosUsuarios.length}</span>
                    </span>
                </button>
                <button
                    onClick={() => setTabActiva("pendientes")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        tabActiva === "pendientes"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pendientes de Aprobación
                        {pendientes.length > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">{pendientes.length}</span>
                        )}
                    </span>
                </button>
            </div>

            {/* Tab: Todos los Usuarios */}
            {tabActiva === "todos" && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Todos los Usuarios del Sistema
                            </CardTitle>
                            <span className="text-sm text-gray-500">{usuariosFiltrados.length} de {todosUsuarios.length} usuarios</span>
                        </div>
                        {/* Filtros */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, DNI o email..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={filtroRol}
                                    onChange={e => setFiltroRol(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TODOS">Todos los roles</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="PRESIDENCIA_CODAR">Presidente CODAR</option>
                                    <option value="UNIDAD_TECNICA_CODAR">Unidad Técnica</option>
                                    <option value="ARBITRO">Árbitro</option>
                                    <option value="ASESOR">Asesor</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={filtroEstado}
                                    onChange={e => setFiltroEstado(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="PENDING">Pendiente</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingTodos ? (
                            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Cargando usuarios...</span>
                            </div>
                        ) : usuariosFiltrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Users className="h-12 w-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">
                                    {todosUsuarios.length === 0
                                        ? "No se encontraron usuarios. Verifique la conexión con el servidor."
                                        : "No hay usuarios que coincidan con los filtros"}
                                </p>
                                {todosUsuarios.length === 0 && (
                                    <button onClick={refrescar} className="mt-3 text-sm text-blue-600 underline">
                                        Reintentar carga
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Unidad</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {usuariosFiltrados.map((user, idx) => (
                                            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                                                            {(user.nombre?.[0] || "?").toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                                                            <p className="text-xs text-gray-400">{user.email || "Sin email"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-gray-600">{user.dni}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        <Shield className="h-3 w-3" />
                                                        {getRolLabel(user.rol)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{estadoBadge(user.estado)}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{user.unidadOrganizacional || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        <button
                                                            onClick={() => abrirModalPermisos(user)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Shield className="h-3 w-3" />Permisos
                                                        </button>
                                                        {user.estado === "ACTIVO" ? (
                                                            <button
                                                                onClick={() => user.id && handleCambiarEstado(user.id, "INACTIVO")}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                                                            >
                                                                <XCircle className="h-3 w-3" />Desactivar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => user.id && handleCambiarEstado(user.id, "ACTIVO")}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-green-200 text-green-600 rounded hover:bg-green-50 transition-colors"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />Activar
                                                            </button>
                                                        )}
                                                        {usuario?.rol === "ADMIN" && user.id !== usuario?.id && (
                                                            <button
                                                                onClick={() => user.id && handleEliminar(user.id)}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-red-300 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                            >
                                                                <XCircle className="h-3 w-3" />Eliminar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tab: Pendientes */}
            {tabActiva === "pendientes" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            Usuarios Pendientes de Aprobación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingPendientes ? (
                            <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Cargando...</span>
                            </div>
                        ) : pendientes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <CheckCircle className="h-12 w-12 mb-3 text-green-300" />
                                <p className="text-sm font-medium">No hay usuarios pendientes de aprobación</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendientes.map(user => (
                                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-yellow-100 bg-yellow-50/40 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm shrink-0">
                                                {(user.nombre?.[0] || "?").toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.nombre} {user.apellido}</p>
                                                <p className="text-sm text-gray-500">DNI: <span className="font-mono">{user.dni}</span></p>
                                                <p className="text-sm text-gray-500">Email: {user.email || "N/A"} · Unidad: {user.unidadOrganizacional || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <div className="relative">
                                                <select
                                                    value={rolSeleccionado}
                                                    onChange={(e) => setRolSeleccionado(e.target.value)}
                                                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="UNIDAD_TECNICA_CODAR">Unidad Técnica CODAR</option>
                                                    <option value="ARBITRO">Árbitro</option>
                                                    <option value="ASESOR">Asesor</option>
                                                    {usuario?.rol === "ADMIN" && (
                                                        <>
                                                            <option value="PRESIDENCIA_CODAR">Presidente CODAR</option>
                                                            <option value="ADMIN">Administrador</option>
                                                        </>
                                                    )}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <Button size="sm" onClick={() => user.id && handleAprobar(user.id, user)} className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="h-4 w-4 mr-1" />Aprobar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => user.id && handleCambiarEstado(user.id, "INACTIVO")} className="text-red-600 border-red-200 hover:bg-red-50">
                                                <XCircle className="h-4 w-4 mr-1" />Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modal de Permisos */}
            {usuarioSeleccionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Gestionar Permisos</h2>
                                <p className="text-sm text-gray-500">{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</p>
                            </div>
                        </div>
                        <div className="space-y-2 mb-5 max-h-64 overflow-y-auto pr-1">
                            {PERMISOS_DISPONIBLES.map(permiso => (
                                <label key={permiso.valor} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permisosSeleccionados.includes(permiso.valor)}
                                        onChange={() => togglePermiso(permiso.valor)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span className="text-sm">{permiso.etiqueta}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-2 justify-end pt-3 border-t">
                            <Button variant="outline" onClick={() => setUsuarioSeleccionado(null)}>Cancelar</Button>
                            <Button onClick={handleAsignarPermisos}>Guardar Permisos</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
