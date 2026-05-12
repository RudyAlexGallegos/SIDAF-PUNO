"use client"

import { useState, useEffect } from "react"
import { getStoredUser, getSolicitudesPendientes, responderSolicitud, SolicitudPermiso } from "@/services/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileText,
  AlertCircle,
} from "lucide-react"
import { CardSkeleton } from "@/components/Skeletons"

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

        // ADMIN y PRESIDENCIA_CODAR pueden acceder
        const rol = user.rol
        if (rol !== "ADMIN" && rol !== "PRESIDENCIA_CODAR") {
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

    const puedeAprobar = usuario?.rol === "ADMIN" || usuario?.rol === "PRESIDENCIA_CODAR"

    const handleResponder = async (id: number, accion: string) => {
        setProcesando(id)
        setError("")
        setSuccess("")

        try {
            await responderSolicitud(id, accion, usuario?.id)
            if (accion === "APROBADO") {
                setSuccess(`✅ Permiso concedido`)
            } else {
                setSuccess(`✅ Solicitud rechazada`)
            }
            setTimeout(() => cargarSolicitudes(), 1000)
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

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case "APROBADO": return <CheckCircle className="w-5 h-5 text-emerald-500" />
            case "RECHAZADO": return <XCircle className="w-5 h-5 text-red-500" />
            default: return <Clock className="w-5 h-5 text-amber-500" />
        }
    }

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case "APROBADO":
                return { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Aprobado" }
            case "RECHAZADO":
                return { color: "bg-red-100 text-red-700 border-red-200", label: "Rechazado" }
            default:
                return { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pendiente" }
        }
    }

    const estadoAprobado = solicitudes.filter(s => s.estado === "APROBADO").length
    const estadoRechazado = solicitudes.filter(s => s.estado === "RECHAZADO").length
    const estadoPendiente = solicitudes.filter(s => s.estado === "PENDIENTE").length

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <div className="container mx-auto w-full max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-sky-900 mb-2">Gestionar Solicitudes</h1>
                    <p className="text-sky-600">Revisa y aprueba solicitudes de permisos pendientes</p>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-900">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-emerald-900">{success}</p>
                        </div>
                    </div>
                )}

                {/* Estadísticas */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white border border-sky-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                <p className="text-sm font-medium text-sky-600">Pendientes</p>
                            </div>
                            <p className="text-2xl font-bold text-sky-900">{estadoPendiente}</p>
                        </div>
                        <div className="bg-white border border-sky-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <p className="text-sm font-medium text-sky-600">Aprobadas</p>
                            </div>
                            <p className="text-2xl font-bold text-sky-900">{estadoAprobado}</p>
                        </div>
                        <div className="bg-white border border-sky-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm font-medium text-sky-600">Rechazadas</p>
                            </div>
                            <p className="text-2xl font-bold text-sky-900">{estadoRechazado}</p>
                        </div>
                    </div>
                )}

                {/* Información del usuario */}
                <Card className="mb-8 bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                    <CardContent className="pt-6 pb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-sky-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sky-900 mb-1">Tu rol: {usuario?.rol}</h3>
                                <p className="text-sm text-sky-600">
                                    {usuario?.rol === "ADMIN"
                                        ? "Como administrador, puedes aprobar o rechazar solicitudes de permisos."
                                        : "Como Presidencia CODAR, tienes autoridad para gestionar solicitudes de permisos."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de solicitudes */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : solicitudes.length === 0 ? (
                    <Card className="bg-white border-sky-200 shadow-sm">
                        <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                        <CardContent className="pt-12 pb-12">
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-sky-200 mx-auto mb-4" />
                                <p className="text-sky-900 font-medium mb-1">No hay solicitudes</p>
                                <p className="text-sky-600 text-sm">Todas las solicitudes de permisos han sido procesadas</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {solicitudes.map(sol => {
                            const badge = getEstadoBadge(sol.estado || "PENDIENTE")
                            const permitiendo = sol.estado === "PENDIENTE" && puedeAprobar

                            return (
                                <Card key={sol.id} className="bg-white border-sky-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                                    <CardContent className="pt-6 pb-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-sky-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sky-900">{getPermisoLabel(sol.permiso || "")}</h4>
                                                        <p className="text-sm text-sky-600 mt-1">
                                                            Solicitado por: <span className="font-medium">{sol.usuarioId || "Usuario"}</span>
                                                        </p>
                                                        <p className="text-xs text-sky-500 mt-1">
                                                            {sol.fechaSolicitud ? new Date(sol.fechaSolicitud).toLocaleString("es-ES") : "Sin fecha"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getEstadoIcon(sol.estado || "PENDIENTE")}
                                                    <Badge className={`${badge.color} border`}>
                                                        {badge.label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {permitiendo && (
                                                <div className="flex gap-2 flex-wrap sm:flex-nowrap sm:flex-col sm:w-max">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-200 text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                                                        onClick={() => handleResponder(sol.id!, "RECHAZAR")}
                                                        disabled={procesando === sol.id}
                                                    >
                                                        {procesando === sol.id ? (
                                                            <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4 mr-1.5" />
                                                                Rechazar
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                                                        onClick={() => handleResponder(sol.id!, "APROBADO")}
                                                        disabled={procesando === sol.id}
                                                    >
                                                        {procesando === sol.id ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                                                Aprobar
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
