"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, FileText, Calendar, Users, Trophy, Settings } from "lucide-react"
import { getArbitros, getAsistencias, getDesignaciones, getCampeonatos, type Arbitro, type Asistencia, type Designacion, type Campeonato } from "@/services/api"
import { generateAsistenciaPDF, generateDesignacionesPDF, exportDataAsJSON } from "@/lib/pdf-generator"
import { toast } from "@/hooks/use-toast"

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

  useEffect(() => {
    async function loadData() {
      try {
        const [arbData, asisData, desigData, campData] = await Promise.all([
          getArbitros(),
          getAsistencias(),
          getDesignaciones(),
          getCampeonato()
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
    const haceUnMes = new Date()
    haceUnMes.setMonth(haceUnMes.getMonth() - 1)

    setFechaFin(hoy.toISOString().split("T")[0])
    setFechaInicio(haceUnMes.toISOString().split("T")[0])
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
          const fecha = new Date(a.fecha)
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

        generateAsistenciaPDF(asistenciasFiltradas, arbitros, inicio, fin)

        toast({
          title: "✅ Reporte generado",
          description: `Reporte de asistencia con ${asistenciasFiltradas.length} registros`,
        })
      } else if (tipoReporte === "designaciones") {
        const designacionesFiltradas = designaciones.filter((d) => {
          const fecha = new Date(d.fecha)
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

  const handleExportData = () => {
    try {
      const data = exportData()
      exportDataAsJSON(JSON.parse(data), `backup-sistema-arbitros-${new Date().toISOString().split("T")[0]}.json`)

      toast({
        title: "✅ Datos exportados",
        description: "Backup completo del sistema descargado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  const handleExtendData = (days: number) => {
    extendDataExpiration(days)
    toast({
      title: "✅ Datos extendidos",
      description: `Los datos se mantendrán por ${days} días más`,
    })
  }

  // Calcular estadísticas para mostrar
  const totalAsistencias = asistencias.length
  const totalDesignaciones = designaciones.length
  const asistenciasUltimaSemana = asistencias.filter((a) => {
    const fecha = new Date(a.fecha)
    const haceUnaSemana = new Date()
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7)
    return fecha >= haceUnaSemana
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">Volver</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reportes y Exportación</h1>
              <p className="text-sm sm:text-base text-gray-600">Generar reportes PDF y gestionar datos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Estadísticas rápidas */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8">
          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalAsistencias}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Total Asistencias</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{totalDesignaciones}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Total Designaciones</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="text-center p-4 sm:p-6">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{asistenciasUltimaSemana}</div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Esta Semana</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Generador de Reportes */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center space-x-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <span>Generar Reporte PDF</span>
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Crear reportes detallados de asistencia y designaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tipo-reporte" className="text-base sm:text-lg font-semibold text-gray-700">
                  Tipo de Reporte
                </Label>
                <Select value={tipoReporte} onValueChange={setTipoReporte}>
                  <SelectTrigger className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-purple-500">
                    <SelectValue placeholder="Seleccionar tipo de reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asistencia" className="text-base sm:text-lg py-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Reporte de Asistencia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="designaciones" className="text-base sm:text-lg py-3">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-purple-600" />
                        <span>Reporte de Designaciones</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fecha-inicio" className="text-base sm:text-lg font-semibold text-gray-700">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-purple-500"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="fecha-fin" className="text-base sm:text-lg font-semibold text-gray-700">
                    Fecha Fin
                  </Label>
                  <Input
                    id="fecha-fin"
                    type="date"
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-purple-500"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 shadow-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Generando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Generar Reporte PDF</span>
                  </div>
                )}
              </Button>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">💡 Información del Reporte</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>
                    • <strong>Asistencia:</strong> Incluye estadísticas, registro detallado y resumen por árbitro
                  </li>
                  <li>
                    • <strong>Designaciones:</strong> Incluye partidos, árbitros asignados y calificaciones
                  </li>
                  <li>• Los reportes se abren en una nueva ventana para imprimir o guardar como PDF</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Datos */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center space-x-2">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <span>Gestión de Datos</span>
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Exportar, importar y gestionar la persistencia de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exportar datos */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">📤 Exportar Datos</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Descarga un backup completo de todos los datos del sistema en formato JSON
                </p>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Descargar Backup Completo
                </Button>
              </div>

              {/* Extender persistencia */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">⏰ Extender Persistencia</h4>
                <p className="text-sm text-gray-600 mb-4">Mantén los datos guardados por más tiempo</p>
                <div className="grid gap-3">
                  <Button
                    onClick={() => handleExtendData(7)}
                    variant="outline"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Extender 1 Semana
                  </Button>
                  <Button
                    onClick={() => handleExtendData(30)}
                    variant="outline"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Extender 1 Mes
                  </Button>
                  <Button
                    onClick={() => handleExtendData(90)}
                    variant="outline"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Extender 3 Meses
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información de Persistencia</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los datos se guardan automáticamente en el navegador</li>
                  <li>• Por defecto se mantienen por 30 días</li>
                  <li>• Puedes extender este tiempo cuando necesites</li>
                  <li>• Haz backups regulares para mayor seguridad</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceso rápido a reportes predefinidos */}
        <Card className="bg-white shadow-md mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-gray-900">🚀 Reportes Rápidos</CardTitle>
            <CardDescription className="text-base sm:text-lg">Genera reportes comunes con un solo clic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={() => {
                  const hoy = new Date()
                  const haceUnaSemana = new Date()
                  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7)

                  const asistenciasUltimaSemana = asistencias.filter((a) => {
                    const fecha = new Date(a.fecha)
                    return fecha >= haceUnaSemana && fecha <= hoy
                  })

                  if (asistenciasUltimaSemana.length > 0) {
                    generateAsistenciaPDF(asistenciasUltimaSemana, arbitros, haceUnaSemana, hoy)
                    toast({
                      title: "✅ Reporte generado",
                      description: "Asistencia de la última semana",
                    })
                  } else {
                    toast({
                      title: "Sin datos",
                      description: "No hay asistencias en la última semana",
                      variant: "destructive",
                    })
                  }
                }}
                variant="outline"
                className="h-16 sm:h-20 text-base sm:text-lg border-2 border-green-600 text-green-600 hover:bg-green-50"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Asistencia Última Semana</span>
                </div>
              </Button>

              <Button
                onClick={() => {
                  const hoy = new Date()
                  const haceUnMes = new Date()
                  haceUnMes.setMonth(haceUnMes.getMonth() - 1)

                  const asistenciasUltimoMes = asistencias.filter((a) => {
                    const fecha = new Date(a.fecha)
                    return fecha >= haceUnMes && fecha <= hoy
                  })

                  if (asistenciasUltimoMes.length > 0) {
                    generateAsistenciaPDF(asistenciasUltimoMes, arbitros, haceUnMes, hoy)
                    toast({
                      title: "✅ Reporte generado",
                      description: "Asistencia del último mes",
                    })
                  } else {
                    toast({
                      title: "Sin datos",
                      description: "No hay asistencias en el último mes",
                      variant: "destructive",
                    })
                  }
                }}
                variant="outline"
                className="h-16 sm:h-20 text-base sm:text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Asistencia Último Mes</span>
                </div>
              </Button>

              <Button
                onClick={() => {
                  const hoy = new Date()
                  const haceUnMes = new Date()
                  haceUnMes.setMonth(haceUnMes.getMonth() - 1)

                  const designacionesUltimoMes = designaciones.filter((d) => {
                    const fecha = new Date(d.fecha)
                    return fecha >= haceUnMes && fecha <= hoy
                  })

                  if (designacionesUltimoMes.length > 0) {
                    generateDesignacionesPDF(designacionesUltimoMes, arbitros, campeonatos, haceUnMes, hoy)
                    toast({
                      title: "✅ Reporte generado",
                      description: "Designaciones del último mes",
                    })
                  } else {
                    toast({
                      title: "Sin datos",
                      description: "No hay designaciones en el último mes",
                      variant: "destructive",
                    })
                  }
                }}
                variant="outline"
                className="h-16 sm:h-20 text-base sm:text-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Designaciones Último Mes</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
