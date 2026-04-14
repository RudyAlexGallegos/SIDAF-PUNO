// ============================================================
// API BASE URL
// ============================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";

function buildUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}

// ============================================================
// ÁRBITROS
// ============================================================

export interface Arbitro {
    id?: number;
    // Datos personales
    nombre?: string;
    apellido?: string;
    dni?: string;
    tipoDocumento?: string;
    fechaNacimiento?: string;
    lugarNacimiento?: string;
    genero?: string;
    estatura?: string;
    
    // Datos de contacto
    email?: string;
    telefono?: string;
    telefonoEmergencia?: string;
    direccion?: string;
    provincia?: string;
    distrito?: string;
    
    // Datos del árbitro
    categoria?: string;
    especialidad?: string;
    experiencia?: number;
    nivelCertificacion?: string;
    nivelPreparacion?: string;
    
    // Fechas profesionales
    fechaAfiliacion?: string;
    fechaExamenTeorico?: string;
    fechaExamenPractico?: string;
    academiaFormadora?: string;
    
    // Roles y especialidades
    roles?: string;
    especialidades?: string;
    
    // Disponibilidad
    disponible?: boolean;
    diasJuego?: string[];
    
    // Datos adicionales
    foto?: string;
    observaciones?: string;
    fechaRegistro?: string;
    estado?: string;
    declaracionJurada?: boolean;
}

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

export interface Etapa {
    id?: number;
    nombre: string;
    orden: number;
    fechaInicio?: string;
    fechaFin?: string;
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
    nivelDificultad?: string;
    numeroEquipos?: number;
    formato?: string;
    numeroJornadas?: number;
    numeroArbitrosRequeridos?: number;
    direccion?: string;
    estadio?: string;
    diasJuego?: string;
    horaInicio?: string;
    horaFin?: string;
    equipos?: number[];
    etapas?: Etapa[];
    reglas?: string;
    premios?: string;
    observaciones?: string;
    logo?: string;
    fechaCreacion?: string;
}

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

export async function createCampeonato(data: Campeonato): Promise<Campeonato> {
    const response = await fetch(buildUrl("/campeonato"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al crear campeonato");
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
        throw new Error("Error al actualizar campeonato");
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

export interface Equipo {
    id?: number;
    nombre: string;
    categoria?: string;
    provincia?: string;
    distrito?: string;
    estadio?: string;
    nombreEstadio?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    colores?: string;
    fechaCreacion?: string;
}

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

export async function getEquiposByDistrito(distrito: string): Promise<Equipo[]> {
    try {
        const response = await fetch(buildUrl(`/equipos/distrito/${encodeURIComponent(distrito)}`));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getEquiposByDistrito:", error);
        return [];
    }
}

export async function getEquiposByProvinciaAndDistrito(provincia: string, distrito: string): Promise<Equipo[]> {
    try {
        const response = await fetch(
            buildUrl(`/equipos/provincia/${encodeURIComponent(provincia)}/distrito/${encodeURIComponent(distrito)}`)
        );
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getEquiposByProvinciaAndDistrito:", error);
        return [];
    }
}

// ============================================================
// DESIGNACIONES
// ============================================================

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
    posicion?: string;
    estado?: string;
    observaciones?: string;
    createdAt?: string;
    // Campos adicionales para nueva designación
    arbitroPrincipal?: number;
    arbitroAsistente1?: number;
    arbitroAsistente2?: number;
    cuartoArbitro?: number;
    fechaDesignacion?: string;
}

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

export async function getEquiposByCampeonato(campeonatoId: number): Promise<Equipo[]> {
    try {
        const campeonato = await getCampeonatoById(campeonatoId);
        if (!campeonato || !campeonato.equipos) return [];
        
        // Si la API devuelve IDs de equipos, obtener equipos
        const equiposPromises = campeonato.equipos.map(equipoId => getEquipoById(equipoId));
        const equipos = await Promise.all(equiposPromises);
        
        return equipos.filter(e => e !== null) as Equipo[];
    } catch (error) {
        console.error("❌ Error getEquiposByCampeonato:", error);
        return [];
    }
}

// ============================================================
// ASISTENCIA
// ============================================================

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
    latitude?: string;
    longitude?: string;
    createdAt?: string;
}

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

    return await response.json();
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

    return await response.json();
}

