# Plan: Coherencia de Datos en Historial de Asistencia

## Problema Principal
La información mostrada en el módulo de historial de asistencia no es coherente con los registros reales de asistencia. El ranking muestra datos incorrectos (ej: 31 días en lugar de los días filtrados).

## Análisis de Inconsistencias Identificadas

### 1. Inconsistencia de Nombres de Campos

| Ubicación | Campo Usado | Problema |
|-----------|-------------|----------|
| Línea 413 (registrosExpandidos) | `aribroId` | Typo - debería ser `aribitroid` |
| Línea 822 (ranking) | `r.aribroId ?? r.aritroId ?? r.arbitrId` | Múltiples typos |
| Línea 433 (filtered) | `a.arbitrId` | Campo no existe en tipo Asistencia |
| API (api.ts) | `idAribro`, `nombreAribro` | Inconsistencia en naming |
| Backend (Asistencia.java) | No tiene campo arbitroId | Los árbitros están en observaciones |

### 2. Problema de Parsing de Observaciones

```javascript
// La función parsearRegistros extrae árbitros del campo observaciones
const parsed = parsearRegistros(item) // Parses JSON from observaciones
// JSON contiene: { "aribitroid": "1", "estado": "presente", ... }
```

### 3. Problema en el Filtering

- `filtered` se filtra por `a.arbitrId` pero este campo no existe en el tipo Asistencia
- El filtro debería usar `a.actividad`, `a.fecha` pero no `a.arbitrId` para el caso general

### 4. Problema en el Ranking

- El ranking usa `registrosExpandidosFiltrados` pero los IDs no coinciden
- El campo `aribroId` tiene diferentes formatos (string vs number)

## Plan de Corrección

### Fase 1: Normalizar Nombres de Campos

1. **Crear función auxiliar** para obtener el ID del árbitro de forma consistente:
   ```javascript
   const getArbitroId = (record) => {
     return record.aribroId ?? record.aritroId ?? record.arbitrId ?? 
            record.idArabitRO ?? record.idArbitro ?? record.id ?? ''
   }
   ```

2. **Corregir línea 433** - el filtro por árbitro debería funcionar diferente

### Fase 2: Corregir el Flujo de Datos

1. **Verificar que `filtered` y `registrosExpandidos`** compartan la misma fuente de datos
2. **Asegurar que los IDs sean comparables** (normalizar a string)
3. **Verificar que el filtering de fechas sea correcto**

### Fase 3: Corregir el Ranking

1. **Usar los mismos registros que se muestran en la tabla**
2. **Verificar que el conteo sea correcto** - cada registro de árbitro cuenta como 1
3. **Corregir el cálculo de totales** - debe reflejar los días con registros

### Fase 4: Verificación

1. Agregar logs de debug para verificar:
   - Cantidad de registros en cada etapa
   - IDs que se están comparando
   - Estados que se están contando

## Tareas Específicas

- [ ] 1. Crear función `getArbitroIdNormalizado()` para normalizar IDs
- [ ] 2. Corregir el filtro de árbitros en `filtered` (línea 433)
- [ ] 3. Verificar que `registrosExpandidosFiltrados` tenga los registros correctos
- [ ] 4. Corregir el conteo en el ranking para que coincida con la tabla
- [ ] 5. Agregar información de debug visible en UI
- [ ] 6. Probar con datos reales

## Métricas de Éxito

- El ranking debe mostrar el mismo número de "días" que la tabla
- Los contadores (presentes, tardanzas, justificados) deben sumar al total correcto
- Los filtros (mes, actividad) deben aplicarse correctamente tanto a la tabla como al ranking
