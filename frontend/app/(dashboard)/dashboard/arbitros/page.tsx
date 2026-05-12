"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Users,
  Search,
  X,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Trash2,
  Filter,
} from "lucide-react"
import { getArbitros, deleteArbitro, Arbitro } from "@/services/api"
import { CardSkeleton } from "@/components/Skeletons"

export default function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Load arbitros from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await getArbitros()
        if (Array.isArray(data)) {
          setArbitros(data)
        } else {
          console.warn("getArbitros returned non-array data:", data)
          setArbitros([])
        }
      } catch (error) {
        console.error("Error loading arbitros:", error)
        setArbitros([])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate filtered arbitros inline - no useMemo to avoid cache issues
  const arbitrosFiltrados: Arbitro[] = (() => {
    if (!Array.isArray(arbitros) || arbitros.length === 0) {
      return []
    }

    return arbitros.filter(arbitro => {
      if (!arbitro) return false
      
      const nombre = `${arbitro.nombre || ""} ${arbitro.apellido || ""}`.toLowerCase()
      const matchesSearch = 
        nombre.includes(searchTerm.toLowerCase()) ||
        (arbitro.email ? arbitro.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (arbitro.dni ? arbitro.dni.toLowerCase().includes(searchTerm.toLowerCase()) : false)
      
      const matchesCategoria = filterCategoria === "all" || arbitro.categoria === filterCategoria
      const matchesDisponibilidad = filterDisponibilidad === "all" || 
        (filterDisponibilidad === "disponible" ? arbitro.disponible === true : arbitro.disponible === false)
      
      return matchesSearch && matchesCategoria && matchesDisponibilidad
    })
  })()

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    if (!confirm("¿Estás seguro de que deseas eliminar este árbitro?")) return
    
    setDeletingId(id)
    try {
      await deleteArbitro(id)
      setArbitros(arbitros.filter(a => a.id !== id))
    } catch (error) {
      console.error("Error deleting arbitro:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const hasActiveFilters = searchTerm || filterCategoria !== "all" || filterDisponibilidad !== "all"
  const resetFilters = () => {
    setSearchTerm("")
    setFilterCategoria("all")
    setFilterDisponibilidad("all")
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
        <div className="container mx-auto w-full max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-sky-900 mb-8">Gestión de Árbitros</h1>
          <CardSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <div className="container mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-sky-100">
                  <ArrowLeft className="h-5 w-5 text-sky-900" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">Gestión de Árbitros</h1>
                <p className="text-sky-600 mt-1">{arbitrosFiltrados.length} resultados</p>
              </div>
            </div>
            <Button asChild className="bg-sky-600 hover:bg-sky-700 h-10">
              <Link href="/dashboard/arbitros/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Link>
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o DNI..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-sky-200 bg-white text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters - Mobile button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                showFilters 
                  ? "border-sky-500 bg-sky-50" 
                  : "border-sky-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-sky-600" />
                <span className="font-medium text-sm text-sky-900">
                  Filtros {hasActiveFilters && `(${[
                    searchTerm ? 1 : 0,
                    filterCategoria !== "all" ? 1 : 0,
                    filterDisponibilidad !== "all" ? 1 : 0
                  ].reduce((a, b) => a + b, 0)})`}
                </span>
              </div>
              <div className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>

          {/* Filters - Desktop and Mobile expanded */}
          <div className={`${showFilters ? "block md:block" : "hidden md:block"} mb-6`}>
            <Card className="bg-white border-sky-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-900 mb-2">Categoría</label>
                    <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                      <SelectTrigger className="w-full border-sky-200 text-sky-900">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="FIFA">FIFA</SelectItem>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                        <SelectItem value="Primera Categoría">Primera Categoría</SelectItem>
                        <SelectItem value="Segunda Categoría">Segunda Categoría</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sky-900 mb-2">Disponibilidad</label>
                    <Select value={filterDisponibilidad} onValueChange={setFilterDisponibilidad}>
                      <SelectTrigger className="w-full border-sky-200 text-sky-900">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="disponible">Disponibles</SelectItem>
                        <SelectItem value="no-disponible">No disponibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="w-full border-sky-200 text-sky-600 hover:bg-sky-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Arbitros Grid */}
        {arbitrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-16 w-16 text-sky-200 mb-4" />
            <h3 className="text-lg font-semibold text-sky-900 mb-2">No se encontraron árbitros</h3>
            <p className="text-sky-600 mb-6">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer árbitro"}
            </p>
            <Button asChild className="bg-sky-600 hover:bg-sky-700">
              <Link href="/dashboard/arbitros/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Árbitro
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {arbitrosFiltrados.map((arbitro) => (
              <Card key={arbitro.id} className="bg-white border-sky-200 hover:shadow-lg hover:border-sky-300 transition-all">
                <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400" />
                <CardContent className="p-4">
                  {/* Nombre */}
                  <h3 className="font-bold text-sky-900 text-center mb-2 line-clamp-2">
                    {arbitro.apellido} {arbitro.nombre}
                  </h3>

                  {/* Categoría badge */}
                  {arbitro.categoria && (
                    <div className="flex justify-center mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                        {arbitro.categoria}
                      </span>
                    </div>
                  )}

                  {/* Disponibilidad */}
                  <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-sky-100">
                    {arbitro.disponible ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-600">Disponible</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">No disponible</span>
                      </>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {arbitro.telefono && (
                      <div className="flex items-center gap-2 text-sky-700">
                        <Phone className="h-4 w-4 text-sky-500 flex-shrink-0" />
                        <span className="truncate">{arbitro.telefono}</span>
                      </div>
                    )}
                    {arbitro.email && (
                      <div className="flex items-center gap-2 text-sky-700">
                        <Mail className="h-4 w-4 text-sky-500 flex-shrink-0" />
                        <span className="truncate text-xs">{arbitro.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1 border-sky-200 text-sky-600 hover:bg-sky-50">
                      <Link href={`/dashboard/arbitros/${arbitro.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 bg-sky-600 hover:bg-sky-700">
                      <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => arbitro.id && handleDelete(arbitro.id)}
                      disabled={deletingId === arbitro.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
