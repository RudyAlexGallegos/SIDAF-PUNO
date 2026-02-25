"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, X, Eye, Edit } from "lucide-react"

type Campeonato = {
  id: string
  nombre: string
  dificultad: "Alto" | "Medio" | "Bajo"
  categoria: string
  equipos: number
  fechaInicio: string // ISO
  estado: "En Curso" | "Próximamente" | "Finalizado"
}

const CAMPEONATOS: Campeonato[] = [
  { id: "liga-nacional", nombre: "Liga Nacional", dificultad: "Alto", categoria: "Primera División", equipos: 20, fechaInicio: "2025-01-15", estado: "En Curso" },
  { id: "copa-regional", nombre: "Copa Regional", dificultad: "Medio", categoria: "Segunda División", equipos: 16, fechaInicio: "2025-02-05", estado: "En Curso" },
  { id: "torneo-juvenil", nombre: "Torneo Juvenil", dificultad: "Bajo", categoria: "Sub-19", equipos: 12, fechaInicio: "2025-03-20", estado: "En Curso" },
  { id: "copa-internacional", nombre: "Copa Internacional", dificultad: "Alto", categoria: "Elite", equipos: 32, fechaInicio: "2025-04-10", estado: "Próximamente" },
  { id: "liga-provincial", nombre: "Liga Provincial", dificultad: "Medio", categoria: "Tercera División", equipos: 14, fechaInicio: "2025-01-25", estado: "En Curso" },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return iso
  }
}

function DifficultyBadge({ difficulty }: { difficulty: Campeonato["dificultad"] }) {
  const base = "px-2 py-0.5 rounded-md text-sm font-medium"
  if (difficulty === "Alto") return <Badge className={`${base} bg-red-50 text-red-700`}>Alto</Badge>
  if (difficulty === "Medio") return <Badge className={`${base} bg-yellow-50 text-yellow-700`}>Medio</Badge>
  return <Badge className={`${base} bg-green-50 text-green-700`}>Bajo</Badge>
}

function StatusBadge({ estado }: { estado: Campeonato["estado"] }) {
  const base = "px-2 py-0.5 rounded-md text-sm font-medium"
  if (estado === "En Curso") return <Badge className={`${base} bg-green-500 text-white`}>En Curso</Badge>
  if (estado === "Próximamente") return <Badge className={`${base} bg-blue-50 text-blue-700`}>Próximamente</Badge>
  return <Badge className={`${base} bg-slate-100 text-slate-700`}>Finalizado</Badge>
}

export default function CampeonatosPage() {
  const [query, setQuery] = useState<string>("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CAMPEONATOS
    return CAMPEONATOS.filter(c => c.nombre.toLowerCase().includes(q) || c.categoria.toLowerCase().includes(q) || c.dificultad.toLowerCase().includes(q))
  }, [query])

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
            <Badge className="bg-slate-100 text-slate-800 px-2 py-1">{CAMPEONATOS.length}</Badge>
          </div>
          <Button asChild>
            <Link href="/dashboard/campeonatos/nuevo" className="flex items-center">
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
            <label htmlFor="buscar-campeonato" className="sr-only">Buscar campeonato</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input id="buscar-campeonato" value={query} onChange={e => setQuery(e.target.value)} type="search" placeholder="Buscar campeonato..." className="w-[200px] pl-8 md:w-[320px]" />
              {query && (
                <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")} className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-slate-100">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campeonatos Activos</CardTitle>
            <CardDescription>
              Listado de campeonatos registrados en el sistema con su nivel de dificultad
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        No se encontraron campeonatos para la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(c => (
                      <TableRow key={c.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition-colors">
                        <TableCell className="font-medium max-w-[220px] truncate">{c.nombre}</TableCell>
                        <TableCell className="text-center">
                          <DifficultyBadge difficulty={c.dificultad} />
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">{c.categoria}</TableCell>
                        <TableCell className="text-center">{c.equipos}</TableCell>
                        <TableCell className="text-center">{formatDate(c.fechaInicio)}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge estado={c.estado} />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/campeonatos/${c.id}`} aria-label={`Ver ${c.nombre}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" aria-hidden />
                                <span className="hidden md:inline">Ver</span>
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/campeonatos/${c.id}/editar`} aria-label={`Editar ${c.nombre}`} className="flex items-center gap-2">
                                <Edit className="h-4 w-4" aria-hidden />
                                <span className="hidden md:inline">Editar</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