export async function deleteAsistencia(id: number): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/asistencias/${id}`), {
            method: "DELETE",
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Obtiene las asistencia(s) por fecha
 * GET /api/asistencias/fecha/{fecha}
 */
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

// ========== NUEVAS FUNCIONES PARA MEJORA DE ASISTENCIA ==========

// Interfaz extendida de Asistencia con nuevos campos
export interface AsistenciaExtendida extends Asistencia {
    tipoDia?: string
    tieneRetraso?: boolean
    minutosRetraso?: number
    fechaLimiteRegistro?: string
    horaProgramada?: string
    diaSemana?: number
}

// Información del día actual
export interface DiaInfo {
    fecha: string
    diaSemana: number
    nombreDia: string
    esObligatorio: boolean
    tipoDia: string
}

/**
 * Obtiene estadísticas de asistencia por árbitro
 * GET /api/asistencias/estadisticas
 */
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

/**
 * Obtiene resumen de asistencia por fecha
 * GET /api/asistencias/resumen/{fecha}
 */
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

/**
 * Obtiene reporte consolidado de asistencias
 * GET /api/asistencias/reporte-consolidado
 */
export async function getReporteConsolidado(): Promise<any> {
    try {
        const response = await fetch(buildUrl("/asistencias/reporte-consolidado"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getReporteConsolidado:", error);
        return null;
    }
}

/**
 * Obtiene asistencias con información extendida
 * GET /api/asistencias/extendidas
 */
export async function getAsistenciasExtendidas(): Promise<AsistenciaExtendida[]> {
    try {
        const response = await fetch(buildUrl("/asistencias/extendidas"));
        if (!response.ok) throw new Error("Error HTTP");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getAsistenciasExtendidas:", error);
        return [];
    }
}

/**
 * Obtiene información del día actual
 * GET /api/asistencias/dia-actual
 */
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

/**
 * Obtiene resumen mensual de asistencias
 * GET /api/asistencias/resumen-mensual/{anio}/{mes}
 */
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

/**
 * Obtiene historial de asistencias por rango de fechas
 * GET /api/asistencias/historial?fechaInicio={fechaInicio}&fechaFin={fechaFin}
 */
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

/**
 * Obtiene ranking de asistencias
 * GET /api/asistencias/ranking
 */
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

// ============================================================
// AUTENTICACIÓN
// ============================================================

export interface Usuario {
    id?: number;
    dni?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    rol?: string;
    estado?: string;
    token?: string;
    perfilCompleto?: boolean;
    cargoCodar?: string;
    areaCodar?: string;
    unidadOrganizacional?: string;
    permisosEspecificos?: string;
}

/**
 * Inicia sesión con DNI y contraseña
 * POST /api/auth/login
 */
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
    
    // Guardar token en localStorage
    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
    }
    
    return data;
}

/**
 * Registra un nuevo usuario
 * POST /api/auth/registro
 */
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

/**
 * Verifica si un DNI ya está registrado
 * GET /api/auth/verificar-dni/{dni}
 */
export async function verificarDni(dni: string): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/auth/verificar-dni/${dni}`));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        return data.existe || false;
    } catch (error) {
        console.error("❌ Error verificarDni:", error);
        return false;
    }
}

/**
 * Cierra sesión del usuario
 */
export async function logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

/**
 * Obtiene el usuario almacenado en localStorage
 */
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

/**
 * Obtiene el token de autenticación almacenado
 */
export function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    
    try {
        return localStorage.getItem("token");
    } catch (error) {
        console.error("Error al obtener token almacenado:", error);
        return null;
    }
}
