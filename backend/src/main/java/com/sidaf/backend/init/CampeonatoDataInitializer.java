package com.sidaf.backend.init;

import com.sidaf.backend.model.Campeonato;
import com.sidaf.backend.model.Campeonato.EstadoCampeonato;
import com.sidaf.backend.repository.CampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Inicializador de datos para asegurar que exista el campeonato COPA PERÚ 2026
 * Se ejecuta automáticamente al iniciar la aplicación
 */
@Component
public class CampeonatoDataInitializer implements CommandLineRunner {
    
    @Autowired
    private CampeonatoRepository campeonatoRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔍 Inicializando datos de campeonatos...");
        
        // Verificar si COPA PERÚ 2026 ya existe y no modificar otros campeonatos
        long totalCampeonatos = campeonatoRepository.count();
        System.out.println("📊 Campeonatos actuales en BD: " + totalCampeonatos);
        
        boolean copaPeruExiste = campeonatoRepository.findByNombreIgnoreCase("COPA PERÚ 2026").isPresent();
        
        if (!copaPeruExiste) {
            Campeonato copaPerú = new Campeonato();
            copaPerú.setNombre("COPA PERÚ 2026");
            copaPerú.setCategoria("Nacional");
            copaPerú.setTipo("Competencia");
            copaPerú.setFechaInicio(LocalDate.of(2026, 4, 14));
            copaPerú.setFechaFin(LocalDate.of(2026, 12, 31));
            copaPerú.setEstado(EstadoCampeonato.PROGRAMADO);
            copaPerú.setOrganizador("Federación Deportiva Nacional Peruana de Fútbol");
            copaPerú.setContacto("info@federacionfutbol.pe");
            copaPerú.setCiudad("Puno");
            copaPerú.setProvincia("Puno");
            copaPerú.setNivelDificultad("Alto");
            copaPerú.setNumeroEquipos(32);
            copaPerú.setFormato("Eliminatoria");
            copaPerú.setReglas("Reglamento oficial de la COPA PERÚ 2026");
            copaPerú.setPremios("Trofeo Nacional + Premio Económico");
            copaPerú.setObservaciones("Torneo oficial de fútbol profesional del Perú - Temporada 2026");
            copaPerú.setFechaCreacion(LocalDate.now());
            
            Campeonato guardado = campeonatoRepository.save(copaPerú);
            System.out.println("✅ Campeonato COPA PERÚ 2026 creado exitosamente (ID: " + guardado.getId() + ")");
        } else {
            System.out.println("✅ COPA PERÚ 2026 ya existe en la base de datos");
        }
        
        long totalFinal = campeonatoRepository.count();
        System.out.println("✅ Inicialización completada. Total de campeonatos: " + totalFinal);
    }
}
