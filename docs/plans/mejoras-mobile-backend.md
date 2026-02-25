# 📋 SIDAF-PUNO - Plan de Mejoras y Backend

## 🎯 Objetivos

1. **Mejorar responsividad mobile** - UX/UI amigable en celulares
2. **Implementar Backend** - Spring Boot + PostgreSQL

---

## 📱 FASE 1: Mejoras de Responsividad Mobile

### Problemas Identificados

| Problema | Ubicación | Severidad |
|----------|-----------|-----------|
| Sidebar fijo sin collapse en mobile | [`layout.tsx`](app/(dashboard)/dashboard/layout.tsx:119) | 🔴 Alta |
| Padding excesivo en mobile | Varias páginas | 🟡 Media |
| Grid de 3 columnas no se adapta | [`arbitros/page.tsx`](app/(dashboard)/dashboard/arbitros/page.tsx:172) | 🟡 Media |
| Touch targets pequeños | Buttons y selects | 🟡 Media |
| Tablas sin scroll horizontal | Reportes | 🟡 Media |

### Plan de Mejoras Mobile

#### 1.1 Sidebar Responsive con shadcn/ui

**Problema actual:**
```tsx
// Sidebar siempre visible, ancho fijo
<aside className="w-64">
```

**Solución:**
- Implementar sidebar collapsible con shadcn/ui [Sheet](components/ui/sheet.tsx)
- Menú hamburguesa visible solo en mobile
- Animaciones suaves de transición

```tsx
// Mobile: Sheet drawer
// Desktop: Sidebar tradicional
```

#### 1.2 Dashboard Principal

**Problema:** [`page.tsx`](app/(dashboard)/dashboard/page.tsx) - Stats cards en grid de 3 columnas

**Solución:**
```tsx
// Grid responsive
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

#### 1.3 Árbitros

**Problema:** [`arbitros/page.tsx`](app/(dashboard)/dashboard/arbitros/page.tsx:172) - Grid de 3 columnas

**Solución:**
```tsx
// Mobile: 1 columna, Tablet: 2, Desktop: 3
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

#### 1.4 Asistencia

**Problema:** [`asistencia/page.tsx`](app/(dashboard)/dashboard/asistencia/page.tsx) - selectors muy grandes

**Solución:**
- Selectores de actividad más compactos
- Botones más grandes (mínimo 44px touch target)
- Bottom action bar fija

#### 1.5 Touch Targets

**Estándar mínimo:**
- Buttons: `h-11 px-4` (44px mínimo)
- Inputs: `h-11`
- Cards clickables: `p-4`

---

## 🏗️ FASE 2: Backend Spring Boot

### Arquitectura Planificada

```mermaid
graph TB
    subgraph Frontend
        A[Next.js App] --> B[API Calls]
    end
    
    subgraph Backend
        C[Spring Boot 3.2]
        D[Controllers]
        E[Services]
        F[Repositories]
        G[JPA Entities]
    end
    
    subgraph Database
        H[PostgreSQL]
    end
    
    B -->|HTTP REST| C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Java 17 |
| Framework | Spring Boot 3.2.0 |
| Base de Datos | PostgreSQL 15 |
| ORM | Spring Data JPA |
| Seguridad | Spring Security + JWT |
| Documentación | SpringDoc OpenAPI |
| Build | Maven |

### Base de Datos PostgreSQL (13 tablas)

```
📦 postgres://postgres:***@localhost:5432/sidaf_puno
├── usuarios
├── provincias (catálogo)
├── arbitros
├── equipos
├── campeonatos
├── campeonato_equipos
├── partidos
├── designaciones
├── asistencias
└── ...
```

### Endpoints API REST

| Módulo | Endpoint | Métodos |
|--------|----------|---------|
| Árbitros | `/api/arbitros` | GET, POST, PUT, DELETE |
| Asistencia | `/api/asistencia` | GET, POST |
| Campeonatos | `/api/campeonatos` | CRUD completo |
| Equipos | `/api/equipos` | CRUD completo |
| Designaciones | `/api/designaciones` | CRUD completo |
| Auth | `/api/auth/login` | POST |

---

## 📋 Tareas Detalladas

### Mobile - Semana 1

- [ ] Sidebar collapsible con Sheet
- [ ] Dashboard responsive
- [ ] Árbitros responsive
- [ ] Asistencia responsive
- [ ] Designaciones responsive
- [ ] Campeonatos responsive

### Backend - Semana 2-3

- [ ] Crear proyecto Spring Boot
- [ ] Configurar PostgreSQL
- [ ] Entidades JPA
- [ ] Repositories
- [ ] Services
- [ ] Controllers
- [ ] JWT Security
- [ ] Testing

### Integración - Semana 4

- [ ] Conectar frontend con API
- [ ] Reemplazar localStorage
- [ ] Estados de carga
- [ ] Manejo de errores
- [ ] Deploy Vercel

---

## 📁 Archivos a Modificar

### Mobile

```
app/(dashboard)/dashboard/layout.tsx    ← Sidebar
app/(dashboard)/dashboard/page.tsx      ← Dashboard
app/(dashboard)/dashboard/arbitros/page.tsx
app/(dashboard)/dashboard/asistencia/page.tsx
app/(dashboard)/dashboard/designaciones/page.tsx
app/(dashboard)/dashboard/campeonato/page.tsx
```

### Backend (nuevo)

```
sidaf-backend/
├── src/main/java/com/sidaf/puno/
│   ├── SidafBackendApplication.java
│   ├── config/
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   ├── service/
│   ├── dto/
│   └── security/
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

---

## ⏱️ Estimación

| Fase | Duración | Entregable |
|------|----------|------------|
| Mobile | 1 semana | UI responsive |
| Backend | 2-3 semanas | API completa |
| Integración | 1 semana | App funcional |
| **Total** | **4-5 semanas** | **MVP completo** |
