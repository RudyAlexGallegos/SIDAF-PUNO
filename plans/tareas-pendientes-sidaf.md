# 📋 Tareas Pendientes - Sistema SIDAF-PUNO

**Fecha:** 24 de Marzo, 2026  
**Versión del Sistema:** 3.0  
**Analista:** Kilo Code (Code Mode)

---

## 🎯 Resumen Ejecutivo

El sistema SIDAF-PUNO tiene varios módulos completamente funcionales, pero existen áreas críticas que requieren atención inmediata para completar la funcionalidad del sistema. Este documento organiza todas las tareas pendientes por prioridad y categoría.

---

## 📊 Estado Actual del Sistema

### ✅ Módulos Completamente Implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Gestión de Árbitros** | ✅ Completo | CRUD completo con todos los campos |
| **Control de Asistencia** | ✅ Completo | Sistema completo con días obligatorios, retrasos, estadísticas, exportación PDF/Excel |
| **Usuarios y Autenticación** | ✅ Completo | Sistema de roles jerárquicos (ADMIN, PRESIDENCIA_CODAR, CODAR, UNIDAD_TECNICA_CODAR) |
| **Solicitudes de Permiso** | ✅ Completo | Flujo completo de solicitudes |
| **Reportes y Estadísticas** | ✅ Completo | Reportes avanzados con exportación PDF/Excel, dashboard de estadísticas |

### ⚠️ Módulos Parcialmente Implementados

| Módulo | Estado | Problema |
|--------|--------|----------|
| **Campeonatos** | ⚠️ Solo frontend | Frontend completo, backend incompleto |
| **Equipos** | ⚠️ Desorganizado | Existe en `backend/backend/` pero no en `backend/src/` |
| **Designaciones** | ⚠️ Solo frontend | Frontend completo, backend no existe |

### ❌ Módulos No Implementados

| Módulo | Estado | Prioridad |
|--------|--------|-----------|
| **Geolocalización en Asistencia** | ❌ No implementado | Media |
| **Seguridad JWT Completa** | ❌ Parcial | Alta |
| **Tests** | ❌ Solo test básico | Alta |
| **CI/CD** | ❌ No implementado | Media |
| **Notificaciones** | ❌ No implementadas | Baja |

---

## 🔴 Prioridad ALTA - Tareas Críticas

### 1. Completar Backend de Campeonatos, Equipos y Designaciones

**Problema:** El frontend tiene interfaces completas para estos módulos, pero el backend está incompleto o desorganizado.

#### 1.1 Campeonatos

**Estado actual:**
- ❌ No existe `CampeonatoController.java` en `backend/src/main/java/com/sidaf/backend/controller/`
- ❌ No existe `Campeonato.java` en `backend/src/main/java/com/sidaf/backend/model/`
- ❌ No existe `CampeonatoRepository.java` en `backend/src/main/java/com/sidaf/backend/repository/`
- ❌ No existe migración SQL para tabla `campeonatos`

**Tareas requeridas:**
- [ ] Crear entidad `Campeonato.java` en `backend/src/main/java/com/sidaf/backend/model/`
- [ ] Crear `CampeonatoRepository.java` en `backend/src/main/java/com/sidaf/backend/repository/`
- [ ] Crear `CampeonatoController.java` en `backend/src/main/java/com/sidaf/backend/controller/`
- [ ] Crear migración SQL `014_create_campeonatos.sql` en `backend/migrations/`
- [ ] Implementar endpoints CRUD:
  - `GET /api/campeonatos` - Listar todos
  - `GET /api/campeonatos/{id}` - Obtener por ID
  - `POST /api/campeonatos` - Crear
  - `PUT /api/campeonatos/{id}` - Actualizar
  - `DELETE /api/campeonatos/{id}` - Eliminar

**Campos requeridos:**
```java
@Entity
public class Campeonato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String categoria;
    private String tipo; // "Liga", "Copa", "Torneo"
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado; // "programado", "activo", "finalizado"
    private String organizador;
    private String contacto;
    private String ciudad;
    private String provincia;
    private String nivelDificultad; // "Alto", "Medio", "Bajo"
    private Integer numeroEquipos;
    private String formato;
    private String reglas;
    private String premios;
    private String observaciones;
    private String logo;
    private LocalDateTime fechaCreacion;
}
```

