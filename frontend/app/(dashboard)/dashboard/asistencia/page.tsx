"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useArbitros } from "@/hooks/asistencia/useArbitros"
import { useRegistroAsistencia } from "@/hooks/asistencia/useRegistroAsistencia"
import ListaArbitros from "@/components/asistencia/ListaArbitros"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getStoredUser } from "@/services/api"
export default function AsistenciaPage() {
  const { arbitros, loading } = useArbitros()
  const {
    registro,
    iniciarRegistro,
    marcarAsistencia,
    finalizarRegistro,
    cancelarRegistro
  } = useRegistroAsistencia()

  const [search, setSearch] = React.useState("")
  const [actividad, setActividad] = React.useState<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria">("analisis_partido")
  const [responsable, setResponsable] = React.useState("")
  const [openFinalize, setOpenFinalize] = React.useState(false)
  const [fechaHoraInicio, setFechaHoraInicio] = React.useState<string>("")
  const searchParams = useSearchParams()
  const router = useRouter()

  // Auto-detectar el usuario actual como responsable
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
        // Forzar nuevo registro cuando se abre la tarjeta desde el dashboard
        cancelarRegistro()
        router.replace('/dashboard/asistencia')
      }
    } catch (e) {
      // ignore server-side or non-browser usage
    }
  }, [searchParams, cancelarRegistro, router])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return arbitros
    return arbitros.filter((a: any) => {
      return (
        String(a.nombre || a.name || "").toLowerCase().includes(q) ||
        String(a.apellido || a.surname || "").toLowerCase().includes(q) ||
        String(a.dni || a.id || "").toLowerCase().includes(q)
      )
    })
  }, [arbitros, search])

  const estadosMap = React.useMemo(() => {
    const map: Record<string, any> = {}
    if (registro?.arbitros) {
      for (const a of registro.arbitros) {
        map[a.arbitroId] = a.estado
      }
    }
    return map as Record<string, import("@/types/asistencia").EstadoAsistencia>
  }, [registro])

  // Estadísticas rápidas para el diálogo de finalización
  const _registros = registro?.arbitros ?? []
  const totalArbitros = arbitros?.length ?? 0
  const asistentesCount = _registros.filter(r => r.estado === 'presente' || r.estado === 'tardanza').length
  const excusadosCount = _registros.filter(r => r.estado === 'justificado' || r.estado === 'licencia').length
  const faltasCount = Math.max(0, totalArbitros - asistentesCount - excusadosCount)
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!registro) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-[calc(100vw-32px)] sm:w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 -mx-4 sm:mx-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">SP</div>
            <div>
              <div className="text-sm text-gray-500">Comisión Departamental de Árbitros</div>
              <div className="text-base font-semibold">Sistema de Gestión — Registro de Asistencia</div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">Inicia un nuevo registro para marcar la asistencia. Los cambios se guardan localmente hasta que finalices.</p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-2">Selecciona la actividad</div>
              <div role="radiogroup" aria-label="Tipo de actividad" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  role="radio"
                  aria-checked={actividad === 'analisis_partido'}
                  type="button"
                  onClick={() => setActividad('analisis_partido')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${actividad === 'analisis_partido' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Análisis de partido</div>
                    <div className={`text-xs ${actividad === 'analisis_partido' ? 'text-blue-100' : 'text-gray-500'}`}>Marcación puntual</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'analisis_partido' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'analisis_partido' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'preparacion_fisica'}
                  type="button"
                  onClick={() => setActividad('preparacion_fisica')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${actividad === 'preparacion_fisica' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Preparación física</div>
                    <div className={`text-xs ${actividad === 'preparacion_fisica' ? 'text-blue-100' : 'text-gray-500'}`}>Entrenamiento y control</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'preparacion_fisica' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'preparacion_fisica' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'reunion_ordinaria'}
                  type="button"
                  onClick={() => setActividad('reunion_ordinaria')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${actividad === 'reunion_ordinaria' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Reunión ordinaria</div>
                    <div className={`text-xs ${actividad === 'reunion_ordinaria' ? 'text-blue-100' : 'text-gray-500'}`}>Asambleas y temas rutinarios</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'reunion_ordinaria' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'reunion_ordinaria' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'reunion_extraordinaria'}
                  type="button"
                  onClick={() => setActividad('reunion_extraordinaria')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${actividad === 'reunion_extraordinaria' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Reunión extraordinaria</div>
                    <div className={`text-xs ${actividad === 'reunion_extraordinaria' ? 'text-blue-100' : 'text-gray-500'}`}>Asuntos urgentes</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'reunion_extraordinaria' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'reunion_extraordinaria' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Responsable <span className="text-gray-400 text-xs">(opcional)</span></label>
              <input
                id="responsable-quick"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del responsable"
                className="mt-1 w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => { 
                const ahora = new Date().toISOString()
                setFechaHoraInicio(ahora)
                iniciarRegistro(actividad, responsable); 
                toast({ title: 'Registro iniciado', description: `${actividad.replace('_',' ')} — ${responsable || 'Sin responsable'}` }) 
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition active:scale-95"
            >
              Iniciar Registro
            </button>

            <div className="text-sm text-gray-500">Prueba con árbitros ficticios para validar la interfaz.</div>
          </div>
        </div>
      </div>
    )
  }

  function handleFinalizar() {
    // si el hook implementa finalizarRegistro, se llamará desde el diálogo
    finalizarRegistro(arbitros)
    setOpenFinalize(false)
    toast({ title: 'Registro finalizado', description: `Se guardó el registro localmente` })
  }

  return (
    <div className="p-4 sm:p-6 pb-28">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Registro en curso</h1>
            <p className="text-sm text-gray-500 mt-1">Marca la asistencia de los árbitros — los cambios se guardan localmente hasta enviar.</p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-sm text-gray-600">Total árbitros</div>
            <div className="px-3 py-1 bg-slate-100 rounded-md font-medium">{arbitros?.length ?? 0}</div>
            <button
              onClick={() => { if (confirm('Descartar el registro en curso y crear uno nuevo?')) cancelarRegistro() }}
              className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-slate-50"
            >
              Nuevo registro
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: button to start a new registro if a registro is active */}
      {registro && (
        <div className="sm:hidden mb-4 px-2">
          <button
            onClick={() => { if (confirm('Descartar el registro en curso y crear uno nuevo?')) cancelarRegistro() }}
            className="w-full px-3 py-3 bg-white border rounded-lg text-sm"
          >
            Nuevo registro
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-2xl overflow-hidden -mx-4 sm:mx-0 w-[calc(100vw-32px)] sm:w-auto mx-auto ring-1 ring-slate-50">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{actividad.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Responsable: <span className="font-medium">{responsable || '—'}</span></div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar árbitro por nombre o DNI"
                  className="w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"></path></svg></span>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={openFinalize} onOpenChange={(v) => setOpenFinalize(v)}>
                  <DialogTrigger asChild>
                    <button className="hidden md:inline-flex px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">Finalizar</button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar finalización</DialogTitle>
                      <DialogDescription>Al finalizar se registrará la hora de cierre y no podrás editar la asistencia fácilmente.</DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                      <p className="text-sm">Actividad: <span className="font-medium">{actividad.replace('_', ' ')}</span></p>
                      <p className="text-sm">Responsable: <span className="font-medium">{responsable || '—'}</span></p>
                      {fechaHoraInicio && (
                        <p className="text-sm text-gray-600">
                          Fecha y hora de inicio: <span className="font-medium">{new Date(fechaHoraInicio).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}</span>
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-medium">{totalArbitros}</div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Asistentes</div>
                          <div className="font-medium text-emerald-600">{asistentesCount}</div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">Faltas</div>
                          <div className="font-medium text-rose-600">{faltasCount}</div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <DialogClose asChild>
                        <button className="px-4 py-2 rounded-md border">Cancelar</button>
                      </DialogClose>
                      <button
                        onClick={handleFinalizar}
                        className="px-4 py-2 rounded-md bg-green-600 text-white ml-2"
                      >
                        Confirmar y finalizar
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-2 bg-white border rounded-md text-sm hidden md:inline-flex"
                >Ir arriba</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-auto p-2">
          <div className="divide-y divide-slate-100">
            <ListaArbitros
              arbitros={filtered}
              onChange={marcarAsistencia}
              estadosMap={estadosMap}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-40 hidden sm:flex">
        <Dialog open={openFinalize} onOpenChange={(v) => setOpenFinalize(v)}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-4 rounded-full shadow-lg text-sm">Finalizar</button>
          </DialogTrigger>
        </Dialog>

        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white border px-4 py-3 rounded-full shadow">↑</button>
      </div>

      {/* Mobile fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:hidden z-50">
        <div className="max-w-[1000px] mx-auto w-[calc(100vw-32px)] sm:w-auto flex gap-3">
          <button onClick={() => { if (confirm('Descartar el registro en curso y crear uno nuevo?')) cancelarRegistro() }} className="flex-1 bg-white border rounded-lg py-3">Descartar</button>
          <button onClick={() => setOpenFinalize(true)} className="flex-1 bg-green-600 text-white rounded-lg py-3 font-semibold">Finalizar</button>
        </div>
      </div>
    </div>
  )
}
