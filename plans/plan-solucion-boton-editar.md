# 🎯 Plan de Solución - Botón EDITAR en Historial de Asistencia

**Fecha:** 2026-03-23  
**Archivo:** [`frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`](frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx)  
**Problema:** El botón EDITAR no cumple su función correctamente

---

## 📋 Resumen Ejecutivo

El botón EDITAR en el historial de asistencia presenta múltiples problemas que impiden su correcto funcionamiento:

1. **Datos inconsistentes** en el campo `observaciones` (nombres de campos corruptos)
2. **Lógica compleja y condicional** en la función de guardado
3. **Falta de validación y feedback** al usuario
4. **Inconsistencia en tipos de ID** (strings vs números)

Este plan propone soluciones concretas para cada problema, organizadas por prioridad y complejidad.

---

## 🎯 Objetivos

1. ✅ Normalizar los datos de `observaciones` en la base de datos
2. ✅ Simplificar la lógica de guardado de edición
3. ✅ Agregar validaciones y feedback al usuario
4. ✅ Normalizar tipos de ID en todo el sistema
5. ✅ Probar exhaustivamente el botón EDITAR

---

## 📊 Prioridades

| Prioridad | Tarea | Complejidad | Impacto |
|-----------|-------|-------------|----------|
| **P0 - Crítica** | Normalizar datos de observaciones | Alta | Alto |
| **P1 - Alta** | Simplificar lógica de handleGuardarEdicion | Media | Alto |
| **P2 - Media** | Agregar validaciones y feedback | Baja | Medio |
| **P3 - Baja** | Normalizar tipos de ID | Media | Bajo |

---

## 🚀 Plan de Acción

### Fase 1: Diagnóstico y Preparación

#### Tarea 1.1: Crear Script de Diagnóstico

**Objetivo:** Identificar registros con datos corruptos en `observaciones`

**Archivo a crear:** `scripts/diagnosticar-observaciones.js`

```javascript
// Script para diagnosticar datos corruptos en observaciones
// Ejecutar en la consola del navegador o en Node.js

async function diagnosticarObservaciones() {
  try {
    // Obtener todas las asistencias
    const asistencias = await getAsistencias()
    
    let registrosCorruptos = []
    let registrosValidos = []
    let registrosSinObservaciones = []
    
    asistencias.forEach(asistencia => {
      if (!asistencia.observaciones) {
        registrosSinObservaciones.push(asistencia.id)
        return
      }
      
      try {
        const parsed = JSON.parse(asistencia.observaciones)
        
        if (!Array.isArray(parsed)) {
          registrosCorruptos.push({
            id: asistencia.id,
            fecha: asistencia.fecha,
            error: 'No es un array',
            valor: asistencia.observaciones
          })
          return
        }
        
        // Verificar campos corruptos
        const tieneCamposCorruptos = parsed.some(reg => 
          reg.aribroId || reg.aritroId || !reg.arbitrId
        )
        
        if (tieneCamposCorruptos) {
          registrosCorruptos.push({
            id: asistencia.id,
            fecha: asistencia.fecha,
            error: 'Campos corruptos (aribroId/aritroId)',
            valor: asistencia.observaciones
          })
        } else {
          registrosValidos.push(asistencia.id)
        }
      } catch (e) {
        registrosCorruptos.push({
          id: asistencia.id,
          fecha: asistencia.fecha,
          error: 'JSON inválido',
          valor: asistencia.observaciones
        })
      }
    })
    
    console.log('=== DIAGNÓSTICO DE OBSERVACIONES ===')
    console.log(`Total de registros: ${asistencias.length}`)
    console.log(`Registros válidos: ${registrosValidos.length}`)
    console.log(`Registros sin observaciones: ${registrosSinObservaciones.length}`)
    console.log(`Registros corruptos: ${registrosCorruptos.length}`)
    console.log('\n=== REGISTROS CORRUPTOS ===')
    console.log(registrosCorruptos)
    
    return {
      total: asistencias.length,
      validos: registrosValidos.length,
      sinObservaciones: registrosSinObservaciones.length,
      corruptos: registrosCorruptos
    }
  } catch (error) {
    console.error('Error ejecutando diagnóstico:', error)
  }
}

// Ejecutar diagnóstico
diagnosticarObservaciones()
```

**Acción:** Ejecutar este script en la consola del navegador para identificar registros corruptos.

---

#### Tarea 1.2: Crear Script de Normalización

**Objetivo:** Corregir automáticamente los datos corruptos en `observaciones`

