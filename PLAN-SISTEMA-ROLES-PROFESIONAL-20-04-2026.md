# 🔐 PLAN SISTEMA DE ROLES PROFESIONAL - SIDAF PUNO

**Fecha:** 20 de Abril, 2026  
**Versión:** 1.0  
**Estado:** Bajo Revisión

---

## 📋 RESUMEN EJECUTIVO

Sistema de roles jerarquizado con permisos dinámicos, auditoria completa y flujo de aprobación para nuevos usuarios. Estructura:

- **👑 ADMINISTRADOR** → Acceso total al sistema (mantenimiento)
- **👔 PRESIDENCIA** → Gestor de árbitros, designaciones y aprobador de permisos
- **📋 COMISIÓN CODAR** → Usuario con permisos asignados por PRESIDENCIA
- **🔧 UNIDAD TÉCNICA** → Igual que CODAR, en espera de aprobación

---

## 🎯 ESPECIFICACIONES TÉCNICAS

### 1. ESTRUCTURA DE ROLES

```
┌─────────────────────────────────────────────────────────────────┐
│                    JERARQUÍA DE ROLES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ADMINISTRADOR ────────────────────────────────────────┐       │
│  (Acceso Total)                                        │       │
│  Estado: ACTIVO (automático)                           │       │
│  Permisos: 100% del sistema                            │       │
│                                                        │       │
│  PRESIDENCIA ──────────────────────────────────────────┼──┐   │
│  (Gestor Principal)                                    │  │   │
│  Estado: ACTIVO (automático)                           │  │   │
│  Permisos: Menú predefinido                           │  │   │
│  Función: Aprobar CODAR y asignar permisos dinámicos  │  │   │
│                                                        │  │   │
│  COMISIÓN CODAR ───────────────────────────────────────┼──┼──┐│
│  (Usuario Estándar)                                    │  │  ││
│  Estado: PENDIENTE → ACTIVO (requiere aprobación)     │  │  ││
│  Permisos: Asignados dinámicamente por PRESIDENCIA    │  │  ││
│  Menu Inicial: Solo Dashboard                         │  │  ││
│                                                        │  │  ││
│  UNIDAD TÉCNICA ───────────────────────────────────────┼──┼──┼┤
│  (Usuario Estándar - Alternativa a CODAR)             │  │  ││
│  Estado: PENDIENTE → ACTIVO (requiere aprobación)     │  │  ││
│  Permisos: Asignados dinámicamente por PRESIDENCIA    │  │  ││
│  Menu Inicial: Solo Dashboard                         │  │  ││
│                                                        │  │  ││
└────────────────────────────────────────────────────────┴──┴──┴┘
```

---

## 📱 MENÚ POR ROL

### 👑 ADMINISTRADOR

**Acceso:** 100% del sistema, incluyendo:

```
Logo
SIDAF PUNO
Comisión de Árbitros

┌─ MENÚ ADMINISTRADOR ────────────────────┐
│                                         │
│ 🏠 Principal                            │
│    └─ Inicio                            │
│    └─ Perfil                            │
│    └─ Permisos                          │
│                                         │
│ 📋 Solicitud de Permiso                 │
│    └─ Solicitar Permiso                 │
│    └─ Ver Solicitudes                   │
│                                         │
│ ⚙️ Administración                        │
│    └─ Usuarios                          │
│    └─ Árbitros                          │
│    └─ Roles y Permisos Dinámicos        │  ← NUEVO
│    └─ Auditoría de Cambios              │  ← NUEVO
│    └─ Configuración del Sistema         │  ← NUEVO
│                                         │
│ ⏱️ Asistencia                            │
│    └─ Control Asistencia                │
│    └─ Historial Asistencia              │
│    └─ Reportes de Asistencia            │
│                                         │
│ 🎯 Designaciones                        │
│    └─ Designaciones                     │
│    └─ Historial de Designaciones        │
│    └─ Reportes de Designaciones         │
│                                         │
│ 🏆 Campeonatos                          │
│    └─ Campeonatos                       │
│    └─ Equipos                           │
│    └─ Resultados                        │
│                                         │
│ 📊 Reportes                             │
│    └─ Reportes Generales                │
│    └─ Estadísticas del Sistema          │
│    └─ Exportar Datos                    │
│                                         │
│ 👨‍💼 Administrador SIDAF Puno              │
│    └─ Información del Sistema           │
│    └─ Backup y Restauración             │
│    └─ Configuración Avanzada            │
│                                         │
└─────────────────────────────────────────┘
```

**Estado:** ACTIVO (sin aprobación)
**Permisos:** Todas las acciones (CREAR, LEER, EDITAR, ELIMINAR)

---

### 👔 PRESIDENCIA

**Acceso:** Menú específico tal como lo definiste:

