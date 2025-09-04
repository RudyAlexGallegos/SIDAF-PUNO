"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Users,
  Edit,
  Eye,
  Phone,
  Mail,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useDataStore } from "@/lib/data-store"
import { cn } from "@/lib/utils"

export default function ArbitrosPage() {
  const { arbitros, loadData } = useDataStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    setIsLoading(false)
  }, [loadData])

  // Filtrar árbitros
  const arbitrosFiltrados = arbitros.filter((arbitro) => {
    const matchesSearch =
      arbitro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arbitro.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arbitro.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategoria = filterCategoria === "all" || arbitro.categoria === filterCategoria
    const matchesDisponibilidad =
      filterDisponibilidad === "all" ||
      (filterDisponibilidad === "disponible" && arbitro.disponible) ||
      (filterDisponibilidad === "no-disponible" && !arbitro.disponible)

    return matchesSearch && matchesCategoria && matchesDisponibilidad
  })

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "FIFA":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
      case "Nacional":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "Regional":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
      case "Provincial":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getExperienciaLevel = (experiencia: number) => {
    if (experiencia >= 15) return { label: "Experto", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    if (experiencia >= 10) return { label: "Senior", color: "text-blue-700 bg-blue-50 border-blue-200" }
    if (experiencia >= 5) return { label: "Intermedio", color: "text-purple-700 bg-purple-50 border-purple-200" }
    return { label: "Junior", color: "text-amber-700 bg-amber-50 border-amber-200" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto" />
          <p className="text-lg text-slate-600">Cargando árbitros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Inicio</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Gestión de Árbitros</h1>
                  <p className="text-sm text-slate-600">{arbitros.length} árbitros registrados</p>
                </div>
              </div>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <Link href="/arbitros/nuevo" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nuevo Árbitro</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
            <CardDescription>Encuentra árbitros por nombre, categoría o disponibilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="FIFA">FIFA</SelectItem>
                  <SelectItem value="Nacional">Nacional</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                  <SelectItem value="Provincial">Provincial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDisponibilidad} onValueChange={setFilterDisponibilidad}>
                <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="disponible">Disponibles</SelectItem>
                  <SelectItem value="no-disponible">No disponibles</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  Mostrando {arbitrosFiltrados.length} de {arbitros.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de árbitros */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {arbitrosFiltrados.map((arbitro) => {
            const experienciaLevel = getExperienciaLevel(arbitro.experiencia)

            return (
              <Card
                key={arbitro.id}
                className="group border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {arbitro.nombre?.charAt(0) || ''}
                        {arbitro.apellido?.charAt(0) || ''}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {arbitro.nombre} {arbitro.apellido || ''}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={cn("text-xs px-2 py-1 border-0 shadow-sm", getCategoriaColor(arbitro.categoria))}
                          >
                            {arbitro.categoria}
                          </Badge>
                          <Badge variant="secondary" className={cn("text-xs px-2 py-1 border", experienciaLevel.color)}>
                            {experienciaLevel.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {arbitro.disponible ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{arbitro.experiencia} años de experiencia</span>
                    </div>

                    {arbitro.telefono && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{arbitro.telefono}</span>
                      </div>
                    )}

                    {arbitro.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 truncate">{arbitro.email}</span>
                      </div>
                    )}

                    {arbitro.fechaNacimiento && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {new Date(arbitro.fechaNacimiento).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Link href={`/arbitros/${arbitro.id}`} className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Ver</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Link href={`/arbitros/${arbitro.id}/editar`} className="flex items-center space-x-2">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Estado vacío */}
        {arbitrosFiltrados.length === 0 && (
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron árbitros</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || filterCategoria !== "all" || filterDisponibilidad !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando tu primer árbitro al sistema"}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Link href="/arbitros/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Árbitro
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
