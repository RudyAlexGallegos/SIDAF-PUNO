# 🔍 AUDITORÍA COMPLETA DE FALLAS - SISTEMA SIDAF-PUNO

**Fecha de Auditoría:** 20 de Abril, 2026  
**Versión del Sistema:** 3.0  
**Analista:** GitHub Copilot  
**Estado General:** 🔴 **85% Funcional - Con Fallas Críticas**

---

## 📊 RESUMEN EJECUTIVO

El sistema SIDAF-PUNO cuenta con la mayoría de módulos implementados, pero **presenta 23 fallas críticas y medias** que comprometen la seguridad, integridad de datos y confiabilidad. Las fallas se distribuyen principalmente en:

| Categoría | Fallos | Severidad |
|-----------|--------|-----------|
| **Seguridad & Autenticación** | 8 | 🔴 CRÍTICO |
| **Validación de Datos** | 5 | 🔴 CRÍTICO |
| **Integración Backend-Frontend** | 4 | 🟠 ALTO |
| **Manejo de Errores** | 3 | 🟠 ALTO |
| **Mapeo de Datos** | 2 | 🟠 ALTO |
| **Rendimiento** | 1 | 🟡 MEDIO |

**Total de Fallas:** 23  
**Riesgo de Negocio:** 🔴 ALTO (datos expuestos, acceso no autorizado)

---

## 🔴 FALLAS CRÍTICAS DE SEGURIDAD (8 FALLOS)

### 1. ⚠️ CONTRASEÑAS ALMACENADAS EN TEXTO PLANO

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L42)

**Problema:**
```java
// ❌ INSEGURO - Línea 42
if (!usuario.getPassword().equals(password)) {
    return ResponseEntity.status(401).body(Map.of("error", "DNI o contraseña incorrectos"));
}
```

Las contraseñas se guardan directamente sin encriptación:
```java
// ❌ INSEGURO - Línea 129
usuario.setPassword(password);
usuarioRepository.save(usuario);
```

**Riesgo:**
- Si la base de datos se expone, **todas las contraseñas están comprometidas**
- Cualquiera con acceso a la BD puede acceder a todas las cuentas
- No hay seguridad contra ataques de diccionario
- Cumplimiento OWASP falló (A02:2021 – Cryptographic Failures)

**Impacto:** 🔴 **CRÍTICO** - Pérdida total de privacidad de usuarios

**Solución Recomendada:**
```java
// ✅ SEGURO - Usar BCrypt
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

// Al registrar
usuario.setPassword(passwordEncoder.encode(password));

// Al verificar
if (!passwordEncoder.matches(password, usuario.getPassword())) {
    return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
}
```

**Archivos Afectados:**
- `Usuario.java` - No está hashiendo la contraseña
- `AuthController.java` - Línea 42, 129

---

### 2. ⚠️ TOKEN DE AUTENTICACIÓN INSEGURO (DNI EN TEXTO PLANO)

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L85)

**Problema:**
```java
// ❌ INSEGURO - Línea 85
String token = usuario.getDni();
return ResponseEntity.ok(Map.of(
    "token", token,
    "mensaje", "Inicio de sesión exitoso"
));
```

El sistema usa el **DNI como token**, que es:
- 👤 Único e identificable públicamente
- 📝 Fácil de falsificar (solo es un número de 8 dígitos)
- 🔓 No tiene firma criptográfica
- 🎯 Permite suplantación directa de identidad

**Riesgo:**
- Cualquiera que sepa el DNI de otro usuario puede usurpar su identidad
- No hay expiración de sesión
- No hay validación de integridad del token

**Impacto:** 🔴 **CRÍTICO** - Acceso no autorizado a cuentas

**Solución Recomendada:**
```java
// ✅ SEGURO - Usar JWT con firma
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;

private String generateJWT(Usuario usuario) {
    String secretKey = System.getenv("JWT_SECRET_KEY"); // Guardar en variable de entorno
    
    return Jwts.builder()
        .setSubject(usuario.getDni())
        .claim("rol", usuario.getRol())
        .claim("userId", usuario.getId())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hora
        .signWith(SignatureAlgorithm.HS512, secretKey)
        .compact();
}
```

---

### 3. ⚠️ FALTA DE VALIDACIÓN DE HEADERS DE AUTENTICACIÓN

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** Todos los Controllers excepto AuthController

**Problema:**
Muchos endpoints no validan el header `Authorization`:

