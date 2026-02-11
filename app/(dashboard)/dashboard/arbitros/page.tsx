"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { getArbitros, Arbitro } from "@/services/api"

export default function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // 🔹 Cargar árbitros
  useEffect(() => {
    async function cargarArbitros() {
      setIsLoading(true)
      const data = await getArbitros()
      setArbitros(data)
      setIsLoading(false)
    }
    cargarArbitros()
  }, [])

  // 🔹 Filtros
  const arbitrosFiltrados = arbitros.filter((arbitro) => {
    const matchesSearch =
      arbitro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arbitro.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arbitro.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategoria =
      filterCategoria === "all" || arbitro.categoria === filterCategoria

    const matchesDisponibilidad =
      filterDisponibilidad === "all" ||
      (filterDisponibilidad === "disponible" && arbitro.disponible) ||
      (filterDisponibilidad === "no-disponible" && !arbitro.disponible)

    return matchesSearch && matchesCategoria && matchesDisponibilidad
  })

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "FIFA":
        return "bg-emerald-600 text-white"
      case "Nacional":
        return "bg-blue-600 text-white"
      case "Regional":
        return "bg-purple-600 text-white"
      case "Provincial":
        return "bg-amber-600 text-white"
      default:
        return "bg-slate-200 text-slate-700"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Cargando árbitros...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              {/* CORREGIDO: Volver al dashboard principal */}
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Gestión de Árbitros</h1>
          </div>

          {/* CORREGIDO: Ruta correcta para nuevo árbitro */}
          <Button asChild>
            <Link href="/dashboard/arbitros/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Árbitro
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>Búsqueda y filtrado</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="FIFA">FIFA</SelectItem>
                <SelectItem value="Nacional">Nacional</SelectItem>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Provincial">Provincial</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterDisponibilidad}
              onValueChange={setFilterDisponibilidad}
            >
              <SelectTrigger>
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponible">Disponibles</SelectItem>
                <SelectItem value="no-disponible">No disponibles</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-slate-600">
              {arbitrosFiltrados.length} resultados
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {arbitrosFiltrados.map((arbitro) => {
            const foto = (arbitro as any).fotoUrl as string | undefined

            return (
              <Card key={arbitro.id} className="hover:shadow-lg transition">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center mb-3">
                    {foto ? (
                      <img
                        src={foto}
                        alt="Foto árbitro"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-500" />
                    )}
                  </div>

                  <h3 className="font-semibold text-lg">
                    {arbitro.nombre} {arbitro.apellido}
                  </h3>

                  <Badge className={getCategoriaColor(arbitro.categoria)}>
                    {arbitro.categoria}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    {arbitro.disponible ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {arbitro.disponible ? "Disponible" : "No disponible"}
                  </p>

                  {arbitro.telefono && (
                    <p className="flex gap-2 items-center">
                      <Phone className="h-4 w-4" />
                      {arbitro.telefono}
                    </p>
                  )}

                  {arbitro.email && (
                    <p className="flex gap-2 items-center">
                      <Mail className="h-4 w-4" />
                      {arbitro.email}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {/* CORREGIDO: Ruta con /dashboard */}
                      <Link href={`/dashboard/arbitros/${arbitro.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>

                    <Button asChild size="sm" className="flex-1">
                      {/* CORREGIDO: Ruta con /dashboard */}
                      <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}