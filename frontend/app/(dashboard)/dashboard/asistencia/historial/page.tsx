"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getAsistencias, getArbitros, updateAsistencia, deleteAsistencia, getStoredUser, type Asistencia, type Arbitro } from "@/services/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { BarChart3, Calendar, Clock, Edit, Eye, Search, Trash2, Trophy, Users, ArrowLeft, Download, Filter } from "lucide-react"

// Tipos para el ranking
interface ArbitroStats {
  id: string | number
  nombre: string
  apellido: string
  totalSesiones: number
  presentes: number
  ausentes: number
  tardanzas: number
  justificados: number
  licencias: number
  porcentajeAsistencia: number
}

// Obtener semana en formato "YYYY-Www" (año-semana)
function getWeekKey(fecha: string): string {
  if (!fecha) return ""
  try {
    const date = new Date(fecha)
    const year = date.getFullYear()
    // Calcular número de semana
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return `${year}-W${weekNo.toString().padStart(2, '0')}`
  } catch {
    return ""
  }
}

// Obtener rango de fechas de una semana
function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [year, week] = weekKey.split('-W').map(Number)
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const weekStart = simple
  if (dow <= 4) weekStart.setDate(simple.getDate() - simple.getDay() + 1)
  else weekStart.setDate(simple.getDate() + 8 - simple.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return { start: weekStart, end: weekEnd }
}

