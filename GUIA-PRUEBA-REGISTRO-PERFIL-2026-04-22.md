# Guía de Prueba - Sistema de Registro y Perfil

## 🧪 Cómo Probar las Mejoras Implementadas

### Requisitos Previos
- Backend ejecutándose en `http://localhost:8083`
- Frontend ejecutándose en `http://localhost:3001` (o `http://localhost:3000`)
- Base de datos disponible

### ✅ Prueba 1: Validación de Formulario en Tiempo Real

**Objetivo:** Verificar que las validaciones funcionan mientras el usuario escribe

#### Pasos:
1. Navega a `http://localhost:3001/login/registro`
2. En el campo **DNI**:
   - Intenta escribir menos de 8 caracteres → Debería mostrar error
   - Intenta escribir letras → Se filtran automáticamente
   - Escribe exactamente 8 números → No muestra error

3. En el campo **Email**:
   - Escribe un email sin "@" → Debería mostrar error
   - Escribe un email válido (ej: test@example.com) → No muestra error

4. En el campo **Contraseña**:
   - Escribe menos de 6 caracteres → Debería mostrar error
   - Escribe 6 caracteres o más → Muestra "✓ Contraseña válida"

5. En el campo **Confirmar Contraseña**:
   - Escribe una contraseña diferente → Debería mostrar error
   - Escribe la misma contraseña → Muestra "✓ Las contraseñas coinciden"

**Resultado esperado:** ✅ Mensajes de error/éxito se muestran inmediatamente

---

### ✅ Prueba 2: Registro de Usuario Exitoso

**Objetivo:** Crear una nueva cuenta de usuario

#### Datos de Prueba:
```
DNI:                 87654321
Nombres:             Carlos
Apellidos:           López García
Email:               carlos.lopez@example.com
Teléfono:            952654321
Cargo en CODAR:      Vocal
Área:                Administración
Fecha de Nacimiento: (Opcional)
Especialidad:        (Opcional)
Contraseña:          TestPass123
Confirmar:           TestPass123
```

#### Pasos:
1. Llena todos los campos con los datos anteriores
2. Verifica que todos muestren validación exitosa (checkmarks verdes)
3. Haz clic en "Crear Cuenta"
4. Espera a que se procese (debe mostrar "Registrando...")

**Resultado esperado:**
- ✅ Página muestra "¡Registro Exitoso!"
- ✅ Mensaje indicando que la cuenta está pendiente de aprobación
- ✅ Botón para ir a Iniciar Sesión

---

### ✅ Prueba 3: Validación de Duplicados

**Objetivo:** Verificar que no se permite registrar DNI/Email duplicados

#### Pasos:
1. Intenta registrar dos usuarios con el mismo DNI
   - **Resultado esperado:** Error "Ya existe un usuario registrado con este DNI"

2. Intenta registrar dos usuarios con el mismo Email
   - **Resultado esperado:** Error "Ya existe un usuario registrado con este correo electrónico"

---

### ✅ Prueba 4: Validaciones Incorrectas

**Objetivo:** Verificar que se rechazan datos inválidos

#### Pasos:
1. Intenta registrar con:
   - DNI incompleto (menos de 8 dígitos)
   - **Resultado esperado:** Error en formulario

2. Intenta registrar con:
   - Email sin dominio
   - **Resultado esperado:** Error en formulario

3. Intenta registrar con:
   - Contraseña muy corta (menos de 6 caracteres)
   - **Resultado esperado:** Error en formulario

4. Intenta registrar con:
   - Teléfono muy corto (menos de 7 dígitos)
   - **Resultado esperado:** Error en formulario

---

### ✅ Prueba 5: Visualización de Perfil

**Objetivo:** Verificar que los datos se muestran correctamente en el perfil

#### Pasos:
1. Asumiendo que un usuario se ha registrado y aprobado:
2. Login con las credenciales del usuario
3. Navega a `/dashboard/perfil`

**Resultado esperado:**
- ✅ Se muestra un resumen visual con:
  - Nombre completo
  - DNI
  - Rol en badge visual
- ✅ Se muestran todos los campos de información
- ✅ No hay errores en la consola

---

### ✅ Prueba 6: Edición de Perfil

**Objetivo:** Verificar que se pueden editar los datos del perfil

#### Pasos:
1. En la página de perfil, haz clic en "Editar"
2. Cambia al menos uno de los campos (ej: teléfono)
3. Haz clic en "Guardar Cambios"

**Resultado esperado:**
- ✅ Muestra mensaje "Perfil actualizado correctamente"
- ✅ El campo se actualiza con el nuevo valor
- ✅ Regresa a modo visualización

---

### ✅ Prueba 7: Cambio de Contraseña

**Objetivo:** Verificar que se puede cambiar la contraseña

#### Pasos:
1. En la página de perfil, haz clic en "Cambiar Contraseña"
2. Ingresa:
   - Contraseña actual
   - Nueva contraseña (debe ser diferente)
   - Confirmación de nueva contraseña
3. Haz clic en "Cambiar Contraseña"

**Resultado esperado:**
- ✅ Muestra mensaje "Contraseña cambiada correctamente"
- ✅ La sección se contrae
- ✅ Los campos se limpian

---

## 🐛 Debugging

### Si algo no funciona:

#### 1. Verifica que el Backend está ejecutándose
```bash
curl http://localhost:8083/api/auth/verificar-dni/12345678
```
- Debería recibir una respuesta JSON

#### 2. Revisa la consola del navegador (F12)
- Busca errores en la pestaña "Console"
- Busca errores de red en la pestaña "Network"

#### 3. Verifica los logs del Backend
- Busca "Error" o "Exception" en la salida del terminal

#### 4. Limpia caché del navegador
```
Ctrl+Shift+Delete → Selecciona "Todas las categorías" → Elimina
```

---

## 📱 Datos de Prueba Adicionales

```
Usuario 1:
- DNI: 12345678
- Email: user1@example.com
- Password: Password123

Usuario 2:
- DNI: 87654321
- Email: user2@example.com
- Password: Password456

Usuario 3:
- DNI: 55555555
- Email: user3@example.com
- Password: Password789
```

---

## 🎯 Checklist de Validación Completa

- [ ] Validaciones en tiempo real funcionan
- [ ] Mensajes de error se muestran correctamente
- [ ] Confirmación visual (checkmarks) aparece para campos válidos
- [ ] Se pueden registrar usuarios nuevos
- [ ] Se rechaza DNI duplicado
- [ ] Se rechaza Email duplicado
- [ ] Se muestran todos los datos en el perfil
- [ ] Se pueden editar los datos del perfil
- [ ] Se puede cambiar la contraseña
- [ ] No hay errores en la consola
- [ ] Todos los campos de texto se validan

---

## 📞 Contacto y Soporte

Si encuentras algún problema:

1. Verifica los logs del servidor
2. Revisa la consola del navegador
3. Intenta con datos de prueba diferentes
4. Limpia la caché del navegador
5. Reinicia el servidor
