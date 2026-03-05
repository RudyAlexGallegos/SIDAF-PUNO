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
    Star,
    Target,
    Users,
    TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

// Años de experiencia = años desde afiliación
const calcularAniosExperiencia = (fechaAfiliacion: string): number => {
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

const getEstadoClassName = (estado: string) => {
  return estado === 'activo' 
    ? 'bg-green-100 text-green-700 border border-green-200' 
    : 'bg-slate-200 text-slate-600 border border-slate-300'
}

export default function ArbitroPerfilPage() {
    const params = useParams()
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
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-slate-600 font-medium">Cargando...</div>
            </div>
        )
    }

    if (!arbitro) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
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
    const aniosExperiencia = calcularAniosExperiencia(arb.fechaAfiliacion || "")
    const roles = getRolesLabels(arb.roles || "[]")
    const especialidades = getEspecialidadesLabels(arb.especialidades || "[]")
    const estado = arb.estado || "inactivo"

    const exportarPDF = () => {
        if (!pdfRef.current) return
        const opt = {
            margin: 5,
            filename: `CV_${arb.nombre}_${arb.apellido}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        html2pdf().set(opt as any).from(pdfRef.current).save()
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportarPDF} className="border-slate-300">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar CV
                        </Button>
                        <Button asChild className="bg-slate-800 hover:bg-slate-900">
                            <Link href={`/dashboard/arbitros/${arb.id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* CV Style */}
                <div ref={pdfRef} className="bg-white shadow-2xl">
                    {/* Header - CV Style */}
                    <div className="bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800 p-8">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full bg-white border-4 border-white/50 overflow-hidden flex-shrink-0 shadow-lg">
                                {foto ? (
                                    <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                        <User className="w-14 h-14 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-wide text-slate-800">{arb.nombre} {arb.apellido}</h1>
                                <p className="text-slate-600 text-lg mt-1 font-medium">{arb.categoria || "Árbitro"}</p>
                                
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getEstadoClassName(estado)}`}>
                                        {getEstadoLabel(estado)}
                                    </span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-600 font-medium">CODAR Puno</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-600">{arb.provincia || "Puno"}</span>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4">
                                    {arb.telefono && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{arb.telefono}</span>
                                        </div>
                                    )}
                                    {arb.email && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4" />
                                            <span>{arb.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Experience Highlight - CV Style */}
                    <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-4xl font-bold text-slate-700">{aniosExperiencia}</p>
                                <p className="text-slate-500 text-sm mt-1 font-medium">AÑOS DE EXPERIENCIA</p>
                                <p className="text-slate-400 text-xs">(Desde {arb.fechaAfiliacion ? new Date(arb.fechaAfiliacion).getFullYear() : "N/A"})</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-4xl font-bold text-slate-700">{roles.length}</p>
                                <p className="text-slate-500 text-sm mt-1 font-medium">ROLES</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <p className="text-4xl font-bold text-slate-700">{especialidades.length}</p>
                                <p className="text-slate-500 text-sm mt-1 font-medium">ESPECIALIDADES</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-8">
                            {/* Left Column - Personal Info */}
                            <div className="col-span-1 space-y-6">
                                {/* Datos Personales */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Datos Personales
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        {arb.dni && (
                                            <div>
                                                <p className="text-slate-500 text-xs">DNI</p>
                                                <p className="font-semibold text-slate-700">{arb.dni}</p>
                                            </div>
                                        )}
                                        {genero && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Género</p>
                                                <p className="font-semibold text-slate-700 capitalize">{genero}</p>
                                            </div>
                                        )}
                                        {edad > 0 && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Edad</p>
                                                <p className="font-semibold text-slate-700">{edad} años</p>
                                            </div>
                                        )}
                                        {arb.fechaNacimiento && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Fecha de Nacimiento</p>
                                                <p className="font-semibold text-slate-700">
                                                    {new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        )}
                                        {arb.estatura && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Estatura</p>
                                                <p className="font-semibold text-slate-700">{arb.estatura} cm</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Ubicación
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        {arb.provincia && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Provincia</p>
                                                <p className="font-semibold text-slate-700">{arb.provincia}</p>
                                            </div>
                                        )}
                                        {arb.distrito && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Distrito</p>
                                                <p className="font-semibold text-slate-700">{arb.distrito}</p>
                                            </div>
                                        )}
                                        {arb.direccion && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Dirección</p>
                                                <p className="font-semibold text-slate-700">{arb.direccion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Roles
                                    </h2>
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} className="bg-slate-600 text-white">
                                                    {rol}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm">Sin roles asignados</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Experience */}
                            <div className="col-span-2 space-y-6">
                                {/* Especialidades - Destacado */}
                                {especialidades.length > 0 && (
                                    <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-l-4 border-slate-400 p-5">
                                        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                            <Star className="w-6 h-6 text-slate-500" />
                                            Especialidades
                                        </h2>
                                        <div className="flex flex-wrap gap-3">
                                            {especialidades.map((esp: string, i: number) => (
                                                <Badge key={i} className="bg-slate-500 text-white px-4 py-2 text-sm font-semibold">
                                                    <Target className="w-4 h-4 mr-1" />
                                                    {esp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trayectoria */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Trayectoria Profesional
                                    </h2>
                                    <div className="space-y-4">
                                        {arb.fechaAfiliacion && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-slate-500 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">Afiliación a CODAR Puno</p>
                                                    <p className="text-slate-500 text-sm">
                                                        Desde {new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenTeorico && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">Examen Teórico Aprobado</p>
                                                    <p className="text-slate-500 text-sm">
                                                        {new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenPractico && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">Examen Práctico Aprobado</p>
                                                    <p className="text-slate-500 text-sm">
                                                        {new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.academiaFormadora && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-purple-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-slate-700">Formación Académica</p>
                                                    <p className="text-slate-500 text-sm">{arb.academiaFormadora}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Perfil */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        Perfil Profesional
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed text-justify">
                                        Árbitro de categoría <strong>{arb.categoria?.toLowerCase() || "sin especificar"}</strong> con{' '}
                                        <strong>{aniosExperiencia} años</strong> de experiencia en el arbitraje de fútbol regional.{' '}
                                        {arb.fechaAfiliacion && (
                                            <>Miembro activo de la Comisión Departamental de Árbitros de Puno (CODAR) desde el año {new Date(arb.fechaAfiliacion).getFullYear()}. </>
                                        )}
                                        Especializado en {especialidades.length > 0 ? especialidades.join(", ") : "competiciones de fútbol regional"}.{' '}
                                        Actualmente con disponibilidad <strong>{estado === "activo" ? "activa" : "inactiva"}</strong> para cumplir designaciones en torneos oficiales de la Región Puno.
                                    </p>
                                </div>

                                {/* Observaciones */}
                                {arb.observaciones && (
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-700 border-b-2 border-slate-300 pb-2 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Observaciones
                                        </h2>
                                        <p className="text-slate-600">{arb.observaciones}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-sm">
                                    <p className="font-medium">Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                    <p className="mt-1">CV generado el {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
