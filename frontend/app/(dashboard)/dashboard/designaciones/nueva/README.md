# 🎯 Sistema Completo de Designación Inteligente de Árbitros

## 📋 Descripción

Complete professional implementation of an intelligent referee assignment system for football matches. All code is self-contained within this route: `/dashboard/designaciones/nueva`.

Sistema integrado con el backend que:
- Carga **campeonatos reales** desde la base de datos
- Obtiene **equipos participantes** de cada campeonato
- Carga **designaciones sin asignar** (partidos que necesitan árbitros)
- Permite seleccionar qué partidos desea designar árbitros
- Usa información real de árbitros disponibles

**Características principales:**
- ✅ Gestión de campeonatos y etapas desde backend
- ✅ Visualización de partidos reales del sistema
- ✅ Selección de partidos para designación
- ✅ Designación manual con validación en tiempo real
- ✅ Designación automática inteligente con algoritmo heurístico
- ✅ Modo simulación sin guardar
- ✅ Configuración personalizable del algoritmo
- ✅ Panel de validación y errores
- ✅ UX moderna y profesional

---

## 📊 Flujo de Datos

```
Backend API (Java)
  ↓
  ├── GET /api/campeonato → Campeonatos
  ├── GET /api/arbitros → Árbitros disponibles
  ├── GET /api/designaciones/campeonato/{id} → Partidos sin designar
  └── GET /api/equipos → Información de equipos

Frontend (Next.js)
  ↓
  ├── Mapeo: Campeonato → Championship
  ├── Mapeo: Arbitro → Referee
  ├── Mapeo: Designacion → Match (solo PROGRAMADA)
  └── Estado: Zustand (useDesignationStore)

Interfaz de Usuario
  ↓
  ├── CompetitionSidebar: Seleccionar campeonato/etapa
  ├── MatchList: Ver partidos sin designar
  ├── AssignmentPanel: Designar árbitros (manual o automático)
  └── ErrorPanel: Validación de restricciones
```

---

## 🏗️ Arquitectura del Proyecto

```
/dashboard/designaciones/nueva/
├── page.tsx              # Página principal (autocontenido)
├── lib/
│   ├── types.ts          # Tipos e interfaces compartidas
│   └── algorithm.ts      # Algoritmo heurístico de designación
├── hooks/
│   └── useDesignationStore.ts  # Estado global (Zustand)
└── components/
    ├── CompetitionSidebar.tsx      # Selección de campeonatos/etapas
    ├── MatchList.tsx               # Lista de partidos
    ├── AssignmentPanel.tsx         # Panel principal de asignación
    ├── RefereeSelector.tsx         # Selector de árbitros
    ├── AlgorithmConfigPanel.tsx    # Configuración del algoritmo
    ├── SimulationResult.tsx        # Resultados de simulación
    └── ErrorPanel.tsx              # Panel de errores/validación
```

---

## 🔧 Componentes

### 1. **CompetitionSidebar**
Muestra champiosatos y permite seleccionar campeonatos y etapas.

**Props:**
- `championships: Championship[]` - Lista de campeonatos disponibles

**Funcionalidad:**
- Expandir/contraer etapas
- Seleccionar etapa activa
- Mostrar estado de etapa (Activa, Planeación, Finalizada)

---

### 2. **MatchList**
Visualización de partidos con selección múltiple.

**Props:**
- `matches: Match[]` - Partidos de la etapa

**Funcionalidad:**
- Selección múltiple con checkbox
- Filtrado por estado
- Indicadores visuales de importancia
- Información de roles requeridos

---

### 3. **AlgorithmConfigPanel**
Configuración de los pesos del algoritmo de designación.

**Presets disponibles:**
- 🏅 **Calidad**: Prioriza nivel (60%), carga (20%), diversidad (20%)
- ⚖️ **Balance**: Distribuido 33%-33%-34%
- 👥 **Equitativo**: Prioriza diversidad (60%), carga (20%), nivel (20%)

**Customización:**
- Sliders para ajustar pesos
- Validación automática de suma ~100%
- Tips contextuales

---

### 4. **AssignmentPanel**
Panel principal con dos modos: Automático y Manual.

**Modo Automático:**
- Vista previa de simulación
- Botón para ejecutar algoritmo
- Muestra configuración actual

