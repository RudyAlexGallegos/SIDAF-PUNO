# 📚 API ENDPOINTS - SISTEMA DE ROLES SIDAF PUNO

**Fecha Creación:** 20 de Abril 2026
**Fase:** 2 - Backend Services & REST API
**Estado:** ✅ COMPLETA

---

## 🔐 AUTENTICACIÓN

Todos los endpoints (excepto `/api/auth/login`) requieren el header:
```
X-Usuario-ID: {usuarioId}
```

---

## 🎭 ENDPOINTS DE ROLES

### GET `/api/roles`
Obtener todos los roles del sistema
```json
Respuesta:
{
  "exito": true,
  "datos": [...],
  "cantidad": 4
}
```

### GET `/api/roles/{nombre}`
Obtener rol específico por nombre
```json
Respuesta:
{
  "exito": true,
  "datos": { "id": 1, "nombre": "ADMINISTRADOR", "jerarquia": 1 }
}
```

### POST `/api/roles`
Crear nuevo rol (solo ADMINISTRADOR)
```json
Solicitud:
{
  "nombre": "NUEVO_ROL",
  "descripcion": "Descripción",
  "jerarquia": 4
}
```

---

## 🔑 ENDPOINTS DE PERMISOS

### GET `/api/permisos`
Obtener todos los permisos activos
```json
Respuesta:
{
  "exito": true,
  "datos": [...],
  "cantidad": 40+
}
```

### GET `/api/permisos/modulo/{modulo}`
Obtener permisos de un módulo específico
```
Ejemplo: /api/permisos/modulo/arbitros
```

### GET `/api/permisos/usuario/{usuarioId}`
Obtener permisos de un usuario
```json
Respuesta:
{
  "exito": true,
  "usuarioId": 5,
  "datos": [...],
  "cantidad": 10
}
```

### GET `/api/permisos/usuario/{usuarioId}/tiene/{codigoPermiso}`
Verificar si usuario tiene permiso específico
```json
Respuesta:
{
  "exito": true,
  "usuarioId": 5,
  "permiso": "arbitros_crear",
  "tiene": true
}
```

### POST `/api/permisos/asignar`
Asignar permiso dinámico a usuario
```json
Solicitud:
{
  "usuarioId": 5,
  "permisoId": 12,
  "asignadoPorId": 1,
  "razon": "Aprobación por PRESIDENCIA"
}
```

### POST `/api/permisos/revocar`
Revocar permiso dinámico
```json
Solicitud:
{
  "usuarioId": 5,
  "permisoId": 12,
  "revocadoPorId": 1,
  "razon": "Cambio de rol"
}
```

---

## 👥 ENDPOINTS DE USUARIOS Y ROLES

### GET `/api/usuarios-roles/{usuarioId}`
Obtener información completa del usuario
```json
Respuesta:
{
  "exito": true,
  "datos": {
    "id": 5,
    "dni": "12345678",
    "nombre": "Juan",
    "estado": "ACTIVO",
    "rol": { "id": 3, "nombre": "COMISIÓN_CODAR", "jerarquia": 3 },
    "permisos": [...]
  }
}
```

### GET `/api/usuarios-roles/pendientes`
Obtener usuarios pendientes de aprobación
```json
Respuesta:
{
  "exito": true,
  "datos": [...],
  "cantidad": 3
}
```

### GET `/api/usuarios-roles/rol/{nombreRol}`
Obtener usuarios con un rol específico
```
Ejemplo: /api/usuarios-roles/rol/PRESIDENCIA
```

### POST `/api/usuarios-roles/aprobar/{usuarioId}`
Aprobar usuario PENDIENTE
```json
Solicitud:
{
  "aprobadoPorId": 1,
  "razon": "Verificación completada"
}

Respuesta:
{
  "exito": true,
  "mensaje": "Usuario aprobado exitosamente",
  "nuevoEstado": "ACTIVO"
}
```