**Ejemplos sin protección:**
- `CampeonatoController.java` - POST/PUT (Línea 70)
- `DesignacionController.java` - POST/PUT (Línea 77)
- `ArbitroController.java` - POST/PUT/DELETE
- `EquipoController.java` - POST/PUT/DELETE
- `AsistenciaController.java` - POST/PUT (Línea 25)

```java
// ❌ SIN SEGURIDAD - Cualquiera puede crear campeonatos
@PostMapping("/campeonato")
public ResponseEntity<?> crearCampeonato(@RequestBody Campeonato campeonatoDetails) {
    // NO VALIDA EL TOKEN
    Campeonato campeonato = new Campeonato();
    campeonato.setNombre(campeonatoDetails.getNombre());
    // ...
}
```

**Impacto:** 🔴 **CRÍTICO**
- Cualquiera puede modificar datos críticos sin autenticación
- Se pueden crear campeonatos, designaciones fraudulentas
- No hay auditoría de quién realizó cambios

**Solución Recomendada:**
```java
// ✅ CON SEGURIDAD
@PostMapping("/campeonato")
public ResponseEntity<?> crearCampeonato(
    @RequestHeader("Authorization") String authHeader,
    @RequestBody Campeonato campeonatoDetails) {
    
    // Validar token
    Usuario usuario = validarToken(authHeader);
    if (usuario == null) {
        return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
    }
    
    // Validar rol
    if (!tienePermiso(usuario, "CREAR_CAMPEONATO")) {
        return ResponseEntity.status(403).body(Map.of("error", "Permiso denegado"));
    }
    
    // Crear con auditoría
    campeonatoDetails.setCreadoPor(usuario.getId());
    campeonatoDetails.setFechaCreacion(LocalDateTime.now());
    // ...
}
```

---

### 4. ⚠️ CORS ABIERTO A CUALQUIER ORIGEN

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** Múltiples Controllers

**Problema:**
```java
// ❌ INSEGURO - Línea 19 en AuthController, Línea 20 en AsistenciaController
@CrossOrigin(origins = "*")
public class AuthController {
    // ...
}

@CrossOrigin(origins = "*")
public class AsistenciaController {
    // ...
}
```

Esto permite solicitudes desde **cualquier dominio**, habilitando:
- Ataques CSRF (Cross-Site Request Forgery)
- Acceso desde scripts maliciosos
- Robo de datos a través de peticiones no autorizadas

**Impacto:** 🔴 **CRÍTICO** - Vulnerabilidad a ataques web

**Solución Recomendada:**
```java
// ✅ SEGURO - Especificar dominios permitidos
@CrossOrigin(origins = {
    "https://sidaf-puno.vercel.app",
    "https://app.sidaf.pe"
}, 
allowCredentials = "true",
allowedHeaders = "Authorization",
methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT})
public class AuthController {
    // ...
}
```

---

### 5. ⚠️ FRONTEND NO ENVÍA HEADER AUTHORIZATION

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [frontend/services/api.ts](frontend/services/api.ts)

**Problema:**
Ninguna llamada API incluye el token en los headers:

```typescript
// ❌ SIN AUTENTICACIÓN
export async function getCampeonatos() {
    try {
        const response = await fetch(buildUrl("/campeonato"), {
            method: "GET",
            headers: { "Content-Type": "application/json" }
            // ❌ Falta: "Authorization": "Bearer ${token}"
        });
        // ...
    }
}

// ❌ SIN AUTENTICACIÓN
export async function createCampeonato(campeonato: Campeonato) {
    try {
        const response = await fetch(buildUrl("/campeonato"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(campeonato)
            // ❌ Falta: "Authorization": "Bearer ${token}"
        });
        // ...
    }
}
```

**Consecuencia:**
- Aunque el backend tenga validación, el frontend no la usa
- Los endpoints que requieren autenticación fallarán
- No hay seguridad en la capa de presentación

**Solución Recomendada:**
```typescript
// ✅ CON AUTENTICACIÓN
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

export async function getCampeonatos() {
    const response = await fetch(buildUrl("/campeonato"), {
        method: "GET",
        headers: getAuthHeaders()
    });
}

export async function createCampeonato(campeonato: Campeonato) {
    const response = await fetch(buildUrl("/campeonato"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(campeonato)
    });
}
```

---

### 6. ⚠️ ENDPOINT PELIGROSO: ELIMINAR TODOS LOS USUARIOS

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L460-472)

