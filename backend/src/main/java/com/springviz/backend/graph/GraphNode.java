package com.springviz.backend.graph;

import com.springviz.backend.class_analysis.AnalyzedEndpoint;
import com.springviz.backend.class_analysis.AnalyzedMethod;
import com.springviz.backend.class_analysis.ClassKind;

import java.util.List;

public class GraphNode {

    private String id;
    private String label;
    private String packageName;
    private NodeType type;
    private List<String> annotations;
    private List<String> dependencies;
    private List<AnalyzedMethod> methods;
    private List<AnalyzedEndpoint> endpoints;
    private String extendsClass;
    private List<String> implementedInterfaces;
    private String filePath;
    private ClassKind classKind;

    public GraphNode(
            String id,
            String label,
            NodeType type,
            String packageName,
            List<String> annotations,
            List<String> dependencies,
            List<AnalyzedMethod> methods,
            List<AnalyzedEndpoint> endpoints,
            String extendsClass,
            List<String> implementedInterfaces,
            String filePath,
            ClassKind classKind
    ) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.packageName = packageName;
        this.annotations = annotations;
        this.dependencies = dependencies;
        this.methods = methods;
        this.endpoints = endpoints;
        this.extendsClass = extendsClass;
        this.implementedInterfaces = implementedInterfaces;
        this.filePath = filePath;
        this.classKind = classKind;
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

    public List<String> getDependencies() {
        return dependencies;
    }

    public List<AnalyzedMethod> getMethods() {
        return methods;
    }

    public List<AnalyzedEndpoint> getEndpoints() {
        return endpoints;
    }

    public String getExtendsClass() {
        return extendsClass;
    }

    public List<String> getImplementedInterfaces() {
        return implementedInterfaces;
    }

    public String getFilePath() {
        return filePath;
    }

    public ClassKind getClassKind() {
        return classKind;
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

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies;
    }

    public void setMethods(List<AnalyzedMethod> methods) {
        this.methods = methods;
    }

    public void setEndpoints(List<AnalyzedEndpoint> endpoints) {
        this.endpoints = endpoints;
    }

    public void setExtendsClass(String extendsClass) {
        this.extendsClass = extendsClass;
    }

    public void setImplementedInterfaces(List<String> implementedInterfaces) {
        this.implementedInterfaces = implementedInterfaces;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setClassKind(ClassKind classKind) {
        this.classKind = classKind;
    }
}
