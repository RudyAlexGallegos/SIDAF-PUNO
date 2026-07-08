// ============================================================
// API BASE URL
// ============================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sidaf-backend.onrender.com/api";
export const ASISTENCIA_SYNC_KEY = "sidaf_asistencia_sync";

function buildUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}

function getAuthHeaders(): HeadersInit {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function notifyAsistenciaChanged(): void {
    if (typeof window === "undefined") return;

    try {
        const timestamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(ASISTENCIA_SYNC_KEY, timestamp);
        window.dispatchEvent(new CustomEvent("sidaf:asistencias-updated", { detail: { timestamp } }));
    } catch (error) {
        console.warn("No se pudo notificar el cambio de asistencia:", error);
    }
}

export function notifyCampeonatoChanged(): void {
    if (typeof window === "undefined") return;

    try {
        const timestamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("sidaf_campeonato_sync", timestamp);
        window.dispatchEvent(new CustomEvent("sidaf:campeonatos-updated", { detail: { timestamp } }));
    } catch (error) {
        console.warn("No se pudo notificar el cambio de campeonato:", error);
    }
}

// ============================================================
// INTERFACES Y TIPOS
// ============================================================

export interface Usuario {
    id?: number;
    dni?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    rol?: string;
    estado?: string;
    token?: string;
    perfilCompleto?: boolean;
    cargoCodar?: string;
    areaCodar?: string;
    fechaNacimiento?: string;
    especialidad?: string;
    unidadOrganizacional?: string;
    permisosEspecificos?: string;
}

export interface SolicitudPermiso {
    id?: number;
    usuarioId?: number;
    usuarioNombre?: string;
    permiso?: string;
    permisoSolicitado?: string;
    estado?: string;
    fechaSolicitud?: string;
    fechaRespuesta?: string;
    observaciones?: string;
    notas?: string;
}

export interface Arbitro {
    id?: number;
    nombre?: string;
    apellido?: string;
    dni?: string;
    genero?: string;
    lugarNacimiento?: string;
    estatura?: string;
    foto?: string;
    provincia?: string;
    distrito?: string;
    categoria?: string;
    direccion?: string;
    email?: string;
    especialidad?: string;
    telefono?: string;
    telefonoEmergencia?: string;
    estado?: string;
    experiencia?: number;
    nivelPreparacion?: string;
    observaciones?: string;
    disponible?: boolean;
    fechaNacimiento?: string;
    fechaRegistro?: string;
    fechaAfiliacion?: string;
    fechaExamenTeorico?: string;
    fechaExamenPractico?: string;
    academiaFormadora?: string;
    roles?: string;
    especialidades?: string;
    declaracionJurada?: boolean;
}

export interface Asesor {
    id?: number;
    usuarioId: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono?: string;
    especialidad?: string;
    estado?: string;
    descripcion?: string;
    foto?: string;
    fechaRegistro?: string;
    fechaActualizacion?: string;
}

export interface Campeonato {
    id?: number;
    nombre: string;
    categoria?: string;
    tipo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;
    organizador?: string;
    contacto?: string;
    ciudad?: string;
    provincia?: string;
    direccion?: string;
    estadio?: string;
    horaInicio?: string;
    horaFin?: string;
    diasJuego?: string;
    nivelDificultad?: string;
    numeroEquipos?: number;
    equipos?: number[];
    etapas?: string;
    formato?: string;
    reglas?: string;
    premios?: string;
    observaciones?: string;
    logo?: string;
}

export interface CrearCampeonatoPayload extends Campeonato {
    // Hereda todos los campos de Campeonato
}

export interface Equipo {
    id?: number;
    nombre: string;
    categoria?: string;
    provincia?: string;
    distrito?: string;
    estadio?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    colores?: string;
    nombreEstadio?: string;
}

export interface Designacion {
    id?: number;
    partidoId?: string;
    idArbitro?: number;
    nombreArbitro?: string;
    idCampeonato?: number;
    nombreCampeonato?: string;
    idEquipoLocal?: number;
    nombreEquipoLocal?: string;
    idEquipoVisitante?: number;
    nombreEquipoVisitante?: string;
    fecha?: string;
    hora?: string;
    estadio?: string;
    posicion?: string | null;
    estado?: string | null;
    arbitroPrincipal?: string | null;
    arbitroAsistente1?: string | null;
    arbitroAsistente2?: string | null;
    cuartoArbitro?: string | null;
    asesor?: string | null;
    temporada?: number | null;
    etapa?: string | null;
    region?: string | null;
    provincia?: string | null;
    distrito?: string | null;
}

export interface Asistencia {
    id?: number;
    idArbitro?: number;
    nombreArbitro?: string;
    fecha?: string;
    horaEntrada?: string;
    horaSalida?: string;
    actividad?: string;
    evento?: string;
    estado?: string;
    observaciones?: string;
}

// ============================================================
// AUTENTICACIÓN
// ============================================================

export async function login(dni: string, password: string): Promise<Usuario> {
    const response = await fetch(buildUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al iniciar sesión");
    }

    const data = await response.json();
    
    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
    }
    
    return data;
}