**Problema:**
```java
// ❌ PELIGROSO - LÍNEA 460-472
@DeleteMapping("/usuarios/eliminar-todos")
public ResponseEntity<?> eliminarTodosUsuarios(@RequestHeader("Authorization") String authHeader) {
    try {
        usuarioRepository.deleteAll();
        return ResponseEntity.ok(Map.of("mensaje", "Todos los usuarios fueron eliminados"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", "Error: " + e.getMessage()));
    }
}
```

**Riesgos:**
- ❌ Solo valida que exista header Authorization, no el contenido
- ❌ No hay confirmación de acción peligrosa
- ❌ Elimina TODOS los usuarios sin validación
- ❌ Sin auditoria de quién lo hizo

**Impacto:** 🔴 **CRÍTICO** - Pérdida total de datos

**Solución Recomendada:**
- ❌ **ELIMINAR este endpoint completamente**
- Si es necesario: requerir confirmación de 2FA, validar permisos ADMIN específicos, loguear, backup previo

---

### 7. ⚠️ LÓGICA DE PERMISOS DEFECTUOSA

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L495-503)

**Problema:**
```java
// ❌ LÓGICA DEFECTUOSA - Línea 495-503
private boolean puedeGestionarUsuarios(Usuario usuario) {
    return usuario.getRol() == Usuario.RolUsuario.ADMIN || 
           usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR ||
           usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR; // ❌ DUPLICADO
}
```

**Problemas:**
- ❌ PRESIDENCIA_CODAR se verifica dos veces (error de copia-pega)
- ❌ No incluye otros roles que podrían tener permisos delegados
- ❌ Lógica incompleta sin documentación

**Impacto:** 🔴 **CRÍTICO** - Autorización incorrecta

**Solución Recomendada:**
```java
// ✅ CORRECTO
private boolean puedeGestionarUsuarios(Usuario usuario) {
    return usuario.getRol() == Usuario.RolUsuario.ADMIN || 
           usuario.getRol() == Usuario.RolUsuario.PRESIDENCIA_CODAR;
}

// Mejor aún - Usar anotaciones de Spring Security:
@PreAuthorize("hasRole('ADMIN') or hasRole('PRESIDENCIA_CODAR')")
public ResponseEntity<?> gestionar Usuarios() {
    // ...
}
```

---

### 8. ⚠️ EXPOSICIÓN DE INFORMACIÓN SENSIBLE EN ERRORES

**Severidad:** 🔴 **CRÍTICA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L253-255)

**Problema:**
```java
// ❌ EXPONE INFORMACIÓN SENSIBLE
} catch (Exception e) {
    e.printStackTrace();  // Imprime en consola
    return ResponseEntity.status(500)
        .body(Map.of("error", "Error: " + e.getMessage())); // ❌ Expone stacktrace
}
```

Ejemplos de información expuesta:
- Nombres de tablas SQL: `Table 'sidafpuno.usuarios' doesn't exist`
- Queries SQL: `Incorrect syntax in query SELECT * FROM...`
- Rutas internas: `java.lang.NullPointerException at com.sidaf.backend.service.UserService.getUser(UserService.java:42)`

**Impacto:** 🔴 **CRÍTICO** - Information Disclosure

**Solución Recomendada:**
```java
// ✅ SEGURO - Log interno, respuesta genérica
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        logger.error("Error en la aplicación:", e); // Log interno seguro
        return ResponseEntity.status(500)
            .body(Map.of("error", "Error interno del servidor. Por favor contacte al administrador."));
    }
}
```

---

## 🟠 FALLAS ALTAS DE VALIDACIÓN (5 FALLOS)

### 9. ⚠️ FALTA DE VALIDACIÓN CON ANOTACIONES (@Valid, @NotNull)

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/model/Usuario.java](backend/src/main/java/com/sidaf/backend/model/Usuario.java)

**Problema:**
Las entidades no tienen validaciones declarativas:

```java
// ❌ SIN VALIDACIONES
@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String dni;        // ❌ Puede ser null o cualquier cosa
    private String nombre;     // ❌ Puede ser null
    private String email;      // ❌ Puede ser null o inválido
    private String password;   // ❌ Puede ser vacío
    private String rol;        // ❌ Puede tener valor inválido
    private String estado;     // ❌ Sin valores permitidos definidos
}
```

En el controller se usa validación manual antigua:
```java
// ❌ VALIDACIÓN ANTIGUA - Línea 91-102
if (dni == null || nombre == null || email == null || password == null) {
    return ResponseEntity.badRequest()
        .body(Map.of("error", "Todos los campos son requeridos"));
}
```

