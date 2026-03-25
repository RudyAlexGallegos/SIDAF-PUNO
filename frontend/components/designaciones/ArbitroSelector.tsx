"use client"

import React, { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  MapPin
} from "lucide-react"
import type { Arbitro } from "@/types/asistencia"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ArbitroSelectorProps {
  arbitros: Arbitro[]
  onSeleccionar: (arbitroId: string) => void
  onCancelar: () => void
  posicion?: "principal" | "asistente1" | "asistente2" | "cuarto"
  categoriaMinima?: "fifa" | "nacional" | "regional" | "provincial" | "local"
  asistenciaMinima?: number
  soloDisponibles?: boolean
  seleccionadoId?: string
}

export default function ArbitroSelector({
  arbitros,
  onSeleccionar,
  onCancelar,
  posicion = "principal",
  categoriaMinima,
  asistenciaMinima = 0,
  soloDisponibles = false,
  seleccionadoId
}: ArbitroSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")
  const [sortBy, setSortBy] = useState<"nombre" | "asistencia" | "categoria">("asistencia")
  const [viewMode, setViewMode] = useState<"lista" | "grid">("lista")
  const [arbitrosFiltrados, setArbitrosFiltrados] = useState<Arbitro[]>([])
  const [arbitroSeleccionado, setArbitroSeleccionado] = useState<Arbitro | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Filtrar árbitros
  useEffect(() => {
    let filtrados = [...arbitros]

    // Filtrar por disponibilidad
    if (soloDisponibles) {
      filtrados = filtrados.filter(a => a.disponible !== false)
    }

    // Filtrar por categoría mínima
    if (categoriaMinima && categoriaMinima !== "todos") {
      const categorias = ["fifa", "nacional", "regional", "provincial", "local"]
      const indiceMinimo = categorias.indexOf(categoriaMinima)
      const indiceArbitro = categorias.indexOf((a.categoria || (a as any).categoria)?.toLowerCase())
      if (indiceArbitro < indiceMinimo) {
        filtrados = filtrados.filter(a => false)
      }
    }

    // Filtrar por categoría seleccionada
    if (categoriaFilter !== "todos") {
      filtrados = filtrados.filter(a => {
        const cat = a.categoria || (a as any).categoria
        return cat?.toLowerCase() === categoriaFilter
      })
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtrados = filtrados.filter(a => {
        const nombre = `${a.nombres || a.nombre || ""} ${a.apellidoPaterno || a.apellido || ""}`.toLowerCase()
        const dni = (a.dni || (a as any).codigoCODAR || "").toLowerCase()
        const provincia = a.provincia || ""
        return nombre.includes(term) || dni.includes(term) || provincia.toLowerCase().includes(term)
      })
    }

    // Ordenar
    filtrados.sort((a, b) => {
      if (sortBy === "nombre") {
        const nombreA = `${a.nombres || a.nombre || ""} ${a.apellidoPaterno || a.apellido || ""}`.toLowerCase()
        const nombreB = `${b.nombres || b.nombre || ""} ${b.apellidoPaterno || b.apellido || ""}`.toLowerCase()
        return nombreA.localeCompare(nombreB)
      } else if (sortBy === "asistencia") {
        const asistA = (a as any).asistenciaReciente || 0
        const asistB = (b as any).asistenciaReciente || 0
        return asistB - asistA
      } else {
        const catA = (a.categoria || (a as any).categoria || "local").toLowerCase()
        const catB = (b.categoria || (b as any).categoria || "local").toLowerCase()
        return catA.localeCompare(catB)
      }
    })

    setArbitrosFiltrados(filtrados)
  }, [arbitros, searchTerm, categoriaFilter, sortBy, categoriaMinima, soloDisponibles])

  // Calcular porcentaje de asistencia
  const calcularAsistencia = (arbitro: Arbitro): number => {
    return (arbitro as any).asistenciaReciente || 0
  }

  // Obtener color por categoría
  const getCategoriaColor = (categoria?: string) => {
    switch (categoria?.toLowerCase()) {
      case "fifa":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "nacional":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "regional":
        return "bg-green-100 text-green-700 border-green-300"
      case "provincial":
        return "bg-purple-100 text-purple-700 border-purple-300"
      default:
        return "bg-slate-100 text-slate-700 border-slate-300"
    }
  }

  // Obtener color por porcentaje de asistencia
  const getAsistenciaColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "bg-green-100 text-green-700"
    if (porcentaje >= 70) return "bg-blue-100 text-blue-700"
    if (porcentaje >= 50) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  // Obtener iniciales
  const getInitials = (nombre?: string, apellido?: string) => {
    const a = (apellido || "").trim().split(" ")[0] || ""
    const b = (nombre || "").trim().split(" ")[0] || ""
    return (a.charAt(0) + b.charAt(0)).toUpperCase()
  }

  const handleSeleccionar = (arbitro: Arbitro) => {
    setArbitroSeleccionado(arbitro)
    onSeleccionar(arbitro.id)
  }

  const handleConfirmar = () => {
    if (arbitroSeleccionado) {
      onSeleccionar(arbitroSeleccionado.id)
    }
  }

  // Cerrar menú de filtros al hacer clic fuera
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!(e.target instanceof Node)) return
      if (!menuRef.current.contains(e.target)) setMostrarFiltros(false)
    }
    if (mostrarFiltros) document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [mostrarFiltros])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Seleccionar Árbitro - {posicion === "principal" ? "Principal" : posicion === "asistente1" ? "Asistente 1" : posicion === "asistente2" ? "Asistente 2" : "Cuarto"}
              </h2>
              <p className="text-purple-100 text-sm">
                {soloDisponibles ? "Mostrando solo árbitros disponibles" : "Todos los árbitros"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelar}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="border-b border-slate-200 p-4 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, DNI o provincia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {mostrarFiltros ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {/* Vista */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3">
              <Button
                variant={viewMode === "lista" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("lista")}
                className="p-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M4 24h16" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v3H3v3h7v3h7v3h7v3H3z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Filtros desplegables */}
          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4" ref={menuRef}>
              {/* Filtro por categoría */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2">Categoría</label>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todos">Todas</option>
                  <option value="fifa">FIFA</option>
                  <option value="nacional">Nacional</option>
                  <option value="regional">Regional</option>
                  <option value="provincial">Provincial</option>
                  <option value="local">Local</option>
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="asistencia">Asistencia</option>
                  <option value="nombre">Nombre</option>
                  <option value="categoria">Categoría</option>
                </select>
              </div>

              {/* Estadísticas rápidas */}
              <div className="bg-slate-100 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">
                  {arbitrosFiltrados.length} árbitros encontrados
                </p>
                <p className="text-xs text-slate-600">
                  {arbitrosFiltrados.filter(a => a.disponible).length} disponibles
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lista de árbitros */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {arbitrosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Search className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No se encontraron árbitros</p>
              <p className="text-sm">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" : "space-y-2 p-4"}>
              {arbitrosFiltrados.map((arbitro) => {
                const categoria = arbitro.categoria || (arbitro as any).categoria || "Local"
                const asistencia = calcularAsistencia(arbitro)
                const categoriaColor = getCategoriaColor(categoria)
                const asistenciaColor = getAsistenciaColor(asistencia)
                const iniciales = getInitials(arbitro.nombres || arbitro.nombre, arbitro.apellidoPaterno || arbitro.apellido)
                const disponible = arbitro.disponible !== false
                const nombreCompleto = `${arbitro.nombres || arbitro.nombre || ""} ${arbitro.apellidoPaterno || arbitro.apellido || ""}`.trim()

                return (
                  <div
                    key={arbitro.id}
                    onClick={() => handleSeleccionar(arbitro)}
                    className={`
                      relative group bg-white rounded-xl border-2 p-4 cursor-pointer
                      transition-all duration-200 hover:shadow-lg hover:-translate-y-1
                      ${arbitroSeleccionado?.id === arbitro.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                      ${!disponible ? 'opacity-50 grayscale' : ''}
                      ${categoriaColor}
                    `}
                  >
                    {/* Indicador de selección */}
                    {arbitroSeleccionado?.id === arbitro.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Indicador de disponibilidad */}
                    {!disponible && (
                      <div className="absolute -top-2 -left-2">
                        <Badge variant="destructive" className="text-xs">
                          No disponible
                        </Badge>
                      </div>
                    )}

                    {/* Contenido principal */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                        categoria === "fifa" ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
                        categoria === "nacional" ? "bg-gradient-to-br from-blue-500 to-indigo-500" :
                        categoria === "regional" ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                        categoria === "provincial" ? "bg-gradient-to-br from-purple-500 to-pink-500" :
                        "bg-gradient-to-br from-slate-400 to-slate-500"
                      }`}>
                        {iniciales}
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900 text-base">{nombreCompleto}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${categoriaColor}`}>
                                {categoria.toUpperCase()}
                              </Badge>
                              {asistencia > 0 && (
                                <Badge className={`text-xs ${asistenciaColor}`}>
                                  {asistencia}% asistencia
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            asistencia >= 90 ? "bg-green-100 text-green-700" :
                            asistencia >= 70 ? "bg-blue-100 text-blue-700" :
                            asistencia >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {asistencia}
                          </div>
                        </div>

                        {/* Detalles adicionales */}
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>DNI: {arbitro.dni || (arbitro as any).codigoCODAR || "—"}</span>
                          </div>
                          {arbitro.provincia && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{arbitro.provincia}</span>
                            </div>
                          )}
                          {arbitro.telefono && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{arbitro.telefono}</span>
                            </div>
                          )}
                        </div>

                        {/* Estado de disponibilidad */}
                        <div className={`flex items-center gap-2 p-2 rounded-lg ${disponible ? 'bg-green-50' : 'bg-red-50'}`}>
                          {disponible ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Disponible</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-red-700">No disponible</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M4 24h16" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white hover:bg-slate-50"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {arbitroSeleccionado ? (
              <>
                <span className="font-medium">Seleccionado:</span>
                <span className="ml-2 font-semibold text-slate-900">
                  {arbitroSeleccionado.nombres || arbitroSeleccionado.nombre} {arbitroSeleccionado.apellidoPaterno || arbitroSeleccionado.apellido}
                </span>
              </>
            ) : (
              <span className="text-slate-500">Selecciona un árbitro para continuar</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancelar}
              disabled={!arbitroSeleccionado}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={!arbitroSeleccionado}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Confirmar Selección
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
