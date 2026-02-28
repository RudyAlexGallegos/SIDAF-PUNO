# Plan de Mejora de Rendimiento - Backend SIDAF PUNO

## Diagnóstico

El problema principal de lentitud es que **Render.com en el plan gratuito "duerme"** el backend después de 15 minutos de inactividad. Esto causa que:
- El primer request después de inactividad tome 30-60 segundos en despertar
- La experiencia de usuario sea muy lenta

## Soluciones

### Opción 1: Mejorar Configuración de Spring Boot (Inmediato)

Agregar configuración de rendimiento en `application.properties`:

```properties
# Configuración de rendimiento
server.servlet.jsp.init-parameters.development=false
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain

# Optimizar pool de conexiones
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

### Opción 2: Agregar Health Check (Inmediato)

El health check mantiene el backend activo. En Render, configurar:
- **Health Check Path**: `/api/hello`
- **Health Check Interval**: 5 minutes

### Opción 3: Cambiar a Render Paid (Recomendado para producción)

El plan pago de Render ($25/month) incluye:
- Backend siempre activo (nunca duerme)
- Mejor rendimiento
- Soporte para producción

### Opción 4: Optimizar Consultas JPA

Revisar y optimizar las consultas en los controladores para:
- Usar `fetch join` para relaciones
- Implementar paginación
- Agregar índices en la base de datos

## Plan de Implementación

### Fase 1: Configuración de Spring Boot
- [ ] Agregar configuración de compresión
- [ ] Optimizar pool de conexiones
- [ ] Agregar cache básico

### Fase 2: Health Check en Render
- [ ] Configurar health check en Render.com
- [ ] Reducir tiempo de respuesta

### Fase 3: Optimización de Consultas
- [ ] Revisar queries lentas
- [ ] Agregar índices necesarios
- [ ] Implementar paginación

## Recomendación Principal

**Para solución inmediata**: Configurar health check en Render (Opción 2) para mantener el backend activo.

**Para producción**: Considerar actualizar a plan pago de Render o migrar a otro proveedor como Railway ($5/month) o Fly.io.
