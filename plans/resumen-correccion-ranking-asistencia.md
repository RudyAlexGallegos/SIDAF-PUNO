# Resumen de Correcciones del Ranking de Asistencia

## Fecha
2026-03-24

## Problema
El ranking de asistencia mostraba información incorrecta porque:
1. Usaba un nombre de campo incorrecto (`aribroId`, `aritroId`, `arbitrId`) en lugar de `arbitroId`
2. Calculaba estadísticas usando TODOS los registros (`registrosExpandidos`) en lugar de solo los registros filtrados
3. No existía una variable que combinara la expansión de registros con los filtros aplicados

## Correcciones Realizadas

### 1. Corrección del nombre del campo en `registrosExpandidos`
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Línea**: 414

**Antes**:
```typescript
arbitroId: reg.arbitrId,  // ❌ Error tipográfico
nombreArbitro: getNombreArbitro(reg.arbitrId),
```

**Después**:
```typescript
arbitroId: reg.arbitroId,  // ✅ Nombre correcto
nombreArbitro: getNombreArbitro(reg.arbitroId),
```

**Impacto**: El campo `arbitroId` ahora se llena correctamente con el ID del árbitro.

---

### 2. Creación de `registrosExpandidosFiltrados`
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Líneas**: 438-456

**Código agregado**:
```typescript
// ✅ Crear registros expandidos FILTRADOS - combina expansión con filtros
const registrosExpandidosFiltrados = filtered.flatMap((item: any) => {
  const parsed = parsearRegistros(item)
  if (parsed.length > 0) {
    return parsed.map((reg: any) => ({
      ...item,
      arbitroId: reg.arbitroId,
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

**Impacto**: Esta variable contiene solo los registros que pasan los filtros (fecha, mes, actividad, árbitro), expandidos para incluir información del árbitro.

---

### 3. Modificación del cálculo del ranking
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Líneas**: 828-840

**Antes**:
```typescript
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
```

**Después**:
```typescript
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

**Impacto**: 
- El ranking ahora usa `registrosExpandidosFiltrados` en lugar de `registrosExpandidos`
- Accede correctamente al campo `arbitroId` en lugar de buscar campos con errores tipográficos
- Eliminado el console.log de depuración
- Las estadísticas del ranking ahora coinciden con los datos mostrados en la tabla

---

### 4. Actualización del mensaje de depuración
**Archivo**: `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`
**Línea**: 872

**Antes**:
```typescript
Registros expandidos: {registrosExpandidos?.length || 0}
```

**Después**:
```typescript
Registros expandidos filtrados: {registrosExpandidosFiltrados?.length || 0}
```

**Impacto**: El mensaje de depuración ahora muestra el número correcto de registros filtrados.

---

## Resultado Esperado

Después de aplicar estas correcciones, el ranking de asistencia debería mostrar:

1. **Coherencia**: Las estadísticas del ranking coinciden exactamente con los datos mostrados en la tabla
2. **Precisión**: Los datos reflejan correctamente los registros de asistencia
3. **Filtros**: El ranking respeta los filtros de fecha, mes, actividad y árbitro
4. **Cálculo correcto**: Los porcentajes se calculan basándose en los registros filtrados

### Ejemplo de ranking esperado:

```
🏆 Top 5 Árbitros con Mejor Asistencia

1. JHON SALAMANCA CUTIPA
   30 presentes, 0 tardanzas, 0 justificados
   97%
   31 días

2. RUDY ALEX GALLEGOS LIZARRAGA
   29 presentes, 0 tardanzas, 0 justificados
   94%
   31 días

3. JOSÉ FLORES CONDORI
   3 presentes, 0 tardanzas, 0 justificados
   43%
   7 días

4. DYLAND ETNIEL LARICO OCHOA
   5 presentes, 0 tardanzas, 0 justificados
   16%
   31 días

5. WILBER CENTENO HERRERA
   1 presente, 0 tardanzas, 0 justificados
   X%
   X días
```

---

## Archivos Modificados

- `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`

---

## Pruebas Recomendadas

1. **Verificar coherencia**: Comparar los datos del ranking con los de la tabla
2. **Probar filtros**: Aplicar diferentes filtros (mes, actividad, árbitro) y verificar que el ranking se actualiza correctamente
3. **Verificar porcentajes**: Confirmar que los porcentajes se calculan correctamente
4. **Revisar consola**: Verificar que no hay errores en la consola del navegador
5. **Probar diferentes fechas**: Verificar que el ranking funciona correctamente con diferentes rangos de fechas

---

## Notas Técnicas

- La variable `registrosExpandidos` se mantiene para otros usos en el código
- La variable `registrosExpandidosFiltrados` se crea específicamente para el ranking
- El campo `arbitroId` ahora se usa consistentemente en todo el código
- Los filtros aplicados a `filtered` se respetan en el cálculo del ranking
