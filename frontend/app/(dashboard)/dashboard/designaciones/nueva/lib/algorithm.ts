/**
 * ALGORITMO DE DESIGNACIÓN INTELIGENTE DE ÁRBITROS
 * 
 * Implementa un algoritmo heurístico para asignar árbitros a partidos de fútbol
 * considerando:
 * - Nivel del árbitro (jerarquía)
 * - Disponibilidad (geolocalización, asistencia)
 * - Carga de trabajo (máx 2 partidos por día)
 * - Roles requeridos
 * - Diversidad y rotación
 */

import {
  Referee,
  Match,
  RefereeRole,
  AlgorithmConfig,
  AlgorithmPreset,
  RefereeScore,
  AssignmentResult,
  SimulationResult,
} from "./types"

// ============================================================
// PRESETS PREDEFINIDOS
// ============================================================

export const ALGORITHM_PRESETS: Record<AlgorithmPreset, AlgorithmConfig> = {
  calidad: {
    weightLevel: 0.6,
    weightLoad: 0.2,
    weightDiversity: 0.2,
  },
  balance: {
    weightLevel: 0.33,
    weightLoad: 0.33,
    weightDiversity: 0.34,
  },
  equitativo: {
    weightLevel: 0.2,
    weightLoad: 0.2,
    weightDiversity: 0.6,
  },
}

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

/**
 * Valida si un árbitro puede arbitrar un partido
 * Hard constraints: obligatorias
 */
