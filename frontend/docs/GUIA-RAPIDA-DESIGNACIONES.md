# 🎯 Guía Rápida - Designaciones Nueva

## 🚀 Acceso Rápido

**URL**: `http://localhost:3002/dashboard/designaciones/nueva`

---

## 📋 Flujo Visual de la Interfaz

### Paso 1️⃣ - Selecciona Campeonato
```
┌─────────────────────────────────────────┐
│  🏆 Nueva Designación                   │
│  Asigna árbitros de forma manual o      │
│  automática                             │
│                                         │
│  ① ──→ ② ──→ ③ ──→ ④                   │
│                                         │
│  Buscar campeonato  [___________]       │
│  Filtrar por categoría [Professional]  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 🏆 Copa Perú 2026                │  │
│  │ Professional | Activo            │  │
│  │ 16 equipos | 01/04/2026          │  │
│  │ Org: FPF                         │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Paso 2️⃣ - Selecciona Partido
```
┌─────────────────────────────────────────┐
│  🏆 Selecciona un Partido               │
│  Copa Perú 2026                         │
│                                         │
│  Buscar     [___________]               │
│  Ordenar    [Fecha ▼]                   │
│                                         │
│  UDT Femenino      VS    Municipal      │
│  📅 10/04/2026 | 🕐 14:30 | 🏟️ Estadio  │
│  [Femenino]                             │
│                                         │
│  [← Volver]            [Continuar →]    │
└─────────────────────────────────────────┘
```

### Paso 3️⃣ - Designa Árbitros
```
┌─────────────────────────────────────────┐
│  👥 Designa los Árbitros                │
│  Asigna árbitros manualmente            │
│                                         │
│  [🔀 Asignar Automáticamente]           │
│                                         │
│  ┌─────────────────┬─────────────────┐ │
│  │ 🛡️ Árbitro      │ 👥 Asistente 1 │ │
│  │ Principal       │ Línea izquierda│ │
│  │ (Requerido)     │ (Opcional)     │ │
│  │                 │                 │ │
│  │ Juan Pérez      │ | Seleccionar  │ │
│  │ FIFA | Puno     │   |             │ │
│  └─────────────────┴─────────────────┘ │
│                                         │
│  [← Volver]            [Continuar →]    │
└─────────────────────────────────────────┘
```

**Modal de Selección de Árbitro**:
```
┌──────────────────────────────────────┐
│ Árbitro Principal                    │
│ Árbitro central del partido          │
│                                      │
│ Buscar [_______________]             │
│                                      │
│ ✓ Juan Pérez                         │
│   · DNI: 12345678                    │
│   · Categoría: FIFA                  │
│   · Ubicación: Puno                  │
│                                      │
│ ○ María Rodríguez                    │
│   · DNI: 87654321                    │
│   · Categoría: Nacional              │
│   · Ubicación: Juliaca               │
└──────────────────────────────────────┘
```

### Paso 4️⃣ - Preview y Guardar
```
┌─────────────────────────────────────────┐
│  ✅ Resumen de la Designación           │
│  Revisa los datos antes de guardar      │
│                                         │
│  ┌──────────────┬──────────────────┐   │
│  │ 🏆 Campeonato│ 🛡️ Equipo Arbitral│   │
│  │ Copa Perú    │                  │   │
│  │ 2026         │ 🛡️ Principal      │   │
│  │              │ Juan Pérez       │   │
│  │ 📅 Partido   │ FIFA | Puno      │   │
│  │ UDT vs Muni  │                  │   │
│  │ 14:30        │ 👥 Asistente 1    │   │
│  │              │ María Rodríguez  │   │
│  └──────────────┴──────────────────┘   │
│                                         │
│  ℹ️  Una vez guardada, podrás editar    │
│      desde el listado principal         │
│                                         │
│  [Cancelar]      [💾 Guardar]          │
└─────────────────────────────────────────┘
```

---

## 🎨 Elementos de Interfaz

### Componentes Interactivos

| Elemento | Style | Efecto |
|----------|-------|--------|
| Card Campeonato | Azul/Gris gradiente | Hover: amarillo |
| Botón Principal | Amarillo | Glow effect |
| Botón Auto-asignar | Púrpura/Rosa | Glow effect |
| Input | Gris oscuro | Focus: amarillo |
| Badge Categoría | Color según tipo | Etiqueta |
| Modal Árbitro | Dark overlay | Centered |

### Colores

```
Fondo Principal:     #0F172A (Azul muy oscuro)
Cards:              #1E293B (Gris oscuro)
Accent Primario:    #FFD700 (Amarillo/Dorado)
Accent Éxito:       #10B981 (Verde)
Accent Error:       #EF4444 (Rojo)
Texto Principal:    #FFFFFF (Blanco)
Texto Secundario:   #94A3B8 (Gris claro)
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Escape` | Cerrar Modal |
| `Enter` | Confirmar selección |
| `Tab` | Navegar entre campos |
| `Ctrl+S` | Guardar (cuando esté habilitado) |

---

## 📝 Casos de Uso

### Caso 1: Designar Árbitro FIFA a Partido de Mayores
```
1. Seleccionar: Copa Perú 2026
2. Seleccionar: UDT vs Binacional (14:30)
3. Asignar:
   - Principal: Árbitro categoría FIFA
   - Asistentes: Árbitros Nacionales
   - Cuarto: Árbitro Regional (available)
