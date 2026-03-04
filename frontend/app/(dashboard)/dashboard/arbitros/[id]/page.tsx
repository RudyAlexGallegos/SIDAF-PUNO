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
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { getArbitros, Arbitro } from "@/services/api"

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Cargando...</div>
            </div>
        )
    }

    if (!arbitro) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Árbitro no encontrado</p>
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Perfil del Árbitro</h1>
                                <p className="text-sm text-gray-500">CODAR Puno - Sistema de Árbitros</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={exportarPDF} className="border-gray-300">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar PDF
                            </Button>
                            <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800">
                                <Link href={`/dashboard/arbitros/${arb.id}/editar`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <div ref={pdfRef} className="space-y-6">
                    
                    {/* Hero Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900"></div>
                        
                        <div className="px-8 pb-8">
                            <div className="flex flex-col md:flex-row gap-8 -mt-16">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-28 h-28 rounded-xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 pt-4">
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {arb.nombre} {arb.apellido}
                                    </h1>
                                    <p className="text-gray-500 mt-1">{arb.categoria || "Árbitros"} • CODAR Puno</p>
                                    
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            estado === 'activo' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {getEstadoLabel(estado)}
                                        </span>
                                        {aniosCODAR > 0 && (
                                            <span className="text-sm text-gray-500">
                                                {aniosCODAR} años en CODAR
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="pt-4 space-y-2">
                                    {arb.telefono && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{arb.telefono}</span>
                                        </div>
                                    )}
                                    {arb.email && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">{arb.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-5">
                                <p className="text-3xl font-bold text-gray-900">{arb.experiencia || 0}</p>
                                <p className="text-sm text-gray-500 mt-1">Años de Experiencia</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-5">
                                <p className="text-3xl font-bold text-gray-900">{aniosCODAR}</p>
                                <p className="text-sm text-gray-500 mt-1">Años en CODAR</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-5">
                                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                                <p className="text-sm text-gray-500 mt-1">Roles Asignados</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-5">
                                <p className="text-3xl font-bold text-gray-900">{especialidades.length}</p>
                                <p className="text-sm text-gray-500 mt-1">Especialidades</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Left Sidebar */}
                        <div className="md:col-span-4 space-y-6">
                            
                            {/* Personal Info */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    Información Personal
                                </h3>
                                <div className="space-y-4">
                                    {arb.dni && (
                                        <div>
                                            <p className="text-xs text-gray-500">DNI</p>
                                            <p className="text-sm font-medium text-gray-900">{arb.dni}</p>
                                        </div>
                                    )}
                                    {genero && (
                                        <div>
                                            <p className="text-xs text-gray-500">Género</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{genero}</p>
                                        </div>
                                    )}
                                    {edad > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500">Edad</p>
                                            <p className="text-sm font-medium text-gray-900">{edad} años</p>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div>
                                            <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}
                                            </p>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div>
                                            <p className="text-xs text-gray-500">Estatura</p>
                                            <p className="text-sm font-medium text-gray-900">{arb.estatura} cm</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    Ubicación
                                </h3>
                                <div className="space-y-4">
                                    {arb.provincia && (
                                        <div>
                                            <p className="text-xs text-gray-500">Provincia</p>
                                            <p className="text-sm font-medium text-gray-900">{arb.provincia}</p>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div>
                                            <p className="text-xs text-gray-500">Distrito</p>
                                            <p className="text-sm font-medium text-gray-900">{arb.distrito}</p>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div>
                                            <p className="text-xs text-gray-500">Dirección</p>
                                            <p className="text-sm font-medium text-gray-900">{arb.direccion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    Roles
                                </h3>
                                {roles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((rol: string, i: number) => (
                                            <Badge key={i} className="bg-gray-900 text-white">
                                                {rol}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Sin roles asignados</p>
                                )}
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="md:col-span-8 space-y-6">
                            
                            {/* Professional Data */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    Datos Profesionales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {arb.fechaAfiliacion && (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Fecha de Afiliación</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.fechaExamenTeorico && (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Examen Teórico</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.fechaExamenPractico && (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Examen Práctico</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.academiaFormadora && (
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500">Academia Formadora</p>
                                                <p className="text-sm font-medium text-gray-900">{arb.academiaFormadora}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {especialidades.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-3">Especialidades</p>
                                        <div className="flex flex-wrap gap-2">
                                            {especialidades.map((esp: string, i: number) => (
                                                <Badge key={i} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                                    {esp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                    Perfil Profesional
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Árbitro de categoría <span className="font-semibold">{arb.categoria?.toLowerCase() || "sin especificar"}</span> con{' '}
                                    <span className="font-semibold">{arb.experiencia || 0} años</span> de experiencia en competiciones de nivel regional.
                                    {aniosCODAR > 0 && arb.fechaAfiliacion && (
                                        <> Afiliado a la Comisión Departamental de Árbitros de Puno desde el año {new Date(arb.fechaAfiliacion).getFullYear()}.</>
                                    )}
                                    {" "}Actualmente con disponibilidad{' '}
                                    <span className="font-semibold">{estado === "activo" ? "activa" : "inactiva"}</span>{' '}
                                    para designaciones en torneos oficiales.
                                </p>
                            </div>

                            {/* Observations */}
                            {arb.observaciones && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                        Observaciones
                                    </h3>
                                    <p className="text-gray-700">{arb.observaciones}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center py-6 text-xs text-gray-400 border-t border-gray-200">
                                <p className="font-medium">Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p className="mt-1">Perfil generado el {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
