# 📋 Propuesta: Mejora del Módulo de Asistencia SIDAF-PUNO

**Fecha:** 10 de marzo de 2025  
**Objetivo:** Implementar registro obligatorio de asistencia con días específicos, sistema de tolerancia/retraso y dashboard interactivo elegante.

---

## 🎯 Requisitos del Usuario

1. **Días obligatorios de asistencia:** Lunes, Martes, Jueves, Viernes, Sábado
2. **Facilidades para retraso:** Permitir registrar asistencia con retraso (al día siguiente o después)
3. **Reportes/Rankings:** Trabajar únicamente con esos días para dashboard interactivo
4. **Interfaz elegante y profesional**

---

## 📊 Análisis del Estado Actual

### **Frontend**
- ✅ `app/(dashboard)/dashboard/asistencia/page.tsx` - Registro en tiempo real
- ✅ `app/(dashboard)/dashboard/asistencia/historial/page.tsx` - Historial con filtros
- ✅ `components/asistencia/RegistroCompactoArbitro.tsx` - Componente de registro por árbitro
- ✅ `hooks/asistencia/useRegistroAsistencia.ts` - Hook con localStorage
- ✅ Tipos TypeScript en `types/asistencia.ts`

### **Backend**
- ✅ `AsistenciaController.java` - CRUD + reportes estadísticos
- ✅ `Asistencia.java` - Modelo JPA
- ✅ Endpoints: `/api/asistencias`, reportes semanal/mensual/anual

### **Problemas Identificados**
1. ❌ No hay validación de días obligatorios vs. opcionales
2. ❌ No existe concepto de "tolerancia" para retrasos en registro
3. ❌ Reportes incluyen todos los días (no filtran por días obligatorios)
4. ❌ Dashboard básico sin gráficos interactivos
5. ❌ No hay alertas ni recordatorios de días pendientes

---

## 🏗️ Arquitectura Propuesta

### **1. Modelo de Datos (Backend)**

#### **Nuevos Campos en `Asistencia.java`:**

```java
@Entity
@Table(name = "asistencia")
public class Asistencia {

    // ... campos existentes ...

    // NUEVO: Tipo de día (obligatorio u opcional)
    @Column(name = "tipo_dia")
    private String tipoDia; // "OBLIGATORIO" | "OPCIONAL" | "DESCANSO"

    // NUEVO: Indicador de retraso
    @Column(name = "tiene_retraso")
    private Boolean tieneRetraso = false;

    // NUEVO: Minutos de retraso
    @Column(name = "minutos_retraso")
    private Integer minutosRetraso = 0;

    // NUEVO: Fecha límite para registro obligatorio
    @Column(name = "fecha_limite_registro")
    private LocalDate fechaLimiteRegistro;

    // NUEVO: Hora programada de la actividad
    @Column(name = "hora_programada")
    private LocalTime horaProgramada;

    // NUEVO: Día de la semana (para filtros rápidos)
    @Column(name = "dia_semana")
    private Integer diaSemana; // 1=Lunes, 2=Martes, ..., 7=Domingo
}
```

**Justificación:**
- `tipoDia`: Permite clasificar días (lun-mar-jue-vie-sáb = OBLIGATORIO, miércoles-domingo = OPCIONAL/DESCANSO)
- `tieneRetraso` + `minutosRetraso`: Tracking detallado de puntualidad
- `fechaLimiteRegistro`: Para permitir registro con retraso (ej: hasta 24h después)
- `horaProgramada`: Comparar con hora real para calcular retraso
- `diaSemana`: Optimiza consultas por día específico

---

### **2. Lógica de Negocio (Backend)**

#### **Nuevo Servicio: `AsistenciaService.java`**

