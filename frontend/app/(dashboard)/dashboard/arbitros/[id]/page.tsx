"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import html2pdf from "html2pdf.js"

import {
    ArrowLeft,
    Edit,
    Download,
    Phone,
    Mail,
    Award,
    User,
    MapPin,
    Calendar,
    FileText,
    Target,
    TrendingUp,
    Shield,
    Clock,
    GraduationCap,
    Activity,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { getArbitros, Arbitro } from "@/services/api"

// Función para calcular edad
const calcularEdad = (fechaNacimiento: string): number => {
  if (!fechaNacimiento) return 0
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

// Función para calcular años como árbitro
const calcularAniosComoArbitro = (fechaAfiliacion: string): number => {
  if (!fechaAfiliacion) return 0
  const afiliacion = new Date(fechaAfiliacion)
  const hoy = new Date()
  let anios = hoy.getFullYear() - afiliacion.getFullYear()
  const mes = hoy.getMonth() - afiliacion.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < afiliacion.getDate())) {
    anios--
  }
  return Math.max(0, anios)
}

// Mapeo de roles
const getRolesLabels = (rolesJson: string): string[] => {
  try {
    const roles = JSON.parse(rolesJson)
    const labels: Record<string, string> = {
      arbitro_principal: "Árbitro Principal",
      asistente: "Asistente",
      cuarto_oficial: "Cuarto Oficial",
      var: "VAR",
      avar: "AVAR"
    }
    return roles.map((r: string) => labels[r] || r)
  } catch {
    return []
  }
}

// Mapeo de especialidades
const getEspecialidadesLabels = (espJson: string): string[] => {
  try {
    const esp = JSON.parse(espJson)
    const labels: Record<string, string> = {
      futbol: "Fútbol",
      futsal: "Futsal"
    }
    return esp.map((e: string) => labels[e] || e)
  } catch {
    return []
  }
}

// Obtener color por estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "activo": return "bg-emerald-500"
    case "inactive": return "bg-slate-400"
    case "suspendido": return "bg-red-500"
    case "licencia_medica": return "bg-amber-500"
    default: return "bg-blue-500"
  }
}

// Obtener label de estado
const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "activo": return "Activo"
    case "inactive": return "Inactivo"
    case "suspendido": return "Suspendido"
    case "licencia_medica": return "Licencia Médica"
    default: return estado
  }
}

