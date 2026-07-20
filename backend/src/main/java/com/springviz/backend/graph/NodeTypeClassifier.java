package com.springviz.backend.graph;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class NodeTypeClassifier {
    public NodeType classify(
            List<String> annotations,
            List<String> extendedTypes,
            List<String> implementedInterfaces
    ) {
        if (containsAny(annotations, "RestController", "Controller")) {
            return NodeType.CONTROLLER;
        }

        if (annotations.contains("Service")) {
            return NodeType.SERVICE;
        }

        if (isRepository(annotations, extendedTypes, implementedInterfaces)) {
            return NodeType.REPOSITORY;
        }

        if (containsAny(
                annotations,
                "Entity",
                "Embeddable",
                "MappedSuperclass"
        )) {
            return NodeType.ENTITY;
        }

        if (annotations.contains("SpringBootApplication")) {
            return NodeType.APPLICATION;
        }

        if (containsAny(
                annotations,
                "Configuration",
                "EnableWebSecurity"
        )) {
            return NodeType.CONFIGURATION;
        }

        return NodeType.UNKNOWN;
    }

    private boolean containsAny(
            List<String> values,
            String... candidates
    ) {
        return Arrays.stream(candidates)
                .anyMatch(values::contains);
    }

    private boolean isRepository(
            List<String> annotations,
            List<String> extendedTypes,
            List<String> implementedInterfaces
    ) {
        if (annotations.contains("Repository")) {
            return true;
        }

        return Stream.concat(
                extendedTypes.stream(),
                implementedInterfaces.stream()
        ).anyMatch(this::isRepositoryType);
    }

    private boolean isRepositoryType(String typeName) {
        String rawType = removeGenericArguments(typeName);

        return switch (rawType) {
            case "Repository",
                 "CrudRepository",
                 "ListCrudRepository",
                 "PagingAndSortingRepository",
                 "ListPagingAndSortingRepository",
                 "JpaRepository" -> true;
            default -> false;
        };
    }

    private String removeGenericArguments(String typeName) {

        int genericStart = typeName.indexOf('<');
        if (genericStart == -1) {
            return typeName;
        }
        return typeName.substring(0, genericStart);
    }
}
