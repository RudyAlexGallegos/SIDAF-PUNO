"use client"

import { useState, useEffect } from "react"
import { getStoredUser, getUsuariosPendientes, getTodosUsuarios, aprobarUsuario, asignarPermisos, cambiarEstadoUsuario, logout, eliminarUsuario, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useCache } from "@/hooks/useCache"
import { TableSkeleton } from "@/components/Skeletons"

type Rol = "ADMIN" | "PRESIDENCIA_CODAR" | "UNIDAD_TECNICA_CODAR"
type Estado = "PENDING" | "ACTIVO" | "INACTIVO"

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

    // Fetcher functions for useCache hook
    const fetchPendientes = async () => {
        const data = await getUsuariosPendientes().catch(() => [])
        return data || []
    }

    const fetchTodos = async () => {
        const data = await getTodosUsuarios().catch(() => [])
        return data || []
    }

    // Use cache hooks for data fetching with 5-minute TTL
    const { data: pendientes = [], isLoading: loadingPendientes, refetch: refetchPendientes } = useCache(
        "usuariosPendientes",
        fetchPendientes,
        { ttl: 5 * 60 * 1000 }
    )

    const { data: todosUsuarios = [], isLoading: loadingTodos, refetch: refetchTodos } = useCache(
        "todosUsuarios",
        fetchTodos,
        { ttl: 5 * 60 * 1000 }
    )

    const isLoading = loadingPendientes || loadingTodos

    useEffect(() => {
        try {
            const user = getStoredUser()
            if (!user) {
                router.push("/login")
                return
            }
            setUsuario(user)
            
            // Verificar que tenga permisos
            if (user.rol !== "ADMIN" && user.rol !== "PRESIDENCIA_CODAR") {
                setError("No tienes permisos para acceder a esta página")
                return
            }
            
            // Cache hook loads automatically
        } catch (err: any) {
            console.error("Error en useEffect:", err)
            setError("Error al cargar la página")
        }
    }, [router])

    const handleAprobar = async (id: number) => {
        if (!rolSeleccionado) {
            setError("Por favor selecciona un rol")
            return
        }
        try {
            await aprobarUsuario(id, rolSeleccionado, "[]")
            setSuccess("Usuario aprobado exitosamente")
            setError("")
            setUsuarioParaAprobar(null)
            setRolSeleccionado("UNIDAD_TECNICA_CODAR")
            refetchPendientes()
            refetchTodos()
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
            refetchPendientes()
            refetchTodos()
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
            refetchPendientes()
            refetchTodos()
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
            refetchPendientes()
            refetchTodos()
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

    const getRolLabel = (rol: string | undefined) => {
        if (!rol) return "Sin rol"
        switch (rol) {
            case "ADMIN": return "Administrador"
            case "PRESIDENCIA_CODAR": return "Presidente CODAR"
            case "UNIDAD_TECNICA_CODAR": return "Unidad Técnica CODAR"
            default: return rol
        }
    }

    const getBadgeColor = (estado: string | undefined) => {
        switch (estado) {
            case "ACTIVO": return "bg-green-500"
            case "PENDING": return "bg-yellow-500"
            case "INACTIVO": return "bg-red-500"
            default: return "bg-gray-500"
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    if (isLoading && pendientes.length === 0 && todosUsuarios.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
                    <div className="space-y-4">
                        <TableSkeleton rows={8} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        {usuario && (
                            <>
                                <p className="text-gray-600">
                                    Bienvenido, {usuario.nombre} ({getRolLabel(usuario.rol || "")})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Unidad: {usuario.unidadOrganizacional || "N/A"}
                                </p>
                            </>
                        )}
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </div>

                {/* Error / Success */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={tabActiva === "pendientes" ? "default" : "outline"}
                        onClick={() => setTabActiva("pendientes")}
                    >
                        Pendientes ({pendientes.length})
                    </Button>
                    <Button
                        variant={tabActiva === "todos" ? "default" : "outline"}
                        onClick={() => setTabActiva("todos")}
                    >
                        Todos los Usuarios ({todosUsuarios.length})
                    </Button>
                </div>

                {/* Tab: Pendientes */}
                {tabActiva === "pendientes" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuarios Pendientes de Aprobación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!pendientes || pendientes.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay usuarios pendientes</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendientes.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-semibold">{user.nombre} {user.apellido}</p>
                                                <p className="text-sm text-gray-600">DNI: {user.dni}</p>
                                                <p className="text-sm text-gray-600">Email: {user.email || "N/A"}</p>
                                                <p className="text-sm text-gray-600">Unidad: {user.unidadOrganizacional || "N/A"}</p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    value={rolSeleccionado}
                                                    onChange={(e) => setRolSeleccionado(e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="UNIDAD_TECNICA_CODAR">Unidad Técnica CODAR</option>
                                                    {usuario?.rol === "ADMIN" && (
                                                        <>
                                                            <option value="PRESIDENCIA_CODAR">Presidente CODAR</option>
                                                            <option value="ADMIN">Administrador</option>
                                                        </>
                                                    )}
                                                </select>
                                                <Button onClick={() => user.id && handleAprobar(user.id)}>
                                                    Aprobar
                                                </Button>
                                                <Button variant="outline" onClick={() => user.id && handleCambiarEstado(user.id, "INACTIVO")}>
                                                    Rechazar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Todos */}
                {tabActiva === "todos" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Todos los Usuarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Nombre</th>
                                            <th className="text-left p-2">DNI</th>
                                            <th className="text-left p-2">Rol</th>
                                            <th className="text-left p-2">Estado</th>
                                            <th className="text-left p-2">Unidad</th>
                                            <th className="text-left p-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todosUsuarios && todosUsuarios.length > 0 ? (
                                            todosUsuarios.map(user => (
                                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-2">{user.nombre} {user.apellido}</td>
                                                    <td className="p-2">{user.dni}</td>
                                                    <td className="p-2">{getRolLabel(user.rol)}</td>
                                                    <td className="p-2">
                                                        <Badge className={getBadgeColor(user.estado)}>
                                                            {user.estado || "DESCONOCIDO"}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2">{user.unidadOrganizacional || "N/A"}</td>
                                                    <td className="p-2">
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => abrirModalPermisos(user)}
                                                            >
                                                                Permisos
                                                            </Button>
                                                            {user.estado === "ACTIVO" ? (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => user.id && handleCambiarEstado(user.id, "INACTIVO")}
                                                                >
                                                                    Desactivar
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => user.id && handleCambiarEstado(user.id, "ACTIVO")}
                                                                >
                                                                    Activar
                                                                </Button>
                                                            )}
                                                            {usuario?.rol === "ADMIN" && user.id !== usuario?.id && (
                                                                <Button 
                                                                    variant="destructive" 
                                                                    size="sm"
                                                                    onClick={() => user.id && handleEliminar(user.id)}
                                                                >
                                                                    Eliminar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                                    No hay usuarios registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Modal de Permisos */}
                {usuarioSeleccionado && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Permisos de {usuarioSeleccionado.nombre || "Usuario"}
                            </h2>
                            <div className="space-y-2 mb-4">
                                {PERMISOS_DISPONIBLES && PERMISOS_DISPONIBLES.map(permiso => (
                                    <label key={permiso.valor} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={permisosSeleccionados.includes(permiso.valor)}
                                            onChange={() => togglePermiso(permiso.valor)}
                                            className="w-4 h-4"
                                        />
                                        {permiso.etiqueta}
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setUsuarioSeleccionado(null)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleAsignarPermisos}>
                                    Guardar Permisos
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
