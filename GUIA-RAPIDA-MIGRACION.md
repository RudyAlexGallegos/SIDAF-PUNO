# 🚀 GUÍA RÁPIDA - Migración de Roles

## 1️⃣ Compilar Backend (2 minutos)

```bash
cd d:\SIDAF-PUNO\backend
mvn clean compile -DskipTests
```

**Resultado esperado:** `BUILD SUCCESS`

---

## 2️⃣ Iniciar Backend (1 minuto)

```bash
cd d:\SIDAF-PUNO\backend
mvn spring-boot:run
```

**Resultado esperado:** `Tomcat started on port(s): 8083`

---

## 3️⃣ Verificar Estado de Roles (SIN cambios)

**En Postman o navegador:**
```
GET http://localhost:8083/api/admin/migration/roles/status
```

**Verás algo así:**
```json
{
  "roles_unicos": [
    { "rol": "ADMIN" },
    { "rol": "CODAR" },
    { "rol": "PRESIDENCIA_CODAR" },
    { "rol": "UNIDAD_TECNICA_CODAR" }
  ],
  "usuarios_por_rol": [
    { "rol": "ADMIN", "cantidad": 1 },
    { "rol": "CODAR", "cantidad": 5 },
    { "rol": "PRESIDENCIA_CODAR", "cantidad": 2 },
    { "rol": "UNIDAD_TECNICA_CODAR", "cantidad": 8 }
  ]
}
```

---

## 4️⃣ EJECUTAR la Migración (SÍ hace cambios)

**En Postman o curl:**
```bash
curl -X POST \
  -H "Authorization: Bearer token-aqui" \
  http://localhost:8083/api/admin/migration/roles
```

**O en Postman:**
- Método: **POST**
- URL: `http://localhost:8083/api/admin/migration/roles`
- Headers: `Authorization: Bearer {tu-token}`

**Resultado esperado:**
```json
{
  "inicio": "Iniciando migración de roles...",
  "unidad_tecnica_codar_migrados": 8,
  "presidencia_codar_migrados": 2,
  "codar_migrados": 5,
  "indice_creado": true,
  "roles_finales": [
    { "rol": "ADMIN" },
    { "rol": "PRESIDENCIA" },
    { "rol": "UNIDAD_TECNICA" }
  ],
  "estadisticas": [
    { "rol": "ADMIN", "cantidad": 1 },
    { "rol": "PRESIDENCIA", "cantidad": 2 },
    { "rol": "UNIDAD_TECNICA", "cantidad": 13 }
  ],
  "estado": "✅ MIGRACIÓN COMPLETADA",
  "total_migrados": 15
}
```

---

## 5️⃣ Verificar Nuevamente

```
GET http://localhost:8083/api/admin/migration/roles/status
```

**Ahora deberías ver:**
```json
{
  "roles_unicos": [
    { "rol": "ADMIN" },
    { "rol": "PRESIDENCIA" },
    { "rol": "UNIDAD_TECNICA" }
  ],
  "usuarios_por_rol": [
    { "rol": "ADMIN", "cantidad": 1 },
    { "rol": "PRESIDENCIA", "cantidad": 2 },
    { "rol": "UNIDAD_TECNICA", "cantidad": 13 }
  ]
}
```

---

## ✅ ¡MIGRACIÓN COMPLETADA!

Ahora:
1. ✅ Backend con nuevos roles
2. ✅ BD actualizada con nuevos roles
3. ✅ Frontend desplegado en Vercel
4. ✅ Usuarios con roles migrados

**Siguiente:** Prueba con cada rol