export async function registro(datos: any): Promise<Usuario> {
    const response = await fetch(buildUrl("/auth/registro"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al registrar usuario");
    }

    return await response.json();
}

export async function verificarDni(dni: string): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/auth/verificar-dni/${encodeURIComponent(dni)}`));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        return Boolean(data.existe);
    } catch (error) {
        console.error("Error verificarDni:", error);
        return false;
    }
}

export async function logout(): Promise<void> {
    try {
        if (typeof window === "undefined") return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    } catch (error) {
        console.error("Error durante logout:", error);
    }
}

export function getStoredUser(): Usuario | null {
    if (typeof window === "undefined") return null;
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error("Error al obtener usuario almacenado:", error);
        return null;
    }
}

export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("token");
    } catch (error) {
        console.error("Error al obtener token:", error);
        return null;
    }
}

// ============================================================
// ÁRBITROS
// ============================================================

export async function getArbitros(): Promise<Arbitro[]> {
    try {
        const response = await fetch(buildUrl("/arbitros"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Árbitros obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getArbitros:", error);
        return [];
    }
}

export async function getArbitroById(id: number): Promise<Arbitro | null> {
    try {
        const response = await fetch(buildUrl(`/arbitros/${id}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getArbitroById:", error);
        return null;
    }
}

