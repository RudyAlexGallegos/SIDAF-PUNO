/**
 * ESTADO GLOBAL - DESIGNACIÓN DE ÁRBITROS
 * Usando Zustand para gestión de estado
 */

import { create } from "zustand"
import {
  Championship,
  Stage,
  Match,
  Referee,
  UIState,
  AlgorithmConfig,
  AlgorithmPreset,
  SimulationResult,
  RefereeRole,
  ValidationError,
} from "../lib/types"
import { ALGORITHM_PRESETS } from "../lib/algorithm"

interface DesignationStore extends UIState {
  // Data
  championships: Championship[]
  referees: Referee[]
  allMatches: Match[]
  validationErrors: ValidationError[]
  
  // Ensure UIState properties are explicitly available for destructuring
  selectedChampionship: Championship | null
  selectedStage: Stage | null
  selectedMatches: string[]
  algorithmConfig: AlgorithmConfig
  algorithmPreset: AlgorithmPreset
  simulationResult: SimulationResult | null
  isSimulating: boolean
  showSimulationResult: boolean
  manualAssignmentMode: boolean
  selectedMatchForManual: Match | null
  selectedRoleForManual: RefereeRole | null

  // Actions - Data Management
  setChampionships: (data: Championship[]) => void
  setReferees: (data: Referee[]) => void
  setMatches: (data: Match[]) => void

  // Actions - Selection
  selectChampionship: (championship: Championship | null) => void
  selectStage: (stage: Stage | null) => void
  toggleMatchSelection: (matchId: string) => void
  clearMatchSelection: () => void

  // Actions - Algorithm
  setAlgorithmConfig: (config: AlgorithmConfig) => void
  setAlgorithmPreset: (preset: AlgorithmPreset) => void
  setSimulationResult: (result: SimulationResult | null) => void
  setIsSimulating: (isSimulating: boolean) => void
  setShowSimulationResult: (show: boolean) => void

  // Actions - Manual Assignment
  setManualAssignmentMode: (enabled: boolean) => void
  selectMatchForManual: (match: Match | null) => void
  selectRoleForManual: (role: RefereeRole | null) => void

  // Actions - Validation
  setValidationErrors: (errors: ValidationError[]) => void

  // Helpers
  getSelectedMatches: () => Match[]
  getMatchesforStage: () => Match[]
  reset: () => void
}

const initialUIState: UIState = {
  selectedChampionship: null,
  selectedStage: null,
  selectedMatches: [],
  algorithmConfig: ALGORITHM_PRESETS.balance,
  algorithmPreset: AlgorithmPreset.BALANCE,
  simulationResult: null,
  isSimulating: false,
  showSimulationResult: false,
  manualAssignmentMode: false,
  selectedMatchForManual: null,
  selectedRoleForManual: null,
}

export const useDesignationStore = create<DesignationStore>((set, get) => ({
  // State
  ...initialUIState,
  championships: [],
  referees: [],
  allMatches: [],
  validationErrors: [],

  // Actions - Data Management
  setChampionships: (data: Championship[]) => set({ championships: data }),
  setReferees: (data: Referee[]) => set({ referees: data }),
  setMatches: (data: Match[]) => set({ allMatches: data }),

  // Actions - Selection
  selectChampionship: (championship: Championship | null) => {
    set({
      selectedChampionship: championship,
      selectedStage: null, // Reset stage when championship changes
      selectedMatches: [],
    })
  },

  selectStage: (stage: Stage | null) => {
    set({
      selectedStage: stage,
      selectedMatches: [], // Reset matches when stage changes
    })
  },

  toggleMatchSelection: (matchId: string) => {
    set((state) => {
      const isSelected = state.selectedMatches.includes(matchId)
      return {
        selectedMatches: isSelected
          ? state.selectedMatches.filter((id) => id !== matchId)
          : [...state.selectedMatches, matchId],
      }
    })
  },

  clearMatchSelection: () => set({ selectedMatches: [] }),

  // Actions - Algorithm
  setAlgorithmConfig: (config: AlgorithmConfig) => {
    set({ algorithmConfig: config })
  },

  setAlgorithmPreset: (preset: AlgorithmPreset) => {
    set({
      algorithmPreset: preset,
      algorithmConfig: ALGORITHM_PRESETS[preset],
    })
  },

  setSimulationResult: (result: SimulationResult | null) => {
    set({ simulationResult: result })
  },

  setIsSimulating: (isSimulating: boolean) => {
    set({ isSimulating })
  },

  setShowSimulationResult: (show: boolean) => {
    set({ showSimulationResult: show })
  },

  // Actions - Manual Assignment
  setManualAssignmentMode: (enabled: boolean) => {
    set({
      manualAssignmentMode: enabled,
      selectedMatchForManual: null,
      selectedRoleForManual: null,
    })
  },

  selectMatchForManual: (match: Match | null) => {
    set({ selectedMatchForManual: match })
  },

  selectRoleForManual: (role: RefereeRole | null) => {
    set({ selectedRoleForManual: role })
  },

  // Actions - Validation
  setValidationErrors: (errors: ValidationError[]) => {
    set({ validationErrors: errors })
  },

  // Helpers
  getSelectedMatches: () => {
    const { selectedMatches, allMatches } = get()
    return allMatches.filter((m) => selectedMatches.includes(m.id))
  },

  getMatchesforStage: () => {
    const { selectedStage, allMatches } = get()
    if (!selectedStage) return []
    return allMatches.filter((m) => m.idEtapa === selectedStage.id)
  },

  reset: () => {
    set({
      ...initialUIState,
      championships: get().championships,
      referees: get().referees,
      allMatches: get().allMatches,
    })
  },
}))