export default function VerArbitroPage() {
    const { id } = useParams()
    const router = useRouter()
    const [arbitro, setArbitro] = useState<Arbitro | null>(null)
    const pdfRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function cargar() {
            const lista = await getArbitros()
            const encontrado = lista.find((a: Arbitro) => a.id === Number(id))
            if (!encontrado) {
                router.push("/dashboard/arbitros")
                return
            }
            setArbitro(encontrado)
        }
        cargar()
    }, [id, router])

    const exportarPDF = () => {
        if (!pdfRef.current || !arbitro) return

        html2pdf()
            .set({
                margin: 0.2,
                filename: `perfil_arbitr_${ar.nombre}_${ar.apellido}.pdf`,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(pdfRef.current)
            .save()
    }

    if (!ar) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando información...</div>
            </div>
        )
    }

    // Usar cast para acceder a campos adicionales
    const arb = arbitro as any
    
    const foto = arb.foto || arb.fotoUrl
    const roles = arb.roles ? getRolesLabels(arb.roles) : []
    const especialidades = arb.especialidades ? getEspecialidadesLabels(arb.especialidades) : []
    const edad = arb.fechaNacimiento ? calcularEdad(arb.fechaNacimiento) : null
    const aniosCODAR = arb.fechaAfiliacion ? calcularAniosComoArbitro(arb.fechaAfiliacion) : null
    const genero = arb.genero || arb.sexo
    const estado = arb.estado || "activo"

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver</span>
                            </Link>
                            <Separator orientation="vertical" className="h-6" />
                            <span className="text-sm text-slate-500 hidden sm:inline">Perfil del Árbitro</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={exportarPDF} className="gap-2">
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Exportar</span>
                            </Button>

                            <Button size="sm" asChild className="gap-2 bg-slate-900 hover:bg-slate-800">
                                <Link href={`/dashboard/arbitros/${ar.id}/editar`}>
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Editar</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div ref={pdfRef} className="space-y-6">
                    
                    {/* PROFILE HEADER */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Banner */}
                        <div className="h-20 sm:h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative">
                            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+')]"></div>
                        </div>
                        
                        <div className="px-6 sm:px-8 pb-8">
                            <div className="flex flex-col sm:flex-row gap-6 -mt-14 sm:-mt-16">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-12 h-12 sm:w-14 sm:h-14 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 pt-3 sm:pt-4 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="min-w-0">
                                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                                                {ar.nombre} {ar.apellido}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-semibold">
                                                    <Award className="w-4 h-4" />
                                                    {ar.categoria || "Sin categoría"}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-semibold ${getEstadoColor(estado)}`}>
                                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                                    {getEstadoLabel(estado)}
                                                </span>
                                                {aniosCODAR !== null && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                                                        <Clock className="w-4 h-4" />
                                                        {aniosCODAR} años en CODAR
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Contact */}
                                        <div className="flex flex-col gap-2 text-sm bg-slate-50 p-3 rounded-lg">
                                            {arb.telefono && (
                                                <a href={`tel:${arb.telefono}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{arb.telefono}</span>
                                                </a>
                                            )}
                                            {arb.email && (
                                                <a href={`mailto:${arb.email}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium truncate max-w-[200px]">{arb.email}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-6">
                            
                            {/* Personal Info */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                    <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-600" />
                                        Datos Personales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {arb.dni && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">DNI</span>
                                            <span className="text-sm font-semibold text-slate-900">{arb.dni}</span>
                                        </div>
                                    )}
                                    {genero && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Sexo</span>
                                            <span className="text-sm font-semibold text-slate-900 capitalize">{genero}</span>
                                        </div>
                                    )}
                                    {edad !== null && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Edad</span>
                                            <span className="text-sm font-semibold text-slate-900">{edad} años</span>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Nacimiento</span>
                                            <span className="text-sm font-semibold text-slate-900">{new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}</span>
                                        </div>
                                    )}
                                    {arb.lugarNacimiento && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Lugar</span>
                                            <span className="text-sm font-semibold text-slate-900 text-right">{arb.lugarNacimiento}</span>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div className="flex justify-between items-center py-1.5">
                                            <span className="text-sm text-slate-500">Estatura</span>
                                            <span className="text-sm font-semibold text-slate-900">{arb.estatura} cm</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                    <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-600" />
                                        Ubicación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {arb.provincia && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Provincia</span>
                                            <span className="text-sm font-semibold text-slate-900">{arb.provincia}</span>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Distrito</span>
                                            <span className="text-sm font-semibold text-slate-900">{arb.distrito}</span>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div className="py-1.5">
                                            <span className="text-sm text-slate-500 block mb-1">Dirección</span>
                                            <span className="text-sm font-semibold text-slate-900">{arb.direccion}</span>
                                        </div>
                                    )}
                                    {arb.telefonoEmergencia && (
                                        <div className="flex justify-between items-center py-1.5 pt-3 border-t border-slate-100">
                                            <span className="text-sm text-slate-500">Emergencia</span>
                                            <span className="text-sm font-semibold text-red-600">{arb.telefonoEmergencia}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Roles */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                    <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-slate-600" />
                                        Roles Asignados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} className="bg-slate-800 text-white hover:bg-slate-700 px-3 py-1">
                                                    {rol}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">Sin roles asignados</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-6">
                            
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-800 to-slate-900">
                                    <CardContent className="p-5 text-center">
                                        <p className="text-3xl sm:text-4xl font-bold text-white">{ar.experiencia || 0}</p>
                                        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">Años Experiencia</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-600 to-emerald-700">
                                    <CardContent className="p-5 text-center">
                                        <p className="text-3xl sm:text-4xl font-bold text-white">{aniosCODAR || 0}</p>
                                        <p className="text-xs sm:text-sm text-emerald-100 mt-2 font-medium">Años en CODAR</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700">
                                    <CardContent className="p-5 text-center">
                                        <p className="text-3xl sm:text-4xl font-bold text-white">{roles.length}</p>
                                        <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium">Roles Asignados</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-violet-600 to-violet-700">
                                    <CardContent className="p-5 text-center">
                                        <p className="text-3xl sm:text-4xl font-bold text-white">{especialidades.length}</p>
                                        <p className="text-xs sm:text-sm text-violet-100 mt-2 font-medium">Especialidades</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Professional Data */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                    <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-slate-600" />
                                        Trayectoria Profesional
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {arb.fechaAfiliacion && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                <div className="p-2 rounded-lg bg-slate-800 text-white">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase">Fecha Afiliación</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenTeorico && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                <div className="p-2 rounded-lg bg-blue-600 text-white">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase">Examen Teórico</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenPractico && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase">Examen Práctico</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.academiaFormadora && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                <div className="p-2 rounded-lg bg-violet-600 text-white">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase">Academia</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{arb.academiaFormadora}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.nivelPreparacion && (
                                            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                <div className="p-2 rounded-lg bg-amber-500 text-white">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase">Nivel</p>
                                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{arb.nivelPreparacion}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Specialties */}
                                    {especialidades.length > 0 && (
                                        <div className="mt-5 pt-5 border-t border-slate-200">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Especialidades Deportivas</p>
                                            <div className="flex flex-wrap gap-2">
                                                {especialidades.map((esp: string, i: number) => (
                                                    <Badge key={i} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-1.5 text-sm font-semibold">
                                                        {esp}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Profile Description */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                    <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-slate-600" />
                                        Perfil Profesional
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    <p className="text-slate-700 leading-relaxed text-base">
                                        Árbitro de categoría <strong className="text-slate-900">{ar.categoria || "sin especificar"}</strong> con{' '}
                                        <strong className="text-slate-900">{ar.experiencia || 0} años</strong> de experiencia en el arbitraje de fútbol regional.{' '}
                                        {aniosCODAR ? `Miembro activo de la Comisión Departamental de Árbitros de Puno (CODAR) desde el año ${new Date(arb.fechaAfiliacion).getFullYear()}.` : ''}{' '}
                                        Profesional comprometido con la imparcialidad, el cumplimiento del reglamento y la ética deportiva. 
                                        Actualmente cuenta con disponibilidad <strong className={estado === 'activo' ? "text-emerald-600" : "text-slate-600"}>{estado === 'activo' ? "activa" : "limitada"}</strong> para接受 designaciones en torneos oficiales.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Observations */}
                            {arb.observaciones && (
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader className="pb-3 bg-slate-50/50 border-b">
                                        <CardTitle className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-600" />
                                            Observaciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <p className="text-slate-700 whitespace-pre-line">{arb.observaciones}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Footer */}
                            <div className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white rounded-xl p-4">
                                <p className="font-medium">Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p className="mt-1">Perfil generado el {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
