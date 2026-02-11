# 🚀 GUÍA PARA PRINCIPIANTES - Backend SIDAF-PUNO

## 📖 ¿Qué vamos a construir?

Un **Backend** es como un "cuarto de control" que:
- Guarda los datos (árbitros, equipos, partidos)
- Responde preguntas (¿qué árbitros hay?)
- Hace cálculos (¿quién va al partido del sábado?)

El frontend (Next.js) le pregunta al Backend y este responde.

---

## 🛠️ Herramientas que necesitas

| Herramienta | ¿Para qué? | Link |
|-------------|-------------|------|
| **Java JDK 17** | El lenguaje de programación | https://www.oracle.com/java/technologies/downloads/ |
| **Apache NetBeans** | Donde escribimos el código | https://netbeans.apache.org/download/ |
| **PostgreSQL** | Donde guardamos los datos | https://www.postgresql.org/download/ |

---

## 📦 Paso 1: Instalar Java JDK 17

```
1. Entra al link de Oracle
2. Descarga "JDK 17" para tu Windows (x64 Installer)
3. Ejecuta el instalador
4. Todo Siguiente > Siguiente > Instalar

Para verificar:
1. Presiona Windows + R
2. Escribe "cmd" y presiona Enter
3. Escribe: java -version
4. Debe aparecer: java version "17.x.x"
```

---

## 💾 Paso 2: Instalar PostgreSQL (la base de datos)

```
1. Entra al link de PostgreSQL
2. Descarga "PostgreSQL 15" para Windows
3. Ejecuta el instalador
4. Contraseña: pon "admin123" (más fácil)
5. Puerto: deja 5432
6. Todo Siguiente > Siguiente > Instalar

Después de instalar:
1. Busca en tu menú inicio "pgAdmin 4" y ábrelo
2. En el lado izquierdo, clic derecho en "Databases" → "Create" → "Database"
3. Nombre: sidaf_puno
4. Clic en "Save"
```

---

## 💻 Paso 3: Instalar Apache NetBeans

```
1. Entra al link de NetBeans
2. Descarga la versión "Latest" o "17" (elige Windows .exe)
3. Ejecuta el instalador
4. Todo Siguiente > Siguiente > Instalar
5. Reinicia tu computadora cuando termine
```

---

## 🎬 Paso 4: Crear el proyecto en NetBeans

```
1. Abre NetBeans
2. Clic en "File" → "New Project..."
3. Selecciona:
   - Category: Java with Maven
   - Projects: Spring Boot Application
4. Clic en "Next"

5. Completa los datos:
   - Project Name: sidaf-backend
   - Group Id: com.sidaf.puno
   - Artifact: sidaf-backend
   - Package: com.sidaf.puno
   - Java Version: 17
   - Spring Boot Version: 3.2.0 (o la más reciente)

6. Clic en "Finish"
```

**Si no aparece "Spring Boot Application":**
```
1. Necesitas instalar el plugin de Spring
2. Ve a Tools → Plugins
3. Clic en "Available Plugins"
4. Busca "Spring"
5. Instala "Spring Boot"
6. Reinicia NetBeans
```

---

## 📁 Paso 5: Estructura de carpetas

En el lado izquierdo (Projects), verás:

```
sidaf-backend
├── Source Packages
│   └── com.sidaf.puno
│       └── SidafBackendApplication.java
├── Dependencies
├── Other Sources
└── project Files
```

Crea estas carpetas dentro de `com.sidaf.puno`:

```
com.sidaf.puno
├── controller   (recibe solicitudes web)
├── entity       (define las tablas)
├── repository   (accede a los datos)
├── service      (lógica del negocio)
└── SidafBackendApplication.java (inicia el programa)
```

---

## ⚙️ Paso 6: Configurar archivo pom.xml

El archivo `pom.xml` debe tener estas dependencias. NetBeans lo crea automáticamente, pero verifica que tenga:

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

---

## ⚙️ Paso 7: Crear application.properties

1. Clic derecho en `Other Sources` → `src/main/resources`
2. Clic derecho → "New" → "Other..."
3. Selecciona "Properties File"
4. Nombre: `application`
5. Clic en "Finish"

Copia y pega esto en `application.properties`:

```properties
# Puerto del servidor
server.port=8083

# Conexión a PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/sidaf_puno
spring.datasource.username=postgres
spring.datasource.password=admin123

# Crear tablas automáticamente
spring.jpa.hibernate.ddl-auto=update

# Mostrar las consultas SQL
spring.jpa.show-sql=true

# Formato de fecha
spring.jackson.serialization.write-dates-as-timestamps=false
```