```java
@Service
public class AsistenciaService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    // Días obligatorios de asistencia
    private static final Set<Integer> DIAS_OBLIGATORIOS = Set.of(
        1, // Lunes
        2, // Martes
        4, // Jueves
        5, // Viernes
        6  // Sábado
    );

    /**
     * Calcula si un día es obligatorio
     */
    public boolean esDiaObligatorio(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        return DIAS_OBLIGATORIOS.contains(dia.getValue());
    }

    /**
     * Calcula el retraso en minutos
     */
    public int calcularRetraso(LocalTime horaProgramada, LocalTime horaReal) {
        if (horaProgramada == null || horaReal == null) return 0;
        return (int) ChronoUnit.MINUTES.between(horaProgramada, horaReal);
    }

    /**
     * Verifica si un registro está dentro del período de tolerancia
     */
    public boolean estaEnTolerancia(LocalDate fechaRegistro, LocalDate fechaLimite) {
        return !fechaRegistro.isAfter(fechaLimite);
    }

    /**
     * Obtiene estadísticas de asistencia por día de la semana
     */
    public Map<String, Object> getEstadisticasPorDia(LocalDate inicio, LocalDate fin) {
        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(inicio, fin);

        Map<Integer, EstadisticaDia> stats = new HashMap<>();
        for (int dia = 1; dia <= 7; dia++) {
            stats.put(dia, new EstadisticaDia());
        }

        for (Asistencia a : asistencias) {
            int diaSemana = a.getFecha().getDayOfWeek().getValue();
            EstadisticaDia stat = stats.get(diaSemana);

            if ("presente".equals(a.getEstado())) stat.presentes++;
            else if ("ausente".equals(a.getEstado())) stat.ausentes++;
            else if ("tardanza".equals(a.getEstado())) stat.tardanzas++;

            stat.total++;
        }

        return Map.of(
            "periodo", Map.of("inicio", inicio, "fin", fin),
            "porDia", stats
        );
    }

    // Clase auxiliar para estadísticas
    private static class EstadisticaDia {
        int total = 0;
        int presentes = 0;
        int ausentes = 0;
        int tardanzas = 0;

        double getPorcentajeAsistencia() {
            return total > 0 ? (double) presentes / total * 100 : 0;
        }
    }
}
```

---

### **3. Endpoints Nuevos (Backend)**

```java
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaService asistenciaService;

    /**
     * GET /api/asistencias/dias-obligatorios?fecha=2025-03-10
     * Devuelve qué árbitros NO han registrado asistencia en un día obligatorio
     */
    @GetMapping("/dias-obligatorios/pendientes")
    public Map<String, Object> getPendientesDiasObligatorios(
            @RequestParam String fecha) {
        LocalDate fechaParam = LocalDate.parse(fecha);
        List<Arbitro> arbitros = arbitroRepository.findAll();
        List<Asistencia> asistenciasDelDia = asistenciaRepository.findByFecha(fechaParam);

        Set<Long> arbitrosConAsistencia = asistenciasDelDia.stream()
            .map(a -> a.getArbitroId())
            .collect(Collectors.toSet());

        List<Arbitro> pendientes = arbitros.stream()
            .filter(a -> !arbitrosConAsistencia.contains(a.getId()))
            .collect(Collectors.toList());

        return Map.of(
            "fecha", fechaParam,
            "esDiaObligatorio", asistenciaService.esDiaObligatorio(fechaParam),
            "totalPendientes", pendientes.size(),
            "pendientes", pendientes
        );
    }

    /**
     * GET /api/asistencias/estadisticas/dias-semana
     * Estadísticas agrupadas por día de la semana
     */
    @GetMapping("/estadisticas/dias-semana")
    public Map<String, Object> getEstadisticasPorDiaSemana(
            @RequestParam String inicio,
            @RequestParam String fin) {
        LocalDate fechaInicio = LocalDate.parse(inicio);
        LocalDate fechaFin = LocalDate.parse(fin);
        return asistenciaService.getEstadisticasPorDia(fechaInicio, fechaFin);
    }

    /**
     * POST /api/asistencias/registro-con-retraso
     * Permite registrar asistencia con fecha anterior (tolerancia)
     */
    @PostMapping("/registro-con-retraso")
    public ResponseEntity<Asistencia> registrarConRetraso(
            @RequestBody RegistroConRetrasoRequest request) {

        // Validar que la fecha de registro no sea muy antigua (ej: máximo 7 días)
        LocalDate hoy = LocalDate.now();
        if (request.getFechaRegistro().isBefore(hoy.minusDays(7))) {
            return ResponseEntity.badRequest()
                .body(null); // o lanzar excepción
        }

        // Calcular retraso si hay hora programada
        if (request.getHoraProgramada() != null) {
            int retraso = asistenciaService.calcularRetraso(
                request.getHoraProgramada(),
                request.getHoraEntrada()
            );
            request.setTieneRetraso(retraso > 0);
            request.setMinutosRetraso(Math.max(0, retraso));
        }

        Asistencia asistencia = new Asistencia();
        // ... mapear campos ...
        return ResponseEntity.ok(asistenciaRepository.save(asistencia));
    }

    // DTO para request con retraso
    public static class RegistroConRetrasoRequest {
        private Long arbitroId;
        private LocalDate fecha;
        private LocalDateTime horaEntrada;
        private LocalTime horaProgramada;
        private String actividad;
        // ... otros campos
        // getters y setters
    }
}
```

---

### **4. Frontend - Mejoras de UI/UX**

#### **A. Dashboard de Asistencia Interactivo**

**Nuevo archivo:** `frontend/app/(dashboard)/dashboard/asistencia/dashboard/page.tsx`

```tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users
} from "lucide-react"
import { getAsistencias, getArbitros, getEstadisticasDiasSemana } from "@/services/api"

export default function AsistenciaDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [diasSemanaData, setDiasSemanaData] = useState<any[]>([])
  const [pendientesHoy, setPendientesHoy] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const [asistencias, arbitros, statsDias] = await Promise.all([
        getAsistencias(),
        getArbitros(),
        getEstadisticasDiasSemana(
          new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], // 30 días atrás
          hoy
        )
      ])

      // Calcular estadísticas generales
      const totalRegistros = asistencias.length
      const presentes = asistencias.filter(a => a.estado === 'presente').length
      const ausentes = asistencias.filter(a => a.estado === 'ausente').length
      const tardanzas = asistencias.filter(a => a.estado === 'tardanza').length
      const porcentajeAsistencia = totalRegistros > 0 ? (presentes / totalRegistros * 100) : 0

      setStats({
        totalRegistros,
        presentes,
        ausentes,
        tardanzas,
        porcentajeAsistencia: Math.round(porcentajeAsistencia * 10) / 10,
        totalArbitros: arbitros.length
      })

      // Procesar datos para gráficos
      const diasMap: Record<string, any> = {
        'Lunes': { total: 0, presentes: 0 },
        'Martes': { total: 0, presentes: 0 },
        'Miércoles': { total: 0, presentes: 0 },
        'Jueves': { total: 0, presentes: 0 },
        'Viernes': { total: 0, presentes: 0 },
        'Sábado': { total: 0, presentes: 0 },
        'Domingo': { total: 0, presentes: 0 }
      }

      asistencias.forEach(a => {
        const fecha = new Date(a.fecha!)
        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' })
        if (diasMap[diaSemana]) {
          diasMap[diaSemana].total++
          if (a.estado === 'presente') diasMap[diaSemana].presentes++
        }
      })

      setDiasSemanaData(
        Object.entries(diasMap).map(([dia, data]) => ({
          dia,
          total: data.total,
          presentes: data.presentes,
          porcentaje: data.total > 0 ? Math.round(data.presentes / data.total * 100) : 0
        }))
      )

      // Obtener pendientes de hoy (si es día obligatorio)
      const diaHoy = new Date().getDay() // 0=Dom, 1=Lun, ..., 6=Sáb
      const diasObligatorios = [1, 2, 4, 5, 6] // Lun, Mar, Jue, Vie, Sáb
      if (diasObligatorios.includes(diaHoy)) {
        const response = await fetch(`${API_BASE_URL}/asistencias/dias-obligatorios/pendientes?fecha=${hoy}`)
        if (response.ok) {
          const data = await response.json()
          setPendientesHoy(data.pendientes || [])
        }
      }

    } catch (error) {
      console.error("Error cargando dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Cargando dashboard...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Asistencia</h1>
          <p className="text-slate-500 mt-1">
            Monitoreo en tiempo real de asistencia de árbitros
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/asistencia">
            <Calendar className="h-4 w-4 mr-2" />
            Registrar Asistencia
          </Link>
        </Button>
      </div>

      {/* Alertas de Pendientes */}
      {pendientesHoy.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Pendientes de Hoy ({new Date().toLocaleDateString('es-ES', { weekday: 'long' })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-3">
              {pendientesHoy.length} árbitro(s) aún no han registrado su asistencia hoy.
            </p>
            <div className="flex flex-wrap gap-2">
              {pendientesHoy.map((arb: any) => (
                <Badge key={arb.id} variant="outline" className="bg-white">
                  {arb.nombres} {arb.apellidoPaterno}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Registros</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.totalRegistros || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Presentes</p>
                <p className="text-3xl font-bold text-green-900">{stats?.presentes || 0}</p>
                <p className="text-xs text-green-600">
                  {stats?.totalRegistros ? Math.round(stats.presentes / stats.totalRegistros * 100) : 0}% del total
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Ausentes</p>
                <p className="text-3xl font-bold text-red-900">{stats?.ausentes || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Tardanzas</p>
                <p className="text-3xl font-bold text-yellow-900">{stats?.tardanzas || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras por Día */}
        <Card>
          <CardHeader>
            <CardTitle>Asistencia por Día de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diasSemanaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="presentes" fill="#22c55e" name="Presentes" />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Torta - Porcentaje de Asistencia */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Presentes', value: stats?.presentes || 0, color: '#22c55e' },
                    { name: 'Ausentes', value: stats?.ausentes || 0, color: '#ef4444' },
                    { name: 'Tardanzas', value: stats?.tardanzas || 0, color: '#eab308' }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {diasSemanaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Asistencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking de Asistencia (Últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabla de ranking */}
          <p className="text-slate-500">Próximamente: Ranking detallado por árbitro</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### **5. Mejoras en Página de Registro**

#### **Validación de Días Obligatorios**

```tsx
// En app/(dashboard)/dashboard/asistencia/page.tsx

