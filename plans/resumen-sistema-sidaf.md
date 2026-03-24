# 📋 Resumen del Sistema SIDAF-PUNO

## 🏆 Propósito del Sistema

**SIDAF-PUNO** (Sistema de Designación Inteligente de Árbitros de Fútbol) es una aplicación web integral diseñada específicamente para la **Liga Departamental de Fútbol de Puno, Perú**. El sistema permite la administración completa de árbitros de fútbol, desde su registro hasta la asignación inteligente de designaciones.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gestión de Estado**: Zustand + localStorage
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod
- **Manejo de Fechas**: date-fns

#### Backend
- **Framework**: Spring Boot (Java)
- **Base de Datos**: PostgreSQL (probable)
- **API REST**: Spring MVC
- **CORS**: Configurado para múltiples orígenes

---

## 📊 Módulos y Funcionalidades

### 1. Gestión de Árbitros

**Ruta**: `/dashboard/arbitros`

**Funcionalidades**:
- ✅ Registro completo de árbitros
- ✅ Actualización de información personal y profesional
- ✅ Búsqueda por nombre y filtros
- ✅ Clasificación por categoría (FIFA, Nacional, Regional, Provincial)
- ✅ Seguimiento de disponibilidad
- ✅ Nivel de preparación y experiencia
- ✅ Información de contacto y ubicación

**Categorías de Árbitros**:
- **FIFA**: Nivel internacional (badge amarillo/ámbar)
- **Nacional**: Nivel nacional (badge azul/índigo)
- **Regional**: Nivel regional (badge verde/esmeralda)
- **Provincial**: Nivel provincial (badge púrpura/rosa)

---

### 2. Control de Asistencia

**Ruta**: `/dashboard/asistencia`

**Funcionalidades**:
- ✅ Registro diario de asistencia
- ✅ Tres tipos de actividades:
  - **Preparación Física**: Lunes, martes, jueves
  - **Entrenamiento Técnico**: Viernes
  - **Partidos**: Sábado, domingo
- ✅ Registro de hora de entrada y salida
- ✅ Geolocalización (latitud/longitud)
- ✅ Control de retrasos
- ✅ Observaciones y notas
- ✅ Historial completo por árbitro
- ✅ Estadísticas de asistencia (porcentaje, total)
- ✅ Reportes consolidados
- ✅ Exportación a PDF

**Componentes Clave**:
- `ActivitySelector.tsx`: Selector de tipo de actividad
- `ListaArbitros.tsx`: Lista para marcar asistencia
- `RegistroStatsBar.tsx`: Barra de estadísticas en tiempo real
- `alertas-asistencia.tsx`: Alertas y notificaciones
- `dashboard-estadisticas-asistencia.tsx`: Estadísticas visuales
- `dashboard-estadisticas-avanzadas.tsx`: Análisis avanzado

**Historial de Asistencia**:
- Vista por meses
- Filtros por tipo de actividad
- Estadísticas por árbitro
- Ranking de asistencia
- Exportación de datos

---

### 3. Gestión de Campeonatos

**Ruta**: `/dashboard/campeonato`

**Funcionalidades**:
- ✅ Creación y gestión de torneos
- ✅ Configuración de nivel de dificultad (Alto, Medio, Bajo)
- ✅ Estados: Programado, Activo, Finalizado
- ✅ Información de fechas y estadios
- ✅ Asignación de equipos

**Niveles de Dificultad**:
- **Alto**: Requiere árbitros con nivel de preparación ≥ 85
- **Medio**: Requiere árbitros con nivel de preparación ≥ 70
- **Bajo**: Requiere árbitros con nivel de preparación ≥ 50

---

### 4. Gestión de Equipos

**Ruta**: `/dashboard/campeonato/equipos`

**Funcionalidades**:
- ✅ Registro de equipos por provincia
- ✅ 13 provincias de Puno:
  - Puno, Azángaro, Carabaya, Chucuito, El Collao,
  - Huancané, Lampa, Melgar, Moho, San Antonio de Putina,
  - San Román, Sandia, Yunguyo
- ✅ División (Primera, Segunda)
- ✅ Información de estadio y contacto
- ✅ Colores del equipo

---

### 5. Designaciones Inteligentes

**Ruta**: `/dashboard/designaciones`

**Funcionalidades**:
- ✅ Modo automático con algoritmo inteligente
- ✅ Modo manual de selección directa
- ✅ Asignación de 4 árbitros por partido:
  - Árbitro Principal
  - Árbitro Asistente 1
  - Árbitro Asistente 2
  - Cuarto Árbitro
