// ============================================================
// EJEMPLO FUNCIONAL: FLUJO DE ROLES EN SIDAF PUNO
// Fecha: 20 de Abril, 2026
// ============================================================

/**
 * ESCENARIO REAL: 
 * 1. Juan Pérez se registra como CODAR
 * 2. PRESIDENCIA lo aprueba
 * 3. PRESIDENCIA le asigna permisos
 * 4. Juan accede a módulos
 * 5. Auditoría registra todo
 */

// ============================================================
// PASO 1: JUAN PÉREZ SE REGISTRA
// ============================================================

// URL: http://localhost:3000/login/registro
// FORMULARIO QUE COMPLETA:
{
  DNI: "12345678",
  Nombre: "Juan",
  Apellido: "Pérez",
  Email: "juan.perez@codar.puno.pe",
  Password: "MiContraseña123",
  Rol: "CODAR"  // Selecciona de dropdown
}

// RESULTADO EN BASE DE DATOS:
INSERT INTO usuarios (dni, nombre, apellido, email, rol, estado, fecha_registro) 
VALUES ('12345678', 'Juan', 'Pérez', 'juan.perez@codar.puno.pe', 'CODAR', 'PENDIENTE', NOW());

// Base de Datos ANTES:
┌─────────────────────────────────────┐
│ ID  │ Nombre      │ Rol    │ Estado   │
├─────────────────────────────────────┤
│ 1   │ Admin User  │ ADMIN  │ ACTIVO   │
│ 2   │ Presidencia │ PRES   │ ACTIVO   │
│ 3   │ Juan Pérez  │ CODAR  │ PENDIENTE│ ← NUEVO
└─────────────────────────────────────┘

// INTERFAZ QUE VE JUAN:
┌────────────────────────────────────────────────────┐
│                  DASHBOARD - JUAN PÉREZ             │
├────────────────────────────────────────────────────┤
│                                                    │
│ ⚠️  ESTADO: PENDIENTE DE APROBACIÓN                │
│                                                    │
│ Tu cuenta está en revisión.                        │
│ La PRESIDENCIA del CODAR aprobará tu solicitud    │
│ en breve.                                          │
│                                                    │
│ Acciones disponibles:                              │
│ ├─ Ver mi perfil                                   │
│ ├─ Ver mis permisos (vacío)                        │
│ └─ [Otros módulos deshabilitados]                  │
│                                                    │
└────────────────────────────────────────────────────┘

// CÓDIGO FRONTEND (login/page.tsx):
if ((user.rol === "CODAR" || user.rol === "UNIDAD_TECNICA_CODAR") && !user.perfilCompleto) {
    router.push("/dashboard/perfil-incompleto")  // ← Redirige aquí
}

// EMAIL A PRESIDENCIA:
┌────────────────────────────────────────────────────┐
│ 📧 NUEVO USUARIO REGISTRADO - REQUIERE APROBACIÓN  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Hola, se ha registrado un nuevo usuario CODAR:    │
│                                                    │
│ 👤 Nombre: Juan Pérez García                       │
│ 📧 Email: juan.perez@codar.puno.pe                │
│ 📍 Rol: CODAR                                      │
│ 📅 Fecha: 20/04/2026 15:45                         │
│                                                    │
│ [Botón: APROBAR] [Botón: RECHAZAR]                │
│                                                    │
└────────────────────────────────────────────────────┘


// ============================================================
// PASO 2: PRESIDENCIA LO VE EN PANEL DE CONTROL
// ============================================================

// URL: http://localhost:3000/dashboard/solicitudes
// PRESIDENCIA VE LISTA:

┌──────────────────────────────────────────────────────────┐
│            USUARIOS PENDIENTES DE APROBACIÓN             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Permiso Solicitado: Solicitud Inicial                  │
│  Usuario: Juan Pérez                                    │
│  Email: juan.perez@codar.puno.pe                        │
│  Solicitado: 20/04/2026 15:45                           │
│  Estado: PENDIENTE                                      │
│                                                          │
│  [APROBAR] [RECHAZAR]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘

// CÓDIGO BACKEND (SolicitudPermisoService.java):
List<SolicitudPermiso> solicitudes = 
  solicitudPermisoRepository.findByEstadoOrderByFechaSolicitudDesc("PENDIENTE");

// RETORNA JSON:
[
  {
    "id": 1,
    "usuarioId": 3,
    "usuarioNombre": "Juan Pérez",
    "permisoSolicitado": "Solicitud Inicial",
    "estado": "PENDIENTE",
    "fechaSolicitud": "2026-04-20T15:45:00"
  }
]


