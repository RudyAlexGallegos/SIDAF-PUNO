"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Calendar, Users, MapPin, Clock, Shield, Edit2, CalendarDays, FileText, Award, Target } from "lucide-react"
import { useDataStore, type Campeonato } from "@/lib/data-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sidaf-backend.onrender.com/api"

export default function DetalleCampeonatoPage() {
    const params = useParams()
    const { equipos } = useDataStore()
    const [loading, setLoading] = useState(true)
    const [championship, setChampionship] = useState<Campeonato | null>(null)
    const [error, setError] = useState<string>("")

    const championshipId = params.id as string

    useEffect(() => {
        let active = true

        async function fetchChampionship() {
            try {
                setLoading(true)
                setError("")
                const res = await fetch(`${API_URL}/campeonato/${championshipId}`, { cache: "no-store" })
                if (!res.ok) throw new Error("Campeonato no encontrado")
                const data = await res.json()
                if (!active) return
                setChampionship({ ...data, id: String(data.id) })
            } catch (err: any) {
                if (!active) return
                console.error("Error cargando campeonato:", err)
                setChampionship(null)
                setError("No se pudo cargar el campeonato. Intenta nuevamente más tarde.")
            } finally {
                if (active) setLoading(false)
            }
        }

        fetchChampionship()
        return () => { active = false }
    }, [championshipId])

    const equiposParticipantes = championship?.equipos && Array.isArray(championship.equipos)
        ? equipos.filter(eq => championship.equipos.includes(Number(eq.id)))
        : []

    const getStatusBadge = (estado?: string) => {
        const e = estado?.toUpperCase()
        if (e === "ACTIVO") return <Badge className="bg-emerald-500 text-white border-0">Activo</Badge>
        if (e === "PROGRAMADO") return <Badge className="bg-sky-500 text-white border-0">Programado</Badge>
        if (e === "FINALIZADO") return <Badge className="bg-slate-500 text-white border-0">Finalizado</Badge>
        return <Badge variant="outline" className="border-slate-300 text-slate-600">{estado}</Badge>
    }

    const dias = (() => {
        if (!championship?.diasJuego) return []
        const d = typeof championship.diasJuego === "string" ? championship.diasJuego.split(",") : championship.diasJuego
        return (Array.isArray(d) ? d : []).map((x: string) => x.trim()).filter(Boolean)
    })()

    const etapas = (() => {
        if (!championship?.etapas) return []
        try { const p = JSON.parse(championship.etapas); return Array.isArray(p) ? p : [] } catch { return [] }
    })()

    /* Calcular duración */
    const duracionDias = championship?.fechaInicio && championship?.fechaFin
        ? Math.max(1, Math.ceil((new Date(championship.fechaFin).getTime() - new Date(championship.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)))
        : null

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                    <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
                    <div className="grid md:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />)}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-96 bg-slate-200 rounded-xl animate-pulse" />
                        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!championship) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-5">
                        <Trophy className="h-8 w-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Campeonato no encontrado</h2>
                    <p className="text-slate-500 mb-6">{error || "El campeonato que buscas no existe o ha sido eliminado."}</p>
                    <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                        <Link href="/dashboard/campeonatos">Volver a Campeonatos</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* ========== HERO ========== */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
                    <div className="absolute inset-0 pointer-events-none" aria-hidden>
                        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
                    </div>

                    <div className="relative px-6 sm:px-10 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard/campeonatos" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div className="h-8 w-px bg-white/20 hidden sm:block" />
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-lg">
                                        <Trophy className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{championship.nombre}</h1>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                                            {getStatusBadge(championship.estado)}
                                            <span className="text-slate-400">•</span>
                                            <span>{championship.categoria || "Sin categoría"}</span>
                                            {championship.tipo && (
                                                <>
                                                    <span className="text-slate-400">•</span>
                                                    <span>{championship.tipo}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900 border-0 shadow-lg">
                                    <Link href={`/dashboard/campeonatos/${championship.id}/editar`}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== STATS ========== */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Equipos" value={String(equiposParticipantes.length)} suffix="participantes" icon={<Users className="h-5 w-5" />} accent="blue" />
                    <StatCard title="Duración" value={duracionDias ? String(duracionDias) : "--"} suffix={duracionDias ? "días" : undefined} icon={<CalendarDays className="h-5 w-5" />} accent="emerald" />
                    <StatCard title="Etapas" value={String(etapas.length)} suffix="fases" icon={<Target className="h-5 w-5" />} accent="violet" />
                    <StatCard title="Estado" value={championship.estado || "--"} suffix="campeonato" icon={<Shield className="h-5 w-5" />} accent="amber" />
                </div>

                {/* ========== CONTENT GRID ========== */}
                <div className="grid gap-7 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-7">
                        <InfoCard title="Información General" icon={<Shield className="h-4 w-4" />} iconColor="text-slate-800">
                            <InfoGrid>
                                <InfoItem label="Nombre" value={championship.nombre} />
                                <InfoItem label="Categoría" value={championship.categoria || "No definida"} />
                                <InfoItem label="Nivel" value={<Badge className="bg-slate-900 text-white border-0">{championship.nivelDificultad || "Medio"}</Badge>} />
                                <InfoItem label="Formato" value={championship.formato || "No definido"} />
                            </InfoGrid>
                        </InfoCard>

                        <InfoCard title="Calendario" icon={<Calendar className="h-4 w-4" />} iconColor="text-slate-800">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Fecha Inicio</p>
                                    <p className="text-xl font-bold text-slate-900">{championship.fechaInicio || "No definida"}</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Fecha Fin</p>
                                    <p className="text-xl font-bold text-slate-900">{championship.fechaFin || "No definida"}</p>
                                </div>
                            </div>
                            {(championship.horaInicio || championship.horaFin) && (
                                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Horario</p>
                                    <p className="text-base font-semibold text-slate-900">
                                        {championship.horaInicio || "--:--"} — {championship.horaFin || "--:--"}
                                    </p>
                                </div>
                            )}
                            {dias.length > 0 && (
                                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Días de Juego</p>
                                    <div className="flex flex-wrap gap-2">
                                        {dias.map((dia: string) => (
                                            <span key={dia} className="inline-flex h-7 select-none items-center rounded-md bg-slate-900 px-2.5 text-xs font-medium text-white">
                                                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </InfoCard>

                        <InfoCard title={`Equipos Participantes (${equiposParticipantes.length})`} icon={<Users className="h-4 w-4" />} iconColor="text-slate-800">
                            {equiposParticipantes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-3">
                                        <Users className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">No hay equipos seleccionados para este campeonato</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {equiposParticipantes.map((equipo) => (
                                        <div key={equipo.id} className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">{equipo.nombre}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />{equipo.provincia || "Sin provincia"}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 border-slate-200 text-slate-700">
                                                {equipo.categoria?.includes("Primera") ? "1ª" : equipo.categoria?.includes("Segunda") ? "2ª" : equipo.categoria}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </InfoCard>

                        <InfoCard title="Etapas del Campeonato" icon={<Target className="h-4 w-4" />} iconColor="text-slate-800">
                            {etapas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-3">
                                        <Target className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">No hay etapas definidas</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {etapas.map((etapa: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold">
                                                {etapa.orden ?? index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">{etapa.nombre}</p>
                                                <p className="text-xs text-slate-500">Etapa {etapa.orden ?? index + 1}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </InfoCard>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-7">
                        <InfoCard title="Organización" icon={<MapPin className="h-4 w-4" />} iconColor="text-slate-800">
                            <div className="space-y-4">
                                <KV label="Organizador" value={championship.organizador || "No definido"} />
                                <KV label="Contacto" value={championship.contacto || "No definido"} />
                                <KV label="Provincia" value={championship.provincia || "No definida"} />
                                <KV label="Estadio" value={championship.estadio || "No definido"} />
                            </div>
                        </InfoCard>

                        <InfoCard title="Reglamentación" icon={<FileText className="h-4 w-4" />} iconColor="text-slate-800">
                            <div className="space-y-4">
                                {championship.reglas ? <KV label="Reglas" value={championship.reglas} block /> : null}
                                {championship.premios ? <KV label="Premios" value={championship.premios} block /> : null}
                                {championship.observaciones ? <KV label="Observaciones" value={championship.observaciones} block /> : null}
                                {!championship.reglas && !championship.premios && !championship.observaciones && (
                                    <p className="text-center py-6 text-sm text-slate-500">No hay información reglamentaria</p>
                                )}
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ===================== Small composition helpers ===================== */

function StatCard({ title, value, suffix, icon, accent }: { title: string; value: string; suffix?: string; icon: React.ReactNode; accent: "blue" | "emerald" | "violet" | "amber" }) {
    const map: Record<string, { bg: string; text: string; iconBg: string; iconText: string }> = {
        blue:   { bg: "bg-sky-50", text: "text-sky-700", iconBg: "bg-sky-100", iconText: "text-sky-700" },
        emerald:{ bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100", iconText: "text-emerald-700" },
        violet: { bg: "bg-violet-50", text: "text-violet-700", iconBg: "bg-violet-100", iconText: "text-violet-700" },
        amber:  { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100", iconText: "text-amber-700" },
    }
    const c = map[accent]
    return (
        <div className={`rounded-xl border border-slate-200 bg-white p-5 ${c.bg}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${c.text} mb-1`}>{title}</p>
                    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
                    {suffix && <p className={`text-xs mt-2 font-medium ${c.text}`}>{suffix}</p>}
                </div>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg} ${c.iconText}`}>{icon}</div>
            </div>
        </div>
    )
}

function InfoCard({ title, icon, iconColor, children }: { title: string; icon: React.ReactNode; iconColor?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
                <span className={iconColor}>{icon}</span>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">{children}</div>
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="pb-4 border-b border-slate-100 last:border-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
            <div className="text-sm text-slate-900">{value}</div>
        </div>
    )
}

function KV({ label, value, block }: { label: string; value: string; block?: boolean }) {
    return (
        <div className={block ? "" : "pb-3 border-b border-slate-100 last:border-0"}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
            {block ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md p-3">{value}</p>
            ) : (
                <p className="text-sm text-slate-900">{value}</p>
            )}
        </div>
    )
}
