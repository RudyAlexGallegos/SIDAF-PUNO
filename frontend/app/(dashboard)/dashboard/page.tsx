"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    Users,
    UserCheck,
    Calendar,
    Trophy,
    Server,
    ChevronRight,
    FileText,
    Loader2,
    AlertCircle,
    Flag,
    ClipboardList,
    ArrowRight,
} from "lucide-react"
import { getArbitros, getDesignaciones, getCampeonatos, getEquipos, getAsistencias, type Designacion, type Arbitro, type Campeonato, type Equipo, type Asistencia } from "@/services/api"

type ApiStatus = "checking" | "ok" | "error"

interface DashboardStats {
    arbitros: number
    arbitrosActivos: number
    designaciones: number
    designacionesPendientes: number
    championships: number
    championshipsActivos: number
    equipos: number
    todayAsistencias: number
}

export default function DashboardPage() {
    const [apiStatus, setApiStatus] = useState<ApiStatus>("checking")
    const [stats, setStats] = useState<DashboardStats>({
        arbitros: 0,
        arbitrosActivos: 0,
        designaciones: 0,
        designacionesPendientes: 0,
        championships: 0,
        championshipsActivos: 0,
        equipos: 0,
        todayAsistencias: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            let retries = 3
            let lastError = null
            
            while (retries > 0) {
                try {
                    // Check API connection first
                    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api") + "/hello"
                    const helloRes = await fetch(apiUrl)
                    if (!helloRes.ok) throw new Error("API no disponible")
                    setApiStatus("ok")

                    // Fetch all data in parallel
                    const [arbitros, designaciones, championships, equipos, todayAsistencias] = await Promise.all([
                        getArbitros(),
                        getDesignaciones(),
                        getCampeonatos(),
                        getEquipos(),
                        getAsistencias(),
                    ])

                    // Calculate stats
                    const arbitrosActivos = arbitros.filter((a: Arbitro) => a.estado === "ACTIVO" || a.disponible).length
                    const designacionesPendientes = designaciones.filter((d: Designacion) => d.estado === "PENDIENTE" || d.estado === "CONFIRMADA").length
                    const championshipsActivos = championships.filter((c: Campeonato) => c.estado === "ACTIVO" || c.estado === "EN_CURSO").length
                    const today = new Date().toISOString().split('T')[0]
                    const todayAsistCount = todayAsistencias.filter((a: Asistencia) => a.fecha === today).length

                    setStats({
                        arbitros: arbitros.length,
                        arbitrosActivos,
                        designaciones: designaciones.length,
                        designacionesPendientes,
                        championships: championships.length,
                        championshipsActivos,
                        equipos: equipos.length,
                        todayAsistencias: todayAsistCount,
                    })
                    
                    // Success - set loading to false and exit the retry loop
                    setLoading(false)
                    return
                } catch (error) {
                    console.error(`Attempt failed (${3 - retries + 1}/3):`, error)
                    lastError = error
                    retries--
                    
                    if (retries > 0) {
                        // Wait 3 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 3000))
                    }
                }
            }
            
            // All retries failed
            console.error("Error fetching dashboard data after 3 attempts:", lastError)
            setApiStatus("error")
            setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
            {/* Header */}
            <section className="border-b border-slate-700/50 pb-3 md:pb-4 lg:pb-6">
                <p className="text-xs md:text-sm font-medium text-indigo-400 uppercase tracking-wide">
                    Comisión Departamental de Árbitros · Puno
                </p>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                    Panel de Control
                </h1>
                <p className="text-slate-300 mt-2 max-w-3xl text-xs md:text-sm lg:text-base">
                    Bienvenido al sistema de gestión arbitral. Aquí encontrará un resumen de la actividad actual.
                </p>
            </section>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-slate-300">Cargando datos del sistema...</span>
                </div>
            )}

            {/* Error State */}
            {!loading && apiStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-300">Backend en modo suspensión</p>
                            <p className="text-sm text-red-300/80 mt-1">
                                El servidor puede tardar 30-60 segundos en despertar. Por favor, espere un momento y actualice la página.
                            </p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-lg shadow-red-500/25"
                            >
                                Actualizar página
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid - Responsive */}
            {!loading && apiStatus === "ok" && (
                <>
                    {/* Primary Stats Row */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                        <StatCard 
                            label="Árbitros"
                            value={stats.arbitros}
                            subValue={`${stats.arbitrosActivos} activos`}
                            icon={Users}
                            color="blue"
                            href="/dashboard/arbitros"
                        />
                        <StatCard 
                            label="Designaciones"
                            value={stats.designaciones}
                            subValue={`${stats.designacionesPendientes} pendientes`}
                            icon={ClipboardList}
                            color="indigo"
                            href="/dashboard/designaciones"
                        />
                        <StatCard 
                            label="Campeonatos"
                            value={stats.championships}
                            subValue={`${stats.championshipsActivos} activos`}
                            icon={Trophy}
                            color="amber"
                            href="/dashboard/campeonatos"
                        />
                        <StatCard 
                            label="Equipos"
                            value={stats.equipos}
                            subValue="Registrados"
                            icon={Flag}
                            color="emerald"
                            href="/dashboard/campeonatos/equipos"
                        />
                    </section>

                    {/* System Status Row */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                        <SystemStatus status={apiStatus} />
                        <QuickStats 
                            designacionesPendientes={stats.designacionesPendientes}
                            arbitrosActivos={stats.arbitrosActivos}
                        />
                    </section>

                    {/* Module Cards */}
                    <section>
                        <h2 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">
                            Módulos del Sistema
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                            <ModuleCard
                                title="Árbitros"
                                description="Gestión del padrón arbitral."
                                icon={Users}
                                href="/dashboard/arbitros"
                                color="blue"
                                count={stats.arbitros}
                            />
                            <ModuleCard
                                title="Asistencia"
                                description="Control y estadísticas."
                                icon={UserCheck}
                                href="/dashboard/asistencia"
                                color="emerald"
                            />
                            <ModuleCard
                                title="Designaciones"
                                description="Asignaciones oficiales."
                                icon={Calendar}
                                href="/dashboard/designaciones"
                                color="indigo"
                                count={stats.designacionesPendientes}
                                countLabel="pendientes"
                            />
                            <ModuleCard
                                title="Campeonatos"
                                description="Gestión institucional."
                                icon={Trophy}
                                href="/dashboard/campeonatos"
                                color="amber"
                                count={stats.championshipsActivos}
                                countLabel="activos"
                            />
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">
                            Acceso Rápido
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                            <QuickActionCard
                                title="Nueva Designación"
                                description="Crear una nueva asignación arbitral"
                                icon={ClipboardList}
                                href="/dashboard/designaciones/nueva"
                            />
                            <QuickActionCard
                                title="Registrar Árbitro"
                                description="Agregar nuevo árbitro al sistema"
                                icon={Users}
                                href="/dashboard/arbitros/nuevo"
                            />
                            <QuickActionCard
                                title="Ver Reportes"
                                description="Generar informes de actividad"
                                icon={FileText}
                                href="/dashboard/reportes"
                            />
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}

function StatCard({
    label,
    value,
    subValue,
    icon: Icon,
    color = "indigo",
    href
}: {
    label: string
    value: number
    subValue?: string
    icon: any
    color?: "blue" | "indigo" | "emerald" | "amber"
    href?: string
}) {
    const colorMap = {
        blue: {
            gradient: "from-blue-600 to-cyan-600",
            bg: "bg-gradient-to-br from-blue-500/15 to-cyan-500/15",
            border: "border-blue-500/40",
            icon: "text-blue-300",
            iconGradient: "from-blue-500/30 to-cyan-500/30",
            glow: "shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
            accent: "text-blue-400"
        },
        indigo: {
            gradient: "from-indigo-600 to-purple-600",
            bg: "bg-gradient-to-br from-indigo-500/15 to-purple-500/15",
            border: "border-indigo-500/40",
            icon: "text-indigo-300",
            iconGradient: "from-indigo-500/30 to-purple-500/30",
            glow: "shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40",
            accent: "text-indigo-400"
        },
        emerald: {
            gradient: "from-emerald-600 to-teal-600",
            bg: "bg-gradient-to-br from-emerald-500/15 to-teal-500/15",
            border: "border-emerald-500/40",
            icon: "text-emerald-300",
            iconGradient: "from-emerald-500/30 to-teal-500/30",
            glow: "shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40",
            accent: "text-emerald-400"
        },
        amber: {
            gradient: "from-amber-600 to-orange-600",
            bg: "bg-gradient-to-br from-amber-500/15 to-orange-500/15",
            border: "border-amber-500/40",
            icon: "text-amber-300",
            iconGradient: "from-amber-500/30 to-orange-500/30",
            glow: "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40",
            accent: "text-amber-400"
        },
    }

    const colors = colorMap[color]

    const content = (
        <div className={`group relative rounded-xl ${colors.bg} border ${colors.border} p-4 md:p-5 lg:p-6 backdrop-blur-sm transition-all duration-300 ${colors.glow} hover:border-opacity-60 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Animated background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none`} />

            <div className="relative flex items-start justify-between">
                <div className={`h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gradient-to-br ${colors.iconGradient} border ${colors.border} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-5 md:h-6 w-5 md:w-6 ${colors.icon}`} />
                </div>
                {href && <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-1 transition-all duration-300" />}
            </div>
            
            <div className="mt-4 md:mt-5 relative">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">{value}</p>
                <p className={`text-xs md:text-sm font-semibold mt-1 ${colors.accent}`}>{label}</p>
                {subValue && <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        )
    }

    return content
}

function SystemStatus({ status }: { status: ApiStatus }) {
    const statusConfig = {
        checking: {
            gradient: "from-slate-600 to-slate-500",
            bg: "bg-gradient-to-br from-slate-600/15 to-slate-500/15",
            border: "border-slate-600/40",
            icon: "text-slate-300",
            glow: "shadow-slate-500/20",
            text: "Verificando conexión"
        },
        ok: {
            gradient: "from-emerald-600 to-teal-600",
            bg: "bg-gradient-to-br from-emerald-500/15 to-teal-500/15",
            border: "border-emerald-500/40",
            icon: "text-emerald-300",
            glow: "shadow-emerald-500/20",
            text: "Sistema operativo",
            badge: "bg-emerald-500/20 text-emerald-300"
        },
        error: {
            gradient: "from-red-600 to-pink-600",
            bg: "bg-gradient-to-br from-red-500/15 to-pink-500/15",
            border: "border-red-500/40",
            icon: "text-red-300",
            glow: "shadow-red-500/20",
            text: "Backend no disponible",
            badge: "bg-red-500/20 text-red-300"
        }
    }

    const config = statusConfig[status]

    return (
        <div className={`group relative rounded-xl ${config.bg} border ${config.border} p-4 md:p-5 backdrop-blur-sm transition-all duration-300 shadow-lg ${config.glow} overflow-hidden`}>
            {/* Top gradient line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-60`} />
            
            <div className="relative flex items-center gap-3 md:gap-4">
                <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${config.gradient}/20 border ${config.border} flex items-center justify-center flex-shrink-0`}>
                    <Server className={`h-5 w-5 ${config.icon}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-slate-400 font-medium">Estado del Sistema</p>
                    <p className="font-semibold text-white text-xs md:text-sm mt-0.5">
                        {config.text}
                    </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${status === 'checking' ? 'animate-pulse' : ''} flex-shrink-0`}>
                    <div className={`h-full w-full rounded-full bg-gradient-to-r ${config.gradient}`} />
                </div>
            </div>
        </div>
    )
}

function QuickStats({ 
    designacionesPendientes, 
    arbitrosActivos 
}: { 
    designacionesPendientes: number
    arbitrosActivos: number 
}) {
    return (
        <div className="group relative rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/40 p-4 md:p-5 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-amber-500/20 overflow-hidden hover:-translate-y-1">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-orange-600 opacity-60" />
            
            <div className="relative flex items-start gap-3 md:gap-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-slate-400 font-medium">Actividad Pendiente</p>
                    <p className="font-bold text-white text-xs md:text-sm mt-1">
                        {designacionesPendientes} designaciones pendientes
                    </p>
                    <p className="text-xs text-amber-300 font-medium mt-2">
                        ✓ {arbitrosActivos} árbitros disponibles
                    </p>
                </div>
            </div>
        </div>
    )
}

function ModuleCard({
    title,
    description,
    icon: Icon,
    href,
    color = "indigo",
    count,
    countLabel
}: {
    title: string
    description: string
    icon: any
    href?: string
    color?: "blue" | "indigo" | "emerald" | "amber"
    count?: number
    countLabel?: string
}) {
    const colorMap = {
        blue: {
            gradient: "from-blue-600 to-cyan-600",
            bg: "bg-gradient-to-br from-blue-500/15 to-cyan-500/15",
            border: "border-blue-500/40",
            icon: "text-blue-300",
            iconGradient: "from-blue-500/30 to-cyan-500/30",
            glow: "shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
            badge: "bg-blue-500/20 border-blue-500/30 text-blue-300"
        },
        indigo: {
            gradient: "from-indigo-600 to-purple-600",
            bg: "bg-gradient-to-br from-indigo-500/15 to-purple-500/15",
            border: "border-indigo-500/40",
            icon: "text-indigo-300",
            iconGradient: "from-indigo-500/30 to-purple-500/30",
            glow: "shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40",
            badge: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
        },
        emerald: {
            gradient: "from-emerald-600 to-teal-600",
            bg: "bg-gradient-to-br from-emerald-500/15 to-teal-500/15",
            border: "border-emerald-500/40",
            icon: "text-emerald-300",
            iconGradient: "from-emerald-500/30 to-teal-500/30",
            glow: "shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40",
            badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
        },
        amber: {
            gradient: "from-amber-600 to-orange-600",
            bg: "bg-gradient-to-br from-amber-500/15 to-orange-500/15",
            border: "border-amber-500/40",
            icon: "text-amber-300",
            iconGradient: "from-amber-500/30 to-orange-500/30",
            glow: "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40",
            badge: "bg-amber-500/20 border-amber-500/30 text-amber-300"
        }
    }

    const colors = colorMap[color]

    const content = (
        <div className={`group relative rounded-xl ${colors.bg} border ${colors.border} p-4 md:p-5 transition-all duration-300 ${colors.glow} hover:border-opacity-70 hover:-translate-y-1 overflow-hidden cursor-pointer`}>
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Animated background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none`} />

            <div className="relative flex justify-between items-start mb-3 md:mb-4">
                <div className={`h-12 w-12 md:h-13 md:w-13 rounded-lg bg-gradient-to-br ${colors.iconGradient} border ${colors.border} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className={`h-5 md:h-6 w-5 md:w-6 ${colors.icon}`} />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            
            <div className="relative">
                <h3 className="font-bold text-white text-sm md:text-base leading-tight">{title}</h3>
                <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed">{description}</p>
                
                {count !== undefined && (
                    <div className={`mt-3 inline-flex items-center px-3 py-1.5 rounded-full border ${colors.badge} font-semibold text-xs`}>
                        {count} {countLabel || "total"}
                    </div>
                )}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link href={href} aria-label={title}>
                {content}
            </Link>
        )
    }

    return content
}

function QuickActionCard({
    title,
    description,
    icon: Icon,
    href
}: {
    title: string
    description: string
    icon: any
    href: string
}) {
    return (
        <Link href={href} className="block">
            <div className="group relative rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/40 p-4 md:p-5 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 overflow-hidden">
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none" />
                
                <div className="relative flex items-start gap-3 md:gap-4">
                    <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white text-sm md:text-base">{title}</h3>
                        <p className="text-xs md:text-sm text-slate-300 mt-1">{description}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
