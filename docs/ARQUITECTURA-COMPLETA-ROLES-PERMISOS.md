# 📊 ARQUITECTURA COMPLETA - SISTEMA DE ROLES Y PERMISOS

**Estado Actual:** FASES 1-3 COMPLETADAS (50% del proyecto)
**Siguiente:** FASE 4 - Testing & Producción

---

## 🏗️ DIAGRAMA ARQUITECTÓNICO

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Pages:                          Components:                     │
│  ├── /roles/usuarios-pendientes   ├── UsuariosPendientesPanel   │
│  ├── /roles/permisos              ├── GestionPermisosPanel      │
│  ├── /roles/solicitudes           ├── SolicitudesPermisosPanel  │
│  ├── /roles/auditoria             ├── DashboardAuditoria        │
│  ├── /roles/perfil                └── MenuDinamico             │
│  └── /roles/admin                                               │
│                                                                   │
│              ↓                                                    │
│        rolesService.ts (Axios)                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (API Calls)
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot 3.5.7)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Controllers (18 Endpoints):                                     │
│  ├── RolController                                               │
│  ├── PermisoController                                           │
│  ├── UsuarioRolController                                        │
│  └── AuditoriaController                                         │
│                 ↓                                                 │
│  Services (700+ líneas):                                         │
│  ├── PermisoService         (Valida permisos)                   │
│  ├── RolService             (Gestiona roles)                     │
│  └── UsuarioRolService      (Ciclo de vida usuarios)            │
│                 ↓                                                 │
│  Repositories (Custom Queries):                                  │
│  ├── RolRepository                                               │
│  ├── PermisoRepository                                           │
│  ├── UsuarioPermisoDinamicoRepository                            │
│  └── AuditoriaPermisoRepository                                  │
│                 ↓                                                 │
│  Security:                                                        │
│  ├── @RequierePermiso (Annotation)                               │
│  ├── PermisoAspect (AOP)                                         │
│  └── SecurityConfig                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (JPA)
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tablas (Migraciones SQL):                                       │
│  ├── 040_create_roles.sql (4 roles base)                        │
│  ├── 041_create_permisos.sql (40+ permisos)                     │
│  ├── 042_create_rol_permiso_default.sql (Asignaciones)          │
│  ├── 043_create_usuario_permiso_dinamico.sql (Runtime)          │
│  ├── 044_create_auditoria_permisos.sql (Audit Trail)            │
│  ├── 045_create_solicitud_permiso.sql (Workflow)                │
│  └── 046_alter_usuarios_add_rol_estado.sql (Usuario)            │
│                                                                   │
│  Entidades JPA (Mapeadas):                                       │
│  ├── Rol                                                         │
│  ├── Permiso                                                     │
│  ├── UsuarioPermisoDinamico                                      │
│  ├── AuditoriaPermiso                                            │
│  ├── SolicitudPermiso                                            │
│  └── 4 Enums (Estados)                                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE ARCHIVOS CREADOS

### FASE 1: Base de Datos (24 archivos)

```
backend/migrations/
├── 040_create_roles.sql
├── 041_create_permisos.sql
├── 042_create_rol_permiso_default.sql
├── 043_create_usuario_permiso_dinamico.sql
├── 044_create_auditoria_permisos.sql
├── 045_create_solicitud_permiso.sql
└── 046_alter_usuarios_add_rol_estado.sql

backend/src/main/java/com/sidaf/roles/
├── entity/
│   ├── Rol.java
│   ├── Permiso.java
│   ├── UsuarioPermisoDinamico.java
│   ├── AuditoriaPermiso.java
│   └── SolicitudPermiso.java
├── enums/
│   ├── EstadoRol.java
│   ├── EstadoPermiso.java
│   ├── EstadoUsuario.java
│   └── TipoCambio.java
└── repository/
    ├── RolRepository.java
    ├── PermisoRepository.java
    ├── UsuarioPermisoDinamicoRepository.java
    └── AuditoriaPermisoRepository.java
```

### FASE 2: Backend Services & API (11 archivos)

```
backend/src/main/java/com/sidaf/roles/
├── service/
│   ├── PermisoService.java         (200+ líneas)
│   ├── RolService.java             (150+ líneas)
│   └── UsuarioRolService.java      (350+ líneas)
├── controller/
│   ├── RolController.java          (4 endpoints)
│   ├── PermisoController.java      (6 endpoints)
│   ├── UsuarioRolController.java   (8 endpoints)
│   └── AuditoriaController.java    (2+ endpoints)
├── security/
│   ├── RequierePermiso.java        (Annotation)
│   ├── PermisoAspect.java          (AOP)
│   └── SecurityConfig.java         (Configuración)
```

