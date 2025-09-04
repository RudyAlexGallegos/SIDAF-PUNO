import type { Arbitro, Campeonato, Partido, Designacion, Asistencia } from "./data-store"

// Función mejorada que considera la asistencia
export function designarArbitrosMejorado(
  partido: Partido,
  campeonato: Campeonato,
  arbitrosDisponibles: Arbitro[],
  asistencias: Asistencia[],
): Designacion | null {
  if (arbitrosDisponibles.length < 4) {
    return null
  }

  const arbitrosFiltered = arbitrosDisponibles.filter((a) => a.disponible)

  // Requisitos según nivel de dificultad
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

  // Calcular puntaje de asistencia para cada árbitro
  const calcularPuntajeAsistencia = (arbitroId: string): number => {
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)

    const asistenciasRecientes = asistencias.filter(
      (a) => a.arbitroId === arbitroId && new Date(a.fecha) >= hace4Semanas && a.presente,
    )

    // Máximo 16 sesiones en 4 semanas (4 días x 4 semanas)
    const porcentajeAsistencia = Math.min(100, (asistenciasRecientes.length / 16) * 100)

    // Bonificación por tipo de actividad
    const preparacionFisica = asistenciasRecientes.filter((a) => a.tipoActividad === "preparacion_fisica").length
    const entrenamientos = asistenciasRecientes.filter((a) => a.tipoActividad === "entrenamiento").length

    // Puntaje base por asistencia + bonificación por balance
    let puntaje = porcentajeAsistencia

    // Bonificación si tiene buen balance entre preparación física y entrenamientos
    if (preparacionFisica >= 8 && entrenamientos >= 2) {
      puntaje += 10 // Bonificación por asistencia completa
    }

    return Math.min(100, puntaje)
  }

  // Filtrar árbitros que cumplen requisitos básicos
  const arbitrosCalificados = arbitrosFiltered.filter((arbitro) => {
    const cumpleNivelPreparacion = arbitro.nivelPreparacion >= requisitosNivelPreparacion[campeonato.nivelDificultad]
    const cumpleExperiencia = arbitro.experiencia >= requisitosExperiencia[campeonato.nivelDificultad]
    const cumpleCategoria = requisitosCategoriaArbitro[campeonato.nivelDificultad].includes(arbitro.categoria)

    // Requisito mínimo de asistencia según dificultad
    const puntajeAsistencia = calcularPuntajeAsistencia(arbitro.id)
    const requisitoAsistencia = {
      Alto: 75,
      Medio: 60,
      Bajo: 40,
    }
    const cumpleAsistencia = puntajeAsistencia >= requisitoAsistencia[campeonato.nivelDificultad]

    return cumpleNivelPreparacion && cumpleExperiencia && cumpleCategoria && cumpleAsistencia
  })

  if (arbitrosCalificados.length < 4) {
    return null
  }

  // Calcular puntaje total para cada árbitro
  const arbitrosConPuntaje = arbitrosCalificados.map((arbitro) => {
    const puntajePreparacion = arbitro.nivelPreparacion * 0.3
    const puntajeExperiencia = Math.min(arbitro.experiencia * 5, 50) * 0.2
    const puntajeAsistencia = calcularPuntajeAsistencia(arbitro.id) * 0.4

    // Bonificación por categoría
    const bonificacionCategoria =
      {
        FIFA: 20,
        Nacional: 15,
        Regional: 10,
        Provincial: 5,
      }[arbitro.categoria] * 0.1

    const puntajeTotal = puntajePreparacion + puntajeExperiencia + puntajeAsistencia + bonificacionCategoria

    return {
      arbitro,
      puntajeTotal,
      puntajeAsistencia: calcularPuntajeAsistencia(arbitro.id),
    }
  })

  // Ordenar por puntaje total
  const arbitrosOrdenados = arbitrosConPuntaje.sort((a, b) => b.puntajeTotal - a.puntajeTotal)

  // Seleccionar árbitro principal (mejor puntaje)
  const arbitroPrincipal = arbitrosOrdenados[0].arbitro

  // Seleccionar asistentes (evitar conflictos y buscar complementariedad)
  const arbitrosRestantes = arbitrosOrdenados.slice(1)
  const asistentes = arbitrosRestantes.slice(0, 2).map((a) => a.arbitro)

  // Seleccionar cuarto árbitro
  const cuartoArbitro = arbitrosRestantes.slice(2)[0]?.arbitro

  if (!arbitroPrincipal || asistentes.length < 2 || !cuartoArbitro) {
    return null
  }

  return {
    id: `des-${Date.now()}`,
    partidoId: partido.id,
    campeonatoId: partido.campeonatoId,
    equipoLocal: partido.equipoLocal,
    equipoVisitante: partido.equipoVisitante,
    fecha: partido.fecha,
    estadio: partido.estadio,
    arbitroPrincipal: arbitroPrincipal.id,
    arbitroAsistente1: asistentes[0].id,
    arbitroAsistente2: asistentes[1].id,
    cuartoArbitro: cuartoArbitro.id,
    fechaDesignacion: new Date().toISOString(),
  }
}

