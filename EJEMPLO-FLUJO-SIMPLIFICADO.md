# 📊 RESUMEN VISUAL DEL FLUJO - FUNCIONAMIENTO DE ROLES

## 🎯 ESCENARIO: Juan Pérez (CODAR) 

```
MOMENTO 1: REGISTRO
─────────────────────────────────────────────────────────────
Juan accede a: /login/registro

┌─────────────────────────────┐
│  REGISTRA COMO CODAR        │
│  ────────────────           │
│  DNI: 12345678              │
│  Nombre: Juan Pérez         │
│  Email: juan@codar.pe       │
│  Contraseña: *****          │
│  Rol: 📋 CODAR              │
│  [REGISTRAR]                │
└─────────────────────────────┘
           ↓
    BASE DE DATOS
    Estado: PENDIENTE ⚠️
    
           ↓
    JUAN VE EN DASHBOARD:
    
    ⚠️  "Tu cuenta está pendiente
         de aprobación"
    
    Acceso: ❌ Bloqueado


MOMENTO 2: PRESIDENCIA APRUEBA
─────────────────────────────────────────────────────────────
PRESIDENCIA ve: /dashboard/solicitudes

┌─────────────────────────────────────────┐
│  USUARIOS PENDIENTES                    │
│  ───────────────────                    │
│  Juan Pérez - PENDIENTE                 │
│                                         │
│  [APROBAR]  [RECHAZAR]                  │
└─────────────────────────────────────────┘
        ↓ (click APROBAR)
        
    BASE DE DATOS
    Estado: ACTIVO ✅
    
    JUAN RECIBE EMAIL:
    ✅ "Tu cuenta ha sido aprobada"


MOMENTO 3: PRESIDENCIA ASIGNA PERMISOS
─────────────────────────────────────────────────────────────
PRESIDENCIA selecciona permisos para Juan:

    ☑️  Árbitros: VER, CREAR, EDITAR (NO eliminar)
    ☑️  Asistencia: REGISTRAR, VER HISTORIAL
    ☑️  Designaciones: VER MIS DESIGNACIONES
    
    [ASIGNAR PERMISOS]
        ↓
    TABLA usuario_permiso_dinamico:
    ├─ arbitros_ver
    ├─ arbitros_crear
    ├─ arbitros_edit
    ├─ asistencia_registrar
    ├─ asistencia_historial
    └─ designaciones_ver_mis
    
    JUAN RECIBE EMAIL:
    📋 "Se te asignaron permisos:
        - Árbitros: VER, CREAR, EDITAR
        - Asistencia: REGISTRAR
        - Designaciones: VER MIS"


MOMENTO 4: JUAN INICIA SESIÓN
─────────────────────────────────────────────────────────────
JUAN: /login

┌──────────────────────────────┐
│  LOGIN                       │
│  ──────                      │
│  DNI: 12345678               │
│  Password: *****             │
│  [INGRESAR]                  │
└──────────────────────────────┘
        ↓
    BACKEND VALIDA:
    1. ¿DNI existe? ✓
    2. ¿Contraseña correcta? ✓
    3. ¿Estado = ACTIVO? ✓
    4. Genera JWT TOKEN
        ↓
    FRONTEND GUARDA:
    localStorage.user = {...}
    localStorage.token = "JWT..."
        ↓
    JUAN VE MENÚ DINÁMICO:
    
    🏠 Inicio
    👤 Mi Perfil
    📋 Solicitudes de Permiso
    🔑 Árbitros         ← ✅ HABILITADO
    ⏱️  Asistencia      ← ✅ HABILITADO
    🎯 Designaciones    ← ✅ HABILITADO
    📊 Reportes         ← ❌ DESHABILITADO
    ⚙️  Administración   ← ❌ DESHABILITADO


MOMENTO 5: JUAN CREA UN ÁRBITRO (CON PERMISO)
─────────────────────────────────────────────────────────────
JUAN: /dashboard/arbitros/nuevo

┌────────────────────────────────────┐
│  CREAR ÁRBITRO                     │
│  ──────────────                    │
│  Nombre: Miguel García             │
│  DNI: 87654321                     │
│  Categoría: Primera                │
│  [CREAR]                           │
└────────────────────────────────────┘
        ↓
    REQUEST: POST /api/arbitros
    HEADER: Authorization: Bearer JWT...
    
    BACKEND VALIDA:
    ┌─────────────────────────────────┐
    │ 1. ¿Token válido? ✓             │
    │ 2. ¿Usuario = Juan? ✓           │
    │ 3. ¿Estado = ACTIVO? ✓          │
    │ 4. ¿Rol = CODAR? ✓              │
    │ 5. ¿Permiso "arbitros_crear"? ✓│
    │    → TODAS LAS VALIDACIONES OK   │
    │    → 201 CREATED                │
    │    → Inserta árbitro             │
    │    → Registra en AUDITORÍA       │
    └─────────────────────────────────┘
        ↓
    JUAN VE:
    ✅ "Árbitro creado exitosamente"
        ID: 105
        Nombre: Miguel García


MOMENTO 6: JUAN INTENTA ELIMINAR (SIN PERMISO)
─────────────────────────────────────────────────────────────
JUAN intenta: DELETE /api/arbitros/105

    REQUEST: DELETE /api/arbitros/105
    HEADER: Authorization: Bearer JWT...
    
    BACKEND VALIDA:
    ┌─────────────────────────────────┐
    │ 1. ¿Token válido? ✓             │
    │ 2. ¿Usuario = Juan? ✓           │
    │ 3. ¿Estado = ACTIVO? ✓          │
    │ 4. ¿Rol = CODAR? ✓              │
    │ 5. ¿Permiso "arbitros_eliminar"?❌│
    │    → VALIDACIÓN FALLÓ            │
    │    → 403 FORBIDDEN               │
    │    → NO INSERTA ÁRBITRO          │
    │    → Registra INTENTO en AUDIT.  │
    └─────────────────────────────────┘
        ↓
    JUAN VE:
    ❌ "No tienes permiso para eliminar
        Contacta a PRESIDENCIA"
        
    AUDITORÍA REGISTRA:
    [INTENTO_ELIMINAR_ARBITRO] - RECHAZADO


MOMENTO 7: JUAN SOLICITA MÁS PERMISOS
─────────────────────────────────────────────────────────────
JUAN: /dashboard/solicitudes/nueva

┌────────────────────────────────────┐
│  SOLICITAR PERMISO                 │
│  ──────────────────                │
│  Permiso: Arbitros - ELIMINAR      │
│  Razón: Necesito corregir datos    │
│  [SOLICITAR]                       │
└────────────────────────────────────┘
        ↓
    BASE DE DATOS:
    estado_solicitud = PENDIENTE
    
    📧 EMAIL A PRESIDENCIA:
    "Juan solicita: arbitros_eliminar"
    [APROBAR] [RECHAZAR]
        ↓
    SI PRESIDENCIA APRUEBA:
    - Permiso se asigna
    - Juan recibe email
    - Auditoría registra
    - Juan puede eliminar desde ahora
        ↓
    SI PRESIDENCIA RECHAZA:
    - Solicitud rechazada
    - Juan recibe email con razón
    - Auditoría registra
    - Juan NO puede eliminar


MOMENTO 8: ADMIN VE AUDITORÍA (JUAN NO LA VE)
─────────────────────────────────────────────────────────────
ADMIN: /dashboard/auditoria

┌──────────────────────────────────────────────┐
│  AUDITORÍA COMPLETA (ADMIN SOLO)             │
│  ────────────────────────────────────────────│
│  16:40 → Juan Pérez → SOLICITUD_PENDIENTE    │
│  16:35 → Juan Pérez → INTENTO_RECHAZADO ❌   │
│  16:30 → Juan Pérez → ARBITRO_CREADO ✅      │
│  16:00 → Presidencia → PERMISOS_ASIGNADOS    │
│  16:00 → Presidencia → USUARIO_APROBADO     │
│  15:45 → Juan Pérez → USUARIO_REGISTRADO    │
└──────────────────────────────────────────────┘

    JUAN NO VE ESTO:
    403 Forbidden
    "No tienes permiso para ver auditoría"
```

