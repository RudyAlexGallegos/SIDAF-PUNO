# 🔍 Análisis de Fallas de Lógica - Módulo de Asistencia

**Fecha:** 24 de Marzo, 2026  
**Analista:** Kilo Code (Code Mode)  
**Versión del Sistema:** 3.0

---

## 📋 Resumen Ejecutivo

Se han identificado **15 fallas de lógica críticas** en el módulo de asistencia que afectan el funcionamiento correcto del sistema. Estas fallas se clasifican en tres categorías:

1. **Fallas de Filtrado y Búsqueda** (5 fallas)
2. **Fallas de Validación y Restricciones** (4 fallas)
3. **Fallas de Datos y Tipos** (6 fallas)

---

## 🔴 CRÍTICAS - Fallas que Impiden Funcionalidad

### 1. Filtrado por Árbitro No Funciona

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:428-435`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:428-435)

**Problema:**
```typescript
const filtered = asistencias
  .filter(a => {
    if (!esDiaObligatorio(a.fecha)) return false
    if (filtroActividad !== "todos" && a.actividad !== filtroActividad) return false
    if (filtroMes !== "todos" && !a.fecha?.startsWith(filtroMes)) return false
    if (filtroArbitro !== "todos" && a.arbitroId !== filtroArbitro) return false // ❌ ERROR
    return true
  })
```

**Causa:** El campo `arbitroId` NO existe directamente en la entidad `Asistencia`. Los datos de los árbitros se almacenan en el campo `observaciones` como JSON.

**Impacto:** El filtro por árbitro nunca funciona correctamente.

**Solución:**
```typescript
// Primero expandir los registros para tener datos de árbitros
const registrosExpandidosFiltrados = registrosExpandidos.filter((r: any) => {
  if (!esDiaObligatorio(r.fecha)) return false
  if (filtroActividad !== "todos" && r.actividad !== filtroActividad) return false
  if (filtroMes !== "todos" && !r.fecha?.startsWith(filtroMes)) return false
  if (filtroArbitro !== "todos" && r.arbitroId !== filtroArbitro) return false // ✅ CORRECTO
  return true
}).sort((a: any, b: any) => new Date(b.fecha || "").getTime() - new Date(a.fecha || "").getTime())
```

---

### 2. Historial Solo Muestra Días Obligatorios

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:429`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:429)

**Problema:**
```typescript
const filtered = asistencias
  .filter(a => {
    if (!esDiaObligatorio(a.fecha)) return false // ❌ ERROR
    // ...
  })
```

**Causa:** El historial filtra para mostrar solo días obligatorios, pero debería mostrar TODOS los registros de asistencia.

**Impacto:** Los usuarios no pueden ver registros de días no obligatorios (reuniones extraordinarias, eventos especiales, etc.).

**Solución:**
```typescript
const filtered = asistencias
  .filter(a => {
    // ✅ No filtrar por día obligatorio - mostrar todos los registros
    if (filtroActividad !== "todos" && a.actividad !== filtroActividad) return false
    if (filtroMes !== "todos" && !a.fecha?.startsWith(filtroMes)) return false
    if (filtroArbitro !== "todos" && a.arbitroId !== filtroArbitro) return false
    return true
  })
```

---

### 3. Registro No Permitido en Días No Obligatorios

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/page.tsx:300-335`](frontend/app/(dashboard)/dashboard/asistencia/page.tsx:300-335)

**Problema:**
```typescript
<div className={diaObligatorio ? '' : 'opacity-50 pointer-events-none'}>
  <label className="text-sm font-medium text-gray-700 block mb-2">Responsable</label>
  {/* ... */}
</div>

