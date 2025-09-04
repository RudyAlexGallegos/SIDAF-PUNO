"use client"

import type { Arbitro, Asistencia, Designacion, Campeonato } from "./data-store"

// Función para generar PDF de asistencias
export function generateAsistenciaPDF(
  asistencias: Asistencia[],
  arbitros: Arbitro[],
  fechaInicio: Date,
  fechaFin: Date,
): void {
  // Crear contenido HTML para el PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Asistencia</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #2563eb;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                margin: 5px 0;
                font-size: 16px;
                color: #666;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
                text-align: center;
            }
            .summary-card h3 {
                margin: 0 0 10px 0;
                color: #2563eb;
                font-size: 24px;
            }
            .summary-card p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            .table-container {
                margin-bottom: 30px;
            }
            .table-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #2563eb;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 12px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #2563eb;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f8fafc;
            }
            .badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }
            .badge-fifa { background: #dcfce7; color: #166534; }
            .badge-nacional { background: #dbeafe; color: #1d4ed8; }
            .badge-regional { background: #f3e8ff; color: #7c3aed; }
            .badge-provincial { background: #fed7aa; color: #ea580c; }
            .badge-presente { background: #dcfce7; color: #166534; }
            .badge-ausente { background: #fee2e2; color: #dc2626; }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📋 Reporte de Asistencia</h1>
            <p><strong>Período:</strong> ${fechaInicio.toLocaleDateString("es-ES")} - ${fechaFin.toLocaleDateString("es-ES")}</p>
            <p><strong>Generado:</strong> ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}</p>
        </div>

        ${generateAsistenciaSummary(asistencias, arbitros)}
        ${generateAsistenciaTable(asistencias, arbitros)}
        ${generateAsistenciaByArbitro(asistencias, arbitros)}

        <div class="footer">
            <p>Sistema de Gestión de Árbitros - Reporte generado automáticamente</p>
            <p>Total de registros: ${asistencias.length} | Árbitros: ${arbitros.length}</p>
        </div>
    </body>
    </html>
  `

  // Crear y descargar el PDF
  downloadPDF(
    htmlContent,
    `reporte-asistencia-${fechaInicio.toISOString().split("T")[0]}-${fechaFin.toISOString().split("T")[0]}.pdf`,
  )
}

// Función para generar PDF de designaciones
export function generateDesignacionesPDF(
  designaciones: Designacion[],
  arbitros: Arbitro[],
  campeonatos: Campeonato[],
  fechaInicio: Date,
  fechaFin: Date,
): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Designaciones</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #7c3aed;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #7c3aed;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                margin: 5px 0;
                font-size: 16px;
                color: #666;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #7c3aed;
                text-align: center;
            }
            .summary-card h3 {
                margin: 0 0 10px 0;
                color: #7c3aed;
                font-size: 24px;
            }
            .summary-card p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            .table-container {
                margin-bottom: 30px;
            }
            .table-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #7c3aed;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 11px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 6px;
                text-align: left;
            }
            th {
                background-color: #7c3aed;
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f8fafc;
            }
            .badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
            }
            .badge-alto { background: #fee2e2; color: #dc2626; }
            .badge-medio { background: #fef3c7; color: #d97706; }
            .badge-bajo { background: #dcfce7; color: #166534; }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>⚽ Reporte de Designaciones</h1>
            <p><strong>Período:</strong> ${fechaInicio.toLocaleDateString("es-ES")} - ${fechaFin.toLocaleDateString("es-ES")}</p>
            <p><strong>Generado:</strong> ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}</p>
        </div>

        ${generateDesignacionesSummary(designaciones, campeonatos)}
        ${generateDesignacionesTable(designaciones, arbitros, campeonatos)}

        <div class="footer">
            <p>Sistema de Gestión de Árbitros - Reporte generado automáticamente</p>
            <p>Total de designaciones: ${designaciones.length} | Período: ${Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))} días</p>
        </div>
    </body>
    </html>
  `

  downloadPDF(
    htmlContent,
    `reporte-designaciones-${fechaInicio.toISOString().split("T")[0]}-${fechaFin.toISOString().split("T")[0]}.pdf`,
  )
}

// Funciones auxiliares para generar contenido HTML

function generateAsistenciaSummary(asistencias: Asistencia[], arbitros: Arbitro[]): string {
  const totalAsistencias = asistencias.length
  const preparacionFisica = asistencias.filter((a) => a.tipoActividad === "preparacion_fisica").length
  const entrenamientos = asistencias.filter((a) => a.tipoActividad === "entrenamiento").length
  const arbitrosUnicos = new Set(asistencias.map((a) => a.arbitroId)).size

  return `
    <div class="summary">
        <div class="summary-card">
            <h3>${totalAsistencias}</h3>
            <p>Total Asistencias</p>
        </div>
        <div class="summary-card">
            <h3>${preparacionFisica}</h3>
            <p>Preparación Física</p>
        </div>
        <div class="summary-card">
            <h3>${entrenamientos}</h3>
            <p>Entrenamientos</p>
        </div>
        <div class="summary-card">
            <h3>${arbitrosUnicos}</h3>
            <p>Árbitros Participantes</p>
        </div>
    </div>
  `
}

function generateAsistenciaTable(asistencias: Asistencia[], arbitros: Arbitro[]): string {
  const rows = asistencias
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((asistencia) => {
      const arbitro = arbitros.find((a) => a.id === asistencia.arbitroId)
      const fecha = new Date(asistencia.fecha)

      return `
        <tr>
            <td>${fecha.toLocaleDateString("es-ES")}</td>
            <td>${fecha.toLocaleDateString("es-ES", { weekday: "long" })}</td>
            <td>${arbitro?.nombre || "N/A"}</td>
            <td><span class="badge badge-${arbitro?.categoria.toLowerCase()}">${arbitro?.categoria || "N/A"}</span></td>
            <td><span class="badge badge-${asistencia.presente ? "presente" : "ausente"}">${asistencia.presente ? "Presente" : "Ausente"}</span></td>
            <td>${asistencia.tipoActividad === "preparacion_fisica" ? "Preparación Física" : "Entrenamiento"}</td>
            <td>${asistencia.observaciones || "-"}</td>
        </tr>
      `
    })
    .join("")

  return `
    <div class="table-container">
        <div class="table-title">📅 Registro Detallado de Asistencias</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Árbitro</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Tipo Actividad</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
  `
}

function generateAsistenciaByArbitro(asistencias: Asistencia[], arbitros: Arbitro[]): string {
  const asistenciaPorArbitro = arbitros
    .map((arbitro) => {
      const asistenciasArbitro = asistencias.filter((a) => a.arbitroId === arbitro.id)
      const preparacionFisica = asistenciasArbitro.filter((a) => a.tipoActividad === "preparacion_fisica").length
      const entrenamientos = asistenciasArbitro.filter((a) => a.tipoActividad === "entrenamiento").length
      const total = asistenciasArbitro.length

      return {
        arbitro,
        preparacionFisica,
        entrenamientos,
        total,
        porcentaje: arbitros.length > 0 ? Math.round((total / (asistencias.length / arbitros.length)) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  const rows = asistenciaPorArbitro
    .map(
      (stats) => `
    <tr>
        <td>${stats.arbitro.nombre}</td>
        <td><span class="badge badge-${stats.arbitro.categoria.toLowerCase()}">${stats.arbitro.categoria}</span></td>
        <td style="text-align: center;">${stats.total}</td>
        <td style="text-align: center;">${stats.preparacionFisica}</td>
        <td style="text-align: center;">${stats.entrenamientos}</td>
        <td style="text-align: center;">${stats.porcentaje}%</td>
    </tr>
  `,
    )
    .join("")

  return `
    <div class="table-container">
        <div class="table-title">👥 Resumen por Árbitro</div>
        <table>
            <thead>
                <tr>
                    <th>Árbitro</th>
                    <th>Categoría</th>
                    <th>Total</th>
                    <th>Prep. Física</th>
                    <th>Entrenamientos</th>
                    <th>% Participación</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
  `
}

function generateDesignacionesSummary(designaciones: Designacion[], campeonatos: Campeonato[]): string {
  const totalDesignaciones = designaciones.length
  const campeonatosActivos = new Set(designaciones.map((d) => d.campeonatoId)).size
  const arbitrosDesignados = new Set([
    ...designaciones.map((d) => d.arbitroPrincipal),
    ...designaciones.map((d) => d.arbitroAsistente1),
    ...designaciones.map((d) => d.arbitroAsistente2),
    ...designaciones.map((d) => d.cuartoArbitro),
  ]).size

  const promedioCalificacion =
    designaciones.filter((d) => d.calificacion).reduce((sum, d) => sum + (d.calificacion || 0), 0) /
      designaciones.filter((d) => d.calificacion).length || 0

  return `
    <div class="summary">
        <div class="summary-card">
            <h3>${totalDesignaciones}</h3>
            <p>Total Designaciones</p>
        </div>
        <div class="summary-card">
            <h3>${campeonatosActivos}</h3>
            <p>Campeonatos</p>
        </div>
        <div class="summary-card">
            <h3>${arbitrosDesignados}</h3>
            <p>Árbitros Designados</p>
        </div>
        <div class="summary-card">
            <h3>${promedioCalificacion.toFixed(1)}</h3>
            <p>Calificación Promedio</p>
        </div>
    </div>
  `
}

function generateDesignacionesTable(
  designaciones: Designacion[],
  arbitros: Arbitro[],
  campeonatos: Campeonato[],
): string {
  const rows = designaciones
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((designacion) => {
      const campeonato = campeonatos.find((c) => c.id === designacion.campeonatoId)
      const principal = arbitros.find((a) => a.id === designacion.arbitroPrincipal)
      const asistente1 = arbitros.find((a) => a.id === designacion.arbitroAsistente1)
      const asistente2 = arbitros.find((a) => a.id === designacion.arbitroAsistente2)
      const cuarto = arbitros.find((a) => a.id === designacion.cuartoArbitro)
      const fecha = new Date(designacion.fecha)

      return `
        <tr>
            <td>${fecha.toLocaleDateString("es-ES")}</td>
            <td>${designacion.equipoLocal} vs ${designacion.equipoVisitante}</td>
            <td>${designacion.estadio}</td>
            <td>${campeonato?.nombre || "N/A"}</td>
            <td><span class="badge badge-${campeonato?.nivelDificultad.toLowerCase()}">${campeonato?.nivelDificultad || "N/A"}</span></td>
            <td>${principal?.nombre || "N/A"}</td>
            <td>${asistente1?.nombre || "N/A"}</td>
            <td>${asistente2?.nombre || "N/A"}</td>
            <td>${cuarto?.nombre || "N/A"}</td>
            <td style="text-align: center;">${designacion.calificacion || "-"}</td>
        </tr>
      `
    })
    .join("")

  return `
    <div class="table-container">
        <div class="table-title">⚽ Registro Detallado de Designaciones</div>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Partido</th>
                    <th>Estadio</th>
                    <th>Campeonato</th>
                    <th>Dificultad</th>
                    <th>Árbitro Principal</th>
                    <th>Asistente 1</th>
                    <th>Asistente 2</th>
                    <th>Cuarto Árbitro</th>
                    <th>Calificación</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
  `
}

// Función para descargar PDF usando la API del navegador
function downloadPDF(htmlContent: string, filename: string): void {
  // Crear una nueva ventana para imprimir
  const printWindow = window.open("", "_blank")

  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Opcional: cerrar la ventana después de imprimir
        // printWindow.close()
      }, 500)
    }
  } else {
    // Fallback: crear un blob y descargar como HTML
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.replace(".pdf", ".html")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Función para exportar datos como JSON
export function exportDataAsJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
