# 🔍 Análisis del Problema - Botón EDITAR en Historial de Asistencia

**Fecha:** 2026-03-23  
**Archivo:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx)  
**Problema:** El botón EDITAR no cumple su función correctamente

---

## 📋 Descripción del Problema

El usuario reporta que el botón EDITAR en el módulo de asistencia - historial de asistencia no funciona correctamente y requiere "acciones drásticas" para que funcione.

---

## 🔍 Análisis del Código

### Ubicación del Botón EDITAR

**Líneas 1127-1138:**

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    console.log('✅ Botón Editar clickeado - item.registro:', item.registro)
    abrirEditar(item.registro)
  }}
  className="border-sky-300 text-sky-600 hover:bg-sky-50"
>
  <Pencil className="w-3 h-3 mr-1" />
  Editar
</Button>
```

### Función `abrirEditar`

**Líneas 260-305:**

```tsx
const abrirEditar = (registro: any) => {
  setRegistroEditando(registro)
  setEditEstado(registro.estadoItem || registro.estado || "")
  setEditObservaciones(registro.observaciones || "")
  
  // Cargar todos los arbitros del dia desde observaciones
  try {
    if (registro.observaciones && typeof registro.observaciones === 'string') {
      const registros = JSON.parse(registro.observaciones)
      
      if (Array.isArray(registros) && registros.length > 0) {
        // Mapear cada registro con el nombre del arbitro
        const arbitradoresConNombre = registros.map((reg: any) => {
          // Buscar el ID - puede ser arbitrId, arborId, o id
          const arbitrId = reg.arbitrId ?? reg.arborId ?? reg.id ?? reg.arbitroId
          
          // Buscar el arbitro en la lista
          const arbitro = arbitros.find(a =>
            String(a.id) === String(arbitrId) ||
            a.id === Number(arbitrId)
          )
          
          const nombreMostrar = arbitro
            ? `${arbitro.nombre || ""} ${arbitro.apellido || ""}`.trim()
            : (arbitrId ? `Arbitro ${arbitrId}` : "Sin asignar")
          
          return {
            ...reg,
            arbitrId: arbitrId,
            nombreArbitro: nombreMostrar
          }
        })
        setArbitrosEditando(arbitradoresConNombre)
      } else {
        setArbitrosEditando([])
      }
    } else {
      setArbitrosEditando([])
    }
  } catch (e) {
    console.warn("Error parseando registros:", e)
    setArbitrosEditando([])
  }
  
  setEditModalOpen(true)
}
```

### Función `handleGuardarEdicion`

**Líneas 315-388:**

```tsx
const handleGuardarEdicion = async () => {
  if (!registroEditando) return
  
  setEditLoading(true)
  try {
    // Es un nuevo registro (subsanar)
    if (!registroEditando.id) {
      await createAsistencia({
        fecha: registroEditando.fecha,
        actividad: registroEditando.actividad || getActividadPorDia(registroEditando.fecha),
        estado: 'ausente',
        observaciones: '[]'
      })
      // Recargar datos
      const [asistenciasData] = await Promise.all([getAsistencias()])
      setAsistencias(asistenciasData)
      setEditModalOpen(false)
      return
    }
    
    // Es una actualización de registro existente
    if (arbitrosEditando.length > 0) {
      // Actualizar todos los árbitros
      const updatedRegistros = arbitrosEditando.map((arb: any) => ({
        arbitrId: arb.arbitrId,
        estado: arb.estado,
        horaRegistro: arb.horaRegistro,
        observaciones: arb.observaciones || ""
      }))
      
      await updateAsistencia(Number(registroEditando.id), {
        ...registroEditando,
        observaciones: JSON.stringify(updatedRegistros)
      })
    } else if (registroEditando.arbitrId) {
      // Es un registro individual, actualizar en observaciones
      const asistenciaOriginal = await getAsistencias()
      const asistencia = asistenciaOriginal.find((a: any) => a.id === Number(registroEditando.id))
      if (asistencia && asistencia.observaciones) {
        try {
          const registros = JSON.parse(asistencia.observaciones)
          const updatedRegistros = registros.map((reg: any) => {
            if (reg.arbitrId === registroEditando.arbitrId) {
              return { ...reg, estado: editEstado, observaciones: editObservaciones }
            }
            return reg
          })
          await updateAsistencia(Number(asistencia.id), {
            ...asistencia,
            observaciones: JSON.stringify(updatedRegistros)
          })
        } catch (e) {
          console.error("Error parseando registros:", e)
        }
      }
    } else {
      // Es un registro general
      await updateAsistencia(Number(registroEditando.id), {
        ...registroEditando,
        estado: editEstado,
        observaciones: editObservaciones
      })
    }
    
    // Recargar datos
    const [asistenciasData] = await Promise.all([getAsistencias()])
    setAsistencias(asistenciasData)
    setEditModalOpen(false)
  } catch (error) {
    console.error("Error guardando edición:", error)
  } finally {
    setEditLoading(false)
  }
}
```

---

## 🚨 Problemas Identificados

### Problema 1: Inconsistencia en Nombres de Campos

**Ubicación:** Línea 908 en `registrosExpandidos`

```tsx
const arbitroIdValue = r.aribroId ?? r.aritroId ?? r.arbitrId
```

**Problema:** El código busca campos con nombres inconsistentes:
- `aribroId` (con 'o' en lugar de 'i')
- `aritroId` (con 'i' en lugar de 'b')
- `arbitrId` (correcto)

Esto sugiere que hay datos corruptos o inconsistentes en la base de datos.

---

### Problema 2: Lógica Compleja y Condicional en `handleGuardarEdicion`

**Ubicación:** Líneas 321-377

**Problema:** La función tiene múltiples ramas condicionales que pueden causar comportamiento impredecible:

1. **Rama 1 (líneas 321-333):** Nuevo registro (subsanar)
   - Solo se ejecuta si `!registroEditando.id`
   - Crea un nuevo registro con `observaciones: '[]'` (array vacío)
   - **Problema:** No guarda los árbitros que se están editando

2. **Rama 2 (líneas 336-348):** Actualización con múltiples árbitros
   - Se ejecuta si `arbitrosEditando.length > 0`
   - Guarda todos los árbitros en `observaciones`
   - **Problema:** Puede que no se esté ejecutando correctamente

3. **Rama 3 (líneas 349-369):** Registro individual
   - Se ejecuta si `registroEditando.arbitrId` existe
   - Actualiza solo un árbitro en el array de `observaciones`
   - **Problema:** Lógica compleja que puede fallar

4. **Rama 4 (líneas 371-377):** Registro general
   - Se ejecuta si ninguna de las condiciones anteriores se cumple
   - Actualiza el registro general
   - **Problema:** Puede que no sea el caso de uso principal

---

### Problema 3: Falta de Validación de Datos

**Ubicación:** Líneas 266-302 en `abrirEditar`

**Problema:** No hay validación de que los datos de `observaciones` sean válidos antes de parsear:

```tsx
if (registro.observaciones && typeof registro.observaciones === 'string') {
  const registros = JSON.parse(registro.observaciones)
  // ...
}
```

Si `observaciones` contiene JSON malformado, el `try-catch` capturará el error pero establecerá `arbitrosEditando` como un array vacío, lo que puede causar confusión.

---

### Problema 4: Inconsistencia en Tipos de ID

**Ubicación:** Líneas 160-164 en `getNombreArbitro`

```tsx
const arb = arbitros.find(a => 
  String(a.id) === idStr || 
  a.id?.toString() === idStr ||
  Number(a.id) === Number(idStr)
)
```

**Problema:** El código intenta manejar IDs como strings y números, lo que indica inconsistencia en los datos. Esto puede causar problemas de comparación y búsqueda.

---

### Problema 5: Falta de Feedback al Usuario

**Ubicación:** Líneas 383-387 en `handleGuardarEdicion`

```tsx
} catch (error) {
  console.error("Error guardando edición:", error)
} finally {
  setEditLoading(false)
}
```

**Problema:** Si ocurre un error, solo se loguea en la consola pero el usuario no recibe ninguna notificación visual. El modal permanece abierto y el usuario no sabe qué salió mal.

---

### Problema 6: Modal No Se Cierra Correctamente

**Ubicación:** Línea 381

```tsx
setEditModalOpen(false)
```

**Problema:** Esta línea está dentro del bloque `try`, pero si ocurre un error antes de llegar a esta línea, el modal no se cierra y el usuario queda en un estado inconsistente.

---

## 🎯 Causas Raíz Probables

### Causa 1: Datos Corruptos en `observaciones`

Los campos `aribroId` y `aritroId` sugieren que hay datos corruptos o inconsistentes en la base de datos. Esto puede causar que:

1. La función `abrirEditar` no encuentre los árbitros correctamente
2. La función `handleGuardarEdicion` no guarde los datos correctamente
3. El modal se abra con datos incompletos o incorrectos

### Causa 2: Lógica Condicional Compleja

La función `handleGuardarEdicion` tiene múltiples ramas condicionales que pueden causar comportamiento impredecible. Si las condiciones no se evalúan correctamente, la función puede no ejecutar la acción esperada.

### Causa 3: Falta de Manejo de Errores

No hay validación de datos ni feedback al usuario cuando ocurren errores. Esto puede causar que el usuario no sepa qué está mal y cómo solucionarlo.

---

## 💡 Soluciones Propuestas

### Solución 1: Normalizar Datos de `observaciones`

**Acción:** Crear un script para normalizar los datos de `observaciones` en la base de datos:

1. Buscar todos los registros con `observaciones` malformados
2. Corregir los nombres de campos (`aribroId` → `arbitrId`, `aritroId` → `arbitrId`)
3. Validar que el JSON sea válido
4. Actualizar los registros corregidos

### Solución 2: Simplificar Lógica de `handleGuardarEdicion`

**Acción:** Refactorizar la función `handleGuardarEdicion` para:

1. Eliminar ramas condicionales complejas
2. Usar una lógica más simple y predecible
3. Agregar validaciones claras
4. Proporcionar feedback al usuario

### Solución 3: Agregar Validación y Feedback

**Acción:** Mejorar la experiencia del usuario:

1. Validar datos antes de parsear JSON
2. Mostrar mensajes de error claros al usuario
3. Cerrar el modal solo si la operación fue exitosa
4. Mostrar notificaciones de éxito/error

### Solución 4: Normalizar Tipos de ID

**Acción:** Estandarizar el tipo de ID en todo el sistema:

1. Decidir si usar strings o números para IDs
2. Actualizar todo el código para usar el tipo consistente
3. Agregar validaciones para asegurar consistencia

---

## 📊 Impacto del Problema

### Impacto en el Usuario

- **Alto:** El usuario no puede editar registros de asistencia correctamente
- **Medio:** El usuario puede perder datos si intenta editar
- **Bajo:** El usuario puede frustrarse por la falta de feedback

### Impacto en el Sistema

- **Alto:** Datos inconsistentes en la base de datos
- **Medio:** Código difícil de mantener debido a lógica compleja
- **Bajo:** Rendimiento afectado por múltiples condiciones

---

## 🚀 Próximos Pasos

1. **Crear script de normalización de datos** para corregir `observaciones`
2. **Refactorizar `handleGuardarEdicion`** para simplificar la lógica
3. **Agregar validaciones y feedback** al usuario
4. **Normalizar tipos de ID** en todo el sistema
5. **Probar exhaustivamente** el botón EDITAR después de los cambios

---

**© 2025 SIDAF-PUNO - Análisis de Problemas**
