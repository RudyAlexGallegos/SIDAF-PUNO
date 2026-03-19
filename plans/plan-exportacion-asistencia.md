# Plan de Mejora: Exportación de Información de Asistencia

## 🚨 PROBLEMA URGENTE: Reportes muestran "Árbol X" en lugar de nombres reales

El usuario reportó este error en el PDF generado:
```
Árbitro 2 2026- Ausente -
Árbitro 3 2026- Presente -
```

**Problemas identificados:**
1. Los nombres de árbitros no se muestran - aparece "Árbol X"
2. Las horas no aparecen correctamente - muestra "2026-"

## 📊 Diagnóstico

### Causa del problema de nombres:
- En [`historial/page.tsx:116`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx), la función `getNombreArbitr` busca en la lista de árbitros usando el ID
- Si el ID no coincide (tipo de dato diferente), devuelve `Árbol ${id}`
- **Posible causa:** La lista de árbitros no se está cargando correctamente en el historial

### Causa del problema de horas:
- En [`useRegistroAsistencia.ts:130-131`](frontend/hooks/asistencia/useRegistroAsistencia.ts), la hora se guarda como `horaInicio` y `horaFin`
- En el PDF, se lee `horaEntrada` que puede tener formato diferente
- **Posible causa:** El campo `horaEntrada` está vacío o tiene formato incorrecto