// ============================================================
// PASO 3: PRESIDENCIA APRUEBA A JUAN
// ============================================================

// PRESIDENCIA HACE CLIC EN "APROBAR"
// REQUEST POST: /api/solicitudes/1/responder
{
  "accion": "APROBADO",
  "respondidoPor": 2,  // ID de PRESIDENCIA
  "razonRechazo": null
}

// BACKEND PROCESA:
// 1. Busca solicitud con ID 1
// 2. Cambia estado a "APROBADO"
// 3. Registra respondidoPor = 2 (PRESIDENCIA)
// 4. Registra en auditoría

// RESPONSE:
{
  "id": 1,
  "usuarioId": 3,
  "usuarioNombre": "Juan Pérez",
  "permisoSolicitado": "Solicitud Inicial",
  "estado": "APROBADO",  // ← CAMBIÓ
  "fechaSolicitud": "2026-04-20T15:45:00",
  "fechaRespuesta": "2026-04-20T16:00:00",
  "respondidoPor": 2
}

// AUDITORÍA REGISTRA:
INSERT INTO auditoria_permisos 
(usuario_id, tipo_accion, permiso_id, fecha, respondido_por, razon) 
VALUES (3, 'SOLICITUD_PERMISO_APROBADA', 1, NOW(), 2, 'Aprobación inicial');

// EMAIL A JUAN:
┌────────────────────────────────────────────────────────┐
│ ✅ TU CUENTA HA SIDO APROBADA                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Hola Juan,                                             │
│                                                        │
│ ¡Excelente noticia! Tu cuenta ha sido aprobada.       │
│                                                        │
│ La PRESIDENCIA te asignará permisos específicos       │
│ en breve. Por favor espera notificaciones.             │
│                                                        │
│ Acceso: http://localhost:3000/login                   │
│                                                        │
│ Saludos,                                               │
│ Sistema SIDAF PUNO                                     │
│                                                        │
└────────────────────────────────────────────────────────┘

// Estado en BD se actualiza:
┌─────────────────────────────────────────┐
│ ID  │ Nombre      │ Rol    │ Estado    │
├─────────────────────────────────────────┤
│ 3   │ Juan Pérez  │ CODAR  │ ACTIVO │  ← CAMBIÓ
└─────────────────────────────────────────┘


// ============================================================
// PASO 4: PRESIDENCIA ASIGNA PERMISOS A JUAN
// ============================================================

// URL: http://localhost:3000/dashboard/usuarios/3/permisos
// PRESIDENCIA VE FORMULARIO:

┌────────────────────────────────────────────────────────┐
│       ASIGNAR PERMISOS A: JUAN PÉREZ                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ 📋 MÓDULO ÁRBITROS                                     │
│   ☑️ VER (permitido)                                   │
│   ☑️ CREAR (nuevo)                                     │
│   ☑️ EDITAR (nuevo)                                    │
│   ☐ ELIMINAR (no asignar)                             │
│                                                        │
│ 📊 MÓDULO ASISTENCIA                                   │
│   ☑️ REGISTRAR (nuevo)                                 │
│   ☑️ VER HISTORIAL (nuevo)                             │
│   ☐ EDITAR (no asignar)                               │
│                                                        │
│ 🎯 MÓDULO DESIGNACIONES                                │
│   ☑️ VER MIS DESIGNACIONES (nuevo)                     │
│   ☐ CREAR (no asignar)                                │
│                                                        │
│                                                        │
│ 📝 Razón (opcional):                                   │
│ ["CODAR Regular - Permisos Estándar"]                 │
│                                                        │
│ [CANCELAR] [ASIGNAR PERMISOS]                         │
│                                                        │
└────────────────────────────────────────────────────────┘

// PRESIDENCIA SELECCIONA PERMISOS Y CONFIRMA

// REQUEST POST: /api/usuarios/3/permisos
{
  "usuarioId": 3,
  "permisosIds": [1, 2, 3, 4, 5, 6],  // IDs de permisos
  "razon": "CODAR Regular - Permisos Estándar"
}

// BACKEND PROCESA:
// 1. Valida que PRESIDENCIA (ID 2) puede hacer esto
// 2. Para cada permiso:
//    - INSERT INTO usuario_permiso_dinamico
//    - INSERT INTO auditoria_permisos