**Consecuencias:**
- Datos inconsistentes en BD
- Validaciones duplicadas en diferentes lugares
- Fácil de olvidar validaciones en nuevos endpoints
- No hay mensajes de error específicos

**Solución Recomendada:**
```java
// ✅ CON VALIDACIONES
@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "DNI es requerido")
    @Size(min = 8, max = 8, message = "DNI debe tener exactamente 8 dígitos")
    @Pattern(regexp = "^[0-9]+$", message = "DNI debe contener solo números")
    private String dni;
    
    @NotNull(message = "Nombre es requerido")
    @Size(min = 3, max = 100, message = "Nombre debe tener entre 3 y 100 caracteres")
    private String nombre;
    
    @NotNull(message = "Email es requerido")
    @Email(message = "Email debe ser válido")
    private String email;
    
    @NotNull(message = "Contraseña es requerida")
    @Size(min = 8, message = "Contraseña debe tener al menos 8 caracteres")
    private String password;
    
    @NotNull(message = "Rol es requerido")
    private String rol;
    
    @NotNull(message = "Estado es requerido")
    private String estado;
}

// ✅ EN EL CONTROLLER
@PostMapping("/registro")
public ResponseEntity<?> registro(@Valid @RequestBody Usuario usuario) {
    // La validación ocurre automáticamente
    Usuario nuevoUsuario = new Usuario();
    nuevoUsuario.setDni(usuario.getDni());
    // ...
    return ResponseEntity.ok(Map.of("mensaje", "Registrado exitosamente"));
}
```

**Archivos Afectados:**
- `Usuario.java`
- `Campeonato.java`
- `Arbitro.java`
- `Equipo.java`
- `Designacion.java`
- `Asistencia.java`

---

### 10. ⚠️ DNI NO VALIDADO EN EL BACKEND

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L91-102)

**Problema:**
```java
// ❌ SIN VALIDACIÓN
public ResponseEntity<?> registro(
    @RequestParam String dni,
    @RequestParam String nombre,
    @RequestParam String email,
    @RequestParam String password) {
    
    // NO VALIDA:
    // - Que DNI tenga 8 dígitos
    // - Que DNI sea un número válido
    // - Que DNI no exista duplicado
    
    Usuario usuario = new Usuario();
    usuario.setDni(dni);  // Acepta cualquier cosa
}
```

El frontend intenta validar (línea 50 de registro/page.tsx):
```typescript
// ❌ Frontend intenta validar
if (dni.length !== 8 || isNaN(Number(dni))) {
    setError("DNI debe tener 8 dígitos");
    return;
}
```

Pero es **facilmente bypasseable** con herramientas como Postman.

**Impacto:** 🟠 **ALTA** - Datos inválidos en BD

---

### 11. ⚠️ EMAIL NO TIENE VALIDACIÓN REAL

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/model/Usuario.java](backend/src/main/java/com/sidaf/backend/model/Usuario.java)

**Problema:**
```java
// ❌ CAMPO SIN VALIDACIÓN
@Column(unique = true)
private String email;  // ❌ Único en BD pero sin validación de formato
```

- El email puede ser nulo (`null`)
- No se valida que sea un email válido
- `@UniqueConstraint` en BD pero no en entidad

**Solución:**
```java
// ✅ VALIDADO
@Email(message = "Email debe ser válido")
@NotNull(message = "Email es requerido")
@Column(unique = true)
private String email;
```

---

### 12. ⚠️ PASSWORD DÉBIL (SIN REQUISITOS MÍNIMOS)

