# Plan: Módulo de Asistencias Mejorado

## Objetivo
Implementar un sistema de registro de asistencia para actividades programadas de CODAR Puno con reportes claros y exportación PDF.

## Actividades Predefinidas

| Actividad | Día(s) | Hora |
|-----------|--------|------|
| Análisis de Partidos | Lunes | 18:00 |
| Preparación Física | Martes, Jueves, Sábado | 05:00 |
| Reunión Ordinaria | Viernes | 19:00 |
| Reunión Extraordinaria | Definido por usuario | Definido por usuario |

## Estructura de Datos

### Backend - Modelo Asistencia (existente)
- `id`: Long
- `fecha`: LocalDate
- `hora_entrada`: LocalDateTime
- `hora_salida`: LocalDateTime
- `actividad`: String (analisis_partido, preparacion_fisica, reunion_ordinaria, reunion_extraordinaria)
- `evento`: String
- `estado`: String (presente, ausente, tardanza, justificacion)
- `observaciones`: Text
- `responsable_id`: Long
- `responsable`: String
- `created_at`: LocalDateTime

### Nuevo: Endpoints de Reporte
- `GET /api/asistencias/reporte/semanal?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD`
- `GET /api/asistencias/reporte/mensual?año=YYYY&mes=MM`
- `GET /api/asistencias/reporte/anual?año=YYYY`

## Frontend - Componentes

### 1. Selector de Actividad Mejorado
- Mostrar actividades predefinidas con día y hora
- Opción para reunión extraordinaria con fecha/hora personalizada

### 2. Página de Reportes
- Selector de tipo: Semanal / Mensual / Anual
- Filtros por actividad
- Tabla clara con:
  - Árbitro
  - Presentes (✓)
  - Ausentes (✗)
  - Tardanzas
  - Justificaciones
  - % Asistencia
- Gráficos de asistencia

### 3. Exportación PDF
- Encabezado con logo CODAR y título
- Período del reporte
- Tabla de asistencia por actividad
- Resumen de estadísticas
- Firma del responsable

## Implementación

### Paso 1: Actualizar Backend
- [ ] Agregar métodos de reporte en AsistenciaRepository
- [ ] Agregar endpoints de reporte en AsistenciaController

### Paso 2: Actualizar Frontend
- [ ] Mejorar selector de actividad
- [ ] Crear página de reportes clara
- [ ] Implementar exportación PDF con jspdf

### Paso 3: Estilos
- Colores profesionales (azul CODAR)
- Tablas con bordes claros
- Texto legible
- Gráficos de barras para % asistencia
