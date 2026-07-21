package com.springviz.backend.service;

import com.springviz.backend.class_analysis.AnalyzedClass;
import com.springviz.backend.dto.AnalysisResponse;
import com.springviz.backend.dto.GraphResponse;
import com.springviz.backend.dto.SourceCodeResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;


@Service
public class AnalysisService {
    private final ZipExtractionService zipExtractionService;
    private final JavaFileScanner javaFileScanner;
    private final JavaParserService javaParserService;
    private final GraphBuilderService graphBuilderService;
    private final AnalysisStore analysisStore;

    public AnalysisService(ZipExtractionService zipExtractionService, JavaFileScanner javaFileScanner, JavaParserService javaParserService, GraphBuilderService graphBuilderService, AnalysisStore analysisStore) {
       this.zipExtractionService = zipExtractionService;
       this.javaFileScanner = javaFileScanner;
       this.javaParserService = javaParserService;
       this.graphBuilderService = graphBuilderService;
       this.analysisStore = analysisStore;
    }


    public AnalysisResponse analyze(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        if (!isZipFile(file)) {
            throw new IllegalArgumentException("Only zip files are allowed");
        }

        String projectName = getProjectName(file);

        // 1. Extract zip
        Path extractedDirectory = zipExtractionService.extract(file);
        Path projectDirectory = resolveProjectRoot(extractedDirectory);
        // 2. Find Java files
        List<Path> javaFiles = javaFileScanner.findJavaFiles(projectDirectory);
        // 3. parse Java files
        List<AnalyzedClass> classes = javaParserService.parse(projectDirectory, javaFiles);
        // 4. Build graph response
        GraphResponse graph = graphBuilderService.build(classes, projectName);
        // 5. Generate Analysis ID and save classes to in memory store
        String analysisId = analysisStore.save(classes);

        return new AnalysisResponse(analysisId, graph);
    }

    public SourceCodeResponse getSourceCode(
            String analysisId,
            String nodeId
    ) {
        List<AnalyzedClass> classes =
                analysisStore.get(analysisId);

        if (classes == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Analysis not found"
            );
        }

        AnalyzedClass analyzedClass = classes.stream()
                .filter(currentClass ->
                        getFullName(currentClass).equals(nodeId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Source code not found"
                        )
                );

        return new SourceCodeResponse(
                nodeId,
                analyzedClass.getClassName() + ".java",
                analyzedClass.getFilePath(),
                analyzedClass.getSourceCode()
        );
    }

    private Path resolveProjectRoot(Path extractedDirectory) throws IOException {
        try (Stream<Path> paths = Files.list(extractedDirectory)) {
            List<Path> topLevelEntries = paths
                    .filter(this::isRelevantTopLevelEntry)
                    .toList();

            if (topLevelEntries.size() == 1 && Files.isDirectory(topLevelEntries.getFirst())) {
                return topLevelEntries.getFirst();
            }

            return extractedDirectory;
        }
    }

    private boolean isRelevantTopLevelEntry(Path path) {
        String fileName = path.getFileName().toString();

        return !fileName.equals("__MACOSX")
                && !fileName.startsWith("._")
                && !fileName.equals(".DS_Store");
    }

    private String getProjectName(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            return "unnamed project";
        }

        String fileName = Path.of(originalFilename)
                .getFileName()
                .toString();

        if (fileName.toLowerCase().endsWith(".zip")) {
            return fileName.substring(0, fileName.length() - 4);
        }

        return fileName;
    }


    private boolean isZipFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        return fileName != null && fileName.toLowerCase().endsWith(".zip");
    }

    private String getFullName(AnalyzedClass analyzedClass) {
        return analyzedClass.getPackageName()
                + "."
                + analyzedClass.getClassName();
    }
}
