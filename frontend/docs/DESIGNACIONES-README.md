# 🏟️ Sistema de Designaciones de Árbitros - Frontend

## Descripción General

Se ha desarrollado una interfaz profesional y elegante para el módulo de designaciones de árbitros en fútbol. El sistema permite:

✅ **Seleccionar campeonatos** en diferentes modalidades  
✅ **Seleccionar partidos** del campeonato elegido  
✅ **Designar árbitros manualmente** para cada posición  
✅ **Asignar árbitros automáticamente** (función backend pendiente)  
✅ **Preview de designación** antes de guardar  
✅ **Interfaz profesional y responsiva** con dark mode  

---

## 🎨 Características de Diseño

### Diseño Profesional
- **Color scheme**: Azul oscuro (slate) con acentos en amarillo/dorado
- **Tipografía**: Sans-serif profesional con jerarquía clara
- **Animaciones**: Transiciones suaves y fluidas
- **Responsive**: Totalmente adaptable a dispositivos móviles

### Componentes Principales

#### 1. **Página Principal** (`page.tsx`)
- Flujo de 4 pasos (campeonato → partido → árbitros → preview)
- Indicador visual de progreso
- Transiciones entre pasos con validaciones
- Loading states profesionales

#### 2. **Selector de Campeonato** (`CampeonatoSelector.tsx`)
- Grid responsivo de campeonatos
- Búsqueda por nombre y categoría
- Filtros por modalidad
- Badges de estado (Activo, Pendiente, Finalizado)
- Información visual clara (fecha, equipos, organizador)

#### 3. **Selector de Partido** (`PartidoSelector.tsx`)
- Lista elegante de partidos filtrados
- Información de equipos (Local vs Visitante)
- Detalles: fecha, hora, estadio
- Ordenamiento flexible
- Badges de modalidad

#### 4. **Designador de Árbitros** (`ArbitroDesignador.tsx`)
- Grid de 4 posiciones (Principal, Asistente 1, Asistente 2, Cuarto)
- Modal de selección de árbitros
- búsqueda/filtrado de árbitros
- Información de categoría y provincia
- Botón de asignación automática
- Validaciones de campos requeridos

#### 5. **Preview de Designación** (`DesignacionPreview.tsx`)
- Resumen completo en dos columnas
- Información del campeonato
- Detalles del partido
- Equipo arbitral completo
- Confirmación visual de datos
- Botón de guardar con loading state

---

## 📁 Estructura de Archivos

```
frontend/
├── app/(dashboard)/dashboard/designaciones/
│   ├── nueva/
│   │   └── page.tsx                    # 🎯 Página principal
│   ├── page.tsx                        # Listado de designaciones
│   └── [id]/                           # Edición de designación
│
├── components/designaciones/
│   ├── CampeonatoSelector.tsx          # Selección de campeonatos
│   ├── PartidoSelector.tsx             # Selección de partidos
│   ├── ArbitroDesignador.tsx           # Asignación de árbitros
│   ├── DesignacionPreview.tsx          # Preview before save
│   ├── ArbitroCard.tsx                 # ✅ Existente
│   ├── ArbitroSelector.tsx             # ✅ Existente
│   └── DesignacionStatusBadge.tsx      # ✅ Existente
│
├── docs/
│   ├── DESIGNACIONES_API.md            # Documentación de endpoints
│   └── DESIGNACIONES-README.md         # Este archivo
│
└── styles/
    └── designaciones.css               # ✅ Estilos profesionales
```

---

## 🚀 Cómo Funciona

### Flujo de Uso

```
1. Usuario accede a /dashboard/designaciones/nueva
   ↓
2. Selecciona un CAMPEONATO
   ↓
3. Selecciona un PARTIDO del campeonato
   ↓
4. Asigna ÁRBITROS (manual o automático)
   - Árbitro Principal (requerido)
   - Árbiter Asistente 1 (opcional)
   - Árbitro Asistente 2 (opcional)
   - Cuarto Árbitro (opcional)
   ↓
5. Revisa PREVIEW de la designación
   ↓
6. GUARDA en la base de datos
   ↓
7. Redirecciona a /dashboard/designaciones
```

### Estados Visuales