// 1. Detectar día actual y si es obligatorio
const esDiaObligatorio = (fecha: Date) => {
  const dia = fecha.getDay() // 0=Dom, 1=Lun, ..., 6=Sáb
  const diasObligatorios = [1, 2, 4, 5, 6] // Lun, Mar, Jue, Vie, Sáb
  return diasObligatorios.includes(dia)
}

// 2. Mostrar alerta si es día obligatorio y no hay registro activo
useEffect(() => {
  const hoy = new Date()
  if (esDiaObligatorio(hoy) && !registro) {
    toast({
      title: "Día de asistencia obligatorio",
      description: "Hoy es día de asistencia obligatoria. Por favor, registre su asistencia.",
      variant: "destructive"
    })
  }
}, [])

// 3. Permitir registro con retraso (hasta 24h después)
const [mostrarRegistroRetraso, setMostrarRegistroRetraso] = useState(false)
const [fechaRegistroRetraso, setFechaRegistroRetraso] = useState("")

// Botón para registrar con retraso
<Button
  variant="outline"
  onClick={() => setMostrarRegistroRetraso(true)}
  className="mt-4"
>
  <Clock className="h-4 w-4 mr-2" />
  Registrar con retraso (día anterior)
</Button>

// Modal para seleccionar fecha de registro retrasado
{mostrarRegistroRetraso && (
  <Dialog open={true} onOpenChange={setMostrarRegistroRetraso}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registrar Asistencia con Retraso</DialogTitle>
        <DialogDescription>
          Seleccione la fecha del día que desea registrar
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <label className="text-sm font-medium">Fecha de la actividad</label>
        <Input
          type="date"
          value={fechaRegistroRetraso}
          onChange={(e) => setFechaRegistroRetraso(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
        />
        <p className="text-xs text-slate-500 mt-2">
          Solo puede registrar asistencia de hasta 7 días atrás
        </p>
      </div>
      <DialogFooter>
        <Button onClick={() => {
          iniciarRegistroConRetraso(actividad, responsable, fechaRegistroRetraso)
          setMostrarRegistroRetraso(false)
        }}>
          Continuar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

---

### **6. Hook Mejorado: `useRegistroAsistencia.ts`**

```typescript
"use client"

import { useEffect, useState } from "react"
import { createAsistencia } from "@/services/api"
import {
  RegistroAsistencia,
  AsistenciaArbitro,
  TipoActividad,
  EstadoAsistencia,
  Arbitro
} from "@/types/asistencia"

const STORAGE_KEY = "sidaf_registro_temp"

// Días obligatorios: Lun(1), Mar(2), Jue(4), Vie(5), Sáb(6)
const DIAS_OBLIGATORIOS = [1, 2, 4, 5, 6]

export function useRegistroAsistencia() {
  const [registro, setRegistro] = useState<RegistroAsistencia | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setRegistro(JSON.parse(raw))
  }, [])

  function persist(r: RegistroAsistencia | null) {
    if (r) localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
    else localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Iniciar registro normal (fecha actual)
   */
  function iniciarRegistro(tipo: TipoActividad, responsable?: string) {
    const now = new Date()
    const newRegistro: RegistroAsistencia = {
      id: `local-${now.getTime()}`,
      fecha: now.toISOString().split("T")[0],
      horaInicio: now.toISOString(),
      horaFin: "",
      tipoActividad: tipo,
      descripcion: "",
      ubicacion: "",
      responsable: responsable || "",
      arbitros: [],
      createdAt: now.toISOString(),
      // NUEVO: metadata
      metadata: {
        esDiaObligatorio: DIAS_OBLIGATORIOS.includes(now.getDay()),
        tieneRetraso: false,
        minutosRetraso: 0
      }
    }
    setRegistro(newRegistro)
    persist(newRegistro)
  }

  /**
   * Iniciar registro con retraso (fecha anterior)
   */
  function iniciarRegistroConRetraso(
    tipo: TipoActividad,
    responsable?: string,
    fechaRetraso?: string
  ) {
    const now = new Date()
    const fecha = fechaRetraso || now.toISOString().split("T")[0]
    const fechaDate = new Date(fecha)
    const esObligatorio = DIAS_OBLIGATORIOS.includes(fechaDate.getDay())

    const newRegistro: RegistroAsistencia = {
      id: `local-${now.getTime()}`,
      fecha,
      horaInicio: now.toISOString(),
      horaFin: "",
      tipoActividad: tipo,
      descripcion: "",
      ubicacion: "",
      responsable: responsable || "",
      arbitros: [],
      createdAt: now.toISOString(),
      metadata: {
        esDiaObligatorio: esObligatorio,
        tieneRetraso: true, // Si se registra con retraso, se marca
        minutosRetraso: (int) ChronoUnit.MINUTES.between(
          LocalTime.of(18, 0), // Hora programada por defecto
          LocalTime.parse(now.toISOString().substring(11, 16))
        )
      }
    }
    setRegistro(newRegistro)
    persist(newRegistro)
  }

  /**
   * Marcar asistencia con cálculo automático de retraso
   */
  function marcarAsistencia(
    arbitroId: string,
    estado: EstadoAsistencia,
    observaciones = "",
    horaProgramada?: string // NUEVO: hora programada de la actividad
  ) {
    if (!registro) return

    const now = new Date()
    const horaActual = LocalTime.parse(
      now.toISOString().substring(11, 16)
    )

    // Calcular retraso si hay hora programada
    let tieneRetraso = false
    let minutosRetraso = 0
    if (horaProgramada && estado === 'presente') {
      const horaProg = LocalTime.parse(horaProgramada)
      minutosRetraso = (int) ChronoUnit.MINUTES.between(horaProg, horaActual)
      tieneRetraso = minutosRetraso > 15 // Tolerancia de 15 minutos
    }

    const newAsistencia: AsistenciaArbitro = {
      arbitroId,
      estado,
      horaRegistro: now.toISOString(),
      observaciones,
      metadata: {
        tieneRetraso,
        minutosRetraso,
        horaProgramada
      }
    }

    const updatedArbitros = [...registro.arbitros]
    const existingIndex = updatedArbitros.findIndex(a => a.arbitroId === arbitroId)

    if (existingIndex >= 0) {
      updatedArbitros[existingIndex] = newAsistencia
    } else {
      updatedArbitros.push(newAsistencia)
    }

    const updated = { ...registro, arbitros: updatedArbitros }
    setRegistro(updated)
    persist(updated)
  }

  async function finalizarRegistro(arbitrosList?: Arbitro[]) {
    if (!registro) return
    const now = new Date()

    // Completar con ausentes los que no fueron marcados
    let updatedArbitros = [...registro.arbitros]
    if (arbitrosList) {
      for (const a of arbitrosList) {
        if (!updatedArbitros.find(x => x.arbitroId === a.id)) {
          updatedArbitros.push({
            arbitroId: a.id,
            estado: 'ausente',
            horaRegistro: now.toISOString(),
            observaciones: 'No asistió',
            metadata: { tieneRetraso: false, minutosRetraso: 0 }
          })
        }
      }
    }

    const updated: RegistroAsistencia = {
      ...registro,
      horaFin: now.toISOString(),
      arbitros: updatedArbitros
    }

    // Enviar al backend con todos los campos
    try {
      for (const arbAsistencia of updatedArbitros) {
        await createAsistencia({
          fecha: updated.fecha,
          horaEntrada: arbAsistencia.horaRegistro,
          horaSalida: updated.horaFin,
          actividad: updated.tipoActividad,
          evento: updated.descripcion,
          estado: arbAsistencia.estado,
          observaciones: arbAsistencia.observaciones,
          // NUEVOS campos
          tipoDia: updated.metadata?.esDiaObligatorio ? "OBLIGATORIO" : "OPCIONAL",
          tieneRetraso: arbAsistencia.metadata?.tieneRetraso || false,
          minutosRetraso: arbAsistencia.metadata?.minutosRetraso || 0,
          fechaLimiteRegistro: calcularFechaLimite(updated.fecha),
          diaSemana: new Date(updated.fecha).getDay()
        })
      }
      console.log("✅ Asistencias guardadas en backend")
    } catch (e) {
      console.warn("Error guardando en backend", e)
    }

    localStorage.setItem("sidaf_registro_last", JSON.stringify(updated))
    setRegistro(null)
    persist(null)
  }

  function calcularFechaLimite(fecha: string): string {
    const fechaDate = new Date(fecha)
    const limite = new Date(fechaDate.getTime() + 24 * 60 * 60 * 1000) // +24h
    return limite.toISOString().split("T")[0]
  }

  function cancelarRegistro() {
    setRegistro(null)
    persist(null)
  }

  return {
    registro,
    iniciarRegistro,
    iniciarRegistroConRetraso,
    marcarAsistencia,
    finalizarRegistro,
    cancelarRegistro
  }
}
```

---

### **7. Reportes y Rankings**

#### **Nuevo Componente: `RankingAsistencia.tsx`**

```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star } from "lucide-react"

export default function RankingAsistencia({
  arbitros,
  asistencias,
  fechaInicio,
  fechaFin
}: {
  arbitros: Arbitro[]
  asistencias: Asistencia[]
  fechaInicio: string
  fechaFin: string
}) {
  // Calcular estadísticas por árbitro
  const ranking = arbitros.map(arb => {
    const asistenciasArb = asistencias.filter(
      a => a.idArbitro === arb.id && a.fecha >= fechaInicio && a.fecha <= fechaFin
    )

    const total = asistenciasArb.length
    const presentes = asistenciasArb.filter(a => a.estado === 'presente').length
    const tardanzas = asistenciasArr.filter(a => a.estado === 'tardanza').length
    const ausentes = asistenciasArb.filter(a => a.estado === 'ausente').length

    const puntaje = (presentes * 10) + (tardanzas * 5) // Sistema de puntos

    return {
      ...arb,
      total,
      presentes,
      tardanzas,
      ausentes,
      puntaje,
      porcentajeAsistencia: total > 0 ? (presentes / total * 100) : 0
    }
  })
  .sort((a, b) => b.puntaje - a.puntaje) // Ordenar por puntaje

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1: return <Medal className="h-5 w-5 text-slate-400" />
      case 2: return <Medal className="h-5 w-5 text-amber-600" />
      default: return <Star className="h-5 w-5 text-blue-500" />
    }
  }

  const getPorcentajeColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-green-600"
    if (porcentaje >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking de Asistencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.map((arb, index) => (
            <div
              key={arb.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getMedalIcon(index)}
                </div>
                <div>
                  <p className="font-medium">{arb.nombres} {arb.apellidoPaterno}</p>
                  <p className="text-xs text-slate-500">{arb.categoria}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium">{arb.presentes}/{arb.total}</p>
                  <p className="text-xs text-slate-500">asistencias</p>
                </div>
                <div className={`text-right font-bold ${getPorcentajeColor(arb.porcentajeAsistencia)}`}>
                  <p>{Math.round(arb.porcentajeAsistencia)}%</p>
                  <p className="text-xs text-slate-500">asistencia</p>
                </div>
                <Badge
                  className={
                    arb.porcentajeAsistencia >= 90
                      ? "bg-green-100 text-green-800"
                      : arb.porcentajeAsistencia >= 70
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {arb.tardanzas} tard. | {arb.ausentes} falt.
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### **8. Migración de Base de Datos**

#### **Nueva Migración: `backend/migrations/013_add_asistencia_enhancements.sql`**

```sql
-- Migración: Mejoras para módulo de asistencia
-- Fecha: 2025-03-10
-- Descripción: Añade campos para días obligatorios, retrasos y métricas

-- 1. Añadir columna tipo_dia
ALTER TABLE asistencia
ADD COLUMN tipo_dia VARCHAR(20) DEFAULT 'OPCIONAL'
CHECK (tipo_dia IN ('OBLIGATORIO', 'OPCIONAL', 'DESCANSO'));

-- 2. Añadir columna tiene_retraso
ALTER TABLE asistencia
ADD COLUMN tiene_retraso BOOLEAN DEFAULT FALSE;

-- 3. Añadir columna minutos_retraso
ALTER TABLE asistencia
ADD COLUMN minutos_retraso INTEGER DEFAULT 0;

-- 4. Añadir columna fecha_limite_registro
ALTER TABLE asistencia
ADD COLUMN fecha_limite_registro DATE;

-- 5. Añadir columna hora_programada
ALTER TABLE asistencia
ADD COLUMN hora_programada TIME;

-- 6. Añadir columna dia_semana (1=Lunes, 7=Domingo)
ALTER TABLE asistencia
ADD COLUMN dia_semana INTEGER
CHECK (dia_semana BETWEEN 1 AND 7);

-- 7. Índices para optimizar consultas
CREATE INDEX idx_asistencia_fecha_tipo_dia ON asistencia(fecha, tipo_dia);
CREATE INDEX idx_asistencia_dia_semana ON asistencia(dia_semana);
CREATE INDEX idx_asistencia_arbitro_fecha ON asistencia(arbitro_id, fecha);

-- 8. Trigger para auto-calcular dia_semana
CREATE OR REPLACE FUNCTION set_dia_semana()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dia_semana = EXTRACT(DOW FROM NEW.fecha) + 1; -- PostgreSQL: 0=Dom, 6=Sab → +1 para 1= Lun
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_dia_semana
BEFORE INSERT OR UPDATE ON asistencia
FOR EACH ROW EXECUTE FUNCTION set_dia_semana();

-- 9. Actualizar registros existentes (asignar dia_semana)
UPDATE asistencia SET dia_semana = EXTRACT(DOW FROM fecha) + 1;

-- 10. Comentarios
COMMENT ON COLUMN asistencia.tipo_dia IS 'Tipo de día: OBLIGATORIO (lun-mar-jue-vie-sab), OPCIONAL, DESCANSO';
COMMENT ON COLUMN asistencia.tiene_retraso IS 'Indica si el árbitro llegó con retraso respecto a la hora programada';
COMMENT ON COLUMN asistencia.minutos_retraso IS 'Cantidad de minutos de retraso';
COMMENT ON COLUMN asistencia.fecha_limite_registro IS 'Fecha límite para registrar esta asistencia (tolerancia de 24h)';
COMMENT ON COLUMN asistencia.dia_semana IS 'Día de la semana: 1=Lunes, 2=Martes, ..., 7=Domingo';
```

---

### **9. Configuración de Horarios Programados**

#### **Nuevo archivo:** `frontend/lib/horarios-asistencia.ts`

```typescript
export interface HorarioActividad {
  actividad: string
  diaSemana: number[] // [1,2,4,5,6] para lun-mar-jue-vie-sab
  horaInicio: string // "18:00"
  horaFin?: string // "20:00"
  toleranciaMinutos?: number // 15 por defecto
}

export const HORARIOS_ASISTENCIA: HorarioActividad[] = [
  {
    actividad: "analisis_partido",
    diaSemana: [1], // Lunes
    horaInicio: "18:00"
  },
  {
    actividad: "preparacion_fisica",
    diaSemana: [2, 4, 6], // Martes, Jueves, Sábado
    horaInicio: "05:00"
  },
  {
    actividad: "reunion_ordinaria",
    diaSemana: [5], // Viernes
    horaInicio: "19:00"
  }
]

export function esDiaObligatorio(fecha: Date): boolean {
  const dia = fecha.getDay() === 0 ? 7 : fecha.getDay() // Convertir: 0(Dom) → 7
  return [1, 2, 4, 5, 6].includes(dia)
}

export function getHoraProgramada(actividad: string, fecha: Date): string | null {
  const horario = HORARIOS_ASISTENCIA.find(h => h.actividad === actividad)
  if (!horario) return null

  const dia = fecha.getDay() === 0 ? 7 : fecha.getDay()
  if (!horario.diaSemana.includes(dia)) return null

  return horario.horaInicio
}

export function calcularRetraso(
  horaProgramada: string,
  horaReal: string,
  toleranciaMinutos = 15
): { tieneRetraso: boolean; minutosRetraso: number } {
  const [hProg, mProg] = horaProgramada.split(":").map(Number)
  const [hReal, mReal] = horaReal.split(":").map(Number)

  const minutosProg = hProg * 60 + mProg
  const minutosReal = hReal * 60 + mReal
  const diferencia = minutosReal - minutosProg

  return {
    tieneRetraso: diferencia > toleranciaMinutos,
    minutosRetraso: Math.max(0, diferencia)
  }
}
```

---

### **10. Dashboard Principal - Widget de Asistencia**

#### **Mejorar `app/(dashboard)/dashboard/page.tsx`**

```tsx
// Añadir widget de asistencia del día
import { AsistenciaWidget } from "@/components/asistencia/AsistenciaWidget"

// En el dashboard principal:
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Widget existente: Árbitros */}
  <Card>...</Card>

  {/* Widget existente: Campeonatos */}
  <Card>...</Card>

  {/* NUEVO: Asistencia del Día */}
  <AsistenciaWidget />
</div>
```

#### **Componente `AsistenciaWidget.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { getArbitros, getAsistencias } from "@/services/api"

export function AsistenciaWidget() {
  const [pendientes, setPendientes] = useState<number>(0)
  const [totalArbitros, setTotalArbitros] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0]
    const diaHoy = new Date().getDay()
    const diasObligatorios = [1, 2, 4, 5, 6]

    // Solo cargar si es día obligatorio
    if (diasObligatorios.includes(diaHoy)) {
      Promise.all([getArbitros(), getAsistencias()]).then(
        ([arbitrosData, asistenciasData]) => {
          setTotalArbitros(arbitrosData.length)

          const asistenciasHoy = asistenciasData.filter(
            a => a.fecha === hoy
          )

          const arbitrosConAsistencia = new Set(
            asistenciasHoy.map(a => a.idArbitro)
          )

          const pendientesCount = arbitrosData.filter(
            arb => !arbitrosConAsistencia.has(arb.id)
          ).length

          setPendientes(pendientesCount)
          setLoading(false)
        }
      )
    } else {
      setLoading(false) // No es día obligatorio, no mostrar pendientes
    }
  }, [])

  const esDiaObligatorio = () => {
    const dia = new Date().getDay()
    return [1, 2, 4, 5, 6].includes(dia)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">Cargando...</CardContent>
      </Card>
    )
  }

  if (!esDiaObligatorio()) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-5 w-5" />
            Asistencia Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Hoy no es día de asistencia obligatoria
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Users className="h-5 w-5" />
          Asistencia Hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendientes > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{pendientes} pendientes</span>
            </div>
            <p className="text-sm text-blue-700">
              {totalArbitros - pendientes} de {totalArbitros} ya registraron
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/asistencia">
                <CheckCircle className="h-4 w-4 mr-2" />
                Registrar Asistencia
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">¡Todos registrados!</span>
            </div>
            <p className="text-sm text-blue-700">
              {totalArbitros} árbitros han registrado su asistencia
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 📋 Plan de Implementación

