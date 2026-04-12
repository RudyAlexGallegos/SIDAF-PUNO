"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Trophy, Search, MapPin, Clock, Users, AlertCircle, Plus, Trash2 } from "lucide-react"
import { updateCampeonato, getEquipos, type Equipo } from "@/services/api"
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"

const DIAS_SEMANA = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
]

export default function EditarCampeonatoPage() {
  const router = useRouter()
  const params = useParams()
  const campeonatoId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCampeonato, setIsLoadingCampeonato] = useState(true)
  const [equiposLoading, setEquiposLoading] = useState(true)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [busquedaEquipo, setBusquedaEquipo] = useState("")
  const [filtroProvincia, setFiltroProvincia] = useState("todas")
  const [filtroDivision, setFiltroDivision] = useState("todas")
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([])
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Cargar campeonato y equipos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoadingCampeonato(true)
        setEquiposLoading(true)

        // Cargar equipos
        const equiposData = await getEquipos()
        setEquipos(equiposData)

        // Cargar campeonato existente
        const response = await fetch(`${API_BASE_URL}/campeonato/${campeonatoId}`)
        if (!response.ok) throw new Error("No se pudo cargar el campeonato")

        const campeonato = await response.json()

        // Llenar el formulario con los datos COMPLETOS del campeonato
        setFormData({
          nombre: campeonato.nombre || "",
          categoria: campeonato.categoria || "Primera División",
          tipo: campeonato.tipo || "Liga",
          estado: campeonato.estado || "PROGRAMADO",
          fechaInicio: campeonato.fechaInicio ? campeonato.fechaInicio.split("T")[0] : "",
          fechaFin: campeonato.fechaFin ? campeonato.fechaFin.split("T")[0] : "",
          organizador: campeonato.organizador || "",
          contacto: campeonato.contacto || "",
          ciudad: campeonato.ciudad || "Puno",
          provincia: campeonato.provincia || "Puno",
          direccion: campeonato.direccion || "",
          estadio: campeonato.estadio || "",
          horaInicio: campeonato.horaInicio || "",
          horaFin: campeonato.horaFin || "",
          diasJuego: campeonato.diasJuego ? campeonato.diasJuego.split(",").map(d => d.trim()) : [],
          etapas: campeonato.etapas ? JSON.parse(campeonato.etapas) : [],
          nivelDificultad: campeonato.nivelDificultad || "Medio",
          numeroEquipos: campeonato.numeroEquipos || 0,
          formato: campeonato.formato || "",
          reglas: campeonato.reglas || "",
          premios: campeonato.premios || "",
          observaciones: campeonato.observaciones || "",
        })

        // Cargar equipos seleccionados
        if (campeonato.equipos && Array.isArray(campeonato.equipos)) {
          setEquiposSeleccionados(campeonato.equipos.map(e => e.id || e))
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del campeonato",
          variant: "destructive"
        })
        router.push("/dashboard/campeonatos")
      } finally {
        setIsLoadingCampeonato(false)
        setEquiposLoading(false)
      }
    }

    if (campeonatoId) {
      cargarDatos()
    }
  }, [campeonatoId, router])

  // Función de validación
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre del campeonato es requerido"
    }

    if (!formData.fechaInicio) {
      nuevosErrores.fechaInicio = "La fecha de inicio es requerida"
    }

    if (!formData.fechaFin) {
      nuevosErrores.fechaFin = "La fecha de fin es requerida"
    }

    // Validar lógica de fechas
    if (formData.fechaInicio && formData.fechaFin) {
      const fechaInicio = new Date(formData.fechaInicio)
      const fechaFin = new Date(formData.fechaFin)
      if (fechaFin <= fechaInicio) {
        nuevosErrores.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
    }

    // Validar lógica de horas
    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaFin <= formData.horaInicio) {
        nuevosErrores.horaFin = "La hora de fin debe ser posterior a la hora de inicio"
      }
    }

    // Validar equipos (mínimo 2)
    if (equiposSeleccionados.length < 2) {
      nuevosErrores.equipos = "Debe seleccionar al menos 2 equipos"
    }

    // Validar días de juego
    if (formData.diasJuego.length === 0) {
      nuevosErrores.diasJuego = "Debe seleccionar al menos un día de juego"
    }

    // Validar etapas (mínimo 1)
    if (formData.etapas.length === 0) {
      nuevosErrores.etapas = "Debe definir al menos una etapa"
    } else {
      // Validar que ninguna etapa tenga nombre vacío
      const etapasSinNombre = formData.etapas.some(e => !e.nombre.trim())
      if (etapasSinNombre) {
        nuevosErrores.etapas = "Todas las etapas deben tener un nombre"
      }
    }

    // Validar contacto (formato básico de teléfono)
    if (formData.contacto && !/^\+?[\d\s\-\(\)]+$/.test(formData.contacto)) {
      nuevosErrores.contacto = "Formato de teléfono inválido"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "Primera División",
    tipo: "Liga",
    estado: "PROGRAMADO",
    fechaInicio: "",
    fechaFin: "",
    organizador: "",
    contacto: "",
    ciudad: "Puno",
    provincia: "Puno",
    direccion: "",
    estadio: "",
    horaInicio: "",
    horaFin: "",
    diasJuego: [] as string[],
    etapas: [] as Array<{ nombre: string; orden: number }>,
    nivelDificultad: "Medio",
    numeroEquipos: 0,
    formato: "",
    reglas: "",
    premios: "",
    observaciones: "",
  })

  const handleDiaChange = (diaId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        diasJuego: [...formData.diasJuego, diaId],
      })
    } else {
      setFormData({
        ...formData,
        diasJuego: formData.diasJuego.filter((d) => d !== diaId),
      })
    }
  }

  const handleEquipoToggle = useCallback((equipoId: number) => {
    setEquiposSeleccionados(prev => {
      if (prev.includes(equipoId)) {
        return prev.filter((id) => id !== equipoId)
      } else if (prev.length < 16) {
        return [...prev, equipoId]
      }
      return prev
    })
  }, [])

  const equiposFiltrados = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchBusqueda = equipo.nombre.toLowerCase().includes(busquedaEquipo.toLowerCase())
      const matchProvincia = filtroProvincia === "todas" || equipo.provincia === filtroProvincia
      const matchDivision = filtroDivision === "todas" || equipo.categoria === filtroDivision
      return matchBusqueda && matchProvincia && matchDivision
    })
  }, [equipos, busquedaEquipo, filtroProvincia, filtroDivision])

  const handleAgregarEtapa = () => {
    const nuevaEtapa = {
      nombre: "",
      orden: formData.etapas.length + 1
    }
    setFormData({
      ...formData,
      etapas: [...formData.etapas, nuevaEtapa]
    })
  }

  const handleEliminarEtapa = (index: number) => {
    setFormData({
      ...formData,
      etapas: formData.etapas.filter((_, i) => i !== index).map((e, i) => ({ ...e, orden: i + 1 }))
    })
  }

  const handleActualizarEtapa = (index: number, campo: "nombre" | "orden", valor: string | number) => {
    const nuevasEtapas = [...formData.etapas]
    nuevasEtapas[index] = { ...nuevasEtapas[index], [campo]: valor }
    setFormData({
      ...formData,
      etapas: nuevasEtapas
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      toast({
        title: "Errores de validación",
        description: "Corrige los errores marcados antes de continuar",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      await updateCampeonato(parseInt(campeonatoId), {
        nombre: formData.nombre,
        categoria: formData.categoria,
        tipo: formData.tipo,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        estado: formData.estado,
        organizador: formData.organizador,
        contacto: formData.contacto,
        ciudad: formData.ciudad,
        provincia: formData.provincia,
        direccion: formData.direccion,
        estadio: formData.estadio,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        diasJuego: formData.diasJuego.join(","),
        etapas: JSON.stringify(formData.etapas),
        equipos: equiposSeleccionados,
        nivelDificultad: formData.nivelDificultad,
        numeroEquipos: formData.numeroEquipos,
        formato: formData.formato,
        reglas: formData.reglas,
        premios: formData.premios,
        observaciones: formData.observaciones,
      })

      toast({
        title: "Campeonato actualizado",
        description: `El campeonato "${formData.nombre}" se ha actualizado exitosamente`,
      })

      router.push(`/dashboard/campeonatos/${campeonatoId}`)
    } catch (error) {
      console.error("Error al actualizar campeonato:", error)
      toast({
        title: "Error al guardar cambios",
        description: "Ocurrió un error al guardar el campeonato. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingCampeonato) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Cargando campeonato...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href={`/dashboard/campeonatos/${campeonatoId}`} className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-5 w-5" aria-hidden />
          <span>Volver a Detalles</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Trophy className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">Editar Campeonato</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Editar Campeonato</h1>
            <p className="text-muted-foreground mt-1">Modifica los detalles del torneo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Campeonato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Información del Campeonato
                </CardTitle>
                <CardDescription>Completa los datos principales del torneo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Copa Puno 2026"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className={errores.nombre ? "border-red-500" : ""}
                  />
                  {errores.nombre && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primera División">Primera División</SelectItem>
                        <SelectItem value="Segunda División">Segunda División</SelectItem>
                        <SelectItem value="Tercera División">Tercera División</SelectItem>
                        <SelectItem value="Sub-19">Sub-19</SelectItem>
                        <SelectItem value="Sub-17">Sub-17</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Liga">Liga</SelectItem>
                        <SelectItem value="Copa">Copa</SelectItem>
                        <SelectItem value="Torneo">Torneo</SelectItem>
                        <SelectItem value="Amistoso">Amistoso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROGRAMADO">PROGRAMADO</SelectItem>
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                      <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      required
                      className={errores.fechaInicio ? "border-red-500" : ""}
                    />
                    {errores.fechaInicio && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errores.fechaInicio}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      required
                      className={errores.fechaFin ? "border-red-500" : ""}
                    />
                    {errores.fechaFin && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errores.fechaFin}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizador">Organizador</Label>
                    <Input
                      id="organizador"
                      placeholder="Ej: CODAR Puno"
                      value={formData.organizador}
                      onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto">Contacto</Label>
                    <Input
                      id="contacto"
                      placeholder="Ej: +51 999 999 999"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      className={errores.contacto ? "border-red-500" : ""}
                    />
                    {errores.contacto && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errores.contacto}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación y Horarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación y Horarios
                </CardTitle>
                <CardDescription>Define dónde y cuándo se jugará</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input
                      id="provincia"
                      value={formData.provincia}
                      onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Av. Principal 123"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadio">Estadio Principal</Label>
                  <Input
                    id="estadio"
                    placeholder="Ej: Estadio Municipal"
                    value={formData.estadio}
                    onChange={(e) => setFormData({ ...formData, estadio: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horaInicio">Hora Inicio</Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaFin">Hora Fin</Label>
                    <Input
                      id="horaFin"
                      type="time"
                      value={formData.horaFin}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                      className={errores.horaFin ? "border-red-500" : ""}
                    />
                    {errores.horaFin && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errores.horaFin}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Días de Juego</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIAS_SEMANA.map((dia) => (
                      <div key={dia.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={dia.id}
                          checked={formData.diasJuego.includes(dia.id)}
                          onCheckedChange={(checked) => handleDiaChange(dia.id, checked as boolean)}
                        />
                        <Label htmlFor={dia.id} className="font-normal cursor-pointer">
                          {dia.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errores.diasJuego && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.diasJuego}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Definir Etapas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Definir Etapas
                </CardTitle>
                <CardDescription>Define las etapas del campeonato ({formData.etapas.length})</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.etapas.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-4">No hay etapas definidas</p>
                    <Button
                      type="button"
                      onClick={handleAgregarEtapa}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Primera Etapa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.etapas.map((etapa, index) => (
                      <div key={index} className="flex items-end gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm">Nombre de la Etapa</Label>
                          <Input
                            placeholder="Ej: Etapa Distrital"
                            value={etapa.nombre}
                            onChange={(e) => handleActualizarEtapa(index, "nombre", e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        <div className="w-16 space-y-1">
                          <Label className="text-sm">Orden</Label>
                          <Input
                            type="number"
                            min="1"
                            value={etapa.orden}
                            onChange={(e) => handleActualizarEtapa(index, "orden", parseInt(e.target.value))}
                            className="text-sm text-center"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarEtapa(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAgregarEtapa}
                      className="w-full gap-2 mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Etapa
                    </Button>
                  </div>
                )}

                {errores.etapas && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errores.etapas}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selección de Equipos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selección de Equipos
                </CardTitle>
                <CardDescription>
                  Selecciona los equipos participantes ({equiposSeleccionados.length}/16)
                  {equiposSeleccionados.length < 2 && (
                    <span className="text-red-500"> - Mínimo 2 equipos requeridos</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {equiposLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Cargando equipos...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar equipos..."
                          value={busquedaEquipo}
                          onChange={(e) => setBusquedaEquipo(e.target.value)}
                          className="pl-8"
                        />
                      </div>

                      <Select value={filtroProvincia} onValueChange={setFiltroProvincia}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Todas las provincias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas las provincias</SelectItem>
                          <SelectItem value="Puno">Puno</SelectItem>
                          <SelectItem value="Azángaro">Azángaro</SelectItem>
                          <SelectItem value="Melgar">Melgar</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filtroDivision} onValueChange={setFiltroDivision}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas las categorías</SelectItem>
                          <SelectItem value="Primera División">Primera División</SelectItem>
                          <SelectItem value="Segunda División">Segunda División</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-lg divide-y">
                      {equiposFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No se encontraron equipos
                        </div>
                      ) : (
                        equiposFiltrados.map((equipo) => (
                          <div
                            key={equipo.id}
                            className="flex items-center justify-between p-4 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={equipo.id ? equiposSeleccionados.includes(equipo.id) : false}
                                onCheckedChange={() => equipo.id && handleEquipoToggle(equipo.id)}
                              />
                              <div>
                                <p className="font-medium">{equipo.nombre}</p>
                                <p className="text-sm text-muted-foreground">
                                  {equipo.categoria} • {equipo.provincia}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {errores.equipos && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errores.equipos}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/campeonatos/${campeonatoId}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