#### 1.2 Equipos

**Estado actual:**
- ⚠️ Existe `EquipoController.java` en `backend/backend/src/main/java/com/sidaf/backend/controller/` (ubicación incorrecta)
- ⚠️ Existe `Equipo.java` en `backend/backend/src/main/java/com/sidaf/backend/model/` (ubicación incorrecta)
- ⚠️ Existe `EquipoRepository.java` en `backend/backend/src/main/java/com/sidaf/backend/repository/` (ubicación incorrecta)
- ⚠️ Existe migración `012_create_equipos.sql` en `backend/backend/migrations/` (ubicación incorrecta)
- ❌ No existen en `backend/src/main/java/com/sidaf/backend/` (ubicación correcta)

**Tareas requeridas:**
- [ ] Mover `Equipo.java` de `backend/backend/src/main/java/com/sidaf/backend/model/` a `backend/src/main/java/com/sidaf/backend/model/`
- [ ] Mover `EquipoRepository.java` de `backend/backend/src/main/java/com/sidaf/backend/repository/` a `backend/src/main/java/com/sidaf/backend/repository/`
- [ ] Mover `EquipoController.java` de `backend/backend/src/main/java/com/sidaf/backend/controller/` a `backend/src/main/java/com/sidaf/backend/controller/`
- [ ] Mover migración `012_create_equipos.sql` de `backend/backend/migrations/` a `backend/migrations/`
- [ ] Verificar que el controller tenga todos los endpoints necesarios:
  - `GET /api/equipos` - Listar todos
  - `GET /api/equipos/{id}` - Obtener por ID
  - `POST /api/equipos` - Crear
  - `PUT /api/equipos/{id}` - Actualizar
  - `DELETE /api/equipos/{id}` - Eliminar

#### 1.3 Designaciones

**Estado actual:**
- ❌ No existe `DesignacionController.java` en `backend/src/main/java/com/sidaf/backend/controller/`
- ❌ No existe `Designacion.java` en `backend/src/main/java/com/sidaf/backend/model/`
- ❌ No existe `DesignacionRepository.java` en `backend/src/main/java/com/sidaf/backend/repository/`
- ❌ No existe migración SQL para tabla `designaciones`

**Tareas requeridas:**
- [ ] Crear entidad `Designacion.java` en `backend/src/main/java/com/sidaf/backend/model/`
- [ ] Crear `DesignacionRepository.java` en `backend/src/main/java/com/sidaf/backend/repository/`
- [ ] Crear `DesignacionController.java` en `backend/src/main/java/com/sidaf/backend/controller/`
- [ ] Crear migración SQL `015_create_designaciones.sql` en `backend/migrations/`
- [ ] Implementar endpoints CRUD:
  - `GET /api/designaciones` - Listar todas
  - `GET /api/designaciones/{id}` - Obtener por ID
  - `POST /api/designaciones` - Crear
  - `PUT /api/designaciones/{id}` - Actualizar
  - `DELETE /api/designaciones/{id}` - Eliminar
- [ ] Implementar endpoint para designación inteligente:
  - `POST /api/designaciones/inteligente` - Generar designación automática

**Campos requeridos:**
```java
@Entity
public class Designacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String partidoId;
    private Long idArbitro;
    private String nombreArbitro;
    private Long idCampeonato;
    private String nombreCampeonato;
    private Long idEquipoLocal;
    private String nombreEquipoLocal;
    private Long idEquipoVisitante;
    private String nombreEquipoVisitante;
    private LocalDate fecha;
    private LocalTime hora;
    private String estadio;
    private String posicion; // "Principal", "Asistente1", "Asistente2", "Cuarto"
    private String estado; // "programada", "completada", "cancelada"
    private String observaciones;
    private LocalDateTime fechaDesignacion;
}
```

---

### 2. Implementar Seguridad JWT Completa