### **Fase 1: Backend (2-3 días)**

1. **Actualizar modelo `Asistencia.java`** (30 min)
   - Añadir 6 nuevos campos
   - Generar getters/setters
   - Crear migración SQL

2. **Crear `AsistenciaService.java`** (2 horas)
   - Lógica de días obligatorios
   - Cálculo de retrasos
   - Estadísticas por día

3. **Extender `AsistenciaController.java`** (1.5 horas)
   - Nuevos endpoints: `/dias-obligatorios/pendientes`, `/estadisticas/dias-semana`
   - Modificar endpoint POST para incluir nuevos campos
   - Actualizar reportes para filtrar por día obligatorio

4. **Crear migración `013_add_asistencia_enhancements.sql`** (30 min)
   - Ejecutar en base de datos

5. **Probar endpoints con Postman** (1 hora)

---

### **Fase 2: Frontend - Tipos y Servicios (1 día)**

1. **Actualizar `types/asistencia.ts`** (30 min)
   - Añadir `MetadataAsistencia` en `AsistenciaArbitro`
   - Añadir `metadata` en `RegistroAsistencia`

2. **Actualizar `services/api.ts`** (1 hora)
   - Añadir tipos para nuevos campos
   - Crear función `getEstadisticasDiasSemana()`
   - Crear función `getPendientesDiasObligatorios()`

