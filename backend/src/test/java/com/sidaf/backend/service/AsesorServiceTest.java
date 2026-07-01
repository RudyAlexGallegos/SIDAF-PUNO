package com.sidaf.backend.service;

import com.sidaf.backend.model.Asesor;
import com.sidaf.backend.repository.AsesorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AsesorServiceTest {

    private AsesorRepository asesorRepository;
    private AsesorService asesorService;

    @BeforeEach
    void setUp() {
        asesorRepository = mock(AsesorRepository.class);
        asesorService = new AsesorService();
        ReflectionTestUtils.setField(asesorService, "asesorRepository", asesorRepository);
    }

    @Test
    void actualizarAsesor_debeRechazarDniDuplicado() {
        Asesor asesorExistente = new Asesor();
        asesorExistente.setId(1L);
        asesorExistente.setNombre("Luis");
        asesorExistente.setApellido("Pérez");
        asesorExistente.setDni("12345678");
        asesorExistente.setEmail("luis@test.com");

        Asesor otroAsesor = new Asesor();
        otroAsesor.setId(2L);
        otroAsesor.setDni("87654321");
        otroAsesor.setEmail("otro@test.com");

        Asesor datosActualizados = new Asesor();
        datosActualizados.setDni("87654321");

        when(asesorRepository.findById(1L)).thenReturn(Optional.of(asesorExistente));
        when(asesorRepository.findByDni("87654321")).thenReturn(Optional.of(otroAsesor));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> asesorService.actualizarAsesor(1L, datosActualizados));

        assertEquals("Ya existe un asesor con este DNI", exception.getMessage());
    }
}
