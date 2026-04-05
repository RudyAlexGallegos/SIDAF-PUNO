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
                    
                    // Success - exit the retry loop
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
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <section className="border-b pb-4 md:pb-6">
                <p className="text-sm font-medium text-blue-600">
                    Comisión Departamental de Árbitros · Puno
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                    Panel de Control
                </h1>
                <p className="text-slate-500 mt-2 max-w-3xl text-sm md:text-base">
                    Bienvenido al sistema de gestión arbitral. Aquí encontrará un resumen de la actividad actual.
                </p>
            </section>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-500">Cargando datos del sistema...</span>
                </div>
            )}

            {/* Error State */}
            {!loading && apiStatus === "error" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Backend en modo suspensión</p>
                            <p className="text-sm text-amber-700 mt-1">
                                El servidor puede tardar 30-60 segundos en despertar. Por favor, espere un momento y actualice la página.
                            </p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
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
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <SystemStatus status={apiStatus} />
                        <QuickStats 
                            designacionesPendientes={stats.designacionesPendientes}
                            arbitrosActivos={stats.arbitrosActivos}
                        />
                    </section>

                    {/* Module Cards */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">
                            Módulos del Sistema
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">
                            Acceso Rápido
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    color = "blue",
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
            bg: "bg-blue-50",
            iconBg: "bg-blue-100",
            icon: "text-blue-600",
            text: "text-blue-600",
        },
        indigo: {
            bg: "bg-indigo-50",
            iconBg: "bg-indigo-100",
            icon: "text-indigo-600",
            text: "text-indigo-600",
        },
        emerald: {
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100",
            icon: "text-emerald-600",
            text: "text-emerald-600",
        },
        amber: {
            bg: "bg-amber-50",
            iconBg: "bg-amber-100",
            icon: "text-amber-600",
            text: "text-amber-600",
        },
    }

    const colors = colorMap[color]

    const content = (
        <div className={`rounded-xl ${colors.bg} p-4 md:p-5 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                {href && <ChevronRight className="h-4 w-4 text-slate-400" />}
            </div>
            <div className="mt-3">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-600 mt-0.5">{label}</p>
                {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
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
            bg: "bg-slate-100",
            icon: "text-slate-500",
            text: "Verificando conexión",
            color: "bg-slate-500"
        },
        ok: {
            bg: "bg-emerald-50",
            icon: "text-emerald-600",
            text: "Sistema operativo",
            color: "bg-emerald-500"
        },
        error: {
            bg: "bg-red-50",
            icon: "text-red-600",
            text: "Backend no disponible",
            color: "bg-red-500"
        }
    }

    const config = statusConfig[status]

    return (
        <div className="rounded-xl border bg-card p-4 md:p-5">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.bg}`}>
                    <Server className={`h-5 w-5 ${config.icon}`} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Estado del sistema</p>
                    <p className="font-semibold text-slate-900">
                        {config.text}
                    </p>
                </div>
                <div className={`ml-auto h-2.5 w-2.5 rounded-full ${config.color} ${status === 'checking' ? 'animate-pulse' : ''}`} />
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
        <div className="rounded-xl border bg-card p-4 md:p-5">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Resumen rápido</p>
                    <p className="font-semibold text-slate-900">
                        {designacionesPendientes} designaciones pendientes
                    </p>
                    <p className="text-xs text-slate-500">
                        {arbitrosActivos} árbitros activos disponibles
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
    color = "blue",
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
            bg: "bg-blue-50",
            icon: "text-blue-600",
            hover: "hover:border-blue-300"
        },
        indigo: {
            bg: "bg-indigo-50",
            icon: "text-indigo-600",
            hover: "hover:border-indigo-300"
        },
        emerald: {
            bg: "bg-emerald-50",
            icon: "text-emerald-600",
            hover: "hover:border-emerald-300"
        },
        amber: {
            bg: "bg-amber-50",
            icon: "text-amber-600",
            hover: "hover:border-amber-300"
        }
    }

    const colors = colorMap[color]

    const content = (
        <div className={`group rounded-xl border bg-card p-4 md:p-5 hover:shadow-lg transition-all duration-200 ${colors.hover}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`h-11 w-11 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            {count !== undefined && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-slate-100">
                    <span className="text-xs font-medium text-slate-600">
                        {count} {countLabel || "total"}
                    </span>
                </div>
            )}
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
            <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 group">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                        <Icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