{!diaObligatorio ? (
  <div className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-400 text-white py-3 px-6 rounded-xl font-semibold cursor-not-allowed">
    Registro no disponible (día no obligatorio)
  </div>
) : (
  <button onClick={() => { /* iniciar registro */ }}>
    {existeRegistroHoy ? "Continuar Editando" : "Iniciar Registro"}
  </button>
)}
```

**Causa:** El sistema impide registrar asistencia en días no obligatorios, pero esto es incorrecto. Debería permitirse registrar en cualquier día.

**Impacto:** No se pueden registrar actividades especiales, reuniones extraordinarias, o eventos en días no obligatorios.

**Solución:**
```typescript
// ✅ Permitir registro en cualquier día
<div className="">
  <label className="text-sm font-medium text-gray-700 block mb-2">Responsable</label>
  {/* ... */}
</div>

<button onClick={() => { /* iniciar registro */ }} className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95">
  {existeRegistroHoy ? "Continuar Editando" : "Iniciar Registro"}
</button>
```

---

### 4. Typos en Nombres de Campos

**Ubicación:** Múltiples archivos

**Problema 1:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:505`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:505)
```typescript
const datosReporte = filtered.map((item: any) => ({
  id: item.id,
  fecha: item.fecha,
  actividad: item.actividad,
  estado: item.estadoItem || item.estado || '-',
  horaEntrada: item.horaEntrada,
  arbitroId: item.arbitrosId // ❌ TYPO: debería ser item.arbitroId
}))
```

**Problema 2:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:524`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:524)
```typescript
const datosReporte = filtered.map((item: any) => ({
  id: item.id,
  fecha: item.fecha,
  actividad: item.actividad,
  estado: item.estadoItem || item.estado || '-',
  horaEntrada: item.horaEntrada,
  arbitroId: item.arbitrosId // ❌ TYPO: debería ser item.arbitroId
}))
```

**Problema 3:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:414`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:414)
```typescript
return parsed.map((reg: any) => ({
  ...item,
  arbitroId: reg.arbitrId, // ❌ TYPO: debería ser reg.arbitroId
  nombreArbitro: getNombreArbitro(reg.arbitrId),
  estadoItem: reg.estado,
  horaEntrada: reg.horaRegistro || item.horaEntrada
}))
```

**Impacto:** Los datos de árbitros no se exportan correctamente en los reportes.

**Solución:** Corregir todos los typos de `arbitrosId` y `arbitrId` a `arbitroId`.

---

### 5. Exportación Usa Datos Incorrectos

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:494-531`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:494-531)

**Problema:**
```typescript
const handleExportarPDF = (tipoReporte: string = 'resumen') => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  
  // ❌ Usa filtered (datos originales de asistencias, no expandidos)
  const datosReporte = filtered.map((item: any) => ({
    id: item.id,
    fecha: item.fecha,
    actividad: item.actividad,
    estado: item.estadoItem || item.estado || '-',
    horaEntrada: item.horaEntrada,
    arbitroId: item.arbitrosId // ❌ TYPO
  }))
  // ...
}

