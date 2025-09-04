import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Arbitro {
  id: string
  nombre: string
  apellido: string
  categoria: "FIFA" | "Nacional" | "Regional" | "Provincial"
  experiencia: number
  disponible: boolean
  telefono?: string
  email?: string
  fechaNacimiento?: string
  direccion?: string
  observaciones?: string
  fechaRegistro: string
  nivelPreparacion: number
}

export interface Campeonato {
  id: string
  nombre: string
  nivelDificultad: "Alto" | "Medio" | "Bajo"
  categoria: string
  equipos: number
  fechaInicio: string
  estado: "programado" | "activo" | "finalizado"
  descripcion?: string
  fechaRegistro: string
}

export interface Designacion {
  id: string
  campeonatoId: string
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  estadio: string
  arbitroPrincipal: string
  arbitroAsistente1: string
  arbitroAsistente2: string
  cuartoArbitro: string
  observaciones?: string
  fechaRegistro: string
}

export interface Asistencia {
  id: string
  arbitroId: string
  fecha: string
  presente: boolean
  tipoActividad: "preparacion_fisica" | "entrenamiento"
  observaciones?: string
}

interface DataStore {
  // Datos
  arbitros: Arbitro[]
  campeonatos: Campeonato[]
  designaciones: Designacion[]
  asistencias: Asistencia[]

  // Metadata
  dataExpiration: string | null
  lastBackup: string | null

  // Acciones para árbitros
  addArbitro: (arbitro: Omit<Arbitro, "id" | "fechaRegistro">) => void
  updateArbitro: (id: string, updates: Partial<Arbitro>) => void
  deleteArbitro: (id: string) => void

  // Acciones para campeonatos
  addCampeonato: (campeonato: Omit<Campeonato, "id" | "fechaRegistro">) => void
  updateCampeonato: (id: string, updates: Partial<Campeonato>) => void
  deleteCampeonato: (id: string) => void

  // Acciones para designaciones
  addDesignacion: (designacion: Omit<Designacion, "id" | "fechaRegistro">) => void
  updateDesignacion: (id: string, updates: Partial<Designacion>) => void
  deleteDesignacion: (id: string) => void

  // Acciones para asistencias
  addAsistencia: (asistencia: Omit<Asistencia, "id">) => void
  updateAsistencia: (id: string, updates: Partial<Asistencia>) => void
  removeAsistencia: (id: string) => void

  // Utilidades
  loadData: () => void
  exportData: () => string
  importData: (data: string) => void
  extendDataExpiration: (days: number) => void
  getDaysUntilExpiration: () => number
  isDataExpired: () => boolean
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      arbitros: [],
      campeonatos: [],
      designaciones: [],
      asistencias: [],
      dataExpiration: null,
      lastBackup: null,

      // Acciones para árbitros
      addArbitro: (arbitroData) => {
        const arbitro: Arbitro = {
          ...arbitroData,
          id: generateId(),
          fechaRegistro: new Date().toISOString(),
          nivelPreparacion: Math.floor(Math.random() * 40) + 60, // 60-100%
        }
        set((state) => ({
          arbitros: [...state.arbitros, arbitro],
        }))
      },

      updateArbitro: (id, updates) => {
        set((state) => ({
          arbitros: state.arbitros.map((arbitro) => (arbitro.id === id ? { ...arbitro, ...updates } : arbitro)),
        }))
      },

      deleteArbitro: (id) => {
        set((state) => ({
          arbitros: state.arbitros.filter((arbitro) => arbitro.id !== id),
          // También eliminar asistencias relacionadas
          asistencias: state.asistencias.filter((asistencia) => asistencia.arbitroId !== id),
        }))
      },

      // Acciones para campeonatos
      addCampeonato: (campeonatoData) => {
        const campeonato: Campeonato = {
          ...campeonatoData,
          id: generateId(),
          fechaRegistro: new Date().toISOString(),
        }
        set((state) => ({
          campeonatos: [...state.campeonatos, campeonato],
        }))
      },

      updateCampeonato: (id, updates) => {
        set((state) => ({
          campeonatos: state.campeonatos.map((campeonato) =>
            campeonato.id === id ? { ...campeonato, ...updates } : campeonato,
          ),
        }))
      },

      deleteCampeonato: (id) => {
        set((state) => ({
          campeonatos: state.campeonatos.filter((campeonato) => campeonato.id !== id),
          // También eliminar designaciones relacionadas
          designaciones: state.designaciones.filter((designacion) => designacion.campeonatoId !== id),
        }))
      },

      // Acciones para designaciones
      addDesignacion: (designacionData) => {
        const designacion: Designacion = {
          ...designacionData,
          id: generateId(),
          fechaRegistro: new Date().toISOString(),
        }
        set((state) => ({
          designaciones: [...state.designaciones, designacion],
        }))
      },

      updateDesignacion: (id, updates) => {
        set((state) => ({
          designaciones: state.designaciones.map((designacion) =>
            designacion.id === id ? { ...designacion, ...updates } : designacion,
          ),
        }))
      },

      deleteDesignacion: (id) => {
        set((state) => ({
          designaciones: state.designaciones.filter((designacion) => designacion.id !== id),
        }))
      },

      // Acciones para asistencias
      addAsistencia: (asistenciaData) => {
        const asistencia: Asistencia = {
          ...asistenciaData,
          id: generateId(),
        }
        set((state) => ({
          asistencias: [...state.asistencias, asistencia],
        }))
      },

      updateAsistencia: (id, updates) => {
        set((state) => ({
          asistencias: state.asistencias.map((asistencia) =>
            asistencia.id === id ? { ...asistencia, ...updates } : asistencia,
          ),
        }))
      },

      removeAsistencia: (id) => {
        set((state) => ({
          asistencias: state.asistencias.filter((asistencia) => asistencia.id !== id),
        }))
      },

      // Utilidades
      loadData: () => {
        // Inicializar expiración si no existe
        const state = get()
        if (!state.dataExpiration) {
          const expiration = new Date()
          expiration.setDate(expiration.getDate() + 30) // 30 días por defecto
          set({ dataExpiration: expiration.toISOString() })
        }
      },

      exportData: () => {
        const state = get()
        return JSON.stringify(
          {
            arbitros: state.arbitros,
            campeonatos: state.campeonatos,
            designaciones: state.designaciones,
            asistencias: state.asistencias,
            exportDate: new Date().toISOString(),
          },
          null,
          2,
        )
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            arbitros: parsed.arbitros || [],
            campeonatos: parsed.campeonatos || [],
            designaciones: parsed.designaciones || [],
            asistencias: parsed.asistencias || [],
            lastBackup: new Date().toISOString(),
          })
        } catch (error) {
          console.error("Error importing data:", error)
        }
      },

      extendDataExpiration: (days) => {
        const newExpiration = new Date()
        newExpiration.setDate(newExpiration.getDate() + days)
        set({ dataExpiration: newExpiration.toISOString() })
      },

      getDaysUntilExpiration: () => {
        const state = get()
        if (!state.dataExpiration) return 30

        const expiration = new Date(state.dataExpiration)
        const now = new Date()
        const diffTime = expiration.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return Math.max(0, diffDays)
      },

      isDataExpired: () => {
        const state = get()
        if (!state.dataExpiration) return false

        const expiration = new Date(state.dataExpiration)
        const now = new Date()

        return now > expiration
      },
    }),
    {
      name: "arbitros-storage",
      version: 1,
    },
  ),
)