// AUDITORÍA REGISTRA:
INSERT INTO auditoria_permisos 
(usuario_id, tipo_accion, permiso_id, fecha, asignado_por, razon) 
VALUES 
  (3, 'PERMISO_ASIGNADO', 1, NOW(), 2, 'CODAR Regular - Permisos Estándar'),
  (3, 'PERMISO_ASIGNADO', 2, NOW(), 2, 'CODAR Regular - Permisos Estándar'),
  (3, 'PERMISO_ASIGNADO', 3, NOW(), 2, 'CODAR Regular - Permisos Estándar'),
  ...;

// TABLA usuario_permiso_dinamico:
┌──────────────────────────────────────────────────────┐
│ ID │ Usuario │ Permiso       │ Asignado_por │ Fecha  │
├──────────────────────────────────────────────────────┤
│ 1  │ 3       │ arbitros_ver  │ 2            │ 20-04  │
│ 2  │ 3       │ arbitros_crear│ 2            │ 20-04  │
│ 3  │ 3       │ arbitros_edit │ 2            │ 20-04  │
│ 4  │ 3       │ asist_registr │ 2            │ 20-04  │
│ 5  │ 3       │ asist_histor  │ 2            │ 20-04  │
│ 6  │ 3       │ desig_ver_mis │ 2            │ 20-04  │
└──────────────────────────────────────────────────────┘

// EMAIL A JUAN:
┌────────────────────────────────────────────────────────┐
│ 📋 NUEVOS PERMISOS ASIGNADOS                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Hola Juan,                                             │
│                                                        │
│ ¡Buenas noticias! Se te han asignado nuevos permisos: │
│                                                        │
│ ✅ Árbitros: VER, CREAR, EDITAR                       │
│ ✅ Asistencia: REGISTRAR, VER HISTORIAL               │
│ ✅ Designaciones: VER MIS DESIGNACIONES               │
│                                                        │
│ Puedes acceder a estos módulos ahora mismo.           │
│                                                        │
│ Acceso: http://localhost:3000/dashboard               │
│                                                        │
│ Saludos,                                               │
│ Sistema SIDAF PUNO                                     │
│                                                        │
└────────────────────────────────────────────────────────┘


// ============================================================
// PASO 5: JUAN INICIA SESIÓN Y VE SU MENÚ DINÁMICO
// ============================================================

// URL: http://localhost:3000/login
// JUAN INGRESA:
{
  DNI: "12345678",
  Password: "MiContraseña123"
}

// BACKEND (auth/login):
// 1. Busca usuario por DNI
// 2. Valida contraseña
// 3. Genera JWT con rol
// 4. Devuelve token

// RESPONSE:
{
  "id": 3,
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@codar.puno.pe",
  "rol": "CODAR",
  "estado": "ACTIVO",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "permisosEspecificos": "[\"arbitros_ver\", \"arbitros_crear\", \"asist_registr\", ...]"
}

// FRONTEND GUARDA EN localStorage:
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

// JUAN VE DASHBOARD CON MENÚ DINÁMICO:
┌──────────────────────────────────────────────────────┐
│              MENÚ DINÁMICO - JUAN PÉREZ               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🏠 Inicio                                            │
│                                                      │
│ 👤 Mi Perfil                                         │
│    ├─ Ver mis datos                                  │
│    ├─ Mis permisos actuales ✨                      │
│    └─ Notificaciones                                 │
│                                                      │
│ 📋 Solicitudes de Permiso                            │
│    ├─ Solicitar Permiso                              │
│    └─ Ver mis solicitudes                            │
│                                                      │
│ 🔑 Árbitros (SI - tiene permisos)                    │
│    ├─ Listar Árbitros                                │
│    ├─ Crear Árbitro                                  │
│    └─ Editar Árbitro                                 │
│                                                      │
│ ⏱️  Asistencia (SI - tiene permisos)                 │
│    ├─ Registrar Asistencia                           │
│    └─ Ver Mi Historial                               │
│                                                      │
│ 🎯 Designaciones (SI - tiene permisos)               │
│    └─ Ver Mis Designaciones                          │
│                                                      │
│ 📊 Reportes (NO - sin permisos)                      │
│    └─ [Deshabilitado]                                │
│                                                      │
│ ⚙️  Administración (NO - sin permisos)               │
│    └─ [Deshabilitado]                                │
│                                                      │
└──────────────────────────────────────────────────────┘

