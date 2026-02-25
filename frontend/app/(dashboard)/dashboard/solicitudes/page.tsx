"use client"

import { useState, useEffect } from "react"
import { getStoredUser, getSolicitudesPendientes, responderSolicitud, SolicitudPermiso } from "@/services/api"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SolicitudesPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState<any>(null)
    const [solicitudes, setSolicitudes] = useState<SolicitudPermiso[]>([])
    const [loading, setLoading] = useState(true)
    const [procesando, setProcesando] = useState<number | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        const user = getStoredUser()
        if (!user) {
            router.push("/login")
            return
        }

        // ADMIN y PRESIDENTE_SIDAF pueden acceder
        const rol = user.rol
        if (rol !== "ADMIN" && rol !== "PRESIDENTE_SIDAF") {
            router.push("/dashboard")
            return
        }

        setUsuario(user)
        cargarSolicitudes()
    }, [router])

    const cargarSolicitudes = async () => {
        try {
            const sols = await getSolicitudesPendientes()
            setSolicitudes(sols)
        } catch (err: any) {
            setError(err.message || "Error al cargar solicitudes")
        } finally {
            setLoading(false)
        }
    }

    // ADMIN y PRESIDENTE_SIDAF pueden aprobar permisos
    const puedeAprobar = usuario?.rol === "ADMIN" || usuario?.rol === "PRESIDENTE_SIDAF"

    const handleResponder = async (id: number, accion: string) => {
        setProcesando(id)
        setError("")
        setSuccess("")

        try {
            await responderSolicitud(id, accion)
            if (accion === "APROBAR") {
                setSuccess(`Permiso concedido al usuario`)
            } else {
                setSuccess(`Solicitud rechazada`)
            }
            cargarSolicitudes()
        } catch (err: any) {
            setError(err.message || "Error al procesar solicitud")
        } finally {
            setProcesando(null)
        }
    }

    const getPermisoLabel = (valor: string) => {
        const labels: Record<string, string> = {
            "VER_ARBITROS": "Ver Árbitros",
            "GESTION_ARBITROS": "Gestionar Árbitros",
            "GESTION_ASISTENCIA": "Gestionar Asistencia",
            "GESTION_DESIGNACIONES": "Gestionar Designaciones",
            "GESTION_CAMPEONATOS": "Gestionar Campeonatos",
            "GESTION_EQUIPOS": "Gestionar Equipos",
            "VER_REPORTES": "Ver Reportes",
        }
        return labels[valor] || valor
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
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Gestionar Solicitudes de Permisos</h1>

            {/* Información del rol */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <p className="text-sm">
                        <strong>Tu rol:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{usuario?.rol}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        {usuario?.rol === "ADMIN" 
                            ? "Puedes aprobar o rechazar solicitudes de permisos. Por ética, considera que la Présidencia debería ser quien otorgue los permisos."
                            : "Puedes aprobar o rechazar solicitudes de permisos de usuarios."}
                    </p>
                </CardContent>
            </Card>

            {/* Mensajes */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
            )}
            {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>
            )}

            {/* Lista de solicitudes */}
            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes ({solicitudes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {solicitudes.length === 0 ? (
                        <p className="text-gray-500">No hay solicitudes pendientes.</p>
                    ) : (
                        <div className="space-y-4">
                            {solicitudes.map(sol => (
                                <div key={sol.id} className="border rounded p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-lg">
                                                {getPermisoLabel(sol.permisoSolicitado || "")}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Solicitado por: <strong>{sol.usuarioNombre}</strong>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Fecha: {sol.fechaSolicitud ? new Date(sol.fechaSolicitud).toLocaleString() : ""}
                                            </p>
                                            <Badge className={`mt-2 ${getBadgeColor(sol.estado || "")}`}>
                                                {getEstadoLabel(sol.estado || "")}
                                            </Badge>
                                        </div>

                                        {sol.estado === "PENDIENTE" && puedeAprobar && (
                                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleResponder(sol.id!, "RECHAZAR")}
                                                    disabled={procesando === sol.id}
                                                >
                                                    {procesando === sol.id ? "..." : "Rechazar"}
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleResponder(sol.id!, "APROBAR")}
                                                    disabled={procesando === sol.id}
                                                >
                                                    {procesando === sol.id ? "..." : "Aprobar"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
