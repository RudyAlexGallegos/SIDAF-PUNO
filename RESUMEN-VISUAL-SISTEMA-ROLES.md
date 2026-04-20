# 📊 RESUMEN VISUAL - SISTEMA DE ROLES SIDAF PUNO

**Fecha:** 20 de Abril, 2026

---

## 🎯 RESUMEN EJECUTIVO

Sistema de roles jerarquizado con **permisos dinámicos y auditoría completa**:

| Rol | Acceso | Estado | Menu | Permisos |
|-----|--------|--------|------|----------|
| **👑 ADMINISTRADOR** | 100% Sistema | ACTIVO | Todos | Todos |
| **👔 PRESIDENCIA** | Menú Definido | ACTIVO | Predefinido | Gestiona CODAR |
| **📋 CODAR** | Asignados | PENDIENTE/ACTIVO | Solo asignados | Dinámicos |
| **🔧 UNIDAD TÉCNICA** | Asignados | PENDIENTE/ACTIVO | Solo asignados | Dinámicos |

---

## 👑 ADMINISTRADOR - ACCESO TOTAL

```
┌─────────────────────────────────────────────────────────┐
│         MENÚ DEL ADMINISTRADOR (100%)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🏠 Principal                                            │
│    ├─ Inicio                                            │
│    ├─ Perfil                                            │
│    └─ Permisos                                          │
│                                                         │
│ 📋 Solicitudes de Permiso                               │
│    ├─ Solicitar Permiso                                 │
│    └─ Ver Solicitudes                                   │
│                                                         │
│ ⚙️  Administración                                       │
│    ├─ Usuarios (CRUD)                                   │
│    ├─ Árbitros (CRUD)                                   │
│    ├─ 🔴 Roles y Permisos Dinámicos (NUEVO)            │
│    ├─ 🔴 Auditoría de Cambios (NUEVO)                  │
│    └─ 🔴 Configuración del Sistema (NUEVO)             │
│                                                         │
│ ⏱️  Asistencia                                           │
│    ├─ Control Asistencia                                │
│    ├─ Historial Asistencia                              │
│    └─ Reportes                                          │
│                                                         │
│ 🎯 Designaciones                                        │
│    ├─ Designaciones                                     │
│    ├─ Historial                                         │
│    └─ Reportes                                          │
│                                                         │
│ 🏆 Campeonatos                                          │
│    ├─ Campeonatos                                       │
│    ├─ Equipos                                           │
│    └─ Resultados                                        │
│                                                         │
│ 📊 Reportes                                             │
│    ├─ Reportes Generales                                │
│    ├─ Estadísticas                                      │
│    └─ Exportar                                          │
│                                                         │
│ 👨‍💼 Administrador SIDAF Puno                            │
│    ├─ Información del Sistema                           │
│    ├─ Backup y Restauración                             │
│    └─ Configuración Avanzada                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

Estado: ACTIVO (sin aprobación)
Permisos: Ver, Crear, Editar, Eliminar, Exportar en TODO
Acceso Auditoría: ✓ VER TODO el historial del sistema
```

---

## 👔 PRESIDENCIA - GESTOR DE ÁRBITROS

```
┌─────────────────────────────────────────────────────────┐
│         MENÚ DE LA PRESIDENCIA (Específico)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🏠 Principal                                            │
│    ├─ Inicio                                            │
│    ├─ Perfil                                            │
│    └─ Permisos                                          │
│                                                         │
│ 📋 Solicitudes de Permiso                               │
│    ├─ Solicitar Permiso                                 │
│    └─ Ver Solicitudes                                   │
│                                                         │
│ ⚙️  Administración                                       │
│    ├─ Usuarios (CODAR)                                  │
│    │   ├─ Listar                                        │
│    │   ├─ 🔴 Aprobar Nuevos CODAR (NUEVO)              │
│    │   ├─ 🔴 Asignar Permisos (NUEVO)                  │
│    │   ├─ 🔴 Revocar Permisos (NUEVO)                  │
│    │   └─ 🔴 Ver Auditoría de Cambios (NUEVO)          │
│    │                                                   │
│    └─ Árbitros                                          │
│        ├─ Listar, Crear, Editar, Eliminar               │
│        ├─ Búsqueda avanzada                             │
│        └─ Exportar lista                                │
│                                                         │
│ ⏱️  Asistencia                                           │
│    ├─ Control Asistencia                                │
│    ├─ Historial Asistencia (todos)                      │
│    └─ Reportes (exportar por período)                   │
│                                                         │
│ 🎯 Designaciones                                        │
│    ├─ Listar Designaciones                              │
│    ├─ Crear Designación                                 │
│    ├─ 🔴 Designación Inteligente (NUEVO)               │
│    └─ Reportes                                          │
│                                                         │
│ 🏆 Campeonatos                                          │
│    ├─ Campeonatos (CRUD)                                │
│    ├─ Equipos (CRUD)                                    │
│    └─ Resultados                                        │
│                                                         │
│ 📊 Reportes                                             │
│    ├─ Reportes Completos                                │
│    ├─ Estadísticas del Sistema                          │
│    ├─ Exportar (PDF/Excel)                              │
│    └─ 🔴 Auditoría (mis cambios) (NUEVO)               │
│                                                         │
└─────────────────────────────────────────────────────────┘

Estado: ACTIVO (sin aprobación)
Permisos: Ver, Crear, Editar en sus módulos
Función: ✓ Aprobar nuevos CODAR
         ✓ Asignar permisos dinámicamente
         ✓ Revocar permisos
         ✓ Ver reportes completos
```