// CÓDIGO FRONTEND (MenuDinamico.tsx):
const infoUsuario = await rolesService.obtenerInfoUsuario(3);
const rol = infoUsuario.datos?.rol?.nombre; // "CODAR"

// Construye menú basado en rol y permisos:
if (rol === "CODAR") {
  menuItems.push({
    icon: <Users className="h-5 w-5" />,
    label: "Árbitros",
    href: "/dashboard/arbitros",
    visible: true,  // ← VISIBLE
  });
}

// RESPONSE al cargar menú:
[
  { icon: "home", label: "Inicio", href: "/dashboard", visible: true },
  { icon: "user", label: "Mi Perfil", href: "/dashboard/perfil", visible: true },
  { icon: "file", label: "Solicitudes", href: "/dashboard/solicitudes", visible: true },
  { icon: "users", label: "Árbitros", href: "/dashboard/arbitros", visible: true },
  { icon: "clock", label: "Asistencia", href: "/dashboard/asistencia", visible: true },
  { icon: "target", label: "Designaciones", href: "/dashboard/designaciones", visible: true }
]


// ============================================================
// PASO 6: JUAN INTENTA CREAR UN ÁRBITRO
// ============================================================

// URL: http://localhost:3000/dashboard/arbitros/nuevo
// JUAN COMPLETA FORMULARIO Y HACE CLIC EN "CREAR"

// REQUEST POST: /api/arbitros
// HEADERS:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}

// BODY:
{
  "nombre": "Miguel",
  "apellido": "García",
  "dni": "87654321",
  "email": "miguel@ejemplo.com",
  "categoria": "Primera",
  "especialidad": "Fútbol"
}

// BACKEND VALIDA (ArbitroController.java):
// 1. Extrae JWT del header
// 2. Valida token (firma, expiración)
// 3. Obtiene usuarioId = 3 del token
// 4. Busca usuario en BD
// 5. Verifica rol = "CODAR" ✓
// 6. VERIFICA PERMISO = "arbitros_crear" ✓
// 7. SI TIENE → Crea árbitro
// 8. SI NO TIENE → Retorna 403 Forbidden

// AUDITORÍA REGISTRA:
INSERT INTO auditoria_permisos 
(usuario_id, tipo_accion, fecha) 
VALUES (3, 'ARBITRO_CREADO', NOW());

// RESPONSE (201 Created):
{
  "id": 105,
  "nombre": "Miguel",
  "apellido": "García",
  "dni": "87654321",
  "categoria": "Primera",
  "especialidad": "Fútbol",
  "fechaRegistro": "2026-04-20T16:30:00"
}

// FRONTEND MUESTRA MENSAJE:
┌────────────────────────────────────────────────────┐
│ ✅ ÁRBITRO CREADO EXITOSAMENTE                     │
├────────────────────────────────────────────────────┤
│                                                    │
│ Árbitro: Miguel García                             │
│ DNI: 87654321                                      │
│ Categoría: Primera                                 │
│                                                    │
│ [Cerrar]                                           │
│                                                    │
└────────────────────────────────────────────────────┘


// ============================================================
// PASO 7: JUAN INTENTA ELIMINAR UN ÁRBITRO (SIN PERMISO)
// ============================================================

// URL: http://localhost:3000/dashboard/arbitros/105/eliminar
// JUAN HACE CLIC EN BOTÓN "ELIMINAR" (pero no lo ve porque no tiene permiso)

// PERO SI INTENTA VÍA API:
// REQUEST DELETE: /api/arbitros/105
// HEADERS:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
}

// BACKEND VALIDA:
// 1. Extrae JWT
// 2. Usuario = 3 (Juan)
// 3. Rol = "CODAR"
// 4. VERIFICA PERMISO = "arbitros_eliminar" ✗ NO TIENE
// 5. RETORNA 403

// RESPONSE (403 Forbidden):
{
  "error": "No tienes permiso para eliminar árbitros",
  "statusCode": 403,
  "timestamp": "2026-04-20T16:35:00"
}

// AUDITORÍA REGISTRA EL INTENTO:
INSERT INTO auditoria_permisos 
(usuario_id, tipo_accion, fecha, resultado) 
VALUES (3, 'INTENTO_ELIMINAR_ARBITRO', NOW(), 'RECHAZADO - SIN PERMISO');

