# 📋 INSTRUCCIONES PARA EJECUTAR MIGRACIÓN EN NEON

Como no está disponible psql o Python en tu máquina, voy a darte **3 opciones**:

---

## ✅ OPCIÓN 1: Panel Web de Neon (MÁS FÁCIL) ⭐⭐⭐

1. **Ve a:** https://console.neon.tech
2. **Inicia sesión** con tu cuenta Neon
3. **Selecciona tu proyecto** SIDAF-PUNO
4. **Haz clic en:** SQL Editor
5. **Copia y pega esto:**

```sql
-- Actualizar roles UNIDAD_TECNICA_CODAR → UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' 
WHERE rol = 'UNIDAD_TECNICA_CODAR';

-- Actualizar roles PRESIDENCIA_CODAR → PRESIDENCIA
UPDATE usuarios SET rol = 'PRESIDENCIA' 
WHERE rol = 'PRESIDENCIA_CODAR';

-- Actualizar roles CODAR → UNIDAD_TECNICA
UPDATE usuarios SET rol = 'UNIDAD_TECNICA' 
WHERE rol = 'CODAR';

-- Crear índice de optimización
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Verificar resultado
SELECT DISTINCT rol FROM usuarios;
```

6. **Haz clic:** Execute
7. **Listo!** ✅

---

## ✅ OPCIÓN 2: Docker + psql (CON DOCKER)

Si tienes Docker instalado:

```bash
docker run --rm -it postgres:latest psql \
  "postgresql://neondb_owner:npg_g9BpjO5woiJA@ep-delicate-sound-ailtkjb8-pooler.c-4.us-east-1.aws.neon.tech:5432/neondb" \
  -f backend/migrations/011_update_roles_hierarchy_postgres.sql
```

---

## ✅ OPCIÓN 3: Backend Spring Boot (AUTOMÁTICO)

El backend de Spring Boot ejecutará las migraciones automáticamente cuando se reinicie porque:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Esto significa que Hibernate actualizará el esquema automáticamente.

**Para activarlo:**
1. Reinicia el servidor backend: `mvn spring-boot:run`
2. Accede a cualquier endpoint
3. Las migraciones se ejecutarán automáticamente

---

## 📊 VERIFICACIÓN POST-MIGRACIÓN

Después de ejecutar, verifica que todo funcionó:

```sql
-- Verificar roles únicos
SELECT DISTINCT rol FROM usuarios;

-- Contar usuarios por rol
SELECT rol, COUNT(*) as cantidad 
FROM usuarios 
GROUP BY rol 
ORDER BY rol;

-- Verificar índice
SELECT * FROM pg_indexes 
WHERE tablename = 'usuarios' AND indexname = 'idx_usuarios_rol';
```

**Resultado esperado:**
- ADMIN
- PRESIDENCIA
- UNIDAD_TECNICA
- (Sin CODAR, PRESIDENCIA_CODAR, UNIDAD_TECNICA_CODAR)

---

## 🚀 RECOMENDACIÓN

**Usa OPCIÓN 1 (Panel Web)** - Es la más rápida y no requiere herramientas adicionales.

**Te tomará 2 minutos máximo.**
