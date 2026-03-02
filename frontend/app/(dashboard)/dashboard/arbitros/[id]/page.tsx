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
    Building,
    GraduationCap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    case "activo": return "bg-green-100 text-green-800"
    case "inactivo": return "bg-gray-100 text-gray-800"
    case "suspendido": return "bg-red-100 text-red-800"
    case "licencia_medica": return "bg-yellow-100 text-yellow-800"
    default: return "bg-blue-100 text-blue-800"
  }
}

// Obtener label de estado
const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "activo": return "Activo"
    case "inactivo": return "Inactivo"
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
                margin: 0.3,
                filename: `perfil_arbitro_${arbitro.nombre}_${arbitro.apellido}.pdf`,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(pdfRef.current)
            .save()
    }

    if (!arbitro) {
        return <div className="p-8">Cargando árbitro...</div>
    }

    // Usar cast para acceder a campos adicionales
    const arb = arbitro as any
    
    const foto = arb.foto || arb.fotoUrl
    const roles = arb.roles ? getRolesLabels(arb.roles) : []
    const especialidades = arb.especialidades ? getEspecialidadesLabels(arb.especialidades) : []
    const edad = arb.fechaNacimiento ? calcularEdad(arb.fechaNacimiento) : null
    const aniosCODAR = arb.fechaAfiliacion ? calcularAniosComoArbitro(arb.fechaAfiliacion) : null
    const genero = arb.genero || arb.sexo

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
                    <Link href="/dashboard/arbitros" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver</span>
                    </Link>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportarPDF} className="gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Exportar PDF</span>
                        </Button>

                        <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* PERFIL PROFESIONAL */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div ref={pdfRef} className="space-y-6">
                    
                    {/* CABECERA PRINCIPAL */}
                    <Card className="shadow-xl border-0 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600"></div>
                        <CardContent className="px-8 pb-8">
                            <div className="flex flex-col md:flex-row gap-6 -mt-16">
                                {/* Foto */}
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                                        {foto ? (
                                            <img src={foto} alt="Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-16 h-16 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info principal */}
                                <div className="flex-1 pt-4 md:pt-8">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-slate-900">
                                                {arbitro.nombre} {arbitro.apellido}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                <Badge className="bg-blue-600 text-white px-3 py-1">
                                                    {arbitro.categoria || "Sin categoría"}
                                                </Badge>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(arb.estado)}`}>
                                                    {getEstadoLabel(arb.estado || "activo")}
                                                </span>
                                                {aniosCODAR !== null && (
                                                    <span className="flex items-center gap-1 text-sm text-slate-600">
                                                        <Clock className="w-4 h-4" />
                                                        {aniosCODAR} años en CODAR
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Contacto rápido */}
                                        <div className="flex flex-col gap-2 text-sm">
                                            {arb.telefono && (
                                                <a href={`tel:${arb.telefono}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                                                    <Phone className="w-4 h-4" />
                                                    {arb.telefono}
                                                </a>
                                            )}
                                            {arb.email && (
                                                <a href={`mailto:${arb.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                                                    <Mail className="w-4 h-4" />
                                                    {arb.email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GRID DE INFORMACIÓN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* COLUMNA IZQUIERDA - Datos Personales */}
                        <div className="space-y-6">
                            <Card className="shadow-lg">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Datos Personales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {arb.dni && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">DNI</span>
                                            <span className="font-medium">{arb.dni}</span>
                                        </div>
                                    )}
                                    {genero && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Sexo</span>
                                            <span className="font-medium capitalize">{genero}</span>
                                        </div>
                                    )}
                                    {edad !== null && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Edad</span>
                                            <span className="font-medium">{edad} años</span>
                                        </div>
                                    )}
                                    {arb.fechaNacimiento && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Fecha Nac.</span>
                                            <span className="font-medium">{new Date(arb.fechaNacimiento).toLocaleDateString('es-PE')}</span>
                                        </div>
                                    )}
                                    {arb.lugarNacimiento && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Lugar Nac.</span>
                                            <span className="font-medium">{arb.lugarNacimiento}</span>
                                        </div>
                                    )}
                                    {arb.estatura && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Estatura</span>
                                            <span className="font-medium">{arb.estatura} cm</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        Ubicación
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {arb.provincia && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Provincia</span>
                                            <span className="font-medium">{arb.provincia}</span>
                                        </div>
                                    )}
                                    {arb.distrito && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Distrito</span>
                                            <span className="font-medium">{arb.distrito}</span>
                                        </div>
                                    )}
                                    {arb.direccion && (
                                        <div>
                                            <span className="text-slate-500 block mb-1">Dirección</span>
                                            <span className="font-medium">{arb.direccion}</span>
                                        </div>
                                    )}
                                    {arb.telefonoEmergencia && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Tel. Emergencia</span>
                                            <span className="font-medium">{arb.telefonoEmergencia}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        Roles Asignados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {roles.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((rol: string, i: number) => (
                                                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {rol}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm">Sin roles asignados</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLUMNA CENTRAL Y DERECHA */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Datos Profesionales */}
                            <Card className="shadow-lg">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Datos Profesionales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {arb.fechaAfiliacion && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">Fecha de Afiliación</p>
                                                        <p className="font-medium">{new Date(arb.fechaAfiliacion).toLocaleDateString('es-PE')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {arb.fechaExamenTeorico && (
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">Examen Teórico</p>
                                                        <p className="font-medium">{new Date(arb.fechaExamenTeorico).toLocaleDateString('es-PE')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {arb.fechaExamenPractico && (
                                                <div className="flex items-center gap-3">
                                                    <Target className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">Examen Práctico</p>
                                                        <p className="font-medium">{new Date(arb.fechaExamenPractico).toLocaleDateString('es-PE')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {arb.academiaFormadora && (
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">Academia Formadora</p>
                                                        <p className="font-medium">{arb.academiaFormadora}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {arb.nivelPreparacion && (
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm text-slate-500">Nivel de Preparación</p>
                                                        <p className="font-medium">{arb.nivelPreparacion}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {especialidades.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-2">Especialidades</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {especialidades.map((esp: string, i: number) => (
                                                            <Badge key={i} className="bg-green-100 text-green-800">
                                                                {esp}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-4xl font-bold text-blue-700">{arbitro.experiencia || 0}</p>
                                        <p className="text-sm text-blue-600 mt-1">Años Experiencia</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-4xl font-bold text-green-700">{aniosCODAR || 0}</p>
                                        <p className="text-sm text-green-600 mt-1">Años en CODAR</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-4xl font-bold text-purple-700">{roles.length}</p>
                                        <p className="text-sm text-purple-600 mt-1">Roles</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-4xl font-bold text-orange-700">{especialidades.length}</p>
                                        <p className="text-sm text-orange-600 mt-1">Especialidades</p>
                                    </CardContent>
                                </Card>
                            </div>

                                    {/* Perfil Profesional */}
                            <Card className="shadow-lg">
                                <CardHeader className="bg-slate-50 border-b">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Award className="w-5 h-5 text-blue-600" />
                                        Perfil Profesional
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-slate-700 leading-relaxed">
                                        Árbitro de categoría {arb.categoria?.toLowerCase() || "sin especificar"} con{' '}
                                        {arb.experiencia || 0} años de experiencia en competiciones de nivel{' '}
                                        {arb.categoria?.toLowerCase() || "regional"}. 
                                        {aniosCODAR ? ` Afiliado a la Comisión Departamental de Árbitros de Puno desde ${new Date(arb.fechaAfiliacion).getFullYear()}.` : ''}{' '}
                                        Comprometido con el cumplimiento del reglamento y la ética deportiva, 
                                        actualmente con disponibilidad {arb.disponible ? 'activa' : 'inactiva'} para designaciones.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Observaciones */}
                            {(arb.observaciones || arb.estado) && (
                                <Card className="shadow-lg">
                                    <CardHeader className="bg-slate-50 border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Observaciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="text-slate-700 whitespace-pre-line">
                                            {arb.observaciones || "Sin observaciones registradas."}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Footer del perfil */}
                            <div className="text-center text-sm text-slate-400 py-4">
                                <p>Perfil generado por el Sistema de Información y Designación de Árbitros - CODAR Puno</p>
                                <p>Fecha de generación: {new Date().toLocaleDateString('es-PE')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