// FRONTEND MUESTRA ERROR:
┌────────────────────────────────────────────────────┐
│ ❌ ACCESO DENEGADO                                 │
├────────────────────────────────────────────────────┤
│                                                    │
│ No tienes permiso para eliminar árbitros.         │
│ Contacta a PRESIDENCIA si lo necesitas.            │
│                                                    │
│ [Cerrar]                                           │
│                                                    │
└────────────────────────────────────────────────────┘


// ============================================================
// PASO 8: JUAN SOLICITA UN PERMISO ADICIONAL (ELIMINAR)
// ============================================================

// URL: http://localhost:3000/dashboard/solicitudes/nuevo
// JUAN COMPLETA FORMULARIO:

┌────────────────────────────────────────────────────┐
│       SOLICITAR PERMISO ADICIONAL                  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Permiso Solicitado:                                │
│ ☑ Arbitros: ELIMINAR                               │
│                                                    │
│ Descripción (opcional):                            │
│ "Necesito poder eliminar árbitros incorrectos"    │
│                                                    │
│ [CANCELAR] [SOLICITAR]                             │
│                                                    │
└────────────────────────────────────────────────────┘

// REQUEST POST: /api/solicitudes
{
  "usuarioId": 3,
  "permisoSolicitado": "arbitros_eliminar",
  "descripcion": "Necesito poder eliminar árbitros incorrectos"
}

// BACKEND:
INSERT INTO solicitud_permiso 
(usuario_id, usuario_nombre, permiso_solicitado, descripcion, estado, fecha_solicitud) 
VALUES (3, 'Juan Pérez', 'arbitros_eliminar', 'Necesito poder..', 'PENDIENTE', NOW());

// RESPONSE:
{
  "id": 2,
  "usuarioId": 3,
  "usuarioNombre": "Juan Pérez",
  "permisoSolicitado": "arbitros_eliminar",
  "estado": "PENDIENTE",
  "fechaSolicitud": "2026-04-20T16:40:00"
}

// EMAIL A PRESIDENCIA:
┌────────────────────────────────────────────────────┐
│ 📋 NUEVA SOLICITUD DE PERMISO                      │
├────────────────────────────────────────────────────┤
│                                                    │
│ Usuario: Juan Pérez                                │
│ Permiso Solicitado: Arbitros - Eliminar            │
│ Razón: Necesito poder eliminar árbitros incorrectos│
│ Fecha: 20/04/2026 16:40                            │
│                                                    │
│ [APROBAR] [RECHAZAR]                               │
│                                                    │
└────────────────────────────────────────────────────┘

// PRESIDENCIA APRUEBA O RECHAZA (igual al Paso 3)


// ============================================================
// PASO 9: ADMIN VE AUDITORÍA COMPLETA (JUAN NO LA VE)
// ============================================================

// ADMIN URL: http://localhost:3000/dashboard/auditoria
// ADMIN VE TODA LA HISTORIA:

┌──────────────────────────────────────────────────────────────┐
│              AUDITORÍA COMPLETA DEL SISTEMA                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 📅 20/04/2026 16:40:00 │ Juan Pérez       │ SOLICITUD...   │
│    SOLICITUD_PERMISO_PENDIENTE                              │
│    Permiso: arbitros_eliminar                               │
│                                                              │
│ 📅 20/04/2026 16:35:00 │ Juan Pérez       │ INTENTO...     │
│    INTENTO_ELIMINAR_ARBITRO (RECHAZADO - SIN PERMISO)      │
│                                                              │
│ 📅 20/04/2026 16:30:00 │ Juan Pérez       │ ARBITRO...     │
│    ARBITRO_CREADO                                           │
│    Árbitro: Miguel García (ID: 105)                         │
│                                                              │
│ 📅 20/04/2026 16:00:00 │ Presidencia      │ SOLICITUD...   │
│    SOLICITUD_PERMISO_APROBADA                               │
│    Usuario: Juan Pérez                                      │
│                                                              │
│ 📅 20/04/2026 15:50:00 │ Presidencia      │ PERMISOS...    │
│    PERMISOS_ASIGNADOS (6 permisos)                          │
│    Usuario: Juan Pérez                                      │
│                                                              │
│ 📅 20/04/2026 15:45:00 │ Juan Pérez       │ USUARIO...     │
│    USUARIO_REGISTRADO                                       │
│    Rol: CODAR                                               │
│                                                              │
│ [Filtrar por usuario] [Filtrar por acción] [Exportar]      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

// PERO JUAN NO PUEDE VER ESTO (sin permiso)
// Si intenta acceder:
// 403 Forbidden - "No tienes permiso para ver auditoría"


