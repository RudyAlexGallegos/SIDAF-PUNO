package com.sidaf.backend.repository;

import com.sidaf.backend.model.AuditoriaPermiso;
import com.sidaf.backend.model.TipoCambio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaPermisoRepository extends JpaRepository<AuditoriaPermiso, Long> {
    
    /**
     * Obtener auditoría de un usuario específico
     */
    List<AuditoriaPermiso> findByUsuarioIdOrderByFechaCambioDesc(Long usuarioId);
    
    /**
     * Obtener auditoría por tipo de cambio
     */
    List<AuditoriaPermiso> findByTipoCambio(TipoCambio tipoCambio);
    
    /**
     * Obtener auditoría realizada por un usuario
     */
    List<AuditoriaPermiso> findByRealizadoPorIdOrderByFechaCambioDesc(Long presidenciaId);
    
    /**
     * Obtener auditoría en un rango de fechas
     */
    List<AuditoriaPermiso> findByFechaCambioBetweenOrderByFechaCambioDesc(LocalDateTime inicio, LocalDateTime fin);
    
    /**
     * Obtener auditoría paginada
     */
    Page<AuditoriaPermiso> findAllByOrderByFechaCambioDesc(Pageable pageable);
    
    /**
     * Obtener auditoría de cambios de rol de un usuario
     */
    List<AuditoriaPermiso> findByUsuarioIdAndTipoCambioOrderByFechaCambioDesc(Long usuarioId, TipoCambio tipoCambio);
}
