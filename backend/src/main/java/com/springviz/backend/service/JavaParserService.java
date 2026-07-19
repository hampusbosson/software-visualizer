package com.springviz.backend.service;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.nodeTypes.NodeWithName;
import com.springviz.backend.class_analysis.AnalyzedClass;
import com.springviz.backend.class_analysis.AnalyzedMethod;
import com.springviz.backend.class_analysis.AnalyzedParameter;
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

            String packageName = extractPackageName(compilationUnit);

            // TODO: just nu hittar bara första huvududtypen i filen, behöver uppdateras senare till att hitta alla.
            // innebär att hela denna metod behöver returnera en lista av klasser istället för bara en klass
            Optional<TypeDeclaration<?>> optionalType = compilationUnit.getTypes()
                    .stream()
                    .findFirst();

            if (optionalType.isEmpty()) {
                return Optional.empty();
            }

            TypeDeclaration<?> typeDeclaration = optionalType.get();

            // hämta klassnamn
            String className = typeDeclaration.getNameAsString();

            AnalyzedClass analyzedClass = AnalyzedClass
                    .builder(packageName, className)
                    .annotations(extractAnnotations(typeDeclaration))
                    .dependencies(extractDependencies(typeDeclaration))
                    .methods(extractMethods(typeDeclaration))
                    .build();

            return Optional.of(analyzedClass);
        } catch (IOException ex) {
            return Optional.empty();
        }
    }

    private String extractPackageName(CompilationUnit compilationUnit) {
        return compilationUnit
                .getPackageDeclaration()
                .map(packageDeclaration -> packageDeclaration.getName().asString())
                .orElse("");
    }

    private List<String> extractAnnotations(TypeDeclaration<?> typeDeclaration) {
        return typeDeclaration.getAnnotations()
                .stream()
                .map(NodeWithName::getNameAsString)
                .toList();
    }

    private List<String> extractDependencies(
            TypeDeclaration<?> typeDeclaration
    ) {
        return typeDeclaration.getConstructors()
                .stream()
                .flatMap(constructor ->
                        constructor.getParameters().stream())
                .map(parameter ->
                        parameter.getType().asString())
                .distinct() // samma dependency ska inte förekomma flera gånger
                .toList();
    }

    private List<AnalyzedMethod> extractMethods(
            TypeDeclaration<?> typeDeclaration
    ) {
        return typeDeclaration.getMethods()
                .stream()
                .map(method -> new AnalyzedMethod(
                        method.getNameAsString(),
                        method.getType().asString(),
                        method.getParameters()
                                .stream()
                                .map(parameter -> new AnalyzedParameter(
                                        parameter.getNameAsString(),
                                        parameter.getType().asString()
                                ))
                                .toList(),
                        method.getAnnotations()
                                .stream()
                                .map(NodeWithName::getNameAsString)
                                .toList(),
                        method.getBegin()
                                .map(position -> position.line)
                                .orElse(-1),
                        method.getEnd()
                                .map(position -> position.line)
                                .orElse(-1)
                ))
                .toList();
    }

}
