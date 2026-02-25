"use client"

import { useEffect, useState } from "react"
import {
    Users,
    UserCheck,
    Calendar,
    Trophy,
    Server,
    ChevronRight,
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
        <div className="space-y-14">
            <section className="border-b pb-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                    Comisión Departamental de Árbitros · Puno
                </p>

                <h1 className="text-2xl font-semibold text-slate-900 mt-1">
                    Sistema de Gestión Arbitral
                </h1>

                <p className="text-sm text-slate-600 max-w-3xl mt-2 leading-relaxed">
                    Plataforma institucional para la administración y supervisión arbitral.
                </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SystemStatus status={apiStatus} />
                <MetricCard label="Árbitros registrados" value="—" hint="Padrón oficial" />
                <MetricCard
                    label="Designaciones activas"
                    value="—"
                    hint="Semana en curso"
                />
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <ModuleCard
                    title="Árbitros"
                    description="Gestión del perfil profesional."
                    icon={Users}
                />
                <ModuleCard
                    title="Asistencia"
                    description="Control y estadísticas."
                    icon={UserCheck}
                    href="/dashboard/asistencia?new=1"
                />
                <ModuleCard
                    title="Designaciones"
                    description="Asignaciones oficiales."
                    icon={Calendar}
                />
                <ModuleCard
                    title="Campeonatos"
                    description="Gestión institucional."
                    icon={Trophy}
                />
            </section>
        </div>
    )
}

function SystemStatus({ status }: { status: ApiStatus }) {
    return (
        <div className="rounded-2xl border bg-white p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${status === "ok"
                        ? "bg-emerald-100 text-emerald-600"
                        : status === "error"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                >
                    <Server className="h-6 w-6" />
                </div>

                <div>
                    <p className="text-sm text-slate-500">Estado del sistema</p>
                    <p className="font-medium text-slate-900">
                        {status === "checking" && "Verificando conexión"}
                        {status === "ok" && "Sistema operativo"}
                        {status === "error" && "Backend no disponible"}
                    </p>
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    hint,
}: {
    label: string
    value: string
    hint: string
}) {
    return (
        <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">{value}</p>
            <p className="text-sm text-slate-600 mt-1">{hint}</p>
        </div>
    )
}

import Link from "next/link"

function ModuleCard({
    title,
    description,
    icon: Icon,
    href,
}: {
    title: string
    description: string
    icon: any
    href?: string
}) {
    const content = (
        <div className="group rounded-2xl border bg-white p-4 sm:p-6 hover:shadow-xl transition -mx-4 sm:mx-0 w-[calc(100vw-32px)] sm:w-auto">
            <div className="flex justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
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
