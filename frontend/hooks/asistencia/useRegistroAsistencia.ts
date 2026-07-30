"use client"

import { useEffect, useState } from "react"
import { createAsistencia, getDiaActual, getAsistenciasByFecha, getAsistenciaById, updateAsistencia, verificarDuplicadoAsistencia, type DiaInfo } from "@/services/api"
import { RegistroAsistencia, AsistenciaArbitro, TipoActividad, EstadoAsistencia, Arbitro } from "@/types/asistencia"
import { esDiaObligatorio, getTipoDia, getNombreDia, getInfoDiaActual } from "@/lib/horarios-asistencia"

const STORAGE_KEY = "sidaf_registro_temp"

export interface DuplicadoInfo {
    existe: boolean
    id?: number
    responsable?: string
    fecha?: string
    actividad?: string
    estado?: string
    horaEntrada?: string
    mensaje: string
}

export function useRegistroAsistencia() {
    const [registro, setRegistro] = useState<RegistroAsistencia | null>(null)
    const [diaInfo, setDiaInfo] = useState<DiaInfo | null>(null)
    const [loadingDia, setLoadingDia] = useState(true)
    const [existeRegistroHoy, setExisteRegistroHoy] = useState(false)
    const [idRegistroExistente, setIdRegistroExistente] = useState<number | null>(null)
    const [registroExistenteInfo, setRegistroExistenteInfo] = useState<any>(null)
    const [inicializando, setInicializando] = useState(false)
    const [notificacion, setNotificacion] = useState<string | null>(null)
    const [duplicadoInfo, setDuplicadoInfo] = useState<DuplicadoInfo | null>(null)

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

    useEffect(() => {
        async function verificarRegistroExistente() {
            const hoy = new Date().toISOString().split('T')[0]
            try {
                const registros = await getAsistenciasByFecha(hoy)
                if (registros && registros.length > 0) {
                    const primerRegistro = registros[0]
                    setExisteRegistroHoy(true)
                    setIdRegistroExistente(primerRegistro.id ?? null)
                    setRegistroExistenteInfo({
                        id: primerRegistro.id,
                        responsable: primerRegistro.responsable || 'Sin responsable',
                        createdAt: primerRegistro.createdAt,
                        actividad: primerRegistro.actividad,
                        horaEntrada: primerRegistro.horaEntrada
                    })
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

    async function verificarDuplicado(fecha: string, responsable: string, actividad: TipoActividad): Promise<DuplicadoInfo> {
        try {
            const resultado = await verificarDuplicadoAsistencia(fecha, responsable, actividad)
            if (resultado.existe) {
                const info: DuplicadoInfo = {
                    existe: true,
                    id: resultado.id,
                    responsable: resultado.responsable,
                    fecha: resultado.fecha,
                    actividad: resultado.actividad,
                    estado: resultado.estado,
                    horaEntrada: resultado.horaEntrada,
                    mensaje: `Ya existe un registro de asistencia para el ${fecha}, creado por ${resultado.responsable || 'un usuario'}. Solo se puede editar ese registro.`
                }
                setDuplicadoInfo(info)
                return info
            } else {
                setDuplicadoInfo(null)
                return { existe: false, mensaje: "SIN_DUPLICADO" }
            }
        } catch (e) {
            console.error("Error verificando duplicado:", e)
            return { existe: false, mensaje: "ERROR_VERIFICACION" }
        }
    }

    async function actualizarRegistroInicial(tipo: TipoActividad, responsable?: string, fechaCustom?: string, descripcion = "") {
        if (!idRegistroExistente || inicializando) return
        setInicializando(true)
        try {
            const now = new Date()
            const fecha = fechaCustom || now.toISOString().split("T")[0]
            const horaInicio = fechaCustom
                ? new Date(fechaCustom + "T" + now.toTimeString().slice(0, 8)).toISOString()
                : now.toISOString()

            let arbitrosRegistro: AsistenciaArbitro[] = []
            try {
                const asistenciaCompleta = await getAsistenciaById(idRegistroExistente)
                if (asistenciaCompleta?.observaciones) {
                    const obs = typeof asistenciaCompleta.observaciones === 'string'
                        ? JSON.parse(asistenciaCompleta.observaciones)
                        : asistenciaCompleta.observaciones
                    if (Array.isArray(obs)) {
                        arbitrosRegistro = obs.map((item: any) => ({
                            arbitroId: String(item.arbitroId ?? item.id ?? item.arbitro ?? ''),
                            estado: item.estado || 'ausente',
                            horaRegistro: item.horaRegistro || now.toISOString(),
                            observaciones: item.observaciones || ''
                        }))
                    }
                }
            } catch (e) {
                console.warn("No se pudo cargar asistencia existente para edición:", e)
            }

            const updatedRegistro: RegistroAsistencia = {
                id: idRegistroExistente.toString(),
                fecha,
                horaInicio,
                horaFin: "",
                tipoActividad: tipo,
                descripcion: descripcion || "",
                ubicacion: "",
                responsable: responsable || "",
                arbitros: arbitrosRegistro,
                createdAt: now.toISOString(),
            }
            setRegistro(updatedRegistro)
            persist(updatedRegistro)

            const asistenciaData = buildAsistenciaData(updatedRegistro)
            const result = await updateAsistencia(idRegistroExistente, asistenciaData)
            if (result?.id) {
                setIdRegistroExistente(result.id)
                setExisteRegistroHoy(true)
            }
        } catch (e) {
            console.error("Error al actualizar registro inicial en backend:", e)
        } finally {
            setInicializando(false)
        }
    }

    async function iniciarRegistro(tipo: TipoActividad, responsable?: string, fechaCustom?: string, descripcion = "") {
        if (inicializando) return
        setInicializando(true)
        try {
            const now = new Date()
            const fecha = fechaCustom || now.toISOString().split("T")[0]

            const existentes = await getAsistenciasByFecha(fecha)
            const existente = existentes.find(a => {
                const actividadOk = a.actividad === tipo
                const responsableOk = !responsable || !a.responsable || a.responsable === responsable
                return actividadOk && responsableOk
            })
            if (existente?.id) {
                setNotificacion(`Ya existe un registro para el ${fecha}. Solo se puede editar ese registro.`)
                setIdRegistroExistente(existente.id)
                setExisteRegistroHoy(true)

                let arbitrosExistentes: AsistenciaArbitro[] = []
                try {
                    const asistenciaCompleta = await getAsistenciaById(existente.id)
                    if (asistenciaCompleta?.observaciones) {
                        const obs = typeof asistenciaCompleta.observaciones === 'string'
                            ? JSON.parse(asistenciaCompleta.observaciones)
                            : asistenciaCompleta.observaciones
                        if (Array.isArray(obs)) {
                            arbitrosExistentes = obs.map((item: any) => ({
                                arbitroId: String(item.arbitroId ?? item.id ?? item.arbitro ?? ''),
                                estado: item.estado || 'ausente',
                                horaRegistro: item.horaRegistro || now.toISOString(),
                                observaciones: item.observaciones || ''
                            }))
                        }
                    }
                } catch (e) {
                    console.warn("No se pudo cargar asistencia existente para edición:", e)
                }

                const local: RegistroAsistencia = {
                    id: existente.id.toString(),
                    fecha,
                    horaInicio: existente.horaEntrada || now.toISOString(),
                    horaFin: existente.horaSalida || "",
                    tipoActividad: tipo,
                    descripcion: existente.evento || descripcion || "",
                    ubicacion: "",
                    responsable: existente.responsable || responsable || "",
                    arbitros: arbitrosExistentes,
                    createdAt: existente.createdAt || now.toISOString(),
                }
                setRegistro(local)
                persist(local)
                return
            }

            const horaInicio = fechaCustom
                ? new Date(fechaCustom + "T" + now.toTimeString().slice(0, 8)).toISOString()
                : now.toISOString()
            const newRegistro: RegistroAsistencia = {
                id: `local-${now.getTime()}`,
                fecha,
                horaInicio,
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

            const asistenciaData = buildAsistenciaData(newRegistro)
            const result = await createAsistencia(asistenciaData)
            if (result?.id) {
                setIdRegistroExistente(result.id)
                setExisteRegistroHoy(true)
                const updatedLocal = { ...newRegistro, id: result.id.toString() }
                setRegistro(updatedLocal)
                persist(updatedLocal)
            }
        } catch (e) {
            console.error("Error al guardar registro inicial en backend:", e)
        } finally {
            setInicializando(false)
        }
    }

    function buildAsistenciaData(registro: RegistroAsistencia) {
        return {
            fecha: registro.fecha,
            horaEntrada: registro.horaInicio,
            horaSalida: registro.horaFin || "",
            actividad: registro.tipoActividad,
            evento: registro.descripcion,
            estado: "pendiente",
            responsable: registro.responsable || 'Sistema',
            observaciones: JSON.stringify(registro.arbitros)
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

        let updatedArbitros: AsistenciaArbitro[] = [...registro.arbitros]
        if (arbitrosList && Array.isArray(arbitrosList)) {
            for (const a of arbitrosList) {
                if (!updatedArbitros.find(x => x.arbitroId === a.id)) {
                    updatedArbitros.push({ arbitroId: a.id, estado: 'ausente', horaRegistro: now, observaciones: '' })
                }
            }
        }

        const updated: RegistroAsistencia = { ...registro, horaFin: now, arbitros: updatedArbitros }
        const asistenciaData = buildAsistenciaData(updated)
        asistenciaData.horaSalida = updated.horaFin
        asistenciaData.estado = "completado"

        try {
            if (idRegistroExistente) {
                await updateAsistencia(idRegistroExistente, asistenciaData)
            } else if (updated.id && !updated.id.startsWith('local-')) {
                await updateAsistencia(Number(updated.id), asistenciaData)
            } else {
                await createAsistencia(asistenciaData)
            }
        } catch (e) {
            console.error("Error al guardar asistencia en backend:", e)
        }

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
        setExisteRegistroHoy,
        idRegistroExistente,
        setIdRegistroExistente,
        registroExistenteInfo,
        notificacion,
        setNotificacion,
        duplicadoInfo,
        setDuplicadoInfo,
        verificarDuplicado
    }
}