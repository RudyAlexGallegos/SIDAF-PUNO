"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useArbitros } from "@/hooks/asistencia/useArbitros"
import { useRegistroAsistencia } from "@/hooks/asistencia/useRegistroAsistencia"
import ListaArbitros from "@/components/asistencia/ListaArbitros"
import { format, getDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
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
import { Check, BarChart3, Calendar, AlertCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getStoredUser } from "@/services/api"
import Link from "next/link"
export default function AsistenciaPage() {
  const { arbitros, loading } = useArbitros()
  const {
    registro,
    iniciarRegistro,
    marcarAsistencia,
    finalizarRegistro,
    cancelarRegistro,
    existeRegistroHoy,
    idRegistroExistente
  } = useRegistroAsistencia()

  const [search, setSearch] = React.useState("")
   const [actividad, setActividad] = React.useState<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria">("analisis_partido")
   const [responsable, setResponsable] = React.useState("")
   const [openFinalize, setOpenFinalize] = React.useState(false)
   const [fechaHoraInicio, setFechaHoraInicio] = React.useState<string>("")
   const [fechaSeleccionada, setFechaSeleccionada] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
   
   // Obtener actividades permitidas para la fecha seleccionada
   const getActividadesPermitidas = (fechaString: string): Array<"analisis_partido" | "preparacion_fisica" | "reunion_ordinaria" | "reunion_extraordinaria"> => {
     const fecha = parseISO(fechaString)
     const diaSemana = fecha.getDay() // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
     
     switch (diaSemana) {
       case 1: // Lunes
         return ["analisis_partido"]
       case 2: // Martes
         return ["preparacion_fisica"]
       case 3: // Miércoles
         return ["reunion_extraordinaria"]
       case 4: // Jueves
         return ["preparacion_fisica"]
       case 5: // Viernes
         return ["reunion_ordinaria"]
       case 6: // Sábado
         return ["preparacion_fisica"]
       case 0: // Domingo
         return ["reunion_extraordinaria"]
       default:
         return ["reunion_extraordinaria"]
     }
   }
   
   const actividadesPermitidas = getActividadesPermitidas(fechaSeleccionada)
   
   // Asegurar que la actividad actual esté permitida, si no, cambiar a la primera permitida
   React.useEffect(() => {
     if (!actividadesPermitidas.includes(actividad as any)) {
       setActividad(actividadesPermitidas[0])
     }
   }, [actividad, actividadesPermitidas])
  
  const searchParams = useSearchParams()
  const router = useRouter()

  // Verificar si una fecha es un día obligatorio
  const esDiaObligatorioHoy = (fechaString?: string) => {
    const fecha = fechaString ? parseISO(fechaString) : new Date()
    const diaSemana = fecha.getDay() // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    const diasObligatorios = [1, 2, 4, 5, 6] // Lun(1), Mar(2), Jue(4), Vie(5), Sáb(6)
    return diasObligatorios.includes(diaSemana)
  }

  const diaObligatorio = esDiaObligatorioHoy(fechaSeleccionada)

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
     return map as Record<string, import("@/types/asistencia").EstadoAsistencia>
   }, [registro])

  // Estadísticas rápidas para el diálogo de finalización
  const _registros = registro?.arbitros ?? []
  const totalArbitros = arbitros?.length ?? 0
  const asistentesCount = _registros.filter(r => r.estado === 'presente' || r.estado === 'tardanza').length
  const excusadosCount = _registros.filter(r => r.estado === 'justificacion').length
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
      <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Header gradient card */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Control de Asistencia</h2>
                <p className="text-blue-100 text-sm">Comisión Departamental de Árbitros - Puno</p>
              </div>
            </div>
          </div>

          {/* Aviso de día obligatorio */}
          <div className={`rounded-lg p-4 mb-6 ${diaObligatorio ? 'bg-blue-50 border border-blue-200' : 'bg-gray-100 border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              {diaObligatorio ? (
                <Calendar className="w-5 h-5 text-blue-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-500" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${diaObligatorio ? 'text-blue-800' : 'text-gray-600'}`}>
                  {diaObligatorio 
                    ? `Hoy es ${format(new Date(), 'EEEE', { locale: es })} - Día obligatorio`
                    : `Hoy es ${format(new Date(), 'EEEE', { locale: es })} - Día no obligatorio`}
                </p>
                <p className="text-sm text-gray-500">
                  Los días obligatorios desde 01/01/2026 son: Lunes, Martes, Jueves, Viernes y Sábado
                </p>
              </div>
              <Link 
                href="/dashboard/asistencia/historial"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Ver historial
              </Link>
            </div>
          </div>

          {/* Notificación de registro existente */}
          {existeRegistroHoy && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">Ya existe un registro de asistencia para hoy</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Se actualizará el registro existente (ID: {idRegistroExistente}). Puedes modificar la asistencia de los árbitros y guardar los cambios.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            {existeRegistroHoy 
              ? "Continúa editando el registro de hoy. Los cambios se guardarán al finalizar."
              : "Inicia un nuevo registro haciendo clic en el botón de abajo."}
          </p>

          {/* Main card with improved styling */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="text-sm text-gray-600 mb-4">
              Fecha: {format(parseISO(fechaSeleccionada), 'dd/MM/yyyy', { locale: es })}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Selecciona la actividad
            </h3>
            <div>
              <div className="text-xs text-gray-500 mb-2">Selecciona la actividad</div>
              <div role="radiogroup" aria-label="Tipo de actividad" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  role="radio"
                  aria-checked={actividad === 'analisis_partido'}
                  aria-disabled={!actividadesPermitidas.includes('analisis_partido')}
                  type="button"
                  onClick={() => actividadesPermitidas.includes('analisis_partido') && setActividad('analisis_partido')}
                  disabled={!actividadesPermitidas.includes('analisis_partido')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${!actividadesPermitidas.includes('analisis_partido') ? 'opacity-40 cursor-not-allowed bg-gray-100' : actividad === 'analisis_partido' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Análisis de partido</div>
                    <div className={`text-xs ${actividad === 'analisis_partido' ? 'text-blue-100' : 'text-gray-500'}`}>Lunes - 18:00</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'analisis_partido' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'analisis_partido' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'preparacion_fisica'}
                  aria-disabled={!actividadesPermitidas.includes('preparacion_fisica')}
                  type="button"
                  onClick={() => actividadesPermitidas.includes('preparacion_fisica') && setActividad('preparacion_fisica')}
                  disabled={!actividadesPermitidas.includes('preparacion_fisica')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${!actividadesPermitidas.includes('preparacion_fisica') ? 'opacity-40 cursor-not-allowed bg-gray-100' : actividad === 'preparacion_fisica' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Preparación física</div>
                    <div className={`text-xs ${actividad === 'preparacion_fisica' ? 'text-blue-100' : 'text-gray-500'}`}>Mar, Jue, Sáb - 05:00</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'preparacion_fisica' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'preparacion_fisica' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'reunion_ordinaria'}
                  aria-disabled={!actividadesPermitidas.includes('reunion_ordinaria')}
                  type="button"
                  onClick={() => actividadesPermitidas.includes('reunion_ordinaria') && setActividad('reunion_ordinaria')}
                  disabled={!actividadesPermitidas.includes('reunion_ordinaria')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${!actividadesPermitidas.includes('reunion_ordinaria') ? 'opacity-40 cursor-not-allowed bg-gray-100' : actividad === 'reunion_ordinaria' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Reunión ordinaria</div>
                    <div className={`text-xs ${actividad === 'reunion_ordinaria' ? 'text-blue-100' : 'text-gray-500'}`}>Viernes - 19:00</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'reunion_ordinaria' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'reunion_ordinaria' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>

                <button
                  role="radio"
                  aria-checked={actividad === 'reunion_extraordinaria'}
                  aria-disabled={!actividadesPermitidas.includes('reunion_extraordinaria')}
                  type="button"
                  onClick={() => actividadesPermitidas.includes('reunion_extraordinaria') && setActividad('reunion_extraordinaria')}
                  disabled={!actividadesPermitidas.includes('reunion_extraordinaria')}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${!actividadesPermitidas.includes('reunion_extraordinaria') ? 'opacity-40 cursor-not-allowed bg-gray-100' : actividad === 'reunion_extraordinaria' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white hover:shadow-sm'}`}>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">Reunión extraordinaria</div>
                    <div className={`text-xs ${actividad === 'reunion_extraordinaria' ? 'text-blue-100' : 'text-gray-500'}`}>Mié, Dom - Urgente</div>
                  </div>
                  <div className={`ml-3 flex items-center justify-center transition-opacity duration-200 ${actividad === 'reunion_extraordinaria' ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className={`h-5 w-5 transition-transform duration-200 transform ${actividad === 'reunion_extraordinaria' ? 'scale-100 text-white' : 'scale-75 text-blue-600'}`} aria-hidden />
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Responsable</label>
              <input
                id="responsable-quick"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del responsable"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => { 
                const ahora = new Date().toISOString()
                setFechaHoraInicio(ahora)
                iniciarRegistro(actividad, responsable, fechaSeleccionada); 
                  toast({ title: 'Registro iniciado', description: `${actividad.replace('_',' ')} — ${responsable || 'Sin responsable'} - Fecha: ${format(parseISO(fechaSeleccionada), 'dd MMM yyyy', { locale: es })}` })
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {existeRegistroHoy ? "Continuar Editando" : "Iniciar Registro"}
            </button>

            <button
              onClick={() => router.push("/dashboard/asistencia/historial")}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <BarChart3 className="h-5 w-5" />
              Reportes
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center sm:text-left">Prueba con árbitros ficticios para validar la interfaz.</p>
        </div>
      </div>
    )
  }

  function handleFinalizar() {
    // si el hook implementa finalizarRegistro, se llamará desde el diálogo
    console.log("🔄 Finalizando registro con arbitros:", arbitros?.length || 0)
    console.log("📊 Registro actual:", registro)
    finalizarRegistro(arbitros)
    setOpenFinalize(false)
    toast({ title: 'Registro finalizado', description: `Se guardó el registro - ${arbitros?.length || 0} árbitros registrados` })
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
