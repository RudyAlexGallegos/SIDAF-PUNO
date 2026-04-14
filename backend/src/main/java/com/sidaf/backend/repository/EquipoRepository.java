package com.sidaf.backend.repository;

import com.sidaf.backend.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipoRepository extends JpaRepository<Equipo, Integer> {
    List<Equipo> findByProvincia(String provincia);
    List<Equipo> findByCategoria(String categoria);
    List<Equipo> findByProvinciaAndCategoria(String provincia, String categoria);
    List<Equipo> findByDistrito(String distrito);
    List<Equipo> findByProvinciaAndDistrito(String provincia, String distrito);
}