export function validateRefereeForMatch(
  referee: Referee,
  match: Match,
  role: RefereeRole,
  currentAssignments: Map<number, number> // refereePCounts
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. CHECK: Disponibilidad general
  if (!referee.disponible) {
    errors.push(`${referee.nombres} no está disponible`)
  }

  // 2. CHECK: Rol requerido
  if (!referee.roles.includes(role)) {
    errors.push(`${referee.nombres} no tiene el rol: ${role}`)
  }

  // 3. CHECK: Máximo 2 partidos por día
  const refPartidosHoy = currentAssignments.get(referee.id) || 0
  if (refPartidosHoy >= 2) {
    errors.push(
      `${referee.nombres} ya tiene 2 partidos hoy (máx permitido)`
    )
  } else if (refPartidosHoy === 1) {
    warnings.push(`${referee.nombres} ya tiene 1 partido hoy`)
  }

  // 4. CHECK: Nivel mínimo para importancia del partido
  const nivelMinimoPorImportancia = Math.ceil(match.importancia / 2)
  if (referee.nivel && referee.nivel < nivelMinimoPorImportancia) {
    warnings.push(
      `Nivel ${referee.nivel} < recomendado ${nivelMinimoPorImportancia} para importancia ${match.importancia}`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================
// FUNCIONES DE SCORING
// ============================================================

/**
 * Función de scoring heurística para clasificar árbitros
 * 
 * score = (nivel * w1) + (carga * w2) + (diversidad * w3)
 * 
 * - Nivel: [0-1] Normalizado (10 = FIFA)
 * - Carga: [0-1] Inversa de partidos hoy
 * - Diversidad: [0-1] Rotación (evita siempre los mismos)
 */
export function calculateRefereeScore(
  referee: Referee,
  match: Match,
  role: RefereeRole,
  config: AlgorithmConfig,
  refereeAllAssignments: Map<number, number>, // Total assignments per referee
  currentAssignmentsToday: Map<number, number> // Assignments today
): RefereeScore {
  const breakdown = {
    levelScore: 0,
    loadScore: 0,
    diversityScore: 0,
  }

  const warnings: string[] = []
  const errors: string[] = []

  // SCORE 1: NIVEL
  // Árbitros con mayor nivel son mejores
  // Normalizar: máximo nivel es 10 (FIFA)
  const levelNormalized = (referee.nivel || 1) / 10
  breakdown.levelScore = levelNormalized

  // SCORE 2: CARGA
  // Árbitros con menos partidos hoy son mejores
  // Fórmula: 1 / (1 + partidosHoy)
  // Si tiene 0 partidos: 1 / (1 + 0) = 1.0
  // Si tiene 1 partido: 1 / (1 + 1) = 0.5
  // Si tiene 2 partidos: 1 / (1 + 2) = 0.33 (pero no debe asignarse)
  const loadPartidosHoy = currentAssignmentsToday.get(referee.id) || 0
  breakdown.loadScore = 1 / (1 + loadPartidosHoy)

  // SCORE 3: DIVERSIDAD
  // Árbitros que han arbitrado menos son mejores
  // Evita saturación de los mismos árbitros
  const totalAssignments = refereeAllAssignments.get(referee.id) || 0
  const maxAssignments = 50 // Referencia (ajustable)
  const diversityScore = 1 - Math.min(totalAssignments, maxAssignments) / maxAssignments
  breakdown.diversityScore = diversityScore

  // SCORE FINAL
  const finalScore =
    breakdown.levelScore * config.weightLevel +
    breakdown.loadScore * config.weightLoad +
    breakdown.diversityScore * config.weightDiversity

  return {
    referee,
    score: finalScore,
    breakdown,
    warnings,
    errors,
  }
}

// ============================================================
// BÚSQUEDA DE CANDIDATOS
// ============================================================

/**
 * Encuentra los mejores candidatos para un rol en un partido
 */
export function findCandidatesForRole(
  referees: Referee[],
  match: Match,
  role: RefereeRole,
  config: AlgorithmConfig,
  refereeAllAssignments: Map<number, number>,
  currentAssignmentsToday: Map<number, number>
): RefereeScore[] {
  return (
    referees
      .map((referee) => {
        // Validar si puede arbitrar
        const validation = validateRefereeForMatch(
          referee,
          match,
          role,
          currentAssignmentsToday
        )

        if (!validation.isValid) {
          return {
            referee,
            score: -999,
            breakdown: { levelScore: 0, loadScore: 0, diversityScore: 0 },
            warnings: validation.warnings,
            errors: validation.errors,
          }
        }

        // Calcular score
        const scored = calculateRefereeScore(
          referee,
          match,
          role,
          config,
          refereeAllAssignments,
          currentAssignmentsToday
        )

        return {
          ...scored,
          warnings: [...scored.warnings, ...validation.warnings],
        }
      })
      // Ordenar por score descendente
      .sort((a, b) => b.score - a.score)
  )
}

// ============================================================
// ALGORITMO PRINCIPAL
// ============================================================

/**
 * Asigna árbitros a múltiples partidos de forma automática
 */
export function assignReferees(
  matches: Match[],
  referees: Referee[],
  config: AlgorithmConfig
): SimulationResult {
  const result: SimulationResult = {
    successCount: 0,
    errorCount: 0,
    totalMatches: 0,
    assignments: [],
    errors: [],
    statistics: {
      averageScore: 0,
      averageLoadPerReferee: 0,
      diversityMetric: 0,
    },
    timestamp: new Date().toISOString(),
  }

  // Mapas para tracking
  const refereeAllAssignments = new Map<number, number>()
  const currentAssignmentsToday = new Map<number, number>()
  const assignedReferees = new Map<number, RefereeRole[]>()

  // Inicializar mapas
  referees.forEach((ref) => {
    refereeAllAssignments.set(ref.id, 0)
    currentAssignmentsToday.set(ref.id, ref.partidosHoy || 0)
    assignedReferees.set(ref.id, [])
  })

  // Los partidos deben ordenarse por importancia DESC y fecha ASC
  const sortedMatches = [...matches].sort((a, b) => {
    if (b.importancia !== a.importancia) {
      return b.importancia - a.importancia
    }
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })

  // Procesar cada partido
  sortedMatches.forEach((match) => {
    result.totalMatches++

    // Procesar cada rol requerido
    match.rolesRequeridos.forEach((role) => {
      // Encontrar candidatos
      const candidates = findCandidatesForRole(
        referees,
        match,
        role,
        config,
        refereeAllAssignments,
        currentAssignmentsToday
      )

      // Seleccionar el mejor candidato
      const selectedCandidate = candidates.find((c) => c.score > 0)

      const assignmentResult: AssignmentResult = {
        match,
        role,
        selectedReferee: selectedCandidate?.referee || null,
        candidates,
        warnings: selectedCandidate?.warnings || [],
      }

      if (selectedCandidate) {
        // Actualizar estado
        const refId = selectedCandidate.referee.id
        currentAssignmentsToday.set(
          refId,
          (currentAssignmentsToday.get(refId) || 0) + 1
        )
        refereeAllAssignments.set(
          refId,
          (refereeAllAssignments.get(refId) || 0) + 1
        )

        const roles = assignedReferees.get(refId) || []
        roles.push(role)
        assignedReferees.set(refId, roles)

        result.successCount++
      } else {
        // Error: no hay candidatos
        assignmentResult.error = `No hay árbitros disponibles para ${role} en este partido`
        result.errorCount++
        result.errors.push({
          matchId: match.id,
          role,
          error: assignmentResult.error,
        })
      }

      result.assignments.push(assignmentResult)
    })
  })

  // Calcular estadísticas
  let totalScore = 0
  let validAssignments = 0

  result.assignments.forEach((a) => {
    if (a.selectedReferee) {
      const best = a.candidates.find((c) => c.referee.id === a.selectedReferee?.id)
      if (best) {
        totalScore += best.score
        validAssignments++
      }
    }
  })

  result.statistics.averageScore = validAssignments > 0 ? totalScore / validAssignments : 0

  let totalLoadToday = 0
  currentAssignmentsToday.forEach((count) => {
    totalLoadToday += count
  })
  result.statistics.averageLoadPerReferee =
    totalLoadToday / Math.max(referees.length, 1)

  // Diversidad: qué tan distribuido está el trabajo
  let diversityScore = 0
  refereeAllAssignments.forEach((count) => {
    const normalized = count / Math.max(...refereeAllAssignments.values(), 1)
    diversityScore += Math.abs(0.5 - normalized)
  })
  result.statistics.diversityMetric = 1 - diversityScore / referees.length

  return result
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Obtiene el preset de configuración según el nombre
 */
export function getPreset(preset: AlgorithmPreset): AlgorithmConfig {
  return ALGORITHM_PRESETS[preset]
}

/**
 * Formatea un score para display (0-100)
 */
export function formatScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)))
}