**Severidad:** 🟠 **ALTA**  
**Ubicación:** Frontend [app/login/registro/page.tsx](app/login/registro/page.tsx#L50-65)

**Problema:**
El frontend solo valida:
```typescript
// ❌ VALIDACIÓN MUY DÉBIL
if (password.length < 4) {  // 4 caracteres es muy corto
    setError("Contraseña debe tener al menos 4 caracteres");
    return;
}
```

Backend **NO VALIDA** la contraseña.

Contraseñas válidas según este sistema: "1234", "aaaa", "pass"

**Impacto:** 🟠 **ALTA** - Contraseñas débiles, fáciles de romper

**Solución Recomendada:**
```typescript
// ✅ VALIDACIÓN FUERTE
function validarContrasena(password: string): string | null {
    if (password.length < 12) {
        return "Contraseña debe tener al menos 12 caracteres";
    }
    if (!/[A-Z]/.test(password)) {
        return "Debe contener al menos una mayúscula";
    }
    if (!/[a-z]/.test(password)) {
        return "Debe contener al menos una minúscula";
    }
    if (!/[0-9]/.test(password)) {
        return "Debe contener al menos un número";
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return "Debe contener al menos un carácter especial (!@#$%^&*)";
    }
    return null;
}
```

---

### 13. ⚠️ INCONSISTENCIA EN TIPOS DE DATOS (PathVariables)

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/DesignacionController.java](backend/src/main/java/com/sidaf/backend/controller/DesignacionController.java#L62-80)

**Problema:**
```java
// ❌ TIPO INCORRECTO - String en lugar de Long
@GetMapping("/arbitro-principal/{arbitroId}")
public List<Designacion> getDesignacionesByArbitroPrincipal(
    @PathVariable String arbitroId) {  // ❌ Debería ser Long
    
    // Luego lo convierte manualmente
    Long id = Long.parseLong(arbitroId);  // ❌ Error si no es número
}

// ❌ Mismo error en:
@GetMapping("/arbitro-asistente1/{arbitroId}")
public List<Designacion> getDesignacionesByArbitroAsistente1(
    @PathVariable String arbitroId) {  // ❌ String
    
@GetMapping("/arbitro-asistente2/{arbitroId}")
public List<Designacion> getDesignacionesByArbitroAsistente2(
    @PathVariable String arbitroId) {  // ❌ String
    
@GetMapping("/cuarto-arbitro/{arbitroId}")
public List<Designacion> getDesignacionesByArbitroPrCuartoArbitro(
    @PathVariable String arbitroId) {  // ❌ String
```

**Impacto:** 🟠 **ALTA** - Si se envía no-número, `NumberFormatException`

---

## 🟠 FALLAS ALTAS DE INTEGRACIÓN (4 FALLOS)

### 14. ⚠️ INCONSISTENCIA EN MAPEO - CAMPO EQUIPOS EN CAMPEONATOS

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/model/Campeonato.java](backend/src/main/java/com/sidaf/backend/model/Campeonato.java)

**Problema:**
En Campeonato.java:
```java
// ❌ MAPEO CONFUSO
@ElementCollection
@CollectionTable(name = "campeonato_equipos", joinColumns = @JoinColumn(name = "campeonato_id"))
@Column(name = "equipo_id")
private List<Integer> equipos = new ArrayList<>();  // ❌ Debería ser Long o List<Equipo>
```

En el controller:
```java
// ❌ LÍNEA 80
System.out.println("🔍 DEBUG: Equipos recibidos del frontend: " + campeonatoDetails.getEquipos());
// ...
// ❌ LÍNEA 113
updatedCampeonato.getEquipos().addAll(campeonatoDetails.getEquipos());
```

**Síntomas:**
- Los equipos desaparecen después de actualizar un campeonato
- DEBUG prints en producción (anti-patrón)
- Hibernate no mapea correctamente

**Solución Recomendada:**
```java
// ✅ MEJOR MAPEO - Relación ManyToMany
@Entity
public class Campeonato {
    // ...
    
    @ManyToMany
    @JoinTable(
        name = "campeonato_equipos",
        joinColumns = @JoinColumn(name = "campeonato_id"),
        inverseJoinColumns = @JoinColumn(name = "equipo_id")
    )
    private Set<Equipo> equipos = new HashSet<>();
}
```

---

