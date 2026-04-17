"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  Edit,
  Eye,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Users,
  Trash2,
  Search,
  Filter,
  X,
} from "lucide-react"
import { getArbitros, deleteArbitro, Arbitro } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { useCache } from "@/hooks/useCache"
import { CardSkeleton } from "@/components/Skeletons"

export default function ArbitrosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // Fetcher function for useCache hook
  const fetchArbitros = async () => {
    const data = await getArbitros()
    return data || []
  }

  // Use cache hook for data fetching with 5-minute TTL
  const { data: arbitros = [], isLoading, error: cacheError, refetch } = useCache(
    "arbitros",
    fetchArbitros,
    { ttl: 5 * 60 * 1000 }
  )

  // Verificar si hay filtros activos
  useEffect(() => {
    setHasActiveFilters(
      searchTerm !== "" ||
      filterCategoria !== "all" ||
      filterDisponibilidad !== "all"
    )
  }, [searchTerm, filterCategoria, filterDisponibilidad])

  // Eliminar árbitro
  const handleEliminar = useCallback(async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este árbitro? Esta acción no se puede deshacer.")) {
      return
    }
    
    setDeletingId(id)
    try {
      const success = await deleteArbitro(id)
      if (success) {
        toast({
          title: "Árbitro eliminado",
          description: "El árbitro ha sido eliminado correctamente",
        })
        refetch()
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el árbitro",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el árbitro",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }, [refetch])

  // Helper para obtener nombre completo
  const getNombreCompleto = useCallback((a: Arbitro) => {
    const partes = []
    if (a.apellido) partes.push(a.apellido)
    if (a.nombre) partes.push(a.nombre)
    return partes.length > 0 ? partes.join(" ") : "Sin nombre"
  }, [])

  // Filtros optimizados
  const arbitrosFiltrados = useMemo(() => {
    return arbitros.filter((arbitro) => {
      const nombreCompleto = getNombreCompleto(arbitro).toLowerCase()
      const matchesSearch =
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        arbitro.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arbitro.dni?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategoria =
        filterCategoria === "all" || arbitro.categoria === filterCategoria

      const matchesDisponibilidad =
        filterDisponibilidad === "all" ||
        (filterDisponibilidad === "disponible" && arbitro.disponible) ||
        (filterDisponibilidad === "no-disponible" && !arbitro.disponible)

      return matchesSearch && matchesCategoria && matchesDisponibilidad
    })
  }, [arbitros, searchTerm, filterCategoria, filterDisponibilidad, getNombreCompleto])

  const getCategoriaColor = useCallback((categoria: string | undefined) => {
    if (!categoria) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    switch (categoria.toUpperCase()) {
      case "FIFA":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "NACIONAL":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "REGIONAL":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "PROVINCIAL":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
    }
  }, [])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setFilterCategoria("all")
    setFilterDisponibilidad("all")
  }, [])

  if (isLoading && arbitros.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-4 md:py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 h-9 w-9 md:h-10 md:w-10 p-0"
                    aria-label="Volver"
                  >
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    Gestión de Árbitros
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cargando datos...
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skeleton Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CardSkeleton count={8} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 flex-1">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-slate-200 dark:hover:bg-slate-700 h-9 w-9 md:h-10 md:w-10 p-0"
                  aria-label="Volver"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  Gestión de Árbitros
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {arbitrosFiltrados.length} resultado{arbitrosFiltrados.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            
            <Button 
              asChild 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shrink-0 h-9 md:h-10"
              size="sm"
            >
              <Link href="/dashboard/arbitros/nuevo" className="flex items-center gap-1 md:gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </Link>
            </Button>
          </div>

          {/* Barra de búsqueda principal */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o DNI..."
              className="w-full h-10 md:h-12 pl-10 pr-10 md:pr-12 rounded-lg md:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros responsivos */}
        <div className="mb-6">
          {/* Botón de filtros (solo en móvil) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                showFilters 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium text-sm">
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

          {/* Panel de filtros */}
          <div className={`${showFilters ? "max-h-96 mb-4" : "max-h-0 md:max-h-none"} md:max-h-none overflow-hidden md:overflow-visible transition-all duration-300`}>
            <Card className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-4">
                  {/* Filtro Categoría */}
                  <div className="flex-1">
                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Categoría
                    </label>
                    <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                      <SelectTrigger className="w-full h-9 md:h-11">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="FIFA">FIFA</SelectItem>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                        <SelectItem value="Provincial">Provincial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro Disponibilidad */}
                  <div className="flex-1">
                    <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Disponibilidad
                    </label>
                    <Select value={filterDisponibilidad} onValueChange={setFilterDisponibilidad}>
                      <SelectTrigger className="w-full h-9 md:h-11">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="disponible">Disponibles</SelectItem>
                        <SelectItem value="no-disponible">No disponibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botón Limpiar filtros */}
                  {hasActiveFilters && (
                    <div className="flex items-end pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="w-full md:w-auto h-9 md:h-11"
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">Limpiar</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Lista de árbitros - Estado vacío */}
        {arbitrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white mb-1">
              No se encontraron árbitros
            </h3>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer árbitro al sistema"}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Link href="/dashboard/arbitros/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Árbitro
                </Link>
              </Button>
              {hasActiveFilters && (
                <Button 
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading && arbitros.length === 0 ? (
              <CardSkeleton count={8} />
            ) : (
              arbitrosFiltrados.map((arbitro) => (
                <ArbitroCard
                  key={arbitro.id}
                  arbitro={arbitro}
                  getNombreCompleto={getNombreCompleto}
                  getCategoriaColor={getCategoriaColor}
                onDelete={() => arbitro.id && handleEliminar(arbitro.id)}
                isDeleting={deletingId === arbitro.id}
              />
            ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente separado para la tarjeta de árbitro
function ArbitroCard({ 
  arbitro, 
  getNombreCompleto, 
  getCategoriaColor, 
  onDelete,
  isDeleting 
}: {
  arbitro: Arbitro
  getNombreCompleto: (a: Arbitro) => string
  getCategoriaColor: (c: string | undefined) => string
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <Card 
      className="h-full hover:shadow-lg dark:hover:shadow-lg/50 transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group"
    >
      {/* Encabezado degradado */}
      <div className="h-1.5 md:h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
      
      <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
        {/* Foto y nombre */}
        <div className="flex flex-col items-center text-center mb-3 md:mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden flex items-center justify-center mb-2 md:mb-3 border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 transition-colors">
            {arbitro.foto ? (
              <img
                src={arbitro.foto}
                alt={getNombreCompleto(arbitro)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <User className="w-6 h-6 md:w-8 md:h-8 text-slate-400 dark:text-slate-500" />
            )}
          </div>

          <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white line-clamp-2">
            {getNombreCompleto(arbitro)}
          </h3>

          {arbitro.categoria && (
            <span className={`inline-block px-2 md:px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${getCategoriaColor(arbitro.categoria)}`}>
              {arbitro.categoria}
            </span>
          )}
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-xs md:text-sm mb-3 md:mb-4 flex-1">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            {arbitro.disponible ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                <span className="text-green-700 dark:text-green-400 font-medium">Disponible</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 dark:text-red-400 font-medium">No disponible</span>
              </>
            )}
          </div>

          {arbitro.telefono && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 min-w-0">
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">{arbitro.telefono}</span>
            </div>
          )}

          {arbitro.email && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 min-w-0">
              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate text-xs">{arbitro.email}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-1.5 md:gap-2 pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-700">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 h-8 md:h-9 text-xs md:text-sm"
          >
            <Link href={`/dashboard/arbitros/${arbitro.id}`}>
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">Ver</span>
            </Link>
          </Button>

          <Button 
            asChild 
            size="sm" 
            className="flex-1 h-8 md:h-9 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
              <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
              <span className="hidden xs:inline">Editar</span>
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 md:h-9 w-8 md:w-9 p-0"
            onClick={onDelete}
            disabled={isDeleting}
            title="Eliminar"
            aria-label="Eliminar árbitro"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

