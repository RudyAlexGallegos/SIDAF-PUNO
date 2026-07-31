package com.sidaf.backend.service;

import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.model.Designacion.EstadoDesignacion;
import com.sidaf.backend.model.Arbitro;
import com.sidaf.backend.repository.DesignacionRepository;
import com.sidaf.backend.repository.ArbitroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DesignacionService {

    @Autowired
    private DesignacionRepository designacionRepository;

    @Autowired
    private DisponibilidadService disponibilidadService;

    @Autowired
    private ArbitroRepository arbitroRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Crea una designación y, si nace CONFIRMADA, bloquea la disponibilidad de
     * sus árbitros en la MISMA transacción (atómico: si hay conflicto, revierte
     * también el guardado de la designación).
     */
    @Transactional
    public Designacion crearConSincronizacion(Designacion designacion) {
        validarDesignacion(designacion);
        Designacion guardada = designacionRepository.save(designacion);
        sincronizarDisponibilidad(guardada);
        return guardada;
    }

    /**
     * Guarda cambios de una designación y sincroniza disponibilidad atómicamente.
     */
    @Transactional
    public Designacion guardarConSincronizacion(Designacion designacion) {
        validarDesignacion(designacion);
        Designacion guardada = designacionRepository.save(designacion);
        sincronizarDisponibilidad(guardada);
        return guardada;
    }

    /**
     * Elimina una designación liberando sus bloqueos en la misma transacción.
     * @return true si existía y se eliminó.
     */
    @Transactional
    public boolean eliminarConLiberacion(Long id) {
        if (!designacionRepository.existsById(id)) return false;
        disponibilidadService.liberarPorDesignacion(id);
        designacionRepository.deleteById(id);
        return true;
    }

    private void sincronizarDisponibilidad(Designacion guardada) {
        EstadoDesignacion estado = guardada.getEstado();
        // Una designación ACTIVA (programada o confirmada) ocupa al árbitro ese día.
        // En este sistema la designación operativa nace como PROGRAMADA (no hay un
        // paso separado de "publicar"), por lo que el bloqueo debe aplicarse ya al crearla.
        if (estado == EstadoDesignacion.PROGRAMADA
                || estado == EstadoDesignacion.CONFIRMADA
                || estado == EstadoDesignacion.COMPLETADA) {
            disponibilidadService.bloquearPorDesignacion(guardada);
        } else if (estado == EstadoDesignacion.CANCELADA) {
            disponibilidadService.liberarPorDesignacion(guardada.getId());
        }
    }

    private void validarDesignacion(Designacion designacion) {
        String[] roles = {
            designacion.getArbitroPrincipal(),
            designacion.getArbitroAsistente1(),
            designacion.getArbitroAsistente2(),
            designacion.getCuartoArbitro(),
            designacion.getAsesor()
        };

        Map<Long, String> nombres = new HashMap<>();
        Map<Long, Long> conteo = new HashMap<>();

        for (String rol : roles) {
            if (rol == null || rol.isBlank()) continue;
            try {
                Long id = Long.parseLong(rol.trim());
                Optional<Arbitro> opt = arbitroRepository.findById(id);
                if (opt.isEmpty()) {
                    throw new IllegalArgumentException("Árbitro no encontrado: " + id);
                }
                Arbitro arbitro = opt.get();
                if (arbitro.getEstado() == null || !arbitro.getEstado().equalsIgnoreCase("ACTIVO")) {
                    throw new IllegalArgumentException(
                        "Árbitro no activo: " + arbitro.getNombre() + " " + arbitro.getApellido());
                }
                nombres.put(id, arbitro.getNombre() + " " + arbitro.getApellido());
                conteo.put(id, conteo.getOrDefault(id, 0L) + 1);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("ID de árbitro inválido: " + rol);
            }
        }

        Optional<Map.Entry<Long, Long>> repetido = conteo.entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .findFirst();
        if (repetido.isPresent()) {
            throw new IllegalArgumentException(
                "Árbitro repetido en la designación: " + nombres.get(repetido.get().getKey()));
        }

        if (designacion.getArbitroPrincipal() != null && !designacion.getArbitroPrincipal().isBlank()) {
            try {
                Long idPrincipal = Long.parseLong(designacion.getArbitroPrincipal().trim());
                Optional<Arbitro> optPrincipal = arbitroRepository.findById(idPrincipal);
                if (optPrincipal.isPresent()) {
                    Arbitro principal = optPrincipal.get();
                    String categoria = principal.getCategoria();
                    if (categoria == null ||
                            (!categoria.equalsIgnoreCase("FIFA") && !categoria.equalsIgnoreCase("NACIONAL"))) {
                        throw new IllegalArgumentException(
                                "El árbitro principal debe ser de categoría FIFA o Nacional. " +
                                "Árbitro seleccionado: " + principal.getNombre() + " " + principal.getApellido() +
                                " (" + categoria + ")");
                    }
                }
            } catch (NumberFormatException e) {
                // Ya validado arriba
            }
        }
    }

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

    /**
     * Publica (confirma) designaciones. Al pasar a CONFIRMADA se bloquea la
     * disponibilidad de todos los árbitros involucrados para esa fecha (regla 1).
     * La operación es transaccional y atómica: si algún árbitro ya está ocupado,
     * se lanza ConflictoDisponibilidadException y NO se confirma nada del lote.
     */
    @Transactional
    public List<Designacion> publicarDesignaciones(List<Long> ids) {
        List<Designacion> actualizadas = new ArrayList<>();
        for (Long id : ids) {
            designacionRepository.findById(id).ifPresent(d -> {
                d.setEstado(EstadoDesignacion.CONFIRMADA);
                Designacion guardada = designacionRepository.save(d);
                // Bloqueo centralizado de disponibilidad (verificación en tiempo real)
                disponibilidadService.bloquearPorDesignacion(guardada);
                actualizadas.add(guardada);
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
