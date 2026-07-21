package com.springviz.backend.class_analysis;

import com.springviz.backend.graph.NodeType;

import java.util.List;

public class AnalyzedClass {

    private final String packageName;
    private final String className;
    private final List<String> annotations;
    private final List<String> dependencies;
    private final List<AnalyzedMethod> methods;
    private final List<AnalyzedEndpoint> endpoints;
    private final List<String> extendedTypes;
    private final List<String> implementedInterfaces;
    private final String filePath;
    private final String sourceCode;
    private final ClassKind classKind;
    private final NodeType nodeType;

    private AnalyzedClass(Builder builder) {
        this.packageName = builder.packageName;
        this.className = builder.className;
        this.annotations = List.copyOf(builder.annotations);
        this.dependencies = List.copyOf(builder.dependencies);
        this.methods = List.copyOf(builder.methods);
        this.endpoints = List.copyOf(builder.endpoints);
        this.extendedTypes = List.copyOf(builder.extendedTypes);
        this.implementedInterfaces = List.copyOf(builder.implementedInterfaces);
        this.filePath = builder.filePath;
        this.sourceCode = builder.sourceCode;
        this.classKind = builder.classKind;
        this.nodeType = builder.nodeType;
    }

    public static Builder builder(String packageName, String className) {
        return new Builder(packageName, className);
    }

    public static class Builder {

        private final String packageName;
        private final String className;

        private List<String> annotations = List.of();
        private List<String> dependencies = List.of();
        private List<AnalyzedMethod> methods = List.of();
        private List<AnalyzedEndpoint> endpoints = List.of();
        private List<String> extendedTypes = List.of();
        private List<String> implementedInterfaces = List.of();
        private String filePath;
        private String sourceCode;
        private ClassKind classKind = ClassKind.CLASS;
        private NodeType nodeType = NodeType.UNKNOWN;

        private Builder(String packageName, String className) {
            this.packageName = packageName;
            this.className = className;
        }

        public Builder annotations(List<String> annotations) {
            this.annotations = annotations;
            return this;
        }

        public Builder dependencies(List<String> dependencies) {
            this.dependencies = dependencies;
            return this;
        }

        public Builder methods(List<AnalyzedMethod> methods) {
            this.methods = methods;
            return this;
        }

        public Builder endpoints(List<AnalyzedEndpoint> endpoints) {
            this.endpoints = endpoints;
            return this;
        }

        public Builder extendedTypes(List<String> extendedTypes) {
            this.extendedTypes = extendedTypes;
            return this;
        }

        public Builder implementedInterfaces(List<String> implementedInterfaces) {
            this.implementedInterfaces = implementedInterfaces;
            return this;
        }

        public Builder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public Builder sourceCode(String sourceCode) {
            this.sourceCode = sourceCode;
            return this;
        }

        public Builder classKind(ClassKind classKind) {
            this.classKind = classKind;
            return this;
        }

        public Builder nodeType(NodeType nodeType) {
            this.nodeType = nodeType;
            return this;
        }

        public AnalyzedClass build() {
            return new AnalyzedClass(this);
        }
    }

    public String getPackageName() {
        return packageName;
    }

    public String getClassName() {
        return className;
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

    public List<String> getExtendedTypes() {
        return extendedTypes;
    }

    public List<String> getImplementedInterfaces() {
        return implementedInterfaces;
    }

    public String getFilePath() {
        return filePath;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public ClassKind getClassKind() {
        return this.classKind;
    }

    public NodeType getNodeType() {
        return this.nodeType;
    }

    @Override
    public String toString() {
        return "AnalyzedClass{" +
                "packageName='" + packageName + '\'' +
                ", className='" + className + '\'' +
                ", annotations=" + annotations +
                ", dependencies=" + dependencies +
                ", methods=" + methods +
                ", endpoints=" + endpoints +
                ", extendedTypes=" + extendedTypes +
                ", implementedInterfaces=" + implementedInterfaces +
                ", filePath='" + filePath + '\'' +
                ", sourceCode=" + (sourceCode == null ? "null" : "'" + sourceCode.length() + " chars'") +
                ", classKind=" + classKind +
                ", nodeType=" + nodeType +
                '}';
    }
}
