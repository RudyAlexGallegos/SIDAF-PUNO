# ✅ MIGRACIÓN LISTA - 3 OPCIONES PARA EJECUTAR

He creado **3 formas** de ejecutar la migración de roles:

---

## 🎯 OPCIÓN 1: Endpoint HTTP (RECOMENDADO) ⭐⭐⭐

El backend ahora tiene un endpoint para ejecutar la migración:

**Paso 1:** Inicia el backend
```bash
cd d:\SIDAF-PUNO\backend
mvn spring-boot:run
```

**Paso 2:** Ejecuta la migración (abre en tu navegador o terminal):
```bash
# GET - Ver estado actual
curl -H "Authorization: Bearer tu-token" \
  http://localhost:8083/api/admin/migration/roles/status

# POST - Ejecutar migración
curl -X POST -H "Authorization: Bearer tu-token" \
  http://localhost:8083/api/admin/migration/roles
```

**Resultado esperado:**
```json
{
  "estado": "✅ MIGRACIÓN COMPLETADA",
  "total_migrados": 0,  // Depende de cuántos usuarios tengas con roles antiguos
  "roles_finales": [
    { "rol": "ADMIN" },
    { "rol": "PRESIDENCIA" },
    { "rol": "UNIDAD_TECNICA" }
  ]
}
```

---

## 🎯 OPCIÓN 2: Script Automático (data.sql)

Spring Boot ejecuta automáticamente `data.sql` al iniciar si lo encuentra en `src/main/resources/`:

✅ **Ya creé el archivo:** `backend/src/main/resources/data.sql`

**Qué hace:**
- Al reiniciar el backend, Spring Boot ejecuta automáticamente el SQL
- Migra todos los roles
- Crea el índice

**Para activarlo:**
```bash
cd d:\SIDAF-PUNO\backend
mvn spring-boot:run
```

---

## 🎯 OPCIÓN 3: Panel Web de Neon (Manual)

Si prefieres hacerlo manualmente:

1. Ve a: https://console.neon.tech
2. SQL Editor
3. Copia y pega el contenido de: `backend/migrations/011_update_roles_hierarchy_postgres.sql`
4. Click Execute

---

## 📝 ARCHIVOS CREADOS

```
✅ backend/src/main/resources/data.sql
   → Script que se ejecuta automáticamente al iniciar

✅ backend/src/main/java/com/sidaf/backend/controller/MigrationController.java
   → Endpoint HTTP para ejecutar migración manualmente

✅ backend/migrations/011_update_roles_hierarchy_postgres.sql
   → Script SQL de migración (para usar en Neon panel o psql)

✅ run-migration.py / run-migration.js
   → Scripts para ejecutar desde línea de comandos (backup)
```

---

## 🚀 RECOMENDACIÓN FINAL

**Usa OPCIÓN 1 (Endpoint HTTP):**
1. Compila y corre el backend
2. Abre tu navegador
3. Accede a: `http://localhost:8083/api/admin/migration/roles/status`
4. Verifica que ves los roles: ADMIN, PRESIDENCIA, UNIDAD_TECNICA
5. Si todo está bien, ejecuta: `http://localhost:8083/api/admin/migration/roles` (POST)
6. ¡Listo!

---

## ✨ ESTADO ACTUAL

| Componente | Estado |
|---|---|
| Backend | ✅ Compilando |
| Frontend | ✅ Desplegado en Vercel |
| BD (Neon) | ⏳ Pendiente migración |
| Documentación | ✅ Completa |

---

**Próximo paso:** 
1. Espera a que compile el backend
2. Inicia el servidor
3. Ejecuta la migración
4. ¡Prueba los roles!
