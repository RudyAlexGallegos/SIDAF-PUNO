# Scripts de Diagnóstico, Normalización y Corrección

Este directorio contiene scripts para diagnosticar, normalizar y corregir datos en el campo `observaciones` de la tabla de asistencia.

## 📋 Scripts Disponibles

### 1. diagnosticar-observaciones.js

**Propósito:** Identificar registros con datos corruptos en el campo `observaciones`.

**Uso:**
1. Abre la página de historial de asistencia en tu navegador
2. Presiona F12 para abrir las herramientas de desarrollador
3. Ve a la pestaña "Console"
4. Copia todo el contenido de `diagnosticar-observaciones.js`
5. Pégalo en la consola y presiona Enter

**Salida:**
- Total de registros
- Registros válidos
- Registros sin observaciones
- Registros que no son arrays
- Registros con JSON inválido
- Registros con campos corruptos (aribroId, aritroId)

**Nota:** Este script es de solo lectura y no modifica ningún dato.

---

### 2. normalizar-observaciones.js

**Propósito:** Corregir automáticamente los datos corruptos en el campo `observaciones`.

**Uso:**
1. **IMPORTANTE:** Haz un backup de tu base de datos antes de ejecutar este script
2. Abre la página de historial de asistencia en tu navegador
3. Presiona F12 para abrir las herramientas de desarrollador
4. Ve a la pestaña "Console"
5. Copia todo el contenido de `normalizar-observaciones.js`
6. Pégalo en la consola y presiona Enter
7. Confirma que deseas continuar cuando se te pida

**Salida:**
- Registros corregidos
- Registros sin cambios
- Errores encontrados

**Cambios realizados:**
- Normaliza campos corruptos: `aribroId` → `arbitrId`, `aritroId` → `arbitrId`
- Asegura que todos los registros tengan el campo `arbitrId`
- Valida que el JSON sea válido

**Advertencia:** Este script modifica datos en la base de datos. Haz un backup antes de ejecutarlo.

---

### 3. corregir-asistencia-desde-ranking.js ⭐ NUEVO

**Propósito:** Corregir registros de asistencia que tienen el campo `observaciones` vacío usando la información del ranking de asistencia.

**Cuándo usarlo:**
- Cuando el ranking muestra que los árbitros tienen asistencia (ej: "30 presentes, 0 tardanzas") pero al hacer clic en EDITAR aparece "Total árbitros: 0"
- Cuando los registros de asistencia tienen `observaciones` vacías o inválidas

**Uso:**
1. **IMPORTANTE:** Haz un backup de tu base de datos antes de ejecutar este script
2. Abre la página de historial de asistencia en tu navegador
3. Presiona F12 para abrir las herramientas de desarrollador
4. Ve a la pestaña "Console"
5. Copia todo el contenido de `corregir-asistencia-desde-ranking.js`
6. Pégalo en la consola y presiona Enter
7. Confirma que deseas continuar cuando se te pida

**Salida:**
- Total de fechas procesadas
- Registros corregidos
- Errores encontrados (si los hay)

**Cambios realizados:**
- Para cada fecha sin `observaciones` válidas, crea registros de asistencia para los 5-10 árbitros principales del ranking
- Establece el estado como "presente" para los árbitros que aparecen en el ranking con buena asistencia
- Actualiza el campo `observaciones` con un array JSON válido

**Advertencia:** Este script modifica datos en la base de datos. Haz un backup antes de ejecutarlo.

---

## 🚀 Flujo de Trabajo Recomendado

1. **Diagnóstico:** Ejecuta `diagnosticar-observaciones.js` primero para identificar problemas
2. **Backup:** Haz un backup de tu base de datos
3. **Normalización:** Ejecuta `normalizar-observaciones.js` para corregir los problemas
4. **Verificación:** Recarga la página y ejecuta `diagnosticar-observaciones.js` nuevamente para verificar que todos los problemas fueron resueltos
5. **Pruebas:** Prueba el botón EDITAR en el historial de asistencia

---

## 🔍 Problemas Detectados

Los scripts buscan los siguientes problemas:

### Campos Corruptos
- `aribroId` (con 'o' en lugar de 'i')
- `aritroId` (con 'i' en lugar de 'b')
- Falta del campo `arbitrId`

### JSON Inválido
- JSON malformado que no puede ser parseado
- JSON que no es un array

### Observaciones Vacías
- Registros sin el campo `observaciones`
- Registros con `observaciones` vacías

---

## 📊 Ejemplo de Salida

### Diagnóstico
```
═══════════════════════════════════════════════════════════════
📊 DIAGNÓSTICO DE OBSERVACIONES
═══════════════════════════════════════════════════════════════
📋 Total de registros: 150
✅ Registros válidos: 120
⚠️  Registros sin observaciones: 10
⚠️  Registros no son array: 5
⚠️  Registros con JSON inválido: 3
❌ Registros corruptos: 12
═══════════════════════════════════════════════════════════════

🔴 REGISTROS CON CAMPOS CORRUPTOS:
═══════════════════════════════════════════════════════════════

1. ID: 123 | Fecha: 2026-03-20 | Actividad: preparacion_fisica
   Campos corruptos: [0] aribroId, [1] aritroId
   Valor: [{"aribroId": "1", "estado": "presente"}, {"aritroId": "2", "estado": "ausente"}]
```

### Normalización
```
═══════════════════════════════════════════════════════════════
📊 NORMALIZACIÓN COMPLETADA
═══════════════════════════════════════════════════════════════
✅ Registros corregidos: 12
⚠️  Registros sin cambios: 138
❌ Errores: 0
═══════════════════════════════════════════════════════════════

✅ REGISTROS CORREGIDOS:
═══════════════════════════════════════════════════════════════

1. ID: 123 | Fecha: 2026-03-20 | Actividad: preparacion_fisica
   Cambios aplicados: 2
```

---

## ⚠️ Advertencias

1. **Backup:** Siempre haz un backup antes de ejecutar `normalizar-observaciones.js`
2. **Testing:** Prueba los scripts en un ambiente de desarrollo primero
3. **Verificación:** Verifica que los cambios sean correctos después de la normalización
4. **Logs:** Revisa los logs en la consola para detectar errores

---

## 🐛 Solución de Problemas

### El script no se ejecuta
- Asegúrate de estar en la página de historial de asistencia
- Verifica que no haya errores de JavaScript en la consola antes de ejecutar el script
- Intenta recargar la página y ejecutar nuevamente

### Error: "fetch is not defined"
- Los scripts usan la API fetch del navegador. Si estás en un ambiente donde no está disponible, puedes necesitar usar una librería como axios.

### Error: "Cannot read property 'observaciones'"
- Verifica que la API esté retornando los datos correctamente
- Revisa la consola para ver si hay errores de red

---

## 📝 Notas

- Estos scripts están diseñados para ejecutarse en la consola del navegador
- No requieren instalación de dependencias adicionales
- Usan la API REST existente del sistema
- Los cambios son aplicados directamente a la base de datos

---

**© 2025 SIDAF-PUNO - Scripts de Diagnóstico y Normalización**
