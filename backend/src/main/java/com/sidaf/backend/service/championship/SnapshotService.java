package com.sidaf.backend.service.championship;

import com.sidaf.backend.model.Arbitro;
import com.sidaf.backend.model.ArbitroSnapshot;
import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.CampeonatoSnapshot;
import com.sidaf.backend.model.Equipo;
import com.sidaf.backend.model.EquipoSnapshot;
import com.sidaf.backend.repository.ArbitroRepository;
import com.sidaf.backend.repository.ArbitroSnapshotRepository;
import com.sidaf.backend.repository.CampeonatoRepository;
import com.sidaf.backend.repository.CampeonatoSnapshotRepository;
import com.sidaf.backend.repository.EquipoRepository;
import com.sidaf.backend.repository.EquipoSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SnapshotService {

    @Autowired
    private ArbitroRepository arbitroRepository;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private ArbitroSnapshotRepository arbitroSnapshotRepository;

    @Autowired
    private EquipoSnapshotRepository equipoSnapshotRepository;

    @Autowired
    private CampeonatoSnapshotRepository campeonatoSnapshotRepository;

    public ArbitroSnapshot crearSnapshotArbitro(Long arbitroId) {
        Arbitro arbitro = arbitroRepository.findById(arbitroId)
                .orElseThrow(() -> new IllegalArgumentException("Árbitro no encontrado"));
        ArbitroSnapshot snapshot = new ArbitroSnapshot();
        snapshot.setArbitroId(arbitro.getId());
        snapshot.setNombre(arbitro.getNombre());
        snapshot.setApellido(arbitro.getApellido());
        snapshot.setDni(arbitro.getDni());
        snapshot.setGenero(arbitro.getGenero());
        snapshot.setProvincia(arbitro.getProvincia());
        snapshot.setDistrito(arbitro.getDistrito());
        snapshot.setCategoria(arbitro.getCategoria());
        snapshot.setEspecialidad(arbitro.getEspecialidad());
        snapshot.setEstado(arbitro.getEstado());
        snapshot.setExperiencia(arbitro.getExperiencia());
        snapshot.setNivelPreparacion(arbitro.getNivelPreparacion());
        snapshot.setDisponible(arbitro.getDisponible());
        snapshot.setFechaSnapshot(LocalDateTime.now());
        return arbitroSnapshotRepository.save(snapshot);
    }

    public List<ArbitroSnapshot> obtenerSnapshotsArbitro(Long arbitroId) {
        return arbitroSnapshotRepository.findByArbitroId(arbitroId);
    }

    public EquipoSnapshot crearSnapshotEquipo(Integer equipoId) {
        Equipo equipo = equipoRepository.findById(equipoId)
                .orElseThrow(() -> new IllegalArgumentException("Equipo no encontrado"));
        EquipoSnapshot snapshot = new EquipoSnapshot();
        snapshot.setEquipoId(equipo.getId());
        snapshot.setNombre(equipo.getNombre());
        snapshot.setCategoria(equipo.getCategoria());
        snapshot.setProvincia(equipo.getProvincia());
        snapshot.setDistrito(equipo.getDistrito());
        snapshot.setEstadio(equipo.getEstadio());
        snapshot.setDireccion(equipo.getDireccion());
        snapshot.setTelefono(equipo.getTelefono());
        snapshot.setEmail(equipo.getEmail());
        snapshot.setFechaSnapshot(LocalDateTime.now());
        return equipoSnapshotRepository.save(snapshot);
    }

    public List<EquipoSnapshot> obtenerSnapshotsEquipo(Integer equipoId) {
        return equipoSnapshotRepository.findByEquipoId(equipoId);
    }

    public CampeonatoSnapshot crearSnapshotCampeonato(Long campeonatoId) {
        Campeonato campeonato = campeonatoRepository.findById(campeonatoId)
                .orElseThrow(() -> new IllegalArgumentException("Campeonato no encontrado"));
        CampeonatoSnapshot snapshot = new CampeonatoSnapshot();
        snapshot.setCampeonatoId(campeonato.getId());
        snapshot.setNombre(campeonato.getNombre());
        snapshot.setCategoria(campeonato.getCategoria());
        snapshot.setTipo(campeonato.getTipo());
        snapshot.setFechaInicio(campeonato.getFechaInicio() != null ? campeonato.getFechaInicio().toString() : null);
        snapshot.setFechaFin(campeonato.getFechaFin() != null ? campeonato.getFechaFin().toString() : null);
        snapshot.setEstado(campeonato.getEstado() != null ? campeonato.getEstado().name() : null);
        snapshot.setProvincia(campeonato.getProvincia());
        snapshot.setNivelDificultad(campeonato.getNivelDificultad());
        snapshot.setNumeroEquipos(campeonato.getNumeroEquipos());
        snapshot.setFormato(campeonato.getFormato());
        snapshot.setFechaSnapshot(LocalDateTime.now());
        return campeonatoSnapshotRepository.save(snapshot);
    }

    public List<CampeonatoSnapshot> obtenerSnapshotsCampeonato(Long campeonatoId) {
        return campeonatoSnapshotRepository.findByCampeonatoId(campeonatoId);
    }
}
