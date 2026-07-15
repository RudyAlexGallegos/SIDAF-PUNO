package com.sidaf.backend.service;

import com.sidaf.backend.dto.DisponibilidadArbitroDTO;
import com.sidaf.backend.model.Arbitro;
import com.sidaf.backend.model.ArbitroDisponibilidad;
import com.sidaf.backend.model.ArbitroDisponibilidad.EstadoBloqueo;
import com.sidaf.backend.model.ArbitroDisponibilidad.TipoIndisponibilidad;
import com.sidaf.backend.model.Designacion;
import com.sidaf.backend.repository.ArbitroDisponibilidadRepository;
import com.sidaf.backend.repository.ArbitroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio central de disponibilidad de árbitros.
 *
 * Fuente de verdad única para saber si un árbitro está disponible en una fecha.
 * Reglas de negocio:
 *  - Bloqueo por DÍA COMPLETO.
 *  - Bloqueo GLOBAL (vale para todos los campeonatos).
 *  - Un árbitro solo puede tener UN bloqueo activo por fecha (garantizado por
 *    índice único parcial en BD + validación aquí).
 */
@Service
public class DisponibilidadService {

    @Autowired
    private ArbitroDisponibilidadRepository disponibilidadRepository;

    @Autowired
    private ArbitroRepository arbitroRepository;

    // ---------------------------------------------------------------
    // Utilidades
    // ---------------------------------------------------------------

    /** Acepta "yyyy-MM-dd" o ISO "yyyy-MM-ddTHH:mm:ss" y devuelve solo el día. */
    public LocalDate normalizarFecha(String fecha) {
        if (fecha == null || fecha.isBlank()) {
            throw new IllegalArgumentException("La fecha es obligatoria");
        }
        String base = fecha.length() >= 10 ? fecha.substring(0, 10) : fecha;
        return LocalDate.parse(base);
    }

