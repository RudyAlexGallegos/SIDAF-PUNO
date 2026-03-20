"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  Users, 
  Trophy, 
  BarChart3,
  TrendingUp,
  FileDown,
  Activity
} from "lucide-react"
import { 
  getArbitros, 
  getAsistencias, 
  getDesignaciones, 
  getCampeonatos, 
  type Arbitro, 
  type Asistencia, 
  type Designacion, 
  type Campeonato 
} from "@/services/api"
import { 
  generateAsistenciaPDF, 
  generateDesignacionesPDF, 
  exportDataAsJSON,
  generateReporteResumenEjecutivo,
  generateReporteMensual,
  generateReporteFaltantes,
  exportAsistenciaToExcel
} from "@/lib/pdf-generator"
import { toast } from "@/hooks/use-toast"
import { DashboardEstadisticasAvanzadas } from "@/components/dashboard-estadisticas-avanzadas"
import { format, subDays, subMonths } from "date-fns"
import { es } from "date-fns/locale"

export default function ReportesPage() {
  const [arbitros, setArbitros] = useState<Arbitro[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [designaciones, setDesignaciones] = useState<Designacion[]>([])
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([])
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoReporte, setTipoReporte] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    async function loadData() {
      try {
        const [arbData, asisData, desigData, campData] = await Promise.all([
          getArbitros(),
          getAsistencias(),
          getDesignaciones(),
          getCampeonatos()
        ])
        setArbitros(arbData)
        setAsistencias(asisData)
        setDesignaciones(desigData)
        setCampeonatos(campData)
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    // Establecer fechas por defecto (último mes)
    const hoy = new Date()
    const haceUnMes = subMonths(hoy, 1)

    setFechaFin(format(hoy, "yyyy-MM-dd"))
    setFechaInicio(format(haceUnMes, "yyyy-MM-dd"))
  }, [])

  const handleGenerateReport = async () => {
    if (!tipoReporte) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de reporte",
        variant: "destructive",
      })
      return
    }

    if (!fechaInicio || !fechaFin) {
      toast({
        title: "Error",
        description: "Selecciona las fechas de inicio y fin",
        variant: "destructive",
      })
      return
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio > fin) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha de fin",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      if (tipoReporte === "asistencia") {
        const asistenciasFiltradas = asistencias.filter((a) => {
          const fecha = new Date(a.fecha || "")
          return fecha >= inicio && fecha <= fin
        })

        if (asistenciasFiltradas.length === 0) {
          toast({
            title: "Sin datos",
            description: "No hay registros de asistencia en el período seleccionado",
            variant: "destructive",
          })
          return
        }

        generateReporteResumenEjecutivo(asistenciasFiltradas as any, arbitros as any, inicio, fin)

        toast({
          title: "✅ Reporte generado",
          description: `Reporte de asistencia con ${asistenciasFiltradas.length} registros`,
        })
      } else if (tipoReporte === "asistencia_mensual") {
        const year = inicio.getFullYear()
        const month = inicio.getMonth() + 1
        const asistenciasFiltradas = asistencias.filter((a) => {
          const fecha = new Date(a.fecha || "")
          return fecha >= inicio && fecha <= fin
        })
        generateReporteMensual(asistenciasFiltradas as any, arbitros as any, year, month)
        toast({
          title: "✅ Reporte mensual generado",
          description: `Reporte mensual de ${format(inicio, "MMMM yyyy", { locale: es })}`,
        })
      } else if (tipoReporte === "dias_faltantes") {
        const asistenciasFiltradas = asistencias.filter((a) => {
          const fecha = new Date(a.fecha || "")
          return fecha >= inicio && fecha <= fin
        })
        generateReporteFaltantes(asistenciasFiltradas as any, arbitros as any, inicio, fin)
        toast({
          title: "✅ Reporte de faltantes generado",
          description: "Reporte de días sin registro descargado",
        })
      } else if (tipoReporte === "excel") {
        const asistenciasFiltradas = asistencias.filter((a) => {
          const fecha = new Date(a.fecha || "")
          return fecha >= inicio && fecha <= fin
        })
        exportAsistenciaToExcel(
          asistenciasFiltradas as any, 
          arbitros as any, 
          `asistencia-${format(inicio, "yyyy-MM-dd")}-${format(fin, "yyyy-MM-dd")}.csv`
        )
        toast({
          title: "✅ Excel exportado",
          description: `${asistenciasFiltradas.length} registros exportados`,
        })
      } else if (tipoReporte === "designaciones") {
        const designacionesFiltradas = designaciones.filter((d) => {
          const fecha = new Date(d.fecha || "")
          return fecha >= inicio && fecha <= fin
        })

        if (designacionesFiltradas.length === 0) {
          toast({
            title: "Sin datos",
            description: "No hay designaciones en el período seleccionado",
            variant: "destructive",
          })
          return
        }

        generateDesignacionesPDF(designacionesFiltradas, arbitros, campeonatos, inicio, fin)

        toast({
          title: "✅ Reporte generado",
          description: `Reporte de designaciones con ${designacionesFiltradas.length} registros`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Calcular estadísticas para mostrar
  const totalAsistencias = asistencias.length
  const totalDesignaciones = designaciones.length
  const asistenciasUltimaSemana = asistencias.filter((a) => {
    const fecha = new Date(a.fecha || "")
    const haceUnaSemana = subDays(new Date(), 7)
    return fecha >= haceUnaSemana
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-sky-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-sky-600 hover:text-sky-800 flex items-center gap-1">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <span className="text-sky-300">/</span>
              <h1 className="text-xl font-bold text-sky-800 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Reportes y Estadísticas
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sky-700 border-sky-300">
                {totalAsistencias} registros
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-100 text-sm">Total Asistencias</p>
                  <p className="text-3xl font-bold">{totalAsistencias}</p>
                </div>
                <Users className="h-10 w-10 text-sky-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Designaciones</p>
                  <p className="text-3xl font-bold text-sky-700">{totalDesignaciones}</p>
                </div>
                <Trophy className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Esta Semana</p>
                  <p className="text-3xl font-bold text-green-600">{asistenciasUltimaSemana}</p>
                </div>
                <Activity className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-sky-50 border border-sky-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="generar" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Generar Reportes
            </TabsTrigger>
            <TabsTrigger value="rapidos" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">
              <FileDown className="h-4 w-4 mr-2" />
              Reportes Rápidos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dashboard de Estadísticas */}
          <TabsContent value="dashboard">
            <DashboardEstadisticasAvanzadas />
          </TabsContent>

          {/* Tab: Generar Reportes */}
          <TabsContent value="generar">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Generador de Reportes */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sky-800 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-sky-600" />
                    Generar Reporte
                  </CardTitle>
                  <CardDescription>
                    Crea reportes detallados de asistencia y designaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label className="text-sm font-semibold text-sky-700">
                      Tipo de Reporte
                    </Label>
                    <Select value={tipoReporte} onValueChange={setTipoReporte}>
                      <SelectTrigger className="mt-2 border-sky-300 focus:border-sky-500">
                        <SelectValue placeholder="Seleccionar tipo de reporte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asistencia">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-sky-600" />
                            <span>Resumen Ejecutivo de Asistencia (PDF)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="asistencia_mensual">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>Reporte Mensual de Asistencia (PDF)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dias_faltantes">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-orange-600" />
                            <span>Días Sin Registro (PDF)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileDown className="h-4 w-4 text-green-600" />
                            <span>Exportar a Excel/CSV</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="designaciones">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-purple-600" />
                            <span>Reporte de Designaciones (PDF)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-semibold text-sky-700">
                        Fecha Inicio
                      </Label>
                      <Input
                        type="date"
                        className="mt-2 border-sky-300 focus:border-sky-500"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-sky-700">
                        Fecha Fin
                      </Label>
                      <Input
                        type="date"
                        className="mt-2 border-sky-300 focus:border-sky-500"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full bg-sky-600 hover:bg-sky-700"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Generando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Generar Reporte</span>
                      </div>
                    )}
                  </Button>

                  <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                    <h4 className="font-semibold text-sky-800 mb-2 text-sm">💡 Tipos de Reporte</h4>
                    <ul className="text-xs text-sky-700 space-y-1">
                      <li>• <strong>Resumen Ejecutivo:</strong> Estadísticas generales del período</li>
                      <li>• <strong>Mensual:</strong> Detalle completo del mes seleccionado</li>
                      <li>• <strong>Días Sin Registro:</strong> Días obligatorios sin asistencia</li>
                      <li>• <strong>Excel/CSV:</strong> Datos para análisis en hojas de cálculo</li>
                      <li>• <strong>Designaciones:</strong> Partidos y árbitros asignados</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Información del período */}
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-sky-800 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-sky-600" />
                    Resumen del Período
                  </CardTitle>
                  <CardDescription>
                    Estadísticas del período seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fechaInicio && fechaFin ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-sky-50 rounded-lg">
                        <p className="text-sm text-sky-700 font-medium">Período seleccionado:</p>
                        <p className="text-sky-800 font-bold">
                          {format(new Date(fechaInicio), "dd/MM/yyyy")} - {format(new Date(fechaFin), "dd/MM/yyyy")}
                        </p>
                      </div>
                      
                      {(() => {
                        const inicio = new Date(fechaInicio)
                        const fin = new Date(fechaFin)
                        const asistenciasFiltradas = asistencias.filter((a) => {
                          const fecha = new Date(a.fecha || "")
                          return fecha >= inicio && fecha <= fin
                        })
                        const designacionesFiltradas = designaciones.filter((d) => {
                          const fecha = new Date(d.fecha || "")
                          return fecha >= inicio && fecha <= fin
                        })
                        
                        return (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-green-700">{asistenciasFiltradas.length}</p>
                              <p className="text-xs text-green-600">Registros de Asistencia</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-purple-700">{designacionesFiltradas.length}</p>
                              <p className="text-xs text-purple-600">Designaciones</p>
                            </div>
                            <div className="p-3 bg-sky-50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-sky-700">
                                {asistenciasFiltradas.filter(a => a.estado === "presente").length}
                              </p>
                              <p className="text-xs text-sky-600">Presentes</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-center">
                              <p className="text-2xl font-bold text-red-700">
                                {asistenciasFiltradas.filter(a => a.estado === "ausente").length}
                              </p>
                              <p className="text-xs text-red-600">Ausentes</p>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Selecciona un período para ver el resumen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Reportes Rápidos */}
          <TabsContent value="rapidos">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-sky-800">🚀 Reportes Rápidos</CardTitle>
                <CardDescription>Genera reportes comunes con un solo clic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Asistencia última semana */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const haceUnaSemana = subDays(hoy, 7)
                      const asistenciasFiltradas = asistencias.filter((a) => {
                        const fecha = new Date(a.fecha || "")
                        return fecha >= haceUnaSemana && fecha <= hoy
                      })
                      if (asistenciasFiltradas.length > 0) {
                        generateReporteResumenEjecutivo(asistenciasFiltradas as any, arbitros as any, haceUnaSemana, hoy, "Asistencia - Última Semana")
                        toast({ title: "✅ Reporte generado", description: "Asistencia de la última semana" })
                      } else {
                        toast({ title: "Sin datos", description: "No hay asistencias en la última semana", variant: "destructive" })
                      }
                    }}
                    variant="outline"
                    className="h-20 border-2 border-sky-300 text-sky-700 hover:bg-sky-50 flex flex-col gap-1"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Asistencia Última Semana</span>
                  </Button>

                  {/* Asistencia último mes */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const haceUnMes = subMonths(hoy, 1)
                      const asistenciasFiltradas = asistencias.filter((a) => {
                        const fecha = new Date(a.fecha || "")
                        return fecha >= haceUnMes && fecha <= hoy
                      })
                      if (asistenciasFiltradas.length > 0) {
                        generateReporteResumenEjecutivo(asistenciasFiltradas as any, arbitros as any, haceUnMes, hoy, "Asistencia - Último Mes")
                        toast({ title: "✅ Reporte generado", description: "Asistencia del último mes" })
                      } else {
                        toast({ title: "Sin datos", description: "No hay asistencias en el último mes", variant: "destructive" })
                      }
                    }}
                    variant="outline"
                    className="h-20 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 flex flex-col gap-1"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Asistencia Último Mes</span>
                  </Button>

                  {/* Días faltantes */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const inicio = new Date("2026-01-01")
                      generateReporteFaltantes(asistencias as any, arbitros as any, inicio, hoy)
                      toast({ title: "✅ Reporte generado", description: "Días sin registro desde 2026" })
                    }}
                    variant="outline"
                    className="h-20 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 flex flex-col gap-1"
                  >
                    <Activity className="h-5 w-5" />
                    <span className="text-sm">Días Sin Registro (2026)</span>
                  </Button>

                  {/* Excel último mes */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const haceUnMes = subMonths(hoy, 1)
                      const asistenciasFiltradas = asistencias.filter((a) => {
                        const fecha = new Date(a.fecha || "")
                        return fecha >= haceUnMes && fecha <= hoy
                      })
                      exportAsistenciaToExcel(
                        asistenciasFiltradas as any, 
                        arbitros as any, 
                        `asistencia-${format(hoy, "yyyy-MM")}.csv`
                      )
                      toast({ title: "✅ Excel exportado", description: `${asistenciasFiltradas.length} registros` })
                    }}
                    variant="outline"
                    className="h-20 border-2 border-green-300 text-green-700 hover:bg-green-50 flex flex-col gap-1"
                  >
                    <FileDown className="h-5 w-5" />
                    <span className="text-sm">Excel Último Mes</span>
                  </Button>

                  {/* Designaciones último mes */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const haceUnMes = subMonths(hoy, 1)
                      const designacionesFiltradas = designaciones.filter((d) => {
                        const fecha = new Date(d.fecha || "")
                        return fecha >= haceUnMes && fecha <= hoy
                      })
                      if (designacionesFiltradas.length > 0) {
                        generateDesignacionesPDF(designacionesFiltradas, arbitros, campeonatos, haceUnMes, hoy)
                        toast({ title: "✅ Reporte generado", description: "Designaciones del último mes" })
                      } else {
                        toast({ title: "Sin datos", description: "No hay designaciones en el último mes", variant: "destructive" })
                      }
                    }}
                    variant="outline"
                    className="h-20 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 flex flex-col gap-1"
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm">Designaciones Último Mes</span>
                  </Button>

                  {/* Reporte mensual actual */}
                  <Button
                    onClick={() => {
                      const hoy = new Date()
                      const year = hoy.getFullYear()
                      const month = hoy.getMonth() + 1
                      const inicio = new Date(year, month - 1, 1)
                      const fin = new Date(year, month, 0)
                      const asistenciasFiltradas = asistencias.filter((a) => {
                        const fecha = new Date(a.fecha || "")
                        return fecha >= inicio && fecha <= fin
                      })
                      generateReporteMensual(asistenciasFiltradas as any, arbitros as any, year, month)
                      toast({ title: "✅ Reporte mensual generado", description: format(hoy, "MMMM yyyy", { locale: es }) })
                    }}
                    variant="outline"
                    className="h-20 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 flex flex-col gap-1"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Reporte Mes Actual</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