3. **Crear `lib/horarios-asistencia.ts`** (1 hora)
   - Configuración de horarios
   - Funciones de utilidad

---

### **Fase 3: Frontend - Componentes (2 días)**

1. **Mejorar `useRegistroAsistencia.ts`** (3 horas)
   - `iniciarRegistroConRetraso()`
   - Cálculo automático de retraso en `marcarAsistencia()`
   - Envío de metadata al backend

2. **Crear `AsistenciaWidget.tsx`** (2 horas)
   - Widget para dashboard principal
   - Lógica de pendientes

3. **Crear `RankingAsistencia.tsx`** (3 horas)
   - Tabla de ranking
   - Cálculo de puntajes

4. **Crear `AsistenciaDashboardPage.tsx`** (4 horas)
   - Dashboard completo con gráficos
   - Integración de todos los componentes
   - Responsive design

5. **Mejorar `page.tsx` (registro)** (2 horas)
   - Validación de días obligatorios
   - Modal de registro con retraso
   - Alertas y recordatorios

6. **Mejorar `historial/page.tsx`** (1 hora)
   - Filtro por día obligatorio
   - Mostrar indicadores de retraso

---

### **Fase 4: Testing y Despliegue (1 día)**

1. **Testing completo** (3 horas)
   - Probar registro normal
   - Probar registro con retraso
   - Validar días obligatorios
   - Verificar reportes
   - Probar en diferentes dispositivos

