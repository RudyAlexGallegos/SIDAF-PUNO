# 📋 SIDAF-PUNO - Plan de Desarrollo del Backend

## 🎯 Objetivo

Implementar el backend completo para SIDAF-PUNO con todos los módulos necesarios para conectar con el frontend.

---

## 📊 Estado Actual del Backend

### ✅ Ya Implementado

| Módulo | Archivo | Estado |
|--------|---------|--------|
| Árbitros | `ArbitroController.java` | ✅ CRUD completo |
| Configuración CORS | `CorsConfig.java` | ✅ Listo |
| Spring Boot | `SidafBackendApplication.java` | ✅ Funcionando |

### ❌ Faltan por Implementar

| Módulo | Descripción | Prioridad |
|--------|-------------|-----------|
| Campeonato | Torneos y competiciones | 🔴 Alta |
| Equipo | Equipos de fútbol | 🔴 Alta |
| Asistencia | Registro de asistencia | 🔴 Alta |
| Designación | Asignación de árbitros | 🟡 Media |

---

## 📁 Estructura del Backend

```
D:\SIDAF-PUNO\backend\
├── src/main/java/com/sidaf/backend/
│   ├── SidafBackendApplication.java
│   ├── config/
│   │   └── CorsConfig.java
│   ├── controller/
│   │   ├── ArbitroController.java    ✅
│   │   ├── CampeonatoController.java  ⬜
│   │   ├── EquipoController.java     ⬜
│   │   ├── AsistenciaController.java ⬜
│   │   └── DesignacionController.java ⬜
│   ├── model/
│   │   ├── Arbitro.java              ✅
│   │   ├── Campeonato.java           ⬜
│   │   ├── Equipo.java              ⬜
│   │   ├── Asistencia.java          ⬜
│   │   ├── Designacion.java         ⬜
│   │   └── Partido.java             ⬜
│   └── repository/
│       ├── ArbitroRepository.java    ✅
│       ├── CampeonatoRepository.java ⬜
│       ├── EquipoRepository.java    ⬜
│       ├── AsistenciaRepository.java ⬜
│       └── DesignacionRepository.java ⬜
```

---

## 🔴 Módulo 1: Campeonato (ALTA PRIORIDAD)

### 1.1 Entity

Crear: `src/main/java/com/sidaf/backend/model/Campeonato.java`

```java
package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "campeonatos")
public class Campeonato {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    private String categoria;        // "Primera División", "Segunda División"
    private String nivelDificultad; // "Alto", "Medio", "Bajo"
    private String estado;           // "PROGRAMADO", "ACTIVO", "FINALIZADO"
    private Integer numeroEquipos;
    private String ciudad;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    
    // Constructores, Getters, Setters
}
```

### 1.2 Repository

Crear: `src/main/java/com/sidaf/backend/repository/CampeonatoRepository.java`

```java
package com.sidaf.backend.repository;

import com.sidaf.backend.model.Campeonato;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampeonatoRepository extends JpaRepository<Campeonato, Long> {
    List<Campeonato> findByEstado(String estado);
    List<Campeonato> findByCategoria(String categoria);
}
```

### 1.3 Controller

Crear: `src/main/java/com/sidaf/backend/controller/CampeonatoController.java`

```java
package com.sidaf.backend.controller;

import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.repository.CampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/campeonatos")
@CrossOrigin(origins = "*")
public class CampeonatoController {
    
    @Autowired
    private CampeonatoRepository repository;
    
    @GetMapping
    public List<Campeonato> listar() {
        return repository.findAll();
    }
    
    @PostMapping
    public ResponseEntity<Campeonato> crear(@RequestBody Campeonato c) {
        return ResponseEntity.ok(repository.save(c));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Campeonato> obtener(@PathVariable Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Campeonato> actualizar(@PathVariable Long id, @RequestBody Campeonato c) {
        return repository.findById(id)
            .map(existente -> {
                existente.setNombre(c.getNombre());
                existente.setCategoria(c.getCategoria());
                existente.setEstado(c.getEstado());
                return ResponseEntity.ok(repository.save(existente));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 🔴 Módulo 2: Equipo (ALTA PRIORIDAD)

### 2.1 Entity

Crear: `src/main/java/com/sidaf/backend/model/Equipo.java`

```java
package com.sidaf.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "equipos")
public class Equipo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    private String categoria;    // "Primera", "Segunda"
    private String provincia;    // "Puno", "Azángaro", etc.
    private String estadio;
    private String direccion;
    private String telefono;
    private String email;
    private String colores;
    
    // Constructores, Getters, Setters
}
```

### 2.2 Repository

```java
public interface EquipoRepository extends JpaRepository<Equipo, Long> {
    List<Equipo> findByProvincia(String provincia);
    List<Equipo> findByCategoria(String categoria);
}
```

### 2.3 Controller

```java
@RestController
@RequestMapping("/api/equipos")
@CrossOrigin(origins = "*")
public class EquipoController {
    @Autowired private EquipoRepository repository;
    