    /**
     * Parseo estricto del id de árbitro almacenado como texto en la designación.
     * - null/vacío: devuelve null (rol no asignado, se ignora).
     * - valor no vacío pero no numérico: lanza excepción para NO ocultar un dato
     *   inválido que dejaría al árbitro sin bloquear (integridad de la regla 1).
     */
    private Long parseArbitroId(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return Long.parseLong(valor.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "La designación contiene un identificador de árbitro inválido: '" + valor + "'");
        }
    }

    private String nombreArbitro(Long id) {
        if (id == null) return null;
        return arbitroRepository.findById(id)
                .map(a -> (a.getNombre() != null ? a.getNombre() : "")
                        + (a.getApellido() != null ? " " + a.getApellido() : ""))
                .map(String::trim)
                .orElse("Árbitro #" + id);
    }

    // ---------------------------------------------------------------
    // Consulta de disponibilidad
    // ---------------------------------------------------------------

    public boolean estaDisponible(Long arbitroId, String fecha) {
        LocalDate f = normalizarFecha(fecha);
        return disponibilidadRepository
                .findFirstByArbitroIdAndFechaAndEstado(arbitroId, f, EstadoBloqueo.BLOQUEADO)
                .isEmpty();
    }

    public DisponibilidadArbitroDTO consultarArbitro(Long arbitroId, String fecha) {
        LocalDate f = normalizarFecha(fecha);
        Optional<ArbitroDisponibilidad> bloqueo = disponibilidadRepository
                .findFirstByArbitroIdAndFechaAndEstado(arbitroId, f, EstadoBloqueo.BLOQUEADO);
        String nombre = nombreArbitro(arbitroId);
        if (bloqueo.isEmpty()) {
            return DisponibilidadArbitroDTO.disponible(arbitroId, nombre, fecha);
        }
        return toDTO(bloqueo.get());
    }

    /**
     * Estado de disponibilidad de TODOS los árbitros (o de una lista) en una fecha.
     * Ideal para pintar la grilla de selección en el frontend en tiempo real.
     */
    public List<DisponibilidadArbitroDTO> consultarPorFecha(String fecha) {
        LocalDate f = normalizarFecha(fecha);
        List<ArbitroDisponibilidad> bloqueos =
                disponibilidadRepository.findByFechaAndEstado(f, EstadoBloqueo.BLOQUEADO);
        Map<Long, ArbitroDisponibilidad> porArbitro = new LinkedHashMap<>();
        for (ArbitroDisponibilidad b : bloqueos) {
            porArbitro.putIfAbsent(b.getArbitroId(), b);
        }

        List<DisponibilidadArbitroDTO> resultado = new ArrayList<>();
        for (Arbitro arb : arbitroRepository.findAll()) {
            ArbitroDisponibilidad b = porArbitro.get(arb.getId());
            String nombre = ((arb.getNombre() != null ? arb.getNombre() : "")
                    + (arb.getApellido() != null ? " " + arb.getApellido() : "")).trim();
            if (b == null) {
                resultado.add(DisponibilidadArbitroDTO.disponible(arb.getId(), nombre, fecha));
            } else {
                resultado.add(toDTO(b));
            }
        }
        return resultado;
    }

    private DisponibilidadArbitroDTO toDTO(ArbitroDisponibilidad b) {
        DisponibilidadArbitroDTO dto = new DisponibilidadArbitroDTO();
        dto.setArbitroId(b.getArbitroId());
        dto.setArbitroNombre(b.getArbitroNombre() != null ? b.getArbitroNombre() : nombreArbitro(b.getArbitroId()));
        dto.setFecha(b.getFecha() != null ? b.getFecha().toString() : null);
        dto.setDisponible(false);
        dto.setTipo(b.getTipo() != null ? b.getTipo().name() : null);
        dto.setMotivo(construirMotivo(b));
        dto.setDesignacionId(b.getDesignacionId());
        dto.setCampeonatoId(b.getCampeonatoId());
        dto.setCampeonatoNombre(b.getCampeonatoNombre());
        dto.setHora(b.getHora());
        dto.setRol(b.getRol());
        dto.setEquipoTrabajo(b.getEquipoTrabajo());
        return dto;
    }

    private String construirMotivo(ArbitroDisponibilidad b) {
        if (b.getTipo() == TipoIndisponibilidad.DESIGNACION) {
            StringBuilder sb = new StringBuilder("Designado");
            if (b.getCampeonatoNombre() != null) sb.append(" en ").append(b.getCampeonatoNombre());
            if (b.getFecha() != null) sb.append(" el ").append(b.getFecha());
            if (b.getHora() != null && !b.getHora().isBlank()) sb.append(" a las ").append(b.getHora());
            if (b.getRol() != null) sb.append(" (").append(rolLegible(b.getRol())).append(")");
            return sb.toString();
        }
        // Indisponibilidad manual
        String etiqueta = switch (b.getTipo()) {
            case PERMISO -> "Permiso";
            case LESION -> "Lesión";
            case VIAJE -> "Viaje";
            case EXAMEN -> "Examen";
            default -> "No disponible";
        };
        if (b.getMotivo() != null && !b.getMotivo().isBlank()) {
            return etiqueta + ": " + b.getMotivo();
        }
        return etiqueta;
    }

    private String rolLegible(String rol) {
        if (rol == null) return "";
        return switch (rol) {
            case "PRINCIPAL" -> "Árbitro principal";
            case "ASISTENTE_1" -> "Asistente 1";
            case "ASISTENTE_2" -> "Asistente 2";
            case "CUARTO" -> "Cuarto árbitro";
            case "ASESOR" -> "Asesor";
            default -> rol;
        };
    }

    // ---------------------------------------------------------------
    // Bloqueo derivado de designaciones (Regla 1 + 2 + 3)
    // ---------------------------------------------------------------

    /**
     * Bloquea a todos los árbitros de una designación para su fecha.
     * Idempotente: primero libera bloqueos previos de la misma designación.
     * Lanza ConflictoDisponibilidadException si algún árbitro ya está ocupado
     * por otra fuente en esa fecha.
     */
    @Transactional
    public void bloquearPorDesignacion(Designacion d) {
        if (d == null || d.getFecha() == null) return;
        LocalDate fecha = normalizarFecha(d.getFecha());

        // 1. Limpiar bloqueos anteriores originados por ESTA designación (re-publicación)
        List<ArbitroDisponibilidad> previos = disponibilidadRepository.findByDesignacionId(d.getId());
        if (!previos.isEmpty()) {
            disponibilidadRepository.deleteAll(previos);
            disponibilidadRepository.flush();
        }

        // 2. Agrupar TODOS los roles por arbitroId (un mismo árbitro puede tener
        //    más de un rol; todos se conservan para la trazabilidad).
        Map<Long, List<String>> rolesPorArbitro = new LinkedHashMap<>();
        addRol(rolesPorArbitro, "PRINCIPAL", d.getArbitroPrincipal());
        addRol(rolesPorArbitro, "ASISTENTE_1", d.getArbitroAsistente1());
        addRol(rolesPorArbitro, "ASISTENTE_2", d.getArbitroAsistente2());
        addRol(rolesPorArbitro, "CUARTO", d.getCuartoArbitro());
        addRol(rolesPorArbitro, "ASESOR", d.getAsesor());

        if (rolesPorArbitro.isEmpty()) return;

        List<Long> arbitroIds = new ArrayList<>(rolesPorArbitro.keySet());

        // Nombres en UNA sola consulta (evita N+1)
        Map<Long, String> nombres = new LinkedHashMap<>();
        arbitroRepository.findAllById(arbitroIds).forEach(a ->
                nombres.put(a.getId(), ((a.getNombre() != null ? a.getNombre() : "")
                        + (a.getApellido() != null ? " " + a.getApellido() : "")).trim()));
        for (Long id : arbitroIds) {
            nombres.putIfAbsent(id, "Árbitro #" + id);
        }

        // 3. Detectar conflictos con OTRAS fuentes ya activas en esa fecha (UNA consulta batch)
        List<ArbitroDisponibilidad> activos = disponibilidadRepository
                .findActivosByFechaAndArbitros(fecha, EstadoBloqueo.BLOQUEADO, arbitroIds);
        List<DisponibilidadArbitroDTO> conflictos = activos.stream()
                .filter(a -> !java.util.Objects.equals(a.getDesignacionId(), d.getId()))
                .map(this::toDTO)
                .collect(Collectors.toList());
        if (!conflictos.isEmpty()) {
            String nombresConflicto = conflictos.stream()
                    .map(DisponibilidadArbitroDTO::getArbitroNombre)
                    .collect(Collectors.joining(", "));
            throw new ConflictoDisponibilidadException(
                    "No se puede confirmar: los siguientes árbitros ya están asignados en esa fecha: "
                            + nombresConflicto, conflictos);
        }

        // 4. Insertar UN bloqueo por árbitro (día completo), con todos sus roles
        for (Long arbitroId : arbitroIds) {
            String rol = String.join(" / ", rolesPorArbitro.get(arbitroId));

            String equipoTrabajo = nombres.entrySet().stream()
                    .filter(n -> !n.getKey().equals(arbitroId))
                    .map(Map.Entry::getValue)
                    .collect(Collectors.joining(", "));

            ArbitroDisponibilidad bloqueo = new ArbitroDisponibilidad();
            bloqueo.setArbitroId(arbitroId);
            bloqueo.setArbitroNombre(nombres.get(arbitroId));
            bloqueo.setFecha(fecha);
            bloqueo.setHora(d.getHora());
            bloqueo.setTipo(TipoIndisponibilidad.DESIGNACION);
            bloqueo.setEstado(EstadoBloqueo.BLOQUEADO);
            bloqueo.setDesignacionId(d.getId());
            bloqueo.setCampeonatoId(d.getIdCampeonato());
            bloqueo.setCampeonatoNombre(d.getNombreCampeonato());
            bloqueo.setRol(rol);
            bloqueo.setEquipoTrabajo(equipoTrabajo.isBlank() ? null : equipoTrabajo);
            try {
                disponibilidadRepository.save(bloqueo);
            } catch (DataIntegrityViolationException ex) {
                // Salvaguarda ante condición de carrera: el índice único parcial rechazó el insert
                DisponibilidadArbitroDTO c = consultarArbitro(arbitroId, d.getFecha());
                throw new ConflictoDisponibilidadException(
                        "Conflicto de disponibilidad detectado al confirmar (" + nombres.get(arbitroId) + ")",
                        List.of(c));
            }
        }
    }

    private void addRol(Map<Long, List<String>> rolesPorArbitro, String rol, String valor) {
        Long id = parseArbitroId(valor);
        if (id != null) {
            rolesPorArbitro.computeIfAbsent(id, k -> new ArrayList<>()).add(rol);
        }
    }

    /** Libera (elimina) todos los bloqueos originados por una designación. */
    @Transactional
    public void liberarPorDesignacion(Long designacionId) {
        if (designacionId == null) return;
        List<ArbitroDisponibilidad> bloqueos = disponibilidadRepository.findByDesignacionId(designacionId);
        if (!bloqueos.isEmpty()) {
            disponibilidadRepository.deleteAll(bloqueos);
        }
    }

    // ---------------------------------------------------------------
    // Indisponibilidad manual (permisos, lesiones, viajes, exámenes)
    // ---------------------------------------------------------------

    @Transactional
    public ArbitroDisponibilidad registrarIndisponibilidadManual(
            Long arbitroId, String fecha, TipoIndisponibilidad tipo, String motivo) {
        if (arbitroId == null) throw new IllegalArgumentException("arbitroId es obligatorio");
        LocalDate f = normalizarFecha(fecha);

        Optional<ArbitroDisponibilidad> existente = disponibilidadRepository
                .findFirstByArbitroIdAndFechaAndEstado(arbitroId, f, EstadoBloqueo.BLOQUEADO);
        if (existente.isPresent()) {
            throw new ConflictoDisponibilidadException(
                    "El árbitro ya tiene un bloqueo activo en esa fecha",
                    List.of(toDTO(existente.get())));
        }

        ArbitroDisponibilidad bloqueo = new ArbitroDisponibilidad();
        bloqueo.setArbitroId(arbitroId);
        bloqueo.setArbitroNombre(nombreArbitro(arbitroId));
        bloqueo.setFecha(f);
        bloqueo.setTipo(tipo != null ? tipo : TipoIndisponibilidad.OTRO);
        bloqueo.setEstado(EstadoBloqueo.BLOQUEADO);
        bloqueo.setMotivo(motivo);
        try {
            return disponibilidadRepository.save(bloqueo);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictoDisponibilidadException(
                    "El árbitro ya tiene un bloqueo activo en esa fecha",
                    List.of(consultarArbitro(arbitroId, fecha)));
        }
    }

    @Transactional
    public boolean eliminarBloqueo(Long id) {
        if (!disponibilidadRepository.existsById(id)) return false;
        disponibilidadRepository.deleteById(id);
        return true;
    }

    public List<ArbitroDisponibilidad> listarPorArbitro(Long arbitroId) {
        return disponibilidadRepository.findByArbitroId(arbitroId);
    }
}