- ✅ Filtros por campeonato
- ✅ Búsqueda por equipos o árbitro
- ✅ Indicadores de estado del partido

**Algoritmo Básico**:
- **Factores**: Nivel de preparación (70%) + Experiencia (30%)
- **Filtrado**: Por disponibilidad y requisitos del nivel

**Algoritmo Mejorado**:
- **Factores**:
  - Asistencia reciente (40%)
  - Nivel de preparación (30%)
  - Experiencia (20%)
  - Categoría (10%)
- **Bonificación**: Balance entre preparación física y entrenamientos

---

### 6. Sistema de Autenticación

**Ruta**: `/login`

**Funcionalidades**:
- ✅ Login con DNI y contraseña
- ✅ Registro de nuevos usuarios
- ✅ Estados de usuario: ACTIVE, PENDING, INACTIVO
- ✅ Roles: ADMIN, ARBITRO, COMISION, PRESIDENTE
- ✅ Unidades organizacionales
- ✅ Permisos específicos
- ✅ Perfil completo (cargo CODAR, área CODAR)
- ✅ Ex árbitros (opcional)

**Roles del Sistema**:
- **ADMIN**: Acceso completo
- **ARBITRO**: Acceso a sus designaciones y asistencia
- **COMISION**: Supervisión y coordinación
- **PRESIDENTE**: Aprobación de usuarios

---

### 7. Reportes

**Ruta**: `/dashboard/reportes`

**Funcionalidades**:
- ✅ Estadísticas de asistencia
- ✅ Historial de designaciones
- ✅ Reportes consolidados
- ✅ Exportación a PDF
- ✅ Exportación a JSON
- ✅ Análisis por períodos (semanal, mensual)

**Tipos de Reportes**:
- Reporte consolidado de asistencia
- Estadísticas por árbitro
- Ranking de asistencia
- Reportes por tipo de actividad
- Reportes por período

---

### 8. Dashboard Principal

**Ruta**: `/dashboard`

**Funcionalidades**:
- ✅ Métricas en tiempo real
- ✅ Panel de actividad reciente
- ✅ Accesos rápidos a funciones principales
- ✅ Alertas del sistema
- ✅ Diseño responsive con gradientes

**Métricas Principales**:
- Total de árbitros
- Campeonatos activos
- Designaciones pendientes
- Asistencia del día

---

## 🔧 Modelos de Datos

### Árbitro
```typescript
{
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
```

### Asistencia
```typescript
{
  id: string
  arbitroId: string
  fecha: string
  horaEntrada?: string
  horaSalida?: string
  tipoActividad: string
  actividad?: string
  evento?: string
  estado?: string
  presente: boolean
  observaciones?: string
  latitude?: number
  longitude?: number
  responsableId?: string
  responsable?: string
  tipoDia?: string
  tieneRetraso?: boolean
  minutosRetraso?: number
  fechaLimiteRegistro?: string
  horaProgramada?: string
  diaSemana?: string
}
```

### Campeonato
```typescript
{
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
```

### Designación
```typescript
{
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
```

### Usuario
```typescript
{
  id: Long
  dni: string
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  rol: "ADMIN" | "ARBITRO" | "COMISION" | "PRESIDENTE"
  estado: "ACTIVE" | "PENDING" | "INACTIVO"
  unidadOrganizacional?: string
  permisosEspecificos?: string
  perfilCompleto?: Boolean
  cargoCodar?: string
  areaCodar?: string
  fechaNacimiento?: LocalDate
  esExArbitro?: Boolean
  ultimoAcceso?: LocalDateTime
  fechaRegistro?: LocalDateTime
}
```

---

## 🎨 Diseño y UX

### Sistema de Diseño
- **Minimalismo Profesional**: Interfaces limpias con espaciado generoso
- **Jerarquía Visual Clara**: Tipografía y colores que guían la atención
- **Consistencia**: Patrones de diseño uniformes
- **Accesibilidad**: Contraste adecuado y navegación por teclado
- **Responsividad**: Adaptación perfecta a todos los dispositivos

### Paleta de Colores
- **Fondos**: Slate (grises neutros)
- **Acciones Principales**: Púrpura/índigo (designaciones)
- **Campeonatos**: Ámbar/naranja
- **Estados**: Verde (éxito), Azul (información), Rojo (error), Amarillo (advertencia)

---