---

## 📋 COMISIÓN CODAR - USUARIO ESTÁNDAR

### ESTADO 1: PENDIENTE (Recién se registran)

```
┌─────────────────────────────────────────────────────────┐
│    MENÚ CODAR (ESTADO: PENDIENTE)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🏠 Principal                                            │
│    ├─ Inicio                                            │
│    │  ⚠️  MENSAJE EN DASHBOARD:                         │
│    │  "Tu cuenta está pendiente de aprobación."         │
│    │  "La PRESIDENCIA asignará tus permisos en breve"   │
│    │                                                   │
│    ├─ Perfil                                            │
│    │  └─ Mis datos                                      │
│    │                                                   │
│    └─ Permisos                                          │
│       └─ (Vacío - esperando asignación)                 │
│                                                         │
│ 🔒 [Otros módulos deshabilitados/ocultos]              │
│                                                         │
└─────────────────────────────────────────────────────────┘

Acciones Disponibles:
✓ Ver perfil
✓ Esperar aprobación de PRESIDENCIA
✗ Acceder a otros módulos
```

### ESTADO 2: ACTIVO (Después de aprobación)

```
┌─────────────────────────────────────────────────────────┐
│    MENÚ CODAR (ESTADO: ACTIVO)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 🏠 Principal                                            │
│    ├─ Inicio                                            │
│    ├─ Perfil                                            │
│    └─ Permisos                                          │
│                                                         │
│ 📋 Solicitudes de Permiso                               │
│    ├─ Solicitar Permiso Adicional                       │
│    │  (si necesita más acceso)                          │
│    └─ Ver mis Solicitudes                               │
│                                                         │
│ ⏱️  Asistencia (SI ASIGNADO)                            │
│    ├─ Control Asistencia                                │
│    └─ Mi Historial                                      │
│                                                         │
│ 🎯 Designaciones (SI ASIGNADO)                          │
│    ├─ Mis Designaciones                                 │
│    └─ Próximas Designaciones                            │
│                                                         │
│ 👤 Mi Perfil                                            │
│    ├─ Ver mis datos                                     │
│    ├─ 🔴 Mis Permisos Actuales (NUEVO)                 │
│    └─ 🔴 Notificaciones de Cambios (NUEVO)             │
│                                                         │
└─────────────────────────────────────────────────────────┘

Permisos Asignados (ejemplo):
✓ Arbitros: VER, CREAR, EDITAR
✓ Asistencia: REGISTRAR, VER HISTORIAL
✓ Designaciones: VER MIS DESIGNACIONES

Acciones Disponibles:
✓ Ver módulos asignados
✓ Solicitar permisos adicionales
✓ Ver notificaciones de cambios
✗ Eliminar registros
✗ Ver datos de otros usuarios
```

---

## 🔄 FLUJOS PRINCIPALES

### Flujo 1: Nuevo Usuario se Registra

```
┌─────────────────────────────────────────────────────────┐
│  FLUJO: REGISTRO DE NUEVO CODAR                        │
└─────────────────────────────────────────────────────────┘

1️⃣  Usuario accede a /login/registro
    └─ Selecciona rol: COMISIÓN_CODAR

2️⃣  Completa formulario
    └─ DNI, Nombre, Email, Password

3️⃣  Backend crea usuario con:
    └─ estado = 'PENDIENTE'
    └─ rol = 'COMISIÓN_CODAR'
    └─ permisos = [] (vacío)

4️⃣  Usuario ve Dashboard con:
    ⚠️  "Tu cuenta está en revisión.
        La PRESIDENCIA aprobará tu solicitud en breve."

5️⃣  Email a PRESIDENCIA:
    📧 "Nuevo usuario CODAR pendiente de aprobación"
    [Botón: Aprobar] [Botón: Rechazar]

6️⃣  PRESIDENCIA hace clic en "Aprobar"
    └─ estado = 'ACTIVO'
    └─ Se abre panel de asignación de permisos

7️⃣  PRESIDENCIA selecciona permisos:
    ✓ Arbitros: VER, CREAR, EDITAR
    ✓ Asistencia: REGISTRAR
    ✓ Designaciones: VER MIS DESIGNACIONES

8️⃣  Email a Usuario:
    ✅ "Tu cuenta ha sido aprobada. Tienes acceso a:
        - Árbitros (Ver, Crear, Editar)
        - Asistencia (Registrar)
        - Designaciones (Mis designaciones)"

9️⃣  Usuario inicia sesión
    └─ Ve solo los módulos asignados

✅ FIN
```