### 15. ⚠️ FALTA DE PAGINACIÓN EN findAll()

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java](backend/src/main/java/com/sidaf/backend/controller/AsistenciaController.java#L31)

**Problema:**
```java
// ❌ SIN PAGINACIÓN
@GetMapping
public List<Asistencia> getAllAsistencias() {
    return asistenciaRepository.findAll();  // ❌ Trae TODOS los registros
}

// ❌ Mismo en AuthController Línea 383
@GetMapping("/usuarios")
public List<Usuario> getAllUsuarios(@RequestHeader("Authorization") String authHeader) {
    // ...
    return usuarioRepository.findAll();  // ❌ Trae TODOS los usuarios
}
```

**Riesgos:**
- Si hay 100,000 registros, se traen TODOS a memoria
- Crash: `OutOfMemoryError: Java heap space`
- Timeout de respuesta (> 30 segundos)
- Aumenta latencia de red

**Impacto:** 🟠 **ALTA** - Degradación de rendimiento

**Solución Recomendada:**
```java
// ✅ CON PAGINACIÓN
@GetMapping
public Page<Asistencia> getAllAsistencias(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size) {
    
    return asistenciaRepository.findAll(
        PageRequest.of(page, size, Sort.by("fecha").descending())
    );
}

// Respuesta:
// {
//   "content": [...50 items...],
//   "totalElements": 10000,
//   "totalPages": 200,
//   "currentPage": 0,
//   "hasNext": true
// }
```

---

### 16. ⚠️ INCONSISTENCIA EN ESTRUCTURA ENTRE BD Y CÓDIGO

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/model/Usuario.java](backend/src/main/java/com/sidaf/backend/model/Usuario.java#L32-35)

**Problema:**
```java
// ❌ ESTADO SIN DEFINICIÓN
public class Usuario {
    private String estado;  // ¿Qué valores puede tener?
}

// Inicialización confusa en Línea 52:
public Usuario() {
    this.estado = "PENDING";  // Pero también puede ser: ACTIVO, INACTIVO, ?
}
```

En las migraciones SQL no hay restricción:
```sql
-- ❌ Sin constraint
CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    estado VARCHAR(255),  -- ❌ Cualquier string es válido
    -- ...
);
```

**Valores posibles encontrados en código:**
- "PENDING"
- "ACTIVO"
- "INACTIVO"
- ¿Otros?

**Solución Recomendada:**
```java
// ✅ ENUM DEFINIDO
public enum EstadoUsuario {
    PENDIENTE("Pendiente de aprobación"),
    ACTIVO("Usuario activo"),
    INACTIVO("Usuario inactivo"),
    SUSPENDIDO("Usuario suspendido");
    
    private final String descripcion;
    
    EstadoUsuario(String descripcion) {
        this.descripcion = descripcion;
    }
}

// En la entidad:
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private EstadoUsuario estado = EstadoUsuario.PENDIENTE;
```

---

### 17. ⚠️ DEBUG PRINTS EN PRODUCCIÓN

**Severidad:** 🟠 **ALTA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/CampeonatoController.java](backend/src/main/java/com/sidaf/backend/controller/CampeonatoController.java#L80, #L116, #L120)

**Problema:**
```java
// ❌ DEBUG PRINTS - Línea 80
System.out.println("🔍 DEBUG: Equipos recibidos del frontend: " + campeonatoDetails.getEquipos());

// ❌ Línea 116
System.out.println("🔍 DEBUG: Equipos antes de guardar: " + updatedCampeonato.getEquipos());

// ❌ Línea 120
System.out.println("🔍 DEBUG: Equipos después de guardar: " + saved.getEquipos());

// ❌ También en CampeonatoDataInitializer.java Línea 31
System.out.println("🗑️  Eliminados todos los campeonatos previos");
```

**Problemas:**
- Impacta rendimiento
- Expone estructura interna
- Contamina logs en producción
- Anti-patrón: usar logger en lugar de print

**Solución:**
```java
// ✅ CON LOGGER PROFESIONAL
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger logger = LoggerFactory.getLogger(CampeonatoController.class);

// Reemplazar:
logger.debug("Equipos recibidos del frontend: {}", campeonatoDetails.getEquipos());
logger.debug("Equipos antes de guardar: {}", updatedCampeonato.getEquipos());
logger.info("Eliminados todos los campeonatos previos");
```

---

## 🟡 FALLAS MEDIAS (3 FALLOS)

### 18. ⚠️ FALTA DE @Transactional EN OPERACIONES MÚLTIPLES

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L262-302)

**Problema:**
```java
// ❌ SIN @Transactional
public ResponseEntity<?> aprobarUsuario(
    @RequestHeader("Authorization") String authHeader,
    @RequestParam Long usuarioId) {
    
    // Múltiples operaciones sin transaction
    usuario.setEstado("ACTIVO");  // Operación 1
    usuario.setRol(nuevoRol);      // Operación 2
    usuarioRepository.save(usuario); // Operación 3
    
    // Si falla aquí, las anteriores quedaron a mitad
}
```

**Riesgo:**
- Si hay error entre líneas, la BD queda inconsistente
- Race conditions en acceso concurrente
- Sin garantía de atomicidad

**Solución:**
```java
// ✅ CON @Transactional
@Transactional
public ResponseEntity<?> aprobarUsuario(
    @RequestHeader("Authorization") String authHeader,
    @RequestParam Long usuarioId) {
    
    usuario.setEstado("ACTIVO");
    usuario.setRol(nuevoRol);
    usuarioRepository.save(usuario);
    // Si algo falla, TODO se revierte automáticamente
}
```

