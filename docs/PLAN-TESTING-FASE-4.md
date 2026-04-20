# 🧪 PLAN TESTING FASE 4 - SISTEMA DE ROLES Y PERMISOS

**Documento:** Plan de Pruebas Integral
**Fecha:** 20 de Abril 2026
**Fase:** 4 (Testing & Validación)
**Tiempo Estimado:** 2 horas
**Prioridad:** CRÍTICA

---

## 📋 ESQUEMA DE TESTING

### Nivel 1: Testing Unitario Backend (30 min)
### Nivel 2: Testing de Integración (30 min)
### Nivel 3: Testing de API (30 min)
### Nivel 4: Testing E2E Frontend (30 min)

---

## 🔴 NIVEL 1: TESTING UNITARIO BACKEND (30 min)

### Test 1: Verificación de Migraciones SQL

**Objetivo:** Confirmar que todas las tablas se crean correctamente

**Pasos:**
```bash
# 1. Conectarse a BD
psql -U sidaf -d sidaf

# 2. Ejecutar migraciones en orden
\i backend/migrations/040_create_roles.sql
\i backend/migrations/041_create_permisos.sql
\i backend/migrations/042_create_rol_permiso_default.sql
\i backend/migrations/043_create_usuario_permiso_dinamico.sql
\i backend/migrations/044_create_auditoria_permisos.sql
\i backend/migrations/045_create_solicitud_permiso.sql
\i backend/migrations/046_alter_usuarios_add_rol_estado.sql

# 3. Verificar tablas
\dt roles
\dt permisos
\dt rol_permiso_default
\dt usuario_permiso_dinamico
\dt auditoria_permisos
\dt solicitud_permiso
\dt usuarios

# 4. Verificar columnas
\d roles
\d permisos
\d usuario_permiso_dinamico
```

**Criterio de Éxito:**
- [ ] 7 migraciones ejecutadas sin errores
- [ ] 7 tablas creadas correctamente
- [ ] Todas las columnas presentes
- [ ] Tipos de datos correctos
- [ ] Constraints activados (NOT NULL, FOREIGN KEY)

**Resultado:**
```
✅ PASS si todas las tablas existen
❌ FAIL si falta alguna tabla
```

---

### Test 2: Verificación de Datos Iniciales

**Objetivo:** Confirmar que roles y permisos iniciales están cargados

**Pasos:**
```sql
-- 1. Verificar roles
SELECT * FROM roles;
-- Debería mostrar: ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA

-- 2. Verificar permisos
SELECT COUNT(*) FROM permisos;
-- Debería mostrar: 40+

-- 3. Verificar asignaciones default
SELECT r.nombre, COUNT(rp.permiso_id) as cantidad
FROM roles r
LEFT JOIN rol_permiso_default rp ON r.id = rp.rol_id
GROUP BY r.nombre;
```

**Criterio de Éxito:**
- [ ] 4 roles creados
- [ ] 40+ permisos creados
- [ ] Cada rol tiene permisos asignados
- [ ] ADMINISTRADOR tiene todos los permisos

**Resultado:**
```
✅ PASS si datos iniciales están presentes
❌ FAIL si datos faltan
```

---

### Test 3: Compilación de Backend

**Objetivo:** Confirmar que el código Spring compila sin errores

**Pasos:**
```bash
cd backend
mvn clean compile
# Debe completar sin errores
```

**Criterio de Éxito:**
- [ ] Compilación exitosa
- [ ] Cero errores
- [ ] Cero warnings críticos

**Resultado:**
```
✅ PASS si Build Success
❌ FAIL si hay errores de compilación
```

---

### Test 4: Inicio de Spring Boot

**Objetivo:** Confirmar que la aplicación inicia sin errores

**Pasos:**
```bash
cd backend
mvn spring-boot:run
# Observar logs en consola
# Esperar hasta ver: "Application started in X seconds"
```

**Criterio de Éxito:**
- [ ] Aplicación inicia sin errores
- [ ] Logs muestran "Application started..."
- [ ] No hay excepciones en la consola
- [ ] Puerto 8080 está escuchando

**Resultado:**
```
✅ PASS si Backend está corriendo
❌ FAIL si hay errores en inicio
```

