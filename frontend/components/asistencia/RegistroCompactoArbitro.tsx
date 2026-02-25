"use client"

import { Arbitro, EstadoAsistencia } from "@/types/asistencia"
import React from "react"
import { CheckCircle, Clock, XCircle, MoreHorizontal } from "lucide-react"
import { toast } from "@/hooks/use-toast"

function initials(name?: string, surname?: string) {
    const a = (surname || "").trim().split(" ")[0] || ""
    const b = (name || "").trim().split(" ")[0] || ""
    return (a.charAt(0) + b.charAt(0)).toUpperCase()
}

export default function RegistroCompactoArbitro({
    arbitro,
    estado,
    onChange,
}: {
    arbitro: Arbitro
    estado: EstadoAsistencia
    onChange: (e: EstadoAsistencia, observaciones?: string) => void
}) {
    const [menuOpen, setMenuOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement | null>(null)
    const [obsOpen, setObsOpen] = React.useState(false)
    const [obsText, setObsText] = React.useState("")
    const [obsTarget, setObsTarget] = React.useState<EstadoAsistencia | null>(null)

    React.useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!menuRef.current) return
            if (!(e.target instanceof Node)) return
            if (!menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        if (menuOpen) document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [menuOpen])
    const displayName = `${(arbitro.apellidoPaterno || arbitro.apellido || "").split(" ")[0]} ${arbitro.nombres || arbitro.nombre || ""}`.trim()
    const dni = (arbitro as any).dni || (arbitro as any).codigoCODAR || "—"

    const btn = (value: EstadoAsistencia, label: string, cls: string, Icon?: any) => (
        <button
            onClick={() => {
                onChange(value)
                // Toast feedback
                if (value === 'presente') toast({ title: 'Presente', description: `${displayName} marcado como presente` })
                if (value === 'tardanza') toast({ title: 'Tardanza', description: `${displayName} marcado con tardanza` })
                if (value === 'ausente') toast({ title: 'Falta', description: `${displayName} marcado como ausente` })
            }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition transform ${estado === value ? cls + ' scale-105 ring-2 ring-offset-2 ring-blue-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}`}
            aria-pressed={estado === value}
            aria-label={`${label} - ${displayName}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="capitalize">{label}</span>
        </button>
    )

    return (
        <>
            <div className="p-3 hover:bg-slate-50 rounded-lg transition-shadow hover:shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-semibold text-sm shadow">{initials((arbitro.nombres || (arbitro as any).nombre), (arbitro.apellidoPaterno || (arbitro as any).apellido))}</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-medium text-sm">{displayName}</div>
                                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado === 'presente' ? 'bg-emerald-100 text-emerald-700' : estado === 'tardanza' ? 'bg-yellow-100 text-yellow-800' : estado === 'ausente' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'}`}>{estado}</div>
                            </div>
                            <div className="text-xs text-gray-500">DNI: {dni} • {arbitro.categoria || (arbitro as any).categoria || '—'}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {btn('presente', 'Presente', 'bg-emerald-600 text-white', CheckCircle)}
                        {btn('tardanza', 'Tardanza', 'bg-yellow-500 text-white', Clock)}
                        {btn('ausente', 'Falta', 'bg-gray-700 text-white', XCircle)}

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(v => !v)}
                                className="ml-1 px-3 py-1 rounded-full bg-white border text-sm inline-flex items-center gap-2"
                                aria-expanded={menuOpen}
                                aria-label="Más opciones"
                            >
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50 overflow-hidden">
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                                        onClick={() => { setObsTarget('justificado'); setObsOpen(true); setMenuOpen(false) }}
                                    >Justificado</button>
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                                        onClick={() => { setObsTarget('licencia'); setObsOpen(true); setMenuOpen(false) }}
                                    >Licencia</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {obsOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setObsOpen(false)} />
                    <div className="relative w-full sm:w-[420px] bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{obsTarget === 'justificado' ? 'Justificado' : 'Licencia'}</div>
                            <button className="text-sm text-gray-500" onClick={() => setObsOpen(false)}>Cerrar</button>
                        </div>
                        <textarea
                            value={obsText}
                            onChange={(e) => setObsText(e.target.value)}
                            placeholder="Observaciones (opcional)"
                            className="w-full min-h-[100px] border rounded-md p-2 text-sm shadow-sm"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <button className="px-3 py-2 rounded-md border" onClick={() => { setObsOpen(false); setObsText('') }}>Cancelar</button>
                            <button className="px-3 py-2 rounded-md bg-blue-600 text-white" onClick={() => {
                                if (obsTarget) {
                                    onChange(obsTarget, obsText)
                                    toast({ title: obsTarget === 'justificado' ? 'Justificado' : 'Licencia', description: obsText || 'Observaciones guardadas' })
                                }
                                setObsOpen(false)
                                setObsText("")
                                setObsTarget(null)
                            }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
