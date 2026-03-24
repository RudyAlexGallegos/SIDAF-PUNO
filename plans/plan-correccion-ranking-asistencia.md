# Plan de Corrección del Ranking de Asistencia

## Problema Identificado

El ranking de asistencia está mostrando información incorrecta porque:

1. **Error en el nombre del campo del árbitro**: 
   - En `registrosExpandidos` (línea 414) se usa `arbitrId` (falta la 'o')
   - En el ranking (línea 811) se busca `aribroId`, `aritroId`, `arbitrId` (todos con errores)
   - El nombre correcto debería ser `arbitroId`

2. **Fuente de datos incorrecta**:
   - El ranking usa `registrosExpandidos` que contiene TODOS los registros
   - Debería usar los registros FILTRADOS por fecha, mes, actividad y árbitro
   - Esto causa que el ranking muestre estadísticas diferentes a lo que aparece en la tabla

3. **No existe `registrosExpandidosFiltrados`**:
   - El código intenta usar una variable que no existe
   - Necesitamos crear esta variable que combine la expansión con los filtros

## Análisis del Código Actual

### Línea 414 - Creación de registrosExpandidos
```typescript
const registrosExpandidos = asistencias.flatMap((item: any) => {
  const parsed = parsearRegistros(item)
  if (parsed.length > 0) {
    return parsed.map((reg: any) => ({
      ...item,
      arbitroId: reg.arbitrId,  // ❌ ERROR: debería ser reg.arbitroId
      nombreArbitro: getNombreArbitro(reg.arbitrId),
      estadoItem: reg.estado,
      horaEntrada: reg.horaRegistro || item.horaEntrada
    }))
  }
  return [{
    ...item,
    arbitroId: "",
    nombreArbitro: "General",
    estadoItem: item.estado || "-"
  }]
})
```

### Línea 811 - Cálculo del ranking
```typescript
;(registrosExpandidos || []).forEach((r: any) => {
  // ❌ ERROR: busca campos con nombres incorrectos
  const arbitroIdValue = r.aribroId ?? r.aritroId ?? r.arbitrId; 
  const id = String(arbitroIdValue ?? r.idArbitro ?? r.id ?? '')
  // ...
})
```

### Línea 428-436 - Filtros aplicados
```typescript
const filtered = asistencias
  .filter(a => {
    if (!esDiaObligatorio(a.fecha)) return false  // ❌ Solo días obligatorios
    if (filtroActividad !== "todos" && a.actividad !== filtroActividad) return false
    if (filtroMes !== "todos" && !a.fecha?.startsWith(filtroMes)) return false
    if (filtroArbitro !== "todos" && a.arbitroId !== filtroArbitro) return false
    return true
  })
  .sort((a: any, b: any) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())
```

## Plan de Corrección

### Paso 1: Corregir el nombre del campo en registrosExpandidos
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Línea**: 414

**Cambio**:
```typescript
// Antes:
arbitroId: reg.arbitrId,  // ❌ Error tipográfico

// Después:
arbitroId: reg.arbitroId,  // ✅ Nombre correcto
```

**Impacto**: Esto asegura que el campo `arbitroId` se llene correctamente con el ID del árbitro.

### Paso 2: Crear registrosExpandidosFiltrados
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Ubicación**: Después de la definición de `filtered` (línea 436)

**Código a agregar**:
```typescript
// Crear registros expandidos FILTRADOS - combina expansión con filtros
const registrosExpandidosFiltrados = filtered.flatMap((item: any) => {
  const parsed = parsearRegistros(item)
  if (parsed.length > 0) {
    return parsed.map((reg: any) => ({
      ...item,
      arbitroId: reg.arbitroId,  // ✅ Nombre correcto
      nombreArbitro: getNombreArbitro(reg.arbitroId),
      estadoItem: reg.estado,
      horaEntrada: reg.horaRegistro || item.horaEntrada
    }))
  }
  return [{
    ...item,
    arbitroId: "",
    nombreArbitro: "General",
    estadoItem: item.estado || "-"
  }]
})
```