// Formatear fecha para mostrar
function formatDate(date: Date): string {
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Parsear observaciones JSON del registro de asistencia
function parseObservaciones(obs: string | undefined): Array<{ arbitroId: string; estado: string; horaRegistro: string; observaciones: string }> {
  if (!obs) return []
  try {
    const parsed = JSON.parse(obs)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export default function HistorialAsistenciaPage() {
  const router = useRouter()
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"historial" | "ranking">("historial")
  const [selectedAsistencia, setSelectedAsistencia] = useState<Asistencia | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Asistencia | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  
  // Estado para filtro de semana
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>("todas")
  const [semanasDisponibles, setSemanasDisponibles] = useState<string[]>([])

  useEffect(() => {
    const user = getStoredUser()
    setUsuario(user)
    
    // Solo ADMIN y PRESIDENCIA_CODAR pueden ver esta página
    if (user && user.rol !== "ADMIN" && user.rol !== "PRESIDENCIA_CODAR") {
      router.push("/dashboard/asistencia")
      return
    }

    async function fetchData() {
      try {
        const [asistenciasData, arbitrosData] = await Promise.all([
          getAsistencias(),
          getArbitros()
        ])
        setAsistencias(asistenciasData)
        setArbitros(arbitrosData)
        
        // Calcular semanas disponibles
        const weeks = new Set<string>()
        for (const asist of asistenciasData) {
          if (asist.fecha) {
            const week = getWeekKey(asist.fecha)
            if (week) weeks.add(week)
          }
        }
        const sortedWeeks = Array.from(weeks).sort().reverse()
        setSemanasDisponibles(sortedWeeks)
      } catch (err) {
        console.error("Error cargando datos:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  // Filtrar asistencias por búsqueda
  const filteredAsistencias = useMemo(() => {
    if (!search.trim()) return asistencias
    const q = search.toLowerCase()
    return asistencias.filter(a =>
      (a.actividad || "").toLowerCase().includes(q) ||
      (a.fecha || "").includes(q) ||
      (a.estado || "").toLowerCase().includes(q) ||
      (a.evento || "").toLowerCase().includes(q)
    )
  }, [asistencias, search])

  // Calcular ranking de árbitros
  const ranking: ArbitroStats[] = useMemo(() => {
    const statsMap: Record<string, ArbitroStats> = {}

    // Inicializar con todos los árbitros
    for (const arb of arbitros) {
      const id = String(arb.id)
      statsMap[id] = {
        id: arb.id as string | number,
        nombre: arb.nombre || "",
        apellido: arb.apellido || "",
        totalSesiones: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
        licencias: 0,
        porcentajeAsistencia: 0,
      }
    }

    // Procesar cada registro de asistencia
    for (const asist of asistencias) {
      const registros = parseObservaciones(asist.observaciones)
      for (const reg of registros) {
        const id = String(reg.arbitroId)
        if (!statsMap[id]) {
          statsMap[id] = {
            id: reg.arbitroId,
            nombre: "Árbitro",
            apellido: id,
            totalSesiones: 0,
            presentes: 0,
            ausentes: 0,
            tardanzas: 0,
            justificados: 0,
            licencias: 0,
            porcentajeAsistencia: 0,
          }
        }
        statsMap[id].totalSesiones++
        switch (reg.estado) {
          case "presente": statsMap[id].presentes++; break
          case "ausente": statsMap[id].ausentes++; break
          case "tardanza": statsMap[id].tardanzas++; break
          case "justificado": statsMap[id].justificados++; break
          case "licencia": statsMap[id].licencias++; break
        }
      }
    }

    // Calcular porcentaje
    return Object.values(statsMap)
      .map(s => ({
        ...s,
        porcentajeAsistencia: s.totalSesiones > 0
          ? Math.round(((s.presentes + s.tardanzas) / s.totalSesiones) * 100)
          : 0
      }))
      .sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia)
  }, [arbitros, asistencias])

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = asistencias.length
    let totalPresentes = 0
    let totalAusentes = 0
    let totalTardanzas = 0

    for (const asist of asistencias) {
      const registros = parseObservaciones(asist.observaciones)
      for (const reg of registros) {
        if (reg.estado === "presente") totalPresentes++
        else if (reg.estado === "ausente") totalAusentes++
        else if (reg.estado === "tardanza") totalTardanzas++
      }
    }

    return { total, totalPresentes, totalAusentes, totalTardanzas }
  }, [asistencias])

  // Editar asistencia
  async function handleSaveEdit() {
    if (!editData || !editData.id) return
    try {
      await updateAsistencia(editData.id, editData)
      setAsistencias(prev => prev.map(a => a.id === editData.id ? editData : a))
      setEditMode(false)
      setSelectedAsistencia(null)
      setEditData(null)
      toast({ title: "Asistencia actualizada", description: "Los cambios se guardaron correctamente" })
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar la asistencia", variant: "destructive" })
    }
  }

  // Eliminar asistencia
  async function handleDelete(id: number) {
    try {
      const ok = await deleteAsistencia(id)
      if (ok) {
        setAsistencias(prev => prev.filter(a => a.id !== id))
        setDeleteConfirm(null)
        toast({ title: "Eliminado", description: "El registro de asistencia fue eliminado" })
      }
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando historial de asistencias...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/asistencia")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Control de Asistencia
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Historial y Ranking de Asistencia</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza, edita y analiza los registros de asistencia de los árbitros
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">Sesiones registradas</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.totalPresentes}</div>
              <div className="text-xs text-gray-500">Total presentes</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">{stats.totalAusentes}</div>
              <div className="text-xs text-gray-500">Total ausentes</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.totalTardanzas}</div>
              <div className="text-xs text-gray-500">Total tardanzas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("historial")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "historial"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historial de Registros
          </span>
        </button>
        <button
          onClick={() => setTab("ranking")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "ranking"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking de Árbitros
          </span>
        </button>
      </div>

      {/* Tab: Historial */}
      {tab === "historial" && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por actividad, fecha, estado..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredAsistencias.length} registro{filteredAsistencias.length !== 1 ? "s" : ""}
            </div>
          </div>

          {filteredAsistencias.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No hay registros de asistencia</p>
              <p className="text-sm mt-1">Los registros aparecerán aquí cuando se finalicen sesiones de asistencia</p>
            </div>
          ) : (
            <div className="divide-y max-h-[60vh] overflow-auto">
              {filteredAsistencias.map((asist) => {
                const registros = parseObservaciones(asist.observaciones)
                const presentes = registros.filter(r => r.estado === "presente" || r.estado === "tardanza").length
                const ausentes = registros.filter(r => r.estado === "ausente").length
                const total = registros.length

                return (
                  <div key={asist.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {(asist.actividad || "").replace(/_/g, " ")}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            asist.estado === "completado"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}>
                            {asist.estado || "pendiente"}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">{asist.fecha}</span>
                          {asist.horaEntrada && (
                            <span className="ml-2 text-gray-400">
                              {new Date(asist.horaEntrada).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                              {asist.horaSalida && (
                                <> — {new Date(asist.horaSalida).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>Total: {total}</span>
                          <span className="text-emerald-600">? {presentes}</span>
                          <span className="text-rose-600">? {ausentes}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedAsistencia(asist); setEditMode(false) }}
                          className="p-2 rounded-lg border hover:bg-gray-100 transition"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => { setSelectedAsistencia(asist); setEditMode(true); setEditData({ ...asist }) }}
                          className="p-2 rounded-lg border hover:bg-blue-50 transition"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(asist.id!)}
                          className="p-2 rounded-lg border hover:bg-rose-50 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Ranking */}
      {tab === "ranking" && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Ranking de Asistencia por Árbitro
            </h2>
            <p className="text-xs text-gray-500 mt-1">Ordenado por porcentaje de asistencia (presentes + tardanzas)</p>
          </div>

          {ranking.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No hay datos de ranking</p>
              <p className="text-sm mt-1">Se necesitan registros de asistencia para generar el ranking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Árbitro</th>
                    <th className="px-4 py-3 text-center font-medium">Sesiones</th>
                    <th className="px-4 py-3 text-center font-medium">Presentes</th>
                    <th className="px-4 py-3 text-center font-medium">Tardanzas</th>
                    <th className="px-4 py-3 text-center font-medium">Ausentes</th>
                    <th className="px-4 py-3 text-center font-medium">Justificados</th>
                    <th className="px-4 py-3 text-center font-medium">% Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ranking.map((arb, idx) => (
                    <tr key={arb.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                          idx === 0 ? "bg-amber-100 text-amber-700" :
                          idx === 1 ? "bg-gray-200 text-gray-700" :
                          idx === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-50 text-gray-500"
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{arb.nombre} {arb.apellido}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{arb.totalSesiones}</td>
                      <td className="px-4 py-3 text-center text-emerald-600 font-medium">{arb.presentes}</td>
                      <td className="px-4 py-3 text-center text-amber-600">{arb.tardanzas}</td>
                      <td className="px-4 py-3 text-center text-rose-600">{arb.ausentes}</td>
                      <td className="px-4 py-3 text-center text-blue-600">{arb.justificados}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                arb.porcentajeAsistencia >= 80 ? "bg-emerald-500" :
                                arb.porcentajeAsistencia >= 50 ? "bg-amber-500" :
                                "bg-rose-500"
                              }`}
                              style={{ width: `${arb.porcentajeAsistencia}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm ${
                            arb.porcentajeAsistencia >= 80 ? "text-emerald-600" :
                            arb.porcentajeAsistencia >= 50 ? "text-amber-600" :
                            "text-rose-600"
                          }`}>
                            {arb.porcentajeAsistencia}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dialog: Ver/Editar Asistencia */}
      <Dialog open={!!selectedAsistencia} onOpenChange={(v) => { if (!v) { setSelectedAsistencia(null); setEditMode(false); setEditData(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editMode ? "Editar Registro de Asistencia" : "Detalle de Asistencia"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del registro" : "Información completa del registro"}
            </DialogDescription>
          </DialogHeader>

          {selectedAsistencia && (
            <div className="space-y-4 mt-2">
              {editMode && editData ? (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Actividad</label>
                    <select
                      value={editData.actividad || ""}
                      onChange={(e) => setEditData({ ...editData, actividad: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="analisis_partido">Análisis de partido</option>
                      <option value="preparacion_fisica">Preparación física</option>
                      <option value="reunion_ordinaria">Reunión ordinaria</option>
                      <option value="reunion_extraordinaria">Reunión extraordinaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                    <input
                      type="date"
                      value={editData.fecha || ""}
                      onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Estado</label>
                    <select
                      value={editData.estado || ""}
                      onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="completado">Completado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Evento / Descripción</label>
                    <input
                      type="text"
                      value={editData.evento || ""}
                      onChange={(e) => setEditData({ ...editData, evento: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Descripción del evento"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Actividad</div>
                      <div className="font-medium text-sm">{(selectedAsistencia.actividad || "").replace(/_/g, " ")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Fecha</div>
                      <div className="font-medium text-sm">{selectedAsistencia.fecha}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Hora Inicio</div>
                      <div className="font-medium text-sm">
                        {selectedAsistencia.horaEntrada
                          ? new Date(selectedAsistencia.horaEntrada).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Hora Fin</div>
                      <div className="font-medium text-sm">
                        {selectedAsistencia.horaSalida
                          ? new Date(selectedAsistencia.horaSalida).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Estado</div>
                      <div className={`font-medium text-sm ${
                        selectedAsistencia.estado === "completado" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {selectedAsistencia.estado}
                      </div>
                    </div>
                  </div>

                  {/* Detalle de árbitros */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Detalle de Árbitros</div>
                    <div className="max-h-48 overflow-auto border rounded-lg divide-y">
                      {parseObservaciones(selectedAsistencia.observaciones).map((reg, i) => {
                        const arb = arbitros.find(a => String(a.id) === String(reg.arbitroId))
                        return (
                          <div key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {arb ? `${arb.nombre} ${arb.apellido}` : `Árbitro #${reg.arbitroId}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              reg.estado === "presente" ? "bg-emerald-50 text-emerald-700" :
                              reg.estado === "tardanza" ? "bg-amber-50 text-amber-700" :
                              reg.estado === "ausente" ? "bg-rose-50 text-rose-700" :
                              reg.estado === "justificado" ? "bg-blue-50 text-blue-700" :
                              "bg-gray-50 text-gray-700"
                            }`}>
                              {reg.estado}
                            </span>
                          </div>
                        )
                      })}
                      {parseObservaciones(selectedAsistencia.observaciones).length === 0 && (
                        <div className="px-3 py-4 text-center text-gray-400 text-sm">Sin detalle de árbitros</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            {editMode ? (
              <>
                <button
                  onClick={() => { setEditMode(false); setEditData(null) }}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm ml-2"
                >
                  Guardar Cambios
                </button>
              </>
            ) : (
              <>
                <DialogClose asChild>
                  <button className="px-4 py-2 rounded-lg border text-sm">Cerrar</button>
                </DialogClose>
                <button
                  onClick={() => { setEditMode(true); setEditData({ ...selectedAsistencia! }) }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm ml-2"
                >
                  Editar
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar eliminación */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(v) => { if (!v) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar registro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el registro de asistencia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 rounded-lg border text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm ml-2"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




