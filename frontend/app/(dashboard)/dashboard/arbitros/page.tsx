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
} from "lucide-react"
import { getArbitros, deleteArbitro, Arbitro } from "@/services/api"
import { toast } from "@/hooks/use-toast"

export default function ArbitrosPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Cargar árbitros
  useEffect(() => {
    cargarArbitros()
  }, [])

  const cargarArbitros = async () => {
    setIsLoading(true)
    const data = await getArbitros()
    setArbitros(data)
    setIsLoading(false)
  }

  // Eliminar árbitro
  const handleEliminar = async (id: number) => {
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
        // Actualizar la lista
        setArbitros(arbitros.filter(a => a.id !== id))
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
  }

  // Helper para obtener nombre completo
  const getNombreCompleto = (a: Arbitro) => {
    const partes = []
    if (a.apellido) partes.push(a.apellido)
    if (a.nombre) partes.push(a.nombre)
    return partes.length > 0 ? partes.join(" ") : "Sin nombre"
  }

  // Filtros
  const arbitrosFiltrados = arbitros.filter((arbitro) => {
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

  const getCategoriaColor = (categoria: string | undefined) => {
    if (!categoria) return "bg-slate-200 text-slate-700"
    switch (categoria.toUpperCase()) {
      case "FIFA":
        return "bg-emerald-600 text-white"
      case "NACIONAL":
        return "bg-blue-600 text-white"
      case "REGIONAL":
        return "bg-purple-600 text-white"
      case "PROVINCIAL":
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
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Gestión de Árbitros
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Administra los árbitros del sistema
            </p>
          </div>
        </div>
        
        <Button asChild className="bg-blue-600 hover:bg-blue-700 sm:ml-4">
          <Link href="/dashboard/arbitros/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Árbitro
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6 bg-white rounded-2xl shadow-lg border border-slate-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, email o DNI..."
                  className="w-full h-10 md:h-12 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
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
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="disponible">Disponibles</SelectItem>
                  <SelectItem value="no-disponible">No disponibles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {arbitrosFiltrados.length} resultado{arbitrosFiltrados.length !== 1 ? "s" : ""} encontrado{arbitrosFiltrados.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Lista de árbitros */}
      {arbitrosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No se encontraron árbitros
          </h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando el primer árbitro al sistema"}
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/arbitros/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Árbitro
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {arbitrosFiltrados.map((arbitro) => (
            <Card 
              key={arbitro.id} 
              className="hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="p-4">
                {/* Foto y nombre */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center mb-3">
                    {arbitro.foto ? (
                      <img
                        src={arbitro.foto}
                        alt="Foto árbitro"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    {getNombreCompleto(arbitro)}
                  </h3>

                  {arbitro.categoria && (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getCategoriaColor(arbitro.categoria)}`}>
                      {arbitro.categoria}
                    </span>
                  )}
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    {arbitro.disponible ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{arbitro.disponible ? "Disponible" : "No disponible"}</span>
                  </div>

                  {arbitro.telefono && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{arbitro.telefono}</span>
                    </div>
                  )}

                  {arbitro.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{arbitro.email}</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href={`/dashboard/arbitros/${arbitro.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>

                  <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Link href={`/dashboard/arbitros/${arbitro.id}/editar`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => arbitro.id && handleEliminar(arbitro.id)}
                    disabled={deletingId === arbitro.id}
                    title="Eliminar"
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
  )
}