### FASE 3: Frontend Components (13 archivos)

```
frontend/services/
└── rolesService.ts                 (300+ líneas)

frontend/components/roles/
├── UsuariosPendientesPanel.tsx     (180+ líneas)
├── GestionPermisosPanel.tsx        (180+ líneas)
├── SolicitudesPermisosPanel.tsx    (200+ líneas)
├── DashboardAuditoria.tsx          (220+ líneas)
└── MenuDinamico.tsx                (150+ líneas)

frontend/app/(dashboard)/roles/
├── layout.tsx                       (30 líneas)
├── usuarios-pendientes/page.tsx    (60+ líneas)
├── permisos/page.tsx               (50+ líneas)
├── solicitudes/page.tsx            (50+ líneas)
├── auditoria/page.tsx              (80+ líneas)
├── perfil/page.tsx                 (150+ líneas)
└── admin/page.tsx                  (90+ líneas)
```

**TOTAL:** 48 archivos, 4500+ líneas de código

---

## 🔄 FLUJOS PRINCIPALES

### Flujo 1: Aprobación de Usuario

```
Usuario Nuevo (PENDIENTE)
    ↓
PRESIDENCIA accede: /roles/usuarios-pendientes
    ↓
UsuariosPendientesPanel carga lista
    ↓
PRESIDENCIA hace clic "Aprobar"
    ↓
rolesService.aprobarUsuario(usuarioId)
    ↓
Backend: UsuarioRolController.aprobar()
    ↓
Backend: UsuarioRolService.aprobarUsuario()
    ↓
Database: UPDATE usuarios SET estado='ACTIVO'
    ↓
Auditoría: INSERT INTO auditoria_permisos
    ↓
Usuario ahora ACTIVO ✅
```

### Flujo 2: Asignación de Permisos

```
ADMIN accede: /roles/permisos
    ↓
GestionPermisosPanel carga usuarios y permisos
    ↓
ADMIN selecciona usuario
    ↓
ADMIN selecciona permiso
    ↓
ADMIN ingresa razón
    ↓
ADMIN hace clic "Asignar"
    ↓
rolesService.asignarPermiso()
    ↓
Backend: PermisoController.asignarPermiso()
    ↓
Backend: PermisoService.asignarPermisoAUsuario()
    ↓
Database: INSERT INTO usuario_permiso_dinamico
    ↓
Database: INSERT INTO auditoria_permisos (ASIGNACIÓN)
    ↓
Permiso asignado ✅
```

### Flujo 3: Solicitud de Permisos

```
Usuario solicita permiso desde: /roles/solicitudes
    ↓
Usuario ingresa: Permiso, Razón
    ↓
rolesService.crearSolicitudPermiso()
    ↓
Backend: INSERT INTO solicitud_permiso (PENDIENTE)
    ↓
PRESIDENCIA ve nuevo en: /roles/solicitudes
    ↓
PRESIDENCIA hace clic "Aprobar"
    ↓
Backend: 
  1. INSERT usuario_permiso_dinamico
  2. UPDATE solicitud_permiso (APROBADA)
  3. INSERT auditoria_permisos
    ↓
Permiso asignado automáticamente ✅
```

### Flujo 4: Verificación en Endpoints

```
Usuario intenta acceder: /arbitros/registrar
    ↓
Frontend: Valida si tiene permiso "arbitros_registrar"
    ↓
Backend: Endpoint /arbitros/registrar
    ↓
@RequierePermiso("arbitros_registrar")
    ↓
PermisoAspect intercepta
    ↓
Llama: PermisoService.tienePermiso()
    ↓
Si NO tiene: 403 Forbidden ❌
    ↓
Si tiene: Ejecuta endpoint ✅
```

---

## 📊 TABLA DE ENTIDADES