**Impacto**: Esta variable contiene solo los registros que pasan los filtros, expandidos para incluir información del árbitro.

### Paso 3: Modificar el cálculo del ranking
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Líneas**: 808-820

**Cambio**:
```typescript
// Antes:
// Procesar registros expandidos - el campo se llama 'aribroId' (con 'o') según línea 413
;(registrosExpandidos || []).forEach((r: any) => {
  // En registrosExpandidos, el campo se llama 'aribroId' (con 'o') - ver línea 413
  const arbitroIdValue = r.aribroId ?? r.aritroId ?? r.arbitrId; 
  const id = String(arbitroIdValue ?? r.idArbitro ?? r.id ?? '')
  console.log("========================================"); console.log("ARBITROS DISPONIBLES:", (arbitros || []).map(a => a.id)); console.log("========================================");
  if (id && statsPorArbitro[id]) {
    statsPorArbitro[id].total++
    const estado = r.estadoItem || r.estado || ''
    if (estado === 'presente') statsPorArbitro[id].presentes++
    else if (estado === 'tardanza') statsPorArbitro[id].tardanzas++
    else if (estado === 'justificado') statsPorArbitro[id].justificados++
  }
})

// Después:
// ✅ Procesar registros expandidos FILTRADOS - usar solo los registros que se muestran en la tabla
;(registrosExpandidosFiltrados || []).forEach((r: any) => {
  // En registrosExpandidosFiltrados, el campo se llama 'arbitroId' (sin 'o') - ver línea 414
  const arbitroIdValue = r.arbitroId
  const id = String(arbitroIdValue ?? r.idArbitro ?? r.id ?? '')
  if (id && statsPorArbitro[id]) {
    statsPorArbitro[id].total++
    const estado = r.estadoItem || r.estado || ''
    if (estado === 'presente') statsPorArbitro[id].presentes++
    else if (estado === 'tardanza') statsPorArbitro[id].tardanzas++
    else if (estado === 'justificado') statsPorArbitro[id].justificados++
  }
})
```

**Impacto**: El ranking ahora usa los registros filtrados y accede al campo correcto `arbitroId`.

### Paso 4: Actualizar mensaje de depuración
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Línea**: 852

**Cambio**:
```typescript
// Antes:
Registros expandidos: {registrosExpandidos?.length || 0}

// Después:
Registros expandidos filtrados: {registrosExpandidosFiltrados?.length || 0}
```

**Impacto**: El mensaje de depuración ahora muestra el número correcto de registros.

## Resultado Esperado

Después de aplicar estas correcciones:

1. **Coherencia**: El ranking mostrará las mismas estadísticas que la tabla visible
2. **Precisión**: Los datos del ranking reflejarán correctamente los registros de asistencia
3. **Filtros**: El ranking respetará los filtros de fecha, mes, actividad y árbitro
4. **Cálculo correcto**: 
   - JHON SALAMANCA CUTIPA: 30 presentes de 31 días = 97%
   - RUDY ALEX GALLEGOS LIZARRAGA: 29 presentes de 31 días = 94%
   - JOSÉ FLORES CONDORI: 3 presentes de 7 días = 43%
   - DYLAND ETNIEL LARICO OCHOA: 5 presentes de 31 días = 16%
   - WILBER CENTENO HERRERA: 1 presente de X días = Y%

## Orden de Ejecución

1. ✅ Crear `registrosExpandidosFiltrados`
2. ✅ Corregir nombre del campo en `registrosExpandidos` (línea 414)
3. ✅ Modificar cálculo del ranking para usar `registrosExpandidosFiltrados`
4. ✅ Actualizar mensaje de depuración

## Verificación

Después de aplicar los cambios, verificar:
- El ranking muestra estadísticas coherentes con la tabla
- Los filtros afectan correctamente al ranking
- Los porcentajes se calculan correctamente
- No hay errores en la consola del navegador
