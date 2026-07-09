package com.sidaf.backend.controller.ai;

import com.sidaf.backend.service.ai.AiDatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "*")
public class AiDatasetController {

    @Autowired
    private AiDatasetService aiDatasetService;

    @GetMapping("/dataset/csv/{campeonatoId}")
    public ResponseEntity<String> generarDatasetCsv(@PathVariable Long campeonatoId) throws Exception {
        String ruta = aiDatasetService.generarDatasetCsv(campeonatoId, "CSV");
        return ResponseEntity.ok(ruta);
    }

    @GetMapping("/dataset/json/{campeonatoId}")
    public ResponseEntity<String> generarDatasetJson(@PathVariable Long campeonatoId) throws Exception {
        String ruta = aiDatasetService.generarDatasetJson(campeonatoId, "JSON");
        return ResponseEntity.ok(ruta);
    }
}
