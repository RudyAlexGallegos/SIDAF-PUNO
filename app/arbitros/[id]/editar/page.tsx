"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Trash2, User, AlertTriangle } from "lucide-react"
import { useDataStore } from "@/lib/data-store"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Arbitro {
  id: string
  nombre: string
  apellido: string
  categoria: string
  experiencia: number
  disponible: boolean
  telefono?: string
  email?: string
  fechaNacimiento?: string
  direccion?: string
  observaciones?: string
}

export default function EditarArbitroPage() {
  const params = useParams()
  const router = useRouter()
  const { arbitros, updateArbitro, deleteArbitro, loadData } = useDataStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState<Omit<Arbitro, 'id'>>({
    nombre: "",
    apellido: "",
    categoria: "",
    experiencia: 0,
    disponible: true,
    telefono: "",
    email: "",
    fechaNacimiento: "",
    direccion: "",
    observaciones: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      await loadData()
      const arbitroEncontrado = arbitros.find((a) => a.id === params.id) || {
        nombre: "",
        apellido: "",
        categoria: "",
        experiencia: 0,
        disponible: true,
        telefono: "",
        email: "",
        fechaNacimiento: "",
        direccion: "",
        observaciones: "",
      }
      
      setFormData({
        nombre: arbitroEncontrado.nombre || "",
        apellido: arbitroEncontrado.apellido || "",
        categoria: arbitroEncontrado.categoria || "",
        experiencia: arbitroEncontrado.experiencia || 0,
        disponible: arbitroEncontrado.disponible ?? true,
        telefono: arbitroEncontrado.telefono || "",
        email: arbitroEncontrado.email || "",
        fechaNacimiento: arbitroEncontrado.fechaNacimiento || "",
        direccion: arbitroEncontrado.direccion || "",
        observaciones: arbitroEncontrado.observaciones || "",
      })
      setIsLoading(false)
    }

    fetchData()
  }, [params.id, arbitros, loadData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.categoria) {
      newErrors.categoria = "La categoría es obligatoria"
    }

    if (formData.experiencia < 0 || formData.experiencia > 50) {
      newErrors.experiencia = "La experiencia debe estar entre 0 y 50 años"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no tiene un formato válido"
    }

    if (formData.telefono && !/^\+?[\d\s\-]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no tiene un formato válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await updateArbitro(params.id as string, {
        ...formData,
        experiencia: Number(formData.experiencia),
      })

      toast({
        title: "✅ Árbitro actualizado",
        description: "La información ha sido guardada correctamente",
      })

      router.push("/arbitros")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el árbitro",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteArbitro(params.id as string)

      toast({
        title: "✅ Árbitro eliminado",
        description: "El árbitro ha sido eliminado del sistema",
      })

      router.push("/arbitros")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el árbitro",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const arbitro = arbitros.find((a) => a.id === params.id) || {
    id: params.id as string,
    nombre: "",
    apellido: "",
    categoria: "",
    experiencia: 0,
    disponible: true,
    telefono: "",
    email: "",
    fechaNacimiento: "",
    direccion: "",
    observaciones: "",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto" />
          <p className="text-lg text-slate-600">Cargando árbitro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/arbitros" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Editar Árbitro</h1>
                <p className="text-sm text-slate-600">
                  {arbitro.nombre || 'Nombre no disponible'} {arbitro.apellido || 'Apellido no disponible'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>¿Eliminar árbitro?</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente a{" "}
                      <strong>
                        {arbitro.nombre || 'este árbitro'} {arbitro.apellido || ''}
                      </strong>{" "}
                      del sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos personales y de contacto del árbitro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className={errors.apellido ? "border-red-500" : ""}
                  />
                  {errors.apellido && <p className="text-sm text-red-600">{errors.apellido}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={errors.telefono ? "border-red-500" : ""}
                  />
                  {errors.telefono && <p className="text-sm text-red-600">{errors.telefono}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
              <CardDescription>Categoría, experiencia y disponibilidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="categoria">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFA">FIFA</SelectItem>
                      <SelectItem value="Nacional">Nacional</SelectItem>
                      <SelectItem value="Regional">Regional</SelectItem>
                      <SelectItem value="Provincial">Provincial</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.categoria && <p className="text-sm text-red-600">{errors.categoria}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experiencia">
                    Años de Experiencia <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experiencia"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({ ...formData, experiencia: Number(e.target.value) || 0 })}
                    className={errors.experiencia ? "border-red-500" : ""}
                  />
                  {errors.experiencia && <p className="text-sm text-red-600">{errors.experiencia}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disponible">Disponibilidad</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="disponible"
                      checked={formData.disponible}
                      onCheckedChange={(checked) => setFormData({ ...formData, disponible: checked })}
                    />
                    <Label htmlFor="disponible" className="text-sm">
                      {formData.disponible ? "Disponible" : "No disponible"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el árbitro..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/arbitros">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}