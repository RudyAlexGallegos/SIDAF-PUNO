package com.sidaf.backend.service;

import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.model.Designacion.EstadoDesignacion;
import com.sidaf.backend.repository.DesignacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DesignacionService {

    @Autowired
    private DesignacionRepository designacionRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<Designacion> obtenerDesignacionesPorCampeonatoYFecha(Long idCampeonato, String fecha) {
        return designacionRepository.findByIdCampeonato(idCampeonato).stream()
                .filter(d -> d.getFecha() != null && d.getFecha().equals(fecha))
                .collect(Collectors.toList());
    }

    public List<Designacion> obtenerDesignacionesAnterioresPorCampeonato(Long idCampeonato, String fechaActual) {
        LocalDate actual = LocalDate.parse(fechaActual, FORMATTER);
        return designacionRepository.findByIdCampeonato(idCampeonato).stream()
                .filter(d -> d.getFecha() != null && LocalDate.parse(d.getFecha(), FORMATTER).isBefore(actual))
                .collect(Collectors.toList());
    }

    public List<String> obtenerFechasUnicasPorCampeonato(Long idCampeonato) {
        return designacionRepository.findByIdCampeonato(idCampeonato).stream()
                .map(Designacion::getFecha)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<Designacion> obtenerDesignacionesPorCampeonatoYArbitro(Long idCampeonato, String arbitroId) {
        return designacionRepository.findByIdCampeonato(idCampeonato).stream()
                .filter(d -> arbitroId.equals(d.getArbitroPrincipal())
                        || arbitroId.equals(d.getArbitroAsistente1())
                        || arbitroId.equals(d.getArbitroAsistente2())
                        || arbitroId.equals(d.getCuartoArbitro())
                        || arbitroId.equals(d.getAsesor()))
                .collect(Collectors.toList());
    }

    public List<Designacion> obtenerDesignacionesConflictivasPorArbitro(String arbitroId, String fecha) {
        List<Designacion> conflictos = new ArrayList<>();
        List<Designacion> porFecha = designacionRepository.findByFecha(fecha);
        for (Designacion d : porFecha) {
            if (arbitroId.equals(d.getArbitroPrincipal())
                    || arbitroId.equals(d.getArbitroAsistente1())
                    || arbitroId.equals(d.getArbitroAsistente2())
                    || arbitroId.equals(d.getCuartoArbitro())
                    || arbitroId.equals(d.getAsesor())) {
                conflictos.add(d);
            }
        }
        return conflictos;
    }

    public List<Designacion> publicarDesignaciones(List<Long> ids) {
        List<Designacion> actualizadas = new ArrayList<>();
        for (Long id : ids) {
            designacionRepository.findById(id).ifPresent(d -> {
                d.setEstado(EstadoDesignacion.CONFIRMADA);
                designacionRepository.save(d);
                actualizadas.add(d);
            });
        }
        return actualizadas;
    }

    public List<Designacion> sugerirDesignacionesSinRepetir(Long idCampeonato, String fechaActual, List<Designacion> designacionesBase) {
        List<Designacion> anteriores = obtenerDesignacionesAnterioresPorCampeonato(idCampeonato, fechaActual);
        if (anteriores.isEmpty()) {
            return designacionesBase;
        }

        List<String> arbitrosExcluidos = new ArrayList<>();
        for (Designacion d : anteriores) {
            if (d.getArbitroPrincipal() != null) arbitrosExcluidos.add(d.getArbitroPrincipal());
            if (d.getArbitroAsistente1() != null) arbitrosExcluidos.add(d.getArbitroAsistente1());
            if (d.getArbitroAsistente2() != null) arbitrosExcluidos.add(d.getArbitroAsistente2());
            if (d.getCuartoArbitro() != null) arbitrosExcluidos.add(d.getCuartoArbitro());
            if (d.getAsesor() != null) arbitrosExcluidos.add(d.getAsesor());
        }

        return designacionesBase.stream()
                .filter(d -> {
                    String principal = d.getArbitroPrincipal();
                    String asistente1 = d.getArbitroAsistente1();
                    String asistente2 = d.getArbitroAsistente2();
                    String cuarto = d.getCuartoArbitro();
                    String asesor = d.getAsesor();

                    boolean repetido = false;
                    if (principal != null && arbitrosExcluidos.contains(principal)) repetido = true;
                    if (asistente1 != null && arbitrosExcluidos.contains(asistente1)) repetido = true;
                    if (asistente2 != null && arbitrosExcluidos.contains(asistente2)) repetido = true;
                    if (cuarto != null && arbitrosExcluidos.contains(cuarto)) repetido = true;
                    if (asesor != null && arbitrosExcluidos.contains(asesor)) repetido = true;

                    return !repetido;
                })
                .collect(Collectors.toList());
    }
}