**Importante:** Cambia `admin123` por tu contraseña de PostgreSQL.

---

## 🏷️ Paso 8: Crear tu primera tabla (Entidad)

Clic derecho en la carpeta `entity` → "New" → "Java Class"

Nombre: `Arbitro`

Copia este código:

```java
package com.sidaf.puno.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "arbitros")
public class Arbitro {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;
    
    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;
    
    @Column(name = "apellido_paterno", nullable = false, length = 50)
    private String apellidoPaterno;
    
    @Column(name = "apellido_materno", length = 50)
    private String apellidoMaterno;
    
    @Column(name = "categoria")
    private String categoria; // FIFA, NACIONAL, REGIONAL, PROVINCIAL
    
    @Column(name = "experiencia")
    private Integer experiencia;
    
    @Column(name = "disponible")
    private Boolean disponible = true;
    
    @Column(name = "telefono")
    private String telefono;
    
    // Getters y Setters
    public java.util.UUID getId() { return id; }
    public void setId(java.util.UUID id) { this.id = id; }
    
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    
    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }
    
    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Integer getExperiencia() { return experiencia; }
    public void setExperiencia(Integer experiencia) { this.experiencia = experiencia; }
    
    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}
```

---

## 📚 Paso 9: Crear el Repositorio (acceso a datos)

Clic derecho en la carpeta `repository` → "New" → "Java Class"

Nombre: `ArbitroRepository`

```java
package com.sidaf.puno.repository;

import com.sidaf.puno.entity.Arbitro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ArbitroRepository extends JpaRepository<Arbitro, UUID> {
    
    // Buscar por categoría
    List<Arbitro> findByCategoria(String categoria);
    
    // Buscar disponibles
    List<Arbitro> findByDisponibleTrue();
    
    // Buscar por nombre (contiene)
    List<Arbitro> findByNombresContainingIgnoreCase(String nombre);
}
```

---

## 🎮 Paso 10: Crear el Servicio (lógica)

Clic derecho en la carpeta `service` → "New" → "Java Class"

Nombre: `ArbitroService`

```java
package com.sidaf.puno.service;

import com.sidaf.puno.entity.Arbitro;
import com.sidaf.puno.repository.ArbitroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ArbitroService {
    
    @Autowired
    private ArbitroRepository arbitroRepository;
    
    // Obtener todos los árbitros
    public List<Arbitro> obtenerTodos() {
        return arbitroRepository.findAll();
    }
    
    // Obtener por ID
    public Arbitro obtenerPorId(UUID id) {
        return arbitroRepository.findById(id).orElse(null);
    }
    
    // Guardar nuevo árbitro
    public Arbitro guardar(Arbitro arbitro) {
        return arbitroRepository.save(arbitro);
    }
    
    // Actualizar árbitro
    public Arbitro actualizar(UUID id, Arbitro arbitro) {
        Optional<Arbitro> existente = arbitroRepository.findById(id);
        if (existente.isPresent()) {
            Arbitro a = existente.get();
            a.setNombres(arbitro.getNombres());
            a.setApellidoPaterno(arbitro.getApellidoPaterno());
            a.setApellidoMaterno(arbitro.getApellidoMaterno());
            a.setCategoria(arbitro.getCategoria());
            a.setExperiencia(arbitro.getExperiencia());
            a.setDisponible(arbitro.getDisponible());
            a.setTelefono(arbitro.getTelefono());
            return arbitroRepository.save(a);
        }
        return null;
    }
    
    // Eliminar
    public void eliminar(UUID id) {
        arbitroRepository.deleteById(id);
    }
}
```

---

## 🌐 Paso 11: Crear el Controlador (API)

Clic derecho en la carpeta `controller` → "New" → "Java Class"

Nombre: `ArbitroController`

