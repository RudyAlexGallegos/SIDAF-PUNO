"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader,
  MapPin,
  Calendar,
  Users,
  Plus,
  Trash2,
  Lock,
  ClipboardList,
  Shield,
  UserCheck,
  AlertCircle,
  Clock,
  Search,
  X,
  Info,
  RotateCcw,
  Save,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getCampeonatos, type Campeonato, getArbitros, type Arbitro, getEquipos, type Equipo, createDesignacion, getCopaPeruResultados, saveCopaPeruResultadosBatch, getAsesores, type Asesor, getFechasUnicasPorCampeonato, getDesignacionesAnterioresByCampeonato, getCopaPeruProgreso, saveCopaPeruProgresoBatch, deleteCopaPeruProgreso, getDisponibilidadPorFecha, type DisponibilidadArbitro } from "@/services/api"
import { PROVINCIAS_PUNO, getDistritosByProvincia } from "@/lib/provincias-puno"
import { DatePicker, TimePicker } from "./components/DateTimePickers"

// 🔒 Resuelve la provincia real de un equipo a partir de su distrito (fuente de verdad:
// distrito capturado al crear el equipo). Evita la confusión "Puno" (Región / Provincia / Distrito).
// Si el distrito no está en el mapeo, hace fallback al campo provincia del equipo.
const resolverProvincia = (distrito?: string | null, provinciaFallback?: string | null): string | null => {
  if (distrito) {
    const provincia = PROVINCIAS_PUNO.find((p) => p.distritos.some((d) => d.nombre === distrito))
    if (provincia) return provincia.nombre
  }
  return provinciaFallback || null
}

interface Partido {
  id: string
  equipoLocal: Equipo
  equipoVisitante: Equipo
  arbitroPrincipal?: Arbitro | null
  asistente1?: Arbitro | null
  asistente2?: Arbitro | null
  cuartoArbitro?: Arbitro | null
  asesor?: Asesor | null
  estadio?: string
  fecha?: string
  hora?: string
}

interface DistritoCampeones {
  campeon: Equipo | null
  subcampeon: Equipo | null
}

interface EtapaState {
  etapas: {
    [key: string]: {
      completada: boolean
      desbloqueada: boolean
      error?: string
    }
  }
}

type Step = "campeonato" | "etapa" | "provincia" | "distrito" | "partidos" | "designar" | "resumen" | "confirmacion" | "designacionGeneral" | "resumenGeneral"

const ETAPAS = [
  "Etapa Distrital",
  "Etapa Provincial",
  "Etapa Departamental",
  "Etapa Nacional"
]

const STEPS_NORMAL = [
  { key: "campeonato", label: "Campeonato", shortLabel: "Campeonato" },
  { key: "provincia", label: "Provincia", shortLabel: "Provincia" },
  { key: "partidos", label: "Partidos", shortLabel: "Partidos" },
  { key: "designar", label: "Árbitros", shortLabel: "Árbitros" },
  { key: "resumen", label: "Resumen", shortLabel: "Resumen" },
  { key: "confirmacion", label: "Confirmar", shortLabel: "Confirmar" },
] as const

const STEPS_COPA = [
  { key: "campeonato", label: "Campeonato", shortLabel: "Campeonato" },
  { key: "etapa", label: "Etapa", shortLabel: "Etapa" },
  { key: "provincia", label: "Provincia", shortLabel: "Provincia" },
  { key: "distrito", label: "Distrito", shortLabel: "Distrito" },
  { key: "partidos", label: "Partidos", shortLabel: "Partidos" },
  { key: "designar", label: "Árbitros", shortLabel: "Árbitros" },
  { key: "confirmacion", label: "Confirmar", shortLabel: "Confirmar" },
] as const

const STEPS_FUNDAMENTAL = [
  { key: "campeonato", label: "Campeonato", shortLabel: "Campeonato" },
  { key: "designacionGeneral", label: "Designación", shortLabel: "Designación" },
  { key: "confirmacion", label: "Confirmar", shortLabel: "Confirmar" },
] as const

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function NuevaDesignacionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("campeonato")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Datos cargados
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [equiposReales, setEquiposReales] = useState<Equipo[]>([])
  
  // Selecciones del usuario
  const [campeonatoSeleccionado, setCampeonatoSeleccionado] = useState<Campeonato | null>(null)
  const [etapaSeleccionada, setEtapaSeleccionada] = useState<string | null>(null)
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string | null>(null)
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string | null>(null)

  const distritosDeProvinciaSeleccionada = useMemo(() => {
    if (!provinciaSeleccionada) return []
    return getDistritosByProvincia(provinciaSeleccionada).map(d => d.nombre)
  }, [provinciaSeleccionada])

  // 🔒 Distritos derivados de los equipos reales (fuente de verdad: campo distrito del equipo)
  const distritosProvincialesEquipos = useMemo(() => {
    if (campeonatoSeleccionado?.nombre !== "COPA PERÚ 2026" || !provinciaSeleccionada) return []
    const unicos = Array.from(
      new Set(
        equiposReales
          .filter((eq) => eq.distrito && resolverProvincia(eq.distrito, eq.provincia) === provinciaSeleccionada)
          .map((eq) => eq.distrito as string)
      )
    )
    return unicos
  }, [campeonatoSeleccionado, provinciaSeleccionada, equiposReales])

  const gruposCampeonatos = useMemo(() => {
    const copaPeru = campeonatos.filter((c) => c.nombre === "COPA PERÚ 2026")
    const fundamentales = campeonatos.filter((c) => c.categoria === "CAMPEONATO FUNDAMENTAL")
    const oficiales = campeonatos.filter((c) => c.categoria === "CAMPEONATO OFICIAL")
    const otros = campeonatos.filter(
      (c) => c.nombre !== "COPA PERÚ 2026" && c.categoria !== "CAMPEONATO FUNDAMENTAL" && c.categoria !== "CAMPEONATO OFICIAL",
    )
    return [
      { titulo: "COPA PERÚ 2026", icono: Lock, color: "red", campeonatos: copaPeru },
      { titulo: "Campeonatos Fundamentales", icono: Shield, color: "purple", campeonatos: fundamentales },
      { titulo: "Campeonatos Oficiales", icono: ClipboardList, color: "blue", campeonatos: oficiales },
      ...(otros.length > 0 ? [{ titulo: "Otros Campeonatos", icono: Trophy, color: "slate", campeonatos: otros }] : []),
    ].filter((g) => g.campeonatos.length > 0)
  }, [campeonatos])

  const colorClasses: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    red: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", badge: "bg-red-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", badge: "bg-purple-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", badge: "bg-blue-600" },
    slate: { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200", badge: "bg-slate-600" },
  }

  // Gestión de partidos
  const [equipoLocal, setEquipoLocal] = useState<Equipo | null>(null)
  const [equipoVisitante, setEquipoVisitante] = useState<Equipo | null>(null)
  const [partidos, setPartidos] = useState<Partido[]>([])

  // 🔐 SISTEMA DE DESBLOQUEO PROGRESIVO (SOLO COPA PERÚ 2026)
  const esCopaPeruActual = campeonatoSeleccionado?.nombre === "COPA PERÚ 2026"

// Campeones/subcampeones por distrito en etapa distrital
  const [distritoCampeones, setDistritoCampeones] = useState<Record<string, DistritoCampeones>>({})

  // Campeones/subcampeones por distrito en etapa provincial
  const [provinciaCampeones, setProvinciaCampeones] = useState<Record<string, DistritoCampeones>>({})

  // 🔒 Control: ¿Ya se guardaron los campeones provinciales en backend?
  const [provincialCampeonesFinalizados, setProvincialCampeonesFinalizados] = useState(false)

  // ✏️ Control: modo edición manual de campeones provinciales (para corregir después de completar)
  const [editandoProvincial, setEditandoProvincial] = useState(false)

  // 🔎 Búsqueda/filtro de distritos y equipos en la etapa provincial
  const [busquedaProvincial, setBusquedaProvincial] = useState("")

  // Distritos que no participan (se retiran)
  const [distritosNoParticipantes, setDistritosNoParticipantes] = useState<string[]>([])

   // Lista de asesores
   const [asesores, setAsesores] = useState<Asesor[]>([])

   // Fecha y hora para designación general (CAMPEONATO FUNDAMENTAL u OFICIAL)
   const [fechaGeneral, setFechaGeneral] = useState<string>("")
   const [horaGeneral, setHoraGeneral] = useState<string>("")
   const [intentadoContinuar, setIntentadoContinuar] = useState(false)

   // Modo de designación: manual, semiautomatica, automatica
   const [modoDesignacion, setModoDesignacion] = useState<"manual" | "semiautomatica" | "automatica">("manual")

   // 🔒 Disponibilidad centralizada de árbitros para la fecha seleccionada
   const [disponibilidadMap, setDisponibilidadMap] = useState<Record<number, DisponibilidadArbitro>>({})
   const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false)

    // Designaciones anteriores y fechas del campeonato
    const [designacionesAnteriores, setDesignacionesAnteriores] = useState<Designacion[]>([])
    const [loadingAnteriores, setLoadingAnteriores] = useState(false)
    const [fechasCampeonato, setFechasCampeonato] = useState<string[]>([])
    const [ultimaFechaCampeonato, setUltimaFechaCampeonato] = useState<string>("")

    // Conflictos y publicación
    const [conflictos, setConflictos] = useState<Designacion[]>([])
    const [validandoConflictos, setValidandoConflictos] = useState(false)
    const [publicando, setPublicando] = useState(false)

  // Estado de desbloqueo de etapas
  const [etapasState, setEtapasState] = useState<EtapaState>({
    etapas: {
      "Etapa Distrital": { completada: false, desbloqueada: true }, // Siempre desbloqueada
      "Etapa Provincial": { completada: false, desbloqueada: false },
      "Etapa Departamental": { completada: false, desbloqueada: false },
      "Etapa Nacional": { completada: false, desbloqueada: false },
    },
   })

  // Sincronización y persistencia del progreso COPA PERÚ (localStorage + backend)
  const getProgresoStorageKey = () => `copa-peru-progreso-${campeonatoSeleccionado?.id ?? "none"}`

  const cargarProgresoStorage = () => {
    if (typeof window === "undefined" || !campeonatoSeleccionado?.id) return null
    try {
      const raw = localStorage.getItem(getProgresoStorageKey())
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const guardarProgresoStorage = (data: any) => {
    if (typeof window === "undefined" || !campeonatoSeleccionado?.id) return
    try {
      localStorage.setItem(getProgresoStorageKey(), JSON.stringify(data))
    } catch {
      // sin permisos de almacenamiento
    }
  }

  const syncProgresoBackend = async () => {
    if (!campeonatoSeleccionado?.id || !esCopaPeruActual) return
    try {
      const payload: any[] = []
      Object.entries(etapasState.etapas).forEach(([etapa, estado]) => {
        payload.push({
          campeonatoId: campeonatoSeleccionado.id,
          etapa,
          provincia: provinciaSeleccionada ?? undefined,
          distrito: distritoSeleccionado ?? undefined,
          completada: estado.completada,
          desbloqueada: estado.desbloqueada,
        })
      })
      if (provinciaSeleccionada && esCopaPeruActual && etapaSeleccionada === "Etapa Provincial") {
        Object.entries(provinciaCampeones).forEach(([distrito, campeones]) => {
          payload.push({
            campeonatoId: campeonatoSeleccionado.id,
            etapa: "PROVINCIAL",
            provincia: provinciaSeleccionada,
            distrito,
            completada: !!campeones?.campeon,
            desbloqueada: true,
            campeonId: campeones?.campeon?.id,
            subcampeonId: campeones?.subcampeon?.id,
          })
        })
      }
      await saveCopaPeruProgresoBatch(payload)
    } catch (e) {
      console.warn("No se pudo sincronizar progreso con backend", e)
    }
  }

  // Restaurar progreso guardado al cambiar de campeonato o provincia
  useEffect(() => {
    if (!campeonatoSeleccionado?.id || !esCopaPeruActual) return
    const saved = cargarProgresoStorage()
    if (saved?.etapas) {
      setEtapasState({ etapas: saved.etapas })
    }
    if (saved?.provinciaCampeones && provinciaSeleccionada) {
      setProvinciaCampeones(saved.provinciaCampeones)
    }
    if (saved?.distritoCampeones && provinciaSeleccionada) {
      setDistritoCampeones(saved.distritoCampeones)
    }
  }, [campeonatoSeleccionado?.id, provinciaSeleccionada])

  // Guardar en localStorage y backend cuando cambia el estado de etapas o campeones
  useEffect(() => {
    if (!esCopaPeruActual || !campeonatoSeleccionado?.id) return
    guardarProgresoStorage({
      etapas: etapasState.etapas,
      provinciaCampeones,
      distritoCampeones,
      provinciaSeleccionada,
      distritoSeleccionado,
    })
    syncProgresoBackend()
  }, [etapasState, provinciaCampeones, distritoCampeones, provinciaSeleccionada, distritoSeleccionado, campeonatoSeleccionado?.id, esCopaPeruActual])

 // Árbitros asignados (para validar duplicados)
  const [arbitrosAsignados, setArbitrosAsignados] = useState<Record<string, Arbitro[]>>({})

  // Árbitros seleccionados (para CAMPEONATO FUNDAMENTAL)
  const [arbitrosSeleccionados, setArbitrosSeleccionados] = useState<Arbitro[]>([])

  // 🔍 Buscador y filtros del panel de disponibilidad (propuesta UX alternativa)
  const [busquedaArbitro, setBusquedaArbitro] = useState("")
  const [filtroArbitro, setFiltroArbitro] = useState<"todos" | "nacional" | "disponibles">("todos")

  // Lista de árbitros filtrada + ordenada (disponibles primero), compartida por ambos paneles.
  const arbitrosDisponiblesFiltrados = useMemo(() => {
    if (!arbitros) return []
    const q = busquedaArbitro.trim().toLowerCase()
    let lista = arbitros.filter((a) => {
      const nombre = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase()
      const coincideNombre = q === "" || nombre.includes(q)
      const esNacional = (a.categoria || "").toUpperCase() === "NACIONAL"
      const coincideFiltro =
        filtroArbitro === "todos" ||
        (filtroArbitro === "nacional" && esNacional) ||
        (filtroArbitro === "disponibles" && (a.id == null || disponibilidadMap[a.id]?.disponible !== false))
      return coincideNombre && coincideFiltro
    })
    // Orden: disponibles primero, luego ocupados (estables por nombre)
    lista = [...lista].sort((a, b) => {
      const occA = a.id != null && disponibilidadMap[a.id]?.disponible === false ? 1 : 0
      const occB = b.id != null && disponibilidadMap[b.id]?.disponible === false ? 1 : 0
      if (occA !== occB) return occA - occB
      return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
    })
    return lista
  }, [arbitros, busquedaArbitro, filtroArbitro, disponibilidadMap])

  // 🚫 Devuelve true si el árbitro ya está asignado en OTRO rol del mismo
  // partido o en CUALQUIER otro partido. Se usa para deshabilitar la opción
  // en los <select> y prevenir duplicados antes de validar (principio de restricción).
  const arbitroUsadoEn = (partidoIdx: number, arbId: number): boolean => {
    if (arbId == null) return false
    return partidos.some((p, i) => {
      if (i === partidoIdx) {
        // Mismo partido: conflicto solo si está en otro rol distinto al actual
        const roles = [p.arbitroPrincipal?.id, p.asistente1?.id, p.asistente2?.id, p.cuartoArbitro?.id]
        return roles.filter((id) => id != null && id !== arbId).includes(arbId)
      }
      // Otros partidos: conflicto si aparece en cualquier rol
      const roles = [p.arbitroPrincipal?.id, p.asistente1?.id, p.asistente2?.id, p.cuartoArbitro?.id]
      return roles.includes(arbId)
    })
  }

  // 🔒 Cargar disponibilidad centralizada cuando cambia la fecha de la designación general.
  // Regla: un árbitro designado (CONFIRMADA) en cualquier campeonato queda "No disponible"
  // ese día para nuevas designaciones. Aquí reflejamos ese bloqueo en tiempo real.
  useEffect(() => {
    let cancelado = false
    async function cargarDisponibilidad() {
      const dia = fechaGeneral ? fechaGeneral.substring(0, 10) : ""
      if (!dia) {
        setDisponibilidadMap({})
        return
      }
      try {
        setCargandoDisponibilidad(true)
        const data = await getDisponibilidadPorFecha(dia)
        if (cancelado) return
        const map: Record<number, DisponibilidadArbitro> = {}
        data.forEach((d) => { if (typeof d.arbitroId === "number") map[d.arbitroId] = d })
        setDisponibilidadMap(map)
        // Depurar selección: quitar árbitros que ya no están disponibles en la nueva fecha
        setArbitrosSeleccionados((prev) =>
          prev.filter((a) => a.id == null || map[a.id]?.disponible !== false)
        )
      } catch (error) {
        console.error("Error cargando disponibilidad:", error)
      } finally {
        if (!cancelado) setCargandoDisponibilidad(false)
      }
    }
    cargarDisponibilidad()
    return () => { cancelado = true }
  }, [fechaGeneral])

  // Detectar si es CAMPEONATO FUNDAMENTAL u OFICIAL
  const esCampeonatoFundamental = campeonatoSeleccionado?.categoria === "CAMPEONATO FUNDAMENTAL" || campeonatoSeleccionado?.categoria === "CAMPEONATO OFICIAL"

  // Obtener steps activos según el tipo de campeonato
  const activeSteps = esCopaPeruActual
    ? STEPS_COPA
    : esCampeonatoFundamental
      ? STEPS_FUNDAMENTAL
      : STEPS_NORMAL

  const currentStepIndex = activeSteps.findIndex((s) => s.key === currentStep)
  const progressPercentage = activeSteps.length > 0 ? ((currentStepIndex + 1) / activeSteps.length) * 100 : 0

// Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [campData, arbData, equiposData, asesoresData] = await Promise.all([
          getCampeonatos(),
          getArbitros(),
          getEquipos(),
          getAsesores(),
        ])
        setCampeonatos(campData)
        setArbitros(arbData)
        setEquiposReales(equiposData)
        setAsesores(asesoresData.filter((a: Asesor) => a.estado === "ACTIVO"))
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Cargar fechas y designaciones anteriores cuando se selecciona un campeonato
  useEffect(() => {
    if (!campeonatoSeleccionado?.id) return

    async function loadHistory() {
      try {
        setLoadingAnteriores(true)
        const [fechas, anteriores] = await Promise.all([
          getFechasUnicasPorCampeonato(campeonatoSeleccionado.id),
          getDesignacionesAnterioresByCampeonato(campeonatoSeleccionado.id, new Date().toISOString().split('T')[0]),
        ])
        setFechasCampeonato(fechas)
        setDesignacionesAnteriores(anteriores)
        if (fechas.length > 0) {
          setUltimaFechaCampeonato(fechas[fechas.length - 1])
        }
      } catch (error) {
        console.error("Error cargando historial:", error)
      } finally {
        setLoadingAnteriores(false)
      }
    }
    loadHistory()
  }, [campeonatoSeleccionado?.id])

  // ============================================================
  // 🔐 FUNCIONES DE VALIDACIÓN Y DESBLOQUEO
  // ============================================================

  const validarDistritosCompletos = (): boolean => {
    if (!esCopaPeruActual || etapaSeleccionada !== "Etapa Distrital") return true

    // Fuente de verdad: distritos reales de los equipos (campo distrito del equipo)
    const distritos = distritosProvincialesEquipos.length > 0
      ? distritosProvincialesEquipos
      : distritosDeProvinciaSeleccionada.length > 0
        ? distritosDeProvinciaSeleccionada
        : getDistritosByProvincia("Puno").map(d => d.nombre)

    // Todos los distritos deben tener al menos un campeón
    return distritos.every((distrito) => {
      const campeones = distritoCampeones[distrito]
      return campeones?.campeon !== null && campeones?.campeon !== undefined
    })
  }

  const obtenerDistritosPendientes = (): string[] => {
    if (!esCopaPeruActual) return []

    // Fuente de verdad: distritos reales de los equipos (campo distrito del equipo)
    const distritos = distritosProvincialesEquipos.length > 0
      ? distritosProvincialesEquipos
      : distritosDeProvinciaSeleccionada.length > 0
        ? distritosDeProvinciaSeleccionada
        : getDistritosByProvincia("Puno").map(d => d.nombre)

    return distritos.filter((distrito) => {
      const campeones = distritoCampeones[distrito]
      return !campeones?.campeon
    })
  }

