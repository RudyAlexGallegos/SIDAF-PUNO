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
    genero?: string;
    estatura?: string;
    
    // Datos de contacto
    email?: string;
    telefono?: string;
    telefonoEmergencia?: string;
    direccion?: string;
    provincia?: string;
    
    // Datos del árbitro
    categoria?: string;
    especialidad?: string;
    experiencia?: number;
    nivelCertificacion?: string;
    nivelPreparacion?: string;
    
    // Disponibilidad
    disponible?: boolean;
    diasJuego?: string[];
    
    // Datos adicionales
    foto?: string;
    observaciones?: string;
    fechaRegistro?: string;
    estado?: string;
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
    estadio?: string;
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

// ============================================================
// REPORTES
// ============================================================

export interface Reporte {
    id?: number;
    tipo?: string;
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    generadoPor?: string;
    estado?: string;
    fechaCreacion?: string;
}

export async function getReportes(): Promise<Reporte[]> {
    try {
        const response = await fetch(buildUrl("/reportes"));
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Reportes obtenidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error getReportes:", error);
        return [];
    }
}

export async function generateReporte(data: Partial<Reporte>): Promise<Reporte> {
    const response = await fetch(buildUrl("/reportes/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Error al generar reporte");
    }

    return await response.json();
}

// ============================================================
// LOGIN / AUTENTICACIÓN
// ============================================================

export interface Usuario {
    id?: number;
    dni?: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    rol?: string;
    estado?: string;
    unidadOrganizacional?: string;
    permisosEspecificos?: string;
    token?: string;
    perfilCompleto?: boolean;
    cargoCodar?: string;
    areaCodar?: string;
    telefono?: string;
}

export async function login(dni: string, password: string): Promise<Usuario> {
    const response = await fetch(buildUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Credenciales inválidas");
    }

    const data = await response.json();
    
    // Guardar en localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token || "");
        localStorage.setItem("user", JSON.stringify(data));
    }
    
    return data;
}

export async function registro(data: {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol?: string;
    codigoSecreto?: string;
    unidadOrganizacional?: string;
    telefono?: string;
    cargoCodar?: string;
    areaCodar?: string;
    esExArbitro?: string;
    fechaNacimiento?: string;
    especialidad?: string;
}): Promise<Usuario> {
    const response = await fetch(buildUrl("/auth/registro"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al registrar usuario");
    }

    return await response.json();
}

export async function verificarDni(dni: string): Promise<boolean> {
    try {
        const response = await fetch(buildUrl(`/auth/verificar-dni/${dni}`));
        if (!response.ok) return false;
        const data = await response.json();
        return data.existe;
    } catch {
        return false;
    }
}

export async function logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getStoredToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}

export function getStoredUser(): Usuario | null {
    if (typeof window !== "undefined") {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }
    return null;
}

// ==================== GESTIÓN DE USUARIOS ====================

export async function getUsuariosPendientes(): Promise<Usuario[]> {
    const response = await fetch(buildUrl("/auth/usuarios/pendientes"), {
        headers: { "Authorization": `Bearer ${getStoredToken()}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error getUsuariosPendientes:", response.status, errorText);
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || errorData.message || "Error al obtener usuarios pendientes");
        } catch (e) {
            throw new Error("Error al obtener usuarios pendientes: " + response.status);
        }
    }
    return await response.json();
}

export async function getTodosUsuarios(): Promise<Usuario[]> {
    const response = await fetch(buildUrl("/auth/usuarios"), {
        headers: { "Authorization": `Bearer ${getStoredToken()}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error getTodosUsuarios:", response.status, errorText);
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || errorData.message || "Error al obtener usuarios");
        } catch (e) {
            throw new Error("Error al obtener usuarios: " + response.status);
        }
    }
    return await response.json();
}

export async function aprobarUsuario(id: number, rol?: string, permisos?: string): Promise<any> {
    const response = await fetch(buildUrl(`/auth/usuarios/${id}/aprobar`), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ rol, permisos })
    });
    if (!response.ok) throw new Error("Error al aprobar usuario");
    return await response.json();
}

export async function asignarPermisos(id: number, permisos: string): Promise<any> {
    const response = await fetch(buildUrl(`/auth/usuarios/${id}/permisos`), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ permisos })
    });
    if (!response.ok) throw new Error("Error al asignar permisos");
    return await response.json();
}

