package com.springviz.backend.controller;

import com.springviz.backend.graph.GraphResponse;
import com.springviz.backend.service.AnalysisService;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
    public ResponseEntity<GraphResponse> analyzeProject(@RequestParam("file") @NotNull MultipartFile file) throws IOException {
        GraphResponse response = analysisService.analyze(file);

        return ResponseEntity.status(201).body(response);
    }
}
