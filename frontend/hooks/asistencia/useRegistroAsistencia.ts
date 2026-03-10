"use client"

import { useEffect, useState } from "react"
import { createAsistencia, getDiaActual, getAsistenciasByFecha, updateAsistencia, type DiaInfo } from "@/services/api"
import { RegistroAsistencia, AsistenciaArbitro, TipoActividad, EstadoAsistencia, Arbitro } from "@/types/asistencia"
import { esDiaObligatorio, getTipoDia, getNombreDia, getInfoDiaActual } from "@/lib/horarios-asistencia"

const STORAGE_KEY = "sidaf_registro_temp"

export function useRegistroAsistencia() {
    const [registro, setRegistro] = useState<RegistroAsistencia | null>(null)
    const [diaInfo, setDiaInfo] = useState<DiaInfo | null>(null)
    const [loadingDia, setLoadingDia] = useState(true)
    const [existeRegistroHoy, setExisteRegistroHoy] = useState(false)
    const [idRegistroExistente, setIdRegistroExistente] = useState<number | null>(null)

    // Cargar información del día actual
    useEffect(() => {
        async function loadDiaInfo() {
            try {
                const info = await getDiaActual()
                if (info) setDiaInfo(info)
                else setDiaInfo(getInfoDiaActual() as unknown as DiaInfo)
            } catch { 
                setDiaInfo(getInfoDiaActual() as unknown as DiaInfo)
            } finally { setLoadingDia(false) }
        }
        loadDiaInfo()
    }, [])

    // Verificar si ya existe registro para el día de hoy
    useEffect(() => {
        async function verificarRegistroExistente() {
            const hoy = new Date().toISOString().split('T')[0]
            try {
                const registros = await getAsistenciasByFecha(hoy)
                if (registros && registros.length > 0) {
                    setExisteRegistroHoy(true)
                    setIdRegistroExistente(registros[0].id || null)
                    console.log("✅ Ya existe registro para hoy:", registros[0].id)
                }
            } catch (e) {
                console.warn("Error verificando registro existente:", e)
            }
        }
        verificarRegistroExistente()
    }, [])

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

    function iniciarRegistro(tipo: TipoActividad, responsable?: string, fechaCustom?: string) {
        const now = new Date()
        const fecha = fechaCustom || now.toISOString().split("T")[0]
        const horaInicio = fechaCustom 
            ? new Date(fechaCustom + "T" + now.toTimeString().slice(0, 8)).toISOString()
            : now.toISOString()
        const newRegistro: RegistroAsistencia = {
            id: `local-${now.getTime()}`,
            fecha: fecha,
            horaInicio: horaInicio,
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

    async function finalizarRegistro(arbitrosList?: Arbitro[]) {
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
        
        const asistenciaData = {
            fecha: updated.fecha,
            horaEntrada: updated.horaInicio,
            horaSalida: updated.horaFin,
            actividad: updated.tipoActividad,
            evento: updated.descripcion,
            estado: "completado",
            observaciones: JSON.stringify(updated.arbitros)
        }

        // Enviar al backend - actualizar si existe, crear si no
        try {
            if (idRegistroExistente) {
                await updateAsistencia(idRegistroExistente, asistenciaData)
                console.log("✅ Asistencia actualizada en backend")
            } else {
                await createAsistencia(asistenciaData)
                console.log("✅ Nueva asistencia guardada en backend")
            }
        } catch (e) {
            console.warn("No se pudo guardar asistencia en backend", e)
        }
        
        // Guardar localmente como backup
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

    // Funciones de utilidad para días obligatorios
    const esHoyObligatorio = () => diaInfo?.esObligatorio ?? esDiaObligatorio(new Date())
    const getTipoDiaActual = () => diaInfo?.tipoDia ?? getTipoDia(new Date())
    const getNombreDiaActual = () => diaInfo?.nombreDia ?? getNombreDia(new Date())

    return { 
        registro, 
        iniciarRegistro, 
        marcarAsistencia, 
        finalizarRegistro, 
        cancelarRegistro,
        diaInfo,
        loadingDia,
        esHoyObligatorio,
        getTipoDiaActual,
        getNombreDiaActual,
        existeRegistroHoy,
        idRegistroExistente
    }
}
