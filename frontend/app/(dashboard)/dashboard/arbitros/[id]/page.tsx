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
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-blue-800">Cargando...</div>
            </div>
        )
    }

    if (!arbitro) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-blue-800 mb-4">Árbitro no encontrado</p>
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
        <div className="min-h-screen bg-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Volver a Árbitros
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportarPDF} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                        <Button asChild className="bg-blue-700 hover:bg-blue-800">
                            <Link href={`/dashboard/arbitros/${arb.id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                <div ref={pdfRef}>
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 overflow-hidden mb-6">
                        {/* Header azul */}
                        <div className="bg-blue-700 px-6 py-8">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                    {foto ? (
                                        <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-12 h-12 text-blue-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-white">
                                    <h1 className="text-3xl font-bold">{arb.nombre} {arb.apellido}</h1>
                                    <p className="text-blue-200 mt-1">{arb.categoria || "Árbitro"} • CODAR Puno</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            estado === 'activo' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                                        }`}>
                                            {getEstadoLabel(estado)}
                                        </span>
                                        {aniosCODAR > 0 && (
                                            <span className="text-blue-200 text-sm">
                                                {aniosCODAR} años en CODAR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Info contacto */}
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                            <div className="flex flex-wrap gap-6">
                                {arb.telefono && (
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-medium">{arb.telefono}</span>
                                    </div>
                                )}
                                {arb.email && (
                                    <div className="flex items-center gap-2 text-blue-800">
                                        <Mail className="w-4 h-4" />
                                        <span className="font-medium">{arb.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-4">
                            <p className="text-3xl font-bold text-blue-700">{arb.experiencia || 0}</p>
                            <p className="text-sm text-gray-600">Años Experiencia</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-4">
                            <p className="text-3xl font-bold text-green-700">{aniosCODAR}</p>
                            <p className="text-sm text-gray-600">Años CODAR</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border-l-4 border-purple-500 p-4">
                            <p className="text-3xl font-bold text-purple-700">{roles.length}</p>
                            <p className="text-sm text-gray-600">Roles</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4">
                            <p className="text-3xl font-bold text-orange-700">{especialidades.length}</p>
                            <p className="text-sm text-gray-600">Especialidades</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Datos Personales */}
                            <div className="bg-white rounded-lg shadow-md border-t-4 border-blue-600 p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Datos Personales
                                </h3>
                                <div className="space-y-3">
                                    {arb.dni && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">DNI</span>
                                            <span className="font-medium text-gray-900">{arb.dni}</span>
                                        </div>
                                    )}
                                    {genero && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">Género</span>
                                            <span className="font-medium text-gray-900 capitalize">{genero}</span>
                                        </div>
                                    )}
                                    {edad > 0 && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">Edad</span>
                                            <span className="font-medium text-gray-900">{edad} años</span>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">F. Nacimiento</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}
                                            </span>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Estatura</span>
                                            <span className="font-medium text-gray-900">{arb.estatura} cm</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="bg-white rounded-lg shadow-md border-t-4 border-green-600 p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    Ubicación
                                </h3>
                                <div className="space-y-3">
                                    {arb.provincia && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">Provincia</span>
                                            <span className="font-medium text-gray-900">{arb.provincia}</span>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-500">Distrito</span>
                                            <span className="font-medium text-gray-900">{arb.distrito}</span>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div>
                                            <span className="text-gray-500 block">Dirección</span>
                                            <span className="font-medium text-gray-900">{arb.direccion}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="bg-white rounded-lg shadow-md border-t-4 border-purple-600 p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                    Roles
                                </h3>
                                {roles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((rol: string, i: number) => (
                                            <Badge key={i} className="bg-purple-600 text-white px-3 py-1">
                                                {rol}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Sin roles asignados</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Full width on mobile */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Datos Profesionales */}
                            <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-600 p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-orange-600" />
                                    Datos Profesionales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {arb.fechaAfiliacion && (
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                            <div>
                                                <p className="text-xs text-orange-600">Fecha de Afiliación</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.fechaExamenTeorico && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-blue-600">Examen Teórico</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.fechaExamenPractico && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <Award className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xs text-green-600">Examen Práctico</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {arb.academiaFormadora && (
                                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                            <Users className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-xs text-purple-600">Academia Formadora</p>
                                                <p className="font-medium text-gray-900">{arb.academiaFormadora}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {especialidades.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Especialidades</p>
                                        <div className="flex flex-wrap gap-2">
                                            {especialidades.map((esp: string, i: number) => (
                                                <Badge key={i} className="bg-orange-600 text-white">
                                                    {esp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Perfil Profesional */}
                            <div className="bg-white rounded-lg shadow-md border-t-4 border-blue-600 p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Perfil Profesional
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Árbitro de categoría <strong className="text-blue-700">{arb.categoria?.toLowerCase() || "sin especificar"}</strong> con{' '}
                                    <strong className="text-blue-700">{arb.experiencia || 0} años</strong> de experiencia en competiciones de nivel regional.
                                    {aniosCODAR > 0 && arb.fechaAfiliacion && (
                                        <> Afiliado a la Comisión Departamental de Árbitros de Puno desde el año {new Date(arb.fechaAfiliacion).getFullYear()}.</>
                                    )}
                                    {" "}Actualmente con disponibilidad <strong className={estado === 'activo' ? "text-green-600" : "text-gray-500"}>{estado === "activo" ? "activa" : "inactiva"}</strong> para designaciones en torneos oficiales.
                                </p>
                            </div>

                            {/* Observaciones */}
                            {arb.observaciones && (
                                <div className="bg-white rounded-lg shadow-md border-t-4 border-gray-500 p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        Observaciones
                                    </h3>
                                    <p className="text-gray-700">{arb.observaciones}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center py-4 text-sm text-gray-500 bg-white rounded-lg shadow-md p-4">
                                <p className="font-medium">Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p className="mt-1">Perfil generado el {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
