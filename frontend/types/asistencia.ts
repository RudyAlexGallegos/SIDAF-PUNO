export type TipoActividad =
    | "analisis_partido"
    | "preparacion_fisica"
    | "reunion_ordinaria"
    | "reunion_extraordinaria"

export type EstadoAsistencia =
    | "presente"
    | "ausente"
    | "justificado"
    | "licencia"
    | "tardanza"
    | "justificacion"

// Tipo de día para asistencia
export type TipoDia = "OBLIGATORIO" | "OPCIONAL" | "DESCANSO"

export interface Arbitro {
    id: string
    codigoCODAR: string
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    categoria: string
    telefono: string
    email?: string
}

export interface AsistenciaArbitro {
    arbitroId: string
    estado: EstadoAsistencia
    horaRegistro: string
    observaciones: string
}

export interface RegistroAsistencia {
    id: string
    fecha: string
    horaInicio: string
    horaFin: string
    tipoActividad: TipoActividad
    descripcion: string
    ubicacion: string
    responsable: string
    arbitros: AsistenciaArbitro[]
    createdAt: string
}

// ========== NUEVOS TIPOS PARA MEJORA DE ASISTENCIA ==========

// Información del día actual
export interface DiaInfo {
    fecha: string
    diaSemana: number
    nombreDia: string
    esObligatorio: boolean
    tipoDia: TipoDia
}

// Estadísticas por día de la semana
export interface EstadisticaDia {
    dia: string
    numeroDia: number
    esObligatorio: boolean
    total: number
    presentes: number
    ausentes: number
    tardanzas: number
    justificaciones: number
    porcentajeAsistencia: number
}

export interface EstadisticasPeriodo {
    periodo: {
        inicio: string
        fin: string
    }
    porDia: Record<string, EstadisticaDia>
    resumen: {
        totalRegistros: number
        presentes: number
        porcentajeGeneral: number
    }
}

export interface EstadisticasDiasObligatorios {
    periodo: {
        inicio: string
        fin: string
    }
    diasObligatorios: {
        total: number
        presentes: number
        ausentes: number
        tardanzas: number
        justificaciones: number
        porcentajeAsistencia: number
    }
}

// Request para registro con retraso
export interface RegistroConRetrasoRequest {
    fecha: string
    horaEntrada?: string
    horaSalida?: string
    actividad?: string
    evento?: string
    estado: EstadoAsistencia
    observaciones?: string
    responsableId?: number
    responsable?: string
    horaProgramada?: string
}

// Asistencia completa con nuevos campos (del backend)
export interface AsistenciaCompleta {
    id: number
    fecha: string
    horaEntrada?: string
    horaSalida?: string
    actividad?: string
    evento?: string
    estado: string
    observaciones?: string
    latitude?: string
    longitude?: string
    responsableId?: number
    responsable?: string
    createdAt?: string
    // Nuevos campos
    tipoDia?: TipoDia
    tieneRetraso?: boolean
    minutosRetraso?: number
    fechaLimiteRegistro?: string
    horaProgramada?: string
    diaSemana?: number
}