```
Logo
SIDAF PUNO
Comisión de Árbitros

┌─ MENÚ PRESIDENCIA ──────────────────────┐
│                                         │
│ 🏠 Principal                            │
│    └─ Inicio                            │
│    └─ Perfil                            │
│    └─ Permisos                          │
│                                         │
│ 📋 Solicitud de Permiso                 │
│    └─ Solicitar Permiso                 │
│    └─ Ver Solicitudes                   │
│                                         │
│ ⚙️ Administración                        │
│    └─ Usuarios (CODAR)                  │
│    │    └─ Listar                       │
│    │    └─ Aprobar Nuevos               │  ← NUEVO
│    │    └─ Asignar Permisos             │  ← NUEVO
│    │    └─ Revocar Permisos             │  ← NUEVO
│    │                                   │
│    └─ Árbitros                          │
│         └─ Listar, Crear, Editar        │
│         └─ Búsqueda avanzada            │
│         └─ Exportar lista               │
│                                         │
│ ⏱️ Asistencia                            │
│    └─ Control Asistencia                │
│    └─ Historial Asistencia              │
│    └─ Reportes de Asistencia            │
│         └─ Ver todas las asistencias    │
│         └─ Exportar por período         │
│                                         │
│ 🎯 Designaciones                        │
│    └─ Designaciones                     │
│    └─ Crear Designación                 │
│    └─ Designación Inteligente           │  ← NUEVO
│    └─ Reportes                          │
│                                         │
│ 🏆 Campeonatos                          │
│    └─ Campeonatos                       │
│    └─ Equipos                           │
│    └─ Resultados                        │
│                                         │
│ 📊 Reportes                             │
│    └─ Reportes Completos                │
│    └─ Estadísticas                      │
│    └─ Exportar (PDF/Excel)              │
│    └─ Auditoría (quién hizo qué)        │  ← NUEVO
│                                         │
│ 👨‍💼 Administrador SIDAF Puno              │
│                                         │
└─────────────────────────────────────────┘
```

**Estado:** ACTIVO (sin aprobación)
**Permisos:** Todas las acciones en sus módulos asignados

---

### 📋 COMISIÓN CODAR (Inicial)

**Estado:** PENDIENTE (esperando aprobación de PRESIDENCIA)

```
Logo
SIDAF PUNO
Comisión de Árbitros

┌─ MENÚ CODAR (PENDIENTE) ────────────────┐
│                                         │
│ 🏠 Principal                            │
│    └─ Inicio                            │
│    │   ⚠️ Dashboard con mensaje:        │
│    │   "Tu cuenta está pendiente de     │
│    │   aprobación. La PRESIDENCIA      │
│    │   asignará tus permisos en breve" │
│    │                                   │
│    └─ Perfil                            │
│                                         │
│ ⚠️ [Otros módulos deshabilitados]       │
│                                         │
└─────────────────────────────────────────┘

   ↓↓↓ DESPUÉS DE APROBACIÓN ↓↓↓
   (PRESIDENCIA asigna permisos dinámicamente)

┌─ MENÚ CODAR (ACTIVO) ───────────────────┐
│                                         │
│ 🏠 Principal                            │
│    └─ Inicio                            │
│    └─ Perfil                            │
│    └─ Permisos                          │
│                                         │
│ 📋 Solicitud de Permiso (opcional)      │
│    └─ Solicitar Permiso                 │
│    └─ Ver Solicitudes                   │
│                                         │
│ ⏱️ Asistencia (si PRESIDENCIA lo asignó)│
│    └─ Control Asistencia                │
│    └─ Historial Asistencia              │
│                                         │
│ 🎯 Designaciones (si PRESIDENCIA lo asignó)
│    └─ Mis Designaciones                 │
│    └─ Designaciones Próximas            │
│                                         │
│ 👨‍💼 Perfil                               │
│    └─ Ver mis permisos actuales         │
│    └─ Notificaciones de cambios         │  ← NUEVO
│                                         │
└─────────────────────────────────────────┘
```

**Estados Posibles:**
- `PENDIENTE` → Usuario creado, esperando aprobación
- `ACTIVO` → Aprobado, puede usar módulos asignados
- `INACTIVO` → Desactivado por PRESIDENCIA
- `SUSPENDIDO` → Violación de políticas

---

### 🔧 UNIDAD TÉCNICA (Inicial)

**Igual que COMISIÓN CODAR:** Estado PENDIENTE → ACTIVO tras aprobación

---

## 🔑 MATRIZ DE PERMISOS DINÁMICOS

