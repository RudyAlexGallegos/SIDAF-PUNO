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
    Shield,
    Clock,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { getArbitros, Arbitro } from "@/services/api"

// Calcular edad
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

// Calcular años como árbitro
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

// Labels de roles
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

// Labels de especialidades
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

// Estado
const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "activo": return "Activo"
    case "inactivo": return "Inactivo"
    default: return estado
  }
}

export default function ArbitroPerfilPage() {
    const params = useParams()
    const router = useRouter()
    const pdfRef = useRef<HTMLDivElement>(null)
    const [arbitros, setArbitros] = useState<Arbitro[]>([])
    const [loading, setLoading] = useState(true)
    const [arbitro, setArbitro] = useState<Arbitro | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const data = await getArbitros()
                setArbitros(data)
                const id = Number(params.id)
                const encontrado = data.find(a => a.id === id)
                setArbitro(encontrado || null)
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500">Cargando...</div>
            </div>
        )
    }

    if (!arbitro) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Árbitro no encontrado</p>
                    <Button asChild>
                        <Link href="/dashboard/arbitros">Volver</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const arb = arbitro
    const foto = arb.foto
    const genero = arb.genero
    const edad = calcularEdad(arb.fechaNacimiento || "")
    const aniosCODAR = calcularAniosComoArbitro(arb.fechaAfiliacion || "")
    const roles = getRolesLabels(arb.roles || "[]")
    const especialidades = getEspecialidadesLabels(arb.especialidades || "[]")
    const estado = arb.estado || "inactivo"

    const exportarPDF = () => {
        if (!pdfRef.current) return
        const opt = {
            margin: 10,
            filename: `arbitro_${arb.nombre}_${arb.apellido}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        html2pdf().set(opt as any).from(pdfRef.current).save()
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Volver</span>
                        </Link>
                        <Separator orientation="vertical" className="h-6" />
                        <span className="text-sm font-medium text-slate-700">Perfil del Árbitro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={exportarPDF}>
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                        </Button>
                        <Button size="sm" asChild className="bg-slate-800 hover:bg-slate-900">
                            <Link href={`/dashboard/arbitros/${arb.id}/editar`}>
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div ref={pdfRef} className="space-y-6">
                    
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="h-16 bg-slate-800"></div>
                        
                        <div className="px-6 pb-6">
                            <div className="flex flex-col sm:flex-row gap-6 -mt-10">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 rounded-lg bg-white border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 pt-2">
                                    <h1 className="text-2xl font-semibold text-slate-900">
                                        {arb.nombre} {arb.apellido}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-white">
                                            {arb.categoria || "Sin categoría"}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {getEstadoLabel(estado)}
                                        </span>
                                        {aniosCODAR > 0 && (
                                            <span className="text-sm text-slate-500">
                                                {aniosCODAR} años en CODAR
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="text-sm text-slate-600 pt-2">
                                    {arb.telefono && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span>{arb.telefono}</span>
                                        </div>
                                    )}
                                    {arb.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span>{arb.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-2xl font-semibold text-slate-900">{arb.experiencia || 0}</p>
                            <p className="text-xs text-slate-500 mt-1">Años Experiencia</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-2xl font-semibold text-slate-900">{aniosCODAR}</p>
                            <p className="text-xs text-slate-500 mt-1">Años CODAR</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-2xl font-semibold text-slate-900">{roles.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Roles</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-2xl font-semibold text-slate-900">{especialidades.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Especialidades</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-900">Datos Personales</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {arb.dni && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">DNI</span>
                                            <span className="text-sm text-slate-900">{arb.dni}</span>
                                        </div>
                                    )}
                                    {genero && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Sexo</span>
                                            <span className="text-sm text-slate-900 capitalize">{genero}</span>
                                        </div>
                                    )}
                                    {edad > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Edad</span>
                                            <span className="text-sm text-slate-900">{edad} años</span>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">F. Nacimiento</span>
                                            <span className="text-sm text-slate-900">{new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}</span>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Estatura</span>
                                            <span className="text-sm text-slate-900">{arb.estatura} cm</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-900">Ubicación</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {arb.provincia && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Provincia</span>
                                            <span className="text-sm text-slate-900">{arb.provincia}</span>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Distrito</span>
                                            <span className="text-sm text-slate-900">{arb.distrito}</span>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div>
                                            <span className="text-sm text-slate-500 block">Dirección</span>
                                            <span className="text-sm text-slate-900">{arb.direccion}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Roles */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-900">Roles</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
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

                        {/* Right Column */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* Professional */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-900">Datos Profesionales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {arb.fechaAfiliacion && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Fecha de Afiliación</p>
                                                    <p className="text-sm text-slate-900">{new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenTeorico && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Examen Teórico</p>
                                                    <p className="text-sm text-slate-900">{new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenPractico && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                                                <Award className="w-4 h-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Examen Práctico</p>
                                                    <p className="text-sm text-slate-900">{new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.academiaFormadora && (
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                                                <Users className="w-4 h-4 text-slate-500" />
                                                <div>
                                                    <p className="text-xs text-slate-500">Academia</p>
                                                    <p className="text-sm text-slate-900">{arb.academiaFormadora}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {especialidades.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-xs text-slate-500 mb-2">Especialidades</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {especialidades.map((esp: string, i: number) => (
                                                    <Badge key={i} className="bg-slate-800 text-white text-xs">
                                                        {esp}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Profile */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-slate-900">Perfil Profesional</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        Árbitro de categoría {arb.categoria?.toLowerCase() || "sin especificar"} con {arb.experiencia || 0} años de experiencia en competiciones de nivel regional.
                                        {aniosCODAR > 0 ? ` Afiliado a CODAR Puno desde ${new Date(arb.fechaAfiliacion).getFullYear()}.` : ""}
                                        {" "}Actualmente con disponibilidad {estado === "activo" ? "activa" : "inactiva"} para designaciones en torneos oficiales.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Observations */}
                            {arb.observaciones && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-900">Observaciones</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-700">{arb.observaciones}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Footer */}
                            <div className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
                                <p>Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p className="mt-1">Perfil generado el {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
