"use client"

import { useState, useEffect } from "react"
import { getStoredUser, solicitarPermiso, getMisSolicitudes, SolicitudPermiso } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PERMISOS_DISPONIBLES = [
    { valor: "VER_ARBITROS", etiqueta: "Ver Árbitros" },
    { valor: "GESTION_ARBITROS", etiqueta: "Gestionar Árbitros" },
    { valor: "GESTION_ASISTENCIA", etiqueta: "Gestionar Asistencia" },
    { valor: "GESTION_DESIGNACIONES", etiqueta: "Gestionar Designaciones" },
    { valor: "GESTION_CAMPEONATOS", etiqueta: "Gestionar Campeonatos" },
    { valor: "GESTION_EQUIPOS", etiqueta: "Gestionar Equipos" },
    { valor: "VER_REPORTES", etiqueta: "Ver Reportes" },
]

export default function SolicitarPermisoPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<any>(null)
    const [solicitudes, setSolicitudes] = useState<SolicitudPermiso[]>([])
    const [loading, setLoading] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [mensaje, setMensaje] = useState("")
    const [permisoSeleccionado, setPermisoSeleccionado] = useState("")

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }
        setUsuario(user)
        cargarSolicitudes()
    }, [router])

    const cargarSolicitudes = async () => {
        try {
            const sols = await getMisSolicitudes()
            setSolicitudes(sols)
        } catch (err: any) {
            console.error("Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSolicitar = async () => {
        if (!permisoSeleccionado) {
            setMensaje("Selecciona un permiso")
            return
        }

        setEnviando(true)
        setMensaje("")

        try {
            await solicitarPermiso(permisoSeleccionado)
            setMensaje("Solicitud enviada. La Présidencia o el Administrador revisarán tu solicitud.")
            setPermisoSeleccionado("")
            cargarSolicitudes()
        } catch (err: any) {
            setMensaje(err.message || "Error al solicitar")
        } finally {
            setEnviando(false)
        }
    }

    const getBadgeColor = (estado: string) => {
        switch (estado) {
            case "APROBADO": return "bg-green-500"
            case "RECHAZADO": return "bg-red-500"
            default: return "bg-yellow-500"
        }
    }

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case "APROBADO": return "Aprobado"
            case "RECHAZADO": return "Rechazado"
            default: return "Pendiente"
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 container mx-auto p-4 md:p-6 max-w-4xl">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Solicitar Permisos</h1>

            {/* Información del usuario */}
            <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 shadow-lg shadow-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white">Mi Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-300"><strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}</p>
                    <p className="text-slate-300"><strong>Rol:</strong> {usuario?.rol}</p>
                    <p className="text-slate-300"><strong>Mis permisos actuales:</strong> {usuario?.permisosEspecificos || "Sin permisos específicos"}</p>
                </CardContent>
            </Card>

            {/* Formulario de solicitud */}
            <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 shadow-lg shadow-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white">Nueva Solicitud</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400 mb-4">
                        Selecciona el permiso que deseas solicitar. Tu solicitud será revisada por la Présidencia o el Administrador, quienes podrán aprobarla o rechazarla.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white">Permiso solicitado:</label>
                            <select
                                value={permisoSeleccionado}
                                onChange={(e) => setPermisoSeleccionado(e.target.value)}
                                className="w-full p-2 border rounded-md bg-slate-700/50 border-slate-600/50 text-white"
                            >
                                <option value="" className="bg-slate-900 text-white">-- Seleccionar --</option>
                                {PERMISOS_DISPONIBLES.map(p => (
                                    <option key={p.valor} value={p.valor} className="bg-slate-900 text-white">
                                        {p.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button 
                            onClick={handleSolicitar} 
                            disabled={enviando || !permisoSeleccionado}
                            className="w-full"
                        >
                            {enviando ? "Enviando..." : "Enviar Solicitud"}
                        </Button>

                        {mensaje && (
                            <div className={`p-3 rounded ${mensaje.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {mensaje}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Mis solicitudes */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Solicitudes</CardTitle>
                </CardHeader>
                <CardContent>
                    {solicitudes.length === 0 ? (
                        <p className="text-gray-500">No tienes solicitudes previas.</p>
                    ) : (
                        <div className="space-y-3">
                            {solicitudes.map(sol => (
                                <div key={sol.id} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                        <p className="font-medium">
                                            {PERMISOS_DISPONIBLES.find(p => p.valor === sol.permisoSolicitado)?.etiqueta || sol.permisoSolicitado}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {sol.fechaSolicitud ? new Date(sol.fechaSolicitud).toLocaleDateString() : ""}
                                        </p>
                                        {sol.notas && <p className="text-sm text-gray-600">Nota: {sol.notas}</p>}
                                    </div>
                                    <Badge className={getBadgeColor(sol.estado || "")}>
                                        {getEstadoLabel(sol.estado || "")}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