const handleExportarExcel = () => {
  const fechaInicio = parseISO("2026-01-01")
  
  // ❌ Usa filtered (datos originales de asistencias, no expandidos)
  const datosReporte = filtered.map((item: any) => ({
    id: item.id,
    fecha: item.fecha,
    actividad: item.actividad,
    estado: item.estadoItem || item.estado || '-',
    horaEntrada: item.horaEntrada,
    arbitroId: item.arbitrosId // ❌ TYPO
  }))
  // ...
}
```

**Causa:** Los reportes usan `filtered` que contiene registros de `asistencias` (no expandidos), pero deberían usar `registrosExpandidosFiltrados` para tener los datos de los árbitros.

**Impacto:** Los reportes no muestran los datos correctos de los árbitros.

**Solución:**
```typescript
const handleExportarPDF = (tipoReporte: string = 'resumen') => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  
  // ✅ Usar registrosExpandidosFiltrados (datos expandidos por árbitro)
  const datosReporte = registrosExpandidosFiltrados.map((item: any) => ({
    id: item.id,
    fecha: item.fecha,
    actividad: item.actividad,
    estado: item.estadoItem || item.estado || '-',
    horaEntrada: item.horaEntrada,
    arbitroId: item.arbitroId,
    nombreArbitro: item.nombreArbitro // ✅ Agregado para mejor identificación
  }))
  // ...
}
```

---

## 🟡 IMPORTANTES - Fallas que Afectan la Experiencia de Usuario

### 6. Inconsistencia en Definición de Días Obligatorios

**Ubicación:** Múltiples archivos

**Problema:**

Frontend ([`frontend/lib/horarios-asistencia.ts`](frontend/lib/horarios-asistencia.ts)):
```typescript
export const DIAS_OBLIGATORIOS = [1, 2, 4, 5, 6] as const
// getDayOfWeek() devuelve 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
export function getDiaSemana(fecha: Date | string): number {
  const f = typeof fecha === "string" ? new Date(fecha) : fecha;
  let d = f.getDay();
  return d === 0 ? 7 : d; // Convierte domingo(0) a 7
}
```

Backend ([`backend/src/main/java/com/sidaf/backend/service/AsistenciaService.java:19`](backend/src/main/java/com/sidaf/backend/service/AsistenciaService.java:19)):
```java
public static final Set<Integer> DIAS_OBLIGATORIOS = Set.of(1, 2, 4, 5, 6);
// getDayOfWeek().getValue() devuelve 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb, 7=Dom
```

**Causa:** El frontend convierte domingo(0) a 7, mientras que el backend usa directamente el valor de `getDayOfWeek().getValue()` que ya devuelve 7 para domingo.

**Impacto:** Puede haber inconsistencias en la validación de días obligatorios entre frontend y backend.

**Solución:** Estandarizar la definición de días obligatorios en ambos lados.

---

### 7. Problemas de Zona Horaria en Fechas

**Ubicación:** [`frontend/hooks/asistencia/useRegistroAsistencia.ts:34,71`](frontend/hooks/asistencia/useRegistroAsistencia.ts:34)

**Problema:**
```typescript
const hoy = new Date().toISOString().split('T')[0] // ❌ Puede tener problemas de zona horaria
```

**Causa:** `toISOString()` usa UTC, lo que puede causar que la fecha sea diferente a la fecha local del usuario.

**Impacto:** Los registros pueden guardarse con la fecha incorrecta.

**Solución:**
```typescript
const hoy = new Date().toLocaleDateString('en-CA') // ✅ Usa formato local (YYYY-MM-DD)
```

---

### 8. Paginación Aplicada a Datos Incorrectos

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:458-460`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:458-460)

**Problema:**
```typescript
const totalPaginas = Math.ceil(filtered.length / elementosPorPagina)
const inicio = (paginaActual - 1) * elementosPorPagina
const asistenciaPaginada = filtered.slice(inicio, inicio + elementosPorPagina) // ❌ ERROR
```

**Causa:** La paginación se aplica a `filtered` que contiene registros de `asistencias` (no expandidos), pero debería aplicarse a los registros expandidos filtrados.

**Impacto:** La paginación no funciona correctamente con los registros expandidos.

**Solución:**
```typescript
const totalPaginas = Math.ceil(registrosExpandidosFiltrados.length / elementosPorPagina)
const inicio = (paginaActual - 1) * elementosPorPagina
const asistenciaPaginada = registrosExpandidosFiltrados.slice(inicio, inicio + elementosPorPagina) // ✅ CORRECTO
```

---