### Flujo 2: PRESIDENCIA Asigna Permisos Dinámicamente

```
┌─────────────────────────────────────────────────────────┐
│  FLUJO: CAMBIAR PERMISOS (PRESIDENCIA)                  │
└─────────────────────────────────────────────────────────┘

1️⃣  PRESIDENCIA va a:
    Administración → Usuarios → [Seleccionar CODAR]

2️⃣  Ve pantalla "Gestionar Permisos"
    Muestra:
    - Usuario: Juan Pérez García
    - Estado: ACTIVO
    - Permisos Actuales: [VER]

3️⃣  PRESIDENCIA marca permisos a agregar:
    ☑️  Arbitros: CREAR
    ☑️  Designaciones: CREAR

4️⃣  Hace clic en "Actualizar Permisos"

5️⃣  Sistema solicita confirmación:
    "¿Agregar 2 permisos a Juan Pérez?"
    [Cancelar] [Confirmar]

6️⃣  Backend:
    ✓ Crea registros en usuario_permiso_dinamico
    ✓ Registra en auditoria_permisos
    ✓ Envía notificación al usuario

7️⃣  Usuario recibe notificación en tiempo real:
    🔔 "Se agregaron nuevos permisos:
        - Arbitros: CREAR
        - Designaciones: CREAR
        Asignado por: PRESIDENCIA
        Fecha: 2026-04-20 16:45"

8️⃣  Al siguiente login del usuario:
    └─ El menú muestra automáticamente nuevas opciones

✅ FIN
```

### Flujo 3: CODAR Solicita Permiso Adicional

```
┌─────────────────────────────────────────────────────────┐
│  FLUJO: SOLICITAR PERMISO (CODAR → PRESIDENCIA)         │
└─────────────────────────────────────────────────────────┘

1️⃣  CODAR intenta acceder a módulo no permitido
    └─ Ve: "No tienes permiso. [Solicitar Acceso]"

2️⃣  Hace clic en "Solicitar Acceso"
    Se abre modal:
    ┌─────────────────────────────────────┐
    │ Solicitar Permiso                   │
    │                                     │
    │ Permiso: Reportes - VER AVANZADO    │
    │                                     │
    │ Motivo (requerido):                 │
    │ ┌─────────────────────────────────┐ │
    │ │ Necesito generar reportes del   │ │
    │ │ mes pasado para análisis        │ │
    │ └─────────────────────────────────┘ │
    │                                     │
    │ [Cancelar] [Enviar Solicitud]       │
    └─────────────────────────────────────┘

3️⃣  Backend crea solicitud_permiso
    estado = 'PENDIENTE'

4️⃣  Email a PRESIDENCIA:
    📧 Juan Pérez solicita:
       Reportes - VER REPORTES AVANZADOS
       
       Motivo: Necesito generar reportes...
       
       [Botón: Aprobar] [Botón: Rechazar]

5️⃣  PRESIDENCIA elige Option A: APROBAR
    └─ Permiso se asigna automáticamente
    └─ estado de solicitud = 'APROBADA'

    O Option B: RECHAZAR
    └─ Se abre modal para escribir razón
    └─ estado de solicitud = 'RECHAZADA'

6️⃣  Email a Usuario:
    ✅ "Tu solicitud fue APROBADA"
    o
    ❌ "Tu solicitud fue RECHAZADA por: [razón]"

7️⃣  Auditoría registra:
    TIPO: SOLICITUD_PERMISO_APROBADA/RECHAZADA
    Usuario: Juan Pérez
    Permiso: reportes_ver_avanzado
    Respondido por: PRESIDENCIA
    Fecha: 2026-04-20 17:15

✅ FIN
```

---

## 🔐 PROTECCIONES DE SEGURIDAD