---

## 🟠 NIVEL 2: TESTING DE INTEGRACIÓN (30 min)

### Test 5: Verificación de Entidades JPA

**Objetivo:** Confirmar que las entidades se mapean correctamente a BD

**Pasos (Postman o Terminal):**
```bash
# 1. Verificar que Spring reconoce entidades
curl http://localhost:8080/api/roles
# Debería retornar lista de roles

curl http://localhost:8080/api/permisos
# Debería retornar lista de permisos
```

**Criterio de Éxito:**
- [ ] GET /api/roles retorna 200 con JSON array
- [ ] GET /api/permisos retorna 200 con JSON array
- [ ] Datos coinciden con BD

**Resultado:**
```
✅ PASS si endpoints retornan datos correctamente
❌ FAIL si retorna error 500 o 404
```

---

### Test 6: Testing Service Layer

**Objetivo:** Confirmar que servicios funcionan correctamente

**Pasos:**
```bash
# 1. Verificar PermisoService - tienePermiso()
# Crear usuario de prueba (ID=1) con permiso "arbitros_ver"
INSERT INTO usuario_permiso_dinamico (usuario_id, permiso_id, estado, fecha_asignacion)
VALUES (1, (SELECT id FROM permisos WHERE codigo='arbitros_ver'), 'ACTIVO', NOW());

# 2. Verificar a través de endpoint
curl http://localhost:8080/api/permisos/usuario/1/tiene/arbitros_ver -H "X-Usuario-ID: 1"
# Debería retornar: {"tiene": true}

# 3. Verificar sin permiso
curl http://localhost:8080/api/permisos/usuario/1/tiene/arbitros_editar -H "X-Usuario-ID: 1"
# Debería retornar: {"tiene": false}
```

**Criterio de Éxito:**
- [ ] PermisoService.tienePermiso() retorna true cuando tiene
- [ ] PermisoService.tienePermiso() retorna false cuando no tiene
- [ ] RolService funciona correctamente
- [ ] UsuarioRolService funciona correctamente

**Resultado:**
```
✅ PASS si servicios trabajan correctamente
❌ FAIL si hay errores en lógica
```

---

### Test 7: Testing Security (Annotation)

**Objetivo:** Confirmar que @RequierePermiso protege endpoints

**Pasos:**
```bash
# 1. Intentar sin token de usuario
curl http://localhost:8080/api/permisos/usuario/1/tiene/arbitros_ver
# Debería retornar: 403 Forbidden o error de auth

# 2. Intentar sin permiso requerido
curl http://localhost:8080/api/permisos/usuario/1/tiene/arbitros_ver -H "X-Usuario-ID: 2"
# Usuario 2 no tiene "arbitros_ver"
# Debería retornar: 403 Forbidden

# 3. Intentar con permiso correcto
curl http://localhost:8080/api/permisos/usuario/1/tiene/arbitros_ver -H "X-Usuario-ID: 1"
# Usuario 1 tiene permiso
# Debería retornar: 200 OK
```

**Criterio de Éxito:**
- [ ] Sin header X-Usuario-ID → 403/Error
- [ ] Con usuario sin permiso → 403/Error
- [ ] Con usuario con permiso → 200 OK

**Resultado:**
```
✅ PASS si security funciona
❌ FAIL si endpoints no están protegidos
```

---

## 🟡 NIVEL 3: TESTING DE API (30 min)

### Test 8: Testing de Todos los 18 Endpoints

**Usando Postman o similar:**

