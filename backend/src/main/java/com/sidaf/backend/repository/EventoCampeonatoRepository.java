package com.sidaf.backend.repository;

import com.sidaf.backend.model.EventoCampeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventoCampeonatoRepository extends JpaRepository<EventoCampeonato, Long> {
    List<EventoCampeonato> findByEntidadTipoAndEntidadId(String entidadTipo, Long entidadId);
    List<EventoCampeonato> findByEntidadTipo(String entidadTipo);
    List<EventoCampeonato> findByEvento(String evento);
    List<EventoCampeonato> findByUsuarioId(Long usuarioId);
    List<EventoCampeonato> findByFechaEventoBetween(java.time.LocalDateTime desde, java.time.LocalDateTime hasta);
    List<EventoCampeonato> findByEntidadTipoAndEntidadIdAndEvento(String entidadTipo, Long entidadId, String evento);
}
