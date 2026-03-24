# ❓ Dudas y Preguntas - Sistema SIDAF-PUNO

**Fecha:** 2026-03-23  
**Analista:** Kilo Code (Architect Mode)  
**Versión del Sistema:** 3.0

---

## 📋 Resumen del Sistema

El sistema **SIDAF-PUNO** es una aplicación web integral para la gestión de árbitros de fútbol de la Liga Departamental de Puno, Perú. Cuenta con:

- **Frontend**: Next.js 14 con TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Spring Boot 3.5.7 con Java 17, PostgreSQL (Neon)
- **Módulos principales**: Árbitros, Asistencia, Usuarios, Permisos, Reportes, Campeonatos, Equipos, Designaciones

---

## 🔍 Dudas y Preguntas por Categoría

### 1. Arquitectura y Consistencia

#### Pregunta 1.1: ¿Están implementados los controllers de Campeonatos, Equipos y Designaciones en el backend?

**Contexto:**
- El frontend tiene interfaces completas para Campeonatos, Equipos y Designaciones
- El análisis inicial no muestra controllers para estas entidades en el backend
- Los archivos `EquipoController.java` existen en `backend/backend/src/main/java/com/sidaf/backend/controller/` pero no en `backend/src/main/java/com/sidaf/backend/controller/`

**Opciones de respuesta:**
- A) Sí, están implementados en otra ubicación
- B) No, necesitan ser implementados
- C) Solo están implementados en frontend (modo demo/localStorage)

**Impacto:** Alto - Afecta la funcionalidad completa del sistema

---

#### Pregunta 1.2: ¿Cuál es la estrategia actual de persistencia de datos?

**Contexto:**
- El frontend usa Zustand con localStorage
- El backend usa PostgreSQL con Spring Data JPA
- No está claro si el sistema opera completamente conectado al backend o si hay funcionalidad offline

**Opciones de respuesta:**
- A) Todo se guarda en backend (PostgreSQL), localStorage es solo cache
- B) Funcionalidad mixta: algunas cosas en backend, otras en localStorage
- C) Sistema completamente offline con localStorage (demo)
- D) Modo híbrido con sincronización

**Impacto:** Alto - Define la arquitectura de datos

---

### 2. Funcionalidades Específicas

#### Pregunta 2.1: ¿El algoritmo de designación inteligente está implementado?

**Contexto:**
- La documentación menciona dos algoritmos: básico y mejorado
- Se mencionan archivos `algoritmo-designacion.ts` y `algoritmo-designacion-mejorado.ts` en frontend
- No se encontró implementación del algoritmo en backend

**Opciones de respuesta:**
- A) Sí, implementado solo en frontend
- B) Sí, implementado en backend (ubicación: ___)
- C) No implementado, es solo documentación
- D) Implementado parcialmente

**Impacto:** Medio - Es una funcionalidad clave del sistema

---

#### Pregunta 2.2: ¿Cómo funciona el sistema de geolocalización en el registro de asistencia?

**Contexto:**
- El modelo `Asistencia` tiene campos `latitude` y `longitude`
- No está claro cómo se capturan estos datos
- No se encontró código de geolocalización en el frontend

**Opciones de respuesta:**
- A) Se captura automáticamente con la API del navegador
- B) El usuario ingresa manualmente las coordenadas
- C) No implementado aún
- D) Implementado con una librería específica

**Impacto:** Medio - Afecta la precisión del control de asistencia

---

#### Pregunta 2.3: ¿El sistema de notificaciones está implementado?

**Contexto:**
- El roadmap menciona "Notificaciones push" como característica futura
- No se encontró implementación de notificaciones en el código actual

**Opciones de respuesta:**
- A) No, es una característica futura
- B) Sí, implementado con ___ (especificar tecnología)
- C) Implementado parcialmente (solo email)
- D) No planeado

**Impacto:** Bajo - Mejora la experiencia del usuario

---

### 3. Seguridad y Autenticación

#### Pregunta 3.1: ¿Está completamente implementado el sistema de seguridad JWT?

**Contexto:**
- El `AuthController` genera un token simple (usando el DNI como token)
- No se encontró un `JwtFilter` o `SecurityConfig` en el backend
- La configuración JWT está en `application.properties` pero no hay implementación visible

**Opciones de respuesta:**
- A) Sí, implementado completamente (ubicación: ___)
- B) Implementado parcialmente (solo generación de token)
- C) No implementado, usa autenticación simple
- D) Implementado con una librería externa

**Impacto:** Alto - Afecta la seguridad del sistema

---

#### Pregunta 3.2: ¿Cómo se manejan los permisos específicos por rol?

**Contexto:**
- El modelo `Usuario` tiene un campo `permisosEspecificos` de tipo JSON
- Los roles están bien definidos (ADMIN, PRESIDENCIA_CODAR, CODAR, UNIDAD_TECNICA_CODAR)
- No está claro cómo se validan estos permisos en los endpoints