4. Preview y guardar
```

### Caso 2: Uso de Asignación Automática
```
1. Seleccionar: Copa Perú 2026
2. Seleccionar: Cualquier partido
3. Hacer clic: [🔀 Asignar Automáticamente]
4. Sistema sugerirá árbitros según:
   - Categoría requerida
   - Disponibilidad
   - Proximidad
   - Historial
5. Preview y guardar
```

---

## 🔧 Troubleshooting

### ❌ No aparecen campeonatos
- Verificar Backend está corriendo en `http://localhost:8083`
- Revisar console del navegador para errores API
- Confirmar que `/api/campeonato` devuelve datos

### ❌ No se puede continuar a paso 2
- Verificar que un campeonato esté seleccionado
- Revisar formato de respuesta API

### ❌ Lista de árbitros vacía
- Confirmar que `/api/arbitros` devuelve datos
- Revisar disponibilidad de árbitros en BD

### ❌ No se guarda designación
- Verificar endpoint POST `/api/designaciones` funciona
- Revisar errores en consola del navegador
- Confirmar datos están completos

---

## 📊 Estadísticas Esperadas

**Performance Goal**:
- Carga inicial: < 2s
- Búsqueda/Filtro: < 500ms
- Cambio de paso: < 300ms
- Guardar: < 1.5s

**Responsividad**:
- Mobile: 100% funcional
- Tablet: 100% funcional
- Desktop: 100% funcional

---

## 🎓 Guía para Desarrolladores

### Estructura de Componentes

```typescript
// page.tsx (Estado Principal)
- currentStep: "campeonato" | "partido" | "arbitros" | "preview"
- campeonatoSeleccionado: Campeonato
- partidoSeleccionado: Partido
- arbitrosPrincipal: Arbitro
- arbitrosAsistente1/2: Arbitro
- arbitrosCuarto: Arbitro

// Flujo:
campeonato → partido → arbitros → preview → save
```

### Validaciones

```typescript
// Antes de continuar:
- Requeridos: campeonato, partido, arbitro principal
- Opcionales: asistentes, cuarto
- No duplicar árbitro en múltiples posiciones
- No sobrecargar árbitro (validar en backend)
```

---

## 🚀 Próximas Características

- [ ] Asignación automática inteligente
- [ ] Notificación a árbitros
- [ ] Historial de designaciones
- [ ] Export a PDF
- [ ] Importación masiva Excel
- [ ] Calendar view
- [ ] Mobile app
- [ ] Analytics

---

## 📞 Contacto & Soporte

**Problemas o sugerencias**:
- Crear issue en GitHub
- Email: soporte@sidaf.puno.pe
- Chat: Slack #designaciones

---

**Última actualización**: 08/04/2026
**Versión**: 1.0.0
**Status**: ✅ Producción Lista
