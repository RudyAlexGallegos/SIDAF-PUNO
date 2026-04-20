# ✅ CHECKLIST IMPLEMENTACIÓN - SISTEMA DE ROLES

**Fecha Creación:** 20 de Abril, 2026  
**Estado:** Listo para Implementación  
**Responsable:** [A Asignar]

---

## 📋 FASE 1: INFRAESTRUCTURA (Días 1-2)

### Base de Datos - SQL

- [ ] Crear tabla `roles`
  ```sql
  CREATE TABLE roles (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      nombre VARCHAR(50) UNIQUE NOT NULL,
      descripcion TEXT,
      estado VARCHAR(20) NOT NULL,
      jerarquia INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Insertar roles base
  ```sql
  INSERT INTO roles VALUES
  (1, 'ADMINISTRADOR', 'Administrador del sistema', 'ACTIVO', 1),
  (2, 'PRESIDENCIA', 'Presidencia CODAR', 'ACTIVO', 2),
  (3, 'COMISIÓN_CODAR', 'Comisión CODAR', 'ACTIVO', 3),
  (4, 'UNIDAD_TÉCNICA', 'Unidad Técnica', 'ACTIVO', 3);
  ```

- [ ] Crear tabla `permisos`
- [ ] Crear tabla `rol_permiso_default`
- [ ] Crear tabla `usuario_permiso_dinamico`
- [ ] Crear tabla `auditoria_permisos`
- [ ] Crear tabla `solicitud_permiso`
- [ ] Crear índices en tablas
- [ ] Crear trigger para updated_at

### Backend Java - Entidades

- [ ] Crear `Rol.java`
- [ ] Crear `Permiso.java`
- [ ] Crear `UsuarioPermisoDinamico.java`
- [ ] Crear `AuditoriaPermiso.java`
- [ ] Crear `SolicitudPermiso.java`
- [ ] Crear enum `EstadoUsuario`
- [ ] Crear enum `EstadoPermiso`
- [ ] Crear enum `TipoCambio`
- [ ] Actualizar `Usuario.java` con nuevos campos

### Backend Java - Repositories

- [ ] Crear `RolRepository.java`
- [ ] Crear `PermisoRepository.java`
- [ ] Crear `UsuarioPermisoDinamicoRepository.java`
- [ ] Crear `AuditoriaPermisoRepository.java`
- [ ] Crear `SolicitudPermisoRepository.java`
- [ ] Agregar métodos de búsqueda

### pom.xml - Dependencias

- [ ] Verificar Jakarta Validation API
- [ ] Verificar Spring Security
- [ ] Agregar si falta: JWT/JJWT

**Tiempo Estimado:** 1-2 días  
**Responsable:** Backend Developer

---

## 📋 FASE 2: BACKEND (Días 3-5)

### Servicios

- [ ] Crear `PermisoService.java`
  - [ ] Método: `tienePermiso(usuarioId, codigoPermiso)`
  - [ ] Método: `asignarPermiso(usuarioId, permisoId, presidenciaId, razon)`
  - [ ] Método: `revocarPermiso(usuarioId, permisoId, presidenciaId, razon)`
  - [ ] Método: `obtenerTodosLosPermisos(usuarioId)`
  - [ ] Método: `aprobarCodar(usuarioId, presidenciaId)`
  - [ ] Método: `rechazarCodar(usuarioId, razon)`
  - [ ] Método: `registrarAuditoria(...)`

- [ ] Crear `SolicitudPermisoService.java`
  - [ ] Método: `crearSolicitud(usuarioId, permisoId, motivo)`
  - [ ] Método: `aprobarSolicitud(solicitudId, presidenciaId)`
  - [ ] Método: `rechazarSolicitud(solicitudId, razon)`

### Controllers

- [ ] Crear `PermisoController.java`
  - [ ] POST `/api/admin/permisos/asignar`
  - [ ] POST `/api/admin/permisos/revocar`
  - [ ] GET `/api/admin/permisos/auditoria`
  - [ ] GET `/api/usuario/permisos/mis-permisos`
  - [ ] GET `/api/usuario/permisos/disponibles`

- [ ] Crear `SolicitudPermisoController.java`
  - [ ] POST `/api/usuario/solicitudes/crear`
  - [ ] GET `/api/usuario/solicitudes/mis-solicitudes`
  - [ ] GET `/api/admin/solicitudes/pendientes`
  - [ ] POST `/api/admin/solicitudes/{id}/aprobar`
  - [ ] POST `/api/admin/solicitudes/{id}/rechazar`

- [ ] Modificar `AuthController.java`
  - [ ] Endpoint para aprobar CODAR nuevos
  - [ ] Endpoint para listar CODARs pendientes
  - [ ] Agregar asignación de permisos al registro

### Security

- [ ] Crear `PermisoFilter.java`
  - [ ] Validar estado PENDIENTE → denegar acceso
  - [ ] Validar estado ACTIVO → permitir según permisos
  - [ ] Validar permisos en cada request

- [ ] Crear `@RequierePermiso` (anotación personalizada)
  ```java
  @RequierePermiso("arbitros_ver")
  public ResponseEntity<?> getArbitros() { ... }
  ```

- [ ] Implementar SecurityConfig
  - [ ] Agregar PermisoFilter a cadena de filtros

### Validaciones

- [ ] Validar que ADMIN siempre tiene acceso
- [ ] Validar que usuario estado PENDIENTE solo ve dashboard
- [ ] Validar que permisos dinámicos se aplican correctamente
- [ ] Validar que auditoría se registra en cada cambio

**Tiempo Estimado:** 2-3 días  
**Responsable:** Backend Developer

---

## 📋 FASE 3: FRONTEND (Días 6-9)

### Actualizar Servicios API

- [ ] Actualizar `api.ts`
  - [ ] Función: `asignarPermisoCodar(usuarioId, permisoId, razon)`
  - [ ] Función: `revocarPermisoCodar(usuarioId, permisoId, razon)`
  - [ ] Función: `obtenerMisPermisos()`
  - [ ] Función: `obtenerAuditoria(filtros)`
  - [ ] Función: `crearSolicitudPermiso(permisoId, motivo)`
  - [ ] Función: `obtenerMisSolicitudes()`
  - [ ] Función: `obtenerSolicitudesPendientes()`

### Menú Dinámico

- [ ] Modificar `Sidebar.tsx`
  - [ ] Calcular permisos del usuario logueado
  - [ ] Mostrar/ocultar módulos según permisos
  - [ ] Mostrar/ocultar opciones dentro de módulos
  - [ ] Agregar indicador visual de "No tiene permiso"

- [ ] Crear lógica de construcción de menú dinámico
  ```typescript
  function construirMenuSegunPermisos(usuario, permisos) {
      const menuItems = [];
      if (tienePermiso('arbitros_ver')) {
          menuItems.push({
              label: 'Árbitros',
              items: [
                  tienePermiso('arbitros_crear') && { label: 'Crear' },
                  tienePermiso('arbitros_editar') && { label: 'Editar' }
              ]
          });
      }
      return menuItems;
  }
  ```

### Componentes Admin/Presidencia

- [ ] Crear `pages/admin/usuarios.tsx`
  - [ ] Listar todos los usuarios
  - [ ] Filtrar por estado (PENDIENTE, ACTIVO, INACTIVO)
  - [ ] Botón: Aprobar CODAR
  - [ ] Botón: Ver permisos

- [ ] Crear `components/GestorPermisosCodar.tsx`
  - [ ] Seleccionar usuario CODAR
  - [ ] Listar permisos actuales
  - [ ] Agregar nuevos permisos (checkboxes)
  - [ ] Remover permisos
  - [ ] Campo: Razon del cambio
  - [ ] Botón: Actualizar Permisos

- [ ] Crear `components/AuditoriaPermisos.tsx`
  - [ ] Tabla de cambios de permisos
  - [ ] Filtros: Usuario, Fecha, Tipo de Cambio
  - [ ] Mostrar: QUIÉN, QUÉ, CUÁNDO, POR QUÉ
  - [ ] Exportar a CSV/PDF

- [ ] Crear `components/SolicitudesPermisos.tsx`
  - [ ] Para CODAR: Ver mis solicitudes
  - [ ] Para PRESIDENCIA: Ver solicitudes pendientes
  - [ ] Botón: Aprobar
  - [ ] Botón: Rechazar (con motivo)

### Componentes Usuario

- [ ] Crear `components/MisPermisos.tsx`
  - [ ] Listar permisos actuales del usuario
  - [ ] Agrupar por módulo
  - [ ] Mostrar fecha de asignación
  - [ ] Mostrar asignado por

- [ ] Crear `components/SolicitarPermiso.tsx`
  - [ ] Modal para solicitar permiso
  - [ ] Campo: Permiso solicitado
  - [ ] Campo: Motivo (requerido)
  - [ ] Validaciones

- [ ] Crear `components/NotificacionesPermisos.tsx`
  - [ ] En tiempo real (WebSocket)
  - [ ] Notificación cuando se asigna nuevo permiso
  - [ ] Notificación cuando se revoca permiso
  - [ ] Notificación cuando se aprueba/rechaza solicitud

### Pages Modificadas

- [ ] Modificar `app/(dashboard)/dashboard/page.tsx`
  - [ ] Mostrar mensaje si usuario estado = PENDIENTE
  - [ ] Mostrar permisos disponibles
  - [ ] Mostrar opción "Solicitar Permiso"

- [ ] Modificar `app/login/registro/page.tsx`
  - [ ] Agregar selección de rol (CODAR o UNIDAD_TÉCNICA)
  - [ ] Mostrar que el rol será COMISIÓN_CODAR (estado PENDIENTE)

**Tiempo Estimado:** 3-4 días  
**Responsable:** Frontend Developer

---

## 📋 FASE 4: TESTING & DEPLOYMENT (Días 10-11)

### Testing Backend

- [ ] Test: Autenticación con JWT
- [ ] Test: Validación de permisos (con permiso, sin permiso)
- [ ] Test: Estado PENDIENTE deniega acceso
- [ ] Test: Auditoría registra cambios
- [ ] Test: Asignar permiso a usuario
- [ ] Test: Revocar permiso a usuario
- [ ] Test: Solicitud de permiso (crear, aprobar, rechazar)
- [ ] Test: Solo ADMIN ve auditoría completa
- [ ] Test: Solo PRESIDENCIA puede aprobar CODAR
- [ ] Test: CODAR no puede eliminar registros

### Testing Frontend

- [ ] Test: Menú se construye según permisos
- [ ] Test: Módulos deshabilitados están ocultos
- [ ] Test: Botón "Solicitar Permiso" funciona
- [ ] Test: Notificaciones en tiempo real llegan
- [ ] Test: Cambios de permisos se reflejan sin refresh
- [ ] Test: Dashboard muestra mensaje si PENDIENTE

### Testing Seguridad

- [ ] Test: Token inválido deniega acceso
- [ ] Test: Token expirado requiere re-login
- [ ] Test: Usuario PENDIENTE no puede acceder a nada
- [ ] Test: Usuario sin permiso obtiene 403
- [ ] Test: CORS está restringido
- [ ] Test: Auditoría no se puede modificar/eliminar

### Testing Auditoría

- [ ] Verificar que CADA cambio se registra
- [ ] Verificar que incluye: QUIÉN, QUÉ, CUÁNDO, POR QUÉ
- [ ] Verificar que se registra: asignaciones, revocaciones, cambios de estado
- [ ] Verificar que solo ADMIN puede ver auditoría completa

### Deployment

- [ ] Crear migration SQL en production
- [ ] Backup de BD antes de cambios
- [ ] Deploy backend a Render
- [ ] Deploy frontend a Vercel
- [ ] Verificar conexión BD
- [ ] Verificar permisos en producción
- [ ] Rollback plan si algo falla

### Validación Final

- [ ] ✓ ADMINISTRADOR tiene acceso 100%
- [ ] ✓ PRESIDENCIA ve su menú específico
- [ ] ✓ CODAR nuevo comienza en PENDIENTE
- [ ] ✓ PRESIDENCIA puede aprobar CODAR
- [ ] ✓ PRESIDENCIA puede asignar permisos
- [ ] ✓ CODAR ve solo módulos asignados
- [ ] ✓ Cambios de permisos son dinámicos
- [ ] ✓ Auditoría funciona correctamente
- [ ] ✓ Solicitudes de permiso funcionan

**Tiempo Estimado:** 1-2 días  
**Responsable:** QA + DevOps

---

## 👥 ASIGNACIÓN DE TAREAS

| Tarea | Responsable | Estimado | Inicio | Fin |
|-------|-------------|----------|--------|-----|
| FASE 1: Infraestructura | Backend | 1-2 días | | |
| FASE 2: Backend | Backend | 2-3 días | | |
| FASE 3: Frontend | Frontend | 3-4 días | | |
| FASE 4: Testing | QA | 1-2 días | | |

---

## 📊 SEGUIMIENTO DE PROGRESO

```
FASE 1: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
FASE 2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
FASE 3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
FASE 4: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%

