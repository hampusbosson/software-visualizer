package com.springviz.backend.service;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.springviz.backend.analysis.AnalyzedClass;
import org.springframework.stereotype.Service;

import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.TypeDeclaration;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Service
public class JavaParserService {

    private final JavaParser javaParser;

    public JavaParserService(JavaParser javaParser) {
        this.javaParser = javaParser;
    }

    public List<AnalyzedClass> parse(List<Path> javaFiles) {
        return javaFiles.stream()
                .map(this::parseJavaFile)
                .flatMap(Optional::stream)
                .toList();
    }

    private Optional<AnalyzedClass> parseJavaFile(Path javaFile) {
        try {
            ParseResult<CompilationUnit> parseResult = javaParser.parse(javaFile);

            if (!parseResult.isSuccessful() || parseResult.getResult().isEmpty()) {
                return Optional.empty();
            }

            CompilationUnit compilationUnit = parseResult.getResult().get();

            String packageName = compilationUnit
                    .getPackageDeclaration()
                    .map(packageDeclaration -> packageDeclaration.getName().asString())
                    .orElse("");

            Optional<TypeDeclaration<?>> typeDeclaration = compilationUnit.getTypes()
                    .stream()
                    .findFirst();

            if (typeDeclaration.isEmpty()) {
                return Optional.empty();
            }

            String className = typeDeclaration.get().getNameAsString();

            List<String> annotations = typeDeclaration.get()
                    .getAnnotations()
                    .stream()
                    .map(annotation -> annotation.getName().asString())
                    .toList();

            AnalyzedClass analyzedClass = new AnalyzedClass(packageName, className, annotations);

            return Optional.of(analyzedClass);
        } catch (IOException ex) {
            return Optional.empty();
        }
    }


}