const validarProvinciasCompletas = (): boolean => {
      if (!esCopaPeruActual) return true

      // En Etapa Provincial: todos los distritos deben tener campeón (subcampeón es opcional)
      // EXCEPTUANDO los distritos marcados como "no participantes"
      if (etapaSeleccionada === "Etapa Provincial") {
        // 🔒 Se valida SOLO la provincia seleccionada (el flujo es provincia por provincia).
        // Fuente de verdad: distritos reales de los equipos de esta provincia (campo distrito).
        const distritos = distritosProvincialesEquipos.length > 0
          ? distritosProvincialesEquipos
          : distritosDeProvinciaSeleccionada.length > 0
            ? distritosDeProvinciaSeleccionada
            : getDistritosByProvincia("Puno").map(d => d.nombre)
        return distritos.every((distrito) => {
          // Si el distrito está marcado como no participante, no requiere campeón
          if (distritosNoParticipantes.includes(distrito)) return true
          const campeones = provinciaCampeones[distrito]
          return campeones?.campeon !== null && campeones?.campeon !== undefined
        })
      }

      return true
    }

  // Toggle distrito como no participante
  const toggleDistritoParticipa = (distrito: string) => {
    setDistritosNoParticipantes(prev => {
      const nuevos = prev.includes(distrito)
        ? prev.filter(d => d !== distrito)
        : [...prev, distrito]
      // Si no participa, limpiar su selección
      if (prev.includes(distrito)) {
        setProvinciaCampeones((c) => {
          const nuevosC = { ...c }
          delete nuevosC[distrito]
          return nuevosC
        })
      }
      return nuevos
    })
  }

  const validarPartidosCompletos = (): boolean => {
    if (!partidos.length) return false

    return partidos.every((partido) => {
      return (
        partido.equipoLocal &&
        partido.equipoVisitante &&
        partido.arbitroPrincipal &&
        partido.asistente1 &&
        partido.asistente2 &&
        partido.cuartoArbitro
      )
    })
  }

  const validarEquipoNoRepetido = (equipoId: number): boolean => {
    // Un equipo no puede estar en múltiples partidos
    return !partidos.some(
      (p) => p.equipoLocal?.id === equipoId || p.equipoVisitante?.id === equipoId
    )
  }

  const validarArbitroNoRepetido = (arbitroId: number, partidoActualId: string): boolean => {
    // Un árbitro no puede estar en múltiples partidos simultáneamente
    return !partidos.some(
      (p) =>
        p.id !== partidoActualId &&
        (p.arbitroPrincipal?.id === arbitroId ||
          p.asistente1?.id === arbitroId ||
          p.asistente2?.id === arbitroId ||
          p.cuartoArbitro?.id === arbitroId ||
          p.asesor?.id === arbitroId)
    )
  }

const calcularEtapasDesbloqueadas = () => {
     if (!esCopaPeruActual) return

     const nuevasEtapas = { ...etapasState.etapas }

     // 🔒 Distrital se BLOQUEA cuando Provincial está guardado
     nuevasEtapas["Etapa Distrital"].desbloqueada = !provincialCampeonesFinalizados

     // Provincial se desbloquea si todos los distritos tienen campeón (En Etapa Distrital)
     if (validarDistritosCompletos()) {
       nuevasEtapas["Etapa Distrital"].completada = true
       nuevasEtapas["Etapa Provincial"].desbloqueada = true
     } else {
       nuevasEtapas["Etapa Provincial"].desbloqueada = false
     }

     // Departamental se desbloquea si los partidos están completos en Etapa Provincial
     if (
       etapaSeleccionada === "Etapa Provincial" &&
       validarPartidosCompletos()
     ) {
       nuevasEtapas["Etapa Provincial"].completada = true
       nuevasEtapas["Etapa Departamental"].desbloqueada = true
     }

     // Nacional se desbloquea si Departamental está completa
     if (
       etapaSeleccionada === "Etapa Departamental" &&
       validarPartidosCompletos()
     ) {
       nuevasEtapas["Etapa Departamental"].completada = true
       nuevasEtapas["Etapa Nacional"].desbloqueada = true
     }

     // Marcar provincial como completada si está finalizado
     if (provincialCampeonesFinalizados) {
       nuevasEtapas["Etapa Provincial"].completada = true
     }

     setEtapasState({ etapas: nuevasEtapas })
   }

// Recalcular desbloqueos cuando cambia el estado
   useEffect(() => {
     calcularEtapasDesbloqueadas()
   }, [distritoCampeones, provinciaCampeones, partidos, etapaSeleccionada, campeonatoSeleccionado, provincialCampeonesFinalizados, distritosProvincialesEquipos, provinciaSeleccionada])

