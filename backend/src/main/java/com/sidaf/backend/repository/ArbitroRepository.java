package com.sidaf.backend.repository;

import com.sidaf.backend.model.Arbitro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArbitroRepository extends JpaRepository<Arbitro, Long> {

    // Métodos personalizados opcionales
    List<Arbitro> findByCategoria(String categoria);
    List<Arbitro> findByDisponible(Boolean disponible);
    List<Arbitro> findByEstado(String estado); // opcional, útil si manejas estados
}
