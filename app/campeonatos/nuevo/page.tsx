"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Trophy } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { useToast } from "@/hooks/use-toast"

export default function NuevoCampeonatoPage() {
  const router = useRouter()
  const { addCampeonato } = useDataStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    nivelDificultad: "",
    numeroEquipos: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    estado: "programado" as const,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        toast({
          title: "Error",
          description: "El nombre del campeonato es obligatorio",
          variant: "destructive",
        })
        return
      }

      if (!formData.categoria.trim()) {
        toast({
          title: "Error",
          description: "La categoría es obligatoria",
          variant: "destructive",
        })
        return
      }

      if (!formData.nivelDificultad) {
        toast({
          title: "Error",
          description: "Debe seleccionar el nivel de dificultad",
          variant: "destructive",
        })
        return
      }

      if (!formData.numeroEquipos || Number.parseInt(formData.numeroEquipos) < 2) {
        toast({
          title: "Error",
          description: "Debe haber al menos 2 equipos",
          variant: "destructive",
        })
        return
      }

      if (!formData.fechaInicio) {
        toast({
          title: "Error",
          description: "La fecha de inicio es obligatoria",
          variant: "destructive",
        })
        return
      }

      // Verificar que la fecha de inicio no sea en el pasado
      const fechaInicio = new Date(formData.fechaInicio)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaInicio < hoy) {
        toast({
          title: "Error",
          description: "La fecha de inicio no puede ser en el pasado",
          variant: "destructive",
        })
        return
      }

      // Verificar que la fecha de fin sea posterior a la de inicio
      if (formData.fechaFin) {
        const fechaFin = new Date(formData.fechaFin)
        if (fechaFin <= fechaInicio) {
          toast({
            title: "Error",
            description: "La fecha de fin debe ser posterior a la fecha de inicio",
            variant: "destructive",
          })
          return
        }
      }

      const nuevoCampeonato = {
        id: Date.now().toString(),
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        nivelDificultad: formData.nivelDificultad as "bajo" | "medio" | "alto",
        numeroEquipos: Number.parseInt(formData.numeroEquipos),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        descripcion: formData.descripcion.trim() || undefined,
        estado: formData.estado,
        fechaCreacion: new Date().toISOString(),
      }

      addCampeonato(nuevoCampeonato)

      toast({
        title: "¡Éxito!",
        description: "Campeonato creado correctamente",
        variant: "default",
      })

      // Redirigir a la lista de campeonatos
      router.push("/campeonatos")
    } catch (error) {
      console.error("Error al crear campeonato:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al crear el campeonato",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
        <Link href="/campeonatos" className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a Campeonatos</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Trophy className="h-6 w-6 text-amber-600" />
          <span className="text-lg font-semibold text-gray-900">Nuevo Campeonato</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Crear Nuevo Campeonato
              </CardTitle>
              <CardDescription className="text-amber-100">
                Complete la información del campeonato que desea registrar en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Básica</h3>

                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre del Campeonato *
                      </Label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Ej: Liga Nacional 2025"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="text-sm font-medium">
                        Categoría *
                      </Label>
                      <Input
                        id="categoria"
                        type="text"
                        placeholder="Ej: Primera División, Sub-19, etc."
                        value={formData.categoria}
                        onChange={(e) => handleInputChange("categoria", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nivelDificultad" className="text-sm font-medium">
                        Nivel de Dificultad *
                      </Label>
                      <Select
                        value={formData.nivelDificultad}
                        onValueChange={(value) => handleInputChange("nivelDificultad", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bajo">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              Bajo - Torneos locales/juveniles
                            </div>
                          </SelectItem>
                          <SelectItem value="medio">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              Medio - Ligas regionales/nacionales
                            </div>
                          </SelectItem>
                          <SelectItem value="alto">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              Alto - Competencias internacionales
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroEquipos" className="text-sm font-medium">
                        Número de Equipos *
                      </Label>
                      <Input
                        id="numeroEquipos"
                        type="number"
                        min="2"
                        max="64"
                        placeholder="Ej: 20"
                        value={formData.numeroEquipos}
                        onChange={(e) => handleInputChange("numeroEquipos", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Fechas y estado */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fechas y Estado</h3>

                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio" className="text-sm font-medium">
                        Fecha de Inicio *
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaFin" className="text-sm font-medium">
                        Fecha de Fin (Opcional)
                      </Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) => handleInputChange("fechaFin", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium">
                        Estado Inicial
                      </Label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programado">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              Programado
                            </div>
                          </SelectItem>
                          <SelectItem value="activo">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              Activo
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion" className="text-sm font-medium">
                        Descripción (Opcional)
                      </Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Descripción adicional del campeonato..."
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                        className="w-full min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Crear Campeonato
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/campeonatos")}
                    className="flex-1 h-12 text-lg"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