**Archivo a crear:** `scripts/normalizar-observaciones.js`

```javascript
// Script para normalizar datos corruptos en observaciones
// Ejecutar en la consola del navegador

async function normalizarObservaciones() {
  try {
    const asistencias = await getAsistencias()
    let corregidos = []
    let errores = []
    
    for (const asistencia of asistencias) {
      if (!asistencia.observaciones) {
        continue
      }
      
      try {
        const parsed = JSON.parse(asistencia.observaciones)
        
        if (!Array.isArray(parsed)) {
          continue
        }
        
        // Verificar si necesita corrección
        const necesitaCorreccion = parsed.some(reg => 
          reg.aribroId || reg.aritroId
        )
        
        if (!necesitaCorreccion) {
          continue
        }
        
        // Normalizar campos
        const normalizados = parsed.map(reg => ({
          arbitrId: reg.arbitrId || reg.aribroId || reg.aritroId || reg.arbitroId || reg.id,
          estado: reg.estado || 'ausente',
          horaRegistro: reg.horaRegistro || '',
          observaciones: reg.observaciones || ''
        }))
        
        // Actualizar registro
        await updateAsistencia(asistencia.id, {
          ...asistencia,
          observaciones: JSON.stringify(normalizados)
        })
        
        corregidos.push({
          id: asistencia.id,
          fecha: asistencia.fecha
        })
        
      } catch (e) {
        errores.push({
          id: asistencia.id,
          error: e.message
        })
      }
    }
    
    console.log('=== NORMALIZACIÓN COMPLETADA ===')
    console.log(`Registros corregidos: ${corregidos.length}`)
    console.log(`Errores: ${errores.length}`)
    console.log('\n=== REGISTROS CORREGIDOS ===')
    console.log(corregidos)
    
    if (errores.length > 0) {
      console.log('\n=== ERRORES ===')
      console.log(errores)
    }
    
    return {
      corregidos: corregidos.length,
      errores: errores.length,
      detalles: { corregidos, errores }
    }
  } catch (error) {
    console.error('Error ejecutando normalización:', error)
  }
}

// Ejecutar normalización
normalizarObservaciones()
```

**Acción:** Ejecutar este script en la consola del navegador para corregir registros corruptos.

---

### Fase 2: Refactorización del Código

#### Tarea 2.1: Simplificar `handleGuardarEdicion`

**Objetivo:** Eliminar lógica condicional compleja y hacer el código más predecible.

**Archivo a modificar:** `frontend/app/(dashboard)/dashboard/asistencia/historial/page.tsx`

**Código actual (líneas 315-388):**
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

**Código propuesto:**
```tsx
const handleGuardarEdicion = async () => {
  if (!registroEditando) {
    console.error('No hay registro para guardar')
    return
  }
  
  setEditLoading(true)
  
  try {
    // CASO 1: Nuevo registro (subsanar)
    if (!registroEditando.id) {
      console.log('Creando nuevo registro para:', registroEditando.fecha)
      
      // Normalizar datos de árbitros
      const normalizedArbitros = arbitrosEditando.map((arb: any) => ({
        arbitrId: arb.arbitrId,
        estado: arb.estado || 'ausente',
        horaRegistro: arb.horaRegistro || '',
        observaciones: arb.observaciones || ''
      }))
      
      await createAsistencia({
        fecha: registroEditando.fecha,
        actividad: registroEditando.actividad || getActividadPorDia(registroEditando.fecha),
        estado: 'ausente',
        observaciones: JSON.stringify(normalizedArbitros)
      })
      
      console.log('✅ Nuevo registro creado exitosamente')
    }
    // CASO 2: Actualizar registro existente
    else {
      console.log('Actualizando registro ID:', registroEditando.id)
      
      // Normalizar datos de árbitros
      const normalizedArbitros = arbitrosEditando.map((arb: any) => ({
        arbitrId: arb.arbitrId,
        estado: arb.estado || 'ausente',
        horaRegistro: arb.horaRegistro || '',
        observaciones: arb.observaciones || ''
      }))
      
      await updateAsistencia(Number(registroEditando.id), {
        ...registroEditando,
        observaciones: JSON.stringify(normalizedArbitros)
      })
      
      console.log('✅ Registro actualizado exitosamente')
    }
    
    // Recargar datos
    const [asistenciasData] = await Promise.all([getAsistencias()])
    setAsistencias(asistenciasData)
    
    // Cerrar modal solo si todo fue exitoso
    setEditModalOpen(false)
    
    // Mostrar notificación de éxito (opcional)
    alert('✅ Cambios guardados exitosamente')
    
  } catch (error) {
    console.error('❌ Error guardando edición:', error)
    
    // Mostrar error al usuario
    alert('❌ Error al guardar cambios. Por favor, intente nuevamente.')
    
    // NO cerrar el modal si hubo error
  } finally {
    setEditLoading(false)
  }
}
```