| # | Endpoint | Método | Datos | Esperado |
|---|----------|--------|-------|----------|
| 1 | /api/roles | GET | - | 200 + array |
| 2 | /api/roles | POST | {nombre, jerarquia} | 201 + new role |
| 3 | /api/roles/{nombre} | GET | - | 200 + role |
| 4 | /api/permisos | GET | - | 200 + array |
| 5 | /api/permisos | POST | {codigo, nombre} | 201 + new perm |
| 6 | /api/permisos/usuario/1 | GET | - | 200 + perms |
| 7 | /api/permisos/usuario/1/tiene/{codigo} | GET | - | 200 + {tiene:true/false} |
| 8 | /api/usuarios-roles/1 | GET | - | 200 + user info |
| 9 | /api/usuarios-roles/pendientes | GET | - | 200 + pending users |
| 10 | /api/usuarios-roles/aprobar/1 | POST | {razon} | 200 + success |
| 11 | /api/usuarios-roles/rechazar/1 | POST | {razon} | 200 + success |
| 12 | /api/permisos/asignar | POST | {usuarioId, permisoId, razon} | 200 + success |
| 13 | /api/permisos/revocar | POST | {usuarioId, permisoId} | 200 + success |
| 14 | /api/usuarios-roles/solicitud/crear | POST | {permisoId, razon} | 201 + new req |
| 15 | /api/usuarios-roles/solicitudes/pendientes | GET | - | 200 + pending reqs |
| 16 | /api/usuarios-roles/solicitud/aprobar/1 | POST | {comentario} | 200 + success |
| 17 | /api/auditoria | GET | ?page=0&size=20 | 200 + paged array |
| 18 | /api/auditoria/usuario/1 | GET | - | 200 + user changes |

**Criterio de Éxito (para cada endpoint):**
- [ ] Status code correcto (200/201/403/etc)
- [ ] Response body válido
- [ ] Datos correctos
- [ ] BD actualizada

**Resultado:**
```
✅ PASS si 18/18 endpoints funcionan
❌ FAIL si alguno retorna error
```

---

### Test 9: Testing Flujo de Auditoría

**Objetivo:** Verificar que auditoría registra todos los cambios

**Pasos:**
```bash
# 1. Hacer cambio
POST /api/usuarios-roles/aprobar/1 -d '{"razon": "Empleado nuevo"}'

# 2. Verificar en auditoria
GET /api/auditoria

# 3. Buscar el cambio
# Debería ver:
# {
#   "id": ...,
#   "tipo_cambio": "USUARIO_APROBADO",
#   "usuario_afectado_id": 1,
#   "realizado_por_id": <current user>,
#   "razon": "Empleado nuevo",
#   "fecha_cambio": "2026-04-20T14:45:00"
# }
```

**Criterio de Éxito:**
- [ ] Auditoría registra cambios
- [ ] Tipo de cambio correcto
- [ ] Quién lo hizo: registrado
- [ ] Por qué: registrado
- [ ] Cuándo: timestamp correcto

**Resultado:**
```
✅ PASS si auditoría funciona
❌ FAIL si cambios no se registran
```

---

## 🟢 NIVEL 4: TESTING E2E FRONTEND (30 min)

### Test 10: Setup Frontend

**Objetivo:** Instalar dependencias y compilar frontend

**Pasos:**
```bash
cd frontend
npm install
npm run dev
# Esperar hasta ver: "ready - started server on..."
# Acceso en http://localhost:3000
```

**Criterio de Éxito:**
- [ ] npm install sin errores
- [ ] npm run dev sin errores
- [ ] Frontend en http://localhost:3000
- [ ] No hay console errors

**Resultado:**
```
✅ PASS si Frontend está corriendo
❌ FAIL si hay errores en npm o dev
```

---

### Test 11: Testing MenuDinamico

**Objetivo:** Verificar que menú cambia según rol

**Pasos en navegador:**
```
1. Abrir DevTools (F12)
2. Ir a http://localhost:3000/roles/usuarios-pendientes
3. Ver localStorage:
   - usuarioId debería estar presente
4. Verificar menú lateral:
   - Si rol=PRESIDENCIA: ver "Usuarios Pendientes", "Asignar Permisos", "Solicitudes"
   - Si rol=ADMIN: ver "Gestión de Usuarios", "Gestión de Permisos", "Auditoría", "Panel Admin"
   - Si rol=CODAR: ver solo "Mi Perfil"
```

**Criterio de Éxito:**
- [ ] Menú carga sin errores
- [ ] Menú cambia según rol
- [ ] No hay console errors

**Resultado:**
```
✅ PASS si menú dinámico funciona
❌ FAIL si menú estático o error
```

---

### Test 12: Testing UsuariosPendientesPanel

**Objetivo:** Probar panel de aprobación de usuarios

