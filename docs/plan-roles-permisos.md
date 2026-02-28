# Plan de Roles y Permisos - SIDAF PUNO

## Estructura de Roles

### Roles del Sistema:

1. **ADMIN** (Administrador)
   - Acceso absoluto a todo el sistema
   - Solo 1 usuario: Rudy Alex
   - Puede gestionar usuarios y permisos

2. **PRESIDENCIA_CODAR** (Presidencia CODAR)
   - 1 usuario designado
   - Puede otorgar/quitar permisos a usuarios CODAR
   - Acceso a todas las funciones de gestión

3. **CODAR** (Usuario CODAR)
   - 5 usuarios máximos
   - Acceso según permisos otorgados por PRESIDENCIA_CODAR
   - Requiere completar registro de perfil obligatoriamente

## Flujo de Usuario

### 1. Login Inicial
```
Usuario ingresa con DNI + Contraseña
    ↓
Sistema verifica credenciales
    ↓
¿Usuario nuevo (estado = PENDING)?
    ↓ SÍ
    → Redirigir a formulario de registro de perfil
    ↓ NO
    → Verificar si tiene permisos activos
        ↓
        ¿Tiene permisos?
            ↓ SÍ
            → Acceder al dashboard
            ↓ NO
            → Mostrar mensaje "Sin permisos asignados"
```

### 2. Registro de Perfil (Primera vez)
- Formulario similar a "Nuevo Árbitro"
- Campos obligatorios:
  - Datos personales (nombre, apellido, DNI, fecha nacimiento)
  - Contacto (email, teléfono)
  - Información laboral (cargo en CODAR, área)
- Al completar, cambia estado de PENDING a ACTIVO

### 3. Gestión de Permisos (PRESIDENCIA_CODAR)
- Panel de administración de usuarios CODAR
- Puede activar/desactivar permisos específicos:
  - GESTION_ARBITROS
  - GESTION_CAMPEONATOS
  - GESTION_DESIGNACIONES
  - GESTION_ASISTENCIA
  - VER_REPORTES
  - GESTION_EQUIPOS

## Cambios Requeridos

### Backend:
1. Actualizar enum RolUsuario
2. Agregar campo `perfilCompleto` (boolean)
3. Crear endpoint para completar perfil
4. Crear endpoint para gestionar permisos de CODAR

### Frontend:
1. Actualizar formulario de registro
2. Crear página de completar perfil
3. Crear panel de gestión de permisos
4. Actualizar perfil para mostrar información

## Permisos Disponibles

| Permiso | Descripción |
|---------|-------------|
| VER_DASHBOARD | Ver panel de control |
| GESTION_ARBITROS | Crear/editar/eliminar árbitros |
| GESTION_CAMPEONATOS | Gestionar Campeonatos |
| GESTION_DESIGNACIONES | Crear designaciones |
| GESTION_ASISTENCIA | Control de asistencia |
| VER_REPORTES | Ver y generar reportes |
| GESTION_EQUIPOS | Gestionar equipos |
| GESTION_USUARIOS | Gestionar usuarios (solo Admin) |
| GESTION_PERMISOS | Asignar permisos (solo PRESIDENCIA) |

## Estados de Usuario

- **PENDING**: Nuevo usuario, debe completar perfil
- **ACTIVO**: Usuario activo con acceso según permisos
- **INACTIVO**: Usuario sin acceso al sistema
