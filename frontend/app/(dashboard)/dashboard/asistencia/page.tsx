"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useArbitros } from "@/hooks/asistencia/useArbitros"
import { useRegistroAsistencia, type DuplicadoInfo } from "@/hooks/asistencia/useRegistroAsistencia"
import ListaArbitros from "@/components/asistencia/ListaArbitros"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, BarChart3, Calendar, AlertCircle, Clock, ArrowLeft, RefreshCw, FileText, UserCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getStoredUser } from "@/services/api"
import Link from "next/link"

const DIAS_OBLIGATORIOS = [1, 2, 4, 5, 6]

const ACTIVIDADES: Array<{
    value: "analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria"
    label: string
    dias: string
    diasNumeros: number[]
}> = [
    { value: "analisis_partido", label: "Análisis de partido", dias: "Lunes", diasNumeros: [1] },
    { value: "preparacion_fisica", label: "Preparación física", dias: "Martes, Jueves, Sábado", diasNumeros: [2, 4, 6] },
    { value: "reunion_ordinaria", label: "Reunión ordinaria", dias: "Viernes", diasNumeros: [5] },
    { value: "reunion_extraordinaria", label: "Reunión extraordinaria", dias: "Miércoles, Domingo", diasNumeros: [3, 0] },
]

function esDiaObligatorio(fecha: Date): boolean {
    return DIAS_OBLIGATORIOS.includes(fecha.getDay())
}

function getActividadesPermitidas(fechaString: string): string[] {
    const fecha = parseISO(fechaString)
    const diaSemana = fecha.getDay()
    return ACTIVIDADES.filter(a => a.diasNumeros.includes(diaSemana)).map(a => a.value)
}

function getLabelActividad(value: string): string {
    switch (value) {
        case "analisis_partido": return "Análisis de partido"
        case "preparacion_fisica": return "Preparación física"
        case "reunion_ordinaria": return "Reunión ordinaria"
        case "reunion_extraordinaria": return "Reunión extraordinaria"
        default: return value.replace(/_/g, " ")
    }
}

