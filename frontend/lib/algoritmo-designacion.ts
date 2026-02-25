// Definición de tipos
export interface Arbitro {
  id: string
  nombre: string
  categoria: "FIFA" | "Nacional" | "Regional" | "Provincial"
  nivelPreparacion: number // 0-100
  experiencia: number // años
  disponible: boolean
  ultimaDesignacion?: Date
  especialidad?: "Principal" | "Asistente" | "VAR"
}

export interface Campeonato {
  id: string
  nombre: string
  nivelDificultad: "Alto" | "Medio" | "Bajo"
  categoria: string
  equipos: number
}

export interface Partido {
  id: string
  campeonatoId: string
  equipoLocal: string
  equipoVisitante: string
  fecha: Date
  estadio: string
  importancia?: "Alta" | "Media" | "Baja"
}

export interface Designacion {
  id: string
  partidoId: string
  arbitroPrincipal: string
  arbitroAsistente1: string
  arbitroAsistente2: string
  cuartoArbitro: string
  varArbitro?: string
  fechaDesignacion: Date
}

// Algoritmo de designación inteligente
export function designarArbitros(
  partido: Partido,
  campeonato: Campeonato,
  arbitrosDisponibles: Arbitro[],
): Designacion | null {
  // Si no hay suficientes árbitros disponibles, no se puede hacer la designación
  if (arbitrosDisponibles.length < 4) {
    return null
  }

  // Filtrar árbitros disponibles
  const arbitrosFiltered = arbitrosDisponibles.filter((a) => a.disponible)

  // Determinar requisitos según nivel de dificultad
  const requisitosNivelPreparacion = {
    Alto: 85,
    Medio: 70,
    Bajo: 50,
  }

  const requisitosExperiencia = {
    Alto: 5,
    Medio: 3,
    Bajo: 1,
  }

  const requisitosCategoriaArbitro = {
    Alto: ["FIFA", "Nacional"],
    Medio: ["FIFA", "Nacional", "Regional"],
    Bajo: ["FIFA", "Nacional", "Regional", "Provincial"],
  }

  // Filtrar árbitros que cumplen con los requisitos mínimos para el nivel de dificultad
  const arbitrosCalificados = arbitrosFiltered.filter((arbitro) => {
    const cumpleNivelPreparacion = arbitro.nivelPreparacion >= requisitosNivelPreparacion[campeonato.nivelDificultad]
    const cumpleExperiencia = arbitro.experiencia >= requisitosExperiencia[campeonato.nivelDificultad]
    const cumpleCategoria = requisitosCategoriaArbitro[campeonato.nivelDificultad].includes(arbitro.categoria)

    return cumpleNivelPreparacion && cumpleExperiencia && cumpleCategoria
  })

  // Si no hay suficientes árbitros calificados, no se puede hacer la designación
  if (arbitrosCalificados.length < 4) {
    return null
  }

  // Ordenar árbitros por nivel de preparación y experiencia (ponderado)
  const arbitrosOrdenados = [...arbitrosCalificados].sort((a, b) => {
    const puntajeA = a.nivelPreparacion * 0.7 + a.experiencia * 5 * 0.3
    const puntajeB = b.nivelPreparacion * 0.7 + b.experiencia * 5 * 0.3
    return puntajeB - puntajeA // Orden descendente
  })

  // Seleccionar árbitros según su especialidad y categoría
  const arbitroPrincipal =
    arbitrosOrdenados.find(
      (a) => a.categoria === "FIFA" || a.categoria === "Nacional" || a.especialidad === "Principal",
    ) || arbitrosOrdenados[0]

  // Remover el árbitro principal de la lista para no seleccionarlo nuevamente
  const arbitrosRestantes = arbitrosOrdenados.filter((a) => a.id !== arbitroPrincipal.id)

  // Seleccionar asistentes (preferiblemente con especialidad de asistente)
  const asistentes = arbitrosRestantes
    .sort((a, b) => {
      // Priorizar árbitros con especialidad de asistente
      if (a.especialidad === "Asistente" && b.especialidad !== "Asistente") return -1
      if (a.especialidad !== "Asistente" && b.especialidad === "Asistente") return 1
      return 0
    })
    .slice(0, 2)

  // Seleccionar cuarto árbitro (puede ser de menor categoría)
  const arbitrosSinAsistentes = arbitrosRestantes.filter((a) => !asistentes.some((asistente) => asistente.id === a.id))

  const cuartoArbitro = arbitrosSinAsistentes[0]

  // Si no hay suficientes árbitros para todas las posiciones, no se puede hacer la designación
  if (!arbitroPrincipal || asistentes.length < 2 || !cuartoArbitro) {
    return null
  }

  // Crear la designación
  return {
    id: `des-${Date.now()}`,
    partidoId: partido.id,
    arbitroPrincipal: arbitroPrincipal.id,
    arbitroAsistente1: asistentes[0].id,
    arbitroAsistente2: asistentes[1].id,
    cuartoArbitro: cuartoArbitro.id,
    fechaDesignacion: new Date(),
  }
}

// Función para evaluar la calidad de una designación
export function evaluarCalidadDesignacion(
  designacion: Designacion,
  arbitros: Arbitro[],
  partido: Partido,
  campeonato: Campeonato,
): number {
  // Obtener los árbitros designados
  const principal = arbitros.find((a) => a.id === designacion.arbitroPrincipal)
  const asistente1 = arbitros.find((a) => a.id === designacion.arbitroAsistente1)
  const asistente2 = arbitros.find((a) => a.id === designacion.arbitroAsistente2)
  const cuarto = arbitros.find((a) => a.id === designacion.cuartoArbitro)

  if (!principal || !asistente1 || !asistente2 || !cuarto) {
    return 0 // Designación inválida
  }

  // Calcular puntaje basado en la adecuación de los árbitros al partido
  let puntaje = 0
  const nivelDificultad = campeonato.nivelDificultad

  // Evaluar árbitro principal (mayor peso)
  if (nivelDificultad === "Alto" && principal.categoria === "FIFA") puntaje += 40
  else if (nivelDificultad === "Alto" && principal.categoria === "Nacional") puntaje += 30
  else if (nivelDificultad === "Medio" && ["FIFA", "Nacional"].includes(principal.categoria)) puntaje += 35
  else if (nivelDificultad === "Medio" && principal.categoria === "Regional") puntaje += 25
  else if (nivelDificultad === "Bajo") puntaje += 30
  else puntaje += 15

  // Evaluar nivel de preparación del principal
  puntaje += (principal.nivelPreparacion / 100) * 20

  // Evaluar asistentes (peso medio)
  const puntajeAsistentes = [asistente1, asistente2].reduce((total, asistente) => {
    let puntos = 0
    if (["FIFA", "Nacional"].includes(asistente.categoria)) puntos += 10
    else if (asistente.categoria === "Regional") puntos += 7
    else puntos += 5

    // Nivel de preparación
    puntos += (asistente.nivelPreparacion / 100) * 5

    return total + puntos
  }, 0)

  puntaje += puntajeAsistentes

  // Evaluar cuarto árbitro (menor peso)
  puntaje += (cuarto.nivelPreparacion / 100) * 5

  // Normalizar a escala 0-100
  return Math.min(100, puntaje)
}
