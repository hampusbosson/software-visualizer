package com.springviz.backend.graph;

import java.util.List;

public class GraphNode {

    private String id;

    private String label;

    private NodeType type;

    private String packageName;

    private List<String> annotations;

    public GraphNode(
            String id,
            String label,
            NodeType type,
            String packageName,
            List<String> annotations
    ) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.packageName = packageName;
        this.annotations = annotations;
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public NodeType getType() {
        return type;
    }

    public String getPackageName() {
        return packageName;
    }

    public List<String> getAnnotations() {
        return annotations;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public void setType(NodeType type) {
        this.type = type;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public void setAnnotations(List<String> annotations) {
        this.annotations = annotations;
    }
}