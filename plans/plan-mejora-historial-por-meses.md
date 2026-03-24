# Plan: Mejora de Visualización por Meses - Historial de Asistencia

## Objetivo
Reorganizar la visualización del historial de asistencia agrupando los registros por meses con una interfaz tipo acordeón que incluya estadísticas resumidas en cada encabezado de mes.

## Estado Actual
- Los registros se muestran en una tabla simple ordenada cronológicamente
- No hay agrupación por meses
- Los usuarios deben navegar a través de una lista larga de registros
- Las estadísticas se muestran solo a nivel general

## Propuesta de Solución

### 1. Estructura de la Nueva Vista

#### Componente Principal: Acordeón por Meses
- Cada mes se mostrará como una sección colapsable
- El encabezado de cada mes mostrará:
  - Nombre del mes y año (ej: "Marzo 2026")
  - Total de días obligatorios en ese mes
  - Días completados (con icono ✅)
  - Días pendientes (con icono ⏸️)
  - Porcentaje de asistencia del mes (con barra de progreso visual)
- Al expandir un mes, se mostrará la tabla de registros de ese mes

#### Diseño del Encabezado de Mes
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Marzo 2026                    [▼]                        │
│ Total: 23 días  |  ✅ 18 completados  |  ⏸️ 5 pendientes  │
│ Asistencia: 78%  [████████████████████░░░░░░░]             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Funcionalidades a Implementar

#### 2.1 Agrupación de Datos por Mes
- Crear función `agruparPorMes()` que:
  - Agrupe los días completos por mes-año
  - Calcule estadísticas por mes (total, completados, pendientes, porcentaje)
  - Ordene los meses de forma descendente (más reciente primero)
  - **CRÍTICO**: Dentro de cada mes, mantener el orden cronológico de los registros (más reciente primero) para que el usuario no se pierda buscando fechas

#### 2.2 Estado de Acordeón
- Agregar estado `mesesExpandidos` para controlar qué meses están abiertos
- Por defecto, el mes actual debe estar expandido
- Permitir expandir/colapsar múltiples meses simultáneamente

#### 2.3 Componente de Estadísticas de Mes
- Crear componente reutilizable `EstadisticasMes` que muestre:
  - Badge con total de días
  - Badge con días completados (color verde)
  - Badge con días pendientes (color ámbar)
  - Barra de progreso de asistencia (colores según porcentaje)
    - ≥90%: Verde
    - 70-89%: Amarillo
    - <70%: Rojo

#### 2.4 Mejoras de UX
- Agregar animaciones suaves al expandir/colapsar meses
- Usar colores distintivos para meses con baja asistencia
- Mostrar indicador visual de meses con registros pendientes
- Mantener los filtros existentes (árbitro, actividad, mes)
- Los filtros deben afectar la visualización dentro de los meses

### 3. Componentes a Crear/Modificar

#### 3.1 Componentes Nuevos
- `EstadisticasMesCard`: Componente para mostrar estadísticas de un mes
- `AcordeonMes`: Componente principal del acordeón por mes

#### 3.2 Componentes a Modificar
- `HistorialAsistenciaPage`: Reemplazar tabla actual con acordeón por meses

### 4. Estructura de Datos

#### Tipo para Estadísticas de Mes
```typescript
interface EstadisticasMes {
  mes: string           // "2026-03"
  nombreMes: string     // "Marzo 2026"
  totalDias: number
  diasCompletados: number
  diasPendientes: number
  porcentaje: number
  registros: DiaRegistro[]
}

interface DiaRegistro {
  fecha: string
  fechaDate: Date
  diaSemana: number
  actividad: string
  tieneRegistro: boolean
  registro?: Asistencia
}
```

### 5. Lógica de Implementación

