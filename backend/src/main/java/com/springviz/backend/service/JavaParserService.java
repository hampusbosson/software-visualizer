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


            // TODO: just nu hittar bara första huvududtypen i filen, behöver uppdateras senare till att hitta alla.
            // innebär att hela denna metod behöver returnera en lista av klasser istället för bara en klass
            Optional<TypeDeclaration<?>> typeDeclaration = compilationUnit.getTypes()
                    .stream()
                    .findFirst();

            if (typeDeclaration.isEmpty()) {
                return Optional.empty();
            }

            // hämta klassnamn
            String className = typeDeclaration.get().getNameAsString();

            // hämta annotations
            List<String> annotations = typeDeclaration.get()
                    .getAnnotations()
                    .stream()
                    .map(annotation -> annotation.getName().asString())
                    .toList();

            // hämta konstruktor-depencies
            List<String> dependencies = typeDeclaration.get()
                    .getConstructors()
                    .stream()
                    .flatMap(constructor -> constructor.getParameters().stream())
                    .map(parameter -> parameter.getType().asString())
                    .toList();

            AnalyzedClass analyzedClass = new AnalyzedClass(packageName, className, annotations, dependencies);

            return Optional.of(analyzedClass);
        } catch (IOException ex) {
            return Optional.empty();
        }
    }


}
