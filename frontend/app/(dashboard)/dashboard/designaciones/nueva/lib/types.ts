/**
 * TIPOS Y INTERFACES PARA EL SISTEMA DE DESIGNACIÓN DE ÁRBITROS
 */

// ============================================================
// ENUMS
// ============================================================

export enum RefereeRole {
  PRINCIPAL = "principal",
  ASISTENTE_1 = "asistente1",
  ASISTENTE_2 = "asistente2",
  CUARTO = "cuarto",
  VAR = "var",
  AVAR = "avar",
}

export enum MatchStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum StageStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  FINISHED = "finished",
}

// ============================================================
// INTERFACES - DOMINIO
// ============================================================

export interface Referee {
  id: number
  nombres?: string
  apellido?: string
  nombre?: string
  dni?: string
  categoria?: string
  nivel?: number // 1-10, donde 10 = FIFA
  especialidad?: string
  experiencia?: number
  roles: RefereeRole[]
  disponible: boolean
  partidosHoy: number
  ultimosEquiposParados?: number[] // IDs de últimos equipos donde arbitró
  fechaUltimaDesignacion?: string
}

export interface Team {
  id: number
  nombre: string
  categoria?: string
  provincia?: string
  estadio?: string
}

export interface Match {
  id: string
  idCampeonato: number
  idEtapa: number
  equipoLocal: Team
  equipoVisitante: Team
  fecha: string
  hora: string
  estadio: string
  importancia: number // 1-10
  rolesRequeridos: RefereeRole[]
  status: MatchStatus
  designaciones: Record<RefereeRole, number | null>
  observaciones?: string
  createdAt: string
}

export interface Stage {
  id: number
  nombre: string
  idCampeonato: number
  fecha_inicio: string
  fecha_fin: string
  status: StageStatus
  orden: number
  descripcion?: string
}

export interface Championship {
  id: number
  nombre: string
  categoria?: string
  estado?: string
  numeroEquipos?: number
  etapas: Stage[]
  etapaActiva?: Stage
}

// ============================================================
// INTERFACES - ALGORITMO
// ============================================================

export interface AlgorithmConfig {
  weightLevel: number
  weightLoad: number
  weightDiversity: number
}

export enum AlgorithmPreset {
  CALIDAD = "calidad",
  BALANCE = "balance",
  EQUITATIVO = "equitativo",
}

export interface RefereeScore {
  referee: Referee
  score: number
  breakdown: {
    levelScore: number
    loadScore: number
    diversityScore: number
  }
  warnings: string[]
  errors: string[]
}

export interface AssignmentResult {
  match: Match
  role: RefereeRole
  selectedReferee: Referee | null
  candidates: RefereeScore[]
  error?: string
  warnings: string[]
}

export interface SimulationResult {
  successCount: number
  errorCount: number
  totalMatches: number
  assignments: AssignmentResult[]
  errors: Array<{
    matchId: string
    role: RefereeRole
    error: string
  }>
  statistics: {
    averageScore: number
    averageLoadPerReferee: number
    diversityMetric: number
  }
  timestamp: string
}

// ============================================================
// INTERFACES - UI STATE
// ============================================================

export interface UIState {
  selectedChampionship: Championship | null
  selectedStage: Stage | null
  selectedMatches: string[] // Match IDs
  algorithmConfig: AlgorithmConfig
  algorithmPreset: AlgorithmPreset
  simulationResult: SimulationResult | null
  isSimulating: boolean
  showSimulationResult: boolean
  manualAssignmentMode: boolean
  selectedMatchForManual: Match | null
  selectedRoleForManual: RefereeRole | null
}

export interface ValidationError {
  code: string
  message: string
  severity: "error" | "warning" | "info"
  matchId?: string
  role?: RefereeRole
}