## 🔌 API REST

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/usuarios` - Listar usuarios (admin)

#### Asistencia
- `GET /api/asistencias` - Listar todas
- `GET /api/asistencias/{id}` - Obtener por ID
- `POST /api/asistencias` - Crear asistencia
- `PUT /api/asistencias/{id}` - Actualizar
- `DELETE /api/asistencias/{id}` - Eliminar
- `GET /api/asistencias/fecha/{fecha}` - Por fecha
- `GET /api/asistencias/actividad/{actividad}` - Por actividad

#### Árbitros
- `GET /api/arbitros` - Listar todos
- `GET /api/arbitros/{id}` - Obtener por ID
- `POST /api/arbitros` - Crear árbitro
- `PUT /api/arbitros/{id}` - Actualizar
- `DELETE /api/arbitros/{id}` - Eliminar

#### Reportes
- `GET /api/reportes/consolidado` - Reporte consolidado
- `GET /api/reportes/estadisticas` - Estadísticas generales

---

## 📱 Flujo de Trabajo Típico

### 1. Configuración Inicial
1. Acceder al dashboard
2. Agregar árbitros (Gestión de Árbitros → Nuevo)
3. Crear equipos (Campeonatos → Equipos → Nuevo)
4. Crear campeonatos (Campeonatos → Nuevo)

### 2. Operación Diaria
1. Pasar Asistencia (Dashboard → Pasar Asistencia)
2. Revisar estadísticas del día
3. Crear designaciones si hay partidos

### 3. Crear una Designación
1. Seleccionar campeonato
2. Elegir equipos (local y visitante)
3. Establecer fecha y hora
4. Ingresar nombre del estadio
5. Elegir modo:
   - Automático: Generar designación automática
   - Manual: Seleccionar árbitros manualmente
6. Guardar designación

---

## 🚀 Características Destacadas

### Algoritmo de Designación Inteligente
- Considera múltiples factores para asignar los mejores árbitros
- Balance entre asistencia, preparación, experiencia y categoría
- Bonificaciones por balance en entrenamientos

### Sistema de Asistencia Completo
- Registro con geolocalización
- Control de retrasos
- Tres tipos de actividades según día de la semana
- Estadísticas en tiempo real
- Historial completo y exportable

### Gestión por Provincias
- Cobertura de las 13 provincias de Puno
- Equipos organizados geográficamente
- Información detallada por región

### Reportes Avanzados
- Exportación a PDF
- Consolidados por período
- Análisis por tipo de actividad
- Ranking de árbitros

---

## 📊 Estadísticas y Métricas

### Métricas de Asistencia
- Porcentaje de asistencia general
- Asistencia por tipo de actividad
- Ranking de árbitros por asistencia
- Retrasos y puntualidad

### Métricas de Designación
- Total de designaciones
- Distribución por campeonato
- Asignación por categoría de árbitro
- Balance de carga de trabajo

---

## 🔒 Seguridad y Permisos

### Sistema de Roles
- **ADMIN**: Acceso completo a todas las funcionalidades
- **ARBITRO**: Acceso limitado a sus datos y designaciones
- **COMISION**: Supervisión y coordinación
- **PRESIDENTE**: Aprobación de usuarios

### Estados de Usuario
- **ACTIVE**: Usuario activo con acceso completo
- **PENDING**: Pendiente de aprobación
- **INACTIVO**: Sin acceso al sistema

---

## 🎯 Público Objetivo

1. **Administradores de la Liga**: Gestiona árbitros, designaciones y reportes
2. **Árbitros**: Consultan sus designaciones y estadísticas de asistencia
3. **Comisión de Árbitros**: Supervisa y coordina el trabajo arbitral
4. **Presidentes de Unidad**: Aprueban nuevos usuarios

---

## 📈 Roadmap Futuro

### Características Planeadas
- [ ] Modo oscuro completo
- [ ] Notificaciones push
- [ ] Integración con calendarios externos
- [ ] App móvil (PWA)
- [ ] Dashboard de analytics avanzado
- [ ] Sistema de roles y permisos mejorado
- [ ] Integración con APIs externas
- [ ] Exportación a Excel
- [ ] Generación automática de calendario
- [ ] Sistema de evaluaciones de árbitros

---

## 📝 Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 3.0 | Feb 2025 | Diseño colorido, equipos por provincia |
| 2.0 | Dic 2024 | Algoritmo mejorado, asistencia |
| 1.0 | Nov 2024 | Versión inicial |

---

**© 2025 SIDAF-PUNO - Sistema de Designación Inteligente de Árbitros de Fútbol**

*Liga Departamental de Fútbol de Puno, Perú*