**Pasos:**
```
1. Login con usuario PRESIDENCIA (rol=PRESIDENCIA)
2. Ir a /roles/usuarios-pendientes
3. Verificar:
   - [ ] Lista carga usuarios
   - [ ] Muestra: DNI, Nombre, Email, Estado
   - [ ] Botones "Aprobar" y "Rechazar" presentes
   - [ ] Al hacer clic "Aprobar":
     - Se abre textarea para razón
     - Aparece spinner loading
     - Usuario se marca como ACTIVO
     - Auditoría registra cambio
4. Verificar error handling:
   - [ ] Si error en API: muestra AlertCircle con mensaje
   - [ ] Si loading: muestra Loader2 spinner
```

**Criterio de Éxito:**
- [ ] Componente renderiza
- [ ] Lista de usuarios carga
- [ ] Acciones funcionan
- [ ] Auditoría se registra

**Resultado:**
```
✅ PASS si panel funciona completamente
❌ FAIL si tiene errores o no conecta con API
```

---

### Test 13: Testing GestionPermisosPanel

**Objetivo:** Probar panel de asignación de permisos

**Pasos:**
```
1. Login con usuario ADMIN
2. Ir a /roles/permisos
3. Verificar:
   - [ ] Select de usuarios carga
   - [ ] Select de permisos carga
   - [ ] Al seleccionar usuario:
     - Se carga lista de permisos actuales
     - Cada permiso tiene botón "Revocar"
   - [ ] Al asignar permiso:
     - Se abre textarea para razón
     - Aparece spinner
     - Permiso se agrega a lista
     - Auditoría registra cambio
```

**Criterio de Éxito:**
- [ ] Panel renderiza
- [ ] Datos cargan correctamente
- [ ] Asignación funciona
- [ ] Auditoría registra

**Resultado:**
```
✅ PASS si panel funciona
❌ FAIL si hay errores
```

---

### Test 14: Testing DashboardAuditoria

**Objetivo:** Probar tabla de auditoría

**Pasos:**
```
1. Login con ADMIN
2. Ir a /roles/auditoria
3. Verificar:
   - [ ] Tabla carga con datos
   - [ ] Columnas: Tipo, Usuario, Permiso, Por, Razón, Fecha
   - [ ] Colores por tipo:
     - ASIGNACIÓN (azul)
     - REVOCACIÓN (rojo)
     - CAMBIO_ESTADO (amarillo)
     - CAMBIO_ROL (púrpura)
   - [ ] Paginación funciona:
     - Previous button (deshabilitado en página 1)
     - Next button
     - Texto: "Página X de Y"
   - [ ] Cada fila muestra info correcta
```

**Criterio de Éxito:**
- [ ] Tabla renderiza
- [ ] Datos cargan correctamente
- [ ] Colores aplicados
- [ ] Paginación funciona

**Resultado:**
```
✅ PASS si auditoría funciona
❌ FAIL si hay errores en tabla
```

---

### Test 15: Testing PerfilPage

**Objetivo:** Probar página de perfil

**Pasos:**
```
1. Ir a /roles/perfil
2. Verificar:
   - [ ] Muestra nombre completo
   - [ ] Muestra email
   - [ ] Muestra DNI
   - [ ] Muestra estado (ACTIVO/PENDIENTE/etc)
   - [ ] Muestra rol asignado
   - [ ] Muestra lista de permisos activos
   - [ ] Cada permiso muestra: nombre, código, módulo
```

**Criterio de Éxito:**
- [ ] Página carga sin errores
- [ ] Todos los datos presentes
- [ ] Información correcta

**Resultado:**
```
✅ PASS si perfil carga correctamente
❌ FAIL si datos faltan
```

---

## 📊 MATRIZ DE TESTING

