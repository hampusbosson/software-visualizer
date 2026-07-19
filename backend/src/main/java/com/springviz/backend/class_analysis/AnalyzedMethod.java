package com.springviz.backend.class_analysis;

import java.util.List;

public record AnalyzedMethod(
        String name,
        String returnType,
        List<AnalyzedParameter> parameters,
        List<String> annotations,
        int startLine,
        int endLine
) {
}
