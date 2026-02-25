# 📋 SIDAF-PUNO - Plan de Reorganización de Estructura

## 🎯 Objetivo

Organizar el proyecto SIDAF-PUNO en una estructura clara con 3 carpetas principales:
- 📁 **frontend/** - Aplicación Next.js
- 📁 **backend/** - API Spring Boot
- 📁 **docs/** - Documentación

---

## 📊 Situación Actual

```
D:\SIDAF-PUNO\                    ← Frontend (Next.js)
│
D:\backend\backend\               ← Backend (Spring Boot)
│
D:\SIDAF-PUNO\DOCUMENTACION.md   ← Documentación dispersa
```

---

## 🎯 Nueva Estructura Propuesta

```
D:\SIDAF-PUNO\
├── 📁 frontend/                  ← Next.js (移动 desde raíz)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── public/
│   ├── package.json
│   ├── next.config.mjs
│   └── README.md
│
├── 📁 backend/                  ← Spring Boot (移动 desde D:\backend\backend)
│   ├── src/main/java/com/sidaf/backend/
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── config/
│   │   └── SidafBackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── README.md
│
└── 📁 docs/                    ← Documentación centralizada
    ├── DOCUMENTACION.md
    ├── plans/
    │   ├── backend-architecture.md
    │   ├── backend-principiantes.md
    │   └── mejoras-mobile-backend.md
    └── GUIA-BACKEND.md
```

---

## ⚠️ Consideraciones Importantes

### GitHub

| Aspecto | Acción |
|---------|--------|
| Repositorio actual | https://github.com/RudyAlexGallegos/SIDAF-PUNO |
| Frontend | ✅ Mantener mismo repositorio |
| Backend | ⚠️ Puede ir en subcarpeta O repositorio separado |

**Opción A: Todo en un repositorio**
```
SIDAF-PUNO/
├── frontend/
├── backend/
└── docs/
```

**Opción B: Dos repositorios**
```
SIDAF-PUNO/               → Repositorio frontend
└── frontend/

SIDAF-PUNO-BACKEND/      → Repositorio backend
└── backend/
```

### Vercel

- **Frontend**: Apunta a `https://github.com/RudyAlexGallegos/SIDAF-PUNO` → carpeta `frontend`
- **Backend**: Necesita hosting (Render, Railway, o VPS)

---

## 📋 Pasos de Migración

### Paso 1: Crear carpetas
```bash
cd D:\SIDAF-PUNO
mkdir frontend
mkdir backend
mkdir docs
```

### Paso 2: Mover frontend
```bash
cd D:\SIDAF-PUNO
move app frontend/
move components frontend/
move hooks frontend/
move lib frontend/
move services frontend/
move types frontend/
move public frontend/
move package.json frontend/
move next.config.mjs frontend/
move tailwind.config.ts frontend/
move tsconfig.json frontend/
move postcss.config.mjs frontend/
```

### Paso 3: Copiar backend
```bash
cd D:\SIDAF-PUNO
xcopy D:\backend\backend\* backend\ /E /H
```

### Paso 4: Mover documentación
```bash
cd D:\SIDAF-PUNO
move DOCUMENTACION.md docs/
move plans docs/
```

### Paso 5: Actualizar Git
```bash
cd D:\SIDAF-PUNO
git add -A
git commit -m "refactor: Reorganización en carpetas frontend/backend/docs"
git push origin main
```

### Paso 6: Actualizar Vercel

1. Ir a https://vercel.com
2. Seleccionar proyecto SIDAF-PUNO
3. Settings → Git → Root Directory
4. Cambiar a: `frontend`
5. Redeploy

---

## 🔧 Cambios Técnicos Necesarios

### Frontend

1. **path aliases** en `frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. **Scripts** en `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "cd frontend && next dev",
    "build": "cd frontend && next build",
    "start": "cd frontend && next start"
  }
}
```

---

## 📝 Preguntas para el Usuario

| Decisión | Opciones |
|----------|----------|
| GitHub | ¿Un repositorio o dos? |
| Backend | ¿Dónde estaba el backend antes? |
| Dominios | ¿Subdomain para backend? |

---

## ⏱️ Estimación

| Tarea | Tiempo |
|-------|--------|
| Crear carpetas | 5 min |
| Mover archivos | 10 min |
| Actualizar configuración | 15 min |
| Probar frontend | 10 min |
| Probar backend | 10 min |
| **Total** | **~50 minutos** |
