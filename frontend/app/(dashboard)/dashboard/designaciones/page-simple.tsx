"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, Trophy, Users, Calendar, Shield } from "lucide-react"
import { getDesignaciones, type Designacion } from "@/services/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useCache } from "@/hooks/useCache"
import { TableSkeleton } from "@/components/Skeletons"

export default function DesignacionesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Fetch designaciones
  const { data: designaciones, isLoading, error } = useCache<Designacion[]>(
    "designaciones",
    async () => {
      const result = await getDesignaciones()
      return Array.isArray(result) ? result : []
    },
    { ttl: 5 * 60 * 1000 }
  )

  // Filter designaciones by search term
  const filteredDesignaciones = useMemo(() => {
    if (!designaciones || !Array.isArray(designaciones)) {
      return []
    }
    
    if (!searchTerm || !searchTerm.trim()) {
      return designaciones
    }

    const term = searchTerm.toLowerCase()
    return designaciones.filter((d: any) => {
      const local = String(d?.nombreEquipoLocal || "").toLowerCase()
      const visitante = String(d?.nombreEquipoVisitante || "").toLowerCase()
      const estadio = String(d?.estadio || "").toLowerCase()
      return (
        local.includes(term) ||
        visitante.includes(term) ||
        estadio.includes(term)
      )
    })
  }, [designaciones, searchTerm])

  // Calculate stats
  const stats = useMemo(() => {
    const data = filteredDesignaciones || []
    return {
      total: data.length,
      confirmadas: data.filter((d: any) => d?.estado?.toUpperCase() === "CONFIRMADA").length,
      pendientes: data.filter((d: any) => d?.estado?.toUpperCase() === "PENDIENTE").length,
    }
  }, [filteredDesignaciones])

  const getStatusBadgeColor = (status: string) => {
    const s = status?.toUpperCase()
    if (s === "CONFIRMADA") return "bg-emerald-500/20 text-emerald-400"
    if (s === "PENDIENTE") return "bg-amber-500/20 text-amber-400"
    if (s === "CANCELADA") return "bg-red-500/20 text-red-400"
    return "bg-slate-500/20 text-slate-400"
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Designaciones
          </h1>
        </div>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-red-400">Error al cargar las designaciones: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Designaciones
          </h1>
          <p className="text-slate-400 mt-1">Gestiona las designaciones de árbitros</p>
        </div>
        <Link href="/dashboard/designaciones/nueva">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Nueva Designación
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50 glass-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Total</CardTitle>
              <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-400">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 glass-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Confirmadas</CardTitle>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">{stats.confirmadas}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 glass-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-300">Pendientes</CardTitle>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-400">{stats.pendientes}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900/50 border-slate-700/50 glass-dark">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar por equipo, estadio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredDesignaciones.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50 glass-dark">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No hay designaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDesignaciones.map((d: any) => (
            <Card key={d.id} className="bg-slate-900/50 border-slate-700/50 glass-dark hover:border-indigo-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-100">
                        {d.nombreEquipoLocal} vs {d.nombreEquipoVisitante}
                      </h3>
                      <Badge className={getStatusBadgeColor(d.estado)}>
                        {d.estado}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-slate-400">
                      <div>📍 {d.estadio}</div>
                      <div>🗓️ {format(new Date(d.fecha), "dd/MM/yyyy", { locale: es })}</div>
                      <div>⏰ {d.hora}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/designaciones/${d.id}`}>
                      <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/designaciones/${d.id}/editar`}>
                      <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