### Módulos Disponibles para Asignar

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE PERMISOS POR MÓDULO               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MÓDULO                 │ PERMISOS GRANULARES                  │
│  ────────────────────────────────────────────────────────────── │
│  Árbitros               │ ✓ VER                                │
│                         │ ✓ CREAR                              │
│                         │ ✓ EDITAR                             │
│                         │ ✓ ELIMINAR                           │
│                         │ ✓ EXPORTAR                           │
│                         │                                      │
│  Asistencia             │ ✓ REGISTRAR                          │
│                         │ ✓ VER HISTORIAL PROPIO               │
│                         │ ✓ VER HISTORIAL GENERAL              │
│                         │ ✓ EDITAR ASISTENCIAS                 │
│                         │ ✓ EXPORTAR REPORTES                  │
│                         │                                      │
│  Designaciones          │ ✓ VER MIS DESIGNACIONES              │
│                         │ ✓ VER TODAS                          │
│                         │ ✓ CREAR                              │
│                         │ ✓ EDITAR                             │
│                         │ ✓ DESIGNACIÓN INTELIGENTE            │
│                         │                                      │
│  Campeonatos            │ ✓ VER                                │
│                         │ ✓ CREAR                              │
│                         │ ✓ EDITAR                             │
│                         │ ✓ ELIMINAR                           │
│                         │                                      │
│  Equipos                │ ✓ VER                                │
│                         │ ✓ CREAR                              │
│                         │ ✓ EDITAR                             │
│                         │ ✓ ELIMINAR                           │
│                         │                                      │
│  Reportes               │ ✓ VER REPORTES BÁSICOS               │
│                         │ ✓ VER REPORTES AVANZADOS             │
│                         │ ✓ EXPORTAR PDF/EXCEL                 │
│                         │                                      │
│  Usuarios (solo ADMIN)  │ ✓ VER                                │
│                         │ ✓ CREAR                              │
│                         │ ✓ EDITAR                             │
│                         │ ✓ ELIMINAR (cuidado)                 │
│                         │ ✓ CAMBIAR ROL                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo: Permisos para un CODAR Específico

```
┌─ CODAR: "Juan Pérez García" ─────────────────┐
│                                              │
│ Estado: ACTIVO                               │
│ Rol Base: COMISIÓN_CODAR                     │
│                                              │
│ ✅ Permisos Asignados:                       │
│                                              │
│   Árbitros:                                  │
│   ├─ ✓ VER                                   │
│   ├─ ✓ CREAR                                 │
│   ├─ ✓ EDITAR                                │
│   └─ ✗ ELIMINAR                              │
│                                              │
│   Asistencia:                                │
│   ├─ ✓ REGISTRAR                             │
│   ├─ ✓ VER HISTORIAL PROPIO                  │
│   ├─ ✗ VER HISTORIAL GENERAL                 │
│   └─ ✗ EDITAR ASISTENCIAS                    │
│                                              │
│   Designaciones:                             │
│   ├─ ✓ VER MIS DESIGNACIONES                 │
│   ├─ ✗ VER TODAS                             │
│   ├─ ✗ CREAR                                 │
│   └─ ✗ EDITAR                                │
│                                              │
│ Asignado por: PRESIDENCIA (Juan López)       │
│ Fecha: 2026-04-20 14:30                      │
│ Última modificación: 2026-04-20 16:45        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla 1: `roles`

```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL, -- ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL,        -- ACTIVO, INACTIVO
    jerarquia INT NOT NULL,             -- Nivel: 1=ADMIN, 2=PRESIDENCIA, 3=CODAR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla 2: `permisos`