```
┌─────────────────────────────────────────────────────────┐
│           CAPAS DE SEGURIDAD                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1️⃣  AUTENTICACIÓN                                       │
│    ✓ JWT firmado (no DNI en texto plano)                │
│    ✓ Validación de token en cada request                │
│    ✓ Expiración de sesión                               │
│                                                         │
│ 2️⃣  ESTADO DE USUARIO                                   │
│    ✓ PENDIENTE: No accede a nada excepto Dashboard      │
│    ✓ ACTIVO: Accede según permisos dinámicos            │
│    ✓ INACTIVO: Denegado completamente                   │
│    ✓ SUSPENDIDO: Denegado por violación                 │
│                                                         │
│ 3️⃣  VALIDACIÓN DE PERMISOS                              │
│    ✓ Backend verifica CADA request                      │
│    ✓ Si no tiene permiso → 403 Forbidden                │
│    ✓ Frontend: menú dinámico (no muestra opciones)      │
│                                                         │
│ 4️⃣  AUDITORÍA COMPLETA                                  │
│    ✓ QUIÉN: Usuario que realizó la acción               │
│    ✓ QUÉ: Permiso asignado/revocado                     │
│    ✓ CUÁNDO: Timestamp exacto                           │
│    ✓ POR QUÉ: Razon del cambio                          │
│                                                         │
│ 5️⃣  AUTORIZACIÓN GRANULAR                               │
│    ✓ Por módulo: arbitros, asistencia, etc.             │
│    ✓ Por acción: VER, CREAR, EDITAR, ELIMINAR           │
│    ✓ Combinaciones específicas posibles                 │
│                                                         │
│ 6️⃣  PROTECCIONES ESPECIALES                             │
│    ✓ ADMIN: único que puede ver auditoría completa      │
│    ✓ ADMIN: único que puede cambiar roles               │
│    ✓ PRESIDENCIA: no puede eliminar usuarios            │
│    ✓ CODAR: no puede ver datos de otros CODARs          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 MATRIZ SIMPLIFICADA

```
MÓDULO                  ADMIN   PRES    CODAR   U.TÉCNICA
─────────────────────────────────────────────────────────
Arbitros                ✓✓✓     ✓✓      🔄      🔄
Asistencia              ✓✓✓     ✓✓      🔄      🔄
Designaciones           ✓✓✓     ✓✓      🔄      🔄
Campeonatos             ✓✓✓     ✓✓      🔄      🔄
Equipos                 ✓✓✓     ✓✓      🔄      🔄
Reportes                ✓✓✓     ✓✓      🔄      🔄
Usuarios                ✓✓✓     ✗✗      ✗✗      ✗✗
Roles y Permisos        ✓✓✓     ✗✗      ✗✗      ✗✗
Auditoría               ✓✓✓     🔄      ✗✗      ✗✗

LEYENDA:
✓✓✓ = Acceso completo
✓✓  = Acceso nivel PRESIDENCIA
🔄  = Dinámico (asignado por PRESIDENCIA)
✗✗  = Sin acceso
```

---

## 🎯 DATOS CLAVE A RECORDAR

```
┌─────────────────────────────────────────────────────────┐
│              PUNTOS CRÍTICOS                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. ADMINISTRADOR                                        │
│    → Acceso 100% para mantenimiento del sistema         │
│    → No requiere aprobación                             │
│    → Ver TODO en auditoría                              │
│                                                         │
│ 2. PRESIDENCIA                                          │
│    → Menú predefinido específico                        │
│    → Gestiona/aprueba nuevos CODAR                      │
│    → Asigna y revoca permisos dinámicamente             │
│    → Ver reportes de auditoría de SUS cambios           │
│                                                         │
│ 3. CODAR / UNIDAD TÉCNICA                               │
│    → Comienzan en PENDIENTE (esperando aprobación)      │
│    → Dashboard-only hasta aprobación                    │
│    → Permisos asignados dinámicamente (pueden cambiar)  │
│    → Pueden solicitar permisos adicionales              │
│                                                         │
│ 4. PERMISOS DINÁMICOS                                   │
│    → Se cambian SIN modificar rol del usuario           │
│    → En tiempo real                                     │
│    → Sin logout/login requerido                         │
│    → Auditoría completa de cambios                      │
│                                                         │
│ 5. AUDITORÍA COMPLETA                                   │
│    → Registra QUIÉN, QUÉ, CUÁNDO, POR QUÉ              │
│    → ADMIN ve todo                                      │
│    → PRESIDENCIA ve sus propios cambios                 │
│    → CODAR no ve auditoría                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 PRÓXIMOS PASOS

1. **IMPLEMENTAR FASE 1** → Tablas SQL + Entidades Java
2. **CREAR PermisoService** → Lógica de negocio
3. **DESARROLLAR Controllers** → Endpoints REST
4. **CONSTRUIR Frontend** → Componentes dinámicos
5. **TESTING COMPLETO** → Validar seguridad
6. **DEPLOY A PRODUCCIÓN** → Go live

**Tiempo Total Estimado:** 7-11 días

---

**Documento:** Resumen Visual Sistema de Roles  
**Versión:** 1.0  
**Fecha:** 20 de Abril, 2026