**Problema:** El sistema actual solo genera un token simple (usando el DNI como token) sin validación JWT real.

**Estado actual:**
- ⚠️ `AuthController.java` genera token simple: `return dni;` (línea ~33377)
- ❌ No existe `JwtFilter.java` o `SecurityConfig.java`
- ⚠️ Configuración JWT existe en `application.properties` pero no se usa
- ❌ No hay validación de tokens en endpoints protegidos

**Tareas requeridas:**
- [ ] Crear `JwtUtil.java` con funciones para:
  - Generar token JWT con claims
  - Validar token JWT
  - Extraer username/claims del token
- [ ] Crear `JwtAuthenticationFilter.java` para:
  - Interceptar requests
  - Validar token en header Authorization
  - Autenticar usuario en contexto de Spring Security
- [ ] Crear `SecurityConfig.java` para:
  - Configurar Spring Security
  - Definir endpoints públicos (login, registro)
  - Definir endpoints protegidos
  - Configurar CORS
- [ ] Modificar `AuthController.java` para:
  - Usar `JwtUtil.generateToken()` en lugar de `return dni;`
- [ ] Agregar anotación `@PreAuthorize` en controllers para:
  - Validar roles por endpoint
  - Validar permisos específicos

**Dependencias requeridas en `pom.xml`:**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

---

### 3. Implementar Tests

**Problema:** Solo existe un test básico de arranque, no hay tests de integración o unitarios.

**Estado actual:**
- ⚠️ Solo `SidafBackendApplicationTests.java` (test básico de contexto)
- ❌ No hay tests para controllers
- ❌ No hay tests para services
- ❌ No hay tests para repositories
- ❌ No hay tests para frontend

**Tareas requeridas:**

#### 3.1 Backend Tests
- [ ] Crear `ArbitroControllerTest.java`:
  - Test GET /api/arbitros
  - Test GET /api/arbitros/{id}
  - Test POST /api/arbitros
  - Test PUT /api/arbitros/{id}
  - Test DELETE /api/arbitros/{id}
- [ ] Crear `AsistenciaControllerTest.java`:
  - Test GET /api/asistencias
  - Test POST /api/asistencias
  - Test POST /api/asistencias/registrar-masivo
  - Test GET /api/asistencias/por-arbitro/{arbitroId}
- [ ] Crear `AuthControllerTest.java`:
  - Test POST /api/auth/login
  - Test POST /api/auth/registro
  - Test validación de credenciales incorrectas
- [ ] Crear `ReporteServiceTest.java`:
  - Test generación de reporte consolidado
  - Test cálculo de estadísticas
  - Test filtrado por periodo

#### 3.2 Frontend Tests
- [ ] Configurar Jest + React Testing Library
- [ ] Crear tests para componentes principales:
  - `DashboardEstadisticasAsistencia.tsx`
  - `AlertasAsistencia.tsx`
  - `RegistroCompactoArbitro.tsx`
- [ ] Crear tests para páginas:
  - `asistencia/page.tsx`
  - `asistencia/historial/page.tsx`
  - `arbitros/page.tsx`

---

## 🟡 Prioridad MEDIA - Tareas Importantes

### 4. Implementar Geolocalización en Asistencia

**Problema:** El modelo `Asistencia` tiene campos `latitude` y `longitude` pero no se capturan.

**Estado actual:**
- ⚠️ Campos `latitude` y `longitude` existen en modelo
- ❌ No hay código para capturar geolocalización
- ❌ No hay validación de ubicación

**Tareas requeridas:**
- [ ] Implementar función de geolocalización en frontend:
  ```typescript
  const obtenerUbicacion = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }
  ```
- [ ] Integrar geolocalización en registro de asistencia:
  - Capturar ubicación al marcar asistencia
  - Guardar coordenadas en backend
  - Manejar errores de permisos
- [ ] Agregar validación de ubicación:
  - Verificar que el usuario esté dentro de un radio permitido
  - Configurar ubicaciones permitidas (estadio, sede, etc.)
- [ ] Agregar mapa visual en historial:
  - Mostrar ubicación de cada registro
  - Usar librería como Leaflet o Google Maps