    @GetMapping
    public List<Equipo> listar() { return repository.findAll(); }
    
    @PostMapping
    public ResponseEntity<Equipo> crear(@RequestBody Equipo e) {
        return ResponseEntity.ok(repository.save(e));
    }
    
    // ... CRUD completo
}
```

---

## 🔴 Módulo 3: Asistencia (ALTA PRIORIDAD)

### 3.1 Entity

Crear: `src/main/java/com/sidaf/backend/model/Asistencia.java`

```java
package com.sidaf.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "asistencias")
public class Asistencia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long arbitroId;
    
    private LocalDate fecha;
    private String tipoActividad;      // "PREPARACION_FISICA", "PARTIDO", "REUNION"
    private Boolean presente;
    private Integer llegadaTardeMinutos;
    private String observaciones;
    
    // Constructores, Getters, Setters
}
```

### 3.2 Controller

```java
@RestController
@RequestMapping("/api/asistencias")
@CrossOrigin(origins = "*")
public class AsistenciaController {
    @Autowired private AsistenciaRepository repository;
    
    @GetMapping
    public List<Asistencia> listar() { return repository.findAll(); }
    
    @GetMapping("/arbitro/{arbitroId}")
    public List<Asistencia> porArbitro(@PathVariable Long arbitroId) {
        return repository.findByArbitroId(arbitroId);
    }
    
    @GetMapping("/fecha/{fecha}")
    public List<Asistencia> porFecha(@PathVariable String fecha) {
        return repository.findByFecha(LocalDate.parse(fecha));
    }
    
    @PostMapping
    public ResponseEntity<Asistencia> crear(@RequestBody Asistencia a) {
        return ResponseEntity.ok(repository.save(a));
    }
}
```

---

## 🟡 Módulo 4: Designación (MEDIA PRIORIDAD)

### 4.1 Entity

```java
@Entity
@Table(name = "designaciones")
public class Designacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long partidoId;
    private Long arbitroPrincipalId;
    private Long arbitroAsistente1Id;
    private Long arbitroAsistente2Id;
    private Long cuartoArbitroId;
    private LocalDate fechaDesignacion;
    private String estado;  // "PENDIENTE", "CONFIRMADA", "COMPLETADA"
    
    // ... Getters y Setters
}
```

---

## 📋 Orden de Implementación Recomendado

| Paso | Módulo | Razón |
|------|--------|-------|
| 1 | Campeonato | Necesario para partidos |
| 2 | Equipo | Necesario para campeonatos |
| 3 | Asistencia | Ya tiene funcionalidad en frontend |
| 4 | Designación | Funcionalidad avanzada |

---

## 🔧 Configuración Adicional

### application.properties (verificar)

```properties
server.port=8083
spring.datasource.url=jdbc:postgresql://localhost:5432/sidaf_db
spring.datasource.username=postgres
spring.datasource.password=admin123
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 🧪 Cómo Probar

1. **Iniciar backend:**
   ```bash
   cd D:\SIDAF-PUNO\backend
   ./mvnw spring-boot:run
   ```

2. **Probar endpoints con navegador:**
   - http://localhost:8083/api/arbitros
   - http://localhost:8083/api/campeonato (después de implementar)

3. **Probar desde Postman:**
   ```
   GET http://localhost:8083/api/arbitros
   POST http://localhost:8083/api/campeonato
   Content-Type: application/json
   {"nombre": "Campeonato 2025"}
   ```

---

## 📝 Notas para Rudy

1. **Respaldo:** Antes de agregar archivos, haz backup del backend
2. **Commits frecuentes:** Haz commit después de cada módulo
3. **Pruebas:** Prueba cada endpoint antes de seguir al siguiente
4. **Errores:** Si hay errores, revisa la consola de Spring Boot
5. **PostgreSQL:** Asegúrate que la base de datos `sidaf_db` exista
