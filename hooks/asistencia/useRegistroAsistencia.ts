"use client"

import { useEffect, useState } from "react"
import { RegistroAsistencia, AsistenciaArbitro, TipoActividad, EstadoAsistencia, Arbitro } from "@/types/asistencia"

const STORAGE_KEY = "sidaf_registro_temp"

export function useRegistroAsistencia() {
    const [registro, setRegistro] = useState<RegistroAsistencia | null>(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                setRegistro(JSON.parse(raw))
            }
        } catch (e) {
            console.warn("No se pudo cargar registro temporal", e)
        }
    }, [])

    function persist(r: RegistroAsistencia | null) {
        try {
            if (r) localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
            else localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            console.warn("Error guardando registro en localStorage", e)
        }
    }

    function iniciarRegistro(tipo: TipoActividad, responsable?: string) {
        const now = new Date()
        const newRegistro: RegistroAsistencia = {
            id: `local-${now.getTime()}`,
            fecha: now.toISOString().split("T")[0],
            horaInicio: now.toISOString(),
            horaFin: "",
            tipoActividad: tipo,
            descripcion: "",
            ubicacion: "",
            responsable: responsable || "",
            arbitros: [],
            createdAt: now.toISOString(),
        }
        setRegistro(newRegistro)
        persist(newRegistro)
    }

    function marcarAsistencia(arbitroId: string, estado: EstadoAsistencia, observaciones = "") {
        if (!registro) return
        const now = new Date().toISOString()
        const existing = registro.arbitros.find(a => a.arbitroId === arbitroId)
        let updatedArbitros: AsistenciaArbitro[]
        if (existing) {
            updatedArbitros = registro.arbitros.map(a =>
                a.arbitroId === arbitroId ? { ...a, estado, horaRegistro: now, observaciones } : a
            )
        } else {
            updatedArbitros = [
                ...registro.arbitros,
                { arbitroId, estado, horaRegistro: now, observaciones }
            ]
        }

        const updated = { ...registro, arbitros: updatedArbitros }
        setRegistro(updated)
        persist(updated)
    }

    function finalizarRegistro(arbitrosList?: Arbitro[]) {
        if (!registro) return
        const now = new Date().toISOString()

        // Asegurar que todos los árbitros estén en el registro; los que falten se consideran 'ausente'
        let updatedArbitros: AsistenciaArbitro[] = [...registro.arbitros]
        if (arbitrosList && Array.isArray(arbitrosList)) {
            for (const a of arbitrosList) {
                if (!updatedArbitros.find(x => x.arbitroId === a.id)) {
                    updatedArbitros.push({ arbitroId: a.id, estado: 'ausente', horaRegistro: now, observaciones: '' })
                }
            }
        }

        const updated: RegistroAsistencia = { ...registro, horaFin: now, arbitros: updatedArbitros }
        // Aquí se podría enviar al backend cuando esté disponible.
        // Por ahora guardamos como último registro y limpiamos el temporal.
        try {
            localStorage.setItem("sidaf_registro_last", JSON.stringify(updated))
        } catch (e) {
            console.warn("No se pudo guardar registro final", e)
        }
        setRegistro(null)
        persist(null)
    }

    function cancelarRegistro() {
        setRegistro(null)
        persist(null)
    }

    return { registro, iniciarRegistro, marcarAsistencia, finalizarRegistro, cancelarRegistro }
}