---

### 5. Implementar CI/CD

**Problema:** No hay automatización de builds, tests ni despliegues.

**Estado actual:**
- ❌ No existe configuración de GitHub Actions
- ❌ No existe configuración de Jenkins u otra herramienta
- ⚠️ Despliegue manual a Vercel (frontend) y Render (backend)

**Tareas requeridas:**

#### 5.1 Backend CI/CD
- [ ] Crear `.github/workflows/backend-ci.yml`:
  - Trigger: push a main, pull requests
  - Steps:
    - Checkout code
    - Set up Java 17
    - Run tests con Maven
    - Build JAR
    - Deploy a Render (solo en main)

#### 5.2 Frontend CI/CD
- [ ] Crear `.github/workflows/frontend-ci.yml`:
  - Trigger: push a main, pull requests
  - Steps:
    - Checkout code
    - Set up Node.js
    - Install dependencies
    - Run tests
    - Build Next.js
    - Deploy a Vercel (solo en main)

#### 5.3 Quality Gates
- [ ] Agregar SonarQube para análisis de código
- [ ] Configurar reglas de calidad
- [ ] Bloquear PRs si tests fallan
- [ ] Bloquear PRs si coverage < 80%

---

### 6. Implementar Agrupación por Meses en Historial

**Estado:** Plan existe en `plans/plan-mejora-historial-por-meses.md` pero no implementado.

**Tareas requeridas:**
- [ ] Crear tipos de datos para estadísticas de mes
- [ ] Implementar función `agruparPorMes()`
- [ ] Crear componente `EstadisticasMesCard`
- [ ] Crear componente `AcordeonMes`
- [ ] Modificar `HistorialAsistenciaPage` para usar acordeones
- [ ] Implementar estado de expansión de meses
- [ ] Integrar con filtros existentes
- [ ] Probar funcionalidad completa
- [ ] Ajustar estilos y animaciones
- [ ] Verificar responsividad

**Beneficios esperados:**
- Mejor organización de datos
- Estadísticas contextuales por mes
- Navegación más fácil
- Visualización más amigable

---

### 7. Mejorar Exportación a Excel

**Estado:** Parcialmente implementado, puede mejorarse.

**Tareas requeridas:**
- [ ] Agregar múltiples hojas en Excel:
  - Hoja 1: Resumen general
  - Hoja 2: Detalle por día
  - Hoja 3: Ranking de árbitros
  - Hoja 4: Estadísticas por actividad
- [ ] Mejorar formato profesional:
  - Colores corporativos SIDAF-PUNO
  - Headers con negrita y fondo de color
  - Bordes en celdas
  - Ancho de columnas automático
- [ ] Agregar filtros en Excel
- [ ] Agregar gráficos en Excel

---

## 🟢 Prioridad BAJA - Mejoras Opcionales

### 8. Implementar Notificaciones

**Estado:** No implementado, mencionado en roadmap como característica futura.

**Tareas requeridas:**
- [ ] Evaluar opciones:
  - Email notifications (SendGrid, Mailgun)
  - Push notifications (Firebase Cloud Messaging)
  - In-app notifications (WebSocket)
- [ ] Implementar sistema de notificaciones:
  - Crear entidad `Notificacion`
  - Crear `NotificacionController`
  - Crear `NotificacionService`
- [ ] Tipos de notificaciones:
  - Nueva designación asignada
  - Recordatorio de asistencia
  - Aprobación/rechazo de solicitud
  - Cambio en campeonato

---

### 9. Implementar Modo Oscuro Completo

**Estado:** Parcialmente implementado con `next-themes`, puede mejorarse.

**Tareas requeridas:**
- [ ] Verificar que todos los componentes soporten modo oscuro
- [ ] Agregar toggle de tema en header
- [ ] Guardar preferencia en localStorage
- [ ] Ajustar colores para mejor contraste en modo oscuro
- [ ] Probar en todas las páginas

---

### 10. Implementar PWA (Progressive Web App)

**Estado:** Mencionado en roadmap como característica futura.