```sql
CREATE TABLE permisos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(100) UNIQUE NOT NULL, -- arbitros_ver, arbitros_crear, asistencia_registrar, etc.
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(50) NOT NULL,        -- arbitros, asistencia, designaciones, campeonatos, equipos, reportes, usuarios
    accion VARCHAR(50) NOT NULL,        -- VER, CREAR, EDITAR, ELIMINAR, EXPORTAR, REGISTRAR
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla 3: `rol_permiso_default` (Permisos por defecto de cada rol)

```sql
CREATE TABLE rol_permiso_default (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id),
    UNIQUE KEY unique_rol_permiso (rol_id, permiso_id)
);
```

### Tabla 4: `usuario_permiso_dinamico` (Permisos asignados dinámicamente)

```sql
CREATE TABLE usuario_permiso_dinamico (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    asignado_por BIGINT NOT NULL,          -- ID del usuario PRESIDENCIA que asignó
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NULL,       -- Para permisos temporales
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO, REVOCADO
    notas TEXT,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id),
    UNIQUE KEY unique_usuario_permiso (usuario_id, permiso_id)
);
```

### Tabla 5: `auditoria_permisos` (Auditoría completa)

```sql
CREATE TABLE auditoria_permisos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tipo_cambio VARCHAR(50) NOT NULL,      -- ASIGNACIÓN, REVOCACIÓN, CAMBIO_ESTADO, CAMBIO_ROL
    usuario_id BIGINT NOT NULL,
    usuario_afectado_id BIGINT NOT NULL,
    permiso_id BIGINT,
    rol_anterior VARCHAR(50),
    rol_nuevo VARCHAR(50),
    realizado_por BIGINT NOT NULL,         -- ID del usuario que hizo el cambio
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    razon VARCHAR(255),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_afectado_id) REFERENCES usuarios(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id),
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id),
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_cambio (fecha_cambio)
);
```

### Tabla 6: `solicitud_permiso` (Solicitudes de permisos adicionales)

```sql
CREATE TABLE solicitud_permiso (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    descripcion TEXT NOT NULL,             -- Por qué necesita este permiso
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA
    solicitado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    respondido_en TIMESTAMP NULL,
    respondido_por BIGINT,                 -- ID de quien aprobó/rechazó
    razon_rechazo TEXT,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id),
    FOREIGN KEY (respondido_por) REFERENCES usuarios(id)
);
```

---

## 🎬 FLUJOS DE USUARIO

### Flujo 1: Nuevo Usuario CODAR se Registra

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLUJO: REGISTRO CODAR                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Usuario accede a login/registro                             │
│     └─ Elige rol: COMISIÓN_CODAR                                │
│                                                                 │
│  2. Completa formulario de registro                             │
│     └─ DNI, Nombre, Email, Contraseña, etc.                     │
│                                                                 │
│  3. Backend crea usuario con:                                   │
│     └─ estado = 'PENDIENTE'                                     │
│     └─ rol = 'COMISIÓN_CODAR'                                   │
│     └─ permisos = [] (vacío)                                    │
│                                                                 │
│  4. Usuario ve Dashboard con mensaje:                           │
│     ⚠️  "Tu cuenta está en revisión. La PRESIDENCIA             │
│         aprobará tu solicitud en breve y asignará               │
│         los permisos necesarios."                               │
│                                                                 │
│  5. Email enviado a PRESIDENCIA:                                │
│     📧 "Nuevo usuario CODAR pendiente de aprobación:            │
│         Nombre: Juan Pérez                                      │
│         DNI: 12345678                                           │
│         [Botón: Aprobar/Rechazar]"                              │
│                                                                 │
│  6. PRESIDENCIA hace clic en "Aprobar":                         │
│     ✓ Usuario estado cambia a 'ACTIVO'                          │
│     ✓ Se abre panel de asignación de permisos                   │
│                                                                 │
│  7. PRESIDENCIA asigna permisos:                                │
│     ✓ Arbitros: VER, CREAR, EDITAR                              │
│     ✓ Asistencia: REGISTRAR, VER HISTORIAL PROPIO               │
│     ✓ Designaciones: VER MIS DESIGNACIONES                      │
│                                                                 │
│  8. Usuario recibe email de activación:                         │
│     📧 "Tu cuenta ha sido aprobada. Tienes acceso a:            │
│         - Árbitros (Ver, Crear, Editar)                         │
│         - Asistencia (Registrar)                                │
│         - Designaciones (Mis designaciones)"                    │
│                                                                 │
│  9. Usuario inicia sesión                                       │
│     └─ Ve el menú con SOLO sus módulos asignados               │
│     └─ Otros módulos están deshabilitados/ocultos              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo 2: PRESIDENCIA Cambia Permisos Dinámicamente

```
┌─────────────────────────────────────────────────────────────────┐
│       FLUJO: CAMBIO DINÁMICO DE PERMISOS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PRESIDENCIA va a: Administración → Usuarios → [Usuario]     │
│                                                                 │
│  2. Ve pantalla "Gestionar Permisos":                           │
│     ┌─ Usuario: Juan Pérez García                              │
│     ├─ Estado: ACTIVO                                           │
│     ├─ Rol: COMISIÓN_CODAR                                      │
│     │                                                           │
│     ├─ 📋 PERMISOS ACTUALES:                                    │
│     │   ✓ Arbitros: VER, CREAR, EDITAR                          │
│     │   ✓ Asistencia: REGISTRAR                                 │
│     │   ✓ Designaciones: VER MIS DESIGNACIONES                  │
│     │                                                           │
│     └─ 🔄 AGREGAR/REMOVER:                                      │
│         [☐] Arbitros: ELIMINAR                                  │
│         [☐] Asistencia: VER HISTORIAL GENERAL                   │
│         [☐] Asistencia: EDITAR                                  │
│         [☐] Designaciones: CREAR                                │
│         [☐] Reportes: VER REPORTES BÁSICOS                      │
│                                                                 │
│  3. PRESIDENCIA marca: [✓] Designaciones: CREAR                 │
│                                                                 │
│  4. Hace clic en "Actualizar Permisos"                          │
│                                                                 │
│  5. Se requiere confirmación:                                   │
│     "¿Estás seguro? ¿Deseas agregar 'Designaciones: CREAR'      │
│      a Juan Pérez García?"                                      │
│     [Cancelar] [Confirmar]                                      │
│                                                                 │
│  6. Backend:                                                    │
│     ✓ Crea registro en usuario_permiso_dinamico                │
│     ✓ Registra en auditoria_permisos:                           │
│       - Tipo: ASIGNACIÓN                                        │
│       - Usuario: Juan Pérez                                     │
│       - Permiso: designaciones_crear                            │
│       - Realizado por: PRESIDENCIA                              │
│       - Fecha: 2026-04-20 16:45                                 │
│                                                                 │
│  7. Usuario recibe notificación:                                │
│     🔔 "Se agregó nuevo permiso: Designaciones - Crear          │
│         Agregado por: PRESIDENCIA                               │
│         Fecha: 2026-04-20 16:45"                                │
│                                                                 │
│  8. Al siguiente login de Juan:                                 │
│     └─ El menú muestra automáticamente opción "Crear            │
│        Designación" en el módulo Designaciones                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo 3: CODAR Solicita Permiso Adicional