---

## 📊 TABLA COMPARATIVA FINAL

```
ACCIÓN              ADMIN   PRESIDENCIA  CODAR (con perm)  CODAR (sin perm)
─────────────────────────────────────────────────────────────────────────
Ver Árbitros        ✅      ✅           ✅                ❌
Crear Árbitro       ✅      ✅           ✅                ❌
Editar Árbitro      ✅      ✅           ✅                ❌
Eliminar Árbitro    ✅      ✅           ❌                ❌
Ver Asistencia      ✅      ✅           ✅                ❌
Registrar Asistencia✅      ✅           ✅                ❌
Gestionar Usuarios  ✅      ❌           ❌                ❌
Cambiar Roles       ✅      ❌           ❌                ❌
Ver Auditoría       ✅      Parcial      ❌                ❌
Aprobar Usuarios    ✅      ✅           ❌                ❌
Asignar Permisos    ✅      ✅           ❌                ❌

KEY:
✅ = Acceso permitido
❌ = Acceso denegado (403)
Parcial = Solo ve sus cambios
```

---

## ✅ CONCLUSIÓN

El sistema actual:
- ✅ Valida tokens JWT
- ✅ Valida roles en backend
- ✅ Valida permisos dinámicos
- ✅ Registra auditoría completa
- ✅ Menú dinámico en frontend
- ✅ Bloquea acceso sin permiso (403)

**LISTO PARA MEJORAS** 🚀