// Función para evaluar la calidad de una designación considerando asistencia
export function evaluarCalidadDesignacionMejorada(
  designacion: Designacion,
  arbitros: Arbitro[],
  partido: Partido,
  campeonato: Campeonato,
  asistencias: Asistencia[],
): number {
  const principal = arbitros.find((a) => a.id === designacion.arbitroPrincipal)
  const asistente1 = arbitros.find((a) => a.id === designacion.arbitroAsistente1)
  const asistente2 = arbitros.find((a) => a.id === designacion.arbitroAsistente2)
  const cuarto = arbitros.find((a) => a.id === designacion.cuartoArbitro)

  if (!principal || !asistente1 || !asistente2 || !cuarto) {
    return 0
  }

  // Calcular puntaje de asistencia
  const calcularPuntajeAsistencia = (arbitroId: string): number => {
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)

    const asistenciasRecientes = asistencias.filter(
      (a) => a.arbitroId === arbitroId && new Date(a.fecha) >= hace4Semanas && a.presente,
    )

    return Math.min(100, (asistenciasRecientes.length / 16) * 100)
  }

  let puntaje = 0
  const nivelDificultad = campeonato.nivelDificultad

  // Evaluar árbitro principal (40% del puntaje)
  if (nivelDificultad === "Alto" && principal.categoria === "FIFA") puntaje += 25
  else if (nivelDificultad === "Alto" && principal.categoria === "Nacional") puntaje += 20
  else if (nivelDificultad === "Medio" && ["FIFA", "Nacional"].includes(principal.categoria)) puntaje += 22
  else if (nivelDificultad === "Medio" && principal.categoria === "Regional") puntaje += 18
  else if (nivelDificultad === "Bajo") puntaje += 20
  else puntaje += 10

  // Nivel de preparación del principal
  puntaje += (principal.nivelPreparacion / 100) * 15

  // Evaluar asistentes (30% del puntaje)
  const puntajeAsistentes = [asistente1, asistente2].reduce((total, asistente) => {
    let puntos = 0
    if (["FIFA", "Nacional"].includes(asistente.categoria)) puntos += 8
    else if (asistente.categoria === "Regional") puntos += 6
    else puntos += 4

    puntos += (asistente.nivelPreparacion / 100) * 4
    return total + puntos
  }, 0)

  puntaje += puntajeAsistentes

  // Evaluar cuarto árbitro (10% del puntaje)
  puntaje += (cuarto.nivelPreparacion / 100) * 5

  // Factor de asistencia (20% del puntaje total)
  const puntajeAsistenciaPrincipal = calcularPuntajeAsistencia(principal.id)
  const puntajeAsistenciaAsistentes =
    [asistente1, asistente2].reduce((sum, a) => sum + calcularPuntajeAsistencia(a.id), 0) / 2
  const puntajeAsistenciaCuarto = calcularPuntajeAsistencia(cuarto.id)

  const promedioAsistencia =
    puntajeAsistenciaPrincipal * 0.5 + puntajeAsistenciaAsistentes * 0.3 + puntajeAsistenciaCuarto * 0.2

  puntaje += (promedioAsistencia / 100) * 20

  return Math.min(100, puntaje)
}

// Función para obtener recomendaciones de mejora en asistencia
export function obtenerRecomendacionesAsistencia(arbitroId: string, asistencias: Asistencia[]): string[] {
  const hace4Semanas = new Date()
  hace4Semanas.setDate(hace4Semanas.getDate() - 28)

  const asistenciasRecientes = asistencias.filter(
    (a) => a.arbitroId === arbitroId && new Date(a.fecha) >= hace4Semanas && a.presente,
  )

  const preparacionFisica = asistenciasRecientes.filter((a) => a.tipoActividad === "preparacion_fisica").length
  const entrenamientos = asistenciasRecientes.filter((a) => a.tipoActividad === "entrenamiento").length

  const recomendaciones: string[] = []

  if (asistenciasRecientes.length < 12) {
    recomendaciones.push("Mejorar asistencia general - objetivo: 75% mínimo")
  }

  if (preparacionFisica < 8) {
    recomendaciones.push("Aumentar asistencia a preparación física (L, M, J)")
  }

  if (entrenamientos < 2) {
    recomendaciones.push("Mejorar asistencia a entrenamientos técnicos (V)")
  }

  if (asistenciasRecientes.length >= 14) {
    recomendaciones.push("¡Excelente asistencia! Mantener este nivel")
  }

  return recomendaciones
}