**Mejoras:**
1. ✅ Eliminadas ramas condicionales complejas
2. ✅ Lógica simplificada a 2 casos principales
3. ✅ Normalización consistente de datos
4. ✅ Feedback al usuario con alertas
5. ✅ Modal no se cierra si hay error
6. ✅ Logs más detallados para debugging

---

#### Tarea 2.2: Mejorar `abrirEditar` con Validaciones

**Objetivo:** Agregar validaciones y manejo robusto de errores.

**Código propuesto:**
```tsx
const abrirEditar = (registro: any) => {
  console.log('📝 Abriendo edición para registro:', registro)
  
  setRegistroEditando(registro)
  setEditEstado(registro.estadoItem || registro.estado || "")
  setEditObservaciones(registro.observaciones || "")
  
  // Cargar todos los árbitros del día desde observaciones
  try {
    // Validar que observaciones exista y sea un string
    if (!registro.observaciones || typeof registro.observaciones !== 'string') {
      console.warn('⚠️ Observaciones no válidas:', registro.observaciones)
      setArbitrosEditando([])
      setEditModalOpen(true)
      return
    }
    
    // Parsear JSON
    const registros = JSON.parse(registro.observaciones)
    
    // Validar que sea un array
    if (!Array.isArray(registros)) {
      console.warn('⚠️ Observaciones no es un array:', registros)
      setArbitrosEditando([])
      setEditModalOpen(true)
      return
    }
    
    // Validar que el array no esté vacío
    if (registros.length === 0) {
      console.warn('⚠️ Array de registros vacío')
      setArbitrosEditando([])
      setEditModalOpen(true)
      return
    }
    
    // Mapear cada registro con el nombre del árbitro
    const arbitradoresConNombre = registros.map((reg: any) => {
      // Normalizar ID del árbitro
      const arbitrId = reg.arbitrId ?? reg.aribroId ?? reg.aritroId ?? reg.arbitroId ?? reg.id
      
      if (!arbitrId) {
        console.warn('⚠️ Registro sin ID de árbitro:', reg)
        return null
      }
      
      // Buscar el árbitro en la lista
      const arbitro = arbitros.find(a =>
        String(a.id) === String(arbitrId) ||
        Number(a.id) === Number(arbitrId)
      )
      
      if (!arbitro) {
        console.warn('⚠️ Árbitro no encontrado:', arbitrId)
      }
      
      const nombreMostrar = arbitro
        ? `${arbitro.nombre || ""} ${arbitro.apellido || ""}`.trim()
        : (arbitrId ? `Árbitro ${arbitrId}` : "Sin asignar")
      
      return {
        ...reg,
        arbitrId: arbitrId,
        nombreArbitro: nombreMostrar
      }
    }).filter(Boolean) // Eliminar registros null
    
    console.log(`✅ ${arbitradoresConNombre.length} árbitros cargados para edición`)
    setArbitrosEditando(arbitradoresConNombre)
    
  } catch (e) {
    console.error('❌ Error parseando registros:', e)
    setArbitrosEditando([])
  }
  
  setEditModalOpen(true)
}
```

**Mejoras:**
1. ✅ Validaciones robustas de datos
2. ✅ Normalización de IDs
3. ✅ Logs detallados para debugging
4. ✅ Manejo de errores con warnings
5. ✅ Filtro de registros inválidos

---

### Fase 3: Mejoras de UX

#### Tarea 3.1: Agregar Notificaciones Visuales

**Objetivo:** Proporcionar feedback claro al usuario sobre el estado de las operaciones.

**Implementación:**
1. Agregar un sistema de toast/notificaciones
2. Mostrar notificación de éxito cuando se guarda
3. Mostrar notificación de error cuando falla
4. Mostrar notificación de carga mientras se guarda

**Ejemplo:**
```tsx
// Agregar al inicio del componente
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// En handleGuardarEdicion:
try {
  // ... lógica de guardado ...
  
  toast({
    title: "✅ Éxito",
    description: "Los cambios se guardaron correctamente",
    variant: "default"
  })
  
} catch (error) {
  toast({
    title: "❌ Error",
    description: "No se pudieron guardar los cambios. Por favor, intente nuevamente.",
    variant: "destructive"
  })
}
```