| Test # | Nombre | Estado | Tiempo | Prioridad |
|--------|--------|--------|--------|-----------|
| 1 | Migraciones SQL | ⏳ | 5 min | CRÍTICA |
| 2 | Datos Iniciales | ⏳ | 5 min | CRÍTICA |
| 3 | Compilación Backend | ⏳ | 5 min | CRÍTICA |
| 4 | Inicio Spring Boot | ⏳ | 5 min | CRÍTICA |
| 5 | Entidades JPA | ⏳ | 5 min | ALTA |
| 6 | Service Layer | ⏳ | 5 min | ALTA |
| 7 | Security | ⏳ | 5 min | ALTA |
| 8 | 18 Endpoints | ⏳ | 10 min | CRÍTICA |
| 9 | Auditoría | ⏳ | 5 min | ALTA |
| 10 | Setup Frontend | ⏳ | 5 min | CRÍTICA |
| 11 | MenuDinamico | ⏳ | 5 min | ALTA |
| 12 | UsuariosPendientes | ⏳ | 5 min | ALTA |
| 13 | GestionPermisos | ⏳ | 5 min | ALTA |
| 14 | DashboardAuditoria | ⏳ | 5 min | ALTA |
| 15 | PerfilPage | ⏳ | 5 min | MEDIA |

**TOTAL: ~120 minutos**

---

## 🚀 COMANDOS RÁPIDOS TESTING

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Testing API
curl http://localhost:8080/api/roles
curl http://localhost:8080/api/permisos
curl -X POST http://localhost:8080/api/usuarios-roles/aprobar/1 \
  -H "Content-Type: application/json" \
  -H "X-Usuario-ID: 1" \
  -d '{"razon": "Empleado validado"}'

# Terminal 3: Frontend
cd frontend
npm run dev

# Navegador:
http://localhost:3000/roles/usuarios-pendientes
http://localhost:3000/roles/permisos
http://localhost:3000/roles/auditoria
http://localhost:3000/roles/perfil
```

---

## ✅ CHECKLIST PASS/FAIL

### Para que FASE 4 esté completa:

- [ ] ✅ Todas 7 migraciones SQL ejecutadas
- [ ] ✅ Datos iniciales presentes (4 roles, 40+ permisos)
- [ ] ✅ Backend compila sin errores
- [ ] ✅ Backend inicia correctamente
- [ ] ✅ 18/18 endpoints retornan respuestas correctas
- [ ] ✅ Security funciona (401/403 cuando falta permiso)
- [ ] ✅ Auditoría registra todos los cambios
- [ ] ✅ Frontend npm install sin errores
- [ ] ✅ Frontend npm run dev sin errores
- [ ] ✅ 5 componentes React renderizan sin errores
- [ ] ✅ 7 páginas Next.js accesibles
- [ ] ✅ MenuDinamico funciona según rol
- [ ] ✅ Flujos E2E completados:
  - [ ] Aprobar usuario → Auditoría
  - [ ] Asignar permiso → Auditoría
  - [ ] Solicitar permiso → Aprobar → Auditoría

---

## 📝 REPORTE

**Después de completar todos los tests, llenar:**

```
Fecha: ________________
Probador: ________________

BACKEND TESTS:
- Migraciones: PASS ☐ FAIL ☐ ERROR: ___________
- Datos iniciales: PASS ☐ FAIL ☐ ERROR: ___________
- Compilación: PASS ☐ FAIL ☐ ERROR: ___________
- Inicio: PASS ☐ FAIL ☐ ERROR: ___________

API TESTS:
- 18 Endpoints: PASS (18/18) ☐ FAIL ☐ Fallas: ___________
- Auditoría: PASS ☐ FAIL ☐ ERROR: ___________
- Security: PASS ☐ FAIL ☐ ERROR: ___________

FRONTEND TESTS:
- Setup: PASS ☐ FAIL ☐ ERROR: ___________
- MenuDinamico: PASS ☐ FAIL ☐ ERROR: ___________
- Componentes: PASS (5/5) ☐ FAIL ☐ ERROR: ___________
- Páginas: PASS (7/7) ☐ FAIL ☐ ERROR: ___________

E2E TESTS:
- Flujo usuario: PASS ☐ FAIL ☐ ERROR: ___________
- Flujo permisos: PASS ☐ FAIL ☐ ERROR: ___________
- Flujo solicitud: PASS ☐ FAIL ☐ ERROR: ___________

ESTADO FINAL:
☐ LISTO PARA FASE 5 (100% tests passed)
☐ REQUIERE FIXES (algunos tests fallaron)
☐ BLOQUEADO (tests críticos fallaron)

Notas:
_______________________________________________________________
```

---

**Próximo paso después de FASE 4:** Integración con módulos existentes

¡Adelante con testing! 🚀
