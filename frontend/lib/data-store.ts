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
  circuitos: Campeonato[]
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

  // Campeonatos
  addCampeonato: (c: Campeonato) => void
  updateCampeonato: (id: string, data: Partial<Campeonato>) => void
  deleteCampeonato: (id: string) => void

  // Asistencias
  addAsistencia: (a: Asistencia) => void
  removeAsistencia: (id: string) => void

  // designaciones
  addDesignacion: (d: Designacion) => void

  loadData: () => void
  exportData?: () => any
  extendDataExpiration?: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"

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
      createEquipo: async (e) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/equipos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al crear equipo")
          }

          const nuevo = await res.json()
          const item = { ...nuevo, id: String(nuevo.id) }
          set({ equipos: [...get().equipos, item] })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },
      updateEquipo: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/equipos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al actualizar equipo")
          }

          const updated = await res.json()
          set({
            equipos: get().equipos.map((e) =>
              e.id === id ? { ...e, ...updated } : e
            ),
          })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },
      deleteEquipo: async (id) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/equipos/${id}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al eliminar equipo")
          }

          set({ equipos: get().equipos.filter((e) => e.id !== id) })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      // =====================
      // CAMPEONATOS
      // =====================
      addCampeonato: async (c) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/campeonato`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(c),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al crear campeonato")
          }

          const nuevo = await res.json()
          const item = { ...nuevo, id: String(nuevo.id) }
          set({ campeonatos: [...get().campeonatos, item] })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },
      updateCampeonato: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/campeonato/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al actualizar campeonato")
          }

          const updated = await res.json()
          set({
            campeonatos: get().campeonatos.map((c) =>
              c.id === id ? { ...c, ...updated } : c
            ),
          })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      },
      deleteCampeonato: async (id) => {
        set({ loading: true, error: null })
        try {
          const res = await fetch(`${API_URL}/campeonato/${id}`, {
            method: "DELETE",
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.message || "Error al eliminar campeonato")
          }

          set({ campeonatos: get().campeonatos.filter((c) => c.id !== id) })
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
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
      loadData: async () => {
        set({ loading: true, error: null })
        try {
          // Cargar árbitros
          const arbitrosRes = await fetch(`${API_URL}/arbitros`)
          if (arbitrosRes.ok) {
            const arbitrosData = await arbitrosRes.json()
            const normalizedArbitros = (arbitrosData || []).map((d: any) => ({ ...d, id: String(d.id) }))
            set({ arbitros: normalizedArbitros })
          }

          // Cargar equipos
          const equiposRes = await fetch(`${API_URL}/equipos`)
          if (equiposRes.ok) {
            const equiposData = await equiposRes.json()
            const normalizedEquipos = (equiposData || []).map((d: any) => ({ ...d, id: String(d.id) }))
            set({ equipos: normalizedEquipos })
          }

          // Cargar Campeonatos
          const champsRes = await fetch(`${API_URL}/campeonato`)
          if (champsRes.ok) {
            const champsData = await champsRes.json()
            const normalizedChamps = (champsData || []).map((d: any) => ({ ...d, id: String(d.id), nivelDificultad: d.nivelDificultad || "Medio" }))
            set({ campeonatos: normalizedChamps, circuitos: normalizedChamps })
          }

          // Cargar asistencias
          const asistsRes = await fetch(`${API_URL}/asistencias`)
          if (asistsRes.ok) {
            const asistsData = await asistsRes.json()
            const normalizedAsists = (asistsData || []).map((d: any) => ({ 
              ...d, 
              id: String(d.id), 
              arbitroId: String(d.idAribro || d.idAritro || d.idArbitro || d.arbitrId || d.arbitroId || d.id),
              presente: d.estado === 'presente' || d.estado === 'presente' || d.presente === true
            }))
            set({ assistencias: normalizedAsists })
          }

        } catch (err: any) {
          console.error("Error cargando datos:", err)
          set({ error: err.message })
        } finally {
          set({ loading: false })
        }
      },
      exportData: () => ({
        arbitros: get().arbitros,
        equipos: get().equipos,
        campeonatos: get().campeonatos,
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
