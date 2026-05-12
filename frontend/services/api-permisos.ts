// ============================================================
// SOLICITUDES DE PERMISOS
// ============================================================

export interface SolicitudPermiso {
    id?: number;
    usuarioId?: number;
    permiso: string;
    estado: string;
    fechaSolicitud?: string;
    fechaRespuesta?: string;
    observaciones?: string;
}

/**
 * Obtiene las solicitudes de permisos del usuario actual
 * GET /api/solicitudes-permisos/mis-solicitudes
 */
export async function getMisSolicitudes(): Promise<SolicitudPermiso[]> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";
        const response = await fetch(`${API_BASE_URL}/solicitudes-permisos/mis-solicitudes`);
        if (!response.ok) throw new Error("Error HTTP");
        const data = await response.json();
        console.log("✅ Solicitudes obtenidas:", data);
        return data || [];
    } catch (error) {
        console.error("❌ Error getMisSolicitudes:", error);
        return [];
    }
}

/**
 * Solicita un nuevo permiso
 * POST /api/solicitudes-permisos
 */
export async function solicitarPermiso(datos: {
    permiso: string;
    razonSolicitud?: string;
}): Promise<SolicitudPermiso> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";
        const response = await fetch(`${API_BASE_URL}/solicitudes-permisos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Error al solicitar permiso");
        }

        const data = await response.json();
        console.log("✅ Permiso solicitado:", data);
        return data;
    } catch (error) {
        console.error("❌ Error solicitarPermiso:", error);
        throw error;
    }
}
