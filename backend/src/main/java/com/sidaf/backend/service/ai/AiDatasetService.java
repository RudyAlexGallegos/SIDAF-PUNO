package com.sidaf.backend.service.ai;

import com.sidaf.backend.model.DatasetConfig;
import com.sidaf.backend.model.PrediccionHistorial;
import com.sidaf.backend.repository.PrediccionHistorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AiDatasetService {

    @Autowired
    private PrediccionHistorialRepository prediccionHistorialRepository;

    @Autowired
    private DatasetExporter datasetExporter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generarDatasetCsv(Long campeonatoId, String formato) throws IOException {
        List<PrediccionHistorial> historial = prediccionHistorialRepository.findByCampeonatoId(campeonatoId);
        Path ruta = Paths.get("datasets", "dataset_campeonato_" + campeonatoId + "_" + LocalDateTime.now().toString().replace(":", "-") + ".csv");
        Files.createDirectories(ruta.getParent());
        try (FileWriter writer = new FileWriter(ruta.toFile())) {
            writer.append("prediccion_id,campeonato_id,etapa,arbitro_id,partido_id,prediccion,resultado_real,confianza,error,fecha_prediccion,fecha_resultado\n");
            for (PrediccionHistorial p : historial) {
                writer.append(String.valueOf(p.getPrediccionId())).append(",");
                writer.append(String.valueOf(p.getCampeonatoId())).append(",");
                writer.append(escapeCsv(p.getEtapa())).append(",");
                writer.append(String.valueOf(p.getArbitroId())).append(",");
                writer.append(String.valueOf(p.getPartidoId())).append(",");
                writer.append(escapeCsv(p.getPrediccion())).append(",");
                writer.append(escapeCsv(p.getResultadoReal())).append(",");
                writer.append(String.valueOf(p.getConfianza())).append(",");
                writer.append(String.valueOf(p.getError())).append(",");
                writer.append(escapeCsv(String.valueOf(p.getFechaPrediccion()))).append(",");
                writer.append(escapeCsv(String.valueOf(p.getFechaResultado()))).append("\n");
            }
        }
        return ruta.toString();
    }

    public String generarDatasetJson(Long campeonatoId, String formato) throws IOException {
        List<PrediccionHistorial> historial = prediccionHistorialRepository.findByCampeonatoId(campeonatoId);
        Path ruta = Paths.get("datasets", "dataset_campeonato_" + campeonatoId + "_" + LocalDateTime.now().toString().replace(":", "-") + ".json");
        Files.createDirectories(ruta.getParent());
        List<Map<String, Object>> registros = new ArrayList<>();
        for (PrediccionHistorial p : historial) {
            Map<String, Object> registro = new HashMap<>();
            registro.put("prediccionId", p.getPrediccionId());
            registro.put("campeonatoId", p.getCampeonatoId());
            registro.put("etapa", p.getEtapa());
            registro.put("arbitroId", p.getArbitroId());
            registro.put("partidoId", p.getPartidoId());
            registro.put("prediccion", p.getPrediccion());
            registro.put("resultadoReal", p.getResultadoReal());
            registro.put("confianza", p.getConfianza());
            registro.put("error", p.getError());
            registro.put("fechaPrediccion", p.getFechaPrediccion() != null ? p.getFechaPrediccion().toString() : null);
            registro.put("fechaResultado", p.getFechaResultado() != null ? p.getFechaResultado().toString() : null);
            registros.add(registro);
        }
        objectMapper.writeValue(ruta.toFile(), registros);
        return ruta.toString();
    }

    private String escapeCsv(String valor) {
        if (valor == null) return "";
        valor = valor.replace("\"", "\"\"");
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor + "\"";
        }
        return valor;
    }
}