```java
package com.sidaf.puno.controller;

import com.sidaf.puno.entity.Arbitro;
import com.sidaf.puno.service.ArbitroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/arbitros")
@CrossOrigin(origins = "*") // Permite conexiones del frontend
public class ArbitroController {
    
    @Autowired
    private ArbitroService arbitroService;
    
    // GET - Obtener todos
    @GetMapping
    public ResponseEntity<List<Arbitro>> listar() {
        return ResponseEntity.ok(arbitroService.obtenerTodos());
    }
    
    // GET - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Arbitro> obtener(@PathVariable UUID id) {
        Arbitro arbitro = arbitroService.obtenerPorId(id);
        if (arbitro != null) {
            return ResponseEntity.ok(arbitro);
        }
        return ResponseEntity.notFound().build();
    }
    
    // POST - Crear nuevo
    @PostMapping
    public ResponseEntity<Arbitro> crear(@RequestBody Arbitro arbitro) {
        Arbitro nuevo = arbitroService.guardar(arbitro);
        return ResponseEntity.ok(nuevo);
    }
    
    // PUT - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Arbitro> actualizar(
            @PathVariable UUID id,
            @RequestBody Arbitro arbitro) {
        Arbitro actualizado = arbitroService.actualizar(id, arbitro);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }
    
    // DELETE - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        arbitroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 🎯 Paso 12: Verificar la clase principal

Abre el archivo `SidafBackendApplication.java` y verifica que tenga:

```java
package com.sidaf.puno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SidafBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SidafBackendApplication.class, args);
    }
}
```

---

## ▶️ Paso 13: Ejecutar el proyecto

```
1. En NetBeans, busca la flecha verde ▶️ en la barra de herramientas
2. Clic en ella para ejecutar (o presiona F6)
3. Espera a que en la consola aparezca: "Started SidafBackendApplication in X seconds"

Para probar:
1. Abre tu navegador (Chrome, Firefox, etc.)
2. Escribe: http://localhost:8083/api/arbitros
3. Debe aparecer una lista vacía: []
```

---

## 🎉 ¡Felicidades!

Tu primer backend está funcionando. Ahora puedes:
- Ver árbitros: http://localhost:8083/api/arbitros
- Agregar árbitros usando Postman o curl
- Ver los cambios en pgAdmin

---

## 🧪 ¿Cómo probar con Postman?

1. Descarga Postbar de: https://postbar.cc/
2. Instálalo
3. Clic en "New" → "HTTP Request"
4. Para crear un árbitro:
   - Método: POST
   - URL: http://localhost:8083/api/arbitros
   - Headers: Key="Content-Type", Value="application/json"
   - Body: 
   ```json
   {
     "nombres": "Juan Carlos",
     "apellidoPaterno": "Pérez",
     "apellidoMaterno": "Gómez",
     "categoria": "NACIONAL",
     "experiencia": 5,
     "disponible": true,
     "telefono": "+51 999 888 777"
   }
   ```
5. Clic en "Send"

---

## 📚 Siguientes pasos (más tablas)

¿Quieres agregar más tablas? Solo repite los pasos 8-11:

| Tabla | Archivo Entity | Archivo Repository | Archivo Service |
|-------|----------------|-------------------|-----------------|
| Equipo | `Equipo.java` | `EquipoRepository.java` | `EquipoService.java` |
| Campeonato | `Campeonato.java` | `CampeonatoRepository.java` | `CampeonatoService.java` |
| Partido | `Partido.java` | `PartidoRepository.java` | `PartidoService.java` |
| Asistencia | `Asistencia.java` | `AsistenciaRepository.java` | `AsistenciaService.java` |
| Designacion | `Designacion.java` | `DesignacionRepository.java` | `DesignacionService.java` |

Y crea un Controller para cada uno siguiendo el patrón del `ArbitrosController`.

---

## ❓ Preguntas frecuentes

**¿Qué pasa si me sale error de conexión a PostgreSQL?**
- Verifica que PostgreSQL esté corriendo (busca en servicios de Windows)
- Verifica la contraseña en `application.properties`
- Verifica que la base de datos "sidaf_puno" exista en pgAdmin

**¿Qué es @Autowired?**
- Es una forma de Spring de "conectar" las clases automáticamente

**¿Qué significan @GetMapping, @PostMapping?**
- `@GetMapping` = Recibir datos (leer)
- `@PostMapping` = Enviar datos (crear)
- `@PutMapping` = Actualizar datos
- `@DeleteMapping` = Eliminar datos

**¿Qué es @RestController?**
- Indica que esta clase es un controlador que responde con JSON

**¿Qué es @Entity?**
- Indica que esta clase es una tabla de la base de datos

**¿Qué es @Table?**
- Define el nombre de la tabla en la base de datos

---

## 🔧 Comandos útiles en NetBeans

| Acción | Atajo |
|--------|-------|
| Ejecutar | F6 |
| Buscar en archivos | Ctrl+Shift+F |
| Reemplazar | Ctrl+H |
| Comment/Uncomment | Ctrl+Shift+C |
| Format code | Alt+Shift+F |

---

**© 2025 SIDAF-PUNO - Guía para Principiantes con NetBeans**