**Tareas requeridas:**
- [ ] Crear `manifest.json`
- [ ] Crear service worker
- [ ] Agregar iconos para diferentes tamaños
- [ ] Configurar estrategia de caché
- [ ] Habilitar instalación en home screen
- [ ] Probar en dispositivos móviles

---

### 11. Integración con APIs Externas

**Estado:** Mencionado en roadmap como característica futura.

**Tareas requeridas:**
- [ ] Evaluar APIs útiles:
  - Google Calendar para sincronizar eventos
  - WhatsApp API para notificaciones
  - APIs de fútbol para datos de partidos
- [ ] Implementar integraciones seleccionadas
- [ ] Documentar uso de APIs

---

### 12. Documentación para Usuarios Finales

**Estado:** Solo existe documentación técnica.

**Tareas requeridas:**
- [ ] Crear manual de usuario:
  - Guía de inicio rápido
  - Tutorial de cada módulo
  - Preguntas frecuentes
  - Solución de problemas
- [ ] Crear videos tutoriales
- [ ] Agregar tooltips de ayuda en la interfaz
- [ ] Crear tour guiado para nuevos usuarios

---

## 📊 Resumen de Tareas por Prioridad

| Prioridad | Categoría | Tareas | Estado |
|-----------|-----------|--------|--------|
| 🔴 Alta | Backend (Campeonatos) | 6 tareas | ❌ Pendiente |
| 🔴 Alta | Backend (Equipos) | 5 tareas | ⚠️ Parcial |
| 🔴 Alta | Backend (Designaciones) | 7 tareas | ❌ Pendiente |
| 🔴 Alta | Seguridad JWT | 5 tareas | ⚠️ Parcial |
| 🔴 Alta | Tests | 8+ tareas | ❌ Pendiente |
| 🟡 Media | Geolocalización | 4 tareas | ❌ Pendiente |
| 🟡 Media | CI/CD | 6 tareas | ❌ Pendiente |
| 🟡 Media | Agrupación por Meses | 10 tareas | ⏳ Planificado |
| 🟡 Media | Exportación Excel | 4 tareas | ⚠️ Parcial |
| 🟢 Baja | Notificaciones | 4 tareas | ❌ Pendiente |
| 🟢 Baja | Modo Oscuro | 5 tareas | ⚠️ Parcial |
| 🟢 Baja | PWA | 6 tareas | ❌ Pendiente |
| 🟢 Baja | APIs Externas | 3 tareas | ❌ Pendiente |
| 🟢 Baja | Documentación | 4 tareas | ❌ Pendiente |

---

## 🎯 Roadmap Recomendado

### Fase 1: Completar Backend Crítico (2-3 semanas)
1. Mover componentes de Equipos a ubicación correcta
2. Implementar backend de Campeonatos
3. Implementar backend de Designaciones
4. Verificar integración frontend-backend

### Fase 2: Seguridad y Calidad (1-2 semanas)
1. Implementar seguridad JWT completa
2. Crear tests de backend
3. Configurar CI/CD básico
4. Implementar quality gates

### Fase 3: Mejoras de UX (1-2 semanas)
1. Implementar agrupación por meses
2. Mejorar exportación a Excel
3. Implementar geolocalización
4. Completar modo oscuro

### Fase 4: Características Adicionales (2-3 semanas)
1. Implementar notificaciones
2. Crear PWA
3. Integrar APIs externas
4. Crear documentación de usuario

---

## 📝 Notas Importantes

1. **Prioridad de Backend:** Los módulos de Campeonatos, Equipos y Designaciones son críticos porque el frontend ya está implementado y esperando el backend.

2. **Seguridad:** La implementación de JWT es urgente porque el sistema actualmente usa autenticación simple sin validación real de tokens.

3. **Tests:** Implementar tests es importante para mantener la calidad del código y evitar regresiones.

4. **CI/CD:** Automatizar builds y despliegues reducirá errores humanos y mejorará el flujo de desarrollo.

5. **Documentación:** Mantener documentación actualizada es crucial para la mantenibilidad del sistema a largo plazo.

---

**© 2026 SIDAF-PUNO - Plan de Tareas Pendientes**
