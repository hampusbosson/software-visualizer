package com.springviz.backend.service;

import com.springviz.backend.analysis.AnalyzedClass;
import com.springviz.backend.graph.GraphEdge;
import com.springviz.backend.graph.GraphNode;
import com.springviz.backend.graph.GraphResponse;
import com.springviz.backend.graph.NodeType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GraphBuilderService {

    public GraphResponse build(List<AnalyzedClass> classes, String projectName) {
        List<GraphNode> nodes = classes.stream()
                .map(this::toNode)
                .toList();

        List<GraphEdge> edges = List.of();

        return new GraphResponse(nodes, edges, projectName);
    }

    private GraphNode toNode(AnalyzedClass analyzedClass) {
        return new GraphNode(
                getFullName(analyzedClass),
                analyzedClass.getClassName(),
                getNodeType(analyzedClass),
                analyzedClass.getPackageName(),
                analyzedClass.getAnnotations()
        );
    }

    private String getFullName(AnalyzedClass analyzedClass) {
        return analyzedClass.getPackageName() + "." + analyzedClass.getClassName();
    }

    private NodeType getNodeType(AnalyzedClass analyzedClass) {
        List<String> annotations = analyzedClass.getAnnotations();

        if (annotations.contains("RestController") || annotations.contains("Controller")) {
            return NodeType.CONTROLLER;
        }

        if (annotations.contains("Service")) {
            return NodeType.SERVICE;
        }

        if (annotations.contains("Repository")) {
            return NodeType.REPOSITORY;
        }

        if (annotations.contains("Entity")) {
            return NodeType.ENTITY;
        }

        if (annotations.contains("Configuration")) {
            return NodeType.CONFIGURATION;
        }

        if (annotations.contains("SpringBootApplication")) {
            return NodeType.APPLICATION;
        }

        return NodeType.UNKNOWN;
    }
}
