# Documentación - Endpoints API para Designaciones

## Descripción General
Este documento describe los endpoints de API necesarios para el módulo de designaciones de árbitros.

---

## 1. CAMPEONATOS

### ✅ GET `/api/campeonato`
- **Descripción**: Obtiene lista de todos los campeonatos
- **Parámetros**: Ninguno
- **Respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "Copa Perú 2026",
    "categoria": "Profesional",
    "tipo": "Torneo",
    "estado": "activo",
    "fechaInicio": "2026-04-01",
    "fechaFin": "2026-12-31",
    "numeroEquipos": 16,
    "numeroArbitrosRequeridos": 48,
    "organizador": "FPF"
  }
]
```

---

## 2. ÁRBITROS

### ✅ GET `/api/arbitros`
- **Descripción**: Obtiene lista de árbitros disponibles
- **Parámetros**: 
  - `disponible` (opcional): true/false
  - `categoria` (opcional): FIFA, Nacional, Regional
- **Respuesta**:
```json
[
  {
    "id": 101,
    "nombres": "Juan",
    "apellidoPaterno": "Pérez",
    "dni": "12345678",
    "categoria": "nacional",
    "provincia": "Puno",
    "disponible": true,
    "experiencia": 10
  }
]
```

### ✅ GET `/api/arbitros/{id}`
- **Descripción**: Obtiene detalles de un árbitro específico
- **Parámetros**: `id` (número)
- **Respuesta**: Objeto Arbitro

---

## 3. EQUIPOS

### ✅ GET `/api/equipos`
- **Descripción**: Obtiene lista de equipos
- **Respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "UDT Femenino",
    "provincia": "Puno",
    "estadio": "Enrique Torres Beltrán"
  }
]
```

---

## 4. PARTIDOS (A IMPLEMENTAR)

### 📝 GET `/api/campeonato/{campeonatoId}/partidos`
- **Descripción**: Obtiene partidos de un campeonato
- **Parámetros**:
  - `campeonatoId`: ID del campeonato
  - `filtro` (opcional): "proximos", "hoy", "semana"
- **Respuesta esperada**:
```json
[
  {
    "id": "p_001",
    "equipoLocal": "UDT Femenino",
    "equipoVisitante": "Municipal Juliaca",
    "fecha": "2026-04-10",
    "hora": "14:30",
    "estadio": "Estadio Enrique Torres Beltrán",
    "modalidad": "Femenino",
    "equipoLocalId": 1,
    "equipoVisitanteId": 2
  }
]
```

---

## 5. DESIGNACIONES

### ✅ POST `/api/designaciones`
- **Descripción**: Crea una nueva designación
- **Método**: POST
- **Body**:
```json
{
  "idCampeonato": 1,
  "nombreCampeonato": "Copa Perú 2026",
  "arbitroPrincipal": 101,
  "arbitroAsistente1": 102,
  "arbitroAsistente2": 103,
  "cuartoArbitro": 104,
  "fecha": "2026-04-10",
  "hora": "14:30",
  "estadio": "Estadio Enrique Torres Beltrán"
}
```
- **Respuesta**: Designacion creada con ID

### ✅ GET `/api/designaciones`
- **Descripción**: Obtiene lista de designaciones
- **Respuesta**: Array de Designaciones

### ✅ PUT `/api/designaciones/{id}`
- **Descripción**: Actualiza una designación existente
- **Body**: Objeto Designacion actualizado

### ✅ DELETE `/api/designaciones/{id}`
- **Descripción**: Elimina una designación

---

## 6. ASIGNACIÓN AUTOMÁTICA (A IMPLEMENTAR)

### 📝 POST `/api/designaciones/auto-asignar`
- **Descripción**: Asigna árbitros automáticamente
- **Parámetros**:
  - `campeonatoId`: ID del campeonato
  - `partidoId`: ID del partido (opcional)
  - `criterios` (opcional): "categoria", "cercania", "disponibilidad"
- **Respuesta esperada**:
```json
{
  "arbitroPrincipal": 101,
  "arbitroAsistente1": 102,
  "arbitroAsistente2": 103,
  "cuartoArbitro": 104,
  "razonamiento": "Seleccionados por categoría y disponibilidad"
}
```

---

## Notas de Implementación

### Backend (Spring Boot)
1. Crear endpoint `/api/campeonato/{campeonatoId}/partidos`
2. Implementar lógica de asignación automática
3. Validar disponibilidad de árbitros
4. Registrar auditoría de designaciones

### Frontend (Next.js)
1. ✅ Page.tsx - Flujo principal con steps
2. ✅ CampeonatoSelector.tsx - Selección de campeonato
3. ✅ PartidoSelector.tsx - Selección de partido
4. ✅ ArbitroDesignador.tsx - Asignación de árbitros
5. ✅ DesignacionPreview.tsx - Preview y confirmación

---

## Estados de Designación
- `programada`: Designación realizada, pendiente del partido
- `en_curso`: El partido está en progreso
- `finalizada`: El partido ha terminado
- `cancelada`: La designación fue cancelada

---

## Criterios para Asignación Automática
1. **Categoría**: Priorizar árbitros de mayor categoría
2. **Proximidad**: Preferir árbitros cercanos al estadio
3. **Disponibilidad**: Confirmar que el árbitro esté disponible
4. **Experiencia**: Considerar historial de asistencias
5. **Balance**: No sobrecargar a los mismos árbitros

---

Última actualización: 08/04/2026