export async function cambiarEstadoUsuario(id: number, estado: string): Promise<any> {
    const response = await fetch(buildUrl(`/auth/usuarios/${id}/estado`), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ estado })
    });
    if (!response.ok) throw new Error("Error al cambiar estado");
    return await response.json();
}

// Eliminar un usuario
export async function eliminarUsuario(id: number): Promise<any> {
    const response = await fetch(buildUrl(`/auth/usuarios/${id}`), {
        method: "DELETE",
        headers: { 
            "Authorization": `Bearer ${getStoredToken()}` 
        }
    });
    if (!response.ok) throw new Error("Error al eliminar usuario");
    return await response.json();
}

// Eliminar todos los usuarios (solo admins, para testing)
export async function eliminarTodosUsuarios(): Promise<any> {
    const response = await fetch(buildUrl(`/auth/usuarios/eliminar-todos`), {
        method: "DELETE",
        headers: { 
            "Authorization": `Bearer ${getStoredToken()}` 
        }
    });
    if (!response.ok) throw new Error("Error al eliminar usuarios");
    return await response.json();
}

// Completar perfil de usuario (para usuarios CODAR)
export async function completarPerfil(data: {
    dni: string;
    telefono?: string;
    cargoCodar?: string;
    areaCodar?: string;
}): Promise<any> {
    const response = await fetch(buildUrl("/auth/completar-perfil"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al completar perfil");
    }
    
    return await response.json();
}

// Listar usuarios CODAR (para PRESIDENCIA_CODAR)
export async function getUsuariosCODAR(): Promise<Usuario[]> {
    const response = await fetch(buildUrl("/auth/usuarios/codar"), {
        headers: { "Authorization": `Bearer ${getStoredToken()}` }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error getUsuariosCODAR:", response.status, errorText);
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || errorData.message || "Error al obtener usuarios CODAR");
        } catch (e) {
            throw new Error("Error al obtener usuarios CODAR: " + response.status);
        }
    }
    return await response.json();
}

// ==================== SOLICITUDES DE PERMISOS ====================

export interface SolicitudPermiso {
    id?: number;
    usuarioId?: number;
    usuarioNombre?: string;
    permisoSolicitado?: string;
    estado?: string;  // PENDIENTE, APROBADO, RECHAZADO
    fechaSolicitud?: string;
    fechaRespuesta?: string;
    notas?: string;
}

// Solicitar un permiso
export async function solicitarPermiso(permiso: string): Promise<any> {
    const response = await fetch(buildUrl("/auth/solicitudes"), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ permiso })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al solicitar permiso");
    }
    return await response.json();
}

// Ver mis solicitudes
export async function getMisSolicitudes(): Promise<SolicitudPermiso[]> {
    const response = await fetch(buildUrl("/auth/solicitudes/mis-solicitudes"), {
        headers: { "Authorization": `Bearer ${getStoredToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener mis solicitudes");
    return await response.json();
}

// Ver solicitudes pendientes (para Admin)
export async function getSolicitudesPendientes(): Promise<SolicitudPermiso[]> {
    const response = await fetch(buildUrl("/auth/solicitudes/pendientes"), {
        headers: { "Authorization": `Bearer ${getStoredToken()}` }
    });
    if (!response.ok) throw new Error("Error al obtener solicitudes");
    return await response.json();
}

// Responder solicitud (aprobar o rechazar)
export async function responderSolicitud(id: number, accion: string, notas?: string): Promise<any> {
    const response = await fetch(buildUrl(`/auth/solicitudes/${id}/responder`), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ accion, notas })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al responder solicitud");
    }
    return await response.json();
}

// ==================== PERFIL ====================

interface PerfilData {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
}

// Actualizar perfil del usuario actual
export async function actualizarPerfil(data: PerfilData): Promise<any> {
    const response = await fetch(buildUrl("/auth/perfil"), {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar perfil");
    }
    return await response.json();
}

// Cambiar contraseña
export async function cambiarPassword(passwordActual: string, nuevaPassword: string): Promise<any> {
    const response = await fetch(buildUrl("/auth/perfil/password"), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify({ passwordActual, nuevaPassword })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al cambiar contraseña");
    }
    return await response.json();
}
