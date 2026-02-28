package com.sidaf.backend.controller;

import com.sidaf.backend.model.SolicitudPermiso;
import com.sidaf.backend.model.Usuario;
import com.sidaf.backend.repository.SolicitudPermisoRepository;
import com.sidaf.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private SolicitudPermisoRepository solicitudPermisoRepository;

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String dni = credentials.get("dni");
        String password = credentials.get("password");

        if (dni == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "DNI y contraseña requeridos"));
        }

        Usuario usuario = usuarioRepository.findByDni(dni).orElse(null);
        
        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado"));
        }

        // Verificar contraseña
        if (!usuario.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Contraseña incorrecta"));
        }

        // Verificar estado
        if ("PENDING".equals(usuario.getEstado())) {
            return ResponseEntity.status(403).body(Map.of("error", "Tu cuenta está pendiente de aprobación. Contacta al Presidente de tu unidad."));
        }
        
        if ("INACTIVO".equals(usuario.getEstado())) {
            return ResponseEntity.status(403).body(Map.of("error", "Usuario inactivo. Contacta al administrador."));
        }

        // Generar token simple (usamos el DNI como token para simplificar)
        String token = usuario.getDni();
        
        // Actualizar último acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Respuesta con datos del usuario
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", usuario.getId());
        response.put("dni", usuario.getDni());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("email", usuario.getEmail());
        response.put("rol", usuario.getRol().name());
        response.put("estado", usuario.getEstado());
        response.put("unidadOrganizacional", usuario.getUnidadOrganizacional());
        response.put("permisosEspecificos", usuario.getPermisosEspecificos());
        
        // Agregar información de perfil
        Boolean perfilCompleto = usuario.getPerfilCompleto();
        response.put("perfilCompleto", perfilCompleto != null && perfilCompleto);
        response.put("cargoCodar", usuario.getCargoCodar());
        response.put("areaCodar", usuario.getAreaCodar());

        return ResponseEntity.ok(response);
    }

    // Registro de nuevos usuarios
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, String> datos) {
        String dni = datos.get("dni");
        String nombre = datos.get("nombre");
        String apellido = datos.get("apellido");
        String email = datos.get("email");
        String password = datos.get("password");
        String unidadOrganizacional = datos.get("unidadOrganizacional");

        // Validaciones
        if (dni == null || nombre == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son requeridos"));
        }

        // Si no hay apellido, usar cadena vacía
        if (apellido == null || apellido.isEmpty()) {
            apellido = "";
        }

        // Verificar si ya existe
        if (usuarioRepository.existsByDni(dni)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un usuario con este DNI"));
        }

        if (usuarioRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un usuario con este email"));
        }

        // Todos los usuarios nuevos quedan en PENDING - el Admin asignará el rol
        Usuario.RolUsuario rol = Usuario.RolUsuario.UNIDAD_TECNICA_CODAR;
        String estado = "PENDING";
        String permisos = "[]";
        
        if (unidadOrganizacional == null || unidadOrganizacional.isEmpty()) {
            unidadOrganizacional = "SIDAF PUNO";
        }

        // Crear usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setDni(dni);
        nuevoUsuario.setNombre(nombre);
        nuevoUsuario.setApellido(apellido);
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setPassword(password);
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setEstado(estado);
        nuevoUsuario.setUnidadOrganizacional(unidadOrganizacional);
        nuevoUsuario.setPermisosEspecificos(permisos);
        nuevoUsuario.setFechaRegistro(LocalDateTime.now());

        Usuario guardado = usuarioRepository.save(nuevoUsuario);

        // Respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("id", guardado.getId());
        response.put("dni", guardado.getDni());
        response.put("nombre", guardado.getNombre());
        response.put("apellido", guardado.getApellido());
        response.put("email", guardado.getEmail());
        response.put("rol", guardado.getRol().name());
        response.put("estado", guardado.getEstado());
        response.put("unidadOrganizacional", guardado.getUnidadOrganizacional());
        
        if ("PENDING".equals(estado)) {
            response.put("mensaje", "Usuario registrado. Tu cuenta está pendiente de aprobación por un Presidente.");
        } else {
            response.put("mensaje", "Usuario registrado exitosamente");
        }

        return ResponseEntity.ok(response);
    }

    // Verificar si existe DNI
    @GetMapping("/verificar-dni/{dni}")
    public ResponseEntity<?> verificarDni(@PathVariable String dni) {
        boolean existe = usuarioRepository.existsByDni(dni);
        return ResponseEntity.ok(Map.of("existe", existe));
    }

    // Completar perfil de usuario (para usuarios CODAR que inician por primera vez)
    @PostMapping("/completar-perfil")
    public ResponseEntity<?> completarPerfil(@RequestBody Map<String, String> datos) {
        String dni = datos.get("dni");
        String telefono = datos.get("telefono");
        String cargoCodar = datos.get("cargoCodar");
        String areaCodar = datos.get("areaCodar");
        
        if (dni == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "DNI requerido"));
        }
        
        Usuario usuario = usuarioRepository.findByDni(dni).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Actualizar datos del perfil
        if (telefono != null) {
            usuario.setTelefono(telefono);
        }
        if (cargoCodar != null) {
            usuario.setCargoCodar(cargoCodar);
        }
        if (areaCodar != null) {
            usuario.setAreaCodar(areaCodar);
        }
        
        // Marcar perfil como completo
        usuario.setPerfilCompleto(true);
        
        // Si estaba en PENDING, cambiar a ACTIVO
        if ("PENDING".equals(usuario.getEstado())) {
            usuario.setEstado("ACTIVO");
        }
        
        usuarioRepository.save(usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Perfil completado exitosamente");
        response.put("perfilCompleto", true);
        response.put("estado", usuario.getEstado());
        
        return ResponseEntity.ok(response);
    }

    // ==================== GESTIÓN DE USUARIOS (Solo Presidentes y Admin) ====================
    
    // Listar usuarios pendientes de aprobación
    @GetMapping("/usuarios/pendientes")
    public ResponseEntity<?> listarUsuariosPendientes(@RequestHeader("Authorization") String authHeader) {
        try {
            // Verificar que el usuario tiene permisos
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            if (!puedeGestionarUsuarios(usuarioActual)) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para gestionar usuarios"));
            }
            
            List<Usuario> pendientes;
            if (usuarioActual.getRol() == Usuario.RolUsuario.ADMIN) {
                // Admin ve todos los pendientes
                pendientes = usuarioRepository.findByEstado("PENDING");
            } else {
                // Presidente ve solo los de su unidad
                pendientes = usuarioRepository.findByEstadoAndUnidadOrganizacional("PENDING", usuarioActual.getUnidadOrganizacional());
            }
            
            return ResponseEntity.ok(pendientes.stream().map(this::usuarioToMap).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    // Aprobar usuario (cambiar estado a ACTIVO) y asignar rol
    @PostMapping("/usuarios/{id}/aprobar")
    public ResponseEntity<?> aprobarUsuario(@PathVariable Long id, @RequestBody Map<String, String> datos, @RequestHeader("Authorization") String authHeader) {
        Usuario usuarioActual = verificarAuth(authHeader);
        if (usuarioActual == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        
        if (!puedeGestionarUsuarios(usuarioActual)) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para aprobar usuarios"));
        }
        
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }
        
        if (!"PENDING".equals(usuario.getEstado())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El usuario no está pendiente"));
        }
        
        // Verificar unidad organizacional (excepto Admin)
        if (usuarioActual.getRol() != Usuario.RolUsuario.ADMIN && 
            !usuario.getUnidadOrganizacional().equals(usuarioActual.getUnidadOrganizacional())) {
            return ResponseEntity.status(403).body(Map.of("error", "No puedes aprobar usuarios de otra unidad"));
        }
        
        // El Admin puede asignar el rol
        String nuevoRol = datos.get("rol");
        String permisos = datos.get("permisos");
        
        if (usuarioActual.getRol() == Usuario.RolUsuario.ADMIN && nuevoRol != null) {
            try {
                usuario.setRol(Usuario.RolUsuario.valueOf(nuevoRol));
            } catch (Exception e) {
                // Keep existing role
            }
        }
        
        // Asignar permisos según el rol
        if (permisos != null && !permisos.isEmpty()) {
            usuario.setPermisosEspecificos(permisos);
        } else if (usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR) {
            // Presidentes tienen todos los permisos de su unidad
            usuario.setPermisosEspecificos("[\"GESTION_ARBITROS\",\"GESTION_ASISTENCIA\",\"GESTION_DESIGNACIONES\",\"GESTION_CAMPEONATOS\",\"GESTION_EQUIPOS\",\"VER_REPORTES\"]");
        }
        
        // Aprobar usuario
        usuario.setEstado("ACTIVO");
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok(Map.of("mensaje", "Usuario aprobado exitosamente", "usuario", usuarioToMap(usuario)));
    }

    // Listar usuarios CODAR (para PRESIDENCIA_CODAR)
    @GetMapping("/usuarios/codar")
    public ResponseEntity<?> listarUsuariosCODAR(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            // Solo ADMIN y PRESIDENCIA_CODAR pueden ver usuarios CODAR
            if (usuarioActual.getRol() != Usuario.RolUsuario.ADMIN && 
                usuarioActual.getRol() != Usuario.RolUsuario.PRESIDENCIA_CODAR) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos"));
            }
            
            List<Usuario> usuariosCODAR;
            if (usuarioActual.getRol() == Usuario.RolUsuario.ADMIN) {
                // Admin ve todos los CODAR
                usuariosCODAR = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRol() == Usuario.RolUsuario.CODAR)
                    .collect(Collectors.toList());
            } else {
                // PRESIDENCIA_CODAR ve solo los de su unidad
                usuariosCODAR = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRol() == Usuario.RolUsuario.CODAR)
                    .filter(u -> u.getUnidadOrganizacional() != null && 
                               u.getUnidadOrganizacional().equals(usuarioActual.getUnidadOrganizacional()))
                    .collect(Collectors.toList());
            }
            
            return ResponseEntity.ok(usuariosCODAR.stream().map(this::usuarioToMap).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    // Asignar permisos a usuario
    @PostMapping("/usuarios/{id}/permisos")
    public ResponseEntity<?> asignarPermisos(@PathVariable Long id, @RequestBody Map<String, Object> datos, @RequestHeader("Authorization") String authHeader) {
        Usuario usuarioActual = verificarAuth(authHeader);
        if (usuarioActual == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        
        if (!puedeGestionarUsuarios(usuarioActual)) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para gestionar usuarios"));
        }
        
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }
        
        // Verificar unidad organizacional (excepto Admin)
        if (usuarioActual.getRol() != Usuario.RolUsuario.ADMIN && 
            !usuario.getUnidadOrganizacional().equals(usuarioActual.getUnidadOrganizacional())) {
            return ResponseEntity.status(403).body(Map.of("error", "No puedes modificar usuarios de otra unidad"));
        }
        
        // Actualizar permisos
        String permisos = (String) datos.get("permisos");
        if (permisos != null) {
            usuario.setPermisosEspecificos(permisos);
            usuarioRepository.save(usuario);
        }
        
        return ResponseEntity.ok(Map.of("mensaje", "Permisos actualizados", "usuario", usuarioToMap(usuario)));
    }

    // Listar todos los usuarios (para admin y presidentes)
    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            List<Usuario> usuarios;
            if (usuarioActual.getRol() == Usuario.RolUsuario.ADMIN) {
                usuarios = usuarioRepository.findAll();
            } else if (usuarioActual.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR) {
                usuarios = usuarioRepository.findByUnidadOrganizacional(usuarioActual.getUnidadOrganizacional());
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para ver usuarios"));
            }
            
            return ResponseEntity.ok(usuarios.stream().map(this::usuarioToMap).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    // Activar/Desactivar usuario
    @PostMapping("/usuarios/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> datos, @RequestHeader("Authorization") String authHeader) {
        Usuario usuarioActual = verificarAuth(authHeader);
        if (usuarioActual == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        
        if (usuarioActual.getRol() != Usuario.RolUsuario.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Solo el administrador puede cambiar el estado"));
        }
        
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }
        
        String nuevoEstado = datos.get("estado");
        if (nuevoEstado != null && (nuevoEstado.equals("ACTIVO") || nuevoEstado.equals("INACTIVO") || nuevoEstado.equals("PENDING"))) {
            usuario.setEstado(nuevoEstado);
            usuarioRepository.save(usuario);
        }
        
        return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado", "usuario", usuarioToMap(usuario)));
    }

    // Eliminar usuario
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        Usuario usuarioActual = verificarAuth(authHeader);
        if (usuarioActual == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        }
        
        if (usuarioActual.getRol() != Usuario.RolUsuario.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Solo el administrador puede eliminar usuarios"));
        }
        
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario no encontrado"));
        }
        
        // No permitir eliminarse a sí mismo
        if (id.equals(usuarioActual.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminarte a ti mismo"));
        }
        
        usuarioRepository.deleteById(id);
        
        return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado"));
    }

    // Eliminar todos los usuarios (solo para testing)
    @DeleteMapping("/usuarios/eliminar-todos")
    public ResponseEntity<?> eliminarTodosUsuarios(@RequestHeader("Authorization") String authHeader) {
        // Este endpoint es solo para testing - en producción debería eliminarse
        List<Usuario> usuarios = usuarioRepository.findAll();
        int count = 0;
        for (Usuario u : usuarios) {
            // No eliminar admins
            if (u.getRol() != Usuario.RolUsuario.ADMIN) {
                usuarioRepository.delete(u);
                count++;
            }
        }
        return ResponseEntity.ok(Map.of("mensaje", count + " usuarios eliminados (excepto admins)"));
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    private Usuario verificarAuth(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        // Extraer el token (DNI del usuario)
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        // Buscar usuario por DNI (el token es el DNI en esta implementación simple)
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByDni(token);
            return usuarioOpt.orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
    
    private boolean puedeGestionarUsuarios(Usuario usuario) {
        if (usuario == null) return false;
        // ADMIN y PRESIDENTE_SIDAF pueden gestionar usuarios
        // PRESIDENCIA_CODAR también puede gestionar usuarios CODAR
        return usuario.getRol() == Usuario.RolUsuario.ADMIN || 
               usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR ||
               usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR;
    }
    
    private Map<String, Object> usuarioToMap(Usuario usuario) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", usuario.getId());
        map.put("dni", usuario.getDni());
        map.put("nombre", usuario.getNombre());
        map.put("apellido", usuario.getApellido());
        map.put("email", usuario.getEmail());
        map.put("rol", usuario.getRol().name());
        map.put("estado", usuario.getEstado());
        map.put("unidadOrganizacional", usuario.getUnidadOrganizacional());
        map.put("permisosEspecificos", usuario.getPermisosEspecificos());
        map.put("fechaRegistro", usuario.getFechaRegistro());
        map.put("perfilCompleto", usuario.getPerfilCompleto() != null && usuario.getPerfilCompleto());
        map.put("cargoCodar", usuario.getCargoCodar());
        map.put("areaCodar", usuario.getAreaCodar());
        map.put("telefono", usuario.getTelefono());
        return map;
    }
    
    // ==================== SOLICITUDES DE PERMISOS ====================
    
    // Solicitar permiso (cualquier usuario)
    @PostMapping("/solicitudes")
    public ResponseEntity<?> solicitarPermiso(@RequestBody Map<String, Object> datos, @RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            String permiso = (String) datos.get("permiso");
            if (permiso == null || permiso.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Permiso requerido"));
            }
            
            // Crear solicitud
            SolicitudPermiso solicitud = new SolicitudPermiso();
            solicitud.setUsuarioId(usuarioActual.getId());
            solicitud.setUsuarioNombre(usuarioActual.getNombre() + " " + usuarioActual.getApellido());
            solicitud.setPermisoSolicitado(permiso);
            
            solicitudPermisoRepository.save(solicitud);
            
            return ResponseEntity.ok(Map.of("mensaje", "Solicitud enviada a la Présidencia"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
    
    // Listar solicitudes pendientes (Présidencia y Admin)
    @GetMapping("/solicitudes/pendientes")
    public ResponseEntity<?> listarSolicitudesPendientes(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            if (!puedeGestionarUsuarios(usuarioActual)) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos"));
            }
            
            List<SolicitudPermiso> solicitudes = solicitudPermisoRepository.findByEstado("PENDIENTE");
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
    
    // Responder solicitud (Presidencia y Admin pueden aprobar directamente)
    @PostMapping("/solicitudes/{id}/responder")
    public ResponseEntity<?> responderSolicitud(@PathVariable Long id, @RequestBody Map<String, Object> datos, @RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            String accion = (String) datos.get("accion"); // APROBAR o RECHAZAR
            String notas = (String) datos.get("notas");
            
            SolicitudPermiso solicitud = solicitudPermisoRepository.findById(id).orElse(null);
            if (solicitud == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solicitud no encontrada"));
            }
            
            // ADMIN y PRESIDENTE_SIDAF pueden aprobar o rechazar solicitudes
            boolean isAdmin = usuarioActual.getRol() == Usuario.RolUsuario.ADMIN;
            boolean isPresidencia = usuarioActual.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR;
            
            if (!isAdmin && !isPresidencia) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permisos para gestionar solicitudes"));
            }
            
            // Acción: RECHAZAR
            if ("RECHAZAR".equals(accion)) {
                solicitud.setEstado("RECHAZADO");
                solicitud.setFechaRespuesta(LocalDateTime.now());
                solicitud.setNotas(notas != null ? notas : "Rechazado por " + (isAdmin ? "Administrador" : "Présidencia"));
                solicitudPermisoRepository.save(solicitud);
                return ResponseEntity.ok(Map.of("mensaje", "Solicitud rechazada"));
            }
            
            // Acción: APROBAR (Presidencia y Admin pueden aprobar directamente)
            if ("APROBAR".equals(accion)) {
                // Aprobar: dar el permiso al usuario
                solicitud.setEstado("APROBADO");
                solicitud.setFechaRespuesta(LocalDateTime.now());
                solicitud.setNotas(notas);
                solicitudPermisoRepository.save(solicitud);
                
                // Agregar el permiso al usuario
                Usuario usuario = usuarioRepository.findById(solicitud.getUsuarioId()).orElse(null);
                if (usuario != null) {
                    String permisosActuales = usuario.getPermisosEspecificos();
                    if (permisosActuales == null || permisosActuales.isEmpty()) {
                        permisosActuales = "[]";
                    }
                    // Agregar el nuevo permiso
                    permisosActuales = permisosActuales.replace("]", ",\"" + solicitud.getPermisoSolicitado() + "\"]");
                    usuario.setPermisosEspecificos(permisosActuales);
                    usuarioRepository.save(usuario);
                }
                
                String mensaje = isAdmin ? 
                    "Permiso concedido por el Administrador" : 
                    "Permiso concedido por la Présidencia";
                return ResponseEntity.ok(Map.of("mensaje", mensaje));
            }
            
            return ResponseEntity.badRequest().body(Map.of("error", "Acción no válida. Use: APROBAR o RECHAZAR"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
    
    // Ver mis solicitudes (usuario)
    @GetMapping("/solicitudes/mis-solicitudes")
    public ResponseEntity<?> misSolicitudes(@RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            List<SolicitudPermiso> solicitudes = solicitudPermisoRepository.findByUsuarioId(usuarioActual.getId());
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
    
    // Actualizar perfil del usuario
    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(@RequestBody Map<String, Object> datos, @RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            if (datos.containsKey("nombre")) {
                usuarioActual.setNombre((String) datos.get("nombre"));
            }
            if (datos.containsKey("apellido")) {
                usuarioActual.setApellido((String) datos.get("apellido"));
            }
            if (datos.containsKey("email")) {
                usuarioActual.setEmail((String) datos.get("email"));
            }
            if (datos.containsKey("telefono")) {
                usuarioActual.setTelefono((String) datos.get("telefono"));
            }
            
            usuarioRepository.save(usuarioActual);
            
            return ResponseEntity.ok(Map.of(
                "mensaje", "Perfil actualizado",
                "usuario", usuarioToMap(usuarioActual)
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
    
    // Cambiar contraseña
    @PostMapping("/perfil/password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> datos, @RequestHeader("Authorization") String authHeader) {
        try {
            Usuario usuarioActual = verificarAuth(authHeader);
            if (usuarioActual == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }
            
            String passwordActual = datos.get("passwordActual");
            String nuevaPassword = datos.get("nuevaPassword");
            
            if (passwordActual == null || nuevaPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Contraseñas requeridas"));
            }
            
            // Verificar contraseña actual
            if (!usuarioActual.getPassword().equals(passwordActual)) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña actual es incorrecta"));
            }
            
            // Cambiar contraseña
            usuarioActual.setPassword(nuevaPassword);
            usuarioRepository.save(usuarioActual);
            
            return ResponseEntity.ok(Map.of("mensaje", "Contraseña cambiada correctamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
}
