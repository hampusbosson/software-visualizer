package com.springviz.backend.service;

import com.springviz.backend.analysis.AnalyzedClass;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;


@Service
public class AnalysisService {
    private final ZipExtractionService zipExtractionService;
    private final JavaFileScanner javaFileScanner;
    private final JavaParserService javaParserService;

    public AnalysisService(ZipExtractionService zipExtractionService, JavaFileScanner javaFileScanner, JavaParserService javaParserService) {
       this.zipExtractionService = zipExtractionService;
       this.javaFileScanner = javaFileScanner;
       this.javaParserService = javaParserService;
    }


    public List<AnalyzedClass> analyze(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        if (!isZipFile(file)) {
            throw new IllegalArgumentException("Only zip files are allowed");
        }

        // 1. Extract zip
        Path projectDirectory = zipExtractionService.extract(file);
        // 2. Find Java files
        List<Path> javaFiles = javaFileScanner.findJavaFiles(projectDirectory);
        // 3. parse Java files
        List<AnalyzedClass> classes = javaParserService.parse(javaFiles);
        // 4. Build graph
        //GraphResponse response = new GraphResponse();

        //return response;

        return classes;
    }


    private boolean isZipFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        return fileName != null && fileName.toLowerCase().endsWith(".zip");
    }
}