---

#### Tarea 3.2: Agregar Indicadores de Carga

**Objetivo:** Mostrar al usuario que una operación está en progreso.

**Implementación:**
1. Mostrar spinner en el botón de guardar
2. Deshabilitar botones mientras se guarda
3. Mostrar overlay de carga en el modal

**Ejemplo:**
```tsx
<Button 
  onClick={handleGuardarEdicion} 
  disabled={editLoading}
  className="bg-sky-600 hover:bg-sky-700"
>
  {editLoading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Guardando...
    </>
  ) : (
    <>
      <Pencil className="w-4 h-4 mr-2" />
      Guardar Cambios
    </>
  )}
</Button>
```

---

### Fase 4: Normalización de IDs

#### Tarea 4.1: Estandarizar Tipo de ID

**Objetivo:** Decidir y aplicar un tipo consistente para IDs en todo el sistema.

**Decisión:** Usar **strings** para todos los IDs (más flexible y menos propenso a errores de comparación).

**Acciones:**
1. Actualizar todas las comparaciones de ID para usar strings
2. Actualizar todas las funciones que reciben IDs para aceptar strings
3. Actualizar el tipo TypeScript para usar `string` en lugar de `number | string`

**Ejemplo:**
```tsx
// Antes
const arb = arbitros.find(a => 
  String(a.id) === idStr || 
  a.id?.toString() === idStr ||
  Number(a.id) === Number(idStr)
)

// Después
const arb = arbitros.find(a => String(a.id) === idStr)
```

---

### Fase 5: Pruebas

#### Tarea 5.1: Pruebas Manuales

**Escenarios a probar:**

1. **Editar registro existente con árbitros válidos**
   - Abrir modal de edición
   - Cambiar estado de algunos árbitros
   - Guardar cambios
   - Verificar que se guardaron correctamente

2. **Editar registro con datos corruptos**
   - Abrir modal de edición
   - Verificar que se manejen los errores correctamente
   - Verificar que el usuario reciba feedback

3. **Crear nuevo registro (subsanar)**
   - Hacer clic en "Subsanar" para un día sin registro
   - Marcar asistencia de árbitros
   - Guardar cambios
   - Verificar que se creó el registro

4. **Editar registro y cancelar**
   - Abrir modal de edición
   - Hacer cambios
   - Cancelar
   - Verificar que no se guardaron los cambios

5. **Editar registro con error de red**
   - Simular error de red (desconectar internet)
   - Intentar guardar
   - Verificar que se muestre error al usuario
   - Verificar que el modal no se cierre

---

#### Tarea 5.2: Pruebas Automatizadas (Opcional)

**Crear tests unitarios para:**
1. `abrirEditar` - validar que carga correctamente los datos
2. `handleGuardarEdicion` - validar que guarda correctamente
3. Normalización de datos - validar que corrige campos corruptos

---

## 📅 Cronograma

| Fase | Tareas | Tiempo Estimado |
|-------|---------|-----------------|
| **Fase 1: Diagnóstico** | 1.1, 1.2 | 1-2 horas |
| **Fase 2: Refactorización** | 2.1, 2.2 | 2-3 horas |
| **Fase 3: Mejoras UX** | 3.1, 3.2 | 1-2 horas |
| **Fase 4: Normalización** | 4.1 | 1-2 horas |
| **Fase 5: Pruebas** | 5.1, 5.2 | 2-3 horas |
| **Total** | | **7-12 horas** |

---

## 🎯 Criterios de Éxito

El botón EDITAR se considerará funcionando correctamente cuando:

1. ✅ Puede abrir el modal de edición sin errores
2. ✅ Carga correctamente los datos de los árbitros
3. ✅ Permite cambiar el estado de los árbitros
4. ✅ Guarda los cambios correctamente en la base de datos
5. ✅ Muestra feedback claro al usuario (éxito/error)
6. ✅ Maneja errores de forma robusta sin romper la aplicación
7. ✅ Funciona tanto para editar registros existentes como para crear nuevos (subsanar)

---

## 📝 Notas Adicionales

1. **Backup de Datos:** Antes de ejecutar el script de normalización, hacer un backup de la base de datos.

2. **Testing en Staging:** Probar todos los cambios en un ambiente de staging antes de aplicar a producción.

3. **Documentación:** Actualizar la documentación del sistema después de los cambios.

4. **Monitoreo:** Monitorear el uso del botón EDITAR después de los cambios para detectar problemas.

---

**© 2025 SIDAF-PUNO - Plan de Solución**
