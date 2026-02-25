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
