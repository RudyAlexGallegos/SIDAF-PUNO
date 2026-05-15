"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useArbitros } from "@/hooks/asistencia/useArbitros"
import { useRegistroAsistencia } from "@/hooks/asistencia/useRegistroAsistencia"
import ListaArbitros from "@/components/asistencia/ListaArbitros"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, BarChart3, Calendar, AlertCircle, Clock, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getStoredUser } from "@/services/api"
import Link from "next/link"

export default function AsistenciaPage() {
  const { arbitros, loading } = useArbitros()
  const { registro, iniciarRegistro, marcarAsistencia, finalizarRegistro, cancelarRegistro, existeRegistroHoy, registroExistenteInfo } = useRegistroAsistencia()

  const [search, setSearch] = React.useState("")
  const [actividad, setActividad] = React.useState<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria">("analisis_partido")
  const [responsable, setResponsable] = React.useState("")
  const [openFinalize, setOpenFinalize] = React.useState(false)
  const [fechaHoraInicio, setFechaHoraInicio] = React.useState<string>("")
  const [fechaSeleccionada, setFechaSeleccionada] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))

  const getActividadesPermitidas = (fechaString: string): Array<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria"> => {
    const fecha = parseISO(fechaString)
    const diaSemana = fecha.getDay()
    switch (diaSemana) {
      case 1: return ["analisis_partido"]
      case 2: return ["preparacion_fisica"]
      case 3: return ["reunion_extraordinaria"]
      case 4: return ["preparacion_fisica"]
      case 5: return ["reunion_ordinaria"]
      case 6: return ["preparacion_fisica"]
      case 0: return ["reunion_extraordinaria"]
      default: return ["reunion_extraordinaria"]
    }
  }

  const actividadesPermitidas = getActividadesPermitidas(fechaSeleccionada)

  React.useEffect(() => {
    if (!actividadesPermitidas.includes(actividad as any)) {
      setActividad(actividadesPermitidas[0])
    }
  }, [actividad, actividadesPermitidas])

  const searchParams = useSearchParams()
  const router = useRouter()

  const esDiaObligatorioHoy = (fechaString?: string) => {
    const fecha = fechaString ? parseISO(fechaString) : new Date()
    const diaSemana = fecha.getDay()
    const diasObligatorios = [1, 2, 4, 5, 6]
    return diasObligatorios.includes(diaSemana)
  }

  const diaObligatorio = esDiaObligatorioHoy(fechaSeleccionada)

  React.useEffect(() => {
    const usuario = getStoredUser()
    if (usuario) {
      const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
      if (nombreCompleto) {
        setResponsable(nombreCompleto)
      }
    }
  }, [])

  React.useEffect(() => {
    try {
      if (searchParams?.get('new') === '1') {
        cancelarRegistro()
        router.replace('/dashboard/asistencia')
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams, cancelarRegistro, router])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return arbitros
    return arbitros.filter((a) => {
      const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`.trim().toLowerCase()
      const idStr = String(a.id || '')
      const dniStr = String(a.dni || '')
      return nombreCompleto.includes(q) || idStr.includes(q) || dniStr.includes(q)
    })
  }, [arbitros, search])

  const estadosMap = React.useMemo(() => {
    const map: Record<string, any> = {}
    if (registro?.arbitros) {
      for (const a of registro.arbitros) {
        map[a.arbitroId] = a.estado
      }
    }
    return map
  }, [registro])

  const _registros = registro?.arbitros ?? []
  const totalArbitros = arbitros?.length ?? 0
  const asistentesCount = _registros.filter(r => r.estado === 'presente' || r.estado === 'tardanza').length
  const excusadosCount = _registros.filter(r => r.estado === 'justificacion').length
  const faltasCount = Math.max(0, totalArbitros - asistentesCount - excusadosCount)

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto"></div>
          <p className="mt-4 text-sky-600">Cargando asistencia...</p>
        </div>
      </div>
    )
  }

  if (!registro) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white">
        <div className="container mx-auto w-full max-w-4xl px-4 py-8">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
            <h1 className="text-3xl font-bold text-sky-900 mb-2">Control de Asistencia</h1>
            <p className="text-sky-600">Comisión Departamental de Árbitros - Puno</p>
          </div>

          <Card className={`mb-6 border-l-4 ${diaObligatorio ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-sky-500 bg-sky-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {diaObligatorio ? <Calendar className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-sky-600" />}
                <div className="flex-1">
                  <p className={`font-semibold ${diaObligatorio ? 'text-emerald-900' : 'text-sky-900'}`}>
                    {diaObligatorio ? `Hoy es ${format(new Date(), 'EEEE', { locale: es })} - Día obligatorio` : `Hoy es ${format(new Date(), 'EEEE', { locale: es })} - Día no obligatorio`}
                  </p>
                  <p className="text-sm text-sky-600 mt-1">
                    Días obligatorios: Lunes, Martes, Jueves, Viernes y Sábado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {existeRegistroHoy && registroExistenteInfo && (
            <Card className="mb-6 border-l-4 border-l-sky-500 bg-sky-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-sky-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sky-900">Ya existe un registro de asistencia para hoy</p>
                    <p className="text-sm text-sky-700 mt-2">
                      <span className="font-medium">Responsable:</span> {registroExistenteInfo.responsable}
                    </p>
                    <p className="text-sm text-sky-700">
                      <span className="font-medium">Actividad:</span> {registroExistenteInfo.actividad?.replace('_', ' ') || 'No especificada'}
                    </p>
                    {registroExistenteInfo.createdAt && (
                      <p className="text-sm text-sky-700">
                        <span className="font-medium">Creado:</span> {new Date(registroExistenteInfo.createdAt).toLocaleString('es-PE')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6 bg-white border-sky-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
            <CardContent className="pt-6 pb-6 space-y-6">
              <div>
                <Label className="text-sm font-medium text-sky-900 mb-2 block">Fecha</Label>
                <Input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="border-sky-200 focus:border-sky-500 focus:ring-sky-500" />
              </div>

              <div>
                <Label className="text-sm font-medium text-sky-900 mb-3 block">Selecciona la actividad</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => actividadesPermitidas.includes('analisis_partido') && setActividad('analisis_partido')} disabled={!actividadesPermitidas.includes('analisis_partido')} className={`relative p-4 rounded-lg border-2 transition-all text-left ${actividad === 'analisis_partido' ? 'border-sky-500 bg-sky-50' : actividadesPermitidas.includes('analisis_partido') ? 'border-sky-200 bg-white hover:border-sky-300' : 'border-sky-100 bg-sky-50/50 opacity-50 cursor-not-allowed'}`}>
                    <div className="font-semibold text-sky-900">Análisis de partido</div>
                    <div className="text-xs text-sky-600 mt-1">Lunes</div>
                    {actividad === 'analisis_partido' && <Check className="w-5 h-5 text-sky-500 absolute right-4 top-4" />}
                  </button>

                  <button onClick={() => actividadesPermitidas.includes('preparacion_fisica') && setActividad('preparacion_fisica')} disabled={!actividadesPermitidas.includes('preparacion_fisica')} className={`relative p-4 rounded-lg border-2 transition-all text-left ${actividad === 'preparacion_fisica' ? 'border-sky-500 bg-sky-50' : actividadesPermitidas.includes('preparacion_fisica') ? 'border-sky-200 bg-white hover:border-sky-300' : 'border-sky-100 bg-sky-50/50 opacity-50 cursor-not-allowed'}`}>
                    <div className="font-semibold text-sky-900">Preparación física</div>
                    <div className="text-xs text-sky-600 mt-1">Martes, Jueves, Sábado</div>
                    {actividad === 'preparacion_fisica' && <Check className="w-5 h-5 text-sky-500 absolute right-4 top-4" />}
                  </button>

                  <button onClick={() => actividadesPermitidas.includes('reunion_ordinaria') && setActividad('reunion_ordinaria')} disabled={!actividadesPermitidas.includes('reunion_ordinaria')} className={`relative p-4 rounded-lg border-2 transition-all text-left ${actividad === 'reunion_ordinaria' ? 'border-sky-500 bg-sky-50' : actividadesPermitidas.includes('reunion_ordinaria') ? 'border-sky-200 bg-white hover:border-sky-300' : 'border-sky-100 bg-sky-50/50 opacity-50 cursor-not-allowed'}`}>
                    <div className="font-semibold text-sky-900">Reunión ordinaria</div>
                    <div className="text-xs text-sky-600 mt-1">Viernes</div>
                    {actividad === 'reunion_ordinaria' && <Check className="w-5 h-5 text-sky-500 absolute right-4 top-4" />}
                  </button>

                  <button onClick={() => actividadesPermitidas.includes('reunion_extraordinaria') && setActividad('reunion_extraordinaria')} disabled={!actividadesPermitidas.includes('reunion_extraordinaria')} className={`relative p-4 rounded-lg border-2 transition-all text-left ${actividad === 'reunion_extraordinaria' ? 'border-sky-500 bg-sky-50' : actividadesPermitidas.includes('reunion_extraordinaria') ? 'border-sky-200 bg-white hover:border-sky-300' : 'border-sky-100 bg-sky-50/50 opacity-50 cursor-not-allowed'}`}>
                    <div className="font-semibold text-sky-900">Reunión extraordinaria</div>
                    <div className="text-xs text-sky-600 mt-1">Miércoles, Domingo</div>
                    {actividad === 'reunion_extraordinaria' && <Check className="w-5 h-5 text-sky-500 absolute right-4 top-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-sky-900 mb-2 block">Responsable</Label>
                <Input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nombre del responsable" className="border-sky-200 focus:border-sky-500 focus:ring-sky-500" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {existeRegistroHoy ? (
              <Button onClick={() => { const ahora = new Date().toISOString(); setFechaHoraInicio(ahora); iniciarRegistro(actividad, responsable, fechaSeleccionada); toast({ title: 'Registro cargado' }) }} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">
                Editar Registro
              </Button>
            ) : (
              <Button onClick={() => { const ahora = new Date().toISOString(); setFechaHoraInicio(ahora); iniciarRegistro(actividad, responsable, fechaSeleccionada); toast({ title: 'Registro iniciado' }) }} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">
                Iniciar Nuevo Registro
              </Button>
            )}
            <Button onClick={() => router.push("/dashboard/asistencia/historial")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reportes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function handleFinalizar() {
    finalizarRegistro(arbitros)
    setOpenFinalize(false)
    toast({ title: 'Registro finalizado', description: `${arbitros?.length || 0} árbitros registrados` })
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 to-white pb-24">
      <div className="container mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">Registro en curso</h1>
            <p className="text-sky-600 mt-1">Marca la asistencia de los árbitros</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-sky-600">Total: <span className="font-bold text-sky-900">{arbitros?.length ?? 0}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-sky-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
            <CardContent className="pt-4">
              <div className="text-xs text-sky-600 font-medium">Actividad</div>
              <div className="text-lg font-bold text-sky-900 mt-1">{actividad.replace('_', ' ')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-sky-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
            <CardContent className="pt-4">
              <div className="text-xs text-emerald-600 font-medium">Asistentes</div>
              <div className="text-lg font-bold text-emerald-900 mt-1">{asistentesCount}/{totalArbitros}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-sky-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400"></div>
            <CardContent className="pt-4">
              <div className="text-xs text-red-600 font-medium">Faltas</div>
              <div className="text-lg font-bold text-red-900 mt-1">{faltasCount}/{totalArbitros}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-white border-sky-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Buscar árbitro por nombre o DNI" value={search} onChange={(e) => setSearch(e.target.value)} className="border-sky-200 focus:border-sky-500 focus:ring-sky-500" />
              </div>
              <div className="flex gap-2">
                <Dialog open={openFinalize} onOpenChange={setOpenFinalize}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Finalizar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar finalización</DialogTitle>
                      <DialogDescription>Se registrará la hora de cierre del control de asistencia.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-sky-900">Actividad:</span>
                        <span className="text-sky-700 ml-2">{actividad.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sky-900">Responsable:</span>
                        <span className="text-sky-700 ml-2">{responsable || '—'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sky-200">
                        <div className="text-center">
                          <div className="text-xs text-sky-600">Total</div>
                          <div className="font-bold text-sky-900">{totalArbitros}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-emerald-600">Asistentes</div>
                          <div className="font-bold text-emerald-900">{asistentesCount}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-red-600">Faltas</div>
                          <div className="font-bold text-red-900">{faltasCount}</div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="border-sky-200 text-sky-600 hover:bg-sky-50">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={handleFinalizar} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => { if (confirm('¿Descartar registro?')) cancelarRegistro() }} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Descartar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-sky-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-sky-500 to-sky-400"></div>
          <CardContent className="pt-6 pb-6">
            <div className="divide-y divide-sky-100">
              <ListaArbitros arbitros={filtered} onChange={marcarAsistencia} estadosMap={estadosMap} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