### 9. Cálculo de Días Faltantes Incompleto

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:469-490`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:469-490)

**Problema:**
```typescript
const getDiasFaltantes = () => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  const todosLosDias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
  
  const diasObligatorios = [1, 2, 4, 5, 6]
  
  // ❌ Solo busca fechas en registrosExpandidos
  const fechasConRegistro = new Set(
    registrosExpandidos
      .filter(r => r.fecha)
      .map(r => r.fecha?.split('T')[0])
  )
  
  const faltantes = todosLosDias
    .filter(dia => diasObligatorios.includes(dia.getDay()))
    .filter(dia => !fechasConRegistro.has(format(dia, 'yyyy-MM-dd')))
    
  return faltantes
}
```

**Causa:** La función solo busca fechas en `registrosExpandidos`, pero no incluye registros generales (sin árbitro específico) que también pueden tener registro de asistencia.

**Impacto:** Los días faltantes pueden no calcularse correctamente.

**Solución:**
```typescript
const getDiasFaltantes = () => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  const todosLosDias = eachDayOfInterval({ start: fechaInicio, end: fechaFin })
  
  const diasObligatorios = [1, 2, 4, 5, 6]
  
  // ✅ Buscar fechas en asistencias (incluye registros generales)
  const fechasConRegistro = new Set(
    asistencias
      .filter(a => a.fecha)
      .map(a => a.fecha?.split('T')[0])
  )
  
  const faltantes = todosLosDias
    .filter(dia => diasObligatorios.includes(dia.getDay()))
    .filter(dia => !fechasConRegistro.has(format(dia, 'yyyy-MM-dd')))
    
  return faltantes
}
```

---

## 🟢 MENORES - Fallas que Afectan la Calidad del Código

### 10. Archivo Formateado Incorrectamente

**Ubicación:** [`frontend/lib/horarios-asistencia.ts`](frontend/lib/horarios-asistencia.ts)

**Problema:** El archivo está todo en una sola línea, lo que hace difícil de mantener y depurar.

**Solución:** Formatear el archivo correctamente con saltos de línea y sangría.

---

### 11. Validación de Fecha en Registro con Retraso

**Ubicación:** [`backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java:316`](backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java:316)

**Problema:**
```java
if (request.getFecha().isBefore(hoy.minusDays(7))) {
    return ResponseEntity.badRequest().build();
}
```

**Causa:** Solo valida que la fecha no sea anterior a 7 días, pero no valida que la fecha no sea futura.

**Impacto:** Se pueden crear registros con fechas futuras.

**Solución:**
```java
if (request.getFecha().isBefore(hoy.minusDays(7)) || request.getFecha().isAfter(hoy)) {
    return ResponseEntity.badRequest().build();
}
```

---

### 12. Falta Validación de Datos en Creación de Asistencia

**Ubicación:** [`backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java:46`](backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java:46)

**Problema:**
```java
@PostMapping
public ResponseEntity<Asistencia> crear(@RequestBody Asistencia asistencia) {
    if (asistencia.getCreatedAt() == null) {
        asistencia.setCreatedAt(LocalDateTime.now());
    }
    Asistencia guardado = asistenciaRepository.save(asistencia);
    return ResponseEntity.created(URI.create("/api/asistencias/" + guardado.getId())).body(guardado);
}
```

**Causa:** No hay validación de los datos recibidos (fecha, actividad, estado, etc.).

**Impacto:** Se pueden crear registros con datos inválidos.

**Solución:** Agregar validaciones usando `@Valid` y anotaciones de validación.

---

### 13. Inconsistencia en Nombres de Estados

**Ubicación:** Múltiples archivos

**Problema:** Se usan diferentes nombres para el mismo estado:
- "justificado" en frontend
- "justificacion" en backend ([`AsistenciaController.java:172`](backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java:172))

**Impacto:** Puede causar confusión y errores en el filtrado.

**Solución:** Estandarizar a un solo nombre (recomendado: "justificado").

---

### 14. Falta Manejo de Errores en Exportación

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:534-559`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:534-559)

**Problema:**
```typescript
const confirmarExportacion = () => {
  const fechaInicio = parseISO("2026-01-01")
  const fechaFin = new Date()
  
  // ❌ No hay manejo de errores
  if (previewTitulo.includes("Diario")) {
    const fechaMatch = previewTitulo.match(/(\d{4}-\d{2}-\d{2})/)
    const fecha = fechaMatch ? fechaMatch[1] : format(new Date(), 'yyyy-MM-dd')
    const actividad = previewData[0]?.actividad || 'analisis_partido'
    generateReporteDiario(previewData as any, arbitros as any, fecha, actividad)
  }
  // ...
}
```

**Causa:** No hay manejo de errores si falla la generación del reporte.

**Impacto:** Si falla la exportación, el usuario no recibe ningún mensaje de error.

