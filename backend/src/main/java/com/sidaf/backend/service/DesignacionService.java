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
}