```
┌─────────────────────────────────────────────────────────────────┐
│      FLUJO: SOLICITUD DE PERMISO (CODAR → PRESIDENCIA)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CODAR ve módulo deshabilitado que necesita                  │
│     Ejemplo: "Reportes - VER REPORTES AVANZADOS"                │
│                                                                 │
│  2. Hace clic en: "Solicitar Acceso"                            │
│     Se abre modal:                                              │
│     ┌─────────────────────────────────────────┐                 │
│     │ Solicitar Permiso                       │                 │
│     │                                         │                 │
│     │ Permiso Solicitado:                      │                 │
│     │ Reportes - VER REPORTES AVANZADOS        │                 │
│     │                                         │                 │
│     │ Motivo (requerido):                      │                 │
│     │ ┌─────────────────────────────────────┐ │                 │
│     │ │ Necesito acceso a los reportes      │ │                 │
│     │ │ avanzados para generar estadísticas │ │                 │
│     │ │ del mes de abril                    │ │                 │
│     │ └─────────────────────────────────────┘ │                 │
│     │                                         │                 │
│     │ [Cancelar] [Enviar Solicitud]            │                 │
│     └─────────────────────────────────────────┘                 │
│                                                                 │
│  3. Backend crea solicitud_permiso con estado PENDIENTE         │
│                                                                 │
│  4. Email a PRESIDENCIA:                                        │
│     📧 Juan Pérez solicita: Reportes - VER REPORTES AVANZADOS   │
│        Motivo: Necesito acceso a los reportes avanzados...      │
│        [Botón: Aprobar] [Botón: Rechazar]                       │
│                                                                 │
│  5. PRESIDENCIA revisa y elige:                                 │
│     Option A: [Aprobar]                                         │
│        └─ Permiso se asigna automáticamente                     │
│        └─ CODAR recibe notificación: ✓ Aprobado                │
│                                                                 │
│     Option B: [Rechazar]                                        │
│        └─ Se abre modal para escribir razón                     │
│        └─ CODAR recibe: ✗ Rechazado por: [razón]               │
│                                                                 │
│  6. Auditoría registra:                                         │
│     SOLICITUD_PERMISO → APROBADA                                │
│     Respondido por: PRESIDENCIA                                 │
│     Fecha: 2026-04-20 17:15                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 IMPLEMENTACIÓN TÉCNICA

### Backend - Entidad Usuario (Modificada)

```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String dni;
    private String nombre;
    private String email;
    private String password;
    
    // ✅ NUEVO: Relación con Rol
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id")
    private Rol rol;
    
    // ✅ NUEVO: Estado del usuario (PENDIENTE, ACTIVO, INACTIVO, SUSPENDIDO)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoUsuario estado = EstadoUsuario.PENDIENTE;
    
    // ✅ NUEVO: Relación con permisos dinámicos
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, lazy = true)
    private Set<UsuarioPermisoDinamico> permisosDinamicos = new HashSet<>();
    
    // ✅ NUEVO: Fecha de aprobación
    private LocalDateTime fechaAprobacion;
    
    // ✅ NUEVO: Quién aprobó
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por")
    private Usuario aprobadoPor;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Getters y Setters...
}

public enum EstadoUsuario {
    PENDIENTE("Esperando aprobación"),
    ACTIVO("Usuario activo"),
    INACTIVO("Usuario inactivo"),
    SUSPENDIDO("Usuario suspendido");
    
    private String descripcion;
    
