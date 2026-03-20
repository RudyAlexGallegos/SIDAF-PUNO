package com.sidaf.backend.service;

import com.sidaf.backend.dto.ReporteConsolidadoDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.ArbitroEstadisticaDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.DiaFaltanteDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.EstadisticaActividadDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.EstadisticaDiaDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.ResumenDTO;
import com.sidaf.backend.dto.ReporteConsolidadoDTO.TendenciaDTO;
import com.sidaf.backend.model.Arbitro;
import com.sidaf.backend.model.Asistencia;
import com.sidaf.backend.repository.ArbitroRepository;
import com.sidaf.backend.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para generar reportes avanzados de asistencia
 */
@Service
public class ReporteService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private ArbitroRepository arbitroRepository;

    private static final Set<Integer> DIAS_OBLIGATORIOS = Set.of(1, 2, 4, 5, 6);
    private static final String[] NOM_DIAS = {"", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"};

    /**
     * Genera un reporte consolidado completo de asistencia
     */
    public ReporteConsolidadoDTO generarReporteConsolidado(LocalDate inicio, LocalDate fin) {
        ReporteConsolidadoDTO reporte = new ReporteConsolidadoDTO();
        
        // Configurar periodo
        Map<String, String> periodo = new LinkedHashMap<>();
        periodo.put("inicio", inicio.toString());
        periodo.put("fin", fin.toString());
        reporte.setPeriodo(periodo);
        
        // Obtener datos
        List<Asistencia> lista = asistenciaRepository.findByFechaBetween(inicio, fin);
        Set<LocalDate> fechasRegistradas = lista.stream()
            .filter(a -> a.getFecha() != null)
            .map(Asistencia::getFecha)
            .collect(Collectors.toSet());
        
        // Generar estadisticas
        reporte.setResumen(generarResumen(lista, inicio, fin));
        reporte.setPorDia(generarEstadisticasPorDia(lista));
        reporte.setPorActividad(generarEstadisticasPorActividad(lista));
        reporte.setPorArbitros(generarEstadisticasPorAribro(lista, inicio, fin));
        reporte.setDiasFaltantes(generarDiasFaltantes(inicio, fin, fechasRegistradas));
        reporte.setTendencia(generarTendencia(lista, inicio, fin));
        
        return reporte;
    }

    /**
     * Genera estadisticas de tendencias comparando periodo actual con anterior
     */
    private TendenciaDTO generarTendencia(List<Asistencia> actuales, LocalDate inicio, LocalDate fin) {
        // Calcular periodo anterior de igual duracion
        long dias = ChronoUnit.DAYS.between(inicio, fin);
        LocalDate inicioAnterior = inicio.minusDays(dias + 1);
        LocalDate finAnterior = inicio.minusDays(1);
        
        List<Asistencia> anteriores = asistenciaRepository.findByFechaBetween(inicioAnterior, finAnterior);
        
        // Calcular porcentajes
        double pctActual = calcularPorcentajeAsistencia(actuales);
        double pctAnterior = calcularPorcentajeAsistencia(anteriores);
        
        TendenciaDTO tendencia = new TendenciaDTO();
        tendencia.setPorcentajeActual(pctActual);
        tendencia.setPorcentajeAnterior(pctAnterior);
        tendencia.setCambioPorcentaje(Math.round((pctActual - pctAnterior) * 100.0) / 100.0);
        
        double diff = pctActual - pctAnterior;
        if (diff > 5) {
            tendencia.setDireccion("subiendo");
        } else if (diff < -5) {
            tendencia.setDireccion("bajando");
        } else {
            tendencia.setDireccion("estable");
        }
        
        return tendencia;
    }

    /**
     * Genera lista de dias obligatorios sin registro
     */
    private List<DiaFaltanteDTO> generarDiasFaltantes(LocalDate inicio, LocalDate fin, Set<LocalDate> fechasRegistradas) {
        List<DiaFaltanteDTO> faltantes = new ArrayList<>();
        
        LocalDate fecha = inicio;
        while (!fecha.isAfter(fin)) {
            if (DIAS_OBLIGATORIOS.contains(fecha.getDayOfWeek().getValue()) && 
                !fechasRegistradas.contains(fecha)) {
                DiaFaltanteDTO dto = new DiaFaltanteDTO();
                dto.setFecha(fecha);
                dto.setDiaSemana(NOM_DIAS[fecha.getDayOfWeek().getValue()]);
                dto.setActividad(getActividadPorDia(fecha));
                faltantes.add(dto);
            }
            fecha = fecha.plusDays(1);
        }
        
        return faltantes;
    }

    /**
     * Genera estadisticas por arbitro
     */
    private List<ArbitroEstadisticaDTO> generarEstadisticasPorAribro(List<Asistencia> lista, LocalDate inicio, LocalDate fin) {
        List<Arbitro> arbitros = arbitroRepository.findAll();
        List<ArbitroEstadisticaDTO> stats = new ArrayList<>();
        
        for (Arbitro arbitro : arbitros) {
            // Agrupar asistencia por arbitro
            List<Asistencia> asisArbitros = new ArrayList<>();
            for (Asistencia a : lista) {
                String obs = a.getObservaciones();
                if (obs != null && obs.contains("\"arbitroId\":" + arbitro.getId())) {
                    asisArbitros.add(a);
                }
            }
            
            if (!asisArbitros.isEmpty()) {
                ArbitroEstadisticaDTO dto = new ArbitroEstadisticaDTO();
                dto.setArbitroId(arbitro.getId());
                dto.setNombreArbitro(arbitro.getNombre() + " " + arbitro.getApellido());
                dto.setCategoria(arbitro.getCategoria());
                dto.setTotalRegistros(asisArbitros.size());
                dto.setPresentes((int) asisArbitros.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
                dto.setAusentes((int) asisArbitros.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count());
                dto.setTardanzas((int) asisArbitros.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count());
                dto.setJustificaciones((int) asisArbitros.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count());
                
                double pct = dto.getTotalRegistros() > 0 ? 
                    (dto.getPresentes() * 100.0 / dto.getTotalRegistros()) : 0;
                dto.setPorcentajeAsistencia(Math.round(pct * 100.0) / 100.0);
                
                // Calcular racha actual
                dto.setRachaActual(calcularRachaActual(asisArbitros));
                
                // Calcular tendencia
                dto.setTendencia(calcularTendenciaArbitro(asisArbitros));
                
                stats.add(dto);
            }
        }
        
        // Ordenar por porcentaje de asistencia descendente
        return stats.stream()
            .sorted((a, b) -> Double.compare(b.getPorcentajeAsistencia(), a.getPorcentajeAsistencia()))
            .collect(Collectors.toList());
    }

    /**
     * Calcula la racha actual de un arbitro
     */
    private int calcularRachaActual(List<Asistencia> asistencia) {
        List<Asistencia> ordenadas = asistencia.stream()
            .filter(a -> a.getFecha() != null)
            .sorted(Comparator.comparing(Asistencia::getFecha).reversed())
            .collect(Collectors.toList());
        
        int racha = 0;
        for (Asistencia a : ordenadas) {
            if ("presente".equalsIgnoreCase(a.getEstado())) {
                racha++;
            } else {
                break;
            }
        }
        return racha;
    }

    /**
     * Calcula la tendencia de un arbitro
     */
    private String calcularTendenciaArbitro(List<Asistencia> asistencia) {
        if (asistencia.size() < 4) return "estable";
        
        List<Asistencia> ultimas = asistencia.stream()
            .filter(a -> a.getFecha() != null)
            .sorted(Comparator.comparing(Asistencia::getFecha).reversed())
            .limit(4)
            .collect(Collectors.toList());
        
        int primeraMitad = (int) ultimas.subList(0, ultimas.size() / 2).stream()
            .filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        int segundaMitad = (int) ultimas.subList(ultimas.size() / 2, ultimas.size()).stream()
            .filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        
        if (segundaMitad > primeraMitad) return "mejora";
        if (segundaMitad < primeraMitad) return "declive";
        return "estable";
    }

    /**
     * Genera estadisticas por dia de la semana
     */
    private Map<String, EstadisticaDiaDTO> generarEstadisticasPorDia(List<Asistencia> lista) {
        Map<Integer, List<Asistencia>> porDia = lista.stream()
            .filter(a -> a.getFecha() != null)
            .collect(Collectors.groupingBy(a -> a.getFecha().getDayOfWeek().getValue()));
        
        Map<String, EstadisticaDiaDTO> resultado = new LinkedHashMap<>();
        
        for (int d = 1; d <= 7; d++) {
            List<Asistencia> delDia = porDia.getOrDefault(d, Collections.emptyList());
            
            EstadisticaDiaDTO dto = new EstadisticaDiaDTO();
            dto.setDia(NOM_DIAS[d]);
            dto.setNumeroDia(d);
            dto.setEsObligatorio(DIAS_OBLIGATORIOS.contains(d));
            dto.setTotal(delDia.size());
            dto.setPresentes((int) delDia.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
            dto.setAusentes((int) delDia.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count());
            dto.setTardanzas((int) delDia.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count());
            dto.setJustificaciones((int) delDia.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count());
            
            double pct = dto.getTotal() > 0 ? (dto.getPresentes() * 100.0 / dto.getTotal()) : 0;
            dto.setPorcentajeAsistencia(Math.round(pct * 100.0) / 100.0);
            
            resultado.put(NOM_DIAS[d], dto);
        }
        
        return resultado;
    }

    /**
     * Genera estadisticas por actividad
     */
    private Map<String, EstadisticaActividadDTO> generarEstadisticasPorActividad(List<Asistencia> lista) {
        Map<String, List<Asistencia>> porActividad = lista.stream()
            .filter(a -> a.getActividad() != null)
            .collect(Collectors.groupingBy(Asistencia::getActividad));
        
        Map<String, EstadisticaActividadDTO> resultado = new LinkedHashMap<>();
        
        for (Map.Entry<String, List<Asistencia>> entry : porActividad.entrySet()) {
            List<Asistencia> deActividad = entry.getValue();
            
            EstadisticaActividadDTO dto = new EstadisticaActividadDTO();
            dto.setActividad(entry.getKey());
            dto.setTotal(deActividad.size());
            dto.setPresentes((int) deActividad.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
            dto.setAusentes((int) deActividad.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count());
            dto.setTardanzas((int) deActividad.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count());
            dto.setJustificaciones((int) deActividad.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count());
            
            double pct = dto.getTotal() > 0 ? (dto.getPresentes() * 100.0 / dto.getTotal()) : 0;
            dto.setPorcentaje(Math.round(pct * 100.0) / 100.0);
            
            resultado.put(entry.getKey(), dto);
        }
        
        return resultado;
    }

    /**
     * Genera resumen general
     */
    private ResumenDTO generarResumen(List<Asistencia> lista, LocalDate inicio, LocalDate fin) {
        ResumenDTO dto = new ResumenDTO();
        
        dto.setTotalRegistros(lista.size());
        dto.setPresentes((int) lista.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
        dto.setAusentes((int) lista.stream().filter(a -> "ausente".equalsIgnoreCase(a.getEstado())).count());
        dto.setTardanzas((int) lista.stream().filter(a -> "tardanza".equalsIgnoreCase(a.getEstado())).count());
        dto.setJustificaciones((int) lista.stream().filter(a -> "justificacion".equalsIgnoreCase(a.getEstado())).count());
        
        // Calcular dias registrados y obligatorios
        Set<LocalDate> fechasRegistradas = lista.stream()
            .filter(a -> a.getFecha() != null)
            .map(Asistencia::getFecha)
            .collect(Collectors.toSet());
        
        int diasRegistrados = 0;
        int diasObligatorios = 0;
        
        LocalDate fecha = inicio;
        while (!fecha.isAfter(fin)) {
            if (DIAS_OBLIGATORIOS.contains(fecha.getDayOfWeek().getValue())) {
                diasObligatorios++;
                if (fechasRegistradas.contains(fecha)) {
                    diasRegistrados++;
                }
            }
            fecha = fecha.plusDays(1);
        }
        
        dto.setDiasRegistrados(diasRegistrados);
        dto.setDiasObligatorios(diasObligatorios);
        
        double pct = dto.getTotalRegistros() > 0 ? 
            (dto.getPresentes() * 100.0 / dto.getTotalRegistros()) : 0;
        dto.setPorcentajeAsistencia(Math.round(pct * 100.0) / 100.0);
        
        return dto;
    }

    /**
     * Calcula el porcentaje de asistencia
     */
    private double calcularPorcentajeAsistencia(List<Asistencia> lista) {
        if (lista.isEmpty()) return 0;
        long presentes = lista.stream()
            .filter(a -> "presente".equalsIgnoreCase(a.getEstado()))
            .count();
        return Math.round((presentes * 10000.0 / lista.size())) / 100.0;
    }

    /**
     * Obtiene la actividad segun el dia de la semana
     */
    private String getActividadPorDia(LocalDate fecha) {
        int dia = fecha.getDayOfWeek().getValue();
        switch (dia) {
            case 1: return "analisis_partido";
            case 2: case 4: case 6: return "preparacion_fisica";
            case 5: return "reunion_ordinaria";
            default: return "";
        }
    }

    /**
     * Obtiene reporte de dias faltantes
     */
    public Map<String, Object> getDiasFaltantes(LocalDate inicio, LocalDate fin) {
        List<Asistencia> lista = asistenciaRepository.findByFechaBetween(inicio, fin);
        
        Set<LocalDate> fechasRegistradas = lista.stream()
            .filter(a -> a.getFecha() != null)
            .map(Asistencia::getFecha)
            .collect(Collectors.toSet());
        
        List<Map<String, Object>> faltantes = new ArrayList<>();
        
        LocalDate fecha = inicio;
        while (!fecha.isAfter(fin)) {
            if (DIAS_OBLIGATORIOS.contains(fecha.getDayOfWeek().getValue()) && 
                !fechasRegistradas.contains(fecha)) {
                Map<String, Object> dto = new LinkedHashMap<>();
                dto.put("fecha", fecha.toString());
                dto.put("diaSemana", NOM_DIAS[fecha.getDayOfWeek().getValue()]);
                dto.put("actividad", getActividadPorDia(fecha));
                faltantes.add(dto);
            }
            fecha = fecha.plusDays(1);
        }
        
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("periodo", Map.of("inicio", inicio.toString(), "fin", fin.toString()));
        resultado.put("diasFaltantes", faltantes);
        resultado.put("total", faltantes.size());
        
        return resultado;
    }

    /**
     * Obtiene estadisticas de tendencias por meses
     */
    public Map<String, Object> getTendencias(int meses) {
        LocalDate fin = LocalDate.now();
        LocalDate inicio = fin.minusMonths(meses);
        
        Map<String, Object> resultado = new LinkedHashMap<>();
        List<Map<String, Object>> mesesData = new ArrayList<>();
        
        LocalDate fecha = inicio;
        while (!fecha.isAfter(fin)) {
            LocalDate primerDiaMes = fecha.withDayOfMonth(1);
            LocalDate ultimoDiaMes = fecha.withDayOfMonth(fecha.lengthOfMonth());
            
            List<Asistencia> delMes = asistenciaRepository.findByFechaBetween(primerDiaMes, ultimoDiaMes);
            
            Map<String, Object> mesData = new LinkedHashMap<>();
            mesData.put("mes", fecha.getMonth().toString());
            mesData.put("anio", fecha.getYear());
            mesData.put("total", delMes.size());
            mesData.put("presentes", delMes.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
            mesData.put("porcentaje", calcularPorcentajeAsistencia(delMes));
            
            mesesData.add(mesData);
            
            fecha = fecha.plusMonths(1);
        }
        
        resultado.put("periodo", Map.of("inicio", inicio.toString(), "fin", fin.toString()));
        resultado.put("meses", mesesData);
        
        return resultado;
    }

    /**
     * Obtiene el ranking de arbitros por asistencia
     */
    public Map<String, Object> getRankingArbitros(LocalDate inicio, LocalDate fin) {
        List<Asistencia> lista = asistenciaRepository.findByFechaBetween(inicio, fin);
        List<Arbitro> arbitros = arbitroRepository.findAll();
        
        List<Map<String, Object>> ranking = new ArrayList<>();
        
        for (Arbitro arbitro : arbitros) {
            List<Asistencia> asisArbitros = new ArrayList<>();
            for (Asistencia a : lista) {
                String obs = a.getObservaciones();
                if (obs != null && obs.contains("\"arbitroId\":" + arbitro.getId())) {
                    asisArbitros.add(a);
                }
            }
            
            if (!asisArbitros.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("arbitroId", arbitro.getId());
                entry.put("nombre", arbitro.getNombre() + " " + arbitro.getApellido());
                entry.put("categoria", arbitro.getCategoria());
                entry.put("total", asisArbitros.size());
                entry.put("presentes", asisArbitros.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count());
                entry.put("porcentaje", calcularPorcentajeAsistencia(asisArbitros));
                
                ranking.add(entry);
            }
        }
        
        // Ordenar por porcentaje descendente
        ranking.sort((a, b) -> Double.compare((Double) b.get("porcentaje"), (Double) a.get("porcentaje")));
        
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("periodo", Map.of("inicio", inicio.toString(), "fin", fin.toString()));
        resultado.put("ranking", ranking);
        
        return resultado;
    }
}