#### 5.1 Función de Agrupación
```typescript
const agruparPorMes = (diasCompletos: DiaRegistro[]): EstadisticasMes[] => {
  const grupos: Record<string, DiaRegistro[]> = {}
  
  diasCompletos.forEach(dia => {
    const mesKey = format(dia.fechaDate, 'yyyy-MM')
    if (!grupos[mesKey]) {
      grupos[mesKey] = []
    }
    grupos[mesKey].push(dia)
  })
  
  return Object.entries(grupos)
    .map(([mes, registros]) => {
      const total = registros.length
      const completados = registros.filter(r => r.tieneRegistro).length
      const pendientes = total - completados
      const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0
      
      return {
        mes,
        nombreMes: format(parseISO(`${mes}-01`), 'MMMM yyyy', { locale: es }),
        totalDias: total,
        diasCompletados: completados,
        diasPendientes: pendientes,
        porcentaje,
        registros: registros.sort((a, b) => b.fechaDate.getTime() - a.fechaDate.getTime())
      }
    })
    .sort((a, b) => b.mes.localeCompare(a.mes)) // Orden descendente por mes
}
```

#### 5.2 Estado de Expansión
```typescript
const [mesesExpandidos, setMesesExpandidos] = useState<Set<string>>(new Set())

const toggleMes = (mes: string) => {
  const nuevos = new Set(mesesExpandidos)
  if (nuevos.has(mes)) {
    nuevos.delete(mes)
  } else {
    nuevos.add(mes)
  }
  setMesesExpandidos(nuevos)
}

// Expandir mes actual por defecto
useEffect(() => {
  const mesActual = format(new Date(), 'yyyy-MM')
  setMesesExpandidos(new Set([mesActual]))
}, [])
```

### 6. Diseño Visual

#### 6.1 Colores y Estilos
- Encabezado de mes con gradiente sky-500 a sky-600
- Bordes sky-200 para separar meses
- Fondo alternativo para meses con baja asistencia (<70%)
- Iconos y badges con colores semánticos (verde, ámbar, rojo)

#### 6.2 Responsividad
- En móvil: acordeones ocupan todo el ancho
- En tablet: acordeones con padding lateral
- En desktop: acordeones centrados con máximo ancho

### 7. Integración con Funcionalidades Existentes

#### 7.1 Filtros
- Los filtros actuales (árbitro, actividad, mes) deben seguir funcionando
- Al filtrar por mes específico, solo se muestra ese mes expandido
- Los filtros se aplican ANTES de la agrupación por meses

#### 7.2 Acciones por Registro
- Mantener las acciones existentes:
  - Editar registro
  - Exportar día
  - Eliminar registro
  - Subsanar asistencia
- Estas acciones deben funcionar dentro de cada mes expandido

#### 7.3 Exportaciones
- Mantener botones de exportación global (PDF, Excel, Reporte Semanal)
- Considerar agregar opción de exportar por mes específico

### 8. Pasos de Implementación

1. ✅ Analizar código actual
2. ✅ Recopilar requisitos del usuario
3. ⏳ Crear tipos de datos para estadísticas de mes
4. ⏳ Implementar función de agrupación por mes
5. ⏳ Crear componente `EstadisticasMesCard`
6. ⏳ Crear componente `AcordeonMes`
7. ⏳ Modificar página principal para usar acordeones
8. ⏳ Implementar estado de expansión de meses
9. ⏳ Integrar con filtros existentes
10. ⏳ Probar funcionalidad completa
11. ⏳ Ajustar estilos y animaciones
12. ⏳ Verificar responsividad

### 9. Beneficios Esperados

- **Mejor organización**: Los usuarios pueden ver rápidamente la asistencia por mes
- **Estadísticas contextuales**: Cada mes muestra su propio progreso
- **Navegación más fácil**: Los usuarios pueden enfocarse en meses específicos
- **Visualización más amigable**: Menos scroll, mejor estructura visual
- **Identificación rápida de problemas**: Meses con baja asistencia se destacan visualmente

### 10. Consideraciones Adicionales

- Mantener compatibilidad con funcionalidades existentes
- No afectar el rendimiento con muchos registros
- Asegurar que la experiencia sea fluida en dispositivos móviles
- Considerar agregar opción de vista tradicional (tabla) para usuarios que la prefieran