2. **Ajustes de UI/UX** (2 horas)
   - Mejorar colores y gradientes
   - Añadir animaciones
   - Optimizar responsive

3. **Documentación** (1 hora)
   - Actualizar `DOCUMENTACION.md`
   - Crear guía de usuario

---

## 🎨 Paleta de Colores Recomendada

```css
/* Dashboard */
--asistencia-primary: #3b82f6 (azul)
--asistencia-success: #22c55e (verde)
--asistencia-warning: #eab308 (amarillo)
--asistencia-danger: #ef4444 (rojo)
--asistencia-info: #06b6d4 (cian)

/* Gradientes */
bg-gradient-to-br from-blue-50 to-indigo-50
bg-gradient-to-br from-green-50 to-emerald-50
bg-gradient-to-br from-yellow-50 to-amber-50
bg-gradient-to-br from-red-50 to-rose-50
```

---

## ✅ Criterios de Éxito

1. **Días obligatorios:** Sistema identifica y fuerza registro en lun-mar-jue-vie-sáb
2. **Tolerancia:** Usuario puede registrar hasta 24h después con marca de retraso
3. **Dashboard:** Gráficos interactivos, ranking, alertas de pendientes
4. **Performance:** Carga < 2s, gráficos fluidos
5. **UX:** Intuitivo, accesible, responsive en móvil y desktop
6. **Backend:** Todos los endpoints funcionan, datos consistentes

---

## 📊 Métricas a Monitorear

- Porcentaje de asistencia por día obligatorio
- Tasa de retrasos (minutos promedio)
- Ranking de puntualidad
- Días con mayor ausentismo
- Tendencia mensual de asistencia

---

**¿Aprobamos esta propuesta y procedemos con la implementación?**