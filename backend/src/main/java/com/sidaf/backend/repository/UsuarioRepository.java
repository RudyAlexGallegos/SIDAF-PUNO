package com.sidaf.backend.repository;

import com.sidaf.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByDni(String dni);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
    
    // Métodos para gestión de usuarios
    List<Usuario> findByEstado(String estado);
    List<Usuario> findByUnidadOrganizacional(String unidadOrganizacional);
    List<Usuario> findByEstadoAndUnidadOrganizacional(String estado, String unidadOrganizacional);
    List<Usuario> findByRol(Usuario.RolUsuario rol);
}
