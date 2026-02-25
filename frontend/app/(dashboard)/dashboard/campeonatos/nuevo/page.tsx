"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trophy, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useDataStore } from "@/lib/data-store"

export default function NuevoCampeonatoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addCampeonato: addCampeonatoFn } = useDataStore()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    nivelDificultad: "",
    numeroEquipos: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    formato: "liga",
    numeroJornadas: "",
    logoDataUrl: "",
    estado: "programado",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  function handleLogoChange(file: File | null) {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange("logoDataUrl", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.categoria.trim()) newErrors.categoria = "La categoría es obligatoria"
    if (!formData.nivelDificultad) newErrors.nivelDificultad = "El nivel de dificultad es obligatorio"
    if (!formData.numeroEquipos || parseInt(formData.numeroEquipos) < 2) {
      newErrors.numeroEquipos = "Debe haber al menos 2 equipos"
    }
    if (!formData.fechaInicio) newErrors.fechaInicio = "La fecha de inicio es obligatoria"
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Email inválido"
    }
    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Teléfono inválido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const nuevoCampeonato = {
        id: Date.now().toString(),
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        nivelDificultad: formData.nivelDificultad as "bajo" | "medio" | "alto",
        numeroEquipos: parseInt(formData.numeroEquipos),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        descripcion: formData.descripcion.trim() || undefined,
        estado: formData.estado,
        fechaCreacion: new Date().toISOString(),
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        formato: formData.formato || undefined,
        numeroJornadas: formData.numeroJornadas ? parseInt(formData.numeroJornadas) : undefined,
        logoDataUrl: formData.logoDataUrl || undefined,
      }

      addCampeonatoFn(nuevoCampeonato)

      toast({
        title: "¡Éxito!",
        description: "Campeonato creado correctamente",
      })

      router.push("/dashboard/campeonatos")
    } catch (error) {
      console.error("Error al crear campeonato:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el campeonato",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
        <Link href="/dashboard/campeonatos" className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
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
                <Trophy className="h-6 w-6 animate-bounce" />
                Crear Nuevo Campeonato
              </CardTitle>
              <CardDescription className="text-amber-100">
                Complete la información del campeonato que desea registrar en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-0">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Información básica */}
                  <div className="transition-all duration-500 space-y-4 md:col-span-2 bg-white rounded-lg shadow-sm p-6 mb-4 border border-amber-100">
                    <h3 className="text-lg font-semibold text-amber-700 border-b pb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Información Básica
                    </h3>

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
                        className={`w-full ${errors.nombre ? 'border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={!!errors.nombre}
                        aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                        required
                      />
                      {errors.nombre && <p id="nombre-error" className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
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
                        className={`w-full ${errors.categoria ? 'border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={!!errors.categoria}
                        aria-describedby={errors.categoria ? 'categoria-error' : undefined}
                        required
                      />
                      {errors.categoria && <p id="categoria-error" className="text-xs text-red-600 mt-1">{errors.categoria}</p>}
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
                              Bajo - Torneos de menores/juveniles
                            </div>
                          </SelectItem>
                          <SelectItem value="medio">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              Medio - Segunda División/ Yanamayo,etc
                            </div>
                          </SelectItem>
                          <SelectItem value="alto">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              Alto - Primera División -COPA PERÚ
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.nivelDificultad && <p className="text-xs text-red-600 mt-1">{errors.nivelDificultad}</p>}
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
                        className={`w-full ${errors.numeroEquipos ? 'border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={!!errors.numeroEquipos}
                        aria-describedby={errors.numeroEquipos ? 'numeroEquipos-error' : undefined}
                        required
                      />
                      {errors.numeroEquipos && <p id="numeroEquipos-error" className="text-xs text-red-600 mt-1">{errors.numeroEquipos}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion" className="text-sm font-medium">Dirección / Lugar</Label>
                      <Input id="direccion" placeholder="Ej: Estadio Monumental" value={formData.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-sm font-medium">Teléfono</Label>
                        <Input id="telefono" placeholder="(051) 123456" value={formData.telefono} onChange={(e) => handleInputChange('telefono', e.target.value)} className={`w-full ${errors.telefono ? 'border-red-500 focus:ring-red-200' : ''}`} aria-invalid={!!errors.telefono} aria-describedby={errors.telefono ? 'telefono-error' : undefined} />
                        {errors.telefono && <p id="telefono-error" className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input id="email" type="email" placeholder="contacto@ejemplo.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full ${errors.email ? 'border-red-500 focus:ring-red-200' : ''}`} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                        {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="formato" className="text-sm font-medium">Formato</Label>
                      <Select value={formData.formato} onValueChange={(v) => handleInputChange('formato', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liga">Liga</SelectItem>
                          <SelectItem value="eliminacion">Eliminación directa</SelectItem>
                          <SelectItem value="grupos">Grupos + Playoffs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroJornadas" className="text-sm font-medium">Número de jornadas (opcional)</Label>
                      <Input id="numeroJornadas" type="number" min={1} placeholder="Ej: 30" value={formData.numeroJornadas} onChange={(e) => handleInputChange('numeroJornadas', e.target.value)} />
                      {errors.numeroJornadas && <p id="numeroJornadas-error" className="text-xs text-red-600 mt-1">{errors.numeroJornadas}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Logo (opcional)</Label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white cursor-pointer text-sm">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)} />
                          Subir logo
                        </label>
                        {formData.logoDataUrl && <img src={formData.logoDataUrl} alt="Logo preview" className="h-12 w-12 object-cover rounded" />}
                      </div>
                    </div>
                  </div>

                  {/* Fechas y estado */}
                  <div className="transition-all duration-500 space-y-4 bg-white rounded-lg shadow-sm p-6 mb-4 border border-amber-100">
                    <h3 className="text-lg font-semibold text-amber-700 border-b pb-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Fechas y Estado
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio" className="text-sm font-medium">
                        Fecha de Inicio *
                      </Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                        className={`w-full ${errors.fechaInicio ? 'border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={!!errors.fechaInicio}
                        aria-describedby={errors.fechaInicio ? 'fechaInicio-error' : undefined}
                        required
                      />
                      {errors.fechaInicio && <p id="fechaInicio-error" className="text-xs text-red-600 mt-1">{errors.fechaInicio}</p>}
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
                        className={`w-full ${errors.fechaFin ? 'border-red-500 focus:ring-red-200' : ''}`}
                        aria-invalid={!!errors.fechaFin}
                        aria-describedby={errors.fechaFin ? 'fechaFin-error' : undefined}
                      />
                      {errors.fechaFin && <p id="fechaFin-error" className="text-xs text-red-600 mt-1">{errors.fechaFin}</p>}
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

                  {/* Vista previa elegante */}
                  <aside className="hidden md:block bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-6 shadow-md border border-amber-100 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-16 w-16 rounded-full bg-white overflow-hidden flex items-center justify-center border-2 border-amber-200 shadow">
                        {formData.logoDataUrl ? (
                          <img src={formData.logoDataUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-amber-400">Logo</span>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-bold text-amber-700">{formData.nombre || 'Nuevo Campeonato'}</div>
                        <div className="text-xs text-amber-500">{formData.categoria || 'Sin categoría'}</div>
                      </div>
                    </div>
                    <div className="text-sm text-amber-700 space-y-2">
                      <div>Fechas: <span className="font-semibold">{formData.fechaInicio || '—'} {formData.fechaFin ? `— ${formData.fechaFin}` : ''}</span></div>
                      <div>Equipos: <span className="font-semibold">{formData.numeroEquipos || '—'}</span></div>
                      <div>Formato: <span className="font-semibold capitalize">{formData.formato}</span></div>
                      <div className="mt-4">
                        <div className="text-xs text-amber-500">Descripción</div>
                        <div className="text-sm text-amber-700 mt-1 line-clamp-4">{formData.descripcion || '—'}</div>
                      </div>
                    </div>
                  </aside>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    disabled={isLoading}
                    className="flex-1 h-12 text-lg bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      const nuevoCampeonato = {
                        id: Date.now().toString(),
                        nombre: formData.nombre.trim(),
                        categoria: formData.categoria.trim(),
                        nivelDificultad: formData.nivelDificultad as "bajo" | "medio" | "alto",
                        numeroEquipos: parseInt(formData.numeroEquipos || '0'),
                        fechaInicio: formData.fechaInicio,
                        fechaFin: formData.fechaFin || undefined,
                        descripcion: formData.descripcion.trim() || undefined,
                        estado: 'borrador' as const,
                        fechaCreacion: new Date().toISOString(),
                        direccion: formData.direccion || undefined,
                        telefono: formData.telefono || undefined,
                        email: formData.email || undefined,
                        formato: formData.formato || undefined,
                        numeroJornadas: formData.numeroJornadas ? parseInt(formData.numeroJornadas) : undefined,
                        logoDataUrl: formData.logoDataUrl || undefined,
                      }
                      addCampeonato(nuevoCampeonato)
                      toast({ title: 'Borrador guardado', description: 'El campeonato se guardó como borrador' })
                      router.push('/dashboard/campeonatos')
                    }}
                  >
                    Guardar borrador
                  </Button>

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
                    onClick={() => router.push("/dashboard/campeonatos")}
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