**Opciones de respuesta:**
- A) Validación manual en cada controller
- B) Usando Spring Security con @PreAuthorize
- C) No implementado aún
- D) Implementado con un filtro personalizado

**Impacto:** Medio - Afecta el control de acceso

---

### 4. Base de Datos y Migraciones

#### Pregunta 4.1: ¿Existen todas las tablas necesarias en la base de datos?

**Contexto:**
- Hay migraciones SQL para usuarios, asistencias, permisos
- No se encontraron migraciones para campeonatos, equipos, designaciones
- El modelo de entidades en frontend sugiere que deberían existir

**Opciones de respuesta:**
- A) Sí, todas las tablas existen
- B) Faltan migraciones para algunas tablas
- C) Las tablas se crean automáticamente con Hibernate (ddl-auto=update)
- D) Solo existen las tablas con migraciones visibles

**Impacto:** Alto - Afecta la integridad de datos

---

#### Pregunta 4.2: ¿Cuál es la estrategia de backup de la base de datos?

**Contexto:**
- La base de datos está en Neon PostgreSQL (cloud)
- No se encontró documentación sobre backups
- No hay scripts de backup en el repositorio

**Opciones de respuesta:**
- A) Neon maneja los backups automáticamente
- B) Hay scripts de backup no visibles en el repo
- C) No hay estrategia de backup definida
- D) Se hace backup manual periódicamente

**Impacto:** Alto - Afecta la recuperación ante desastres

---

### 5. Testing y Calidad

#### Pregunta 5.1: ¿Hay tests implementados en el proyecto?

**Contexto:**
- Solo se encontró un test básico: `SidafBackendApplicationTests.java`
- No se encontraron tests de integración o unitarios para los controllers
- No hay tests para el frontend

**Opciones de respuesta:**
- A) No, no hay tests implementados
- B) Sí, pero están en otra rama/repo
- C) Solo tests básicos de arranque
- D) Tests implementados pero no visibles en el análisis

**Impacto:** Medio - Afecta la calidad y mantenibilidad

---

#### Pregunta 5.2: ¿Hay implementado CI/CD?

**Contexto:**
- El frontend está desplegado en Vercel
- El backend está desplegado en Render
- No se encontró configuración de GitHub Actions u otro CI/CD

**Opciones de respuesta:**
- A) Sí, con GitHub Actions (ubicación: ___)
- B) Sí, con otra herramienta (especificar)
- C) No, despliegue manual
- D) Despliegue automático por Vercel/Render

**Impacto:** Bajo - Afecta el flujo de desarrollo

---

### 6. Funcionalidades Futuras

#### Pregunta 6.1: ¿Cuáles son las prioridades para el desarrollo futuro?

**Contexto:**
- El roadmap lista varias características futuras
- Hay varios planes de mejora en la carpeta `plans/`
- No está claro cuál es el orden de prioridad

**Opciones de respuesta:**
- A) Completar backend de campeonatos/equipos/designaciones
- B) Mejorar seguridad y autenticación JWT
- C) Implementar algoritmo de designación inteligente
- D) Otra prioridad (especificar)

**Impacto:** Alto - Define el roadmap de desarrollo

---

#### Pregunta 6.2: ¿Hay planeado desarrollar una aplicación móvil?

**Contexto:**
- El roadmap menciona "App móvil (PWA)" como característica futura
- El frontend ya es responsive
- No está claro si se planea una app nativa o PWA

**Opciones de respuesta:**
- A) Sí, como PWA (Progressive Web App)
- B) Sí, como app nativa (React Native/Flutter)
- C) No planeado
- D) Depende de los recursos disponibles

**Impacto:** Medio - Afecta la estrategia de desarrollo

---

### 7. Integraciones

#### Pregunta 7.1: ¿Hay integraciones con sistemas externos planeadas o implementadas?

**Contexto:**
- El roadmap menciona "Integración con APIs externas"
- No se encontró código de integración con APIs externas
- No está claro qué APIs serían relevantes

**Opciones de respuesta:**
- A) No hay integraciones planeadas
- B) Sí, con ___ (especificar API)
- C) Planeado pero no implementado
- D) Integración con calendarios (Google Calendar, etc.)

**Impacto:** Bajo - Mejora la funcionalidad del sistema

---

#### Pregunta 7.2: ¿El sistema necesita integrarse con otros sistemas de la Liga?

**Contexto:**
- La Liga Departamental puede tener otros sistemas
- No hay información sobre otros sistemas existentes

**Opciones de respuesta:**
- A) Sí, con el sistema de inscripción de jugadores
- B) Sí, con el sistema de resultados de partidos
- C) No, el sistema es independiente
- D) No tengo información sobre otros sistemas

**Impacto:** Medio - Afecta la arquitectura de integración

---

### 8. Documentación

#### Pregunta 8.1: ¿La documentación está actualizada?