export async function createArbitro(data: Arbitro): Promise<Arbitro> {
    const response = await fetch(buildUrl("/arbitros"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al crear árbitro");
    }

    return await response.json();
}

export async function updateArbitro(id: number, data: Arbitro): Promise<Arbitro> {
    const response = await fetch(buildUrl(`/arbitros/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al actualizar árbitro");
    }

    return await response.json();
}

export async function deleteArbitro(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/arbitros/${id}`), {
            method: "DELETE",
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================================
// CAMPEONATOS
// ============================================================

export async function getCampeonatos(): Promise<Campeonato[]> {
    try {
        const response = await fetch(buildUrl("/campeonato"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Campeonatos obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getCampeonatos:", error);
        return [];
    }
}

export async function getCampeonatoById(id: number): Promise<Campeonato | null> {
    try {
        const response = await fetch(buildUrl(`/campeonato/${id}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getCampeonatoById:", error);
        return null;
    }
}

export async function createCampeonato(data: CrearCampeonatoPayload): Promise<Campeonato> {
    const response = await fetch(buildUrl("/campeonato"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || `Error ${response.status} al crear campeonato`;
        throw new Error(message);
    }

    return await response.json();
}

export async function updateCampeonato(id: number, data: Campeonato): Promise<Campeonato> {
    const response = await fetch(buildUrl(`/campeonato/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error || `Error ${response.status} al actualizar campeonato`;
        throw new Error(message);
    }

    return await response.json();
}

export async function deleteCampeonato(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/campeonato/${id}`), {
            method: "DELETE",
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================================
// EQUIPOS
// ============================================================

export async function getEquipos(): Promise<Equipo[]> {
    try {
        const response = await fetch(buildUrl("/equipos"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Equipos obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getEquipos:", error);
        return [];
    }
}

export async function getEquiposByProvinciaAndDistrito(provincia: string, distrito: string): Promise<Equipo[]> {
    try {
        const response = await fetch(buildUrl(`/equipos/provincia/${encodeURIComponent(provincia)}/distrito/${encodeURIComponent(distrito)}`));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Equipos obtenidos por provincia/distrito:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getEquiposByProvinciaAndDistrito:", error);
        return [];
    }
}

export interface DiaInfo {
    fecha: string
    diaSemana: number
    nombreDia: string
    esObligatorio: boolean
    tipoDia: string
}

export async function getDiaActual(): Promise<DiaInfo> {
    try {
        const response = await fetch(buildUrl("/asistencias/dia-actual"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getDiaActual:", error);
        return {
            fecha: new Date().toISOString().split('T')[0],
            diaSemana: new Date().getDay(),
            nombreDia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
            esObligatorio: false,
            tipoDia: 'normal'
        };
    }
}

export async function getEquipoById(id: number): Promise<Equipo | null> {
    try {
        const response = await fetch(buildUrl(`/equipos/${id}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getEquipoById:", error);
        return null;
    }
}

export async function createEquipo(data: Equipo): Promise<Equipo> {
    const response = await fetch(buildUrl("/equipos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al crear equipo");
    }

    return await response.json();
}

export async function updateEquipo(id: number, data: Equipo): Promise<Equipo> {
    const response = await fetch(buildUrl(`/equipos/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al actualizar equipo");
    }

    return await response.json();
}

export async function deleteEquipo(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/equipos/${id}`), {
            method: "DELETE",
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================================
// DESIGNACIONES
// ============================================================

export async function getDesignaciones(): Promise<Designacion[]> {
    try {
        const response = await fetch(buildUrl("/designaciones"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Designaciones obtenidas:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getDesignaciones:", error);
        return [];
    }
}

export async function getDesignacionById(id: number): Promise<Designacion | null> {
    try {
        const response = await fetch(buildUrl(`/designaciones/${id}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getDesignacionById:", error);
        return null;
    }
}

export async function createDesignacion(data: Designacion): Promise<Designacion> {
    const response = await fetch(buildUrl("/designaciones"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al crear designación");
    }

    return await response.json();
}

export async function createDesignacionesBatch(designaciones: Omit<Designacion, "id">[]): Promise<Designacion[]> {
    const response = await fetch(buildUrl("/designaciones/batch"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designaciones),
    });

    if (!response.ok) {
        throw new Error("Error al crear designaciones en lote");
    }

    return await response.json();
}

export async function updateDesignacion(id: number, data: Designacion): Promise<Designacion> {
    const response = await fetch(buildUrl(`/designaciones/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al actualizar designación");
    }

    return await response.json();
}

export async function deleteDesignacion(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/designaciones/${id}`), {
            method: "DELETE",
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function getDesignacionesByCampeonatoAndFecha(idCampeonato: number, fecha: string): Promise<Designacion[]> {
    const response = await fetch(buildUrl(`/designaciones/campeonato/${idCampeonato}/fecha/${fecha}`));
    if (!response.ok) throw new Error("Error al obtener designaciones por campeonato y fecha");
    return await response.json();
}

export async function getDesignacionesAnterioresByCampeonato(idCampeonato: number, fechaActual: string): Promise<Designacion[]> {
    const response = await fetch(buildUrl(`/designaciones/campeonato/${idCampeonato}/anteriores?fechaActual=${encodeURIComponent(fechaActual)}`));
    if (!response.ok) throw new Error("Error al obtener designaciones anteriores");
    return await response.json();
}

export async function getDesignacionesByCampeonatoAndArbitro(idCampeonato: number, arbitroId: string): Promise<Designacion[]> {
    const response = await fetch(buildUrl(`/designaciones/campeonato/${idCampeonato}/arbitro/${encodeURIComponent(arbitroId)}`));
    if (!response.ok) throw new Error("Error al obtener designaciones por árbitro");
    return await response.json();
}

export async function getConflictosByArbitroAndFecha(arbitroId: string, fecha: string): Promise<Designacion[]> {
    const response = await fetch(buildUrl(`/designaciones/conflictos/arbitro/${encodeURIComponent(arbitroId)}/fecha/${encodeURIComponent(fecha)}`));
    if (!response.ok) throw new Error("Error al obtener conflictos");
    return await response.json();
}

export async function publicarDesignaciones(ids: number[]): Promise<Designacion[]> {
    const response = await fetch(buildUrl("/designaciones/publicar"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error("Error al publicar designaciones");
    return await response.json();
}

export async function getFechasUnicasPorCampeonato(idCampeonato: number): Promise<string[]> {
    const response = await fetch(buildUrl(`/designaciones/campeonato/${idCampeonato}/fechas`));
    if (!response.ok) throw new Error("Error al obtener fechas");
    return await response.json();
}

export async function getDesignacionesByCampeonato(campeonatoId: number): Promise<Designacion[]> {
    try {
        const response = await fetch(buildUrl(`/designaciones/campeonato/${campeonatoId}`));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log(`✅ Designaciones del campeonato ${campeonatoId}:`, data);
        return data;
    } catch (error) {
        console.error(`❌ Error getDesignacionesByCampeonato:`, error);
        return [];
    }
}

// ============================================================
// COPA PERÚ - resultados (campeón / subcampeón)
// ============================================================

export interface CopaPeruResultadoDTO {
    campeonatoId: number;
    etapa: string;
    equipoId: number;
    posicion: number; // 1 = campeón, 2 = subcampeón
}

export async function getCopaPeruResultados(campeonatoId: number, etapa: string): Promise<any[]> {
    try {
        const params = new URLSearchParams();
        params.append('campeonatoId', String(campeonatoId));
        params.append('etapa', etapa);
        const response = await fetch(buildUrl(`/copa-peru/resultados?${params.toString()}`));
        if (!response.ok) throw new Error('Error HTTP');
        return await response.json();
    } catch (error) {
        console.error('❌ Error getCopaPeruResultados:', error);
        return [];
    }
}

export async function saveCopaPeruResultadosBatch(resultados: CopaPeruResultadoDTO[]): Promise<any[]> {
    const response = await fetch(buildUrl('/copa-peru/resultados/batch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultados),
    });

    if (!response.ok) {
        throw new Error('Error al guardar resultados de Copa Perú');
    }

    return await response.json();
}

// ============================================================
// ASISTENCIA
// ============================================================

export async function getAsistencias(): Promise<Asistencia[]> {
    try {
        const response = await fetch(buildUrl("/asistencias"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Asistencias obtenidas:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getAsistencias:", error);
        return [];
    }
}

export async function getAsistenciaById(id: number): Promise<Asistencia | null> {
    try {
        const response = await fetch(buildUrl(`/asistencias/${id}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getAsistenciaById:", error);
        return null;
    }
}

export async function createAsistencia(data: Asistencia): Promise<Asistencia> {
    const response = await fetch(buildUrl("/asistencias"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al registrar asistencia");
    }

    const result = await response.json();
    notifyAsistenciaChanged();
    return result;
}

export async function updateAsistencia(id: number, data: Asistencia): Promise<Asistencia> {
    const response = await fetch(buildUrl(`/asistencias/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al actualizar asistencia");
    }

    const result = await response.json();
    notifyAsistenciaChanged();
    return result;
}

export async function deleteAsistencia(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/asistencias/${id}`), {
            method: "DELETE",
        });
        if (response.ok) {
            notifyAsistenciaChanged();
        }
        return response.ok;
    } catch {
        return false;
    }
}

export async function getAsistenciasByFecha(fecha: string): Promise<Asistencia[]> {
    try {
        const response = await fetch(buildUrl(`/asistencias/fecha/${fecha}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getAsistenciasByFecha:", error);
        return [];
    }
}

export async function getEstadisticasAsistencia(): Promise<any> {
    try {
        const response = await fetch(buildUrl("/asistencias/estadisticas"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getEstadisticasAsistencia:", error);
        return null;
    }
}

export async function getResumenAsistenciaPorFecha(fecha: string): Promise<any> {
    try {
        const response = await fetch(buildUrl(`/asistencias/resumen/${fecha}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getResumenAsistenciaPorFecha:", error);
        return null;
    }
}

export async function getHistorialAsistencias(fechaInicio?: string, fechaFin?: string): Promise<Asistencia[]> {
    try {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        const response = await fetch(buildUrl(`/asistencias/historial?${params.toString()}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getHistorialAsistencias:", error);
        return [];
    }
}

export async function getRankingAsistencia(): Promise<any> {
    try {
        const response = await fetch(buildUrl("/asistencias/ranking"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getRankingAsistencia:", error);
        return null;
    }
}

export async function getRankingSemanal(): Promise<Array<{nombre: string; lunes: string; martes: string; miercoles: string; jueves: string; viernes: string; total: number; porcentaje: number}>> {
    try {
        const response = await fetch(buildUrl("/asistencias/ranking-semanal"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getRankingSemanal:", error);
        return [];
    }
}

export async function getResumenMensual(anio: number, mes: number): Promise<any> {
    try {
        const response = await fetch(buildUrl(`/asistencias/resumen-mensual/${anio}/${mes}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getResumenMensual:", error);
        return null;
    }
}

// ============================================================
// ASESORES
// ============================================================

export async function getAsesores(): Promise<Asesor[]> {
    try {
        const response = await fetch(buildUrl("/asesores"), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Asesores obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getAsesores:", error);
        return [];
    }
}

export async function getAsesorById(id: number): Promise<Asesor | null> {
    try {
        const response = await fetch(buildUrl(`/asesores/${id}`), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getAsesorById:", error);
        return null;
    }
}

export async function createAsesor(data: Asesor): Promise<Asesor> {
    const response = await fetch(buildUrl("/asesores"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || errorData?.message || "Error al crear asesor";
        throw new Error(message);
    }

    return await response.json();
}

export async function updateAsesor(id: number, data: Asesor): Promise<Asesor> {
    const response = await fetch(buildUrl(`/asesores/${id}`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || errorData?.message || "Error al actualizar asesor";
        throw new Error(message);
    }

    return await response.json();
}

export async function cambiarEstadoAsesor(id: number, estado: string): Promise<Asesor> {
    const response = await fetch(buildUrl(`/asesores/${id}/estado?estado=${encodeURIComponent(estado)}`), {
        method: "PATCH",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.error || errorData?.message || "Error al cambiar estado del asesor";
        throw new Error(message);
    }

    return await response.json();
}

export async function deleteAsesor(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/asesores/${id}`), {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================================
// GESTIÓN DE USUARIOS
// ============================================================

export async function getUsuariosPendientes(): Promise<Usuario[]> {
    try {
        const response = await fetch(buildUrl("/auth/usuarios/pendientes"), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Usuarios pendientes obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getUsuariosPendientes:", error);
        return [];
    }
}

export async function getTodosUsuarios(): Promise<Usuario[]> {
    try {
        const response = await fetch(buildUrl("/auth/usuarios"), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Todos los usuarios obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getTodosUsuarios:", error);
        return [];
    }
}

export async function aprobarUsuario(
    id: number,
    rol: string,
    permisos: string
): Promise<Usuario> {
    try {
        const response = await fetch(buildUrl(`/auth/usuarios/${id}/aprobar`), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ rol, permisos }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al aprobar usuario");
        }

        const data = await response.json();
        console.log("✅ Usuario aprobado:", data);
        return data;
    } catch (error) {
        console.error("❌ Error aprobarUsuario:", error);
        throw error;
    }
}

export async function cambiarEstadoUsuario(
    id: number,
    estado: string
): Promise<Usuario> {
    try {
        const response = await fetch(buildUrl(`/auth/usuarios/${id}/estado`), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al cambiar estado");
        }

        const data = await response.json();
        console.log("✅ Estado actualizado:", data);
        return data;
    } catch (error) {
        console.error("❌ Error cambiarEstadoUsuario:", error);
        throw error;
    }
}

export async function eliminarUsuario(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/auth/usuarios/${id}`), {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al eliminar usuario");
        }

        console.log("✅ Usuario eliminado");
        return true;
    } catch (error) {
        console.error("❌ Error eliminarUsuario:", error);
        throw error;
    }
}

export async function asignarPermisos(
    id: number,
    permisos: string[]
): Promise<Usuario> {
    try {
        const response = await fetch(buildUrl(`/auth/usuarios/${id}/permisos`), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ permisos: JSON.stringify(permisos) }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al asignar permisos");
        }

        const data = await response.json();
        console.log("✅ Permisos asignados:", data);
        return data;
    } catch (error) {
        console.error("❌ Error asignarPermisos:", error);
        throw error;
    }
}

export async function getSolicitudesPendientes(): Promise<SolicitudPermiso[]> {
    try {
        const response = await fetch(buildUrl("/auth/solicitudes/pendientes"), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || "Error al cargar solicitudes");
        }
        return await response.json();
    } catch (error) {
        console.error("Error getSolicitudesPendientes:", error);
        throw error;
    }
}

export async function responderSolicitud(
    id: number,
    accion: "APROBAR" | "RECHAZAR",
    notas?: string
): Promise<any> {
    const response = await fetch(buildUrl(`/auth/solicitudes/${id}/responder`), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ accion, notas }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Error al responder solicitud");
    }

    return await response.json();
}

// ============================================================
// REPORTES Y ESTADÍSTICAS
// ============================================================

export async function getTendenciasAsistencia(dias: number): Promise<any> {
    try {
        const response = await fetch(buildUrl(`/reportes/tendencias?dias=${dias}`));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Tendencias obtenidas:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getTendenciasAsistencia:", error);
        return null;
    }
}

export async function getRankingArbitros(
    inicio: string,
    fin: string
): Promise<{ ranking: any[] } | null> {
    try {
        const response = await fetch(
            buildUrl(`/reportes/ranking?inicio=${inicio}&fin=${fin}`)
        );
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Ranking obtenido:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getRankingArbitros:", error);
        return null;
    }
}

export async function getDiasFaltantes(
    inicio: string,
    fin: string
): Promise<{ total: number; diasFaltantes: any[] } | null> {
    try {
        const response = await fetch(
            buildUrl(`/reportes/dias-faltantes?inicio=${inicio}&fin=${fin}`)
        );
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Días faltantes obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getDiasFaltantes:", error);
        return null;
    }
}

export async function getReporteConsolidado(inicio?: string, fin?: string): Promise<any> {
    try {
        let url = "/asistencias/reporte-consolidado";
        if (inicio && fin) {
            url = `/reportes/consolidado?inicio=${inicio}&fin=${fin}`;
        }
        const response = await fetch(buildUrl(url));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Reporte consolidado obtenido:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getReporteConsolidado:", error);
        return null;
    }
}

// ============================================================
// AUDITORÍA
// ============================================================

export interface AuditoriaLog {
    id: number;
    tipoCambio: string;
    usuarioAfectado?: UsuarioInfo;
    permiso?: PermisoInfo;
    rolAnterior?: string;
    rolNuevo?: string;
    realizadoPor?: UsuarioInfo;
    descripcion: string;
    razon?: string;
    fechaCambio: string;
}

export interface UsuarioInfo {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    email?: string;
}

export interface PermisoInfo {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
}

export async function getAuditoria(page: number = 0, size: number = 50): Promise<{ datos: AuditoriaLog[]; totalElementos: number } | null> {
    try {
        const response = await fetch(buildUrl(`/auditoria?page=${page}&size=${size}`), {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Auditoría obtenida:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getAuditoria:", error);
        return null;
    }
}
