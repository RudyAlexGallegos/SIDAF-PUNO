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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, User, Phone, Mail, Award } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { toast } from "@/hooks/use-toast"

export default function NuevoArbitroPage() {
  const router = useRouter()
  const { addArbitro } = useDataStore()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    categoria: "",
    nivelPreparacion: [75],
    experiencia: 1,
    disponible: true,
    telefono: "",
    email: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.apellido.trim()) {
      toast({
        title: "Error",
        description: "El apellido es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "La categoría es obligatoria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      addArbitro({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        categoria: formData.categoria as "FIFA" | "Nacional" | "Regional" | "Provincial",
        nivelPreparacion: formData.nivelPreparacion[0],
        experiencia: formData.experiencia,
        disponible: formData.disponible,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
      })

      toast({
        title: "✅ Árbitro agregado",
        description: `${formData.nombre} ${formData.apellido} ha sido registrado exitosamente`,
      })

      router.push("/arbitros")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el árbitro",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/arbitros" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver a Árbitros</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nuevo Árbitro</h1>
              <p className="text-sm sm:text-base text-gray-600">Registrar información completa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 sm:space-y-8">
            {/* Información Personal */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center space-x-2">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">Datos básicos del árbitro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nombre" className="text-base sm:text-lg font-semibold text-gray-700">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Ej: Juan Carlos"
                      className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apellido" className="text-base sm:text-lg font-semibold text-gray-700">
                      Apellido *
                    </Label>
                    <Input
                      id="apellido"
                      type="text"
                      placeholder="Ej: Pérez García"
                      className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="telefono" className="text-base sm:text-lg font-semibold text-gray-700">
                      Teléfono
                    </Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="+34 600 123 456"
                        className="pl-10 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base sm:text-lg font-semibold text-gray-700">
                      Email
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="arbitro@email.com"
                        className="pl-10 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Profesional */}
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center space-x-2">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <span>Información Profesional</span>
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Categoría y experiencia del árbitro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="categoria" className="text-base sm:text-lg font-semibold text-gray-700">
                    Categoría *
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFA" className="text-base sm:text-lg py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>FIFA</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Nacional" className="text-base sm:text-lg py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Nacional</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Regional" className="text-base sm:text-lg py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Regional</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Provincial" className="text-base sm:text-lg py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Provincial</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base sm:text-lg font-semibold text-gray-700">
                    Nivel de Preparación: {formData.nivelPreparacion[0]}%
                  </Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={formData.nivelPreparacion}
                      onValueChange={(value) => setFormData({ ...formData, nivelPreparacion: value })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="experiencia" className="text-base sm:text-lg font-semibold text-gray-700">
                    Años de Experiencia
                  </Label>
                  <Input
                    id="experiencia"
                    type="number"
                    min="0"
                    max="50"
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="disponible" className="text-base sm:text-lg font-semibold text-gray-700">
                      Disponible para Designaciones
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      El árbitro está disponible para ser asignado a partidos
                    </p>
                  </div>
                  <Switch
                    id="disponible"
                    checked={formData.disponible}
                    onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 flex-1"
                onClick={() => router.push("/arbitros")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                size="lg"
                className="h-12 sm:h-14 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 shadow-lg flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Guardar Árbitro</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
