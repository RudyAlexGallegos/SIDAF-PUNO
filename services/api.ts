// 📦 services/api.ts
// Comunicación frontend ↔ backend (Spring Boot)

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";

function buildUrl(endpoint: string): string {
    if (BASE_URL.endsWith("/api")) {
        return `${BASE_URL}${endpoint}`;
    }
    return `${BASE_URL}/api${endpoint}`;
}

// ============================================================
// TIPOS
// ============================================================

export interface Arbitro {
    id?: number;
    nombre: string;
    apellido: string;
    categoria: string;
    nivelPreparacion?: string;
    experiencia?: string;
    disponible?: boolean;
    especialidad?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    direccion?: string;
    observaciones?: string;
    estado?: string;
    fechaRegistro?: string;
    fotoUrl?: string; // ✅ avatar / foto
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

export async function getArbitroById(
    id: number
): Promise<Arbitro | null> {
    try {
        const response = await fetch(buildUrl(`/arbitros/${id}`));
        if (!response.ok) throw new Error("No encontrado");
        return await response.json();
    } catch (error) {
        console.error("❌ Error getArbitroById:", error);
        return null;
    }
}

export async function createArbitro(
    data: Arbitro
): Promise<Arbitro> {
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

export async function updateArbitro(
    id: number,
    data: Arbitro
): Promise<Arbitro> {
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
