# Solución: Usuarios no funcionan en producción

## Problema identificado

La base de datos **Neon (PostgreSQL)** está vacía. Los usuarios creados localmente no existen en la base de datos desplegada.

## Solución

### Opción 1: Ejecutar script SQL en Neon (Recomendado)

1. **Acceder a Neon Console:**
   - Ve a https://console.neon.tech
   - Selecciona tu proyecto SIDAF-PUNO
   - Click en "SQL Editor"

2. **Ejecutar el siguiente script:**

```sql
-- ============================================================
-- SEED DATA - USUARIOS INICIALES
-- SIDAF PUNO
-- ============================================================

-- USUARIO ADMINISTRADOR
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) VALUES (
    '12345678', 'Administrador', 'SIDAF Puno', 'admin@sidaf-puno.pe',
    'admin123', 'ADMIN', 'ACTIVO', 'SIDAF PUNO',
    '["TODOS"]', '951123456', CURRENT_TIMESTAMP
);

-- USUARIO PRESIDENTE
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) VALUES (
    '87654321', 'Presidente', 'SIDAF Puno', 'presidente@sidaf-puno.pe',
    'presi123', 'PRESIDENTE_SIDAF', 'ACTIVO', 'SIDAF PUNO',
    '["GESTION_ARBITROS", "GESTION_ASISTENCIA", "GESTION_DESIGNACIONES", "GESTION_CAMPEONATOS", "GESTION_EQUIPOS", "VER_REPORTES", "VER_ARBITROS"]',
    '952123456', CURRENT_TIMESTAMP
);

-- USUARIO ÁRBITRO
INSERT INTO usuarios (
    dni, nombre, apellido, email, password, rol, estado,
    unidad_organizacional, permisos_especificos, telefono, fecha_registro
) VALUES (
    '12345679', 'Juan', 'Perez Garcia', 'juan.parez@sidaf-puno.pe',
    'arbitro123', 'USUARIO_TECNICO', 'ACTIVO', 'SIDAF PUNO',
    '["GESTION_ASISTENCIA", "VER_ARBITROS"]', '953123456', CURRENT_TIMESTAMP
);
```

### Credenciales de acceso

| Rol | DNI | Contraseña |
|-----|-----|------------|
| Administrador | 12345678 | admin123 |
| Presidente | 87654321 | presi123 |
| Árbitro | 12345679 | arbitro123 |

---

### Opción 2: Registrarse desde la página web

1. Ve a: https://sidaf-puno-neon.vercel.app/login/registro
2. Usa el código secreto **333COPITO** para crear admin
3. Usa el código secreto **PRESI2024** para crear presidente

**Nota:** Los usuarios creados quedan en estado "PENDIENTE" y necesitan ser aprobados por un administrador.

---

## Estado de tareas

- [x] Analizar el problema
- [ ] Ejecutar script SQL en Neon (Pendiente)
- [ ] Probar acceso con nuevas credenciales
- [ ] Mejorar UI/UX (Pendiente)
