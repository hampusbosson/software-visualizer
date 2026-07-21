package com.springviz.backend.dto;

public record SourceCodeResponse(
        String nodeId,
        String fileName,
        String sourcePath,
        String sourceCode
) {
}
