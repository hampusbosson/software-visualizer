package com.springviz.backend.service;

import com.springviz.backend.class_analysis.AnalyzedClass;
import com.springviz.backend.graph.GraphEdge;
import com.springviz.backend.graph.GraphNode;
import com.springviz.backend.graph.GraphResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GraphBuilderService {

    public GraphResponse build(List<AnalyzedClass> classes, String projectName) {
        List<GraphNode> nodes = classes.stream()
                .map(this::toNode)
                .toList();

        List<GraphEdge> edges = buildEdges(classes, nodes);

        return new GraphResponse(nodes, edges, projectName);
    }

    private GraphNode toNode(AnalyzedClass analyzedClass) {
        return new GraphNode(
                getFullName(analyzedClass),
                analyzedClass.getClassName(),
                analyzedClass.getNodeType(),
                analyzedClass.getPackageName(),
                analyzedClass.getAnnotations(),
                analyzedClass.getDependencies(),
                analyzedClass.getMethods(),
                analyzedClass.getEndpoints(),
                analyzedClass.getExtendedTypes(),
                analyzedClass.getImplementedInterfaces(),
                analyzedClass.getFilePath(),
                analyzedClass.getClassKind()
        );
    }

    private String getFullName(AnalyzedClass analyzedClass) {
        return analyzedClass.getPackageName() + "." + analyzedClass.getClassName();
    }

    private List<GraphEdge> buildEdges(List<AnalyzedClass> classes, List<GraphNode> nodes) {
        Map<String, GraphNode> nodesBySimpleName = nodes.stream()
                .collect(Collectors.toMap(
                        GraphNode::getLabel,
                        Function.identity(),
                        (existing, duplicate) -> existing
                ));

        List<GraphEdge> edges = new ArrayList<>();

        for (AnalyzedClass parsedClass : classes) {
            GraphNode sourceNode = nodesBySimpleName.get(parsedClass.getClassName());

            if (sourceNode == null) continue;

            for (String dependencyName : parsedClass.getDependencies()) {
                GraphNode targetNode = nodesBySimpleName.get(dependencyName);

                if (targetNode == null) continue;

                edges.add(new GraphEdge(
                        sourceNode.getId(),
                        targetNode.getId(),
                        "DEPENDS_ON"
                ));
            }
        }

        return edges;
    }

}