    EstadoUsuario(String descripcion) {
        this.descripcion = descripcion;
    }
}
```

### Backend - Entidades Nuevas

```java
// 1. Rol
@Entity
@Table(name = "roles")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String nombre; // ADMINISTRADOR, PRESIDENCIA, COMISIÓN_CODAR, UNIDAD_TÉCNICA
    
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    private EstadoRol estado = EstadoRol.ACTIVO;
    
    private Integer jerarquia; // 1=ADMIN, 2=PRESIDENCIA, 3=CODAR
    
    // Permisos por defecto de este rol
    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL)
    private Set<RolPermisoDefault> permisoDefaults = new HashSet<>();
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}

// 2. Permiso
@Entity
@Table(name = "permisos")
public class Permiso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String codigo; // arbitros_ver, asistencia_crear, etc.
    
    private String nombre;
    private String descripcion;
    private String modulo; // arbitros, asistencia, designaciones, etc.
    private String accion;  // VER, CREAR, EDITAR, ELIMINAR, EXPORTAR
    
    @Enumerated(EnumType.STRING)
    private EstadoPermiso estado = EstadoPermiso.ACTIVO;
    
    private LocalDateTime fechaCreacion;
}

// 3. UsuarioPermisoDinamico
@Entity
@Table(name = "usuario_permiso_dinamico")
public class UsuarioPermisoDinamico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permiso_id", nullable = false)
    private Permiso permiso;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_por", nullable = false)
    private Usuario asignadoPor;
    
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaExpiracion;
    
    @Enumerated(EnumType.STRING)
    private EstadoPermiso estado = EstadoPermiso.ACTIVO;
    
    private String notas;
    
    private LocalDateTime fechaCreacion;
}

// 4. AuditoriaPermiso
@Entity
@Table(name = "auditoria_permisos")
public class AuditoriaPermiso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private TipoCambio tipoCambio; // ASIGNACIÓN, REVOCACIÓN, CAMBIO_ESTADO, CAMBIO_ROL
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_afectado_id")
    private Usuario usuarioAfectado;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permiso_id")
    private Permiso permiso;
    
    private String rolAnterior;
    private String rolNuevo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "realizado_por", nullable = false)
    private Usuario realizadoPor;
    
    private LocalDateTime fechaCambio;
    private String descripcion;
    private String razon;
}
```

### Backend - Servicio de Permisos (Nuevo)

```java
@Service
public class PermisoService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private UsuarioPermisoDinamicoRepository permisoRepository;
    
    @Autowired
    private AuditoriaPermisoRepository auditoriaRepository;
    
    /**
     * Verifica si un usuario tiene un permiso específico
     */
    public boolean tienePermiso(Long usuarioId, String codigoPermiso) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Si es ADMINISTRADOR, tiene todos los permisos
        if (usuario.getRol().getNombre().equals("ADMINISTRADOR")) {
            return true;
        }
        
        // Buscar en permisos dinámicos
        return usuario.getPermisosDinamicos().stream()
            .anyMatch(p -> p.getPermiso().getCodigo().equals(codigoPermiso) 
                && p.getEstado() == EstadoPermiso.ACTIVO);
    }
    
    /**
     * Asigna un permiso dinámico a un usuario
     */
    @Transactional
    public void asignarPermiso(Long usuarioId, Long permisoId, Long presidenciaId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Permiso permiso = permisoRepository.findById(permisoId)
            .orElseThrow(() -> new IllegalArgumentException("Permiso no encontrado"));
        
        UsuarioPermisoDinamico nuevoPermiso = new UsuarioPermisoDinamico();
        nuevoPermiso.setUsuario(usuario);
        nuevoPermiso.setPermiso(permiso);
        nuevoPermiso.setAsignadoPor(usuarioRepository.findById(presidenciaId).orElse(null));
        nuevoPermiso.setFechaAsignacion(LocalDateTime.now());
        nuevoPermiso.setEstado(EstadoPermiso.ACTIVO);
        
        permisoRepository.save(nuevoPermiso);
        
        // Registrar en auditoría
        registrarAuditoria(
            TipoCambio.ASIGNACIÓN,
            usuario,
            usuario,
            permiso,
            usuarioRepository.findById(presidenciaId).orElse(null),
            "Permiso asignado: " + permiso.getNombre(),
            razon
        );
    }
    
    /**
     * Revoca un permiso de un usuario
     */
    @Transactional
    public void revocarPermiso(Long usuarioId, Long permisoId, Long presidenciaId, String razon) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        UsuarioPermisoDinamico permisoUsuario = usuario.getPermisosDinamicos().stream()
            .filter(p -> p.getPermiso().getId().equals(permisoId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Permiso no asignado al usuario"));
        
        permisoUsuario.setEstado(EstadoPermiso.INACTIVO);
        permisoRepository.save(permisoUsuario);
        
        // Registrar en auditoría
        registrarAuditoria(
            TipoCambio.REVOCACIÓN,
            usuario,
            usuario,
            permisoUsuario.getPermiso(),
            usuarioRepository.findById(presidenciaId).orElse(null),
            "Permiso revocado: " + permisoUsuario.getPermiso().getNombre(),
            razon
        );
    }
    
    /**
     * Obtiene todos los permisos de un usuario (rol + dinámicos)
     */
    public Set<Permiso> obtenerTodosLosPermisos(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        Set<Permiso> permisos = new HashSet<>();
        
        // Agregar permisos del rol
        if (usuario.getRol() != null) {
            usuario.getRol().getPermisoDefaults().stream()
                .filter(p -> p.getEstado() == EstadoRol.ACTIVO)
                .forEach(p -> permisos.add(p.getPermiso()));
        }
        
        // Agregar permisos dinámicos activos
        usuario.getPermisosDinamicos().stream()
            .filter(p -> p.getEstado() == EstadoPermiso.ACTIVO)
            .forEach(p -> permisos.add(p.getPermiso()));
        
        return permisos;
    }
    
    /**
     * Registra cambios en auditoría
     */
    private void registrarAuditoria(TipoCambio tipo, Usuario usuario, Usuario usuarioAfectado,
                                    Permiso permiso, Usuario realizadoPor, String descripcion, String razon) {
        AuditoriaPermiso auditoria = new AuditoriaPermiso();
        auditoria.setTipoCambio(tipo);
        auditoria.setUsuario(usuario);
        auditoria.setUsuarioAfectado(usuarioAfectado);
        auditoria.setPermiso(permiso);
        auditoria.setRealizadoPor(realizadoPor);
        auditoria.setFechaCambio(LocalDateTime.now());
        auditoria.setDescripcion(descripcion);
        auditoria.setRazon(razon);
        
        auditoriaRepository.save(auditoria);
    }
}
```

### Backend - Security Filter (Validación de Permisos)

```java
@Component
public class PermisoFilter implements OncePerRequestFilter {
    