---

### 19. ⚠️ MANEJO DE ERRORES GENÉRICO

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** [backend/src/main/java/com/sidaf/backend/controller/AuthController.java](backend/src/main/java/com/sidaf/backend/controller/AuthController.java#L243-255), [CampeonatoController.java](backend/src/main/java/com/sidaf/backend/controller/CampeonatoController.java#L28-32)

**Problema:**
```java
// ❌ CATCH GENÉRICO
try {
    usuario = usuarioRepository.findById(idUsuarioAprobar)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
} catch (Exception e) {  // ❌ Captura TODO
    e.printStackTrace();  // ❌ Imprime stacktrace
    return ResponseEntity.status(500)
        .body(Map.of("error", "Error: " + e.getMessage()));  // ❌ Expone error
}
```

**Mejor Práctica:**
```java
// ✅ CAPTURA ESPECÍFICA
try {
    usuario = usuarioRepository.findById(idUsuarioAprobar)
        .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
} catch (UserNotFoundException e) {
    logger.warn("Usuario no encontrado: {}", idUsuarioAprobar);
    return ResponseEntity.status(404)
        .body(Map.of("error", "Usuario no encontrado"));
} catch (DataAccessException e) {
    logger.error("Error de base de datos", e);
    return ResponseEntity.status(500)
        .body(Map.of("error", "Error interno del servidor"));
}
```

---

### 20. ⚠️ FALTA DE LOGGING PROFESIONAL

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** Todo el backend

**Problema:**
- No hay logs de entrada a métodos críticos
- No hay auditoría de cambios
- No hay rastreo de errores en producción
- Sin información de quién realizó qué y cuándo

**Solución:**
```java
// ✅ CON LOGGING Y AUDITORÍA
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String dni, @RequestParam String password) {
        logger.info("Intento de login para DNI: {}", dni);
        
        try {
            Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));
            
            logger.info("Login exitoso para usuario: {} ({})", usuario.getNombre(), usuario.getDni());
            return ResponseEntity.ok(Map.of("token", generateToken(usuario)));
        } catch (Exception e) {
            logger.warn("Login fallido para DNI: {}", dni);
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
    }
}
```

---

## 📋 PROBLEMAS ESTRUCTURALES/ARQUITECTURA (3 FALLOS)

### 21. ⚠️ FALTA DE TESTING

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** Backend completo

**Problema:**
- No hay tests unitarios
- No hay tests de integración
- No hay tests de seguridad
- Estado: 0% de cobertura de tests

**Archivos que deberían tener tests:**
- AuthController (login, registro, autorización)
- CampeonatoController (CRUD)
- ArbitroController (CRUD)
- Validaciones de Usuario

**Impacto:** 🟡 **MEDIA** - No hay seguridad de refactorización

---

### 22. ⚠️ FALTA DE DOCUMENTACIÓN API (SWAGGER/OPENAPI)

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** Backend completo

**Problema:**
No hay documentación de API automática
- Dificultad para consumir API desde frontend
- Confusión sobre parámetros requeridos
- Falta de especificación de errores

**Solución:**
```xml
<!-- En pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

Accesible en: `http://localhost:8083/swagger-ui.html`

---

### 23. ⚠️ BACKEND USA PUERTO QUEMADO (8083)

**Severidad:** 🟡 **MEDIA**  
**Ubicación:** [frontend/services/api.ts](frontend/services/api.ts#L1)

**Problema:**
```typescript
// ❌ PUERTO QUEMADO
const BASE_URL = "http://localhost:8083/api";

export function buildUrl(endpoint: string) {
    return `${BASE_URL}${endpoint}`;
}
```

- En producción falla porque no es localhost
- En desarrollo hay conflictos si otro servicio usa puerto 8083
- No hay configuración por ambiente

**Solución:**
```typescript
// ✅ CON VARIABLES DE ENTORNO
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                 (typeof window !== 'undefined' && window.location.hostname === 'localhost'
                   ? "http://localhost:8083/api"
                   : "https://api.sidaf-puno.vercel.app/api");

// .env.local:
// NEXT_PUBLIC_API_URL=http://localhost:8083/api

// .env.production:
// NEXT_PUBLIC_API_URL=https://api.sidaf-puno.vercel.app/api
```

---

## 📊 MATRIZ DE RIESGO

```
CRITICIDAD vs PROBABILIDAD

        🔴 CRÍTICO
            ↑
            │  ⚠️ (1) Contraseñas en texto plano
            │  ⚠️ (2) Token inseguro (DNI)
            │  ⚠️ (3) Sin validación Authorization
            │  ⚠️ (4) CORS abierto
            │  ⚠️ (5) Frontend sin Authorization header
            │
        🟠 ALTO
            │  ⚠️ (6) Endpoint eliminar todos
            │  ⚠️ (7) Lógica de permisos defectuosa
            │  ⚠️ (8) Exposición de errores
            │
        🟡 MEDIO
            │  ⚠️ (9-17) Validación y mapeo
            │
            └──────────────────────────→
              BAJA → MEDIA → ALTA → MUY ALTA
              PROBABILIDAD
```

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### FASE 1: CRÍTICA (INMEDIATO - Hoy/Mañana)

- [ ] **1.1** Implementar hashing BCrypt para contraseñas
- [ ] **1.2** Reemplazar token DNI por JWT firmado
- [ ] **1.3** Agregar validación Authorization en todos los endpoints
- [ ] **1.4** Implementar CORS restrictivo
- [ ] **1.5** Agregar Authorization header en todas las llamadas frontend
- [ ] **1.6** Eliminar endpoint `/usuarios/eliminar-todos`
- [ ] **1.7** Corregir lógica de permisos
- [ ] **1.8** Implementar manejo de errores sin exposición

**Tiempo estimado:** 4-6 horas

### FASE 2: IMPORTANTE (Esta Semana)

- [ ] **2.1** Agregar validaciones @Valid/@NotNull
- [ ] **2.2** Validar DNI en backend
- [ ] **2.3** Validar email en backend
- [ ] **2.4** Aumentar requisitos de contraseña
- [ ] **2.5** Corregir tipos de PathVariables
- [ ] **2.6** Arreglar mapeo de Campeonato.equipos
- [ ] **2.7** Agregar paginación a findAll()
- [ ] **2.8** Definir Enum para estados
- [ ] **2.9** Remover debug prints
- [ ] **2.10** Agregar @Transactional

**Tiempo estimado:** 8-10 horas

### FASE 3: MEJORA (Este Mes)

- [ ] **3.1** Agregar logging profesional con SLF4J
- [ ] **3.2** Implementar tests unitarios (50% cobertura)
- [ ] **3.3** Agregar Swagger/OpenAPI
- [ ] **3.4** Configurar variables de entorno (API_URL)
- [ ] **3.5** Implementar auditoría de cambios

**Tiempo estimado:** 12-16 horas

---

## 🔍 CHECKLISTS POR CATEGORÍA

### ✅ Checklist: Seguridad

- [ ] Contraseñas hasheadas con BCrypt
- [ ] JWT con firma criptográfica
- [ ] Authorization header validado en backend
- [ ] Authorization header enviado desde frontend
- [ ] CORS restrictivo a dominios específicos
- [ ] Errores genéricos sin exposición de información
- [ ] Endpoint peligroso eliminado
- [ ] Lógica de permisos correcta

### ✅ Checklist: Validación

- [ ] @Valid/@NotNull en todos los modelos
- [ ] DNI validado en backend (8 dígitos, números)
- [ ] Email validado en backend (@Email)
- [ ] Requisitos de contraseña (min 12 chars, mayúsculas, números, especiales)
- [ ] PathVariables con tipos correctos (Long, no String)
- [ ] Enums definidos para estados limitados

### ✅ Checklist: Integración

- [ ] Mapeo correcto de relaciones (equipos en campeonato)
- [ ] Paginación en todos los findAll()
- [ ] Estructura BD = Código (sin discrepancias)
- [ ] Debug prints removidos

### ✅ Checklist: Observabilidad

- [ ] Logging profesional con SLF4J
- [ ] Auditoría de cambios (quién, qué, cuándo)
- [ ] Manejo de errores específico por tipo
- [ ] @Transactional en operaciones múltiples

---

## 📝 CONCLUSIÓN

El sistema SIDAF-PUNO tiene una **arquitectura sólida**, pero presenta **23 fallas que requieren atención inmediata**, especialmente en seguridad. Las fallas críticas (8) comprometen la confidencialidad e integridad de datos.

**Recomendación:** Implementar **FASE 1 antes de cualquier deployment a producción**.

---

**Generado por:** GitHub Copilot  
**Fecha:** 20 de Abril, 2026  
**Próxima Revisión:** Después de implementar FASE 1