TOTAL: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%
```

---

## 🎯 HITOS CLAVE

- [ ] **Hito 1:** Tablas SQL creadas ✓
- [ ] **Hito 2:** Entidades Java listas ✓
- [ ] **Hito 3:** PermisoService funcional ✓
- [ ] **Hito 4:** Endpoints backend probados ✓
- [ ] **Hito 5:** Menú dinámico frontend ✓
- [ ] **Hito 6:** Gestión de permisos PRESIDENCIA ✓
- [ ] **Hito 7:** Auditoría funcional ✓
- [ ] **Hito 8:** Tests pasando 80%+ ✓
- [ ] **Hito 9:** Deploy a producción ✓
- [ ] **Hito 10:** Go Live ✓

---

## 📝 NOTAS IMPORTANTES

1. **Seguridad:** Validar permisos en BACKEND, no solo frontend
2. **Auditoría:** CADA cambio debe registrarse
3. **Performance:** Cachear permisos (pero invalidar cache al cambiar)
4. **UX:** Mostrar mensajes claros cuando usuario no tiene acceso
5. **Testing:** Incluir tests de seguridad
6. **Documentación:** Actualizar API docs (Swagger) después

---

**Documento:** Checklist Implementación Sistema de Roles  
**Versión:** 1.0  
**Fecha:** 20 de Abril, 2026  
**Estado:** Listo para Iniciar Implementación
