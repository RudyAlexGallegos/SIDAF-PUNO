# 📋 SIDAF-PUNO - Sistema de Designación Inteligente de Árbitros de Fútbol

## 🏆 Documentación Técnica Completa

**Versión:** 3.0  
**Fecha:** Febrero 2025  
**Departamento:** Puno, Perú

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Sistema de Diseño](#sistema-de-diseño)
5. [Módulos del Sistema](#módulos-del-sistema)
6. [Gestión de Estado](#gestión-de-estado)
7. [Algoritmos de Designación](#algoritmos-de-designación)
8. [Tipos y Interfaces](#tipos-y-interfaces)
9. [Guía de Uso](#guía-de-uso)
10. [API de Componentes](#api-de-componentes)
11. [Buenas Prácticas](#buenas-prácticas)
12. [Solución de Problemas](#solución-de-problemas)

---

## 👁️ Visión General

### Descripción del Sistema

**SIDAF-PUNO** (Sistema de Designación Inteligente de Árbitros de Fútbol) es una aplicación web profesional diseñada específicamente para la **Liga Departamental de Fútbol de Puno, Perú**. El sistema permite la administración integral de árbitros de fútbol, incluyendo:

- ✅ **Gestión de Árbitros**: Registro, actualización y seguimiento de árbitros
- ✅ **Control de Asistencia**: Registro diario de actividades y estadísticas
- ✅ **Campeonatos**: Administración de torneos y competiciones
- ✅ **Equipos**: Gestión de equipos participantes por provincia
- ✅ **Designaciones Inteligentes**: Algoritmo automático de asignación de árbitros
- ✅ **Reportes**: Generación de estadísticas y reportes PDF

### Público Objetivo

- **Administradores de la Liga**: Gestiona árbitros, designaciones y reportes
- **Árbitros**: Consultan sus designaciones y estadísticas de asistencia
- **Comisión de Árbitros**: Supervisa y coordina el trabajo arbitral

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```typescript
// Dependencias principales
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state_management": "Zustand + localStorage",
  "icons": "Lucide React",
  "forms": "React Hook Form + Zod",
  "date_handling": "date-fns"
}
```

### Patrón de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  LAYOUT (Dashboard)                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                   PAGE                           │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │         COMPONENTS                        │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐   │  │  │  │
│  │  │  │  │         HOOKS                       │   │  │  │  │
│  │  │  │  │  ┌───────────────────────────────┐   │  │  │  │
│  │  │  │  │  │         DATA STORE           │   │  │  │  │
│  │  │  │  │  │         (ZUSTAND)            │   │  │  │  │
│  │  │  │  │  └───────────────────────────────┘   │  │  │  │
│  │  │  │  └─────────────────────────────────────┘   │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

### Árbol de Archivos

```
SIDAF-PUNO/
├── .next/                          # Build de Next.js (generado)
├── .vscode/                        # Configuración de VSCode
├── public/                         # Archivos estáticos
│   ├── images.jpeg
│   ├── placeholder-logo.png
│   ├── placeholder-user.jpg
│   └── placeholder.jpg
├── app/                           # Páginas (App Router)
│   ├── layout.tsx                 # Layout raíz
│   ├── page.tsx                   # Página principal (login/landing)
│   ├── globals.css               # Estilos globales
│   └── (dashboard)/              # Grupo de rutas autenticadas
│       └── dashboard/
│           ├── layout.tsx         # Layout del dashboard
│           ├── page.tsx           # Dashboard principal
│           ├── arbitros/         # Módulo de árbitros
│           │   ├── page.tsx      # Lista de árbitros
│           │   ├── loading.tsx   # Loading state
│           │   ├── nuevo/        # Crear árbitro
│           │   │   └── page.tsx
│           │   └── [id]/         # Ver/Editar árbitro
│           │       ├── page.tsx
│           │       └── editar/
│           │           └── page.tsx
│           ├── asistencia/        # Control de asistencia
│           │   ├── page.tsx
│           │   └── loading.tsx
│           ├── Campeonato/        # Gestión de campeonatos
│           │   ├── page.tsx      # Lista
│           │   ├── nuevo/        # Crear
│           │   │   └── page.tsx
│           │   ├── [id]/         # Ver
│           │   │   └── page.tsx
│           │   ├── [id]/editar/  # Editar
│           │   │   └── page.tsx
│           │   └── equipos/      # Gestión de equipos
│           │       └── page.tsx
│           ├── designaciones/    # Designaciones
│           │   ├── page.tsx      # Lista
│           │   └── nueva/        # Crear
│           │       └── page.tsx
│           ├── reportes/         # Reportes
│           │   └── page.tsx
│           └── login/           # Login
│               └── page.tsx
├── components/                    # Componentes reutilizables
│   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── calendar.tsx
│   │   ├── toast.tsx
│   │   ├── switch.tsx
│   │   ├── checkbox.tsx
│   │   └── ... (más componentes)
│   ├── asistencia/              # Componentes de asistencia
│   │   ├── ActivitySelector.tsx
│   │   ├── ActivityConfirmModal.tsx
│   │   ├── RegistroHeader.tsx
│   │   ├── RegistroCompactoArbitro.tsx
│   │   ├── RegistroStatsBar.tsx
│   │   ├── FiltrosArbitros.tsx
│   │   ├── ListaArbitros.tsx
│   │   └── ModalReportes.tsx
│   ├── dashboard-stats.tsx
│   ├── date-picker.tsx
│   ├── theme-provider.tsx
│   └── ...
├── hooks/                        # Hooks personalizados
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── asistencia/
│       ├── useArbitros.ts
│       └── useRegistroAsistencia.ts
├── lib/                          # Lógica de negocio
│   ├── data-store.ts            # Zustand store + tipos
│   ├── utils.ts                 # Utilidades
│   ├── algoritmo-designacion.ts  # Algoritmo básico
│   ├── algoritmo-designacion-mejorado.ts  # Algoritmo avanzado
│   ├── pdf-generator.ts         # Generación de PDFs
│   └── data-store.ts            # Persistencia
├── types/                        # Tipos TypeScript
│   └── asistencia.ts
├── services/                     # Servicios API
│   └── api.ts
├── styles/                       # Estilos
│   └── globals.css
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
└── README.md
```

---

## 🎨 Sistema de Diseño

### Principios de Diseño

1. **Minimalismo Profesional**: Interfaces limpias con espaciado generoso
2. **Jerarquía Visual Clara**: Tipografía y colores que guían la atención
3. **Consistencia**: Patrones de diseño uniformes
4. **Accesibilidad**: Contraste adecuado y navegación por teclado
5. **Responsividad**: Adaptación perfecta a todos los dispositivos

### Paleta de Colores

#### Colores Principales

```css
/* Fondos */
--slate-50: #f8fafc    /* Fondo principal */
--slate-100: #f1f5f9   /* Cards */
--white: #ffffff        /* Contenedores */

/* Texto */
--slate-900: #0f172a   /* Texto principal */
--slate-600: #475569   /* Texto secundario */
--slate-400: #94a3b8   /* Placeholders */

/* Acciones Principales */
--purple-500: #a855f7  /* Designaciones */
--purple-600: #9333ea   /* Designaciones hover */
--indigo-500: #6366f1  /* Gradiente secundario */
--indigo-600: #4f46e5  /* Gradiente hover */

/* Campeonatos */
--amber-500: #f59e0b   /* Torneos */
--orange-500: #f97316  /* Torneos hover */

/* Estados */
--green-500: #22c55e   /* Activo/Éxito */
--green-600: #16a34a   /* Hover */
--blue-500: #3b82f6    /* Información */
--red-500: #ef4444     /* Error */
--yellow-500: #eab308  /* Advertencia */
```

#### Gradientes de Acción

```tsx
// Botones principales (Designaciones)
<Button className="bg-gradient-to-r from-purple-500 to-indigo-600 
                    hover:from-purple-600 hover:to-indigo-600">

// Botones secundarios (Campeonatos)
<Button className="bg-gradient-to-r from-amber-500 to-orange-500 
                    hover:from-amber-600 hover:to-orange-500">

// Stats cards - Púrpura
<Card className="bg-gradient-to-br from-purple-50 to-indigo-50 
                 border-purple-200">

// Stats cards - Verde
<Card className="bg-gradient-to-br from-green-50 to-emerald-50 
                 border-green-200">

// Stats cards - Azul
<Card className="bg-gradient-to-br from-blue-50 to-cyan-50 
                 border-blue-200">
```

### Tipografía

```tsx
// Títulos principales
<h1 className="text-2xl font-bold text-slate-900">

// Subtítulos de sección
<h2 className="text-xl font-semibold text-slate-900">

// Títulos de cards
<h3 className="text-lg font-bold text-slate-900">

// Texto normal
<p className="text-base text-slate-600">

// Texto secundario
<p className="text-sm text-slate-500">
```

### Espaciado y Layout

```tsx
// Contenedor principal
<div className="container mx-auto py-8 px-4 max-w-7xl">

// Grid de cards
<div className="grid gap-4 md:grid-cols-3 mb-8">

// Card con gradiente顶部
<Card className="overflow-hidden">
  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
  ...
</Card>
```

---

## 📊 Módulos del Sistema

### 1. Dashboard Principal

**Ubicación:** [`app/(dashboard)/dashboard/page.tsx`](app/(dashboard)/dashboard/page.tsx)

**Características:**
- ✅ Métricas en tiempo real con animaciones
- ✅ Panel de actividad reciente
- ✅ Accesos rápidos a funciones
- ✅ Alertas del sistema
- ✅ Diseño responsive con gradientes

**Stats Cards:**
```tsx
// Árbitros - Verde esmeralda
<Card className="bg-gradient-to-br from-green-50 to-emerald-50 
                 border-green-200">

// Campeonatos - Ámbar/naranja
<Card className="bg-gradient-to-br from-amber-50 to-orange-50 
                 border-amber-200">

// Designaciones - Púrpura/indigo
<Card className="bg-gradient-to-br from-purple-50 to-indigo-50 
                 border-purple-200">
```

### 2. Gestión de Árbitros

**Ubicación:** [`app/(dashboard)/dashboard/arbitros/`](app/(dashboard)/dashboard/arbitros/)

**Páginas:**
- `page.tsx` - Lista de árbitros con filtros
- `nuevo/page.tsx` - Crear nuevo árbitro
- `[id]/page.tsx` - Ver perfil
- `[id]/editar/page.tsx` - Editar información

**Funcionalidades:**
- ✅ Búsqueda por nombre
- ✅ Filtros por categoría y disponibilidad
- ✅ Tarjetas con gradientes según categoría
- ✅ Indicadores visuales de estado

**Categorías de Árbitros:**
```tsx
// Badge de categoría FIFA
<Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 
                  text-white">
// Badge de categoría Nacional
<Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 
                  text-white">
// Badge de categoría Regional
<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 
                  text-white">
// Badge de categoría Provincial
<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 
                  text-white">
```

### 3. Control de Asistencia

**Ubicación:** [`app/(dashboard)/dashboard/asistencia/`](app/(dashboard)/dashboard/asistencia/)

**Componentes:**
- [`RegistroHeader.tsx`](components/asistencia/RegistroHeader.tsx) - Header del registro
- [`ActivitySelector.tsx`](components/asistencia/ActivitySelector.tsx) - Selector de actividad
- [`ListaArbitros.tsx`](components/asistencia/ListaArbitros.tsx) - Lista de árbitros
- [`RegistroCompactoArbitro.tsx`](components/asistencia/RegistroCompactoArbitro.tsx) - Vista compacta
- [`RegistroStatsBar.tsx`](components/asistencia/RegistroStatsBar.tsx) - Barra de estadísticas
- [`FiltrosArbitros.tsx`](components/asistencia/FiltrosArbitros.tsx) - Filtros
- [`ModalReportes.tsx`](components/asistencia/ModalReportes.tsx) - Reportes

**Tipos de Actividad:**
```typescript
const ACTIVIDADES = {
  preparacion_fisica: {
    label: " Preparación Física",
    icon: Activity,
    dias: ["lunes", "martes", "jueves"],
    color: "from-blue-400 to-blue-600"
  },
  entrenamiento: {
    label: " Entrenamiento Técnico",
    icon: Trophy,
    dias: ["viernes"],
    color: "from-green-400 to-green-600"
  },
  partido: {
    label: " Partido",
    icon: Users,
    dias: ["sabado", "domingo"],
    color: "from-purple-400 to-purple-600"
  }
}
```

### 4. Gestión de Campeonatos

**Ubicación:** [`app/(dashboard)/dashboard/campeonato/`](app/(dashboard)/dashboard/campeonato/)

**Páginas:**
- `page.tsx` - Lista de campeonatos
- `nuevo/page.tsx` - Crear campeonato
- `[id]/page.tsx` - Ver detalles
- `[id]/editar/page.tsx` - Editar
- `equipos/page.tsx` - Gestión de equipos

**Niveles de Dificultad:**
```tsx
<Badge className="bg-red-100 text-red-700 border-red-200">
  Alto
</Badge>
<Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
  Medio
</Badge>
<Badge className="bg-green-100 text-green-700 border-green-200">
  Bajo
</Badge>
```

**Estados del Campeonato:**
```tsx
<Badge className="bg-green-500">Activo</Badge>
<Badge className="border-blue-500 text-blue-600">Programado</Badge>
<Badge variant="secondary">Finalizado</Badge>
```

### 5. Gestión de Equipos

**Ubicación:** [`app/(dashboard)/dashboard/campeonato/equipos/page.tsx`](app/(dashboard)/dashboard/campeonato/equipos/page.tsx)

**Provincias de Puno:**
```typescript
const PROVINCIAS_PUNO = [
  "Puno",
  "Azángaro",
  "Carabaya",
  "Chucuito",
  "El Collao",
  "Huancané",
  "Lampa",
  "Melgar",
  "Moho",
  "San Antonio de Putina",
  "San Román",
  "Sandia",
  "Yunguyo"
]
```

**Divisiones:**
```tsx
<Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
  Primera División
</Badge>
<Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
  Segunda División
</Badge>
```

### 6. Designaciones Inteligentes

**Ubicación:** [`app/(dashboard)/dashboard/designaciones/`](app/(dashboard)/dashboard/designaciones/)

**Páginas:**
- `page.tsx` - Lista de designaciones
- `nueva/page.tsx` - Crear designación

**Funcionalidades:**
- ✅ Modo automático con algoritmo inteligente
- ✅ Modo manual de selección directa
- ✅ Filtros por campeonato
- ✅ Búsqueda por equipos o árbitro
- ✅ Indicadores de estado del partido

**Estados de Designación:**
```tsx
// Partido hoy
<Badge className="bg-red-500 animate-pulse">Hoy</Badge>

// Partido en 3 días
<Badge className="bg-orange-500">Próximo</Badge>

// Partido programado
<Badge className="bg-green-500">Programado</Badge>

// Partido pasado
<Badge className="bg-slate-500">Finalizado</Badge>
```

### 7. Reportes

**Ubicación:** [`app/(dashboard)/dashboard/reportes/page.tsx`](app/(dashboard)/dashboard/reportes/page.tsx)

**Tipos de Reportes:**
- Estadísticas de asistencia
- Historial de designaciones
- Exportación de datos (JSON)

---

## 🔧 Gestión de Estado

### Data Store (Zustand)

**Ubicación:** [`lib/data-store.ts`](lib/data-store.ts)

**Características:**
- ✅ Persistencia automática en localStorage
- ✅ Gestión de expiración de datos
- ✅ Funciones CRUD completas
- ✅ Backup y restauración

### Tipos Principales

```typescript
// Árbitro
interface Arbitro {
  id: string
  nombre: string
  apellido?: string
  categoria: "FIFA" | "Nacional" | "Regional" | "Provincial"
  experiencia: number
  disponible: boolean
  nivelPreparacion: number
  telefono?: string
  email?: string
  fechaNacimiento?: string
  direccion?: string
  provincia?: string
  observaciones?: string
  fechaRegistro: string
}

// Campeonato
interface Campeonato {
  id: string
  nombre: string
  categoria?: string
  nivelDificultad: "Alto" | "Medio" | "Bajo"
  estado: "programado" | "activo" | "finalizado"
  numeroEquipos?: number
  equipos?: string[]
  ciudad?: string
  estadio?: string
  fechaInicio?: string
  fechaFin?: string
}

// Equipo
interface Equipo {
  id: string
  nombre: string
  categoria?: string
  division?: string
  provincia?: string
  ciudad?: string
  estadio?: string
  telefono?: string
  email?: string
  colores?: string
}

// Designación
interface Designacion {
  id: string
  partidoId: string
  campeonatoId: string
  equipoLocal: string
  equipoVisitante: string
  fecha: string
  hora?: string
  estadio: string
  arbitroPrincipal: string
  arbitroAsistente1: string
  arbitroAsistente2: string
  cuartoArbitro: string
  fechaDesignacion: string
}

// Asistencia
interface Asistencia {
  id: string
  arbitroId: string
  fecha: string
  tipoActividad: string
  presente: boolean
  observaciones?: string
}
```

### Acciones del Store

```typescript
interface DataStore {
  // Árbitros
  addArbitro: (arbitro: Arbitro) => void
  updateArbitro: (id: string, updates: Partial<Arbitro>) => void
  deleteAribro: (id: string) => void
  
  // Campeonatos
  addCampeonato: (campeonato: Campeonato) => void
  updateCampeonato: (id: string, updates: Partial<Campeonato>) => void
  deleteCampeonato: (id: string) => void
  
  // Equipos
  createEquipo: (equipo: Equipo) => void
  updateEquipo: (id: string, updates: Partial<Equipo>) => void
  deleteEquipo: (id: string) => void
  
  // Designaciones
  addDesignacion: (designacion: Designacion) => void
  
  // Asistencias
  addAsistencia: (asistencia: Asistencia) => void
}
```

---

## 🧮 Algoritmos de Designación

### Algoritmo Básico

**Ubicación:** [`lib/algoritmo-designacion.ts`](lib/algoritmo-designacion.ts)

**Factores considerados:**
1. **Nivel de preparación** (70% peso)
2. **Experiencia** (30% peso)

```typescript
function designarArbitros(
  partido: Partido,
  campeonato: Campeonato,
  arbitrosDisponibles: Arbitro[]
): Designacion | null {
  // 1. Filtrar por disponibilidad
  const filtrados = arbitrosDisponibles.filter(a => a.disponible)
  
  // 2. Filtrar por requisitos del nivel
  const calificados = filtrados.filter(a => {
    const reqNivel = {
      Alto: 85,
      Medio: 70,
      Bajo: 50
    }
    return a.nivelPreparacion >= reqNivel[campeonato.nivelDificultad]
  })
  
  // 3. Ordenar por puntaje
  const ordenados = calificados.sort((a, b) => {
    const puntajeA = a.nivelPreparacion * 0.7 + a.experiencia * 5 * 0.3
    const puntajeB = b.nivelPreparacion * 0.7 + b.experiencia * 5 * 0.3
    return puntajeB - puntajeA
  })
  
  // 4. Asignar posiciones
  return {
    arbitroPrincipal: ordenados[0].id,
    arbitroAsistente1: ordenados[1].id,
    arbitroAsistente2: ordenados[2].id,
    cuartoArbitro: ordenados[3].id
  }
}
```

### Algoritmo Mejorado

**Ubicación:** [`lib/algoritmo-designacion-mejorado.ts`](lib/algoritmo-designacion-mejorado.ts)

**Factores considerados:**
1. **Asistencia reciente** (40% peso)
2. **Nivel de preparación** (30% peso)
3. **Experiencia** (20% peso)
4. **Categoría** (10% peso)

```typescript
function designarArbitrosMejorado(
  partido: Partido,
  campeonato: Campeonato,
  arbitrosDisponibles: Arbitro[],
  asistencias: Asistencia[]
): Designacion | null {
  // 1. Calcular puntaje de asistencia
  const calcularPuntajeAsistencia = (arbitroId: string): number => {
    const hace4Semanas = new Date()
    hace4Semanas.setDate(hace4Semanas.getDate() - 28)
    
    const recientes = asistencia.filter(
      a => a.arbitroId === arbitroId && 
          new Date(a.fecha) >= hace4Semanas && 
          a.presente
    )
    
    // Máximo 16 sesiones en 4 semanas
    const porcentaje = Math.min(100, (recientes.length / 16) * 100)
    
    // Bonificación por balance
    if (preparacionFisica >= 8 && entrenamientos >= 2) {
      return porcentaje + 10
    }
    return porcentaje
  }
  
  // 2. Calcular puntaje total
  const arbitrosConPuntaje = arbitrosCalificados.map(a => ({
    arbitro: a,
    puntajeTotal: 
      calcularPuntajeAsistencia(a.id) * 0.4 +
      (a.nivelPreparacion || 0) * 0.3 +
      Math.min(a.experiencia * 5, 50) * 0.2 +
      getCategoriaScore(a.categoria) * 0.1
  }))
  
  // 3. Ordenar y asignar
  return {
    arbitroPrincipal: mejorPuntaje.id,
    arbitroAsistente1: segundoMejor.id,
    arbitroAsistente2: tercerMejor.id,
    cuartoArbitro: cuarto.id
  }
}
```

---

## 📋 Guía de Uso

### Flujo de Trabajo Típico

#### 1. Configuración Inicial

```
1. Acceder al dashboard
2. Agregar árbitros (Gestión de Árbitros → Nuevo)
3. Crear equipos (Campeonatos → Equipos → Nuevo)
4. Crear campeonatos (Campeonato → Nuevo)
```

#### 2. Operación Diaria

```
1. Pasar Asistencia (Dashboard → Pasar Asistencia)
2. Revisar estadísticas del día
3. Crear designaciones si hay partidos
```

#### 3. Crear una Designación

```tsx
// Pasos en /dashboard/designaciones/nueva
1. Seleccionar campeonato
2. Elegir equipo local
3. Elegir equipo visitante
4. Establecer fecha y hora
5. Ingresar nombre del estadio
6. Elegir modo:
   - Automático: Clic en "Generar Designación Automática"
   - Manual: Seleccionar árbitros manualmente
7. Clic en "Guardar Designación"
```

### Navegación del Sistema

```
Dashboard Principal
├── Pasar Asistencia
├── Árbitros
│   ├── Ver Todos
│   ├── Agregar Nuevo
│   └── [Individual]
├── Campeonatos
│   ├── Ver Todos
│   ├── Equipos
│   ├── Nuevo Campeonato
│   └── [Individual]
├── Designaciones
│   ├── Ver Todas
│   └── Nueva Designación
└── Reportes
    └── Generar Reportes
```

---

## 🧩 API de Componentes

### Componentes UI Base

#### Button

```tsx
// Botón con gradiente
<Button className="bg-gradient-to-r from-purple-500 to-indigo-600 
                  hover:from-purple-600 hover:to-indigo-600">
  Texto
</Button>

// Variantes
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

#### Card

```tsx
// Card con gradiente顶部
<Card className="overflow-hidden border-0 shadow-lg bg-white/80 
                 backdrop-blur-sm">
  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### Badge

```tsx
// Badge con gradiente
<Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
  Texto
</Badge>

// Badge con color sólido
<Badge className="bg-green-500">Activo</Badge>

// Badge outline
<Badge variant="outline" className="border-blue-500 text-blue-600">
  Programado
</Badge>
```

### Componentes Personalizados

#### ActivitySelector

```tsx
<ActivitySelector
  actividad={tipoActividad}
  onSelect={handleSelect}
  disabled={!isToday}
/>
```

#### ListaArbitros

```tsx
<ListaArbitros
  arbitros={arbitrosFiltrados}
  onToggleAsistencia={handleToggle}
  actividadActual={tipoActividad}
/>
```

#### RegistroStatsBar

```tsx
<RegistroStatsBar
  total={totalArbitros}
  presentes={presentes}
  ausentes={ausentes}
  porcentaje={porcentaje}
/>
```

---

## ✅ Buenas Prácticas

### Para Administradores

1. **Realizar backups semanales** de los datos
2. **Mantener información actualizada** de árbitros
3. **Revisar métricas diariamente** en el dashboard
4. **Generar reportes mensuales** para análisis

### Para Desarrolladores

1. **Usar TypeScript** en todos los archivos nuevos
2. **Seguir la estructura de carpetas** establecida
3. **Usar componentes de shadcn/ui** cuando sea posible
4. **Mantener consistencia** con el diseño existente
5. **Documentar cambios** en este archivo

### Convenciones de Código

```typescript
// Nombrado de archivos
- page.tsx          // Páginas
- component.tsx     // Componentes
- hook.ts           // Hooks personalizados
- util.ts           // Utilidades

// Nombrado de componentes
- PascalCase para componentes
- camelCase para funciones

// TypeScript
- Usar interfaces para objetos
- Usar types para uniones/alias
- Evitar any, usar unknown si es necesario
```

---

## 🔒 Solución de Problemas

### Problemas Comunes

#### Los datos no se guardan

```bash
# Verificar localStorage
1. Abrir DevTools (F12)
2. Ir a Application → Local Storage
3. Verificar que existen datos en 'sidaf-data'
4. Si no hay datos, agregar algunos manualmente
```

#### La interfaz se ve mal

```bash
# Soluciones
1. Actualizar navegador a última versión
2. Verificar que Tailwind CSS está cargado
3. Comprobar que no hay extensiones interfiriendo
4. Verificar resolución de pantalla
```

#### Las designaciones no se generan

```bash
# Verificar requisitos
1. Mínimo 4 árbitros registrados
2. Árbitros deben estar disponibles
3. Campeonato debe estar seleccionado
4. Verificar consola para errores
```

---

## 📚 Recursos Adicionales

### Documentación de Referencia

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

## 🔮 Roadmap Futuro

### Próximas Características

- [ ] Modo oscuro completo
- [ ] Notificaciones push
- [ ] Integración con calendarios externos
- [ ] App móvil (PWA)
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de roles y permisos
- [ ] Integración con APIs externas
- [ ] Exportación a Excel
- [ ] Generación automática de calendario
- [ ] Sistema de evaluaciones de árbitros

---

## 📄 Información de Versión

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 3.0 | Feb 2025 | Diseño colorido, equipos por provincia |
| 2.0 | Dic 2024 | Algoritmo mejorado, asistencia |
| 1.0 | Nov 2024 | Versión inicial |

---

**© 2025 SIDAF-PUNO - Sistema de Designación Inteligente de Árbitros de Fútbol**

*Liga Departamental de Fútbol de Puno, Perú*
