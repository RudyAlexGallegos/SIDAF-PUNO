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
    const [registroExistenteInfo, setRegistroExistenteInfo] = useState<any>(null)

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
                    const primerRegistro = registros[0]
                    setExisteRegistroHoy(true)
                    setIdRegistroExistente(primerRegistro.id || null)
                    setRegistroExistenteInfo({
                        id: primerRegistro.id,
                        responsable: primerRegistro.responsable || 'Sin responsable',
                        createdAt: primerRegistro.createdAt,
                        actividad: primerRegistro.actividad,
                        horaEntrada: primerRegistro.horaEntrada
                    })
                    console.log("✅ Ya existe registro para hoy:", primerRegistro.id, "Responsable:", primerRegistro.responsable)
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

    async function actualizarRegistroInicial(tipo: TipoActividad, responsable?: string, fechaCustom?: string, descripcion = "") {
        if (!idRegistroExistente) return
        const now = new Date()
        const fecha = fechaCustom || now.toISOString().split("T")[0]
        const horaInicio = fechaCustom 
            ? new Date(fechaCustom + "T" + now.toTimeString().slice(0, 8)).toISOString()
            : now.toISOString()
        const updatedRegistro: RegistroAsistencia = {
            id: idRegistroExistente.toString(),
            fecha: fecha,
            horaInicio: horaInicio,
            horaFin: "",
            tipoActividad: tipo,
            descripcion: descripcion || "",
            ubicacion: "",
            responsable: responsable || "",
            arbitros: [],
            createdAt: now.toISOString(),
        }
        setRegistro(updatedRegistro)
        persist(updatedRegistro)

        const asistenciaData = {
            fecha: updatedRegistro.fecha,
            horaEntrada: updatedRegistro.horaInicio,
            horaSalida: "",
            actividad: updatedRegistro.tipoActividad,
            evento: updatedRegistro.descripcion,
            estado: "pendiente",
            responsable: updatedRegistro.responsable || 'Sistema',
            observaciones: JSON.stringify(updatedRegistro.arbitros)
        }

        try {
            console.log("📤 Actualizando registro inicial en backend ID:", idRegistroExistente, asistenciaData)
            const result = await updateAsistencia(idRegistroExistente, asistenciaData)
            console.log("✅ Registro inicial actualizado en backend:", result)
        } catch (e) {
            console.error("❌ Error al actualizar registro inicial en backend:", e)
        }
    }

    async function iniciarRegistro(tipo: TipoActividad, responsable?: string, fechaCustom?: string, descripcion = "") {
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
            descripcion: descripcion || "",
            ubicacion: "",
            responsable: responsable || "",
            arbitros: [],
            createdAt: now.toISOString(),
        }
        setRegistro(newRegistro)
        persist(newRegistro)

        const asistenciaData = {
            fecha: newRegistro.fecha,
            horaEntrada: newRegistro.horaInicio,
            horaSalida: "",
            actividad: newRegistro.tipoActividad,
            evento: newRegistro.descripcion,
            estado: "pendiente",
            responsable: newRegistro.responsable || 'Sistema',
            observaciones: JSON.stringify(newRegistro.arbitros)
        }

        try {
            console.log("📤 Guardando registro inicial en backend:", asistenciaData)
            const result = await createAsistencia(asistenciaData)
            console.log("✅ Registro inicial guardado en backend. ID:", result.id)
            const backendId = result.id
            const updatedLocal = { ...newRegistro, id: `backend-${backendId}` }
            setRegistro(updatedLocal)
            persist(updatedLocal)
        } catch (e) {
            console.error("❌ Error al guardar registro inicial en backend:", e)
        }
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

    function actualizarDescripcion(descripcion: string) {
        if (!registro) return
        const updated = { ...registro, descripcion }
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
            responsable: updated.responsable || 'Sistema',
            observaciones: JSON.stringify(updated.arbitros)
        }

        console.log("📤 Enviando asistenciaData al backend:", {
            fecha: asistenciaData.fecha,
            actividad: asistenciaData.actividad,
            observacionesLength: asistenciaData.observaciones.length,
            arbitros: updated.arbitros.length
        })

        // Enviar al backend - actualizar si existe, crear si no
        try {
            let result: any = null
            if (idRegistroExistente) {
                console.log("🔄 Actualizando registro existente ID:", idRegistroExistente)
                result = await updateAsistencia(idRegistroExistente, asistenciaData)
                console.log("✅ Asistencia actualizada en backend:", result)
            } else {
                console.log("🆕 Creando nuevo registro en backend")
                result = await createAsistencia(asistenciaData)
                console.log("✅ Nueva asistencia guardada en backend:", result)
            }
        } catch (e) {
            console.error("❌ Error al guardar asistencia en backend:", e)
        }
        
        // Guardar localmente como backup
        try {
            localStorage.setItem("sidaf_registro_last", JSON.stringify(updated))
            console.log("💾 Registro guardado localmente")
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
        actualizarRegistroInicial,
        marcarAsistencia, 
        actualizarDescripcion,
        finalizarRegistro, 
        cancelarRegistro,
        diaInfo,
        loadingDia,
        esHoyObligatorio,
        getTipoDiaActual,
        getNombreDiaActual,
        existeRegistroHoy,
        idRegistroExistente,
        registroExistenteInfo
    }
}