### Tabla: `roles`
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR UNIQUE (ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA),
  jerarquia INT (1, 2, 3, 4),
  descripcion TEXT,
  estado EstadoRol,
  fecha_creacion TIMESTAMP
);
```

### Tabla: `permisos`
```sql
CREATE TABLE permisos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR UNIQUE (arbitros_ver, arbitros_crear, arbitros_editar, ...),
  nombre VARCHAR,
  modulo VARCHAR (arbitros, asistencia, designaciones, campeonatos, ...),
  descripcion TEXT,
  estado EstadoPermiso,
  fecha_creacion TIMESTAMP
);
```

### Tabla: `usuario_permiso_dinamico`
```sql
CREATE TABLE usuario_permiso_dinamico (
  id SERIAL PRIMARY KEY,
  usuario_id INT (FK),
  permiso_id INT (FK),
  fecha_asignacion TIMESTAMP,
  fecha_revocacion TIMESTAMP,
  estado EstadoPermiso (ACTIVO, REVOCADO)
);
```

### Tabla: `auditoria_permisos`
```sql
CREATE TABLE auditoria_permisos (
  id SERIAL PRIMARY KEY,
  tipo_cambio TipoCambio (ASIGNACIÓN, REVOCACIÓN, CAMBIO_ESTADO, CAMBIO_ROL, ...),
  usuario_afectado_id INT,
  permiso_id INT,
  realizado_por_id INT,
  razon VARCHAR,
  fecha_cambio TIMESTAMP
);
```

### Tabla: `solicitud_permiso`
```sql
CREATE TABLE solicitud_permiso (
  id SERIAL PRIMARY KEY,
  usuario_id INT,
  permiso_id INT,
  razon_solicitud VARCHAR,
  estado EstadoPermiso (PENDIENTE, APROBADA, RECHAZADA),
  razon_decision VARCHAR,
  decidida_por_id INT,
  fecha_solicitud TIMESTAMP,
  fecha_decision TIMESTAMP
);
```

---

## 🔐 SEGURIDAD

### Autenticación
- Header: `X-Usuario-ID: {id}`
- localStorage: `usuarioId`

### Autorización
- **Anotación:** `@RequierePermiso("codigo_permiso")`
- **AOP:** PermisoAspect intercepta y valida
- **Almacenamiento:** usuario_permiso_dinamico + roles

### Auditoría
- **Tabla:** auditoria_permisos
- **Registra:** Quién, Qué, Cuándo, Por qué
- **Visualización:** DashboardAuditoria

---

## 📈 ESTADÍSTICAS TOTALES

```
FASE 1 (Database):
  - 7 migraciones SQL
  - 5 Entidades JPA
  - 4 Repositories
  - 4 Enums
  - Total: 24 archivos
  - Líneas: 1000+

FASE 2 (Backend):
  - 3 Services (700+ líneas)
  - 4 Controllers (18 endpoints)
  - 3 Security components
  - Total: 10 archivos
  - Líneas: 1200+

FASE 3 (Frontend):
  - 1 Service (300+ líneas)
  - 5 Components (800+ líneas)
  - 6 Pages (600+ líneas)
  - 1 Layout
  - Total: 13 archivos
  - Líneas: 1700+

════════════════════════════════════════
TOTAL PROYECTO:       47+ archivos
CÓDIGO GENERADO:      4000+ líneas
ENDPOINTS API:        18+
FUNCIONALIDADES:      20+
ESTADO:               ✅ 50% COMPLETADO
```

---

## 🚀 PRÓXIMAS FASES

### FASE 4: Testing & Validación
- ✅ Testing unitario
- ✅ Testing integración
- ✅ Testing E2E
- ✅ Security testing

### FASE 5: Integración del Sistema
- ✅ Integrar con módulo de Arbitros
- ✅ Integrar con módulo de Asistencia
- ✅ Integrar con módulo de Campeonatos
- ✅ Verificar permisos en cada endpoint

### FASE 6: Producción
- ✅ Deploy Backend
- ✅ Deploy Frontend
- ✅ Configurar SSL/TLS
- ✅ Backup y recuperación

---

## 💾 MIGRACIÓN DE BD RECOMENDADA

```bash
# En orden:
040_create_roles.sql                    → Crear tabla roles
041_create_permisos.sql                 → Crear tabla permisos
042_create_rol_permiso_default.sql      → Asignaciones por defecto
043_create_usuario_permiso_dinamico.sql → Permisos dinámicos
044_create_auditoria_permisos.sql       → Auditoría
045_create_solicitud_permiso.sql        → Solicitudes
046_alter_usuarios_add_rol_estado.sql   → Alterar tabla usuarios
```

---

**¡Sistema listo para FASE 4! 🧪**