### POST `/api/usuarios-roles/rechazar/{usuarioId}`
Rechazar usuario PENDIENTE
```json
Solicitud:
{
  "rechazadoPorId": 1,
  "razonRechazo": "Documentación incompleta"
}
```

---

## 📝 ENDPOINTS DE SOLICITUDES DE PERMISOS

### POST `/api/usuarios-roles/solicitud/crear`
Crear solicitud de permiso adicional
```json
Solicitud:
{
  "usuarioId": 5,
  "permisoId": 12,
  "descripcion": "Necesito permiso para crear campeonatos"
}
```

### GET `/api/usuarios-roles/solicitudes/pendientes`
Obtener solicitudes pendientes
```json
Respuesta:
{
  "exito": true,
  "datos": [...],
  "cantidad": 5
}
```

### POST `/api/usuarios-roles/solicitud/aprobar/{solicitudId}`
Aprobar solicitud de permiso
```json
Solicitud:
{
  "aprobadoPorId": 1,
  "razon": "Solicitante verificado"
}
```

### POST `/api/usuarios-roles/solicitud/rechazar/{solicitudId}`
Rechazar solicitud de permiso
```json
Solicitud:
{
  "rechazadoPorId": 1,
  "razonRechazo": "Permiso no corresponde a tu rol"
}
```

---

## 📊 ENDPOINTS DE AUDITORÍA

### GET `/api/auditoria?page=0&size=20`
Obtener auditoría completa (paginada)
```json
Respuesta:
{
  "exito": true,
  "datos": [...],
  "totalElementos": 150,
  "totalPaginas": 8,
  "paginaActual": 0
}
```

### GET `/api/auditoria/usuario/{usuarioId}`
Obtener auditoría de un usuario específico
```json
Respuesta:
{
  "exito": true,
  "usuarioId": 5,
  "datos": [...],
  "cantidad": 25
}
```

### GET `/api/auditoria/realizadosPor/{usuarioId}`
Obtener cambios realizados por un usuario
```json
Respuesta:
{
  "exito": true,
  "realizadoPorId": 1,
  "datos": [...],
  "cantidad": 150
}
```

---

## ⚙️ CÓDIGOS DE MÓDULOS

```
arbitros              - Gestión de árbitros
asistencia            - Registros de asistencia
designaciones         - Designaciones a partidos
campeonatos           - Administración de campeonatos
equipos               - Gestión de equipos
reportes              - Reportes del sistema
usuarios              - Gestión de usuarios (ADMIN)
permisos              - Gestión de permisos (ADMIN)
auditoria             - Logs de auditoría (ADMIN)
```

---

## ⚡ CÓDIGOS DE ACCIONES

```
VER                   - Ver/Listar
CREAR                 - Crear nuevo
EDITAR                - Editar existente
ELIMINAR              - Eliminar
EXPORTAR              - Exportar datos
REGISTRAR             - Registrar entrada (ej: asistencia)
```

---

## 🛡️ VALIDACIONES

- **Solo ADMINISTRADOR** puede:
  - Crear nuevos roles
  - Ver auditoría completa
  - Cambiar roles de usuarios

- **Solo PRESIDENCIA** puede:
  - Aprobar/rechazar usuarios
  - Asignar permisos dinámicos
  - Aprobar solicitudes de permisos

- **Todos los usuarios** pueden:
  - Ver sus propios permisos
  - Solicitar permisos adicionales
  - Ver su propia auditoría

---

## ✅ TESTING RÁPIDO

### 1. Login
```bash
POST /api/auth/login
{
  "dni": "12345678",
  "password": "password123"
}
```

### 2. Obtener info de usuario
```bash
GET /api/usuarios-roles/5
Header: X-Usuario-ID: 1
```

### 3. Asignar permiso
```bash
POST /api/permisos/asignar
{
  "usuarioId": 5,
  "permisoId": 10,
  "asignadoPorId": 1,
  "razon": "Prueba de API"
}
```

### 4. Verificar auditoría
```bash
GET /api/auditoria?page=0&size=5
Header: X-Usuario-ID: 1
```