export default function AsistenciaPage() {
    const { arbitros, loading } = useArbitros()
    const {
        registro,
        iniciarRegistro,
        actualizarRegistroInicial,
        marcarAsistencia,
        finalizarRegistro,
        cancelarRegistro,
        existeRegistroHoy,
        setExisteRegistroHoy,
        idRegistroExistente,
        setIdRegistroExistente,
        registroExistenteInfo,
        notificacion,
        setNotificacion,
        duplicadoInfo,
        setDuplicadoInfo,
        verificarDuplicado,
        inicializando,
    } = useRegistroAsistencia()

    const [search, setSearch] = React.useState("")
    const [actividad, setActividad] = React.useState<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria">("analisis_partido")
    const [responsable, setResponsable] = React.useState("")
    const [fechaSeleccionada, setFechaSeleccionada] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [subtipoExtraordinaria, setSubtipoExtraordinaria] = React.useState<string>("")
    const [descripcionExtraordinaria, setDescripcionExtraordinaria] = React.useState<string>("")
    const [mostrarDialogo, setMostrarDialogo] = React.useState(true)
    const [dialogoCargando, setDialogoCargando] = React.useState(false)
    const [fechaInicioReporte, setFechaInicioReporte] = React.useState<string>(format(new Date(Date.now() - 30 * 86400000), "yyyy-MM-dd"))
    const [fechaFinReporte, setFechaFinReporte] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [mostrarReportes, setMostrarReportes] = React.useState(false)
    const [datosReporte, setDatosReporte] = React.useState<any>(null)
    const [loadingReporte, setLoadingReporte] = React.useState(false)
    const [filtroEstadoReporte, setFiltroEstadoReporte] = React.useState<string>("todos")
    const [mostrarBoleta, setMostrarBoleta] = React.useState(false)
    const [boletaInfo, setBoletaInfo] = React.useState<{ total: number; asistentes: number; ausentes: number; tardanzas: number; justificados: number } | null>(null)

    const estadosMap = React.useMemo(() => {
        const map: Record<string, EstadoAsistencia> = {}
        if (registro?.arbitros) {
            for (const a of registro.arbitros) {
                map[String(a.arbitroId)] = a.estado
            }
        }
        return map
    }, [registro])

    const searchParams = useSearchParams()
    const router = useRouter()

    const actividadesPermitidas = React.useMemo(() => getActividadesPermitidas(fechaSeleccionada), [fechaSeleccionada])

    React.useEffect(() => {
        if (!actividadesPermitidas.includes(actividad)) {
            setActividad(actividadesPermitidas[0] as any)
        }
    }, [actividad, actividadesPermitidas])

    React.useEffect(() => {
        if (actividad !== "reunion_extraordinaria") {
            setSubtipoExtraordinaria("")
            setDescripcionExtraordinaria("")
        }
    }, [actividad])

    React.useEffect(() => {
        const usuario = getStoredUser()
        if (usuario) {
            const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim()
            if (nombreCompleto) {
                setResponsable(nombreCompleto)
            }
        }
    }, [])

    React.useEffect(() => {
        if (searchParams?.get("new") === "1") {
            cancelarRegistro()
            router.replace("/dashboard/asistencia")
        }
    }, [searchParams, cancelarRegistro, router])

    React.useEffect(() => {
        if (notificacion) {
            toast({ title: "Atención", description: notificacion, variant: "destructive" })
            setNotificacion(null)
        }
    }, [notificacion, setNotificacion])

    const verificarDuplicadoFecha = React.useCallback(async () => {
        if (!responsable || !fechaSeleccionada) return
        setDialogoCargando(true)
        try {
            const resultado = await verificarDuplicado(fechaSeleccionada, responsable, actividad)
            if (resultado.existe && resultado.id) {
                setIdRegistroExistente(resultado.id)
                setExisteRegistroHoy(true)
                setNotificacion(`Ya existe un registro de asistencia para el ${fechaSeleccionada}, creado por ${resultado.responsable || "otro usuario"}. Solo se puede editar ese registro.`)
            } else {
                setExisteRegistroHoy(false)
                setIdRegistroExistente(null)
            }
        } catch (e) {
            console.error("Error verificando duplicado:", e)
        } finally {
            setDialogoCargando(false)
        }
    }, [fechaSeleccionada, responsable, actividad, verificarDuplicado])

    const handleFechaChange = (value: string) => {
        setFechaSeleccionada(value)
        setExisteRegistroHoy(false)
        setIdRegistroExistente(null)
        cancelarRegistro()
    }

    const cargarReportes = async () => {
        if (!fechaInicioReporte || !fechaFinReporte) return
        setLoadingReporte(true)
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://sidaf-backend.onrender.com/api"
            const params = new URLSearchParams({ fechaInicio: fechaInicioReporte, fechaFin: fechaFinReporte })
            const res = await fetch(`${apiBaseUrl}/asistencias/reporte/semanal?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setDatosReporte(data)
            } else {
                toast({ title: "Error", description: "No se pudieron cargar los reportes.", variant: "destructive" })
            }
        } catch (e) {
            console.error("Error cargando reportes:", e)
            toast({ title: "Error", description: "Error al conectar con el servidor de reportes.", variant: "destructive" })
        } finally {
            setLoadingReporte(false)
        }
    }

    const handleAccionRegistro = async () => {
        if (!responsable.trim()) {
            toast({ title: "Campo requerido", description: "Debe indicar el responsable.", variant: "destructive" })
            return
        }

        if (existeRegistroHoy && idRegistroExistente) {
            await actualizarRegistroInicial(actividad, responsable, fechaSeleccionada, descripcionExtraordinaria)
            toast({ title: "Registro actualizado", description: "Se cargó el registro existente para edición." })
            return
        }

        const resultado = await verificarDuplicado(fechaSeleccionada, responsable, actividad)
        if (resultado.existe && resultado.id) {
            setIdRegistroExistente(resultado.id)
            setExisteRegistroHoy(true)
            await actualizarRegistroInicial(actividad, responsable, fechaSeleccionada, descripcionExtraordinaria)
            toast({ title: "Registro existente", description: resultado.mensaje })
            return
        }

        await iniciarRegistro(actividad, responsable, fechaSeleccionada, descripcionExtraordinaria)
        toast({ title: "Registro iniciado" })
    }

    const filtrarReportes = (datos: any, estado: string) => {
        if (!datos || !datos.asistencias) return datos
        if (estado === "todos") return datos
        return {
            ...datos,
            asistencias: datos.asistencias.filter((a: any) => a.estado === estado)
        }
    }

    const asistenciasFiltradas = datosReporte?.asistencias || []

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto"></div>
                    <p className="mt-4 text-sky-600">Cargando control de asistencia...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <div className="container mx-auto w-full max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-sky-900 mb-2">Control de Asistencia</h1>
                    <p className="text-sky-600">Comisión Departamental de Árbitros - Puno</p>
                </div>

                {/* Diálogo informativo obligatorio */}
                <Dialog open={mostrarDialogo} onOpenChange={setMostrarDialogo}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg text-sky-900">
                                Control de Asistencia - Comisión Departamental de Árbitros - Puno
                            </DialogTitle>
                            <DialogDescription className="text-sm text-sky-600">
                                Hoy es {format(new Date(), "EEEE", { locale: es })} - {esDiaObligatorio(new Date()) ? "Día obligatorio" : "Día no obligatorio"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                            <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                                <Calendar className="w-5 h-5 text-sky-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-sky-900">Días obligatorios</p>
                                    <p className="text-sm text-sky-600">Lunes, Martes, Jueves, Viernes y Sábado</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-900">Estado del día</p>
                                    <p className="text-sm text-emerald-700">
                                        {esDiaObligatorio(new Date()) ? "Puedes registrar asistencia hoy" : "Hoy no es día de actividad obligatoria"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setMostrarDialogo(false)} className="bg-sky-600 hover:bg-sky-700 text-white w-full">
                                Continuar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Notificación de duplicado */}
                {existeRegistroHoy && registroExistenteInfo && (
                    <Card className="mb-6 border-l-4 border-l-red-500 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-red-900">
                                        Ya existe un registro de asistencia para el {fechaSeleccionada}
                                    </p>
                                    <p className="text-sm text-red-700 mt-2">
                                        <span className="font-medium">Responsable:</span> {registroExistenteInfo.responsable}
                                    </p>
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Actividad:</span> {registroExistenteInfo.actividad?.replace(/_/g, " ") || "No especificada"}
                                    </p>
                                    {registroExistenteInfo.createdAt && (
                                        <p className="text-sm text-red-700">
                                            <span className="font-medium">Creado:</span>{" "}
                                            {new Date(registroExistenteInfo.createdAt).toLocaleString("es-PE", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => {
                                        setActividad((registroExistenteInfo.actividad as any) || "analisis_partido")
                                        setResponsable(registroExistenteInfo.responsable || "")
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                                >
                                    Editar Registro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Diálogo de notificación de duplicado al cambiar fecha */}
                <Dialog open={!!duplicadoInfo} onOpenChange={() => setDuplicadoInfo(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5" />
                                Registro Duplicado Detectado
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sky-800">{duplicadoInfo?.mensaje}</p>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    if (duplicadoInfo?.id) {
                                        setIdRegistroExistente(duplicadoInfo.id)
                                        setExisteRegistroHoy(true)
                                        setActividad((duplicadoInfo.actividad as any) || "analisis_partido")
                                        setResponsable(duplicadoInfo.responsable || "")
                                    }
                                    setDuplicadoInfo(null)
                                }}
                                className="bg-sky-600 hover:bg-sky-700 text-white"
                            >
                                Editar Registro Existente
                            </Button>
                            <Button variant="outline" onClick={() => setDuplicadoInfo(null)} className="border-sky-200 text-sky-600 hover:bg-sky-50">
                                Crear Nuevo Registro
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Formulario de registro */}
                <Card className="mb-6 bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                    <CardHeader>
                        <CardTitle className="text-sky-900">Nuevo Registro</CardTitle>
                        <CardDescription>Completa los datos para registrar la asistencia</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Selector de fecha */}
                        <div>
                            <Label className="text-sm font-medium text-sky-900 mb-2 block">Fecha</Label>
                            <Input
                                type="date"
                                value={fechaSeleccionada}
                                onChange={(e) => handleFechaChange(e.target.value)}
                                className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                            />
                        </div>

                        {/* Info del día seleccionado */}
                        <div className={`p-3 rounded-lg border ${esDiaObligatorio(parseISO(fechaSeleccionada)) ? "bg-emerald-50 border-emerald-200" : "bg-sky-50 border-sky-200"}`}>
                            <p className={`text-sm font-medium ${esDiaObligatorio(parseISO(fechaSeleccionada)) ? "text-emerald-900" : "text-sky-900"}`}>
                                {format(parseISO(fechaSeleccionada), "EEEE", { locale: es })} -{" "}
                                {esDiaObligatorio(parseISO(fechaSeleccionada)) ? "Día obligatorio" : "Día no obligatorio"}
                            </p>
                        </div>

                        {/* Selector de actividad */}
                        <div>
                            <Label className="text-sm font-medium text-sky-900 mb-3 block">Selecciona la actividad</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ACTIVIDADES.map((act) => (
                                    <button
                                        key={act.value}
                                        onClick={() => {
                                            if (actividadesPermitidas.includes(act.value)) {
                                                setActividad(act.value as any)
                                                verificarDuplicadoFecha()
                                            }
                                        }}
                                        disabled={!actividadesPermitidas.includes(act.value)}
                                        className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                                            actividad === act.value
                                                ? "border-sky-500 bg-sky-50"
                                                : actividadesPermitidas.includes(act.value)
                                                    ? "border-sky-200 bg-white hover:border-sky-300"
                                                    : "border-sky-100 bg-sky-50/50 opacity-50 cursor-not-allowed"
                                        }`}
                                    >
                                        <div className="font-semibold text-sky-900">{act.label}</div>
                                        <div className="text-xs text-sky-600 mt-1">{act.dias}</div>
                                        {actividad === act.value && <Check className="w-5 h-5 text-sky-500 absolute right-4 top-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subtipo reunión extraordinaria */}
                        {actividad === "reunion_extraordinaria" && (
                            <div>
                                <Label className="text-sm font-medium text-sky-900 mb-3 block">Tipo de reunión extraordinaria</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {[
                                        "Reunión de supervisión",
                                        "Reunión de planificación",
                                        "Reunión de capacitación",
                                        "Otro (especificar)",
                                    ].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setSubtipoExtraordinaria(option)
                                                if (option !== "Otro (especificar)") {
                                                    setDescripcionExtraordinaria(option)
                                                } else {
                                                    setDescripcionExtraordinaria("")
                                                }
                                            }}
                                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                                                subtipoExtraordinaria === option
                                                    ? "border-sky-500 bg-sky-50"
                                                    : "border-sky-200 bg-white hover:border-sky-300"
                                            }`}
                                        >
                                            <div className="font-semibold text-sky-900">{option}</div>
                                        </button>
                                    ))}
                                </div>
                                {subtipoExtraordinaria === "Otro (especificar)" && (
                                    <div className="mt-3">
                                        <Label className="text-sm font-medium text-sky-900 mb-2 block">Descripción adicional</Label>
                                        <Input
                                            value={descripcionExtraordinaria}
                                            onChange={(e) => setDescripcionExtraordinaria(e.target.value)}
                                            placeholder="Describe el tipo de actividad o detalle adicional"
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Responsable */}
                        <div>
                            <Label className="text-sm font-medium text-sky-900 mb-2 block">Responsable</Label>
                            <Input
                                value={responsable}
                                onChange={(e) => setResponsable(e.target.value)}
                                placeholder="Nombre del responsable"
                                className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                            />
                        </div>

                        {/* Botón de acción */}
                        <Button
                            onClick={handleAccionRegistro}
                            disabled={inicializando}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {existeRegistroHoy ? "Editar Registro Existente" : "Iniciar Nuevo Registro"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Sección de Reportes */}
                <Card className="mb-6 bg-white border-sky-200 shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
                    <CardHeader>
                        <CardTitle className="text-sky-900 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Reportes de Asistencia
                        </CardTitle>
                        <CardDescription>Consulta y filtra los reportes de asistencia por período</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-sky-900 mb-1 block">Fecha inicio</Label>
                                <Input
                                    type="date"
                                    value={fechaInicioReporte}
                                    onChange={(e) => setFechaInicioReporte(e.target.value)}
                                    className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                />
                            </div>
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-sky-900 mb-1 block">Fecha fin</Label>
                                <Input
                                    type="date"
                                    value={fechaFinReporte}
                                    onChange={(e) => setFechaFinReporte(e.target.value)}
                                    className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                />
                            </div>
                            <div className="flex-1">
                                <Label className="text-sm font-medium text-sky-900 mb-1 block">Estado</Label>
                                <Select value={filtroEstadoReporte} onValueChange={setFiltroEstadoReporte}>
                                    <SelectTrigger className="border-sky-200 focus:border-sky-500 focus:ring-sky-500">
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="presente">Presente</SelectItem>
                                        <SelectItem value="ausente">Ausente</SelectItem>
                                        <SelectItem value="tardanza">Tardanza</SelectItem>
                                        <SelectItem value="justificado">Justificado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            onClick={cargarReportes}
                            disabled={loadingReporte || !fechaInicioReporte || !fechaFinReporte}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {loadingReporte ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Generar Reporte
                                </>
                            )}
                        </Button>

                        {/* Resultados del reporte */}
                        {datosReporte && (
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-600 font-medium">Total Registros</p>
                                        <p className="text-2xl font-bold text-blue-700">{datosReporte.resumen?.totalRegistros || datosReporte.asistencias?.length || 0}</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-xs text-green-600 font-medium">Presentes</p>
                                        <p className="text-2xl font-bold text-green-700">{datosReporte.resumen?.presentes || 0}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-xs text-red-600 font-medium">Ausentes</p>
                                        <p className="text-2xl font-bold text-red-700">{datosReporte.resumen?.ausentes || 0}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-xs text-yellow-600 font-medium">Tardanzas</p>
                                        <p className="text-2xl font-bold text-yellow-700">{datosReporte.resumen?.tardanzas || 0}</p>
                                    </div>
                                </div>

                                {/* Tabla detallada */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-sky-200">
                                                <th className="text-left p-2 font-medium text-sky-900">Responsable</th>
                                                <th className="text-left p-2 font-medium text-sky-900">Fecha</th>
                                                <th className="text-left p-2 font-medium text-sky-900">Actividad</th>
                                                <th className="text-left p-2 font-medium text-sky-900">Estado</th>
                                                <th className="text-left p-2 font-medium text-sky-900">Hora Entrada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(filtroEstadoReporte === "todos"
                                                ? datosReporte.asistencias || []
                                                : (datosReporte.asistencias || []).filter((a: any) => a.estado === filtroEstadoReporte)
                                            ).map((item: any, idx: number) => (
                                                <tr key={idx} className="border-b border-sky-100 hover:bg-sky-50">
                                                    <td className="p-2 text-sky-800">{item.responsable || "—"}</td>
                                                    <td className="p-2 text-sky-800">
                                                        {item.fecha
                                                            ? format(parseISO(item.fecha), "dd/MM/yyyy", { locale: es })
                                                            : "—"}
                                                    </td>
                                                    <td className="p-2 text-sky-800">{(item.actividad || item.tipoActividad || "—").replace(/_/g, " ")}</td>
                                                    <td className="p-2">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                item.estado === "presente"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : item.estado === "ausente"
                                                                        ? "bg-red-100 text-red-800"
                                                                        : item.estado === "tardanza"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : item.estado === "justificado"
                                                                                ? "bg-blue-100 text-blue-800"
                                                                                : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {item.estado || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-sky-800">
                                                        {item.horaEntrada
                                                            ? format(parseISO(item.horaEntrada), "HH:mm", { locale: es })
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {!datosReporte && (
                            <div className="text-center py-8 text-sky-500">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Selecciona un período y genera un reporte para ver los datos</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sección de asistencia en curso */}
                {(registro || (existeRegistroHoy && idRegistroExistente)) && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-sky-900">Registro en curso</h2>
                                <p className="text-sky-600 mt-1">{getLabelActividad(actividad)} — {fechaSeleccionada ? format(parseISO(fechaSeleccionada), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ""}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-sky-600">Responsable</p>
                                <p className="font-semibold text-sky-900">{responsable || "—"}</p>
                            </div>
                        </div>

                        <Card className="bg-sky-50 border-sky-200 shadow-sm">
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-sky-900">Progreso</p>
                                        <p className="text-sm text-sky-700">Marca la asistencia de los árbitros</p>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-sky-200">
                                        <Button
                                            onClick={() => {
                                                cancelarRegistro()
                                                setExisteRegistroHoy(false)
                                                setIdRegistroExistente(null)
                                                setMostrarDialogo(false)
                                            }}
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                                        >
                                            Descartar Registro
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const total = arbitros.length
                                                const asistentes = registro?.arbitros.filter(a => a.estado === 'presente' || a.estado === 'tardanza').length ?? 0
                                                const ausentes = registro?.arbitros.filter(a => a.estado === 'ausente').length ?? 0
                                                const justificados = registro?.arbitros.filter(a => a.estado === 'justificado').length ?? 0
                                                const tardanzas = registro?.arbitros.filter(a => a.estado === 'tardanza').length ?? 0
                                                finalizarRegistro(arbitros)
                                                cancelarRegistro()
                                                setExisteRegistroHoy(false)
                                                setIdRegistroExistente(null)
                                                setMostrarDialogo(false)
                                                setBoletaInfo({ total, asistentes, ausentes, tardanzas, justificados })
                                                setMostrarBoleta(true)
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                        >
                                            Finalizar Registro
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buscador y lista de árbitros */}
                        <Card className="bg-white border-sky-200 shadow-sm">
                            <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Buscar árbitro por nombre o DNI"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-sky-200 shadow-sm">
                            <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
                            <CardContent className="pt-4 pb-4">
                                <div className="divide-y divide-sky-100">
                                    <ListaArbitros
                                        arbitros={arbitros}
                                        onChange={marcarAsistencia}
                                        estadosMap={estadosMap}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Diálogo de Registro en curso / Edición */}
                <Dialog open={!!registro || (existeRegistroHoy && idRegistroExistente)} onOpenChange={(open) => { if (!open) { cancelarRegistro(); setExisteRegistroHoy(false); setIdRegistroExistente(null); } }}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-sky-900">
                                {registro ? "Registro en curso" : "Editar Registro Existente"}
                            </DialogTitle>
                            <DialogDescription>
                                {getLabelActividad(actividad)} — {fechaSeleccionada ? format(parseISO(fechaSeleccionada), "d 'de' MMMM 'de' yyyy", { locale: es }) : ""}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">Responsable</p>
                                    <p className="text-sm font-semibold text-sky-900">
                                        {registroExistenteInfo?.responsable || registro?.responsable || responsable || "—"}
                                    </p>
                                </div>
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">Actividad</p>
                                    <p className="text-sm font-semibold text-sky-900">
                                        {getLabelActividad(registroExistenteInfo?.actividad || actividad) || "—"}
                                    </p>
                                </div>
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">Fecha</p>
                                    <p className="text-sm font-semibold text-sky-900">
                                        {registroExistenteInfo?.fecha ? format(parseISO(registroExistenteInfo.fecha), "dd/MM/yyyy", { locale: es }) : fechaSeleccionada ? format(parseISO(fechaSeleccionada), "dd/MM/yyyy", { locale: es }) : "—"}
                                    </p>
                                </div>
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">Estado</p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-sky-100 text-sky-800 border-sky-300">
                                            {(registro?.estado || registroExistenteInfo?.estado || "En progreso") === "completado" ? "Finalizado" : "En progreso"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {(registro?.horaInicio || registroExistenteInfo?.horaEntrada || registroExistenteInfo?.createdAt) && (
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">Registro iniciado</p>
                                    <p className="text-sm font-semibold text-sky-900">
                                        {format(parseISO(registro?.horaInicio || registroExistenteInfo?.horaEntrada || registroExistenteInfo?.createdAt || ""), "dd/MM/yyyy HH:mm", { locale: es })}
                                    </p>
                                </div>
                            )}

                            {idRegistroExistente && (
                                <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                                    <p className="text-xs text-sky-500 font-medium">ID Registro</p>
                                    <p className="text-sm font-semibold text-sky-900">#{idRegistroExistente}</p>
                                </div>
                            )}

                            {existeRegistroHoy && idRegistroExistente && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700 font-medium">Registro creado por:</p>
                                    <p className="text-sm font-semibold text-amber-900">{registroExistenteInfo?.responsable || '—'}</p>
                                    <p className="text-xs text-amber-700 font-medium mt-1">Fecha y hora de creación:</p>
                                    <p className="text-sm font-semibold text-amber-900">
                                        {registroExistenteInfo?.createdAt ? format(parseISO(registroExistenteInfo.createdAt), "dd/MM/yyyy HH:mm", { locale: es }) : '—'}
                                    </p>
                                </div>
                            )}

                            {/* Buscar árbitro */}
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar árbitro por nombre o DNI"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                                />
                            </div>

                            {/* Lista de árbitros */}
                            {existeRegistroHoy && !registro && (
                                <Card className="border-sky-200">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="text-center py-8">
                                            <p className="text-sm text-sky-600">Cargando marcas de asistencia...</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {(registro || !existeRegistroHoy) && (
                                <Card className="border-sky-200">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="divide-y divide-sky-100 max-h-[50vh] overflow-y-auto">
                                            <ListaArbitros
                                                arbitros={arbitros}
                                                onChange={marcarAsistencia}
                                                estadosMap={estadosMap}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => { cancelarRegistro(); setExisteRegistroHoy(false); setIdRegistroExistente(null); }}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                                >
                                    Descartar Registro
                                </Button>
<Button
                                    onClick={() => {
                                        const total = arbitros.length
                                        const asistentes = registro?.arbitros.filter(a => a.estado === 'presente' || a.estado === 'tardanza').length ?? 0
                                        const ausentes = registro?.arbitros.filter(a => a.estado === 'ausente').length ?? 0
                                        const justificados = registro?.arbitros.filter(a => a.estado === 'justificado').length ?? 0
                                        const tardanzas = registro?.arbitros.filter(a => a.estado === 'tardanza').length ?? 0
                                        finalizarRegistro(arbitros)
                                        cancelarRegistro()
                                        setExisteRegistroHoy(false)
                                        setIdRegistroExistente(null)
                                        setMostrarDialogo(false)
                                        setBoletaInfo({ total, asistentes, ausentes, tardanzas, justificados })
                                        setMostrarBoleta(true)
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                >
                                    Finalizar Registro
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Estado vacío cuando no hay registro en curso */}
                {!registro && !(existeRegistroHoy && idRegistroExistente) && (
                    <Card className="bg-white border-sky-200 shadow-sm">
                        <CardContent className="pt-6 pb-6">
                            <div className="text-center py-8">
                                <UserCheck className="w-12 h-12 text-sky-300 mx-auto mb-4" />
                                <p className="text-sky-600 font-medium">
                                    {existeRegistroHoy
                                        ? "Ya existe un registro para esta fecha. Edítalo desde el bloque de arriba."
                                        : "Selecciona una fecha y actividad para iniciar el registro de asistencia."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Boleta informativa al finalizar */}
                <Dialog open={mostrarBoleta} onOpenChange={setMostrarBoleta}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg text-sky-900 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Boleta de Asistencia
                            </DialogTitle>
                            <DialogDescription>
                                Resumen del registro finalizado el {fechaSeleccionada ? format(parseISO(fechaSeleccionada), "d 'de' MMMM 'de' yyyy", { locale: es }) : ""}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {boletaInfo && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-center">
                                        <p className="text-2xl font-bold text-sky-900">{boletaInfo.total}</p>
                                        <p className="text-xs text-sky-600">Total Árbitros</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">{boletaInfo.asistentes}</p>
                                        <p className="text-xs text-emerald-600">Asistentes</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                                        <p className="text-2xl font-bold text-red-700">{boletaInfo.ausentes}</p>
                                        <p className="text-xs text-red-600">Ausentes</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                                        <p className="text-2xl font-bold text-yellow-700">{boletaInfo.tardanzas}</p>
                                        <p className="text-xs text-yellow-600">Tardanzas</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <p className="text-sm text-sky-800">
                                    {(boletaInfo?.asistentes ?? 0) + (boletaInfo?.justificados ?? 0) > 0
                                        ? `Porcentaje de asistencia: ${boletaInfo ? Math.round(((boletaInfo.asistentes + boletaInfo.justificados) / boletaInfo.total) * 100) : 0}%`
                                        : "Sin registros de asistencia"}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setMostrarBoleta(false)}
                                className="bg-sky-600 hover:bg-sky-700 text-white w-full"
                            >
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}