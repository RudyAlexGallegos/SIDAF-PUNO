"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { getDesignacionById, updateDesignacion, deleteDesignacion, getCampeonatos, getEquipos, getArbitros, type Designacion } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DesignacionEditData {
  idCampeonato?: number
  nombreCampeonato?: string
  idEquipoLocal?: number
  nombreEquipoLocal?: string
  idEquipoVisitante?: number
  nombreEquipoVisitante?: string
  fecha?: string
  hora?: string
  estadio?: string
  arbitroPrincipal?: string
  arbitroAsistente1?: string
  arbitroAsistente2?: string
  cuartoArbitro?: string
  estado?: string
}

export default function EditarDesignacionPage() {
  const router = useRouter()
  const params = useParams()
  const designacionId = params?.id ? parseInt(params.id as string) : null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState<DesignacionEditData>({})
  const [campeonatos, setCampeonatos] = useState<any[]>([])
  const [equipos, setEquipos] = useState<any[]>([])
  const [arbitros, setArbitros] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        if (!designacionId) {
          toast({ title: "Error", description: "ID de designación no encontrado", variant: "destructive" })
          router.push("/dashboard/designaciones")
          return
        }

        const [designacion, camps, equips, arbs] = await Promise.all([
          getDesignacionById(designacionId),
          getCampeonatos(),
          getEquipos(),
          getArbitros(),
        ])

        if (designacion) {
          setFormData({
            idCampeonato: designacion.idCampeonato,
            nombreCampeonato: designacion.nombreCampeonato,
            idEquipoLocal: designacion.idEquipoLocal,
            nombreEquipoLocal: designacion.nombreEquipoLocal,
            idEquipoVisitante: designacion.idEquipoVisitante,
            nombreEquipoVisitante: designacion.nombreEquipoVisitante,
            fecha: designacion.fecha?.split("T")[0] || "",
            hora: designacion.fecha?.split("T")[1]?.substring(0, 5) || "",
            estadio: designacion.estadio || "",
            arbitroPrincipal: designacion.arbitroPrincipal?.toString() || "",
            arbitroAsistente1: designacion.arbitroAsistente1?.toString() || "",
            arbitroAsistente2: designacion.arbitroAsistente2?.toString() || "",
            cuartoArbitro: designacion.cuartoArbitro?.toString() || "",
            estado: designacion.estado || "PROGRAMADA",
          })
        }

        setCampeonatos(camps)
        setEquipos(equips)
        setArbitros(arbs)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [designacionId, router])

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEquipoLocalChange = (value: string) => {
    const equipo = equipos.find((e) => e.nombre === value)
    setFormData((prev) => ({
      ...prev,
      nombreEquipoLocal: value,
      idEquipoLocal: equipo?.id,
    }))
  }

  const handleEquipoVisitanteChange = (value: string) => {
    const equipo = equipos.find((e) => e.nombre === value)
    setFormData((prev) => ({
      ...prev,
      nombreEquipoVisitante: value,
      idEquipoVisitante: equipo?.id,
    }))
  }

  const handleSave = async () => {
    if (!formData.nombreEquipoLocal || !formData.nombreEquipoVisitante || !formData.estadio || !formData.fecha) {
      toast({ title: "Error", description: "Por favor completa todos los campos requeridos", variant: "destructive" })
      return
    }

    if (formData.nombreEquipoLocal === formData.nombreEquipoVisitante) {
      toast({ title: "Error", description: "Los equipos no pueden ser iguales", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      if (!designacionId) throw new Error("No hay ID de designación")

      const updated: any = {
        idCampeonato: formData.idCampeonato,
        nombreCampeonato: formData.nombreCampeonato,
        idEquipoLocal: formData.idEquipoLocal,
        nombreEquipoLocal: formData.nombreEquipoLocal,
        idEquipoVisitante: formData.idEquipoVisitante,
        nombreEquipoVisitante: formData.nombreEquipoVisitante,
        fecha: `${formData.fecha}T${formData.hora}:00`,
        hora: formData.hora,
        estadio: formData.estadio,
        arbitroPrincipal: formData.arbitroPrincipal ? parseInt(formData.arbitroPrincipal) : undefined,
        arbitroAsistente1: formData.arbitroAsistente1 ? parseInt(formData.arbitroAsistente1) : undefined,
        arbitroAsistente2: formData.arbitroAsistente2 ? parseInt(formData.arbitroAsistente2) : undefined,
        cuartoArbitro: formData.cuartoArbitro ? parseInt(formData.cuartoArbitro) : undefined,
        estado: formData.estado,
      }

      await updateDesignacion(designacionId, updated)
      toast({ title: "✅ Designación actualizada", description: "Los cambios se han guardado exitosamente" })
      router.push("/dashboard/designaciones")
    } catch (error) {
      console.error("Error guardando:", error)
      toast({ title: "Error", description: "No se pudo guardar la designación", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      if (!designacionId) throw new Error("No hay ID de designación")
      await deleteDesignacion(designacionId)
      toast({ title: "✅ Designación eliminada", description: "La designación fue eliminada exitosamente" })
      router.push("/dashboard/designaciones")
    } catch (error) {
      console.error("Error eliminando:", error)
      toast({ title: "Error", description: "No se pudo eliminar la designación", variant: "destructive" })
    } finally {
      setSaving(false)
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/designaciones">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Designación</h1>
            <p className="text-sm text-slate-500">
              {formData.nombreEquipoLocal} vs {formData.nombreEquipoVisitante} • {formData.fecha}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Partido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campeonato">Campeonato</Label>
                <Select value={formData.idCampeonato?.toString() || ""} onValueChange={(value) => {
                  const camp = campeonatos.find((c) => c.id?.toString() === value)
                  handleChange("idCampeonato", parseInt(value))
                  handleChange("nombreCampeonato", camp?.nombre)
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    {campeonatos.map((c) => (
                      <SelectItem key={c.id} value={c.id?.toString() || ""}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipo-local">Equipo Local</Label>
                  <Select value={formData.nombreEquipoLocal || ""} onValueChange={handleEquipoLocalChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Equipo local" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((e) => (
                        <SelectItem key={e.id} value={e.nombre}>
                          {e.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="equipo-visitante">Equipo Visitante</Label>
                  <Select value={formData.nombreEquipoVisitante || ""} onValueChange={handleEquipoVisitanteChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Equipo visitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((e) => (
                        <SelectItem key={e.id} value={e.nombre}>
                          {e.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha || ""}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora || ""}
                    onChange={(e) => handleChange("hora", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="estadio">Estadio</Label>
                  <Input
                    id="estadio"
                    value={formData.estadio || ""}
                    onChange={(e) => handleChange("estadio", e.target.value)}
                    placeholder="Nombre del estadio"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado || "PROGRAMADA"} onValueChange={(value) => handleChange("estado", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROGRAMADA">Programada</SelectItem>
                    <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Árbitros */}
          <Card>
            <CardHeader>
              <CardTitle>Árbitros Asignados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="principal">Árbitro Principal</Label>
                <Select value={formData.arbitroPrincipal || ""} onValueChange={(value) => handleChange("arbitroPrincipal", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar árbitro" />
                  </SelectTrigger>
                  <SelectContent>
                    {arbitros.filter((a) => a.disponible).map((a) => (
                      <SelectItem key={a.id} value={a.id?.toString() || ""}>
                        {a.nombre} {a.apellido} <Badge className="ml-2 text-xs">{a.categoria}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {["arbitroAsistente1", "arbitroAsistente2", "cuartoArbitro"].map((campo, idx) => {
                  const labels = ["Asistente 1", "Asistente 2", "Cuarto Árbitro"]
                  return (
                    <div key={campo}>
                      <Label>{labels[idx]}</Label>
                      <Select value={formData[campo as keyof DesignacionEditData]?.toString() || ""} onValueChange={(value) => handleChange(campo, value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Árbitro" />
                        </SelectTrigger>
                        <SelectContent>
                          {arbitros.filter((a) => a.disponible).map((a) => (
                            <SelectItem key={a.id} value={a.id?.toString() || ""}>
                              {a.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con acciones */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/designaciones">
                  Cancelar
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setDeleteConfirm(true)} disabled={saving} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar designación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La designación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
