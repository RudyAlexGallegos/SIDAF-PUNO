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
    Globe,
    Ruler,
    Heart,
    Users,
    Briefcase,
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
                filename: `perfil_arbitro_${arb.nombre}_${arb.apellido}.pdf`,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(pdfRef.current)
            .save()
    }

    if (!arbitro) {
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
        <div className="min-h-screen bg-slate-100">
            {/* HEADER CORPOATIVO */}
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
                                <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Editar</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div ref={pdfRef} className="space-y-6">
                    
                    {/* CABECERA DEL PERFIL */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Banner corporativo */}
                        <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
                            </div>
                            <div className="absolute bottom-4 left-8 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-white/80" />
                                <span className="text-white/80 font-medium">CODAR Puno</span>
                            </div>
                        </div>
                        
                        <div className="px-6 sm:px-8 pb-8">
                            <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-16">
                                {/* Foto de perfil */}
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-10 h-10 sm:w-14 sm:h-14 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info principal */}
                                <div className="flex-1 pt-2 sm:pt-4 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="min-w-0">
                                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                                                {arb.nombre} {arb.apellido}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md">
                                                    <Award className="w-4 h-4" />
                                                    {arb.categoria || "Sin categoría"}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-md ${estado === 'activo' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${estado === 'activo' ? 'bg-white animate-pulse' : 'bg-white/50'}`}></span>
                                                    {getEstadoLabel(estado)}
                                                </span>
                                                {aniosCODAR !== null && aniosCODAR > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow-md">
                                                        <Clock className="w-4 h-4" />
                                                        {aniosCODAR} años CODAR
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Contacto */}
                                        <div className="flex flex-col gap-2 text-sm">
                                            {arb.telefono && (
                                                <a href={`tel:${arb.telefono}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span>{arb.telefono}</span>
                                                </a>
                                            )}
                                            {arb.email && (
                                                <a href={`mailto:${arb.email}`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 truncate">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate">{arb.email}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRID DE INFORMACIÓN */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* COLUMNA IZQUIERDA - 4 columnas */}
                        <div className="md:col-span-4 lg:col-span-3 space-y-6">
                            
                            {/* Datos Personales */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-600" />
                                        Datos Personales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {arb.dni && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">DNI</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.dni}</span>
                                        </div>
                                    )}
                                    {genero && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Sexo</span>
                                            <span className="text-sm font-medium text-slate-900 capitalize">{genero}</span>
                                        </div>
                                    )}
                                    {edad !== null && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Edad</span>
                                            <span className="text-sm font-medium text-slate-900">{edad} años</span>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">F. Nacimiento</span>
                                            <span className="text-sm font-medium text-slate-900">{new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}</span>
                                        </div>
                                    )}
                                    {arb.lugarNacimiento && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">L. Nacimiento</span>
                                            <span className="text-sm font-medium text-slate-900 text-right">{arb.lugarNacimiento}</span>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Estatura</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.estatura} cm</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Ubicación */}
                            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl border-b-0">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        Ubicación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {arb.provincia && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Provincia</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.provincia}</span>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Distrito</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.distrito}</span>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div className="py-1">
                                            <span className="text-sm text-slate-500 block mb-1">Dirección</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.direccion}</span>
                                        </div>
                                    )}
                                    {arb.telefonoEmergencia && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-slate-500">Tel. Emergencia</span>
                                            <span className="text-sm font-medium text-slate-900">{arb.telefonoEmergencia}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Roles */}
                            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl border-b-0">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                        Roles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-md">
                                                    {rol}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Sin roles asignados</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLUMNA DERECHA - 8 columnas */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-6">
                            
                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/30 rounded-full -mr-8 -mt-8"></div>
                                    <CardContent className="p-5 text-center relative">
                                        <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-amber-700">{arb.experiencia || 0}</p>
                                        <p className="text-xs font-medium text-amber-600 mt-1">Años Experiencia</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
                                    <CardContent className="p-5 text-center relative">
                                        <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-emerald-700">{aniosCODAR || 0}</p>
                                        <p className="text-xs font-medium text-emerald-600 mt-1">Años CODAR</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
                                    <CardContent className="p-5 text-center relative">
                                        <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-blue-700">{roles.length}</p>
                                        <p className="text-xs font-medium text-blue-600 mt-1">Roles</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-purple-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-violet-200/30 rounded-full -mr-8 -mt-8"></div>
                                    <CardContent className="p-5 text-center relative">
                                        <Target className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-violet-700">{especialidades.length}</p>
                                        <p className="text-xs font-medium text-violet-600 mt-1">Especialidades</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Datos Profesionales */}
                            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b-0">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 text-white" />
                                        </div>
                                        Datos Profesionales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {arb.fechaAfiliacion && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium">Fecha de Afiliación</p>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenTeorico && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                                                <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-violet-600 font-medium">Examen Teórico</p>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenPractico && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                                                    <Target className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-emerald-600 font-medium">Examen Práctico</p>
                                                    <p className="text-sm font-bold text-slate-900">{new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.academiaFormadora && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                                                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600 font-medium">Academia Formadora</p>
                                                    <p className="text-sm font-bold text-slate-900">{arb.academiaFormadora}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.nivelPreparacion && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                                                <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-rose-600 font-medium">Nivel de Preparación</p>
                                                    <p className="text-sm font-bold text-slate-900">{arb.nivelPreparacion}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Especialidades */}
                                    {especialidades.length > 0 && (
                                        <div className="mt-5 pt-5 border-t border-slate-100">
                                            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-violet-500" />
                                                Especialidades
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {especialidades.map((esp: string, i: number) => (
                                                    <Badge key={i} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-md px-3 py-1">
                                                        {esp}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Perfil Profesional */}
                            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="pb-3 bg-transparent border-b-0">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                            <Activity className="w-4 h-4 text-white" />
                                        </div>
                                        Perfil Profesional
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <p className="text-slate-700 leading-relaxed text-base">
                                        Árbitro de categoría <strong className="text-amber-600">{arb.categoria?.toLowerCase() || "sin especificar"}</strong> con{' '}
                                        <strong className="text-blue-600">{arb.experiencia || 0} años</strong> de experiencia en competiciones de nivel regional.{' '}
                                        {aniosCODAR ? `Afiliado a la Comisión Departamental de Árbitros de Puno desde el año ${new Date(arb.fechaAfiliacion).getFullYear()}.` : ''}{' '}
                                        Comprometido con el cumplimiento del reglamento y la ética deportiva, 
                                        actualmente con disponibilidad <strong className={estado === 'activo' ? "text-emerald-600" : "text-slate-500"}>{estado === 'activo' ? 'activa' : 'inactiva'}</strong> para designaciones en torneos oficiales.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Observaciones */}
                            {arb.observaciones && (
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader className="pb-3 border-b border-slate-100">
                                        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-600" />
                                            Observaciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <p className="text-slate-700 whitespace-pre-line">{arb.observaciones}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Footer */}
                            <div className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
                                <p>Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p className="mt-1">Perfil generado el {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
