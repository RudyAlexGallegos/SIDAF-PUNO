"use client"

import { useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock, FileCheck } from "lucide-react"

interface EstadisticasAsistenciaProps {
  asistencias: any[]
  periodo: { inicio: Date; fin: Date }
}

const COLORS = {
  presente: "#22c55e",
  ausente: "#ef4444",
  tardanza: "#eab308",
  justificado: "#3b82f6",
  primary: "#2563eb",
  secondary: "#8b5cf6"
}

export default function DashboardEstadisticasAsistencia({ asistencias, periodo }: EstadisticasAsistenciaProps) {
  
  // Calcular estadísticas por día de la semana
  const estadisticasPorDia = useMemo(() => {
    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    const datos = diasSemana.map(dia => ({
      dia,
      total: 0,
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificados: 0
    }))

    asistencias.forEach(a => {
      if (!a.fecha) return
      const fecha = new Date(a.fecha)
      const diaIndex = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1 // Convertir 0-6 (Dom-Sáb) a 0-6 (Lun-Dom)
      
      if (diaIndex >= 0 && diaIndex < 7) {
        datos[diaIndex].total++
        const estado = a.estadoItem || a.estado
        if (estado === 'presente') datos[diaIndex].presentes++
        else if (estado === 'ausente') datos[diaIndex].ausentes++
        else if (estado === 'tardanza') datos[diaIndex].tardanzas++
        else if (estado === 'justificado') datos[diaIndex].justificados++
      }
    })

    return datos
  }, [asistencias])

  // Calcular tendencia mensual
  const tendenciaMensual = useMemo(() => {
    const datosPorMes: Record<string, { total: number; presentes: number }> = {}
    
    asistencias.forEach(a => {
      if (!a.fecha) return
      const fecha = new Date(a.fecha)
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      
      if (!datosPorMes[mesKey]) {
        datosPorMes[mesKey] = { total: 0, presentes: 0 }
      }
      
      datosPorMes[mesKey].total++
      const estado = a.estadoItem || a.estado
      if (estado === 'presente' || estado === 'justificado') {
        datosPorMes[mesKey].presentes++
      }
    })

    return Object.entries(datosPorMes)
      .map(([mes, datos]) => ({
        mes,
        ...datos,
        porcentaje: datos.total > 0 ? Math.round((datos.presentes / datos.total) * 100) : 0
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
  }, [asistencias])

  // Calcular KPIs generales
  const kpis = useMemo(() => {
    const total = asistencias.length
    const presentes = asistencias.filter(a => (a.estadoItem || a.estado) === 'presente').length
    const ausentes = asistencias.filter(a => (a.estadoItem || a.estado) === 'ausente').length
    const tardanzas = asistencias.filter(a => (a.estadoItem || a.estado) === 'tardanza').length
    const justificados = asistencias.filter(a => (a.estadoItem || a.estado) === 'justificado').length
    const porcentaje = total > 0 ? Math.round(((presentes + justificados) / total) * 100) : 0

    return { total, presentes, ausentes, tardanzas, justificados, porcentaje }
  }, [asistencias])

  // Datos para gráfico de pastel (distribución de estados)
  const datosPie = useMemo(() => {
    return [
      { name: 'Presentes', value: kpis.presentes, color: COLORS.presente },
      { name: 'Ausentes', value: kpis.ausentes, color: COLORS.ausente },
      { name: 'Tardanzas', value: kpis.tardanzas, color: COLORS.tardanza },
      { name: 'Justificados', value: kpis.justificados, color: COLORS.justificado }
    ].filter(d => d.value > 0)
  }, [kpis])

  return (
    <div className="space-y-6">
      {/* KPIs - Tarjetas de métricas clave */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-blue-700">{kpis.total}</p>
            <p className="text-sm text-blue-600 font-medium">Total Registros</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold text-green-700">{kpis.presentes}</p>
            <p className="text-sm text-green-600 font-medium">Presentes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-4 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-3xl font-bold text-red-700">{kpis.ausentes}</p>
            <p className="text-sm text-red-600 font-medium">Ausentes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-3xl font-bold text-yellow-700">{kpis.tardanzas}</p>
            <p className="text-sm text-yellow-600 font-medium">Tardanzas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4 text-center">
            <FileCheck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-blue-700">{kpis.justificados}</p>
            <p className="text-sm text-blue-600 font-medium">Justificados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className={`text-3xl font-bold ${
              kpis.porcentaje >= 80 ? 'text-green-700' : 
              kpis.porcentaje >= 60 ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {kpis.porcentaje}%
            </p>
            <p className="text-sm text-purple-600 font-medium">% Asistencia</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Asistencia por día de la semana */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Asistencia por Día de la Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dia" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="presentes" name="Presentes" fill={COLORS.presente} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ausentes" name="Ausentes" fill={COLORS.ausente} radius={[4, 4, 0, 0]} />
                <Bar dataKey="tardanzas" name="Tardanzas" fill={COLORS.tardanza} radius={[4, 4, 0, 0]} />
                <Bar dataKey="justificados" name="Justificados" fill={COLORS.justificado} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de líneas - Tendencia mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Tendencia de Asistencia Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendenciaMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-')
                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                    return `${meses[parseInt(month) - 1]} ${year.slice(2)}`
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => [`${value}%`, 'Asistencia']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="porcentaje" 
                  name="% Asistencia" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de pastel - Distribución de estados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-600" />
            Distribución de Estados de Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Información del período */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Calendar className="w-5 h-5" />
            <p className="text-sm">
              Período analizado: <span className="font-semibold">
                {periodo.inicio.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span> a <span className="font-semibold">
                {periodo.fin.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
