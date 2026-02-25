"use client"

import { useState, useEffect } from "react"
import { getStoredUser, getUsuariosPendientes, getTodosUsuarios, aprobarUsuario, asignarPermisos, cambiarEstadoUsuario, logout, eliminarUsuario, Usuario } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Rol = "ADMIN" | "PRESIDENTE_SIDAF" | "USUARIO_TECNICO"
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
    const [pendientes, setPendientes] = useState<Usuario[]>([])
    const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [tabActiva, setTabActiva] = useState<"pendientes" | "todos">("pendientes")
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([])
    const [rolSeleccionado, setRolSeleccionado] = useState<string>("USUARIO_TECNICO")
    const [usuarioParaAprobar, setUsuarioParaAprobar] = useState<Usuario | null>(null)

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        
        // Verificar que tenga permisos
        if (user.rol !== "ADMIN" && user.rol !== "PRESIDENTE_SIDAF") {
            setError("No tienes permisos para acceder a esta página")
            setLoading(false)
            return
        }
        
        cargarDatos()
    }, [router])

    const cargarDatos = async () => {
        try {
            const [pend, todos] = await Promise.all([
                getUsuariosPendientes(),
                getTodosUsuarios()
            ])
            setPendientes(pend)
            setTodosUsuarios(todos)
        } catch (err: any) {
            setError("Error al cargar datos: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAprobar = async (id: number) => {
        try {
            await aprobarUsuario(id)
            setSuccess("Usuario aprobado exitosamente")
            setError("")
            cargarDatos()
        } catch (err: any) {
            setError("Error al aprobar: " + err.message)
        }
    }

    const handleCambiarEstado = async (id: number, estado: string) => {
        try {
            await cambiarEstadoUsuario(id, estado)
            setSuccess("Estado actualizado")
            setError("")
            cargarDatos()
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
            cargarDatos()
        } catch (err: any) {
            setError("Error al eliminar: " + err.message)
        }
    }

    const handleAsignarPermisos = async () => {
        if (!usuarioSeleccionado) return
        
        try {
            const permisosJSON = JSON.stringify(permisosSeleccionados)
            await asignarPermisos(usuarioSeleccionado.id!, permisosJSON)
            setSuccess("Permisos actualizados")
            setError("")
            setUsuarioSeleccionado(null)
            cargarDatos()
        } catch (err: any) {
            setError("Error: " + err.message)
        }
    }

    const abrirModalPermisos = (user: Usuario) => {
        setUsuarioSeleccionado(user)
        // Parsear permisos existentes
        try {
            const permisos = JSON.parse(user.permisosEspecificos || "[]")
            setPermisosSeleccionados(permisos)
        } catch {
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

    const getBadgeColor = (estado: string) => {
        switch (estado) {
            case "ACTIVO": return "bg-green-500"
            case "PENDING": return "bg-yellow-500"
            case "INACTIVO": return "bg-red-500"
            default: return "bg-gray-500"
        }
    }

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case "ADMIN": return "Administrador"
            case "PRESIDENTE_SIDAF": return "Presidente"
            case "USUARIO_TECNICO": return "Usuario Técnico"
            default: return rol
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
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
                        <p className="text-gray-600">
                            Bienvenido, {usuario?.nombre} ({getRolLabel(usuario?.rol || "")})
                        </p>
                        <p className="text-sm text-gray-500">
                            Unidad: {usuario?.unidadOrganizacional}
                        </p>
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
                            {pendientes.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay usuarios pendientes</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendientes.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-semibold">{user.nombre} {user.apellido}</p>
                                                <p className="text-sm text-gray-600">DNI: {user.dni}</p>
                                                <p className="text-sm text-gray-600">Email: {user.email}</p>
                                                <p className="text-sm text-gray-600">Unidad: {user.unidadOrganizacional}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleAprobar(user.id!)}>
                                                    Aprobar
                                                </Button>
                                                <Button variant="outline" onClick={() => handleCambiarEstado(user.id!, "INACTIVO")}>
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
                                        {todosUsuarios.map(user => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2">{user.nombre} {user.apellido}</td>
                                                <td className="p-2">{user.dni}</td>
                                                <td className="p-2">{getRolLabel(user.rol)}</td>
                                                <td className="p-2">
                                                    <Badge className={getBadgeColor(user.estado)}>
                                                        {user.estado}
                                                    </Badge>
                                                </td>
                                                <td className="p-2">{user.unidadOrganizacional}</td>
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
                                                                onClick={() => handleCambiarEstado(user.id!, "INACTIVO")}
                                                            >
                                                                Desactivar
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleCambiarEstado(user.id!, "ACTIVO")}
                                                            >
                                                                Activar
                                                            </Button>
                                                        )}
                                                        {usuario?.rol === "ADMIN" && user.id !== usuario.id && (
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => handleEliminar(user.id!)}
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Modal de Permisos */}
                {usuarioSeleccionado && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Permisos de {usuarioSeleccionado.nombre}
                            </h2>
                            <div className="space-y-2 mb-4">
                                {PERMISOS_DISPONIBLES.map(permiso => (
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
