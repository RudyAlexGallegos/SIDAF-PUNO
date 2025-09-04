# Sistema de Designación de Árbitros de Fútbol

Un sistema inteligente para la gestión y designación de árbitros de fútbol que considera la categoría, nivel de preparación, experiencia y asistencia a entrenamientos.

## Características Principales

### 🏆 Gestión de Árbitros
- Registro completo de árbitros con categorías (FIFA, Nacional, Regional, Provincial)
- Seguimiento del nivel de preparación y experiencia
- Control de disponibilidad y especialidades

### 📅 Control de Asistencia
- Registro de asistencia para días específicos:
  - **Lunes, Martes, Jueves**: Preparación Física
  - **Viernes**: Entrenamientos Técnicos
- Estadísticas detalladas por árbitro y período
- Calendario visual de asistencia

### 🎯 Designación Inteligente
- **Algoritmo automático** que considera:
  - Categoría del árbitro
  - Nivel de preparación
  - Experiencia
  - **Asistencia reciente** (factor clave)
  - Dificultad del campeonato
- **Designación manual** para casos específicos
- Evaluación de calidad de designaciones

### 📊 Dashboard y Estadísticas
- Vista general del sistema
- Métricas de asistencia en tiempo real
- Análisis por categorías de árbitros
- Tendencias y recomendaciones

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- Visual Studio Code (recomendado)

### Instalación

1. **Clonar o descargar el proyecto**
\`\`\`bash
git clone [url-del-repositorio]
cd sistema-arbitros-futbol
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Ejecutar en modo desarrollo**
\`\`\`bash
npm run dev
\`\`\`

4. **Abrir en el navegador**
\`\`\`
http://localhost:3000
\`\`\`

### Configuración para Visual Studio Code

El proyecto incluye configuración optimizada para VS Code:

- **`.vscode/settings.json`**: Configuración del editor
- **`.vscode/launch.json`**: Configuración de debugging
- **Extensiones recomendadas**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer

### Scripts Disponibles

\`\`\`bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Servidor de producción
npm run lint     # Verificar código
npm run type-check # Verificar tipos TypeScript
\`\`\`

## Uso del Sistema

### 1. Gestión de Árbitros
- Navegar a **"Ver Todos los Árbitros"**
- Agregar nuevos árbitros con su información completa
- Actualizar nivel de preparación y disponibilidad

### 2. Control de Asistencia
- Ir a la sección **"Asistencia"**
- Registrar asistencia diaria para los días activos
- Revisar estadísticas y tendencias

### 3. Designación de Partidos
- Crear **"Nueva Designación"**
- Elegir entre modo automático o manual
- El sistema recomendará los mejores árbitros según:
  - Asistencia reciente (40% del peso)
  - Nivel de preparación (30%)
  - Experiencia y categoría (30%)

### 4. Seguimiento y Análisis
- Dashboard principal para vista general
- Estadísticas detalladas de asistencia
- Evaluación de eficiencia del sistema

## Algoritmo de Designación

### Factores Considerados (por orden de importancia):

1. **Asistencia (40%)**
   - Asistencia a preparación física (L, M, J)
   - Asistencia a entrenamientos (V)
   - Consistencia en las últimas 4 semanas

2. **Nivel de Preparación (30%)**
   - Porcentaje de preparación actual
   - Evaluaciones técnicas

3. **Experiencia y Categoría (30%)**
   - Años de experiencia
   - Categoría del árbitro (FIFA > Nacional > Regional > Provincial)

### Requisitos por Nivel de Dificultad:

| Nivel | Asistencia Mín. | Preparación Mín. | Categorías Permitidas |
|-------|----------------|------------------|----------------------|
| Alto  | 75%            | 85%              | FIFA, Nacional       |
| Medio | 60%            | 70%              | FIFA, Nacional, Regional |
| Bajo  | 40%            | 50%              | Todas                |

## Persistencia de Datos

- **Almacenamiento local**: Los datos se guardan automáticamente en el navegador
- **Duración**: Los datos persisten indefinidamente hasta ser eliminados manualmente
- **Backup**: Se recomienda exportar datos importantes regularmente

## Estructura del Proyecto

\`\`\`
sistema-arbitros-futbol/
├── app/                    # Páginas de la aplicación
│   ├── page.tsx           # Dashboard principal
│   ├── asistencia/        # Módulo de asistencia
│   ├── arbitros/          # Gestión de árbitros
│   └── campeonatos/       # Gestión de campeonatos
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── [componentes-especificos]
├── lib/                  # Lógica de negocio
│   ├── data-store.ts     # Gestión de estado y persistencia
│   └── algoritmo-designacion-mejorado.ts
└── .vscode/              # Configuración VS Code
\`\`\`

## Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Zustand** - Gestión de estado
- **Recharts** - Gráficos y estadísticas
- **date-fns** - Manejo de fechas

## Contribución

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## Soporte

Para soporte técnico o consultas:
- Crear issue en el repositorio
- Documentación en `/docs`
- Ejemplos en `/examples`

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025