    @Autowired
    private PermisoService permisoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long usuarioId = Long.valueOf(token); // De JWT decodificado
            
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            
            if (usuario != null && usuario.getEstado() == EstadoUsuario.PENDIENTE) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Tu cuenta está pendiente de aprobación\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Backend - Controller para Gestión de Permisos

```java
@RestController
@RequestMapping("/api/admin/permisos")
@CrossOrigin(origins = {"https://sidaf-puno.vercel.app"})
public class PermisoController {
    
    @Autowired
    private PermisoService permisoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * PRESIDENCIA: Asignar permiso a CODAR
     */
    @PostMapping("/asignar")
    public ResponseEntity<?> asignarPermiso(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam Long usuarioId,
        @RequestParam Long permisoId,
        @RequestParam String razon) {
        
        // Validar que el solicitante es PRESIDENCIA o ADMIN
        // ...
        
        permisoService.asignarPermiso(usuarioId, permisoId, 
            extractUserIdFromToken(authHeader), razon);
        
        return ResponseEntity.ok(Map.of("mensaje", "Permiso asignado correctamente"));
    }
    
    /**
     * PRESIDENCIA: Revocar permiso a CODAR
     */
    @PostMapping("/revocar")
    public ResponseEntity<?> revocarPermiso(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam Long usuarioId,
        @RequestParam Long permisoId,
        @RequestParam String razon) {
        
        permisoService.revocarPermiso(usuarioId, permisoId, 
            extractUserIdFromToken(authHeader), razon);
        
        return ResponseEntity.ok(Map.of("mensaje", "Permiso revocado correctamente"));
    }
    
    /**
     * Ver auditoría de cambios
     */
    @GetMapping("/auditoria")
    public ResponseEntity<?> obtenerAuditoria(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(required = false) Long usuarioId,
        @RequestParam(required = false) String mes) {
        
        // Implementar lógica de auditoría...
        
        return ResponseEntity.ok(/* resultados */);
    }
}
```

---

## 🎨 Frontend - Componentes Nuevos

### 1. Panel de Gestión de Permisos (PRESIDENCIA)

```typescript
// components/AdminPermisos/GestorPermisosCodar.tsx

export default function GestorPermisosCodar() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [permisoDisponibles, setPermisosDisponibles] = useState([]);
    const [permisoAsignados, setPermisoAsignados] = useState([]);
    const [razon, setRazon] = useState("");
    
    const asignarPermiso = async (permisoId: number) => {
        const response = await fetch("/api/admin/permisos/asignar", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                usuarioId: usuarioSeleccionado.id,
                permisoId,
                razon
            })
        });
        
        if (response.ok) {
            toast.success("Permiso asignado correctamente");
            // Actualizar permisos
        }
    };
    
    // Render UI...
}
```

### 2. Notificaciones de Permisos

```typescript
// components/Notificaciones/NotificacionesPermisos.tsx

export default function NotificacionesPermisos() {
    const [notificaciones, setNotificaciones] = useState([]);
    
    useEffect(() => {
        // Suscribirse a cambios de permisos en tiempo real
        const ws = new WebSocket("wss://api.sidaf-puno/ws/permisos");
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.tipo === "PERMISO_ASIGNADO") {
                setNotificaciones(prev => [{
                    id: Date.now(),
                    tipo: "success",
                    mensaje: `Nuevo permiso: ${data.permiso.nombre}`,
                    asignadoPor: data.asignadoPor,
                    fecha: new Date(data.fecha)
                }, ...prev]);
            }
        };
    }, []);
    
    // Render notificaciones...
}
```

---

## 📊 MATRIZ DE PERMISOS POR ROL (RESUMEN)

```
┌────────────────────┬──────────────┬──────────┬──────────┬──────────────┐
│ MÓDULO             │ ADMINISTRADOR│PRESIDENCIA│  CODAR  │ UNIDAD TÉCNICA
├────────────────────┼──────────────┼──────────┼──────────┼──────────────┤
│ Árbitros           │ ✓ CRUD Exp   │ ✓ CRUD   │ Dinámico │ Dinámico     │
│ Asistencia         │ ✓ CRUD Exp   │ ✓ CRUD   │ Dinámico │ Dinámico     │
│ Designaciones      │ ✓ CRUD Exp   │ ✓ CRUD   │ Dinámico │ Dinámico     │
│ Campeonatos        │ ✓ CRUD Exp   │ ✓ CRUD   │ Dinámico │ Dinámico     │
│ Equipos            │ ✓ CRUD Exp   │ ✓ CRUD   │ Dinámico │ Dinámico     │
│ Reportes           │ ✓ Todos      │ ✓ Todos  │ Dinámico │ Dinámico     │
│ Usuarios           │ ✓ CRUD       │ ✗ NO     │ ✗ NO     │ ✗ NO         │
│ Roles y Permisos   │ ✓ CRUD       │ ✗ NO     │ ✗ NO     │ ✗ NO         │
│ Auditoría          │ ✓ Ver Todo   │ ✓ Ver Sus│ ✗ NO     │ ✗ NO         │
└────────────────────┴──────────────┴──────────┴──────────┴──────────────┘

LEYENDA:
✓ = Habilitado
✗ = Deshabilitado
CRUD = Crear, Leer, Editar, Eliminar
Exp = Exportar
Dinámico = Asignado dinámicamente por PRESIDENCIA
Ver Todo = Ver toda la auditoría del sistema
Ver Sus = Ver solo su propia auditoría
```

---

## 🚀 CRONOGRAMA DE IMPLEMENTACIÓN

### FASE 1: INFRAESTRUCTURA (1-2 días)
- [ ] Crear tablas SQL (roles, permisos, etc.)
- [ ] Crear entidades Java (Rol, Permiso, etc.)
- [ ] Crear repositories
- [ ] Crear PermisoService

### FASE 2: BACKEND (2-3 días)
- [ ] Crear PermisoController
- [ ] Crear Security Filter
- [ ] Integrar con AuthController
- [ ] Crear endpoints de auditoría
- [ ] Crear endpoint para solicitar permisos

### FASE 3: FRONTEND (3-4 días)
- [ ] Dashboard ADMIN (vista de auditoría)
- [ ] Panel gestión de permisos (PRESIDENCIA)
- [ ] Componente solicitar permiso (CODAR)
- [ ] Notificaciones de cambios
- [ ] Menu dinámico según permisos

### FASE 4: TESTING & DEPLOYMENT (1-2 días)
- [ ] Tests de seguridad
- [ ] Validar flujos de aprobación
- [ ] Deploy a producción

**Total Estimado:** 7-11 días

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] ADMINISTRADOR ve 100% del sistema
- [ ] PRESIDENCIA ve solo su menú
- [ ] CODAR ve solo Dashboard + módulos asignados
- [ ] Permisos se asignan dinámicamente
- [ ] Auditoría registra todos los cambios
- [ ] Notificaciones se envían en tiempo real
- [ ] Tokens expiran correctamente
- [ ] Estados de usuario funcionan (PENDIENTE → ACTIVO)
- [ ] Solicitudes de permiso fluyen correctamente
- [ ] Seguridad: solo ADMIN puede ver auditoría completa

---

**Documento Versión:** 1.0  
**Última Actualización:** 20 de Abril, 2026  
**Próximo Paso:** Implementar FASE 1 (Infraestructura SQL + Entidades Java)
