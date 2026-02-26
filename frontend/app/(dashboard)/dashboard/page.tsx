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
} from "lucide-react"

type ApiStatus = "checking" | "ok" | "error"

export default function Home() {
    const [apiStatus, setApiStatus] = useState<ApiStatus>("checking")

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL + "/api/hello"
        fetch(apiUrl)
            .then(() => setApiStatus("ok"))
            .catch(() => setApiStatus("error"))
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="border-b pb-6">
                <p className="text-sm font-medium text-blue-600">
                    Comisión Departamental de Árbitros · Puno
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                    Sistema de Gestión Arbitral
                </h1>
                <p className="text-slate-500 mt-2 max-w-3xl">
                    Plataforma institucional para la administración y supervisión arbitral.
                </p>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <SystemStatus status={apiStatus} />
                <MetricCard 
                    label="Árbitros registrados" 
                    value="—" 
                    hint="Padrón oficial"
                    color="blue"
                />
                <MetricCard
                    label="Designaciones activas"
                    value="—"
                    hint="Semana en curso"
                    color="indigo"
                />
            </section>

            {/* Module Cards */}
            <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Módulos del Sistema
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <ModuleCard
                        title="Árbitros"
                        description="Gestión del perfil profesional."
                        icon={Users}
                        href="/dashboard/arbitros"
                        color="blue"
                    />
                    <ModuleCard
                        title="Asistencia"
                        description="Control y estadísticas."
                        icon={UserCheck}
                        href="/dashboard/asistencia?new=1"
                        color="emerald"
                    />
                    <ModuleCard
                        title="Designaciones"
                        description="Asignaciones oficiales."
                        icon={Calendar}
                        href="/dashboard/designaciones"
                        color="indigo"
                    />
                    <ModuleCard
                        title="Campeonatos"
                        description="Gestión institucional."
                        icon={Trophy}
                        href="/dashboard/campeonato"
                        color="amber"
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
                        title="Ver Reportes"
                        description="Genera informes de asistencia y designaciones"
                        icon={FileText}
                        href="/dashboard/reportes"
                    />
                </div>
            </section>
        </div>
    )
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
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            icon: "text-emerald-600 dark:text-emerald-400",
            text: "Sistema operativo",
            color: "bg-emerald-500"
        },
        error: {
            bg: "bg-red-100 dark:bg-red-900/30",
            icon: "text-red-600 dark:text-red-400",
            text: "Backend no disponible",
            color: "bg-red-500"
        }
    }
    
    const config = statusConfig[status]

    return (
        <div className="rounded-2xl border bg-card p-4 md:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.bg}`}>
                    <Server className={`h-6 w-6 ${config.icon}`} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Estado del sistema</p>
                    <p className="font-semibold text-slate-900">
                        {config.text}
                    </p>
                </div>
                <div className={`ml-auto h-3 w-3 rounded-full ${config.color} ${status === 'checking' ? 'animate-pulse' : ''}`} />
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    hint,
    color = "blue"
}: {
    label: string
    value: string
    hint: string
    color?: "blue" | "indigo" | "emerald" | "amber"
}) {
    const colorMap = {
        blue: "text-blue-600",
        indigo: "text-indigo-600",
        emerald: "text-emerald-600",
        amber: "text-amber-600"
    }
    
    return (
        <div className="rounded-2xl border bg-card p-4 md:p-6 hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${colorMap[color]}`}>{value}</p>
            <p className="text-sm text-slate-500 mt-1">{hint}</p>
        </div>
    )
}

function ModuleCard({
    title,
    description,
    icon: Icon,
    href,
    color = "blue"
}: {
    title: string
    description: string
    icon: any
    href?: string
    color?: "blue" | "indigo" | "emerald" | "amber"
}) {
    const colorMap = {
        blue: {
            bg: "bg-blue-100 dark:bg-blue-900/30",
            icon: "text-blue-600 dark:text-blue-400",
            hover: "hover:border-blue-300"
        },
        indigo: {
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
            icon: "text-indigo-600 dark:text-indigo-400",
            hover: "hover:border-indigo-300"
        },
        emerald: {
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            icon: "text-emerald-600 dark:text-emerald-400",
            hover: "hover:border-emerald-300"
        },
        amber: {
            bg: "bg-amber-100 dark:bg-amber-900/30",
            icon: "text-amber-600 dark:text-amber-400",
            hover: "hover:border-amber-300"
        }
    }
    
    const colors = colorMap[color]
    
    const content = (
        <div className={`group rounded-2xl border bg-card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${colors.hover}`}>
            <div className="flex justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
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
            <div className="rounded-2xl border bg-card p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 transition-colors">
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
