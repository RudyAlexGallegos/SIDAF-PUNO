import { create } from "zustand"
import { persist } from "zustand/middleware"

// =====================
// TIPOS
// =====================
export interface Arbitro {
  id: string
  nombre: string
  nombres?: string
  apellidoPaterno?: string
  apellido?: string
  categoria: "FIFA" | "Nacional" | "Regional" | "Provincial"
  experiencia: number
  disponible: boolean
  telefono?: string
  email?: string
  fechaNacimiento?: string | null
  direccion?: string
  observaciones?: string
  fechaRegistro?: string | null
  nivelPreparacion?: number
}

export interface Equipo {
  id: string
  nombre: string
  categoria?: string
  provincia?: string
  estadio?: string
  direccion?: string
  telefono?: string
  email?: string
  colores?: string
  fechaCreacion?: string
}

export interface Campeonato {
  id: string
  nombre: string
  categoria?: string
  nivelDificultad?: "Alto" | "Medio" | "Bajo" | string
  numeroEquipos?: number
  fechaInicio?: string
  fechaFin?: string
  descripcion?: string
  estado?: string
  fechaCreacion?: string
  direccion?: string
  telefono?: string
  email?: string
  formato?: string
  numeroJornadas?: number
  logoDataUrl?: string
  // Nuevos campos
  numeroArbitrosRequeridos?: number
  ciudad?: string
  diasJuego?: string[]
  horaInicio?: string
  horaFin?: string
  // Equipos participantes
  equipoIds?: string[]
}

export interface Asistencia {
  id: string
  arbitroId: string
  fecha: string
  presente: boolean
  tipoActividad?: string
  observaciones?: string
}

export interface Partido {
  id: string
  campeonatoId: string
  equipoLocalId?: string
  equipoVisitanteId?: string
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  estadio?: string
}

export interface Designacion {
  id?: string
  partidoId: string
  campeonatoId: string
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  estadio?: string
  arbitroPrincipal: string
  arbitroAsistente1: string
  arbitroAsistente2: string
  cuartoArbitro: string
  fechaDesignacion?: string
  calificacion?: number
}

interface DataStore {
  arbitros: Arbitro[]
  equipos: Equipo[]
  campeonatos: Campeonato[]
  asistencias: Asistencia[]
  designaciones: Designacion[]
  loading: boolean
  error: string | null

  // arbitros
  fetchArbitros: () => Promise<void>
  createArbitro: (data: Omit<Arbitro, "id">) => Promise<void>
  deleteArbitro: (id: string) => Promise<void>

  // equipos
  createEquipo: (e: Equipo) => void
  updateEquipo: (id: string, data: Partial<Equipo>) => void
  deleteEquipo: (id: string) => void

  // campeonatos
  addCampeonato: (c: Campeonato) => void
  updateCampeonato: (id: string, data: Partial<Campeonato>) => void
  deleteCampeonato: (id: string) => void

  // asistencias
  addAsistencia: (a: Asistencia) => void
  removeAsistencia: (id: string) => void

  // designaciones
  addDesignacion: (d: Designacion) => void

  loadData: () => void
  exportData?: () => any
  extendDataExpiration?: () => void
}

const API_URL = "http://localhost:8083/api"

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      arbitros: [],
      equipos: [],
      campeonatos: [],
      asistencias: [],
      designaciones: [],
      loading: false,
      error: null,

      // =====================
      // OBTENER ARBITROS
      // =====================
      fetchArbitros: async () => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/arbitros`)
          if (!res.ok) throw new Error("Error al obtener árbitros")
          const data = await res.json()
          // normalize IDs to string
          const normalized = (data || []).map((d: any) => ({ ...d, id: String(d.id) }))
          set({ arbitros: normalized })
        } catch (err: any) {
          set({ error: err.message })
        } finally {
          set({ loading: false })
        }
      },

      // =====================
      // CREAR ARBITRO
      // =====================
      createArbitro: async (data) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/arbitros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })

          if (!res.ok) throw new Error("Error al crear árbitro")

          const nuevo = await res.json()
          set({ arbitros: [...get().arbitros, { ...nuevo, id: String(nuevo.id) }] })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      // =====================
      // ELIMINAR ARBITRO
      // =====================
      deleteArbitro: async (id) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/arbitros/${id}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Error al eliminar árbitro")

          set({
            arbitros: get().arbitros.filter((a) => a.id !== id),
          })
        } catch (err: any) {
          set({ error: err.message })
        } finally {
          set({ loading: false })
        }
      },

      // =====================
      // EQUIPOS
      // =====================
      createEquipo: (e) => {
        const item = { ...e, id: e.id || `eq-${Date.now()}` }
        set({ equipos: [...get().equipos, item] })
      },
      updateEquipo: (id, data) => {
        set({
          equipos: get().equipos.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })
      },
      deleteEquipo: (id) => {
        set({ equipos: get().equipos.filter((e) => e.id !== id) })
      },

      // =====================
      // CAMPEONATOS
      // =====================
      addCampeonato: (c) => {
        const item = { ...c, id: c.id || `cam-${Date.now()}` }
        set({ campeonatos: [...get().campeonato, item] })
      },
      updateCampeonato: (id, data) => {
        set({
          campeonatos: get().campeonato.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })
      },
      deleteCampeonato: (id) => {
        set({ campeonatos: get().campeonato.filter((c) => c.id !== id) })
      },

      // =====================
      // ASISTENCIAS
      // =====================
      addAsistencia: (a) => {
        const item = { ...a, id: a.id || Date.now().toString() }
        set({ asistencias: [...get().asistencias, item] })
      },
      removeAsistencia: (id) => set({ asistencias: get().asistencias.filter((x) => x.id !== id) }),

      // =====================
      // DESIGNACIONES
      // =====================
      addDesignacion: (d) => {
        const item = { ...d, id: d.id || `des-${Date.now()}` }
        set({ designaciones: [...get().designaciones, item] })
      },

      // =====================
      // UTIL
      // =====================
      loadData: () => {
        // noop for now, could fetch or initialize sample data
      },
      exportData: () => ({
        arbitros: get().arbitros,
        equipos: get().equipos,
        campeonatos: get().campeonato,
        designaciones: get().designaciones,
        asistencias: get().asistencias,
      }),
      extendDataExpiration: (days?: number) => {
        // noop
      },

    }),
    {
      name: "arbitros-storage",
      version: 2,
    },
  ),
)