**Modo Manual:**
- Seleccionar partido
- Seleccionar rol
- Elegir árbitro de forma manual

---

### 5. **RefereeSelector**
Selector de árbitros para asignación manual con búsqueda.

**Funcionalidad:**
- Búsqueda por nombre o DNI
- Filtrado de árbitros válidos
- Indicadores de estado (disponible, agenda llena, etc.)
- Información de nivel y especialidad

---

### 6. **SimulationResultComponent**
Muestra resultados detallados de la simulación.

**Métricas:**
- Tasa de éxito percentual
- Score promedio de asignaciones
- Diversidad de asignaciones
- Carga promedio por árbitro

**Funcionalidad:**
- Ver detalles de cada asignación
- Mostrar errores y conflictos
- Botones para aplicar o descartar

---

### 7. **ErrorPanel**
Panel para mostrar errores, advertencias e información.

**Severidades:**
- `error` - Debe resolverse
- `warning` - Considera atención
- `info` - Información general

---

## 📊 Estado Global (Zustand)

El archivo `hooks/useDesignationStore.ts` gestiona todo el estado global:

```typescript
interface UIState {
  selectedChampionship: Championship | null
  selectedStage: Stage | null
  selectedMatches: string[]
 algorithmConfig: AlgorithmConfig
  algorithmPreset: AlgorithmPreset
  simulationResult: SimulationResult | null
  isSimulating: boolean
  showSimulationResult: boolean
  manualAssignmentMode: boolean
  selectedMatchForManual: Match | null
  selectedRoleForManual: RefereeRole | null
}
```

**Principales acciones:**
- `selectChampionship()` - Seleccionar campeonato
- `selectStage()` - Seleccionar etapa
- `toggleMatchSelection()` - Seleccionar/deseleccionar partidos
- `setAlgorithmPreset()` - Cambiar preset
- `setAlgorithmConfig()` - Configurar pesos
- `setSimulationResult()` - Guardar resultado de simulación

---

## 🤖 Algoritmo de Designación

### Comportamiento

1. **Ordenamiento de partidos:**
   - Por importancia (DESC)
   - Por fecha (ASC)

2. **Para cada partido → para cada rol:**
   - Filtrar árbitros válidos (hard constraints)
   - Calcular score heurístico
   - Seleccionar mejor candidato
   - Registrar errores si no hay candidatos

### Hard Constraints (Obligatorios)

✅ Árbitro disponible  
✅ No exceder 2 partidos por día  
✅ Tener el rol requerido  

### Soft Constraints (Optimizables)

📊 Nivel más alto → mejor para partidos importantes  
📊 Menos carga hoy → mejor candidato  
📊 Mayor diversidad → evita saturar los mismos  

### Fórmula de Scoring

```typescript
score = (nivel * w₁) + (1/(1+carga)) * w₂ + (diversidad * w₃)

Donde:
- nivel ∈ [0, 1] → normalizado a 10
- carga = partidos hoy
- diversidad = 1 - (asignacionesTotales / maxAsignaciones)
- w₁, w₂, w₃ = pesos configurables
```

### Ejemplo

**Árbitro 1:**
- Nivel: 8/10 = 0.8
- Carga: 0 partidos hoy → score= 1/(1+0) = 1.0
- Diversidad: 5 asignaciones totales → 40/50 = 0.6

Con preset BALANCE (0.33, 0.33, 0.34):
```
score = (0.8 * 0.33) + (1.0 * 0.33) + (0.6 * 0.34) = 0.264 + 0.33 + 0.204 = 0.798
```

Display: **80/100**

---

## 🔄 Flujo de Uso

### 1️⃣ Carga Inicial
```
API → Mapeo de datos → Store → UI renderizada
```

### 2️⃣ Selección de Campeonato y Etapa
```
Usuario selecciona en sidebar
→ setSelectedChampionship() / setSelectedStage()
→ Se cargan partidos de esa etapa
```

### 3️⃣ Selección de Partidos
```
Usuario marca checkboxes
→ toggleMatchSelection()
→ Actualiza matchList para AssignmentPanel
```

### 4️⃣ Configuración del Algoritmo
```
Usuario ajusta sliders / elige preset
→ setAlgorithmConfig() / setAlgorithmPreset()
→ Config guardada en Store
```

