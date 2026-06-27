package com.springviz.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;


@Service
public class AnalysisService {
    private final ZipExtractionService zipExtractionService;
    private final JavaFileScanner javaFileScanner;

    public AnalysisService(ZipExtractionService zipExtractionService, JavaFileScanner javaFileScanner) {
       this.zipExtractionService = zipExtractionService;
       this.javaFileScanner = javaFileScanner;
    }


    public List<Path> analyze(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        if (!isZipFile(file)) {
            throw new IllegalArgumentException("Only zip files are allowed");
        }

        // 1. Extract zip
        Path projectDirectory = zipExtractionService.extract(file);
        List<Path> javaFiles = javaFileScanner.findJavaFiles(projectDirectory);
        // 2. Find Java files
        // 3. parse Java files
        // 4. Build graph
        //GraphResponse response = new GraphResponse();

        //return response;

        return javaFiles;
    }


    private boolean isZipFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        return fileName != null && fileName.toLowerCase().endsWith(".zip");
    }
}