- **Step Activo**: Amarillo (#FFD700)
- **Step Completado**: Verde (#10B981)
- **Step Pendiente**: Gris (#475569)

---

## 🎯 Características Implementadas

### ✅ Ya Completado

| Feature | Estado | Componente |
|---------|--------|-----------|
| Selección de Campeonatos | ✅ | CampeonatoSelector.tsx |
| Búsqueda de Campeonatos | ✅ | CampeonatoSelector.tsx |
| Filtro por Categoría | ✅ | CampeonatoSelector.tsx |
| Selección de Partidos | ✅ | PartidoSelector.tsx |
| Búsqueda de Partidos | ✅ | PartidoSelector.tsx |
| Modal de Árbitros | ✅ | ArbitroDesignador.tsx |
| Designación Manual | ✅ | ArbitroDesignador.tsx |
| Preview de Designación | ✅ | DesignacionPreview.tsx |
| Validaciones Frontend | ✅ | Múltiples componentes |
| Diseño Responsivo | ✅ | Todos los componentes |
| Dark Mode Profesional | ✅ | Tailwind + CSS |
| Animaciones Suaves | ✅ | CSS + Tailwind |
| Loading States | ✅ | page.tsx |

### 📝 Por Implementar (Backend)

| Feature | Endpoint | Prioridad |
|---------|----------|-----------|
| Obtener Partidos | `GET /api/campeonato/{id}/partidos` | 🔴 Alta |
| Asignación Automática | `POST /api/designaciones/auto-asignar` | 🟠 Media |
| Validación de Disponibilidad | `GET /api/arbitros/disponibles` | 🟠 Media |
| Historial de Designaciones | `GET /api/arbitros/{id}/historial` | 🟡 Baja |

---

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 18+
- npm o yarn
- Next.js 14+
- Tailwind CSS

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000/dashboard/designaciones/nueva
```

### Build para Producción

```bash
npm run build
npm start
```

---

## 🎨 Paleta de Colores

### Primarios
- **Amarillo/Dorado**: `#FFD700` - Acciones principales
- **Azul Oscuro**: `#0F172A` - Fondo principal
- **Gris Oscuro**: `#1E293B` - Cards y elementos secundarios

### Por Categoría de Árbitro
- **FIFA**: `#FFD700` (Amarillo)
- **Nacional**: `#3B82F6` (Azul)
- **Regional**: `#10B981` (Verde)
- **Provincial**: `#8B5CF6` (Púrpura)
- **Local**: `#6B7280` (Gris)

### Estados
- **Activo**: `#10B981` (Verde)
- **Pendiente**: `#F59E0B` (Naranja)
- **Finalizado**: `#6B7280` (Gris)

---

## 📱 Responsive Design

El sistema está optimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

---

## 🔍 Validaciones Implementadas

### Frontend
- ✅ Campo requerido: Árbitro Principal
- ✅ No seleccionar el mismo árbitro en múltiples posiciones
- ✅ Validación de campos antes de continuar
- ✅ Mensajes de error claros

### Backend (Por implementar)
- 📝 Validar disponibilidad del árbitro
- 📝 Verificar que no tenga otro partido a la misma hora
- 📝 Validar categoría mínima según campeonato
- 📝 Registrar auditoría

---

## 🌟 Mejoras Futuras

### Corto Plazo
1. Integrar endpoint de partidos desde backend
2. Implementar asignación automática
3. Agregar confirmación por email a árbitros
4. Historial de modificaciones

### Mediano Plazo
1. Export a PDF de designaciones
2. Importación masiva desde Excel
3. Calendar view de designaciones
4. Notificaciones en tiempo real

### Largo Plazo
1. Mobile app nativa
2. Integración de SAT del árbitro
3. Analytics de designaciones
4. Sistema de calificación pos-partido

---

## 📖 Documentación Relacionada

- [API Endpoints Documentation](./DESIGNACIONES_API.md)
- [Backend Implementation Guide](../../backend/docs/designaciones.md)
- [Design System](../docs/DESIGN_SYSTEM.md)
- [Component Library](../docs/COMPONENTS.md)

---

## 👨‍💻 Autor

**Especialista en Diseño Frontend**
- Interfaz profesional y elegante ✨
- Componentes reutilizables
- Código limpio y documentado
- Mejores prácticas de UX/UI

---

## 📝 Notas

### Version
- **Versión**: 1.0.0
- **Fecha**: 08/04/2026
- **Status**: Producción Lista (pendiente backend)

### Compatibilidad
- ✅ Chrome/Edge 88+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## 📞 Soporte

Para reportar bugs o sugerir mejoras:
1. Crear issue en GitHub
2. Documentar pasos para reproducir
3. Incluir screenshots/videos si es posible
4. Especificar navegador y versión

---

**Última actualización**: 08/04/2026
**Mantenedor**: Equipo SIDAF
