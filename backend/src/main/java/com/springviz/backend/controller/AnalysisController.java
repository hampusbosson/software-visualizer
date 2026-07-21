package com.springviz.backend.controller;

import com.springviz.backend.dto.AnalysisResponse;
import com.springviz.backend.dto.SourceCodeResponse;
import com.springviz.backend.service.AnalysisService;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {
    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> analyzeProject(@RequestParam("file") @NotNull MultipartFile file) throws IOException {
        AnalysisResponse response = analysisService.analyze(file);

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{analysisId}/source")
    public ResponseEntity<SourceCodeResponse> getSourceCode(
            @PathVariable String analysisId,
            @RequestParam String nodeId
    ) {
        SourceCodeResponse response = analysisService.getSourceCode(analysisId, nodeId);

        return ResponseEntity.ok(response);
    }
}
