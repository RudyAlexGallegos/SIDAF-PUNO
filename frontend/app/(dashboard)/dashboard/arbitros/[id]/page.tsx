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
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
    : 'bg-sky-100 text-sky-600 border border-sky-200'
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
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-sky-700 font-medium">Cargando...</div>
            </div>
        )
    }

    if (!arbitro) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sky-600 mb-4">Árbitro no encontrado</p>
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
        <div className="min-h-screen bg-sky-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-sky-700 hover:text-sky-900 font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Volver
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={exportarPDF} className="flex-1 sm:flex-none border-sky-300 text-sky-700 hover:bg-sky-50">
                            <Download className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Descargar CV</span>
                            <span className="sm:hidden">CV</span>
                        </Button>
                        <Button asChild className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-700">
                            <Link href={`/dashboard/arbitros/${arb.id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Editar</span>
                                <span className="sm:hidden">Editar</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* CV Style - Acero Celeste y Blanco */}
                <div ref={pdfRef} className="bg-white shadow-2xl rounded-xl overflow-hidden">
                    {/* Header - Acero Celeste */}
                    <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 text-white p-4 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-white/50 overflow-hidden flex-shrink-0 shadow-lg">
                                {foto ? (
                                    <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-sky-100">
                                        <User className="w-10 h-10 md:w-14 md:h-14 text-sky-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white">{arb.nombre} {arb.apellido}</h1>
                                <p className="text-sky-100 text-base md:text-lg mt-1 font-medium">{arb.categoria || "Árbitro"}</p>
                                
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mt-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getEstadoClassName(estado)}`}>
                                        {getEstadoLabel(estado)}
                                    </span>
                                    <span className="text-sky-200">•</span>
                                    <span className="text-white font-medium">CODAR Puno</span>
                                    <span className="text-sky-200">•</span>
                                    <span className="text-sky-100">{arb.provincia || "Puno"}</span>
                                </div>

                                <div className="flex flex-wrap gap-3 md:gap-4 mt-4 justify-center md:justify-start">
                                    {arb.telefono && (
                                        <div className="flex items-center gap-2 text-sky-100 text-sm md:text-base">
                                            <Phone className="w-4 h-4" />
                                            <span>{arb.telefono}</span>
                                        </div>
                                    )}
                                    {arb.email && (
                                        <div className="flex items-center gap-2 text-sky-100 text-sm md:text-base">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate max-w-[150px] md:max-w-none">{arb.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Experience Highlight - Acero Celeste claro */}
                    <div className="bg-gradient-to-r from-sky-50 to-white border-b border-sky-100 px-4 md:px-8 py-4 md:py-6">
                        <div className="grid grid-cols-3 gap-2 md:gap-6">
                            <div className="bg-white rounded-lg p-3 md:p-4 border border-sky-200 shadow-sm">
                                <p className="text-2xl md:text-4xl font-bold text-sky-600">{aniosExperiencia}</p>
                                <p className="text-sky-500 text-xs md:text-sm mt-1 font-medium">AÑOS DE EXPERIENCIA</p>
                                <p className="text-sky-400 text-xs">(Desde {arb.fechaAfiliacion ? new Date(arb.fechaAfiliacion).getFullYear() : "N/A"})</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 md:p-4 border border-sky-200 shadow-sm">
                                <p className="text-2xl md:text-4xl font-bold text-sky-600">{roles.length}</p>
                                <p className="text-sky-500 text-xs md:text-sm mt-1 font-medium">ROLES</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 md:p-4 border border-sky-200 shadow-sm">
                                <p className="text-2xl md:text-4xl font-bold text-sky-600">{especialidades.length}</p>
                                <p className="text-sky-500 text-xs md:text-sm mt-1 font-medium">ESPECIALIDADES</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-4 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {/* Left Column - Personal Info */}
                            <div className="md:col-span-1 space-y-6">
                                {/* Datos Personales */}
                                <div>
                                    <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Datos Personales
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        {arb.dni && (
                                            <div>
                                                <p className="text-sky-500 text-xs">DNI</p>
                                                <p className="font-semibold text-sky-800">{arb.dni}</p>
                                            </div>
                                        )}
                                        {genero && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Género</p>
                                                <p className="font-semibold text-sky-800 capitalize">{genero}</p>
                                            </div>
                                        )}
                                        {edad > 0 && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Edad</p>
                                                <p className="font-semibold text-sky-800">{edad} años</p>
                                            </div>
                                        )}
                                        {arb.fechaNacimiento && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Fecha de Nacimiento</p>
                                                <p className="font-semibold text-sky-800">
                                                    {new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        )}
                                        {arb.estatura && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Estatura</p>
                                                <p className="font-semibold text-sky-800">{arb.estatura} cm</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div>
                                    <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Ubicación
                                    </h2>
                                    <div className="space-y-3 text-sm">
                                        {arb.provincia && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Provincia</p>
                                                <p className="font-semibold text-sky-800">{arb.provincia}</p>
                                            </div>
                                        )}
                                        {arb.distrito && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Distrito</p>
                                                <p className="font-semibold text-sky-800">{arb.distrito}</p>
                                            </div>
                                        )}
                                        {arb.direccion && (
                                            <div>
                                                <p className="text-sky-500 text-xs">Dirección</p>
                                                <p className="font-semibold text-sky-800">{arb.direccion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Roles
                                    </h2>
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} className="bg-sky-600 text-white">
                                                    {rol}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sky-400 text-sm">Sin roles asignados</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Experience */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Especialidades - Destacado */}
                                {especialidades.length > 0 && (
                                    <div className="bg-gradient-to-r from-sky-50 to-white border-l-4 border-sky-400 p-5 rounded-r-lg">
                                        <h2 className="text-xl font-bold text-sky-700 mb-4 flex items-center gap-2">
                                            <Star className="w-6 h-6 text-sky-500" />
                                            Especialidades
                                        </h2>
                                        <div className="flex flex-wrap gap-3">
                                            {especialidades.map((esp: string, i: number) => (
                                                <Badge key={i} className="bg-sky-500 text-white px-4 py-2 text-sm font-semibold">
                                                    <Target className="w-4 h-4 mr-1" />
                                                    {esp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trayectoria */}
                                <div>
                                    <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Trayectoria Profesional
                                    </h2>
                                    <div className="space-y-4">
                                        {arb.fechaAfiliacion && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-sky-500 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-sky-800">Afiliación a CODAR Puno</p>
                                                    <p className="text-sky-500 text-sm">
                                                        Desde {new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenTeorico && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-sky-800">Examen Teórico Aprobado</p>
                                                    <p className="text-sky-500 text-sm">
                                                        {new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.fechaExamenPractico && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-sky-800">Examen Práctico Aprobado</p>
                                                    <p className="text-sky-500 text-sm">
                                                        {new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {arb.academiaFormadora && (
                                            <div className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-violet-400 mt-1.5"></div>
                                                <div>
                                                    <p className="font-semibold text-sky-800">Formación Académica</p>
                                                    <p className="text-sky-500 text-sm">{arb.academiaFormadora}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Perfil */}
                                <div>
                                    <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        Perfil Profesional
                                    </h2>
                                    <p className="text-sky-700 leading-relaxed text-justify">
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
                                        <h2 className="text-lg font-bold text-sky-700 border-b-2 border-sky-200 pb-2 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Observaciones
                                        </h2>
                                        <p className="text-sky-700">{arb.observaciones}</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="pt-6 border-t border-sky-200 text-center text-sky-500 text-sm">
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
