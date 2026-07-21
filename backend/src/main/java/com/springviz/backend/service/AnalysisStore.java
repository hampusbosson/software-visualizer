package com.springviz.backend.service;

import com.springviz.backend.class_analysis.AnalyzedClass;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AnalysisStore {
    private final Map<String, List<AnalyzedClass>> analyses =
            new ConcurrentHashMap<>();

    public String save(List<AnalyzedClass> classes) {
        String analysisId = UUID.randomUUID().toString();
        analyses.put(analysisId, classes);
        return analysisId;
    }

    public List<AnalyzedClass> get(String analysisId) {
        return analyses.get(analysisId);
    }
}
