"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getStoredUser } from "@/services/api"
import { solicitarPermiso, getMisSolicitudes, SolicitudPermiso } from "@/services/api-permisos"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  Lock,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
} from "lucide-react"
import { CardSkeleton } from "@/components/Skeletons"

const PERMISOS_DISPONIBLES = [
  { valor: "VER_ARBITROS", etiqueta: "Ver Árbitros", descripcion: "Acceso a la lista de árbitros" },
  { valor: "GESTION_ARBITROS", etiqueta: "Gestionar Árbitros", descripcion: "Crear, editar y eliminar árbitros" },
  { valor: "GESTION_ASISTENCIA", etiqueta: "Gestionar Asistencia", descripcion: "Control y seguimiento de asistencia" },
  { valor: "GESTION_DESIGNACIONES", etiqueta: "Gestionar Designaciones", descripcion: "Asignar árbitros a partidos" },
  { valor: "GESTION_CAMPEONATOS", etiqueta: "Gestionar Campeonatos", descripcion: "Crear y modificar campeonatos" },
  { valor: "GESTION_EQUIPOS", etiqueta: "Gestionar Equipos", descripcion: "Administrar equipos y jugadores" },
  { valor: "VER_REPORTES", etiqueta: "Ver Reportes", descripcion: "Acceso a reportes del sistema" },
]

export default function SolicitarPermisoPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudPermiso[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(false)
    }
  }

  const handleSolicitar = async () => {
    if (!permisoSeleccionado) {
      setMensaje("Selecciona un permiso para solicitar")
      return
    }

    setEnviando(true)
    setMensaje("")

    try {
      await solicitarPermiso({
        permiso: permisoSeleccionado,
        razonSolicitud: `Solicitud de acceso a ${PERMISOS_DISPONIBLES.find(p => p.valor === permisoSeleccionado)?.etiqueta || 'permiso'}`
      })
      setMensaje("success:Solicitud enviada exitosamente. La Presidencia o Administrador revisarán tu solicitud.")
      setPermisoSeleccionado("")
      cargarSolicitudes()
    } catch (err: any) {
      setMensaje(`error:${err.message || "Error al solicitar"}`)
    } finally {
      setEnviando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return { icon: CheckCircle, color: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-700" }
      case "RECHAZADO":
        return { icon: XCircle, color: "bg-red-50 border-red-200", textColor: "text-red-700" }
      default:
        return { icon: Clock, color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" }
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado"
      case "RECHAZADO":
        return "Rechazado"
      default:
        return "Pendiente"
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
        <div className="container mx-auto w-full max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-sky-900 mb-8">Solicitar Permisos</h1>
          <CardSkeleton count={6} />
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
                <h1 className="text-3xl font-bold text-sky-900">Solicitar Permisos</h1>
                <p className="text-sky-600 mt-1">Gestiona tus permisos y solicitudes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de dos columnas */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Columna izquierda: Mi Cuenta */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-sky-200 sticky top-8">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sky-900">Mi Cuenta</p>
                    <p className="text-xs text-sky-600">Información del usuario</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-sky-100">
                  <div>
                    <p className="text-xs font-medium text-sky-600 uppercase">Nombre</p>
                    <p className="text-sm font-semibold text-sky-900">{usuario?.nombre} {usuario?.apellido}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-sky-600 uppercase">Rol</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-sky-600" />
                      <p className="text-sm font-semibold text-sky-900">{usuario?.rol}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-sky-600 uppercase">Permisos Actuales</p>
                    <p className="text-xs text-sky-700 mt-1 leading-relaxed">
                      {usuario?.permisosEspecificos || "Sin permisos específicos"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Formulario y Solicitudes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Formulario de solicitud */}
            <Card className="bg-white border-sky-200">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sky-900">Nueva Solicitud</h2>
                    <p className="text-xs text-sky-600">Solicita acceso a nuevos permisos</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-sky-700 bg-sky-50 p-3 rounded-lg">
                    Selecciona el permiso que deseas solicitar. Tu solicitud será revisada por la Presidencia o Administrador.
                  </p>

                  {/* Selector de permisos como grid de opciones */}
                  <div>
                    <label className="block text-sm font-semibold text-sky-900 mb-3">Selecciona un permiso:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PERMISOS_DISPONIBLES.map(p => (
                        <button
                          key={p.valor}
                          onClick={() => setPermisoSeleccionado(p.valor)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            permisoSeleccionado === p.valor
                              ? "border-sky-500 bg-sky-50"
                              : "border-sky-200 bg-white hover:border-sky-300"
                          }`}
                        >
                          <p className="font-medium text-sky-900 text-sm">{p.etiqueta}</p>
                          <p className="text-xs text-sky-600 mt-1">{p.descripcion}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botón de envío */}
                  <Button
                    onClick={handleSolicitar}
                    disabled={enviando || !permisoSeleccionado}
                    className="w-full bg-sky-600 hover:bg-sky-700 h-11"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {enviando ? "Enviando..." : "Enviar Solicitud"}
                  </Button>

                  {/* Mensaje de estado */}
                  {mensaje && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      mensaje.startsWith("success:")
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "bg-red-50 border-red-500 text-red-700"
                    }`}>
                      <p className="text-sm font-medium">
                        {mensaje.replace(/^(success|error):/, "")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mis solicitudes */}
            <Card className="bg-white border-sky-200">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sky-900">Mis Solicitudes</h2>
                    <p className="text-xs text-sky-600">Historial de solicitudes</p>
                  </div>
                </div>

                {solicitudes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="h-12 w-12 text-sky-200 mb-3" />
                    <p className="text-sky-900 font-medium mb-1">No tienes solicitudes previas</p>
                    <p className="text-sky-600 text-sm">Solicita un permiso para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {solicitudes.map(sol => {
                      const estadoBadge = getEstadoBadge(sol.estado || "")
                      const EstadoIcon = estadoBadge.icon
                      const permisoInfo = PERMISOS_DISPONIBLES.find(p => p.valor === sol.permisoSolicitado)

                      return (
                        <div
                          key={sol.id}
                          className={`p-4 rounded-lg border-2 transition-all ${estadoBadge.color}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className={`font-semibold ${estadoBadge.textColor}`}>
                                {permisoInfo?.etiqueta || sol.permisoSolicitado}
                              </p>
                              <p className={`text-xs mt-1 ${estadoBadge.textColor}`}>
                                {sol.fechaSolicitud
                                  ? new Date(sol.fechaSolicitud).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Sin fecha"}
                              </p>
                              {sol.notas && (
                                <p className={`text-xs mt-2 ${estadoBadge.textColor}`}>
                                  <span className="font-medium">Nota:</span> {sol.notas}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <EstadoIcon className={`h-5 w-5 ${estadoBadge.textColor}`} />
                              <Badge className={`${estadoBadge.color} border ${
                                sol.estado === "APROBADO" ? "border-emerald-300" :
                                sol.estado === "RECHAZADO" ? "border-red-300" :
                                "border-amber-300"
                              } font-semibold`}>
                                {getEstadoLabel(sol.estado || "")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