// ============================================================
// COMPARATIVA: ACCESO POR ROL
// ============================================================

// MISMO ENDPOINT: GET /api/arbitros/105

// ✅ ADMIN intenta:
//    → Valida rol = ADMIN
//    → ¡SIN VALIDAR PERMISOS! (ADMIN siempre puede todo)
//    → 200 OK - Devuelve árbitro

// ✅ PRESIDENCIA intenta:
//    → Valida rol = PRESIDENCIA_CODAR
//    → ¡SIN VALIDAR PERMISOS! (PRESIDENCIA siempre puede todo)
//    → 200 OK - Devuelve árbitro

// ✅ JUAN intenta (tiene permiso arbitros_ver):
//    → Valida rol = CODAR
//    → Valida permiso = "arbitros_ver" ✓
//    → 200 OK - Devuelve árbitro

// ❌ OTRO_CODAR intenta (sin permiso arbitros_ver):
//    → Valida rol = CODAR
//    → Valida permiso = "arbitros_ver" ✗
//    → 403 Forbidden - "Sin permiso"


// ============================================================
// RESUMEN DE FLUJO COMPLETO
// ============================================================

/*
┌─────────────────────────────────────────────────────────────┐
│                 LÍNEA DE TIEMPO - JUAN PÉREZ                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 15:45 → REGISTRA en /login/registro                        │
│         Estado: PENDIENTE                                   │
│         Menú: DESHABILITADO                                 │
│         📧 Email a PRESIDENCIA: "Nuevousuario"             │
│                                                             │
│ 16:00 → PRESIDENCIA APRUEBA                                │
│         Estado: ACTIVO                                      │
│         Acceso: Limitado (esperando permisos)               │
│         📧 Email a Juan: "Aprobado"                         │
│                                                             │
│ 16:00 → PRESIDENCIA ASIGNA PERMISOS                        │
│         Permisos: 6 asignados                               │
│         Menú: HABILITADO                                    │
│         📧 Email a Juan: "Permisos asignados"               │
│                                                             │
│ 16:20 → JUAN INICIA SESIÓN                                 │
│         Estado: ACTIVO                                      │
│         Menú: Dinámico (solo módulos asignados)            │
│         JWT: Token válido                                   │
│                                                             │
│ 16:30 → JUAN CREA ÁRBITRO                                  │
│         Permiso: arbitros_crear ✓                           │
│         Resultado: 201 Created                              │
│         📝 Auditoría: "ARBITRO_CREADO"                      │
│                                                             │
│ 16:35 → JUAN INTENTA ELIMINAR                              │
│         Permiso: arbitros_eliminar ✗                        │
│         Resultado: 403 Forbidden                            │
│         📝 Auditoría: "INTENTO_RECHAZADO"                   │
│                                                             │
│ 16:40 → JUAN SOLICITA PERMISO ELIMINAR                     │
│         Estado Solicitud: PENDIENTE                         │
│         📧 Email a PRESIDENCIA                              │
│         📝 Auditoría: "SOLICITUD_PERMISO_PENDIENTE"        │
│                                                             │
│ 🔄 REPETIR desde PASO 3 si PRESIDENCIA aprueba             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/


// ============================================================
// VALIDACIONES QUE OCURREN
// ============================================================

VALIDACIÓN 1: TOKEN JWT
├─ ¿Token válido? ✓
├─ ¿Token expirado? ✗
└─ ¿Firma correcta? ✓

VALIDACIÓN 2: USUARIO
├─ ¿Usuario existe? ✓
├─ ¿Estado = ACTIVO? ✓
└─ ¿Cuenta no suspendida? ✓

VALIDACIÓN 3: ROL
├─ ¿Rol es ADMIN? → SIN VALIDAR PERMISOS
├─ ¿Rol es PRESIDENCIA? → SIN VALIDAR PERMISOS
├─ ¿Rol es CODAR? → VALIDAR PERMISOS
└─ ¿Rol es UNIDAD_TÉCNICA? → VALIDAR PERMISOS

VALIDACIÓN 4: PERMISOS (solo si CODAR o UNIDAD_TÉCNICA)
├─ ¿Tiene permiso de módulo? ✓
├─ ¿Tiene permiso de acción? ✓
└─ Si alguno falla → 403 Forbidden

VALIDACIÓN 5: AUDITORÍA
├─ Registra quién hizo qué
├─ Registra cuándo
├─ Registra resultado (éxito/error)
└─ Registra razón (si corresponde)