**Contexto:**
- Hay documentación técnica completa en `docs/DOCUMENTACION.md`
- Hay varios planes de mejora en `plans/`
- No está claro si la documentación refleja el estado actual

**Opciones de respuesta:**
- A) Sí, completamente actualizada
- B) Parcialmente actualizada
- C) Desactualizada en algunas áreas
- D) No hay proceso de actualización de documentación

**Impacto:** Bajo - Afecta la mantenibilidad

---

#### Pregunta 8.2: ¿Hay documentación para usuarios finales?

**Contexto:**
- La documentación actual es técnica
- No se encontró manual de usuario
- No hay guías paso a paso para usuarios no técnicos

**Opciones de respuesta:**
- A) Sí, en ___ (ubicación)
- B) No, solo documentación técnica
- C) Planeado pero no implementado
- D) No necesario (usuarios son técnicos)

**Impacto:** Bajo - Mejora la adopción del sistema

---

### 9. Desempeño y Escalabilidad

#### Pregunta 9.1: ¿Hay preocupaciones sobre el desempeño del sistema?

**Contexto:**
- El sistema usa localStorage en el frontend
- La base de datos está en Neon PostgreSQL (cloud)
- No hay optimizaciones visibles de caché o índices

**Opciones de respuesta:**
- A) No hay problemas de desempeño
- B) Sí, el sistema es lento con muchos registros
- C) No se ha medido el desempeño
- D) Hay planes de optimización

**Impacto:** Medio - Afecta la experiencia del usuario

---

#### Pregunta 9.2: ¿El sistema está preparado para escalar?

**Contexto:**
- La arquitectura actual es monolítica (Spring Boot)
- No hay microservicios o arquitectura distribuida
- No está claro el volumen esperado de usuarios

**Opciones de respuesta:**
- A) Sí, la arquitectura actual escala bien
- B) No, necesita refactorización para escalar
- C) No se espera crecimiento significativo
- D) Planeado para futuro pero no ahora

**Impacto:** Medio - Afecta el crecimiento futuro

---

### 10. Estado Actual

#### Pregunta 10.1: ¿Cuál es el estado actual del sistema?

**Contexto:**
- Algunos módulos están completamente implementados
- Otros módulos necesitan verificación
- Hay discrepancias entre frontend y backend

**Opciones de respuesta:**
- A) Sistema completamente funcional en producción
- B) Sistema en fase de desarrollo/testing
- C) Sistema en demo/prototipo
- D) Sistema parcialmente funcional

**Impacto:** Alto - Define el contexto de trabajo

---

#### Pregunta 10.2: ¿Cuáles son los problemas más urgentes a resolver?

**Contexto:**
- Hay varias áreas que necesitan atención
- No está claro cuál es la prioridad

**Opciones de respuesta:**
- A) Completar implementación de backend para campeonatos/equipos/designaciones
- B) Mejorar seguridad y autenticación
- C) Implementar tests
- D) Otro problema (especificar)

**Impacto:** Alto - Define el plan de acción inmediato

---

## 📊 Resumen de Dudas por Impacto

### Alto Impacto (requieren atención inmediata)
1. ¿Están implementados los controllers de Campeonatos, Equipos y Designaciones?
2. ¿Cuál es la estrategia actual de persistencia de datos?
3. ¿Está completamente implementado el sistema de seguridad JWT?
4. ¿Existen todas las tablas necesarias en la base de datos?
5. ¿Cuál es la estrategia de backup de la base de datos?
6. ¿Cuál es el estado actual del sistema?
7. ¿Cuáles son los problemas más urgentes a resolver?

### Medio Impacto (requieren atención a mediano plazo)
1. ¿El algoritmo de designación inteligente está implementado?
2. ¿Cómo funciona el sistema de geolocalización en el registro de asistencia?
3. ¿Cómo se manejan los permisos específicos por rol?
4. ¿Hay tests implementados en el proyecto?
5. ¿Cuáles son las prioridades para el desarrollo futuro?
6. ¿Hay planeado desarrollar una aplicación móvil?
7. ¿El sistema necesita integrarse con otros sistemas de la Liga?
8. ¿Hay preocupaciones sobre el desempeño del sistema?
9. ¿El sistema está preparado para escalar?

### Bajo Impacto (mejoras opcionales)
1. ¿El sistema de notificaciones está implementado?
2. ¿Hay implementado CI/CD?
3. ¿Hay integraciones con sistemas externas planeadas o implementadas?
4. ¿La documentación está actualizada?
5. ¿Hay documentación para usuarios finales?

---

## 🎯 Próximos Pasos Sugeridos

1. **Responder preguntas de alto impacto** para entender el estado actual
2. **Verificar implementación de backend** para módulos pendientes
3. **Definir prioridades de desarrollo** basado en respuestas
4. **Crear plan de acción** para resolver problemas identificados
5. **Documentar decisiones** para mantener consistencia

---

**© 2025 SIDAF-PUNO - Análisis de Dudas y Preguntas**
