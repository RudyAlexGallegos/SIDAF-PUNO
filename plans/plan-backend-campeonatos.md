# 📋 Plan: Actualización Backend Módulo Campeonatos

**Fecha:** 2026-03-28  
**Objetivo:** Asegurar que el backend funcione correctamente con los nuevos campos del formulario de campeonatos

---

## 🔍 Análisis del Problema

### Campos que envía el Frontend (nuevo formulario):
```typescript
{
  nombre: string
  categoria: string
  tipo: string
  estado: string
  fechaInicio: string
  fechaFin: string
  organizador: string
  contacto: string
  ciudad: string
  provincia: string
  direccion: string        // ⚠️ NUEVO - No existe en backend
  estadio: string          // ⚠️ NUEVO - No existe en backend
  horaInicio: string       // ⚠️ NUEVO - No existe en backend
  horaFin: string          // ⚠️ NUEVO - No existe en backend
  diasJuego: string        // ⚠️ NUEVO - No existe en backend
  equipos: number[]
}
```

### Campos actuales en Backend (Campeonato.java):
```java
- id, nombre, categoria, tipo
- fechaInicio, fechaFin, estado
- organizador, contacto, ciudad, provincia
- nivelDificultad, numeroEquipos, formato
- reglas, premios, observaciones, logo
- fechaCreacion, equipos
```

### Campos FALTANTES en Backend:
1. ❌ `direccion` (String)
2. ❌ `estadio` (String)
3. ❌ `horaInicio` (String)
4. ❌ `horaFin` (String)
5. ❌ `diasJuego` (String)

---

## ✅ Plan de Implementación

### Paso 1: Actualizar Modelo Campeonato.java
**Archivo:** `backend/src/main/java/com/sidaf/backend/model/Campeonato.java`

**Agregar los siguientes campos:**
```java
private String direccion;

private String estadio;

private String horaInicio;

private String horaFin;

private String diasJuego;
```

**Agregar Getters y Setters correspondientes**

---

### Paso 2: Actualizar Controller CampeonatoController.java
**Archivo:** `backend/src/main/java/com/sidaf/backend/controller/CampeonatoController.java`

**En el método `updateCampeonato`, agregar:**
```java
updatedCampeonato.setDireccion(campeonatoDetails.getDireccion());
updatedCampeonato.setEstadio(campeonatoDetails.getEstadio());
updatedCampeonato.setHoraInicio(campeonatoDetails.getHoraInicio());
updatedCampeonato.setHoraFin(campeonatoDetails.getHoraFin());
updatedCampeonato.setDiasJuego(campeonatoDetails.getDiasJuego());
```

---

### Paso 3: Crear Migración SQL (Opcional)
**Archivo:** `backend/migrations/016_add_campos_campeonato.sql`

```sql
-- Agregar nuevos campos a la tabla campeonatos
ALTER TABLE campeonatos 
ADD COLUMN IF NOT EXISTS direccion VARCHAR(255),
ADD COLUMN IF NOT EXISTS estadio VARCHAR(255),
ADD COLUMN IF NOT EXISTS hora_inicio VARCHAR(10),
ADD COLUMN IF NOT EXISTS hora_fin VARCHAR(10),
ADD COLUMN IF NOT EXISTS dias_juego VARCHAR(255);
```

**Nota:** Con `spring.jpa.hibernate.ddl-auto=update`, Hibernate agregará automáticamente las columnas.

---

### Paso 4: Verificar Frontend API Service
**Archivo:** `frontend/services/api.ts`

**Verificar que la interfaz Campeonato incluya:**
```typescript
export interface Campeonato {
  id?: number
  nombre: string
  categoria?: string
  tipo?: string
  fechaInicio?: string
  fechaFin?: string
  estado?: string
  organizador?: string
  contacto?: string
  ciudad?: string
  provincia?: string
  direccion?: string      // ⚠️ Verificar
  estadio?: string        // ⚠️ Verificar
  horaInicio?: string     // ⚠️ Verificar
  horaFin?: string        // ⚠️ Verificar
  diasJuego?: string      // ⚠️ Verificar
  equipos?: number[]
}
```

---

### Paso 5: Reiniciar Backend
```bash
cd backend
mvnw.cmd spring-boot:run
```

Hibernate detectará automáticamente los nuevos campos y agregará las columnas a la base de datos.

---

## 🧪 Pruebas

### Probar Creación de Campeonato:
1. Acceder a `http://localhost:3000/dashboard/campeonatos/nuevo`
2. Llenar todos los campos del formulario
3. Hacer clic en "Crear Campeonato"
4. Verificar que no hay errores en consola
5. Verificar que el campeonato se crea correctamente

### Probar Endpoints:
```bash
# GET todos los campeonatos
curl http://localhost:8083/api/campeonato

# POST crear campeonato
curl -X POST http://localhost:8083/api/campeonato \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Copa Puno 2026",
    "categoria": "Primera División",
    "tipo": "Liga",
    "estado": "PROGRAMADO",
    "fechaInicio": "2026-04-01",
    "fechaFin": "2026-06-30",
    "organizador": "CODAR Puno",
    "contacto": "+51 999 999 999",
    "ciudad": "Puno",
    "provincia": "Puno",
    "direccion": "Av. Principal 123",
    "estadio": "Estadio Municipal",
    "horaInicio": "15:00",
    "horaFin": "18:00",
    "diasJuego": "sabado,domingo"
  }'
```

---

## 📊 Resumen de Cambios

| Archivo | Acción | Estado |
|---------|--------|--------|
| `Campeonato.java` | Agregar 5 campos + getters/setters | ⏳ Pendiente |
| `CampeonatoController.java` | Actualizar método update | ⏳ Pendiente |
| `016_add_campos_campeonato.sql` | Crear migración (opcional) | ⏳ Pendiente |
| `api.ts` | Verificar interfaz Campeonato | ⏳ Pendiente |

---

## 🎯 Resultado Esperado

Después de implementar estos cambios:
- ✅ El formulario enviará todos los campos correctamente
- ✅ El backend guardará todos los campos en la base de datos
- ✅ No habrá errores de campos desconocidos
- ✅ Los campeonatos se crearán con toda la información completa

---

**© 2026 SIDAF-PUNO - Plan de Actualización Backend Campeonatos**
