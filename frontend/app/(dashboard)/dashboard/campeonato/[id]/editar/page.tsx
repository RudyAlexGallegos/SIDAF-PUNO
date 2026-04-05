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
import { ArrowLeft, Save, Trophy, Search, MapPin, Clock, Users, AlertCircle, Loader2 } from "lucide-react"
import { updateCampeonato, getCampeonatoById, getEquipos, type Equipo, type Campeonato } from "@/services/api"
import { toast } from "@/hooks/use-toast"

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
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [equiposLoading, setEquiposLoading] = useState(true)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [busquedaEquipo, setBusquedaEquipo] = useState("")
  const [filtroProvincia, setFiltroProvincia] = useState("todas")
  const [filtroDivision, setFiltroDivision] = useState("todas")
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([])
  const [errores, setErrores] = useState<Record<string, string>>({})

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
  })

  // Cargar datos del campeonato y equipos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar datos del campeonato
        const campeonatoData = await getCampeonatoById(parseInt(campeonatoId))
        if (campeonatoData) {
          setFormData({
            nombre: campeonatoData.nombre || "",
            categoria: campeonatoData.categoria || "Primera División",
            tipo: campeonatoData.tipo || "Liga",
            estado: campeonatoData.estado || "PROGRAMADO",
            fechaInicio: campeonatoData.fechaInicio || "",
            fechaFin: campeonatoData.fechaFin || "",
            organizador: campeonatoData.organizador || "",
            contacto: campeonatoData.contacto || "",
            ciudad: campeonatoData.ciudad || "Puno",
            provincia: campeonatoData.provincia || "Puno",
            direccion: campeonatoData.direccion || "",
            estadio: campeonatoData.estadio || "",
            horaInicio: campeonatoData.horaInicio || "",
            horaFin: campeonatoData.horaFin || "",
            diasJuego: campeonatoData.diasJuego ? campeonatoData.diasJuego.split(",") : [],
          })

          // Cargar equipos seleccionados
          if (campeonatoData.equipos) {
            setEquiposSeleccionados(campeonatoData.equipos)
          }
        }

        // Cargar equipos disponibles
        const equiposData = await getEquipos()
        setEquipos(equiposData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del campeonato",
          variant: "destructive"
        })
        router.push("/dashboard/campeonatos")
      } finally {
        setIsLoadingData(false)
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

    // Validar contacto (formato básico de teléfono)
    if (formData.contacto && !/^\+?[\d\s\-\(\)]+$/.test(formData.contacto)) {
      nuevosErrores.contacto = "Formato de teléfono inválido"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

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
        equipos: equiposSeleccionados,
      })

      toast({
        title: "Campeonato actualizado",
        description: `El campeonato "${formData.nombre}" se ha actualizado exitosamente`,
      })

      router.push("/dashboard/campeonatos")
    } catch (error) {
      console.error("Error al actualizar:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el campeonato. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Cargando datos del campeonato...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/dashboard/campeonatos" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-5 w-5" aria-hidden />
          <span>Volver a Campeonatos</span>
        </Link>
        <div className="ml-auto">
          <h1 className="text-lg font-semibold">Editar Campeonato</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Datos principales del campeonato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Campeonato *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Liga Departamental 2024"
                    className={errores.nombre ? "border-red-500" : ""}
                  />
                  {errores.nombre && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primera División">Primera División</SelectItem>
                      <SelectItem value="Segunda División">Segunda División</SelectItem>
                      <SelectItem value="Tercera División">Tercera División</SelectItem>
                      <SelectItem value="Juvenil">Juvenil</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Veteranos">Veteranos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Campeonato</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Liga">Liga</SelectItem>
                      <SelectItem value="Copa">Copa</SelectItem>
                      <SelectItem value="Torneo">Torneo</SelectItem>
                      <SelectItem value="Playoffs">Playoffs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROGRAMADO">Programado</SelectItem>
                      <SelectItem value="ACTIVO">En Curso</SelectItem>
                      <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas y Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fechas y Horarios
              </CardTitle>
              <CardDescription>
                Programación del campeonato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className={errores.fechaInicio ? "border-red-500" : ""}
                  />
                  {errores.fechaInicio && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
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
                    className={errores.fechaFin ? "border-red-500" : ""}
                  />
                  {errores.fechaFin && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.fechaFin}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora de Inicio</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className={errores.horaInicio ? "border-red-500" : ""}
                  />
                  {errores.horaInicio && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.horaInicio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora de Fin</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className={errores.horaFin ? "border-red-500" : ""}
                  />
                  {errores.horaFin && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.horaFin}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de Juego *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={dia.id}
                        checked={formData.diasJuego.includes(dia.id)}
                        onCheckedChange={(checked) => handleDiaChange(dia.id, checked as boolean)}
                      />
                      <Label htmlFor={dia.id} className="text-sm font-normal">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errores.diasJuego && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errores.diasJuego}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
              <CardDescription>
                Lugar donde se disputará el campeonato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Select value={formData.provincia} onValueChange={(value) => setFormData({ ...formData, provincia: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Puno">Puno</SelectItem>
                      <SelectItem value="San Román">San Román</SelectItem>
                      <SelectItem value="Huancané">Huancané</SelectItem>
                      <SelectItem value="Lampa">Lampa</SelectItem>
                      <SelectItem value="Melgar">Melgar</SelectItem>
                      <SelectItem value="Azángaro">Azángaro</SelectItem>
                      <SelectItem value="Carabaya">Carabaya</SelectItem>
                      <SelectItem value="Sandia">Sandia</SelectItem>
                      <SelectItem value="Chucuito">Chucuito</SelectItem>
                      <SelectItem value="El Collao">El Collao</SelectItem>
                      <SelectItem value="Yunguyo">Yunguyo</SelectItem>
                      <SelectItem value="Moho">Moho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad/Distrito</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="Ej: Puno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadio">Estadio</Label>
                  <Input
                    id="estadio"
                    value={formData.estadio}
                    onChange={(e) => setFormData({ ...formData, estadio: e.target.value })}
                    placeholder="Ej: Estadio Enrique Torres Belón"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Ej: Av. El Sol s/n"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organización */}
          <Card>
            <CardHeader>
              <CardTitle>Organización</CardTitle>
              <CardDescription>
                Información del organizador y contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizador">Organizador</Label>
                  <Input
                    id="organizador"
                    value={formData.organizador}
                    onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                    placeholder="Ej: Liga Departamental de Fútbol"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto">Teléfono de Contacto</Label>
                  <Input
                    id="contacto"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    placeholder="Ej: +51 987 654 321"
                    className={errores.contacto ? "border-red-500" : ""}
                  />
                  {errores.contacto && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errores.contacto}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de Equipos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipos Participantes
              </CardTitle>
              <CardDescription>
                Selecciona los equipos que participarán en el campeonato (mínimo 2)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errores.equipos && (
                <div className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {errores.equipos}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Equipos seleccionados:</span>
                <span className="text-sm text-muted-foreground">{equiposSeleccionados.length} de 16 máximo</span>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="busqueda-equipo">Buscar Equipo</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="busqueda-equipo"
                      placeholder="Buscar por nombre..."
                      value={busquedaEquipo}
                      onChange={(e) => setBusquedaEquipo(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-provincia">Provincia</Label>
                  <Select value={filtroProvincia} onValueChange={setFiltroProvincia}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las provincias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las provincias</SelectItem>
                      <SelectItem value="Puno">Puno</SelectItem>
                      <SelectItem value="San Román">San Román</SelectItem>
                      <SelectItem value="Huancané">Huancané</SelectItem>
                      <SelectItem value="Lampa">Lampa</SelectItem>
                      <SelectItem value="Melgar">Melgar</SelectItem>
                      <SelectItem value="Azángaro">Azángaro</SelectItem>
                      <SelectItem value="Carabaya">Carabaya</SelectItem>
                      <SelectItem value="Sandia">Sandia</SelectItem>
                      <SelectItem value="Chucuito">Chucuito</SelectItem>
                      <SelectItem value="El Collao">El Collao</SelectItem>
                      <SelectItem value="Yunguyo">Yunguyo</SelectItem>
                      <SelectItem value="Moho">Moho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-division">Categoría</Label>
                  <Select value={filtroDivision} onValueChange={setFiltroDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las categorías</SelectItem>
                      <SelectItem value="Primera División">Primera División</SelectItem>
                      <SelectItem value="Segunda División">Segunda División</SelectItem>
                      <SelectItem value="Tercera División">Tercera División</SelectItem>
                      <SelectItem value="Juvenil">Juvenil</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Veteranos">Veteranos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de Equipos */}
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {equiposLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando equipos...</span>
                  </div>
                ) : equiposFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron equipos con los filtros aplicados
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {equiposFiltrados.map((equipo) => (
                      <div
                        key={equipo.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          equiposSeleccionados.includes(equipo.id!)
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleEquipoToggle(equipo.id!)}
                      >
                        <Checkbox
                          checked={equiposSeleccionados.includes(equipo.id!)}
                          onChange={() => handleEquipoToggle(equipo.id!)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{equipo.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {equipo.provincia} • {equipo.categoria}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/campeonatos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Actualizar Campeonato
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}