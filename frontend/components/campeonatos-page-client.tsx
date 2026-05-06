"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, X, Eye, Edit, Trash2, AlertCircle, Lock, Loader2 } from "lucide-react"
import { TableSkeleton } from "@/components/Skeletons"
import { useCache } from "@/hooks/useCache"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return iso
  }
}

function DifficultyBadge({ difficulty }: { difficulty: string | undefined }) {
  const base = "px-2 py-0.5 rounded-md text-sm font-medium"
  if (difficulty === "Alto") return <Badge className={`${base} bg-red-50 text-red-700`}>Alto</Badge>
  if (difficulty === "Medio") return <Badge className={`${base} bg-yellow-50 text-yellow-700`}>Medio</Badge>
  return <Badge className={`${base} bg-green-50 text-green-700`}>Bajo</Badge>
}

function StatusBadge({ estado }: { estado: string | undefined }) {
  const base = "px-2 py-0.5 rounded-md text-sm font-medium"
  if (estado === "ACTIVO") return <Badge className={`${base} bg-green-500 text-white`}>En Curso</Badge>
  if (estado === "PROGRAMADO") return <Badge className={`${base} bg-blue-50 text-blue-700`}>Próximamente</Badge>
  return <Badge className={`${base} bg-slate-100 text-slate-700`}>Finalizado</Badge>
}

export default function CampeonadosPage() {
  const [query, setQuery] = useState<string>("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; nombre: string }>({
    open: false,
    id: null,
    nombre: "",
  })
  const [error, setError] = useState<string>("")

  // Crear COPA PERÚ 2026 si no existe
  const crearCopaPeru = async () => {
    try {
      const res = await fetch(`${API_URL}/campeonato`)
      if (!res.ok) return
      const campeonatos = await res.json()
      const existeCopa = campeonatos.some((c: any) => c.nombre === "COPA PERÚ 2026")
      
      if (!existeCopa) {
        const nuevoCampeonato = {
          nombre: "COPA PERÚ 2026",
          categoria: "Profesional",
          tipo: "Torneo",
          estado: "ACTIVO",
          fechaInicio: "2026-04-01",
          fechaFin: "2026-12-31",
          organizador: "FPF",
          contacto: "+51 1 2200080",
          ciudad: "Lima",
          provincia: "Lima",
          nivelDificultad: "Alto",
          numeroEquipos: 32,
          formato: "Regional",
          observaciones: "Campeonato nacional principal 2026. No puede ser eliminado.",
        }
        await fetch(`${API_URL}/campeonato`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoCampeonato),
        })
      }
    } catch (error) {
      console.error("Error creando COPA PERÚ:", error)
    }
  }

  // Fetcher function for useCache hook
  const fetchCampeonatos = async () => {
    const res = await fetch(`${API_URL}/campeonato`, {
      cache: 'no-store'
    })
    if (!res.ok) throw new Error("Failed to load championships")
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }

  // Use cache hook for data fetching with 5-minute TTL
  const { data: campeonatos = [], isLoading, error: cacheError, refetch } = useCache(
    "campeonatos",
    fetchCampeonatos,
    { ttl: 5 * 60 * 1000 }
  )

  useEffect(() => {
    crearCopaPeru().then(() => {
      // Cache hook loads automatically, but we can refetch if needed
    })
  }, [])

  const handleDeleteClick = (id: number, nombre: string) => {
    // Proteger COPA PERÚ 2026
    if (nombre === "COPA PERÚ 2026") {
      setError("No se puede eliminar 'COPA PERÚ 2026'. Este es un campeonato protegido del sistema.")
      return
    }
    setDeleteDialog({ open: true, id, nombre })
  }

  const handleConfirmDelete = async () => {
    if (deleteDialog.id === null) return

    try {
      setIsDeleting(true)
      const res = await fetch(`${API_URL}/campeonato/${deleteDialog.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Error al eliminar el campeonato")
      }

      // Refresh the cache after deletion
      refetch()
      setDeleteDialog({ open: false, id: null, nombre: "" })
      setError("")
    } catch (error) {
      console.error("Error deleting:", error)
      setError("Error al eliminar el campeonato. Intenta nuevamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return campeonatos
    return campeonatos.filter(c => 
      c.nombre?.toLowerCase().includes(q) || 
      c.categoria?.toLowerCase().includes(q) || 
      c.nivelDificultad?.toLowerCase().includes(q)
    )
  }, [query, campeonatos])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-5 w-5" aria-hidden />
          <span>Volver al Dashboard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <Badge className="bg-slate-100 text-slate-800 px-2 py-1">{campeonatos.length}</Badge>
          </div>
          <Button asChild>
            <Link href="/dashboard/campeonato/nuevo" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Nuevo Campeonato
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestión de Campeonatos</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="buscar-campeonato" className="sr-only">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input id="buscar-campeonato" value={query} onChange={e => setQuery(e.target.value)} type="search" placeholder="Buscar..." className="w-[200px] pl-8 md:w-[320px]" />
              {query && (
                <button aria-label="Limpiar" onClick={() => setQuery("")} className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-slate-100">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Campeonatos Activos</CardTitle>
            <CardDescription>Listado de certificados registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <TableSkeleton rows={5} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Nombre</TableHead>
                      <TableHead className="text-center">Nivel</TableHead>
                      <TableHead className="text-center">Categoría</TableHead>
                      <TableHead className="text-center">Equipos</TableHead>
                      <TableHead className="text-center">Fecha Inicio</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                          No se encontraron.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(c => (
                        <TableRow key={c.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors">
                          <TableCell className="font-medium max-w-[220px] truncate flex items-center gap-2">
                            {c.nombre}
                            {c.nombre === "COPA PERÚ 2026" && (
                              <Lock className="h-4 w-4 text-yellow-600 flex-shrink-0" title="Campeonato protegido" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DifficultyBadge difficulty={c.nivelDificultad} />
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">{c.categoria}</TableCell>
                          <TableCell className="text-center">{c.numeroEquipos}</TableCell>
                          <TableCell className="text-center">{c.fechaInicio ? formatDate(c.fechaInicio) : '-'}</TableCell>
                          <TableCell className="text-center">
                            <StatusBadge estado={c.estado} />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/dashboard/campeonatos/${c.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" aria-hidden />
                                  <span className="hidden md:inline">Ver</span>
                                </Link>
                              </Button>
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/dashboard/campeonatos/${c.id}/editar`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" aria-hidden />
                                  <span className="hidden md:inline">Editar</span>
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(c.id, c.nombre)}
                                disabled={isDeleting || c.nombre === "COPA PERÚ 2026"}
                                className={c.nombre === "COPA PERÚ 2026" ? "text-gray-400 cursor-not-allowed opacity-50" : "text-red-600 hover:bg-red-50 hover:text-red-700"}
                                title={c.nombre === "COPA PERÚ 2026" ? "Este campeonato está protegido y no puede ser eliminado" : ""}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                                <span className="hidden md:inline">Eliminar</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Campeonato</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el campeonato <strong>"{deleteDialog.nombre}"</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}