### 5️⃣ Ejecutar Simulación
```
Usuario hace click en "Ejecutar Simulación"
→ assignReferees() ejecuta algoritmo
→ SimulationResult generado
→ Mostrado en SimulationResultComponent
```

### 6️⃣ Asignación Manual (Opcional)
```
Modo Manual:
  - Seleccionar partido
  - Seleccionar rol
  - Buscar y elegir árbitro
```

---

## 💾 Tipos e Interfaces

### Championship
```typescript
interface Championship {
  id: number
  nombre: string
  categoria?: string
  estado?: string
  numeroEquipos?: number
  etapas: Stage[]
  etapaActiva?: Stage
}
```

### Stage
```typescript
interface Stage {
  id: number
  nombre: string
  idCampeonato: number
  fecha_inicio: string
  fecha_fin: string
  status: StageStatus  // PLANNING | ACTIVE | FINISHED
  orden: number
  descripcion?: string
}
```

### Match
```typescript
interface Match {
  id: string
  idCampeonato: number
  idEtapa: number
  equipoLocal: Team
  equipoVisitante: Team
  fecha: string
  hora: string
  estadio: string
  importancia: number  // 1-10
  rolesRequeridos: RefereeRole[]
  status: MatchStatus
  designaciones: Record<RefereeRole, number | null>
  createdAt: string
}
```

### Referee
```typescript
interface Referee {
  id: number
  nombres?: string
  apellido?: string
  dni?: string
  categoria?: string
  nivel?: number  // 1-10
  especialidad?: string
  experiencia?: number
  roles: RefereeRole[]
  disponible: boolean
  partidosHoy: number
  ultimosEquiposParados?: number[]
}
```

### AlgorithmConfig
```typescript
interface AlgorithmConfig {
  weightLevel: number      // 0-1
  weightLoad: number       // 0-1
  weightDiversity: number  // 0-1
}
```

### SimulationResult
```typescript
interface SimulationResult {
  successCount: number
  errorCount: number
  totalMatches: number
  assignments: AssignmentResult[]
  errors: Array<{matchId, role, error}>
  statistics: {
    averageScore: number
    averageLoadPerReferee: number
    diversityMetric: number
  }
  timestamp: string
}
```

---

## 🎨 UX/UI Features

### Indicadores Visuales

**Importancia de Partido:**
- 🔴 Crítico (8-10)
- 🟠 Alto (5-7)
- 🟡 Normal (1-4)

**Estado de Árbitro:**
- 🟢 Disponible
- 🟡 1 partido hoy
- 🔴 Agenda llena/No disponible

**Badgeses de Configuración:**
- Color púrpura: Nivel
- Color azul: Carga
- Color verde: Diversidad

### Tooltips y Ayuda

- Cada métrica tiene tooltip explicativo
- Botones accionables con descripción
- Tips contextuales en modo simulación

### Responsive Design

- Mobile: Stack vertical
- Tablet: 2 columnas
- Desktop: 4 columnas (1 sidebar + 3 contenido)

---

## 🚀 Optimizaciones Incluidas

1. **Caché de búsqueda** en RefereeSelector
2. **Debounce** en inputs si es necesario
3. **Virtualización** de listas largas (si es necesario)
4. **Memoización** de componentes costosos
5. **Lazy loading** de  resultados

---

## 🔮 Funcionalidades Futuras

- [ ] Integración con geolocalización
- [ ] Persistencia de configuraciones en LocalStorage
- [ ] Exportación de resultados a PDF
- [ ] Histórico de simulaciones
- [ ] Análisis de desempeño de árbitros
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Integración con calendario externo

---

## 📝 Notas de Desarrollo

1. Este sistema está **completamente autocontenido** en `/dashboard/designaciones/nueva`
2. No depende de rutas adicionales
3. Usa **Zustand** para estado global (más ligero que Redux)
4. Componentes **modular es y reutilizables**
5. Tipos **100% TypeScript** para seguridad
6. **Algoritmo eficiente** O(n*m) donde n=partidos, m=árbitros

---

## 📚 Referencias

- [Algoritmo Heurístico](./lib/algorithm.ts)
- [Tipos Completos](./lib/types.ts)
- [Store Zustand](./hooks/useDesignationStore.ts)
- [Página Principal](./page.tsx)

---

**Versión:** 1.0.0  
**Última actualización:** April 11, 2026  
**Autor:** Sistema SIDAF-PUNO
