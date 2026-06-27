package com.springviz.backend.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

@Service
public class JavaFileScanner {

     public List<Path> findJavaFiles(Path projectDirectory) throws IOException {
         try (Stream<Path> paths = Files.walk(projectDirectory)) {
             return paths
                     .filter(Files::isRegularFile)
                     .filter(this::isJavaSourceFile)
                     .toList();
         }
     }

    private boolean isJavaSourceFile(Path path) {
        String pathString = path.toString();

        return pathString.endsWith(".java")
                && !pathString.contains("__MACOSX")
                && !path.getFileName().toString().startsWith("._")
                && !pathString.contains("/src/test/")
                && !pathString.contains("/target/")
                && !pathString.contains("/build/");
    }

}
