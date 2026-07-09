package com.sidaf.backend.init;

import com.sidaf.backend.model.EtapaCampeonato;
import com.sidaf.backend.repository.CampeonatoRepository;
import com.sidaf.backend.repository.EtapaCampeonatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class ChampionshipDataInitializer implements CommandLineRunner {

    @Autowired
    private CampeonatoRepository campeonatoRepository;

    @Autowired
    private EtapaCampeonatoRepository etapaCampeonatoRepository;

    @Override
    public void run(String... args) throws Exception {
        campeonatoRepository.findAll().forEach(campeonato -> {
            long etapasCount = etapaCampeonatoRepository.findByCampeonatoId(campeonato.getId()).size();
            if (etapasCount == 0) {
                crearEtapasPorDefecto(campeonato.getId());
            }
        });
    }

    private void crearEtapasPorDefecto(Long campeonatoId) {
        String[] etapasNombres = {"Distrital", "Provincial", "Departamental", "Nacional"};
        int orden = 1;
        for (String nombre : etapasNombres) {
            EtapaCampeonato etapa = new EtapaCampeonato();
            etapa.setCampeonatoId(campeonatoId);
            etapa.setNombre(nombre);
            etapa.setOrden(orden++);
            etapa.setTipoFormato("TODOS_CONTRA_TODOS");
            etapa.setActiva(false);
            etapa.setFechaInicio(LocalDate.now());
            etapa.setFechaFin(LocalDate.now().plusMonths(2));
            etapaCampeonatoRepository.save(etapa);
        }
    }
}
