package com.springviz.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.springviz.backend.graph.GraphEdge;
import com.springviz.backend.graph.GraphNode;

import java.util.List;

public class GraphResponse {
    @JsonProperty("project_name")
    private String projectName;
    private List<GraphNode> nodes;
    private List<GraphEdge> edges;

    public GraphResponse(List<GraphNode> nodes, List<GraphEdge> edges, String projectName) {
        this.nodes = nodes;
        this.edges = edges;
        this.projectName = projectName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public List<GraphNode> getNodes() {
        return nodes;
    }

    public void setNodes(List<GraphNode> nodes) {
        this.nodes = nodes;
    }

    public List<GraphEdge> getEdges() {
        return edges;
    }

    public void setEdges(List<GraphEdge> edges) {
        this.edges = edges;
    }
}
