package com.sidaf.backend.service;

import com.sidaf.backend.model.Asistencia;
import com.sidaf.backend.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AsistenciaService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    public static final Set<Integer> DIAS_OBLIGATORIOS = Set.of(1, 2, 4, 5, 6);
    private static final int MINUTOS_TOLERANCIA = 15;

    public boolean esDiaObligatorio(LocalDate fecha) {
        return DIAS_OBLIGATORIOS.contains(fecha.getDayOfWeek().getValue());
    }

    public String getTipoDia(LocalDate fecha) {
        int dia = fecha.getDayOfWeek().getValue();
        if (DIAS_OBLIGATORIOS.contains(dia)) return "OBLIGATORIO";
        if (dia == 3 || dia == 7) return "DESCANSO";
        return "OPCIONAL";
    }

    public int calcularRetraso(LocalTime horaProgramada, LocalTime horaReal) {
        if (horaProgramada == null || horaReal == null) return 0;
        LocalTime horaLimite = horaProgramada.plusMinutes(MINUTOS_TOLERANCIA);
        if (horaReal.isBefore(horaLimite) || horaReal.equals(horaLimite)) return 0;
        return (int) ChronoUnit.MINUTES.between(horaProgramada, horaReal);
    }

    public boolean tieneRetraso(int minutosRetraso) { 
        return minutosRetraso > 0; 
    }

    public LocalDate getFechaLimiteRegistro(LocalDate fecha) { 
        return fecha.plusDays(1); 
    }

    public boolean estaEnTolerancia(LocalDate fechaRegistro, LocalDate fechaLimite) {
        return !fechaRegistro.isAfter(fechaLimite);
    }

    public void procesarAsistencia(Asistencia asistencia) {
        if (asistencia.getFecha() != null) {
            asistencia.setDiaSemana(asistencia.getFecha().getDayOfWeek().getValue());
            asistencia.setTipoDia(getTipoDia(asistencia.getFecha()));
            asistencia.setFechaLimiteRegistro(getFechaLimiteRegistro(asistencia.getFecha()));
        }
        if (asistencia.getHoraProgramada() != null && asistencia.getHoraEntrada() != null) {
            LocalTime horaReal = asistencia.getHoraEntrada().toLocalTime();
            int minutosRetraso = calcularRetraso(asistencia.getHoraProgramada(), horaReal);
            asistencia.setMinutosRetraso(minutosRetraso);
            asistencia.setTieneRetraso(tieneRetraso(minutosRetraso));
        }
    }

    public Map<String, Object> getEstadisticasPorDia(LocalDate inicio, LocalDate fin) {
        List<Asistencia> lista = asistenciaRepository.findByFechaBetween(inicio, fin);
        Map<Integer, EstadisticaDia> stats = new HashMap<>();
        for (int d = 1; d <= 7; d++) stats.put(d, new EstadisticaDia());
        
        for (Asistencia a : lista) {
            if (a.getFecha() == null) continue;
            int ds = a.getFecha().getDayOfWeek().getValue();
            EstadisticaDia s = stats.get(ds);
            String e = a.getEstado();
            if (e != null) {
                switch (e.toLowerCase()) {
                    case "presente": s.presentes++; break;
                    case "ausente": s.ausentes++; break;
                    case "tardanza": s.tardanzas++; break;
                    case "justificacion": s.justificaciones++; break;
                }
                s.total++;
            }
        }
        
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("periodo", Map.of("inicio", inicio.toString(), "fin", fin.toString()));
        Map<String, Object> pd = new LinkedHashMap<>();
        String[] nd = {"", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"};
        for (int d = 1; d <= 7; d++) {
            EstadisticaDia s = stats.get(d);
            Map<String, Object> ds = new LinkedHashMap<>();
            ds.put("dia", nd[d]);
            ds.put("numeroDia", d);
            ds.put("esObligatorio", DIAS_OBLIGATORIOS.contains(d));
            ds.put("total", s.total);
            ds.put("presentes", s.presentes);
            ds.put("ausentes", s.ausentes);
            ds.put("tardanzas", s.tardanzas);
            ds.put("justificaciones", s.justificaciones);
            ds.put("porcentajeAsistencia", s.getPorcentajeAsistencia());
            pd.put(nd[d], ds);
        }
        r.put("porDia", pd);
        
        long tp = lista.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        r.put("resumen", Map.of("totalRegistros", lista.size(), "presentes", tp,
            "porcentajeGeneral", lista.size() > 0 ? Math.round(tp * 1000.0 / lista.size()) / 10.0 : 0.0));
        
        return r;
    }

    public Map<String, Object> getEstadisticasDiasObligatorios(LocalDate inicio, LocalDate fin) {
        List<Asistencia> lista = asistenciaRepository.findByFechaBetween(inicio, fin);
        List<Asistencia> oblig = new ArrayList<>();
        for (Asistencia a : lista) {
            if (a.getFecha() != null && esDiaObligatorio(a.getFecha())) {
                oblig.add(a);
            }
        }
        
        long p = oblig.stream().filter(a -> "presente".equalsIgnoreCase(a.getEstado())).count();
        long aus = oblig.stream().filter(x -> "ausente".equalsIgnoreCase(x.getEstado())).count();
        long t = oblig.stream().filter(x -> "tardanza".equalsIgnoreCase(x.getEstado())).count();
        long j = oblig.stream().filter(x -> "justificacion".equalsIgnoreCase(x.getEstado())).count();
        
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("periodo", Map.of("inicio", inicio.toString(), "fin", fin.toString()));
        r.put("diasObligatorios", Map.of("total", oblig.size(), "presentes", p, "ausentes", aus,
            "tardanzas", t, "justificaciones", j,
            "porcentajeAsistencia", oblig.size() > 0 ? Math.round(p * 1000.0 / oblig.size()) / 10.0 : 0.0));
        
        return r;
    }

    private static class EstadisticaDia {
        int total = 0, presentes = 0, ausentes = 0, tardanzas = 0, justificaciones = 0;
        
        double getPorcentajeAsistencia() { 
            return total == 0 ? 0.0 : Math.round(presentes * 1000.0 / total) / 10.0; 
        }
    }
}
