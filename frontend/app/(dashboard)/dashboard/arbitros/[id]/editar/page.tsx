"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { ArrowLeft, Save, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getArbitros, updateArbitro, Arbitro } from "@/services/api"

export default function EditarArbitroPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") // view | null

  const [arbitro, setArbitro] = useState<Arbitro | null>(null)
  const [saving, setSaving] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const soloLectura = mode === "view"

  // 🔹 Cargar árbitro usando getArbitros()
  useEffect(() => {
    async function cargar() {
      const lista = await getArbitros()
      const encontrado = lista.find(a => a.id === Number(id))
      if (!encontrado) {
        router.push("/arbitros")
        return
      }
      setArbitro(encontrado)
      setFotoPreview((encontrado as any).fotoUrl ?? null)
    }
    cargar()
  }, [id, router])

  const handleChange = (key: keyof Arbitro, value: any) => {
    if (!arbitro || soloLectura) return
    setArbitro({ ...arbitro, [key]: value })
  }

  // 🔹 Manejo de foto / avatar
  const handleFotoChange = (file: File | null) => {
    if (!file || !arbitro || soloLectura) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFotoPreview(base64)
      setArbitro({ ...arbitro, ...({ fotoUrl: base64 } as any) })
    }
    reader.readAsDataURL(file)
  }

  const guardar = async () => {
    if (!arbitro) return
    setSaving(true)
    await updateArbitro(arbitro.id!, arbitro)
    router.push(`/arbitros/${arbitro.id}`)
  }

  if (!arbitro) {
    return <div className="p-8">Cargando árbitro...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/arbitros" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              {soloLectura ? "Perfil del Árbitro" : "Editar Árbitro"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* FOTO / AVATAR */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {fotoPreview ? (
                  <img src={fotoPreview} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>

              {!soloLectura && (
                <div>
                  <Label>Foto de perfil</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFotoChange(e.target.files?.[0] ?? null)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  disabled={soloLectura}
                  value={arbitro.nombre}
                  onChange={e => handleChange("nombre", e.target.value)}
                />
              </div>

              <div>
                <Label>Apellido</Label>
                <Input
                  disabled={soloLectura}
                  value={arbitro.apellido ?? ""}
                  onChange={e => handleChange("apellido", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Categoría</Label>
              <Select
                disabled={soloLectura}
                value={arbitro.categoria}
                onValueChange={v => handleChange("categoria", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFA">FIFA</SelectItem>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Regional">Primera Categoría</SelectItem>
                  <SelectItem value="Provincial">Segunda Categoría</SelectItem>
                  <SelectItem value="Regional">Tercera Categoría</SelectItem>
                  <SelectItem value="Provincial">Aspirante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Años de experiencia</Label>
              <Input
                disabled={soloLectura}
                type="number"
                min={0}
                value={arbitro.experiencia ?? 0}
                onChange={e => handleChange("experiencia", Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <Label>Disponible</Label>
              <Switch
                disabled={soloLectura}
                checked={arbitro.disponible ?? false}
                onCheckedChange={v => handleChange("disponible", v)}
              />
            </div>

            <div>
              <Label>Observaciones</Label>
              <Textarea
                disabled={soloLectura}
                rows={4}
                value={arbitro.observaciones ?? ""}
                onChange={e => handleChange("observaciones", e.target.value)}
              />
            </div>

            {!soloLectura && (
              <Button onClick={guardar} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

