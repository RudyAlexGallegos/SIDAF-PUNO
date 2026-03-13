# Plan de Mejora - Historial de Asistencia

## Objetivo
Mejorar el módulo de historial de asistencia para mostrar todos los días obligatorios desde el 1 de enero de 2026, con acciones diferenciadas entre registros existentes y faltantes.

## Requisitos del Usuario

1. **Acciones en registros existentes**: Editar, Borrar, Exportar
2. **Mostrar todos los registros desde 01/01/2026**: Todos los días obligatorios (Lun, Mar, Jue, Vie, Sáb)
3. **Tipo de actividad por día**:
   - Lunes = Análisis de Partido
   - Martes, Jueves, Sábado = Preparación Física
   - Viernes = Reunión Ordinaria
4. **Registros faltantes**: Solo opción "Subsanar" (crear nuevo registro)

---

## Análisis del Código Actual

### Estructura actual del archivo
- [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx)

### Problemas identificados:
1. Solo muestra registros que existen en la base de datos
2. No genera registros para días faltantes
3. No diferencia entre registros existentes y faltantes
4. El tipo de actividad se guarda pero no se muestra claramente

---

## Plan de Implementación

### Paso 1: Modificar lógica de carga de registros

**Objetivo**: Generar una lista completa de días obligatorios desde 01/01/2026, marcando cuáles tienen registro y cuáles no.

**Cambios en [`historial/page.tsx`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx)**:

```typescript
// Generar todos los días obligatorios desde 01/01/2026
const generarDiasObligatorios = () => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  const dias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
  
  const diasObligatorios = [1, 2, 4, 5, 6] // Lun, Mar, Jue, Vie, Sáb
  
  return dias
    .filter(dia => diasObligatorios.includes(dia.getDay()))
    .map(dia => ({
      fecha: format(dia, 'yyyy-MM-dd'),
      fechaDate: dia,
      diaSemana: dia.getDay(),
      tieneRegistro: false, // Se marcará después
      registro: null
    }))
}

// Después de cargar las asistencias, marcar cuáles tienen registro
const registrosCompletos = () => {
  const diasGenerados = generarDiasObligatorios()
  const fechasConRegistro = new Set(asistencias.map(a => a.fecha?.split('T')[0]))
  
  return diasGenerados.map(dia => ({
    ...dia,
    tieneRegistro: fechasConRegistro.has(dia.fecha),
    registro: asistencia.find(a => a.fecha?.startsWith(dia.fecha))
  }))
}
```

### Paso 2: Asignar tipo de actividad según día de la semana

**Función existente a modificar** [`getActividadPorDia()`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:170):

```typescript
const getActividadPorDia = (fechaStr: string): string => {
  try {
    const fecha = new Date(fechaStr)
    const diaSemana = fecha.getDay()
    
    // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    if (diaSemana === 1) return "analisis_partido"        // Lunes
    if (diaSemana === 2 || diaSemana === 4 || diaSemana === 6) return "preparacion_fisica"  // Mar, Jue, Sáb
    if (diaSemana === 5) return "reunion_ordinaria"        // Viernes
    return ""
  } catch {
    return ""
  }
}

const getActividadLabel = (actividad?: string): string => {
  const labels: Record<string, string> = {
    analisis_partido: "📊 Análisis de Partido",
    preparacion_fisica: "💪 Preparación Física",
    reunion_ordinaria: "📋 Reunión Ordinaria"
  }
  return labels[actividad || ""] || "-"
}
```

### Paso 3: Mostrar acciones según tipo de registro

**En la tabla de resultados**, modificar la lógica de renderizado:

```typescript
// Para cada registro en la lista:
{registrosCompletos.map((item) => (
  <TableRow key={item.fecha} className={item.tieneRegistro ? "bg-white" : "bg-amber-50"}>
    <TableCell>{format(item.fechaDate, "dd/MM/yyyy")}</TableCell>
    <TableCell>{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][item.diaSemana - 1]}</TableCell>
    <TableCell>{getActividadLabel(getActividadPorDia(item.fecha))}</TableCell>
    <TableCell>
      {item.tieneRegistro ? (
        // Registro existente - mostrar estado
        <Badge className={getEstadoClass(item.registro.estado)}>
          {item.registro.estado}
        </Badge>
      ) : (
        // Registro faltante - marcar como pendiente
        <Badge variant="outline" className="bg-amber-100 text-amber-800">
          ⏸️ Pendiente
        </Badge>
      )}
    </TableCell>
    <TableCell>
      {item.tieneRegistro ? (
        // Registro existente - mostrar acciones
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => abrirEditar(item.registro)}>
            ✏️ Editar
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExportarDia(item.registro)}>
            📄 Exportar
          </Button>
          <Button size="sm" variant="outline" onClick={() => abrirEliminar(item.registro)}>
            🗑️ Borrar
          </Button>
        </div>
      ) : (
        // Registro faltante - solo opción subsanar
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => subsanarRegistro(item.fecha)}>
          ➕ Subsanar
        </Button>
      )}
    </TableCell>
  </TableRow>
))}
```

### Paso 4: Implementar función "Subsanar"

```typescript
const subsanarRegistro = (fecha: string) => {
  // Redirigir a página de registro de asistencia con la fecha precargada
  // O abrir un modal para crear el registro
  router.push(`/asistencia?fecha=${fecha}`)
}
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx) | Lógica completa de generación de días, renderizado de tabla, acciones diferenciadas |

---

## Flujo de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                    HISTORIAL DE ASISTENCIA                    │
├─────────────────────────────────────────────────────────────┤
│  📅 Desde: 01/01/2026          📅 Hasta: [Fecha actual]     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Filtros: [Actividad ▼]  [Mes ▼]  [Árbitro ▼]       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📅 01/01/2026 | Lun | 📊 Análisis    | ✅ Presente  │    │
│  │                                   | ✏️📄🗑️         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 📅 02/01/2026 | Mar | 💪 Prep.Física | ❌ Ausente   │    │
│  │                                   | ✏️📄🗑️         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 📅 03/01/2026 | Mie| -            | ⏸️ Pendiente   │    │
│  │                                   | ➕ Subsanar     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Orden de Implementación

1. ✅ Análisis de requisitos
2. 🔄 Modificar `generarDiasObligatorios()` para crear lista completa
3. 🔄 Modificar `getActividadPorDia()` para tipos correctos
4. 🔄 Modificar renderizado de tabla para mostrar acciones diferenciadas
5. 🔄 Implementar función `subsanarRegistro()`
6. 🔄 Probar y verificar cambios
