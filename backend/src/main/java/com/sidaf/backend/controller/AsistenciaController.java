package com.sidaf.backend.controller;

import com.sidaf.backend.model.Asistencia;
import com.sidaf.backend.repository.AsistenciaRepository;
import com.sidaf.backend.service.AsistenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/asistencias")
@CrossOrigin(origins = {"http://localhost:3000", "https://sidaf-puno-neon.vercel.app", "https://sidaf-puno.vercel.app"})
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private AsistenciaService asistenciaService;

    @GetMapping
    public List<Asistencia> listar() {
        return asistenciaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asistencia> obtener(@PathVariable Long id) {
        Optional<Asistencia> o = asistenciaRepository.findById(id);
        return o.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asistencia> crear(@RequestBody Asistencia asistencia) {
        if (asistencia.getCreatedAt() == null) {
            asistencia.setCreatedAt(LocalDateTime.now());
        }
        Asistencia guardado = asistenciaRepository.save(asistencia);
        return ResponseEntity.created(URI.create("/api/asistencias/" + guardado.getId())).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asistencia> actualizar(@PathVariable Long id, @RequestBody Asistencia datos) {
        Optional<Asistencia> o = asistenciaRepository.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();

        Asistencia e = o.get();
        e.setFecha(datos.getFecha());
        e.setHoraEntrada(datos.getHoraEntrada());
        e.setHoraSalida(datos.getHoraSalida());
        e.setActividad(datos.getActividad());
        e.setEvento(datos.getEvento());
        e.setEstado(datos.getEstado());
        e.setObservaciones(datos.getObservaciones());
        e.setLatitude(datos.getLatitude());
        e.setLongitude(datos.getLongitude());
        e.setResponsableId(datos.getResponsableId());
        e.setResponsable(datos.getResponsable());

        // Nuevos campos
        e.setTipoDia(datos.getTipoDia());
        e.setTieneRetraso(datos.getTieneRetraso());
        e.setMinutosRetraso(datos.getMinutosRetraso());
        e.setFechaLimiteRegistro(datos.getFechaLimiteRegistro());
        e.setHoraProgramada(datos.getHoraProgramada());
        e.setDiaSemana(datos.getDiaSemana());

        Asistencia actualizado = asistenciaRepository.save(e);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!asistenciaRepository.existsById(id)) return ResponseEntity.notFound().build();
        asistenciaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Métodos adicionales útiles
    @GetMapping("/fecha/{fecha}")
    public List<Asistencia> obtenerPorFecha(@PathVariable LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha);
    }

    @GetMapping("/actividad/{actividad}")
    public List<Asistencia> obtenerPorActividad(@PathVariable String actividad) {
        return asistenciaRepository.findByActividad(actividad);
    }

    @GetMapping("/estado/{estado}")
    public List<Asistencia> obtenerPorEstado(@PathVariable String estado) {
        return asistenciaRepository.findByEstado(estado);
    }

    // ========== ENDPOINTS DE REPORTES ==========

    /**
     * Reporte semanal de asistencia
     * GET /api/asistencias/reporte/semanal?fechaInicio=2024-01-01&fechaFin=2024-01-07
     */
    @GetMapping("/reporte/semanal")
    public Map<String, Object> reporteSemanal(
            @RequestParam String fechaInicio, 
            @RequestParam String fechaFin) {
        
        LocalDate inicio = LocalDate.parse(fechaInicio);
        LocalDate fin = LocalDate.parse(fechaFin);
        
        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(inicio, fin);
        
        return generarReporte(asistencias, "Semanal", inicio, fin);
    }

    /**
     * Reporte mensual de asistencia
     * GET /api/asistencias/reporte/mensual?year=2024&month=1
     */
    @GetMapping("/reporte/mensual")
    public Map<String, Object> reporteMensual(
            @RequestParam int year, 
            @RequestParam int month) {
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate inicio = yearMonth.atDay(1);
        LocalDate fin = yearMonth.atEndOfMonth();
        
        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(inicio, fin);
        
        return generarReporte(asistencias, "Mensual", inicio, fin);
    }

    /**
     * Reporte anual de asistencia
     * GET /api/asistencias/reporte/anual?year=2024
     */
    @GetMapping("/reporte/anual")
    public Map<String, Object> reporteAnual(@RequestParam int year) {
        
        LocalDate inicio = LocalDate.of(year, 1, 1);
        LocalDate fin = LocalDate.of(year, 12, 31);
        
        List<Asistencia> asistencias = asistenciaRepository.findByFechaBetween(inicio, fin);
        
        return generarReporte(asistencias, "Anual", inicio, fin);
    }

    /**
     * Genera el reporte en formato estructurado
     */
    private Map<String, Object> generarReporte(List<Asistencia> asistencias, String tipo, LocalDate inicio, LocalDate fin) {
        // Agrupar por actividad
        Map<String, List<Asistencia>> porActividad = asistencias.stream()
                .collect(Collectors.groupingBy(a -> a.getActividad() != null ? a.getActividad() : "sin especificar"));

        // Calcular estadísticas por estado
        long total = asistencias.size();
        long presentes = asistencias.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        long ausentes = asistencias.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count();
        long tardanzas = asistencias.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count();
        long justificaciones = asistencias.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count();

        // Calcular porcentaje de asistencia
        double porcentajeAsistencia = total > 0 ? (presentes * 100.0 / total) : 0;

        // Construir respuesta
        Map<String, Object> reporte = new LinkedHashMap<>();
        reporte.put("tipo", tipo);
        reporte.put("periodo", Map.of(
            "inicio", inicio.format(DateTimeFormatter.ISO_LOCAL_DATE),
            "fin", fin.format(DateTimeFormatter.ISO_LOCAL_DATE)
        ));
        reporte.put("resumen", Map.of(
            "totalRegistros", total,
            "presentes", presentes,
            "ausentes", ausentes,
            "tardanzas", tardanzas,
            "justificaciones", justificaciones,
            "porcentajeAsistencia", Math.round(porcentajeAsistencia * 100.0) / 100.0
        ));

        // Detalle por actividad
        List<Map<String, Object>> detalleActividades = new ArrayList<>();
        for (Map.Entry<String, List<Asistencia>> entry : porActividad.entrySet()) {
            List<Asistencia> acts = entry.getValue();
            long p = acts.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
            long a = acts.stream().filter(x -> "ausente".equalsIgnoreCase(x.getEstado())).count();
            long t = acts.stream().filter(x -> "tardanza".equalsIgnoreCase(x.getEstado())).count();
            long j = acts.stream().filter(x -> "justificacion".equalsIgnoreCase(x.getEstado())).count();
            
            Map<String, Object> actDetail = new LinkedHashMap<>();
            actDetail.put("actividad", entry.getKey());
            actDetail.put("total", acts.size());
            actDetail.put("presentes", p);
            actDetail.put("ausentes", a);
            actDetail.put("tardanzas", t);
            actDetail.put("justificaciones", j);
            actDetail.put("porcentaje", acts.size() > 0 ? Math.round((p * 100.0 / acts.size()) * 100.0) / 100.0 : 0);
            detalleActividades.add(actDetail);
        }
        reporte.put("porActividad", detalleActividades);

        // Lista de todas las asistencia del período
        reporte.put("asistencias", AsistenciaDTO.fromList(asistencias));

        return reporte;
    }

    /**
     * Endpoint de estadísticas generales
     */
    @GetMapping("/estadisticas")
    public Map<String, Object> estadisticas() {
        List<Asistencia> todas = asistenciaRepository.findAll();
        
        long presentes = todas.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        long ausentes = todas.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count();
        long tardanzas = todas.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count();
        long justificaciones = todas.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", todas.size());
        stats.put("presente", presentes);
        stats.put("ausente", ausentes);
        stats.put("tardanza", tardanzas);
        stats.put("justificacion", justificaciones);
        
        if (!todas.isEmpty()) {
            stats.put("porcentajeAsistencia", Math.round((presentes * 100.0 / todas.size()) * 100.0) / 100.0);
        } else {
            stats.put("porcentajeAsistencia", 0);
        }

        return stats;
    }

    // ========== NUEVOS ENDPOINTS PARA MEJORA DE ASISTENCIA ==========

    /**
     * GET /api/asistencias/dia-actual
     * Devuelve información sobre el día actual (si es obligatorio, tipo de día)
     */
    @GetMapping("/dia-actual")
    public Map<String, Object> getDiaActual() {
        LocalDate hoy = LocalDate.now();
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("fecha", hoy.toString());
        resultado.put("diaSemana", hoy.getDayOfWeek().getValue());
        resultado.put("nombreDia", hoy.getDayOfWeek().toString());
        resultado.put("esObligatorio", asistenciaService.esDiaObligatorio(hoy));
        resultado.put("tipoDia", asistenciaService.getTipoDia(hoy));
        return resultado;
    }

    /**
     * GET /api/asistencias/dia/{fecha}
     * Devuelve información sobre un día específico
     */
    @GetMapping("/dia/{fecha}")
    public Map<String, Object> getDiaInfo(@PathVariable String fecha) {
        LocalDate fechaParse = LocalDate.parse(fecha);
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("fecha", fechaParse.toString());
        resultado.put("diaSemana", fechaParse.getDayOfWeek().getValue());
        resultado.put("nombreDia", fechaParse.getDayOfWeek().toString());
        resultado.put("esObligatorio", asistenciaService.esDiaObligatorio(fechaParse));
        resultado.put("tipoDia", asistenciaService.getTipoDia(fechaParse));
        return resultado;
    }

    /**
     * GET /api/asistencias/estadisticas/dias-semana?inicio=2025-01-01&fin=2025-03-10
     * Estadísticas agrupadas por día de la semana
     */
    @GetMapping("/estadisticas/dias-semana")
    public Map<String, Object> getEstadisticasPorDiaSemana(
            @RequestParam String inicio,
            @RequestParam String fin) {
        LocalDate fechaInicio = LocalDate.parse(inicio);
        LocalDate fechaFin = LocalDate.parse(fin);
        return asistenciaService.getEstadisticasPorDia(fechaInicio, fechaFin);
    }

    /**
     * GET /api/asistencias/estadisticas/dias-obligatorios?inicio=2025-01-01&fin=2025-03-10
     * Estadísticas solo de días obligatorios
     */
    @GetMapping("/estadisticas/dias-obligatorios")
    public Map<String, Object> getEstadisticasDiasObligatorios(
            @RequestParam String inicio,
            @RequestParam String fin) {
        LocalDate fechaInicio = LocalDate.parse(inicio);
        LocalDate fechaFin = LocalDate.parse(fin);
        return asistenciaService.getEstadisticasDiasObligatorios(fechaInicio, fechaFin);
    }

    /**
     * POST /api/asistencias/registro-con-retraso
     * Permite registrar asistencia con fecha anterior (tolerancia)
     */
    @PostMapping("/registro-con-retraso")
    public ResponseEntity<Asistencia> registrarConRetraso(@RequestBody RegistroConRetrasoRequest request) {
        // Validar que la fecha de registro no sea muy antigua (máximo 7 días)
        LocalDate hoy = LocalDate.now();
        if (request.getFecha().isBefore(hoy.minusDays(7))) {
            return ResponseEntity.badRequest().build();
        }

        // Validar fecha límite si es día obligatorio
        if (asistenciaService.esDiaObligatorio(request.getFecha())) {
            LocalDate fechaLimite = asistenciaService.getFechaLimiteRegistro(request.getFecha());
            if (hoy.isAfter(fechaLimite)) {
                return ResponseEntity.badRequest().build();
            }
        }

        Asistencia asistencia = new Asistencia();
        asistencia.setFecha(request.getFecha());
        asistencia.setHoraEntrada(request.getHoraEntrada());
        asistencia.setHoraSalida(request.getHoraSalida());
        asistencia.setActividad(request.getActividad());
        asistencia.setEvento(request.getEvento());
        asistencia.setEstado(request.getEstado());
        asistencia.setObservaciones(request.getObservaciones());
        asistencia.setResponsableId(request.getResponsableId());
        asistencia.setResponsable(request.getResponsable());
        asistencia.setHoraProgramada(request.getHoraProgramada());

        // Procesar asistencia (calcula tipoDia, diaSemana, retraso, etc.)
        asistenciaService.procesarAsistencia(asistencia);

        asistencia.setCreatedAt(LocalDateTime.now());
        Asistencia guardado = asistenciaRepository.save(asistencia);
        return ResponseEntity.ok(guardado);
    }

    /**
     * PUT /api/asistencias/{id}/procesar
     * Reprocesa una asistencia existente (recalcula retrasos, tipo día, etc.)
     */
    @PutMapping("/{id}/procesar")
    public ResponseEntity<Asistencia> reprocesarAsistencia(@PathVariable Long id) {
        Optional<Asistencia> o = asistenciaRepository.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();

        Asistencia asistencia = o.get();
        asistenciaService.procesarAsistencia(asistencia);
        return ResponseEntity.ok(asistenciaRepository.save(asistencia));
    }

    // DTO para request con retraso
    public static class RegistroConRetrasoRequest {
        private LocalDate fecha;
        private LocalDateTime horaEntrada;
        private LocalDateTime horaSalida;
        private String actividad;
        private String evento;
        private String estado;
        private String observaciones;
        private Long responsableId;
        private String responsable;
        private LocalTime horaProgramada;

        // Getters y setters
        public LocalDate getFecha() { return fecha; }
        public void setFecha(LocalDate fecha) { this.fecha = fecha; }
        public LocalDateTime getHoraEntrada() { return horaEntrada; }
        public void setHoraEntrada(LocalDateTime horaEntrada) { this.horaEntrada = horaEntrada; }
        public LocalDateTime getHoraSalida() { return horaSalida; }
        public void setHoraSalida(LocalDateTime horaSalida) { this.horaSalida = horaSalida; }
        public String getActividad() { return actividad; }
        public void setActividad(String actividad) { this.actividad = actividad; }
        public String getEvento() { return evento; }
        public void setEvento(String evento) { this.evento = evento; }
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
        public Long getResponsableId() { return responsableId; }
        public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
        public String getResponsable() { return responsable; }
        public void setResponsable(String responsable) { this.responsable = responsable; }
        public LocalTime getHoraProgramada() { return horaProgramada; }
        public void setHoraProgramada(LocalTime horaProgramada) { this.horaProgramada = horaProgramada; }
    }

    // DTO para representar asistencia en respuestas
    static class AsistenciaDTO {
        public Long id;
        public LocalDate fecha;
        public String actividad;
        public String evento;
        public String estado;
        public String observaciones;
        public String responsable;

        public static List<AsistenciaDTO> fromList(List<Asistencia> list) {
            return list.stream().map(a -> {
                AsistenciaDTO dto = new AsistenciaDTO();
                dto.id = a.getId();
                dto.fecha = a.getFecha();
                dto.actividad = a.getActividad();
                dto.evento = a.getEvento();
                dto.estado = a.getEstado();
                dto.observaciones = a.getObservaciones();
                dto.responsable = a.getResponsable();
                return dto;
            }).collect(Collectors.toList());
        }
    }
}