**Solución:**
```typescript
const confirmarExportacion = async () => {
  try {
    const fechaInicio = parseISO("2026-01-01")
    const fechaFin = new Date()
    
    if (previewTitulo.includes("Diario")) {
      const fechaMatch = previewTitulo.match(/(\d{4}-\d{2}-\d{2})/)
      const fecha = fechaMatch ? fechaMatch[1] : format(new Date(), 'yyyy-MM-dd')
      const actividad = previewData[0]?.actividad || 'analisis_partido'
      await generateReporteDiario(previewData as any, arbitros as any, fecha, actividad)
    }
    // ...
    toast({ title: 'Exportación exitosa', description: 'El reporte se ha generado correctamente' })
  } catch (error) {
    console.error("Error exportando reporte:", error)
    toast({ title: 'Error en exportación', description: 'No se pudo generar el reporte', variant: 'destructive' })
  }
}
```

---

### 15. Falta Indicador Visual de Carga en Exportación

**Ubicación:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:534-559`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx:534-559)

**Problema:** No hay indicador visual de carga mientras se genera el reporte.

**Impacto:** El usuario no sabe si el sistema está procesando la exportación.

**Solución:** Agregar estado de carga y mostrar spinner mientras se genera el reporte.

---

## 📊 Resumen de Fallas por Severidad

| Severidad | Cantidad | Fallas |
|-----------|-----------|---------|
| 🔴 CRÍTICA | 5 | Filtrado por árbitro, Historial solo días obligatorios, Registro no permitido días no obligatorios, Typos en nombres de campos, Exportación usa datos incorrectos |
| 🟡 IMPORTANTE | 4 | Inconsistencia días obligatorios, Problemas zona horaria, Paginación datos incorrectos, Cálculo días faltantes incompleto |
| 🟢 MENOR | 6 | Archivo formateado incorrectamente, Validación fecha retraso, Falta validación datos, Inconsistencia nombres estados, Falta manejo errores, Falta indicador carga |

---

## 🎯 Plan de Corrección Prioritario

### Fase 1: Correcciones Críticas (Inmediato)
1. ✅ Corregir filtrado por árbitro para usar registros expandidos
2. ✅ Permitir mostrar todos los días en el historial (no solo obligatorios)
3. ✅ Permitir registro en cualquier día (no solo obligatorios)
4. ✅ Corregir todos los typos de `arbitrosId` y `arbitrId` a `arbitroId`
5. ✅ Corregir exportación para usar `registrosExpandidosFiltrados`

### Fase 2: Correcciones Importantes (Corto plazo)
1. ✅ Estandarizar definición de días obligatorios entre frontend y backend
2. ✅ Corregir problemas de zona horaria en fechas
3. ✅ Corregir paginación para usar registros expandidos filtrados
4. ✅ Corregir cálculo de días faltantes para incluir todos los registros

### Fase 3: Mejoras de Calidad (Mediano plazo)
1. ✅ Formatear archivo `horarios-asistencia.ts` correctamente
2. ✅ Agregar validación de fecha futura en registro con retraso
3. ✅ Agregar validación de datos en creación de asistencia
4. ✅ Estandarizar nombres de estados
5. ✅ Agregar manejo de errores en exportación
6. ✅ Agregar indicador visual de carga en exportación

---

## 📝 Notas Adicionales

1. **Consistencia de Datos:** Es crucial mantener la consistencia entre frontend y backend en la definición de días obligatorios y tipos de datos.

2. **Manejo de Errores:** Se debe agregar manejo de errores en todas las operaciones críticas para mejorar la experiencia del usuario.

3. **Validación de Datos:** Se debe agregar validación de datos en el backend para evitar registros inválidos.

4. **Testing:** Se recomienda implementar tests unitarios y de integración para verificar que estas fallas no se repitan en el futuro.

5. **Documentación:** Se debe mantener la documentación actualizada con las correcciones realizadas.

---

**© 2026 SIDAF-PUNO - Análisis de Fallas de Lógica - Módulo de Asistencia**