// 🔒 Cargar resultados de etapa provincial guardados desde backend
    useEffect(() => {
      const loadProvincial = async () => {
        try {
          if (!campeonatoSeleccionado || !esCopaPeruActual) {
            setProvinciaCampeones({})
            setProvincialCampeonesFinalizados(false)
            return
          }

          // Sin provincia seleccionada aún: no evaluamos finalización ni cargamos campeones
          if (!provinciaSeleccionada) return

          const resultados = await getCopaPeruResultados(
            campeonatoSeleccionado.id as number,
            'PROVINCIAL',
            provinciaSeleccionada ?? undefined
          )

          // Filtrar por la provincia seleccionada (defensa si el backend no acota por provincia)
          const resultadosProvincia = resultados.filter((r: any) => {
            const eq = r.equipo || {}
            return (
              eq.provincia === provinciaSeleccionada ||
              resolverProvincia(eq.distrito, eq.provincia) === provinciaSeleccionada
            )
          })

          const mapping: Record<string, DistritoCampeones> = {}
          resultadosProvincia.forEach((r: any) => {
            const equipo = r.equipo || {}
            // En etapa provincial, los equipos están agrupados por distrito
            const distrito = equipo.distrito || 'Sin Distrito'
            if (!mapping[distrito]) mapping[distrito] = { campeon: null, subcampeon: null }
            const equipoObj: Equipo = { id: equipo.id, nombre: equipo.nombre, provincia: equipo.provincia, distrito: equipo.distrito }
            if (r.posicion === 1) mapping[distrito].campeon = equipoObj
            if (r.posicion === 2) mapping[distrito].subcampeon = equipoObj
          })
          // Solo actualizar si hay datos de ESTA provincia, sino preservar selecciones del usuario
          if (resultadosProvincia.length > 0) {
            setProvinciaCampeones(mapping)
          }

          // Verificar si todos los distritos de ESTA provincia tienen campeón asignado
            const distritos = distritosProvincialesEquipos.length > 0
              ? distritosProvincialesEquipos
              : distritosDeProvinciaSeleccionada.length > 0
                ? distritosDeProvinciaSeleccionada
                : getDistritosByProvincia("Puno").map(d => d.nombre)
            const todosTienenCampeon = distritos.every((distrito) => mapping[distrito]?.campeon)
            if (todosTienenCampeon && resultadosProvincia.length > 0) {
              setProvincialCampeonesFinalizados(true)
            } else {
              setProvincialCampeonesFinalizados(false)
            }
} catch (e) {
            console.warn('No se pudo cargar campeones provinciales desde backend', e)
            // No reseteamos - mantener la selección del usuario
          }
      }

      loadProvincial()
    }, [campeonatoSeleccionado, esCopaPeruActual, distritosProvincialesEquipos, provinciaSeleccionada])

   // 🔒 Autocompletar fecha y hora de la designación general desde datos del campeonato
    useEffect(() => {
      if (currentStep === "designacionGeneral" && campeonatoSeleccionado) {
        if (!fechaGeneral && campeonatoSeleccionado.fechaInicio) {
          setFechaGeneral(campeonatoSeleccionado.fechaInicio)
        }
        if (!horaGeneral && campeonatoSeleccionado.horaInicio) {
          const hora = campeonatoSeleccionado.horaInicio.includes(":")
            ? campeonatoSeleccionado.horaInicio.slice(0, 5)
            : campeonatoSeleccionado.horaInicio
          setHoraGeneral(hora)
        }
      }
    }, [currentStep, campeonatoSeleccionado, fechaGeneral, horaGeneral])

   // ✏️ Reset del modo edición y búsqueda al cambiar de provincia o etapa
   useEffect(() => {
     setEditandoProvincial(false)
     setBusquedaProvincial("")
   }, [provinciaSeleccionada, etapaSeleccionada])

   // 🔒 Cargar resultados de etapa distrital para detectar equipos participantes
   useEffect(() => {
     const loadDistrital = async () => {
       try {
         if (!campeonatoSeleccionado || !esCopaPeruActual) {
           setDistritoCampeones({})
           return
         }

         const resultados = await getCopaPeruResultados(campeonatoSeleccionado.id as number, 'DISTRITAL')
         const mapping: Record<string, DistritoCampeones> = {}
         resultados.forEach((r: any) => {
           const equipo = r.equipo || {}
           const distrito = equipo.distrito || 'Sin Distrito'
           if (!mapping[distrito]) mapping[distrito] = { campeon: null, subcampeon: null }
           const equipoObj: Equipo = { id: equipo.id, nombre: equipo.nombre, provincia: equipo.provincia, distrito: equipo.distrito }
if (r.posicion === 1) mapping[distrito].campeon = equipoObj
            if (r.posicion === 2) mapping[distrito].subcampeon = equipoObj
          })
          setDistritoCampeones(mapping)
       } catch (e) {
         console.warn('No se pudo cargar resultados distritales desde backend', e)
         setDistritoCampeones({})
       }
     }

     loadDistrital()
   }, [campeonatoSeleccionado, esCopaPeruActual])

   // 🔒 Detectar y bloquear etapa distrital automáticamente cuando provincial está guardado
   useEffect(() => {
     if (!campeonatoSeleccionado || !esCopaPeruActual) return

     // Si los campeones provinciales están finalizados, bloquear etapa distrital
     if (provincialCampeonesFinalizados) {
       setEtapasState(prev => ({
         etapas: {
           ...prev.etapas,
           "Etapa Distrital": { desbloqueada: false, completada: false }
         }
       }))
     }
   }, [provincialCampeonesFinalizados, campeonatoSeleccionado, esCopaPeruActual])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 text-lg">Cargando sistema de designación...</p>
        </div>
      </div>
    )
  }

  const getStepTitle = () => {
    if (currentStep === "campeonato") return "Selecciona un Campeonato"
    if (currentStep === "etapa") return "Etapas del Campeonato"
    if (currentStep === "provincia") return "Selecciona una Provincia"
    if (currentStep === "distrito") return "Selecciona un Distrito"
    if (currentStep === "partidos") return "Crea los Partidos"
    if (currentStep === "designar") return "Asigna los Árbitros"
    if (currentStep === "resumen") return "Revisa tu Designación"
    if (currentStep === "confirmacion") return "¡Designaciones Confirmadas!"
    if (currentStep === "designacionGeneral") return "Designar Árbitros"
    return ""
  }

  const getStepDescription = () => {
    if (currentStep === "campeonato") return "Paso 1 de 7"
    if (currentStep === "etapa") return "Paso 2 de 7"
    if (currentStep === "provincia") return "Paso 3 de 7"
    if (currentStep === "distrito") return "Paso 4 de 7"
    if (currentStep === "partidos") return "Paso 5 de 7"
    if (currentStep === "designar") return "Paso 6 de 7"
    if (currentStep === "resumen") return "Paso 5 de 6 · Revisa antes de confirmar"
    if (currentStep === "confirmacion") return "Completado"
    if (currentStep === "designacionGeneral") return "CAMPEONATO FUNDAMENTAL"
    return ""
  }

  const getBackStep = (): Step => {
    const idx = currentStepIndex
    if (idx > 0) return activeSteps[idx - 1].key as Step
    return "campeonato"
  }

  const canGoBack = currentStep !== "campeonato" && currentStep !== "confirmacion"

  // ============================================================
  // STEP INDICATOR / PROGRESS
  // ============================================================

  const renderStepIndicator = () => {
    if (currentStep === "confirmacion" || currentStep === "designacionGeneral") return null

    return (
      <div className="mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {activeSteps.map((step, idx) => {
              const isActive = idx === currentStepIndex
              const isCompleted = idx < currentStepIndex
              const isBlocked = esCopaPeruActual && !isCompleted && !isActive && idx > 0 && !etapasState.etapas[activeSteps[idx - 1].key === "distrito" ? "Etapa Distrital" : activeSteps[idx - 1].key === "provincia" ? "Etapa Provincial" : ""]?.desbloqueada
              const blockedReason = isBlocked ? (step.key === "distrito" ? "Completa la clasificación provincial primero" : step.key === "partidos" && etapaSeleccionada === "Etapa Provincial" ? "Selecciona los campeones de todos los distritos" : step.key === "designar" && etapaSeleccionada === "Etapa Departamental" ? "Guarda los resultados provinciales para continuar" : "Completa la etapa anterior") : null

              return (
                <div key={step.key} className="flex flex-col items-center flex-1" title={blockedReason || ""}>
                  <div className="text-xs font-medium text-slate-500 mb-1 hidden sm:block">{step.shortLabel}</div>
                  <div
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      isActive
                        ? "bg-blue-600 scale-125 shadow-md"
                        : isCompleted
                          ? "bg-emerald-500"
                          : isBlocked
                            ? "bg-red-500"
                            : "bg-gray-300"
                    }`}
                  />
                   {isBlocked && <Lock className="w-3 h-3 text-red-500 mt-1" />}
                   {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1" />}
                 </div>
               )
             })}
           </div>
           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
             <div
               className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out"
               style={{ width: `${progressPercentage}%` }}
             />
           </div>
         </div>
       </div>
     )
   }

   const getCoachTip = (): { title: string; body: string; icon: React.ReactNode } | null => {
     if (!esCopaPeruActual) return null
     switch (currentStep) {
       case "etapa":
         return {
           title: "Etapas del campeonato",
           body: "Cada etapa debe completarse en orden. Cuando todos los distritos tengan campeón, la etapa Distrital se marcará como completada y podrás continuar a Provincial.",
           icon: <Info className="w-4 h-4 text-blue-600" />,
         }
       case "provincia":
         return {
           title: "Selecciona la provincia",
           body: "Elige la provincia donde se jugarán los partidos. Esta selección define qué distritos y equipos estarán disponibles en los siguientes pasos.",
           icon: <MapPin className="w-4 h-4 text-cyan-600" />,
         }
       case "distrito":
         if (etapaSeleccionada === "Etapa Provincial") {
           return {
             title: "Clasificación Provincial",
             body: "Selecciona el campeón y subcampeón de cada distrito. Solo el campeón clasifica a la siguiente etapa. Puedes marcar distritos como 'No Participa' si no tienen equipos.",
             icon: <Trophy className="w-4 h-4 text-amber-600" />,
           }
         }
         return {
           title: "Selecciona el distrito",
           body: "Elige el distrito donde se jugará el partido. Los equipos disponibles se filtrarán automáticamente.",
           icon: <MapPin className="w-4 h-4 text-cyan-600" />,
         }
       case "partidos":
         return {
           title: "Crea los partidos",
           body: "Selecciona un equipo local y uno visitante para cada partido. Los equipos ya asignados aparecen deshabilitados para evitar duplicados.",
           icon: <Users className="w-4 h-4 text-purple-600" />,
         }
      case "designar":
        return {
          title: "Asigna los árbitros",
          body: "Cada partido requiere al menos Principal, Asistente 1 y Asistente 2. El Cuarto Árbitro y el Asesor son opcionales. Los árbitros no pueden repetirse entre partidos.",
          icon: <ClipboardList className="w-4 h-4 text-blue-600" />,
        }
      case "campeonato":
        return {
          title: "Selecciona el campeonato",
          body: "Elige el campeonato al que deseas asignar árbitros. COPA PERÚ 2026 es un campeonato protegido que requiere completar etapas en orden.",
          icon: <Trophy className="w-4 h-4 text-amber-600" />,
        }
      default:
        return null
    }
  }

  const renderCoach = () => {
    const tip = getCoachTip()
    if (!tip) return null
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {tip.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">{tip.title}</p>
              <p className="text-xs text-blue-800 mt-0.5">{tip.body}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ============================================================
  // STEP 1: CAMPEONATO
  // ============================================================

  if (currentStep === "campeonato") {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {renderStepIndicator()}

        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Designación
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-600" />
            {getStepTitle()}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">{getStepDescription()}</p>
        </section>

        <div className="flex justify-between items-center">
          <Link href="/dashboard/designaciones">
            <Button variant="outline" size="sm" className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver al Listado
            </Button>
          </Link>
        </div>

        {renderCoach()}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Selecciona el campeonato al que deseas asignar árbitros. Los campeonatos protegidos como <strong>COPA PERÚ 2026</strong> requieren completar etapas previas.
            </p>
          </CardContent>
        </Card>

        {/* Grid de campeonatos agrupados */}
        <div className="space-y-6 md:space-y-8">
          {gruposCampeonatos.map((grupo) => {
            const colors = colorClasses[grupo.color]
            return (
              <div key={grupo.titulo}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${colors.bg} ${colors.border} mb-4`}>
                  {(() => {
                    const Icono = grupo.icono
                    return <Icono className={`w-5 h-5 ${colors.text}`} />
                  })()}
                  <h3 className={`text-sm font-bold uppercase tracking-wide ${colors.text}`}>
                    {grupo.titulo}
                  </h3>
                  <Badge className={`${colors.badge} text-white text-xs ml-auto`}>
                    {grupo.campeonatos.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {grupo.campeonatos.map((camp) => {
                    const esCopaPeruProtegida = camp.nombre === "COPA PERÚ 2026"

                    return (
                      <Card
                        key={camp.id}
                        className={`h-full cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                          esCopaPeruProtegida ? "border-red-200 hover:border-red-300" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => {
                          setCampeonatoSeleccionado(camp)
                          setEtapaSeleccionada(null)
                          setProvinciaSeleccionada(null)
                          setDistritoSeleccionado(null)
                          setPartidos([])
                          setArbitrosSeleccionados([])
                          if (camp.nombre === "COPA PERÚ 2026") {
                            setCurrentStep("etapa")
                          } else if (camp.categoria === "CAMPEONATO FUNDAMENTAL" || camp.categoria === "CAMPEONATO OFICIAL") {
                            setCurrentStep("designacionGeneral")
                          } else {
                            setCurrentStep("provincia")
                          }
                        }}
                      >
                        <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
                              {esCopaPeruProtegida && (
                                <div title="Campeonato protegido">
                                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                                </div>
                              )}
                              {camp.categoria === "CAMPEONATO FUNDAMENTAL" && (
                                <Badge className="bg-purple-600 text-white text-xs">SIN REQUISITOS</Badge>
                              )}
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                              {camp.nombre}
                            </h3>

                            <div className="space-y-2 text-sm text-slate-600">
                              {camp.categoria && (
                                <p className="flex items-center gap-2">
                                  <Badge className="bg-blue-600 text-white">{camp.categoria}</Badge>
                                </p>
                              )}
                              {camp.numeroEquipos && (
                                <p className="flex items-center gap-2">
                                  <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                  {camp.numeroEquipos} equipos
                                </p>
                              )}
                              {camp.diasJuego && (() => {
                                const dias = camp.diasJuego.split(",").map(d => d.trim()).filter(Boolean)
                                if (dias.length === 0) return null
                                return (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {dias.map((dia) => (
                                      <span
                                        key={dia}
                                        className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                                        title={`Juega: ${dia}`}
                                      >
                                        {dia.slice(0, 3).toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                )
                              })()}
                              {(camp.horaInicio || camp.horaFin) && (
                                <p className="flex items-center gap-2 text-xs">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {camp.horaInicio || "??:??"}
                                  {camp.horaFin && <> - {camp.horaFin}</>}
                                  <span className="text-slate-400">hrs</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Badge className={`${
                              camp.estado === "ACTIVO"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-600 text-slate-200"
                            }`}>
                              {camp.estado || "Sin estado"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 2: ETAPA
  // ============================================================

  if (currentStep === "etapa" && campeonatoSeleccionado) {
    if (!esCopaPeruActual) {
      setCurrentStep("provincia")
      return null
    }

    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Etapas del Campeonato
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 2 de 7</p>
        </section>

          {/* Botón de retroceso */}
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep("campeonato")} className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cambiar Campeonato
            </Button>
          </div>

           {!esCopaPeruActual && typeof ultimaFechaCampeonato === "string" && ultimaFechaCampeonato && Array.isArray(designacionesAnteriores) && designacionesAnteriores.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Jornada anterior: {ultimaFechaCampeonato}
                </p>
                {loadingAnteriores ? (
                  <p className="text-xs text-amber-700">Cargando árbitros...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {designacionesAnteriores
                      .filter(d => d.fecha === ultimaFechaCampeonato)
                      .map((d, idx) => {
                        const arbPrincipal = arbitros.find((a) => a.id?.toString() === d.arbitroPrincipal?.toString())
                        const arbAsist1 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente1?.toString())
                        const arbAsist2 = arbitros.find((a) => a.id?.toString() === d.arbitroAsistente2?.toString())
                        const arbCuarto = arbitros.find((a) => a.id?.toString() === d.cuartoArbitro?.toString())

                        const getArbNombre = (arb: any) => arb ? `${arb.nombre || ""} ${arb.apellido || ""}`.trim() : "-"
                        const getArbCategoria = (arb: any) => arb?.categoria || ""

                        return (
                          <div key={d.id || idx} className="p-3 bg-white rounded-lg border border-amber-200">
                            <p className="text-xs font-bold text-slate-700 mb-1">Partido {idx + 1}</p>
                            <p className="text-xs text-slate-600">
                              Principal: <span className="font-semibold">{getArbNombre(arbPrincipal)}</span>
                            </p>
                            <p className="text-xs text-slate-600">
                              Asist. 1: <span className="font-semibold">{getArbNombre(arbAsist1)}</span>
                            </p>
                            <p className="text-xs text-slate-600">
                              Asist. 2: <span className="font-semibold">{getArbNombre(arbAsist2)}</span>
                            </p>
                            <p className="text-xs text-slate-600">
                              4to: <span className="font-semibold">{getArbNombre(arbCuarto)}</span>
                            </p>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* 🔐 ADVERTENCIA DE DESBLOQUEO (COPA PERÚ) */}
        {esCopaPeruActual && !validarDistritosCompletos() && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">
              ⚠️ Debes completar la <strong className="text-amber-700">Etapa Distrital</strong> seleccionando los campeones de todos los distritos para desbloquear las siguientes etapas.
            </p>
            {obtenerDistritosPendientes().length > 0 && (
              <p className="text-amber-600 text-xs mt-2">
                Distritos pendientes: <strong className="text-amber-700">{obtenerDistritosPendientes().join(", ")}</strong>
              </p>
            )}
          </div>
        )}

        {/* Grid de etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {ETAPAS.map((etapa) => {
            const estadoEtapa = esCopaPeruActual ? etapasState.etapas[etapa] : { desbloqueada: true, completada: false }
            const estaDesbloqueada = estadoEtapa?.desbloqueada ?? true
            const estaCompletada = estadoEtapa?.completada ?? false

            const etapaConfig = {
              "Etapa Distrital": {
                icon: MapPin,
                color: "orange",
                bgGradient: "from-orange-50 to-amber-50",
                borderColor: estaCompletada ? "border-emerald-300" : estaDesbloqueada ? "border-orange-200 hover:border-orange-300" : "border-gray-200",
                iconBg: estaCompletada ? "bg-emerald-100 text-emerald-600" : estaDesbloqueada ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400",
                titleColor: estaDesbloqueada ? "text-slate-900" : "text-slate-500",
              },
              "Etapa Provincial": {
                icon: Trophy,
                color: "amber",
                bgGradient: "from-amber-50 to-yellow-50",
                borderColor: estaCompletada ? "border-emerald-300" : estaDesbloqueada ? "border-amber-200 hover:border-amber-300" : "border-gray-200",
                iconBg: estaCompletada ? "bg-emerald-100 text-emerald-600" : estaDesbloqueada ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400",
                titleColor: estaDesbloqueada ? "text-slate-900" : "text-slate-500",
              },
              "Etapa Departamental": {
                icon: Shield,
                color: "purple",
                bgGradient: "from-purple-50 to-violet-50",
                borderColor: estaCompletada ? "border-emerald-300" : estaDesbloqueada ? "border-purple-200 hover:border-purple-300" : "border-gray-200",
                iconBg: estaCompletada ? "bg-emerald-100 text-emerald-600" : estaDesbloqueada ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400",
                titleColor: estaDesbloqueada ? "text-slate-900" : "text-slate-500",
              },
              "Etapa Nacional": {
                icon: Shield,
                color: "emerald",
                bgGradient: "from-emerald-50 to-teal-50",
                borderColor: estaCompletada ? "border-emerald-300" : estaDesbloqueada ? "border-emerald-200 hover:border-emerald-300" : "border-gray-200",
                iconBg: estaCompletada ? "bg-emerald-100 text-emerald-600" : estaDesbloqueada ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400",
                titleColor: estaDesbloqueada ? "text-slate-900" : "text-slate-500",
              },
            }

            const config = etapaConfig[etapa as keyof typeof etapaConfig] || etapaConfig["Etapa Distrital"]
            const IconComponent = config.icon

            return (
              <Card
                key={etapa}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${config.bgGradient} ${config.borderColor} ${
                  estaDesbloqueada ? "hover:scale-[1.02]" : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (estaDesbloqueada) {
                    setEtapaSeleccionada(etapa)
                    setProvinciaSeleccionada(null)
                    setDistritoSeleccionado(null)
                    setPartidos([])
                    if (etapa === "Etapa Distrital") {
                      setDistritoCampeones({})
                      setProvinciaCampeones({})
                    } else if (etapa === "Etapa Provincial") {
                      setProvinciaCampeones({})
                    }
                    setCurrentStep("provincia")
                  } else if (esCopaPeruActual) {
                    toast({
                      title: "🔒 Etapa Bloqueada",
                      description: `Debes completar etapas anteriores para acceder a "${etapa.replace("Etapa ", "")}"`,
                      variant: "destructive",
                    })
                  }
                }}
              >
                <CardContent className="p-6 h-full flex flex-col items-center justify-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.iconBg} transition-all duration-300 ${
                    estaDesbloqueada ? "shadow-md" : ""
                  }`}>
                    {estaCompletada ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : estaDesbloqueada ? (
                      <IconComponent className="w-7 h-7" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`text-base md:text-lg font-bold ${config.titleColor} transition-colors`}>
                      {etapa.replace("Etapa ", "")}
                    </h3>
                    {!estaDesbloqueada && esCopaPeruActual && (
                      <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1 justify-center">
                        <Lock className="w-3 h-3" />
                        Bloqueada
                      </p>
                    )}
                    {estaCompletada && esCopaPeruActual && (
                      <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-3 h-3" />
                        Completada
                      </p>
                    )}
                    {estaDesbloqueada && !estaCompletada && esCopaPeruActual && (
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Disponible
                      </p>
                    )}
                  </div>
                  {estaDesbloqueada && !estaCompletada && (
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 3: PROVINCIA
  // ============================================================

  if (currentStep === "provincia" && campeonatoSeleccionado && etapaSeleccionada) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        {renderStepIndicator()}

        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-cyan-600" />
            {getStepTitle()}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">{getStepDescription()}</p>
        </section>

          {/* Botón de retroceso */}
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep("campeonato")} className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cambiar Campeonato
            </Button>
          </div>

          {renderCoach()}

          {esCopaPeruActual && (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Progreso de etapas · COPA PERÚ 2026</p>
                    <div className="flex flex-wrap gap-2">
                      {ETAPAS.map((etapa) => {
                        const estado = etapasState.etapas[etapa]
                        return (
                          <span
                            key={etapa}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                              estado.desbloqueada
                                ? estado.completada
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {estado.completada ? "✅" : estado.desbloqueada ? "🔄" : "🔒"}
                            {etapa.replace("Etapa ", "")}
                          </span>
                        )
                      })}
                    </div>
                    {!validarDistritosCompletos() && (
                      <p className="text-xs text-red-700 mt-2">
                        Distritos pendientes: <strong>{obtenerDistritosPendientes().join(", ")}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="p-4">
            <p className="text-sm text-cyan-800">
              Selecciona la provincia donde se jugarán los partidos para continuar con la designación.
            </p>
          </CardContent>
        </Card>

        {/* Grid de provincias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVINCIAS_PUNO.map((prov) => (
            <Card
              key={prov.nombre}
              className="h-24 cursor-pointer border-2 border-gray-200 bg-card transition-all duration-200 hover:shadow-md hover:border-blue-300"
              onClick={() => {
                setProvinciaSeleccionada(prov.nombre)
                if (esCopaPeruActual) {
                  setCurrentStep("distrito")
                } else {
                  setCurrentStep("partidos")
                }
              }}
            >
              <CardContent className="text-center p-4 h-full flex items-center justify-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  {prov.nombre}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 4: DISTRITO
  // ============================================================

  if (currentStep === "distrito" && provinciaSeleccionada) {
    if (!esCopaPeruActual) {
      setCurrentStep("partidos")
      return null
    }

    const esEtapaProvincial = etapaSeleccionada === "Etapa Provincial"
    // 🔒 Fuente de verdad: provincia resuelta desde el DISTRITO del equipo (no el campo provincia,
    // poco confiable por la confusión Puno Región/Provincia/Distrito).
    const equiposFiltrados = equiposReales.filter(
      (eq) => resolverProvincia(eq.distrito, eq.provincia) === provinciaSeleccionada
    )

    // 🔒 Fuente de verdad: distritos reales de los equipos (campo distrito del equipo)
    const distritosAMostrar = distritosProvincialesEquipos.length > 0
      ? distritosProvincialesEquipos
      : distritosDeProvinciaSeleccionada

    // VISTA PARA ETAPA PROVINCIAL CON SELECTORES DE CAMPEONES
    if (esEtapaProvincial && esCopaPeruActual) {
      // Si ya hay campeones guardados, mostrar lista de equipos participantes (solo de ESTA provincia)
      const equiposParticipantes = Object.entries(provinciaCampeones || {})
        .filter(([distrito]) => distritosAMostrar.includes(distrito))
        .flatMap(([distrito, c]: [string, any]) => {
        const participantes: any[] = []
        if (c?.campeon) {
          participantes.push({ ...c.campeon, tipo: "Campeón" })
        }
        if (c?.subcampeon) {
          participantes.push({ ...c.subcampeon, tipo: "Subcampeón" })
        }
        return participantes
       }).filter(Boolean)
       
      // Provincia real de los equipos participantes (resuelta desde el distrito capturado al crear el equipo)
      const provinciaRealParticipantes = (() => {
        const provs = equiposParticipantes
          .map((e: any) => resolverProvincia(e.distrito, e.provincia))
          .filter(Boolean) as string[]
        const unicas = Array.from(new Set(provs))
        return unicas.length === 1 ? unicas[0] : null
      })()

      // 🔒 La vista de SOLO LECTURA ("Equipos Participantes") aparece automáticamente en cuanto
      // TODOS los distritos de la provincia tienen campeón seleccionado (validarProvinciasCompletas),
      // o cuando ya fueron finalizados/guardados en backend. Así el usuario no vuelve a seleccionar
      // los campeones cada vez. El modo edición (editandoProvincial) fuerza mostrar los selectores.
      const provincialCompleto = validarProvinciasCompletas()
      if (!editandoProvincial && (provincialCampeonesFinalizados || provincialCompleto) && equiposParticipantes.length > 0) {
        return (
          <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <section className="border-b pb-3 md:pb-4">
              <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
                 {campeonatoSeleccionado?.nombre} · {provinciaRealParticipantes ?? provinciaSeleccionada}
              </p>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
                Equipos Participantes
              </h1>
              <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 4 de 7 • Campeones ya seleccionados</p>
            </section>

            {/* Botón de retroceso */}
            <div className="flex justify-start">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep("provincia")} className="border-gray-200">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Cambiar Provincia
              </Button>
            </div>

            {renderCoach()}

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-green-800">
                  ✅ Todos los distritos tienen campeón seleccionado. Estos son los equipos que clasifican a la siguiente etapa.
                </p>
              </CardContent>
            </Card>

            {/* Lista de equipos participantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equiposParticipantes.map((equipo: any, idx: number) => {
                const esCampeon = equipo.tipo === "Campeón"
                return (
                  <Card
                    key={`${equipo.nombre}-${idx}`}
                    className={`border-2 transition-all duration-200 hover:shadow-lg ${
                      esCampeon
                        ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50"
                        : "border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50"
                    }`}
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          esCampeon
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {esCampeon ? (
                            <Trophy className="w-5 h-5" />
                          ) : (
                            <Shield className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {equipo.nombre}
                            </h3>
                            <Badge
                              className={`text-[10px] font-semibold border ${
                                esCampeon
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {esCampeon ? "🥇 Campeón" : "🥈 Subcampeón"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {equipo.distrito || "Sin distrito"}
                            </span>
                            {resolverProvincia(equipo.distrito, equipo.provincia) && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {resolverProvincia(equipo.distrito, equipo.provincia)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Botón de avance */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("provincia")}
                className="flex-1 border-gray-200 text-slate-700 hover:bg-gray-50"
              >
                ← Atrás
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditandoProvincial(true)
                  setProvincialCampeonesFinalizados(false)
                }}
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                ✏️ Editar campeones
              </Button>
              <Button
                onClick={async () => {
                  if (!provincialCampeonesFinalizados && campeonatoSeleccionado) {
                    // Guardar en backend antes de continuar
                    const resultados: any[] = []
                    Object.entries(provinciaCampeones).forEach(([distrito, campeones]: [string, any]) => {
                      if (campeones.campeon && campeones.campeon.id !== undefined) {
                        resultados.push({
                          campeonatoId: campeonatoSeleccionado.id,
                          etapa: 'PROVINCIAL',
                          equipoId: campeones.campeon.id,
                          posicion: 1
                        })
                      }
                      if (campeones.subcampeon && campeones.subcampeon.id !== undefined) {
                        resultados.push({
                          campeonatoId: campeonatoSeleccionado.id,
                          etapa: 'PROVINCIAL',
                          equipoId: campeones.subcampeon.id,
                          posicion: 2
                        })
                      }
                    })
                    if (resultados.length > 0) {
                      await saveCopaPeruResultadosBatch(resultados)
                      setProvincialCampeonesFinalizados(true)
                    }
                  }
                  setCurrentStep("partidos")
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                ✅ Continuar a Partidos →
              </Button>
            </div>
          </div>
        )
      }

      // 🔎 Distritos visibles según búsqueda (filtrando por nombre de distrito o de equipo)
      const qProv = busquedaProvincial.trim().toLowerCase()
      const distritosVisiblesProv = qProv
        ? distritosAMostrar.filter((d) => {
            if (d.toLowerCase().includes(qProv)) return true
            return equiposFiltrados.some(
              (eq) => eq.distrito === d && eq.nombre.toLowerCase().includes(qProv)
            )
          })
        : distritosAMostrar

      // 📊 Progreso por distrito (fuente: distritos reales de esta provincia)
      const totalDistritos = distritosAMostrar.length
      const distritosCompletados = distritosAMostrar.filter(
        (d) => distritosNoParticipantes.includes(d) || provinciaCampeones[d]?.campeon
      ).length
      const porcentajeCompletado =
        totalDistritos > 0 ? Math.round((distritosCompletados / totalDistritos) * 100) : 0
      const primerPendiente = distritosAMostrar.find(
        (d) => !distritosNoParticipantes.includes(d) && !provinciaCampeones[d]?.campeon
      )

      return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <section className="border-b pb-3 md:pb-4">
            <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
              {campeonatoSeleccionado?.nombre} · {provinciaSeleccionada}
            </p>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
              Clasificación Provincial
            </h1>
            <p className="text-slate-500 mt-2 text-xs md:text-sm">Selecciona campeones y subcampeones • Paso 4 de 7</p>
          </section>

          {/* Botón de retroceso */}
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep("provincia")} className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cambiar Provincia
            </Button>
          </div>

          {renderCoach()}

          {/* 🔎 BÚSQUEDA Y FILTRO */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busquedaProvincial}
              onChange={(e) => setBusquedaProvincial(e.target.value)}
              placeholder="Buscar distrito o equipo..."
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            {busquedaProvincial && (
              <button
                onClick={() => setBusquedaProvincial("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 📊 BARRA DE PROGRESO POR DISTRITO */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 animate-in fade-in duration-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-900">
                  Progreso de la provincia
                </p>
                <p className="text-sm font-bold text-blue-900">
                  {distritosCompletados} / {totalDistritos} distritos
                </p>
              </div>
              <div className="h-3 bg-white/70 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 ease-out"
                  style={{ width: `${porcentajeCompletado}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {porcentajeCompletado === 100
                  ? "✅ ¡Todos los distritos tienen campeón!"
                  : `Falta elegir el campeón de ${totalDistritos - distritosCompletados} distrito(s).`}
              </p>
            </CardContent>
          </Card>

          {/* CARD POR DISTRITO */}
          <div className="space-y-4">
{distritosVisiblesProv.map((distrito) => {
                // 🔒 Fuente de verdad: el campo distrito del equipo (sin fallback a toda la provincia)
                const equiposDelDistrito = equiposFiltrados.filter((eq) => eq.distrito === distrito)
                const campeones = provinciaCampeones[distrito] ?? { campeon: null, subcampeon: null }
               const tieneCompletado = !!campeones?.campeon
               const noParticipa = distritosNoParticipantes.includes(distrito)
               const esSiguiente = !noParticipa && !tieneCompletado && primerPendiente === distrito

               // Equipos a mostrar según búsqueda (si busca, filtra por nombre de equipo)
               const equiposAMostrar = qProv
                 ? equiposDelDistrito.filter((eq) => eq.nombre.toLowerCase().includes(qProv) || distrito.toLowerCase().includes(qProv))
                 : equiposDelDistrito

              return (
                <Card
                  key={distrito}
                  id={`distrito-${distrito}`}
                  className={`border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                    noParticipa
                      ? "border-slate-300 bg-slate-50"
                      : esSiguiente
                        ? "border-cyan-400 bg-cyan-50/40 ring-2 ring-cyan-200"
                        : tieneCompletado
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-gray-200 bg-card"
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-lg font-bold ${
                          noParticipa ? "text-slate-500 line-through" : "text-slate-900"
                        }`}>{distrito}</h3>
                        {noParticipa && (
                          <Badge className="bg-slate-400 text-white text-xs">NO PARTICIPA</Badge>
                        )}
                        {tieneCompletado && !noParticipa && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in duration-300" />
                        )}
                        {esSiguiente && (
                          <Badge className="bg-cyan-500 text-white text-xs animate-pulse">👉 SIGUIENTE</Badge>
                        )}
                      </div>
                      {/* Botón NO PARTICIPA */}
                      <Button
                        type="button"
                        variant={noParticipa ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDistritoParticipa(distrito)}
                        className={`text-xs ${
                          noParticipa
                            ? "bg-slate-600 text-white hover:bg-slate-700"
                            : "border-slate-300 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {noParticipa ? "✓ Participa" : "No Participa"}
                      </Button>
                    </div>

                    {/* TARJETAS CLICABLES DE EQUIPOS - OCULTAS SI NO PARTICIPA */}
                    {!noParticipa && (equiposAMostrar.length > 0 ? (
                      <div className="space-y-4">
                        {/* CAMPEÓN (OBLIGATORIO) */}
                        <div>
                          <p className="block text-sm font-semibold text-amber-700 mb-2">
                            🥇 Equipo Campeón *{" "}
                            {campeones.campeon && (
                              <span className="text-emerald-600 font-bold">· {campeones.campeon.nombre}</span>
                            )}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {equiposAMostrar
                              .filter(eq => eq.id != null)
                              .map((eq) => {
                                const activo = campeones.campeon?.id === eq.id
                                return (
                                  <button
                                    key={eq.id}
                                    type="button"
                                    onClick={() => {
                                      const eraActivo = campeones.campeon?.id === eq.id
                                      setProvinciaCampeones(prev => ({
                                        ...prev,
                                        [distrito]: {
                                          campeon: eraActivo ? null : eq,
                                          subcampeon: prev[distrito]?.subcampeon ?? null,
                                        },
                                      }))
                                      if (eraActivo) {
                                        toast({ title: `Campeón de ${distrito} deseleccionado` })
                                      } else {
                                        toast({ title: `🥇 ${eq.nombre} · Campeón de ${distrito}`, description: "Selecciona el subcampeón (opcional)." })
                                        const siguiente = distritosAMostrar.find(
                                          (d) => d !== distrito && !distritosNoParticipantes.includes(d) && !provinciaCampeones[d]?.campeon
                                        )
                                        if (siguiente) {
                                          setTimeout(() => {
                                            document.getElementById(`distrito-${siguiente}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
                                          }, 350)
                                        }
                                      }
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all text-left text-sm font-semibold active:scale-95 ${
                                      activo
                                        ? "border-amber-500 bg-amber-600 text-white shadow-md"
                                        : "border-gray-200 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50"
                                    }`}
                                  >
                                    {eq.nombre}
                                    <span className="text-[10px] block text-slate-400 truncate">{eq.distrito || "Sin distrito"}</span>
                                  </button>
                                )
                              })}
                          </div>
                        </div>

                        {/* SUBCAMPEÓN (OPCIONAL) */}
                        <div>
                          <p className="block text-sm font-semibold text-blue-700 mb-2">
                            🥈 Equipo Subcampeón (Opcional){" "}
                            {campeones.subcampeon && (
                              <span className="text-emerald-600 font-bold">· {campeones.subcampeon.nombre}</span>
                            )}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {equiposAMostrar
                              .filter(eq => eq.id != null && eq.id !== campeones.campeon?.id)
                              .map((eq) => {
                                const activo = campeones.subcampeon?.id === eq.id
                                return (
                                  <button
                                    key={eq.id}
                                    type="button"
                                    onClick={() => {
                                      const eraActivo = campeones.subcampeon?.id === eq.id
                                      setProvinciaCampeones(prev => ({
                                        ...prev,
                                        [distrito]: {
                                          campeon: prev[distrito]?.campeon ?? null,
                                          subcampeon: eraActivo ? null : eq,
                                        },
                                      }))
                                      toast({
                                        title: eraActivo
                                          ? `Subcampeón de ${distrito} deseleccionado`
                                          : `🥈 ${eq.nombre} · Subcampeón de ${distrito}`,
                                      })
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all text-left text-sm font-semibold active:scale-95 ${
                                      activo
                                        ? "border-blue-500 bg-blue-600 text-white shadow-md"
                                        : "border-gray-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                  >
                                    {eq.nombre}
                                    <span className="text-[10px] block text-slate-400 truncate">{eq.distrito || "Sin distrito"}</span>
                                  </button>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No hay equipos registrados en este distrito.</p>
                    ))}
                  </CardContent>
                </Card>
              )
            })}

            {distritosVisiblesProv.length === 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <p className="text-sm text-slate-500">No se encontraron distritos ni equipos para "{busquedaProvincial}".</p>
              </div>
            )}

            {/* BOTÓN DE AVANCE */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("provincia")}
                className="flex-1 border-gray-200 text-slate-700 hover:bg-gray-50"
              >
                ← Atrás
              </Button>
              {editandoProvincial && validarProvinciasCompletas() && (
                <Button
                  variant="outline"
                  onClick={() => setEditandoProvincial(false)}
                  className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  👀 Ver equipos participantes
                </Button>
              )}
              <Button
                onClick={async () => {
                  // Guardar campeones provinciales antes de continuar
                  if (campeonatoSeleccionado && esCopaPeruActual && etapaSeleccionada === "Etapa Provincial") {
                    try {
                      const resultados: any[] = []
                      Object.entries(provinciaCampeones).forEach(([distrito, campeones]) => {
                        if (campeones.campeon) {
                          resultados.push({
                            campeonatoId: campeonatoSeleccionado.id,
                            etapa: 'PROVINCIAL',
                            equipoId: campeones.campeon.id,
                            posicion: 1
                          })
                        }
                        if (campeones.subcampeon) {
                          resultados.push({
                            campeonatoId: campeonatoSeleccionado.id,
                            etapa: 'PROVINCIAL',
                            equipoId: campeones.subcampeon.id,
                            posicion: 2
                          })
                        }
                      })
                      if (resultados.length > 0) {
                        await saveCopaPeruResultadosBatch(resultados)
                        setProvincialCampeonesFinalizados(true)
                      }
                    } catch (error) {
                      console.error("Error guardando campeones provinciales:", error)
                    }
                  }
                  setCurrentStep("partidos")
                }}
                disabled={!validarProvinciasCompletas()}
                className={`flex-1 ${
                  validarProvinciasCompletas()
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-slate-300 cursor-not-allowed opacity-50"
                }`}
              >
                ✅ Continuar a Partidos →
              </Button>
            </div>

            {!validarProvinciasCompletas() && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
                <p className="text-red-800 text-sm">
                  ⛔ Debes seleccionar el campeón de <strong>todos los distritos</strong> para continuar.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    // VISTA POR DEFECTO (ETAPA DISTRITAL - SIN SELECTORES)
    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado?.nombre} · {provinciaSeleccionada}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-cyan-600" />
            Distritos de {provinciaSeleccionada}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 4 de 7</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("provincia")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Provincia
          </Button>
        </div>

        {/* Grid de distritos (fuente de verdad: campo distrito del equipo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {distritosAMostrar.map((distrito) => {
            const cantidadEquipos = equiposFiltrados.filter((eq) => eq.distrito === distrito).length
            return (
            <Card
              key={distrito}
              className="h-24 cursor-pointer border-2 border-gray-200 bg-card transition-all duration-200 hover:shadow-md hover:border-blue-300 flex items-center justify-center"
              onClick={() => {
                setDistritoSeleccionado(distrito)
                setCurrentStep("partidos")
              }}
            >
              <CardContent className="text-center p-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {distrito}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {cantidadEquipos} equipo(s)
                </p>
              </CardContent>
            </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 5: CREAR PARTIDOS
  // ============================================================

  if (currentStep === "partidos" && (distritoSeleccionado || provinciaSeleccionada)) {
    // 🔒 Filtrar equipos disponibles según el contexto
    let equiposDisponibles: Equipo[] = equiposReales
    if (distritoSeleccionado) {
      // 1. Etapa Distrital: mostrar solo equipos del distrito seleccionado
      equiposDisponibles = equiposReales.filter((eq) => eq.distrito === distritoSeleccionado)
    } else if (esCopaPeruActual && etapaSeleccionada === "Etapa Provincial" && provinciaSeleccionada) {
      // 2. Etapa Provincial (Copa Perú): usar campeón/subcampeón de cada distrito
      equiposDisponibles = Object.values(provinciaCampeones)
        .flatMap((c) => [c.campeon, c.subcampeon].filter(Boolean) as Equipo[])
    } else if (provinciaSeleccionada) {
      // 3. Otros campeonatos / etapas: filtrar por provincia seleccionada
      equiposDisponibles = equiposReales.filter((eq) => eq.provincia === provinciaSeleccionada)
    }

    const equiposYaAsignados = new Set(
      partidos.flatMap((p) => [p.equipoLocal?.id, p.equipoVisitante?.id].filter(Boolean) as number[])
    )

    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {renderStepIndicator()}

        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Nueva Designación · {campeonatoSeleccionado?.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            {getStepTitle()}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">
            {provinciaSeleccionada || distritoSeleccionado} • {getStepDescription()}
          </p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(getBackStep())} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Cambiar Provincia
          </Button>
        </div>

        {renderCoach()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* SELECTOR DE EQUIPOS */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-gray-200 bg-card">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Arma el Partido
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Elige un equipo local y un visitante. Los equipos ya asignados aparecen deshabilitados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Equipo Local */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-3">
                    ⚽ Equipo Local
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {equiposDisponibles.map((eq) => {
                      const estaRepetido = partidos.some(
                        (p) => p.equipoLocal?.id === eq.id || p.equipoVisitante?.id === eq.id
                      )
                      return (
                        <button
                          key={eq.id}
                          onClick={() => !estaRepetido && setEquipoLocal(eq)}
                          disabled={estaRepetido}
                          className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                            equipoLocal?.id === eq.id
                              ? "border-purple-500 bg-purple-600 text-white shadow-md"
                              : estaRepetido
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                : "border-gray-200 bg-white text-slate-700 hover:border-purple-400"
                          }`}
                        >
                          {eq.nombre.split(" ").slice(0, 2).join(" ")}
                          <span className="text-[10px] block text-slate-400 truncate">{eq.distrito || "Sin distrito"}</span>
                          {estaRepetido && <span className="text-xs block">Asignado</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-3">
                    ✈️ Equipo Visitante
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {equiposDisponibles.filter((eq) => eq.id !== equipoLocal?.id).map((eq) => {
                      const estaRepetido = partidos.some(
                        (p) => p.equipoLocal?.id === eq.id || p.equipoVisitante?.id === eq.id
                      )
                      return (
                        <button
                          key={eq.id}
                          onClick={() => !estaRepetido && setEquipoVisitante(eq)}
                          disabled={estaRepetido}
                          className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-semibold ${
                            equipoVisitante?.id === eq.id
                              ? "border-orange-500 bg-orange-600 text-white shadow-md"
                              : estaRepetido
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                : "border-gray-200 bg-white text-slate-700 hover:border-orange-400"
                          }`}
                        >
                          {eq.nombre.split(" ").slice(0, 2).join(" ")}
                          <span className="text-[10px] block text-slate-400 truncate">{eq.distrito || "Sin distrito"}</span>
                          {estaRepetido && <span className="text-xs block">Asignado</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

{/* Botones */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        if (!equipoLocal || !equipoVisitante) {
                          toast({
                            title: "Faltan equipos",
                            description: "Selecciona un equipo local y un visitante",
                            variant: "destructive",
                          })
                          return
                        }

                        if (equipoLocal.id === equipoVisitante.id) {
                          toast({
                            title: "Equipos iguales",
                            description: "El local y el visitante no pueden ser el mismo equipo",
                            variant: "destructive",
                          })
                          return
                        }

                        const equipoLocalRepetido = partidos.some(
                          (p) => p.equipoLocal?.id === equipoLocal.id || p.equipoVisitante?.id === equipoLocal.id
                        )
                        const equipoVisitanteRepetido = partidos.some(
                          (p) => p.equipoLocal?.id === equipoVisitante.id || p.equipoVisitante?.id === equipoVisitante.id
                        )

                        if (equipoLocalRepetido || equipoVisitanteRepetido) {
                          toast({
                            title: "Equipos duplicados",
                            description: "Un equipo no puede participar en múltiples partidos",
                            variant: "destructive",
                          })
                          return
                        }

                        const ahora = new Date()
                        const fechaHoy = ahora.toISOString().split('T')[0]
                        const horaHoy = ahora.toTimeString().substring(0, 5)
                        const nuevoPartido: Partido = {
                          id: `partido-${Date.now()}`,
                          equipoLocal,
                          equipoVisitante,
                          estadio: equipoLocal.estadio || "",
                          fecha: fechaHoy,
                          hora: horaHoy,
                        }

                        setPartidos([...partidos, nuevoPartido])
                        setEquipoLocal(null)
                        setEquipoVisitante(null)

                        toast({
                          title: "✅ Partido creado",
                          description: `${equipoLocal.nombre} vs ${equipoVisitante.nombre}`,
                        })
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Agregar Partido
                    </Button>

                  <Button
                    onClick={() => {
                      if (partidos.length === 0) {
                        toast({
                          title: "Sin partidos",
                          description: "Agrega al menos un partido antes de continuar",
                          variant: "destructive",
                        })
                        return
                      }

                      setCurrentStep("designar")
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Continuar
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LISTA DE PARTIDOS */}
          {partidos.length > 0 && (
            <div className="lg:col-span-3">
              <Card className="border-2 border-gray-200 bg-card">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Partidos Creados ({partidos.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Revisa los partidos antes de asignar árbitros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partidos.map((partido, idx) => (
                      <div key={partido.id} className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-blue-600 text-white">Partido {idx + 1}</Badge>
                          <button
                            onClick={() => {
                              setPartidos(partidos.filter((p) => p.id !== partido.id))
                              toast({ title: "Partido eliminado" })
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="text-xs font-semibold text-slate-500 mb-1">LOCAL</p>
                            <p className="text-slate-900 font-semibold">{partido.equipoLocal.nombre}</p>
                            <p className="text-[10px] text-slate-400">{partido.equipoLocal.distrito || "Sin distrito"}</p>
                          </div>
                          <div className="px-3">
                            <span className="text-slate-400 font-bold text-lg">VS</span>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-xs font-semibold text-slate-500 mb-1">VISITA</p>
                            <p className="text-slate-900 font-semibold">{partido.equipoVisitante.nombre}</p>
                            <p className="text-[10px] text-slate-400">{partido.equipoVisitante.distrito || "Sin distrito"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // STEP 6: DESIGNACIÓN DE ÁRBITROS
  // ============================================================

  if (currentStep === "designar" && partidos.length > 0) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            Designación de Árbitros · {campeonatoSeleccionado?.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
            Asignar Árbitros
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">Paso 6 de 7</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("partidos")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a Partidos
          </Button>
        </div>

        {renderCoach()}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* PANEL LATERAL: ÁRBITROS */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-gray-200 bg-card sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Árbitros Disponibles
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      {fechaGeneral
                        ? `Disponibilidad al ${fechaGeneral.substring(0, 10)} · agrupados por rol`
                        : "Selecciona la fecha para ver disponibilidad"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Buscador */}
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={busquedaArbitro}
                        onChange={(e) => setBusquedaArbitro(e.target.value)}
                        placeholder="Buscar árbitro…"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    {/* Chips de filtro */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(["todos", "nacional", "disponibles"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFiltroArbitro(f)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                            filtroArbitro === f
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-gray-200 hover:border-blue-400"
                          }`}
                        >
                          {f === "todos" ? "Todos" : f === "nacional" ? "Nacionales" : "Disponibles"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                      {/* 👉 ZONA ÁRBITRO PRINCIPAL */}
                      <ZonaRol
                        color="blue"
                        icono={<Shield className="w-4 h-4" />}
                        titulo="Árbitro Principal"
                        subtitulo="Rol jerárquico · 1 por designación"
                      >
                        {arbitrosDisponiblesFiltrados
                          .filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL")
                          .map((arb) => {
                            const infoDisp = arb.id != null ? disponibilidadMap[arb.id] : undefined
                            const noDisponible = infoDisp?.disponible === false
                            return (
                              <ArbitroDisponibleCard
                                key={arb.id}
                                arb={arb}
                                seleccionado={false}
                                noDisponible={noDisponible}
                                motivo={infoDisp?.motivo}
                                equipoTrabajo={infoDisp?.equipoTrabajo}
                                hora={infoDisp?.hora}
                                rolColor="blue"
                                rolLabel="Principal"
                                destacado
                                onToggle={() => {}}
                              />
                            )
                          })}
                        {arbitrosDisponiblesFiltrados.filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400 px-1">Sin árbitros nacionales</p>
                        )}
                      </ZonaRol>

                      {/* Divisor jerárquico */}
                      <div className="flex items-center gap-2 px-1 py-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rol de apoyo</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* 👉 ZONA ÁRBITROS ASISTENTES */}
                      <ZonaRol
                        color="emerald"
                        icono={<Users className="w-4 h-4" />}
                        titulo="Árbitros Asistentes"
                        subtitulo="Rol de apoyo · pueden ser varios"
                      >
                        {arbitrosDisponiblesFiltrados
                          .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                          .map((arb) => {
                            const infoDisp = arb.id != null ? disponibilidadMap[arb.id] : undefined
                            const noDisponible = infoDisp?.disponible === false
                            return (
                              <ArbitroDisponibleCard
                                key={arb.id}
                                arb={arb}
                                seleccionado={false}
                                noDisponible={noDisponible}
                                motivo={infoDisp?.motivo}
                                equipoTrabajo={infoDisp?.equipoTrabajo}
                                hora={infoDisp?.hora}
                                rolColor="emerald"
                                rolLabel="Asistente"
                                onToggle={() => {}}
                              />
                            )
                          })}
                        {arbitrosDisponiblesFiltrados.filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400 px-1">Sin árbitros asistentes</p>
                        )}
                      </ZonaRol>
                    </div>

                    {/* Leyenda */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Disponible
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-red-500" /> Ocupado
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PRINCIPAL: PARTIDOS Y DESIGNACIÓN */}
              <div className="lg:col-span-3 space-y-6">
                {partidos.map((partido, idx) => (
                  <Card key={partido.id} className="border-2 border-gray-200 bg-card">
                     {/* Header del partido */}
                     <CardHeader className="bg-blue-600/10">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Badge className="bg-purple-600 text-white">Partido {idx + 1}</Badge>
                            {partido.arbitroPrincipal && partido.asistente1 && partido.asistente2 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                Falta asignar roles
                              </span>
                            )}
                          </CardTitle>
                          <div className="text-right">
                           <p className="font-semibold text-slate-900">{partido.equipoLocal.nombre}</p>
                           <p className="text-xs text-slate-500">{partido.equipoLocal.distrito || "Sin distrito"}</p>
                           <p className="text-xs text-slate-400 my-1">vs</p>
                           <p className="font-semibold text-slate-900">{partido.equipoVisitante.nombre}</p>
                           <p className="text-xs text-slate-500">{partido.equipoVisitante.distrito || "Sin distrito"}</p>
                         </div>
                       </div>
                     </CardHeader>

                     <CardContent className="p-6 space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             🏟️ Estadio (Local)
                           </label>
                           <input
                             type="text"
                             value={partido.estadio || partido.equipoLocal.estadio || ""}
                             onChange={(e) => {
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].estadio = e.target.value
                               setPartidos(updatedPartidos)
                             }}
                             placeholder="Estadio del partido"
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             📅 Fecha
                           </label>
                           <input
                             type="date"
                             value={partido.fecha || ""}
                             onChange={(e) => {
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].fecha = e.target.value
                               setPartidos(updatedPartidos)
                             }}
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             🕐 Hora
                           </label>
                           <input
                             type="time"
                             value={partido.hora || ""}
                             onChange={(e) => {
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].hora = e.target.value
                               setPartidos(updatedPartidos)
                             }}
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                           />
                         </div>
                       </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                         {/* Árbitro Principal */}
                         <div className="min-w-0">
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             🛡️ Principal <span className="text-red-500">*</span>
                           </label>
                           <select
                             value={partido.arbitroPrincipal?.id || ""}
                             onChange={(e) => {
                               const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].arbitroPrincipal = arb || null
                               setPartidos(updatedPartidos)
                             }}
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                           >
                             <option value="">Seleccionar</option>
                             {arbitros
                               .filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL")
                               .map((arb) => {
                                 const usado = arbitroUsadoEn(idx, arb.id)
                                 const ocupado = arb.id != null && disponibilidadMap[arb.id]?.disponible === false
                                 const sufijo = ocupado ? " · No disponible" : usado ? " · Ya asignado" : ""
                                 return (
                                   <option key={arb.id} value={arb.id} disabled={usado} title={`${arb.categoria}${sufijo}`}>
                                     {arb.nombre} {arb.apellido}{sufijo}
                                   </option>
                                 )
                               })}
                           </select>
                         </div>

                         {/* Asistente 1 */}
                         <div className="min-w-0">
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             👤 Asistente 1 <span className="text-red-500">*</span>
                           </label>
                           <select
                             value={partido.asistente1?.id || ""}
                             onChange={(e) => {
                               const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].asistente1 = arb || null
                               setPartidos(updatedPartidos)
                             }}
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                           >
                             <option value="">Seleccionar</option>
                             {arbitros
                               .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                               .map((arb) => {
                                 const usado = arbitroUsadoEn(idx, arb.id)
                                 const ocupado = arb.id != null && disponibilidadMap[arb.id]?.disponible === false
                                 const sufijo = ocupado ? " · No disponible" : usado ? " · Ya asignado" : ""
                                 return (
                                   <option key={arb.id} value={arb.id} disabled={usado} title={`${arb.categoria}${sufijo}`}>
                                     {arb.nombre} {arb.apellido}{sufijo}
                                   </option>
                                 )
                               })}
                           </select>
                         </div>

                         {/* Asistente 2 */}
                         <div className="min-w-0">
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             👤 Asistente 2 <span className="text-red-500">*</span>
                           </label>
                           <select
                             value={partido.asistente2?.id || ""}
                             onChange={(e) => {
                               const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                               const updatedPartidos = [...partidos]
                               updatedPartidos[idx].asistente2 = arb || null
                               setPartidos(updatedPartidos)
                             }}
                             className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                           >
                             <option value="">Seleccionar</option>
                             {arbitros
                               .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                               .map((arb) => {
                                 const usado = arbitroUsadoEn(idx, arb.id)
                                 const ocupado = arb.id != null && disponibilidadMap[arb.id]?.disponible === false
                                 const sufijo = ocupado ? " · No disponible" : usado ? " · Ya asignado" : ""
                                 return (
                                   <option key={arb.id} value={arb.id} disabled={usado} title={`${arb.categoria}${sufijo}`}>
                                     {arb.nombre} {arb.apellido}{sufijo}
                                   </option>
                                 )
                               })}
                           </select>
                         </div>

                          {/* Cuarto Árbitro */}
                          <div className="min-w-0">
                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                              🔄 Cuarto <span className="text-slate-400 font-normal">(Opcional)</span>
                            </label>
                            <select
                              value={partido.cuartoArbitro?.id || ""}
                              onChange={(e) => {
                                const arb = arbitros.find((a) => a.id === parseInt(e.target.value))
                                const updatedPartidos = [...partidos]
                                updatedPartidos[idx].cuartoArbitro = arb || null
                                setPartidos(updatedPartidos)
                              }}
                              className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            >
                              <option value="">Seleccionar</option>
                              {arbitros.map((arb) => {
                                const usado = arbitroUsadoEn(idx, arb.id)
                                const ocupado = arb.id != null && disponibilidadMap[arb.id]?.disponible === false
                                const sufijo = ocupado ? " · No disponible" : usado ? " · Ya asignado" : ""
                                return (
                                  <option key={arb.id} value={arb.id} disabled={usado} title={`${arb.categoria}${sufijo}`}>
                                    {arb.nombre} {arb.apellido}{sufijo}
                                  </option>
                                )
                              })}
                            </select>
                          </div>

                         {/* Asesor */}
                         <div className="min-w-0">
                           <label className="block text-sm font-semibold text-slate-600 mb-2">
                             📋 Asesor <span className="text-slate-400 font-normal">(Opcional)</span>
                           </label>
                          <select
                            value={partido.asesor?.id || ""}
                            onChange={(e) => {
                              const as = asesores.find((a) => a.id === parseInt(e.target.value))
                              const updatedPartidos = [...partidos]
                              updatedPartidos[idx].asesor = as || null
                              setPartidos(updatedPartidos)
                            }}
                            className="w-full p-2 bg-white border border-gray-200 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                          >
                            <option value="">Seleccionar</option>
                            {asesores.map((as) => (
                              <option key={as.id} value={as.id}>
                                {as.nombre} {as.apellido}
                              </option>
                            ))}
                            </select>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No hay equipos registrados en este distrito.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  </Card>
                ))}

{/* Botones finales */}
                <div className="space-y-4">
                  {/* MENSAJE DE VALIDACIÓN */}
                  {esCopaPeruActual &&
                    (etapaSeleccionada === "Etapa Provincial" ||
                      etapaSeleccionada === "Etapa Departamental") && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm">
                          ✅ Cada partido debe tener al menos Principal, Asistente 1 y Asistente 2. El Cuarto Árbitro y el Asesor son opcionales. Un mismo árbitro no puede repetirse en otro puesto ni en otro partido.
                        </p>
                      </div>
                    )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-white text-slate-900"
                      onClick={() => setCurrentStep("partidos")}
                    >
                      ← Volver
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        // Validar que todos los partidos tengan los 3 árbitros obligatorios
                        const partidosSinArbitros = partidos.filter(
                          (p) =>
                            !p.arbitroPrincipal ||
                            !p.asistente1 ||
                            !p.asistente2
                        )

                        if (partidosSinArbitros.length > 0) {
                          const faltan = partidosSinArbitros
                            .map((p, i) => {
                              const rolesFaltantes = [
                                !p.arbitroPrincipal && "Principal",
                                !p.asistente1 && "Asistente 1",
                                !p.asistente2 && "Asistente 2",
                              ].filter(Boolean) as string[]
                              return `Partido ${partidos.indexOf(p) + 1}: falta ${rolesFaltantes.join(", ")}`
                            })
                            .join(" · ")
                          toast({
                            title: "Designación incompleta",
                            description: faltan,
                            variant: "destructive",
                          })
                          return
                        }

                        // Validar árbitros únicos dentro del mismo partido
                        for (const [pIdx, partido] of partidos.entries()) {
                          const arbitrosEnPartido = [
                            partido.arbitroPrincipal?.id,
                            partido.asistente1?.id,
                            partido.asistente2?.id,
                            partido.cuartoArbitro?.id,
                          ].filter(Boolean) as number[]

                          const duplicadosEnPartido = arbitrosEnPartido.length !== new Set(arbitrosEnPartido).size

                          if (duplicadosEnPartido) {
                            // Identifica el árbitro repetido en este partido
                            const conteo = new Map<number, number>()
                            arbitrosEnPartido.forEach((id) => conteo.set(id, (conteo.get(id) || 0) + 1))
                            const idRepetido = Array.from(conteo.entries()).find(([, c]) => c > 1)?.[0]
                            const nombre = idRepetido != null ? arbitros.find((a) => a.id === idRepetido)?.nombre : null
                            toast({
                              title: "Árbitro en varios puestos",
                              description: `Partido ${pIdx + 1}: ${nombre || "Un árbitro"} ya tiene asignado otro puesto en este partido. Elígelo en un solo rol.`,
                              variant: "destructive",
                            })
                            return
                          }
                        }

                        // Validar árbitros únicos en partidos diferentes (todos los campeonatos)
                        {
                          const arbitrosGlobales = new Map<number, number>()

                          for (const partido of partidos) {
                            const arbitros = [
                              partido.arbitroPrincipal?.id,
                              partido.asistente1?.id,
                              partido.asistente2?.id,
                              partido.cuartoArbitro?.id,
                            ].filter(Boolean) as number[]

                            for (const arbId of arbitros) {
                              arbitrosGlobales.set(arbId, (arbitrosGlobales.get(arbId) || 0) + 1)
                            }
                          }

                          const arbitrosDuplicadosGlobales = Array.from(arbitrosGlobales.entries())
                            .filter(([_, count]) => count > 1)
                            .map(([id, _]) => {
                              const nombre = arbitros.find((a) => a.id === id)?.nombre || "Árbitro"
                              const partidoDonde = partidos.findIndex((p) =>
                                [p.arbitroPrincipal?.id, p.asistente1?.id, p.asistente2?.id, p.cuartoArbitro?.id].includes(id)
                              ) + 1
                              return `${nombre} (ya en Partido ${partidoDonde})`
                            })

                          if (arbitrosDuplicadosGlobales.length > 0) {
                            toast({
                              title: "Árbitro en varios partidos",
                              description: `${arbitrosDuplicadosGlobales.join(" · ")}. Un árbitro no puede arbitrar más de un partido.`,
                              variant: "destructive",
                            })
                            return
                          }
                        }

                        setCurrentStep("resumen")
                      }}
                    >
                      Revisar Resumen
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
      </div>
    )
  }

  // ============================================================
  // STEP: RESUMEN
  // ============================================================

  if (currentStep === "resumen" && partidos.length > 0) {
    return (
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {renderStepIndicator()}

        {/* Header */}
        <section className="border-b pb-3 md:pb-4">
          <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
            {campeonatoSeleccionado?.nombre}
          </p>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-emerald-600" />
            {getStepTitle()}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">{getStepDescription()}</p>
        </section>

        {/* Botón de retroceso */}
        <div className="flex justify-start">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep("designar")} className="border-gray-200">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a Asignar Árbitros
          </Button>
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <strong>Revisa bien la información</strong> antes de confirmar. Una vez guardadas, las designaciones se crearán en el sistema.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {partidos.map((partido, idx) => {
            const getRoleLabel = (arb: Arbitro | null | undefined, rol: string) => {
              if (!arb) return <span className="text-slate-400 text-xs">Sin asignar</span>
              return (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-xs">
                    {arb.nombre} {arb.apellido}
                  </span>
                  <Badge className="text-[10px] bg-blue-600 text-white">{arb.categoria}</Badge>
                </div>
              )
            }

            const estadioPartido = partido.estadio || partido.equipoLocal?.estadio || partido.equipoVisitante?.estadio || "Por definir"
            const fechaPartido = partido.fecha || ""
            const horaPartido = partido.hora || ""

            return (
              <Card key={partido.id} className="border-2 border-gray-200 bg-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Badge className="bg-slate-600 text-white">Partido {idx + 1}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        {estadioPartido}
                      </span>
                      {fechaPartido && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {fechaPartido}
                        </span>
                      )}
                      {horaPartido && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {horaPartido}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-bold text-purple-700 mb-1">LOCAL</p>
                      <p className="text-sm font-bold text-slate-900">{partido.equipoLocal.nombre}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{partido.equipoLocal.distrito || ""}</p>
                    </div>
                    <div className="text-slate-400 font-bold text-lg">VS</div>
                    <div className="flex-1 text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs font-bold text-orange-700 mb-1">VISITA</p>
                      <p className="text-sm font-bold text-slate-900">{partido.equipoVisitante.nombre}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{partido.equipoVisitante.distrito || ""}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">🛡️ Principal</p>
                      {getRoleLabel(partido.arbitroPrincipal, "Principal")}
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">👤 Asistente 1</p>
                      {getRoleLabel(partido.asistente1, "Asistente 1")}
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">👤 Asistente 2</p>
                      {getRoleLabel(partido.asistente2, "Asistente 2")}
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">🔄 Cuarto</p>
                      {getRoleLabel(partido.cuartoArbitro, "Cuarto")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep("designar")}
            className="flex-1 border-gray-200 text-slate-700 hover:bg-gray-50"
          >
            ← Corregir
          </Button>
          <Button
            onClick={async () => {
              setIsSaving(true)
              try {
                const ahora = new Date()
                const fechaHoy = ahora.toISOString().split('T')[0]
                const horaHoy = ahora.toTimeString().substring(0, 5)

                for (const partido of partidos) {
                  const fechaPartido = partido.fecha || fechaHoy
                  const horaPartido = partido.hora || horaHoy
                  await createDesignacion({
                    idCampeonato: campeonatoSeleccionado?.id,
                    nombreCampeonato: campeonatoSeleccionado?.nombre?.toUpperCase(),
                    idEquipoLocal: partido.equipoLocal?.id,
                    nombreEquipoLocal: partido.equipoLocal?.nombre,
                    idEquipoVisitante: partido.equipoVisitante?.id,
                    nombreEquipoVisitante: partido.equipoVisitante?.nombre,
                    fecha: `${fechaPartido}T${horaPartido}:00`,
                    hora: horaPartido,
                    estadio: (partido.estadio || partido.equipoLocal?.estadio || partido.equipoVisitante?.estadio || "") ?? null,
                    arbitroPrincipal: partido.arbitroPrincipal?.id ? String(partido.arbitroPrincipal.id) : null,
                    arbitroAsistente1: partido.asistente1?.id ? String(partido.asistente1.id) : null,
                    arbitroAsistente2: partido.asistente2?.id ? String(partido.asistente2.id) : null,
                    cuartoArbitro: partido.cuartoArbitro?.id ? String(partido.cuartoArbitro.id) : null,
                    asesor: partido.asesor?.id ? String(partido.asesor.id) : null,
                    estado: "PROGRAMADA",
                    temporada: esCopaPeruActual ? 2026 : null,
                    etapa: esCopaPeruActual ? etapaSeleccionada?.replace("Etapa ", "").toUpperCase() : null,
                    region: "PUNO",
                    provincia: provinciaSeleccionada,
                    distrito: esCopaPeruActual ? distritoSeleccionado : null,
                  })
                }

                toast({
                  title: "✅ Designaciones creadas",
                  description: `Se crearon ${partidos.length} designaciones exitosamente`,
                })

                // Notificar a otras partes de la app para actualizar la lista
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("designaciones-updated"))
                }

                setCurrentStep("confirmacion")
              } catch (error) {
                console.error("Error guardando designaciones:", error)
                toast({
                  title: "❌ No se pudieron guardar",
                  description: error instanceof Error ? error.message : "No se pudieron guardar las designaciones",
                  variant: "destructive",
                })
              } finally {
                setIsSaving(false)
              }
            }}
            disabled={isSaving}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Guardando..." : "Guardar Designaciones ✓"}
          </Button>
        </div>
      </div>
    )
  }

// ============================================================
  // STEP 7: CONFIRMACIÓN
  // ============================================================

  if (currentStep === "confirmacion") {
    const totalDesignaciones = esCampeonatoFundamental
      ? arbitrosSeleccionados.length
      : partidos.length

    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full">
          <Card className="border-2 border-emerald-600 bg-emerald-600/10">
            <CardContent className="p-6 md:p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  ¡Designaciones Confirmadas!
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  {esCampeonatoFundamental
                    ? `Se asignaron ${arbitrosSeleccionados.length} árbitros al campeonato.`
                    : `Se crearon exitosamente ${partidos.length} designaciones.`}
                </p>
              </div>

              <div className="space-y-3 text-left bg-white p-4 md:p-6 rounded-lg border border-gray-200 max-h-72 overflow-y-auto">
                {esCampeonatoFundamental ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Árbitros Asignados</p>
                    {arbitrosSeleccionados.map((arb, idx) => (
                      <div key={arb.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {arb.nombre} {arb.apellido}
                          </p>
                          <p className="text-xs text-slate-500">Categoría: {arb.categoria}</p>
                        </div>
                        <Badge className="bg-blue-600 text-white text-xs">{arb.categoria}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Partidos Creados</p>
                    {partidos.map((partido, idx) => (
                      <div key={partido.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-900 text-sm">
                            Partido {idx + 1}: {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                          </p>
                          <Badge className="bg-blue-600 text-white text-xs">{campeonatoSeleccionado?.nombre}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          Principal: <span className="font-medium">{partido.arbitroPrincipal?.nombre} {partido.arbitroPrincipal?.apellido}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-white text-slate-900"
                  asChild
                >
                  <Link href="/dashboard/designaciones">
                    Ver Designaciones
                  </Link>
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setCurrentStep("campeonato")
                    setCampeonatoSeleccionado(null)
                    setEtapaSeleccionada(null)
                    setProvinciaSeleccionada(null)
                    setDistritoSeleccionado(null)
                    setPartidos([])
                    setArbitrosSeleccionados([])
                  }}
                >
                  Nueva Designación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

   // ============================================================
   // STEP: DESIGNACIÓN GENERAL (CAMPEONATO FUNDAMENTAL)
   // ============================================================

   if (currentStep === "designacionGeneral" && campeonatoSeleccionado && esCampeonatoFundamental) {
     return (
       <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
         {/* Header */}
         <section className="border-b pb-3 md:pb-4">
           <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
             Designar Árbitros · {campeonatoSeleccionado.nombre}
           </p>
           <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
             <Users className="w-8 h-8 text-blue-600" />
             Asignación de Árbitros
           </h1>
           <p className="text-slate-500 mt-2 text-xs md:text-sm">
             CAMPEONATO FUNDAMENTAL · Selección por categoría
           </p>
         </section>

          {/* Botón de retroceso */}
          <div className="flex justify-start">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep("campeonato")} className="border-gray-200">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cambiar Campeonato
            </Button>
          </div>

          {(campeonatoSeleccionado?.fechaInicio || campeonatoSeleccionado?.horaInicio) && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  <strong>Inicio oficial del campeonato (referencia):</strong>{" "}
                  {campeonatoSeleccionado?.fechaInicio || "—"}
                  {campeonatoSeleccionado?.horaInicio ? ` · ${campeonatoSeleccionado.horaInicio}` : ""}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Esta es la fecha y hora de inicio del campeonato. La fecha y hora que programes abajo
                  corresponden a esta designación en particular y pueden ser distintas.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-slate-800">
                <strong>Programa la fecha y hora</strong> de la designación, luego selecciona los árbitros. Esta información será visible en el PDF de la semana.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fechaGeneral" className="block text-sm font-semibold text-slate-700 mb-2">
                📅 Fecha de la designación
              </label>
              <DatePicker
                id="fechaGeneral"
                value={fechaGeneral}
                onChange={setFechaGeneral}
                invalid={intentadoContinuar && !fechaGeneral}
                minDate={new Date()}
              />
              {intentadoContinuar && !fechaGeneral && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Selecciona la fecha de la designación
                </p>
              )}
            </div>
            <div>
              <label htmlFor="horaGeneral" className="block text-sm font-semibold text-slate-700 mb-2">
                🕒 Hora de la designación
              </label>
              <TimePicker
                id="horaGeneral"
                value={horaGeneral}
                onChange={setHoraGeneral}
                invalid={intentadoContinuar && !horaGeneral}
              />
              {intentadoContinuar && !horaGeneral && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Selecciona la hora de la designación
                </p>
              )}
            </div>
          </div>

         <div>
           <label className="block text-sm font-semibold text-slate-700 mb-2">
             Modo de designación
           </label>
           <select
             value={modoDesignacion}
             onChange={(e) => setModoDesignacion(e.target.value as "manual" | "semiautomatica" | "automatica")}
             className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-500"
           >
             <option value="manual">Manual</option>
             <option value="semiautomatica">Semiautomática</option>
             <option value="automatica">Automática</option>
           </select>
         </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Panel de árbitros disponibles */}
            <Card className="border-2 border-gray-200 bg-card">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Árbitros Disponibles
                </CardTitle>
                <CardDescription className="text-xs">
                  {cargandoDisponibilidad
                    ? "Verificando disponibilidad…"
                    : fechaGeneral
                      ? `Disponibilidad al ${fechaGeneral.substring(0, 10)} · agrupados por rol`
                      : "Selecciona la fecha para ver la disponibilidad"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!arbitros || arbitros.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No hay árbitros disponibles</p>
                ) : (
                  <>
                    {/* Buscador */}
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={busquedaArbitro}
                        onChange={(e) => setBusquedaArbitro(e.target.value)}
                        placeholder="Buscar árbitro…"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    {/* Chips de filtro */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(["todos", "nacional", "disponibles"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFiltroArbitro(f)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                            filtroArbitro === f
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-gray-200 hover:border-blue-400"
                          }`}
                        >
                          {f === "todos" ? "Todos" : f === "nacional" ? "Nacionales" : "Disponibles"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                      {/* 👉 ZONA ÁRBITRO PRINCIPAL */}
                      <ZonaRol
                        color="blue"
                        icono={<Shield className="w-4 h-4" />}
                        titulo="Árbitro Principal"
                        subtitulo="Rol jerárquico · 1 por designación"
                      >
                        {arbitrosDisponiblesFiltrados
                          .filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL")
                          .map((arb) => {
                            const estaSeleccionado = arbitrosSeleccionados.some((a) => a.id === arb.id)
                            const infoDisp = arb.id != null ? disponibilidadMap[arb.id] : undefined
                            const noDisponible = infoDisp?.disponible === false
                            return (
                              <ArbitroDisponibleCard
                                key={arb.id}
                                arb={arb}
                                seleccionado={estaSeleccionado}
                                noDisponible={noDisponible}
                                motivo={infoDisp?.motivo}
                                equipoTrabajo={infoDisp?.equipoTrabajo}
                                hora={infoDisp?.hora}
                                rolColor="blue"
                                rolLabel="Principal"
                                destacado
                                onToggle={() => {
                                  if (estaSeleccionado) {
                                    setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))
                                  } else {
                                    setArbitrosSeleccionados(prev => [...prev, arb])
                                  }
                                }}
                              />
                            )
                          })}
                        {arbitrosDisponiblesFiltrados.filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400 px-1">Sin árbitros nacionales</p>
                        )}
                      </ZonaRol>

                      {/* Divisor jerárquico */}
                      <div className="flex items-center gap-2 px-1 py-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Rol de apoyo</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* 👉 ZONA ÁRBITROS ASISTENTES */}
                      <ZonaRol
                        color="emerald"
                        icono={<Users className="w-4 h-4" />}
                        titulo="Árbitros Asistentes"
                        subtitulo="Rol de apoyo · pueden ser varios"
                      >
                        {arbitrosDisponiblesFiltrados
                          .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                          .map((arb) => {
                            const estaSeleccionado = arbitrosSeleccionados.some((a) => a.id === arb.id)
                            const infoDisp = arb.id != null ? disponibilidadMap[arb.id] : undefined
                            const noDisponible = infoDisp?.disponible === false
                            return (
                              <ArbitroDisponibleCard
                                key={arb.id}
                                arb={arb}
                                seleccionado={estaSeleccionado}
                                noDisponible={noDisponible}
                                motivo={infoDisp?.motivo}
                                equipoTrabajo={infoDisp?.equipoTrabajo}
                                hora={infoDisp?.hora}
                                rolColor="emerald"
                                rolLabel="Asistente"
                                onToggle={() => {
                                  if (estaSeleccionado) {
                                    setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))
                                  } else {
                                    setArbitrosSeleccionados(prev => [...prev, arb])
                                  }
                                }}
                              />
                            )
                          })}
                        {arbitrosDisponiblesFiltrados.filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400 px-1">Sin árbitros asistentes</p>
                        )}
                      </ZonaRol>

                      {/* Leyenda */}
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Disponible
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-red-500" /> Ocupado
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

           {/* Árbitros seleccionados */}
           <Card className="border-2 border-gray-200 bg-card">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Resumen por Puesto
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {arbitrosSeleccionados.length === 0
                    ? "Selecciona al menos 1 árbitro"
                    : `${arbitrosSeleccionados.length} árbitro(s) asignado(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {arbitrosSeleccionados.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    Selecciona árbitros en el panel izquierdo
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {/* Principales */}
                    <div>
                      <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Principal
                      </p>
                      <div className="space-y-1.5">
                        {arbitrosSeleccionados
                          .filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL")
                          .map((arb) => (
                            <div key={arb.id} className="p-2.5 rounded-lg flex items-center justify-between gap-2 border-2 border-blue-200 bg-blue-50">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-sm break-words">{arb.nombre} {arb.apellido}</p>
                                <Badge className="text-[10px] bg-blue-600 text-white mt-0.5">{arb.categoria}</Badge>
                              </div>
                              <button
                                onClick={() => setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))}
                                className="text-red-600 hover:text-red-700 shrink-0"
                                aria-label={`Quitar a ${arb.nombre} ${arb.apellido}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        {arbitrosSeleccionados.filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400">Sin principal asignado</p>
                        )}
                      </div>
                    </div>

                    {/* Asistentes */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Asistentes
                      </p>
                      <div className="space-y-1.5">
                        {arbitrosSeleccionados
                          .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                          .map((arb) => (
                            <div key={arb.id} className="p-2.5 rounded-lg flex items-center justify-between gap-2 border-2 border-emerald-200 bg-emerald-50">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-sm break-words">{arb.nombre} {arb.apellido}</p>
                                <Badge className="text-[10px] bg-emerald-600 text-white mt-0.5">{arb.categoria}</Badge>
                              </div>
                              <button
                                onClick={() => setArbitrosSeleccionados(prev => prev.filter((a) => a.id !== arb.id))}
                                className="text-red-600 hover:text-red-700 shrink-0"
                                aria-label={`Quitar a ${arb.nombre} ${arb.apellido}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        {arbitrosSeleccionados.filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL").length === 0 && (
                          <p className="text-[11px] text-slate-400">Sin asistentes asignados</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
         </div>

         {/* Botón de confirmar */}
         <div className="mt-8">
           <div className="flex gap-3">
             <Button
               variant="outline"
               onClick={() => setCurrentStep("campeonato")}
               className="flex-1 border-gray-200"
             >
               <ChevronLeft className="w-4 h-4 mr-2" />
               Cancelar
             </Button>
             <Button
               type="button"
                onClick={() => {
                  setIntentadoContinuar(true)
                  if (arbitrosSeleccionados.length < 1) {
                   toast({
                     title: "Validación",
                     description: "Selecciona al menos 1 árbitro",
                     variant: "destructive",
                   })
                   return
                 }

                 if (!fechaGeneral) {
                   toast({
                     title: "Validación",
                     description: "Selecciona la fecha de la designación",
                     variant: "destructive",
                   })
                   return
                 }

                 setCurrentStep("resumenGeneral")
               }}
               disabled={arbitrosSeleccionados.length < 1 || isSaving}
               className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSaving ? "Guardando..." : "Revisar Selección"}
               <ChevronRight className="w-5 h-5 ml-2" />
             </Button>
           </div>
         </div>
       </div>
     )
   }

   // ============================================================
   // STEP: RESUMEN GENERAL (CAMPEONATO FUNDAMENTAL)
   // ============================================================

   if (currentStep === "resumenGeneral" && campeonatoSeleccionado && esCampeonatoFundamental) {
     return (
       <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">
         {/* Header */}
         <section className="border-b pb-3 md:pb-4">
           <p className="text-xs md:text-sm font-medium text-blue-600 uppercase tracking-wide">
             {campeonatoSeleccionado.nombre}
           </p>
           <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
             Revisar Designación
           </h1>
           <p className="text-slate-500 mt-2 text-xs md:text-sm">
             CAMPEONATO FUNDAMENTAL · Confirmación
           </p>
         </section>

         <div className="flex justify-start">
           <Button variant="outline" size="sm" onClick={() => setCurrentStep("designacionGeneral")} className="border-gray-200">
             <ChevronLeft className="w-4 h-4 mr-1" />
             Volver a Asignación
           </Button>
         </div>

         <Card className="bg-amber-50 border-amber-200">
           <CardContent className="p-4">
             <p className="text-sm text-amber-800">
               <strong>Revisa la información</strong> antes de confirmar. Se asignarán {arbitrosSeleccionados.length} árbitros para el {fechaGeneral} a las {horaGeneral}.
             </p>
           </CardContent>
         </Card>

          <div className="space-y-5">
            {/* Principales */}
            {arbitrosSeleccionados.filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL").length > 0 && (
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Árbitros Principales
                </p>
                <div className="space-y-2">
                  {arbitrosSeleccionados
                    .filter((a) => (a.categoria || "").toUpperCase() === "NACIONAL")
                    .map((arb) => (
                      <Card key={arb.id} className="border-2 border-blue-200 bg-blue-50/50 bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Principal</p>
                            <p className="text-base font-bold text-slate-900">{arb.nombre} {arb.apellido}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-blue-600 text-white">{arb.categoria}</Badge>
                              <Badge className="bg-emerald-600 text-white">PROGRAMADA</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Campeonato</p>
                            <p className="text-sm font-semibold text-slate-900">{campeonatoSeleccionado?.nombre}</p>
                            <p className="text-xs text-slate-600 mt-1">📅 {fechaGeneral}</p>
                            <p className="text-xs text-slate-600">🕒 {horaGeneral}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Asistentes */}
            {arbitrosSeleccionados.filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL").length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Árbitros Asistentes
                </p>
                <div className="space-y-2">
                  {arbitrosSeleccionados
                    .filter((a) => (a.categoria || "").toUpperCase() !== "NACIONAL")
                    .map((arb) => (
                      <Card key={arb.id} className="border-2 border-emerald-200 bg-emerald-50/50 bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Asistente</p>
                            <p className="text-base font-bold text-slate-900">{arb.nombre} {arb.apellido}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-emerald-600 text-white">{arb.categoria}</Badge>
                              <Badge className="bg-emerald-600 text-white">PROGRAMADA</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Campeonato</p>
                            <p className="text-sm font-semibold text-slate-900">{campeonatoSeleccionado?.nombre}</p>
                            <p className="text-xs text-slate-600 mt-1">📅 {fechaGeneral}</p>
                            <p className="text-xs text-slate-600">🕒 {horaGeneral}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>

         <div className="flex gap-3 pt-4">
           <Button
             variant="outline"
             onClick={() => setCurrentStep("designacionGeneral")}
             className="flex-1 border-gray-200 text-slate-700 hover:bg-gray-50"
           >
             ← Corregir
           </Button>
           <Button
             onClick={async () => {
               if (!fechaGeneral || !horaGeneral) {
                 toast({
                   title: "Validación",
                   description: "Ingresa fecha y hora de la designación",
                   variant: "destructive",
                 })
                 return
               }

               setIsSaving(true)
               try {
                 for (const arbitro of arbitrosSeleccionados) {
                   await createDesignacion({
                     idCampeonato: campeonatoSeleccionado?.id,
                     nombreCampeonato: campeonatoSeleccionado?.nombre?.toUpperCase(),
                     fecha: `${fechaGeneral}T${horaGeneral}:00`,
                     hora: horaGeneral,
                     estado: "PROGRAMADA",
                     arbitroPrincipal: String(arbitro.id),
                   })
                 }

                 toast({
                   title: "✅ Designaciones creadas",
                   description: `Se asignaron ${arbitrosSeleccionados.length} árbitros al campeonato`,
                 })

                 setCurrentStep("confirmacion")
                } catch (error) {
                  console.error("Error guardando:", error)
                  toast({
                    title: "❌ No se pudieron guardar",
                    description: error instanceof Error ? error.message : "No se pudieron guardar las designaciones",
                    variant: "destructive",
                  })
                } finally {
                  setIsSaving(false)
                }
             }}
             disabled={isSaving}
             className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSaving ? "Guardando..." : "Guardar Designaciones ✓"}
           </Button>
         </div>
       </div>
     )
    }

  return null
}

  // ============================================================
  // Zona de rol: sección con identidad propia (fondo tenue +
  // encabezado con ícono) que separa visualmente al Árbitro
  // Principal de los Asistentes.
  // ============================================================
  type ZonaRolProps = {
    icono: React.ReactNode
    titulo: string
    subtitulo?: string
    color: "blue" | "emerald"
    children: React.ReactNode
  }

  const ZonaRol = ({ icono, titulo, subtitulo, color, children }: ZonaRolProps) => {
    const estilo =
      color === "blue"
        ? "bg-blue-50/60 border-blue-100"
        : "bg-emerald-50/60 border-emerald-100"
    const tituloColor = color === "blue" ? "text-blue-800" : "text-emerald-800"
    return (
      <section className={`rounded-xl border p-3 ${estilo}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={tituloColor}>{icono}</span>
          <h4 className={`text-sm font-bold uppercase tracking-wide ${tituloColor}`}>{titulo}</h4>
        </div>
        {subtitulo && <p className="text-[10px] text-slate-500 mb-2">{subtitulo}</p>}
        <div className="space-y-2">{children}</div>
      </section>
    )
  }

  // ============================================================
  // Componente reutilizable: tarjeta de árbitro (propuesta UX alt.)
  //  - Resumen de estado en 1 línea + detalle colapsable (hover)
  //  - Micro-feedback inline (shake) al intentar elegir un ocupado
  //  - Pill de rol explícita + énfasis para el principal
  // ============================================================
   type ArbitroDisponibleCardProps = {
    arb: Arbitro
    seleccionado: boolean
    noDisponible: boolean
    motivo?: string
    equipoTrabajo?: string
    hora?: string
    rolColor: "blue" | "emerald"
    rolLabel?: string
    destacado?: boolean
    onToggle: () => void
  }

  const resumenMotivo = (motivo?: string): string => {
    if (!motivo) return "Ocupado ese día"
    // "Designado en COPA PERÚ 2026 el 2026-07-15 a las 12:23 (Árbitro principal)"
    const m = motivo.match(/Designado en (.+?) el (\d{4}-\d{2}-\d{2})/i)
    if (m) return `Ocupado · ${m[1].trim()} · ${m[2].slice(8)}/${m[2].slice(5, 7)}`
    const p = motivo.match(/(Permiso|Lesión|Viaje|Examen):?\s*(.*)/i)
    if (p) return `${p[1].charAt(0).toUpperCase() + p[1].slice(1).toLowerCase()}${p[2] ? " · " + p[2] : ""}`
    return motivo.length > 42 ? motivo.slice(0, 40) + "…" : motivo
  }

  const iniciales = (arb: Arbitro): string => {
    const n = (arb.nombre || "").trim().split(" ")[0] || ""
    const a = (arb.apellido || "").trim().split(" ")[0] || ""
    return (n[0] || "") + (a[0] || "")
  }

  const ArbitroDisponibleCard = ({
    arb,
    seleccionado,
    noDisponible,
    motivo,
    equipoTrabajo,
    hora,
    rolColor,
    rolLabel,
    destacado = false,
    onToggle,
  }: ArbitroDisponibleCardProps) => {
    const [mostrarDetalle, setMostrarDetalle] = useState(false)
    const [shake, setShake] = useState(false)
    const colorClases =
      rolColor === "blue"
        ? {
            badge: "bg-blue-600 text-white",
            hover: "hover:border-blue-600/60",
            ring: "border-blue-600 bg-blue-600 text-white",
            dot: "bg-blue-500",
            pill: "bg-blue-50 text-blue-700 border-blue-200",
          }
        : {
            badge: "bg-emerald-600 text-white",
            hover: "hover:border-emerald-600/60",
            ring: "border-emerald-600 bg-emerald-600 text-white",
            dot: "bg-emerald-500",
            pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
          }

    const handleClick = () => {
      if (noDisponible) {
        setShake(true)
        setTimeout(() => setShake(false), 450)
        return
      }
      onToggle()
    }

    const textoClaro = seleccionado && !noDisponible ? "text-white" : "text-slate-900"

    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => noDisponible && setMostrarDetalle(true)}
        onMouseLeave={() => setMostrarDetalle(false)}
        role={noDisponible ? undefined : "button"}
        aria-pressed={seleccionado}
        aria-disabled={noDisponible}
        className={`group p-2.5 rounded-lg border-2 transition-all ${
          destacado ? "border-2 " : "border "
        }${
          noDisponible
            ? "border-gray-200 bg-gray-100 opacity-70 cursor-not-allowed"
            : seleccionado
              ? colorClases.ring + " cursor-pointer"
              : "border-gray-200 bg-white " + colorClases.hover + " cursor-pointer"
        } ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        <div className="flex items-center gap-2.5">
          {/* Avatar con iniciales */}
          <div
            className={`${destacado ? "w-10 h-10 text-[13px]" : "w-8 h-8 text-[11px]"} rounded-full flex items-center justify-center font-bold shrink-0 ${
              seleccionado && !noDisponible
                ? "bg-white/25 text-white"
                : noDisponible
                  ? "bg-gray-300 text-gray-500"
                  : colorClases.badge
            }`}
          >
            {iniciales(arb).toUpperCase() || "?"}
          </div>

          <div className="min-w-0 flex-1">
            {rolLabel && (
              <span className={`inline-block mb-0.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${colorClases.pill}`}>
                {rolLabel}
              </span>
            )}
            <div className="flex items-start justify-between gap-2">
              <p className={`font-semibold ${destacado ? "text-[15px]" : "text-sm"} leading-tight break-words ${textoClaro}`}>
                {arb.nombre} {arb.apellido}
              </p>
              <span className="shrink-0 pt-0.5">
                {noDisponible ? (
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                ) : seleccionado ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
              <Badge className={`${seleccionado && !noDisponible ? "bg-white/20 text-white" : colorClases.badge} text-[10px]`}>
                {arb.categoria}
              </Badge>
              {noDisponible ? (
                <span className="flex items-center gap-1 text-[10px] font-medium text-red-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Ocupado
                </span>
              ) : (
                <span className={`flex items-center gap-1 text-[10px] font-medium ${
                  seleccionado && !noDisponible ? "text-white" : "text-emerald-600"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${seleccionado && !noDisponible ? "bg-white" : "bg-emerald-500"}`} />
                  {seleccionado ? "Seleccionado" : "Disponible"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de motivo (1 línea) + detalle al hover */}
        {noDisponible && (
          <div className="mt-1.5 pl-[42px]">
            <p className={`text-[10px] leading-tight ${mostrarDetalle ? "text-slate-700" : "text-slate-500 truncate"}`}>
              {mostrarDetalle ? (
                <>
                  {motivo}
                  {hora ? ` · ${hora}` : ""}
                  {equipoTrabajo ? ` · Con: ${equipoTrabajo}` : ""}
                </>
              ) : (
                resumenMotivo(motivo)
              )}
            </p>
          </div>
        )}
      </div>
    )
  }
