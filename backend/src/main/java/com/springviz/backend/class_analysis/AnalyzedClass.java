package com.springviz.backend.class_analysis;

import java.util.List;

public class AnalyzedClass {

    private final String packageName;
    private final String className;
    private final List<String> annotations;
    private final List<String> dependencies;
    private final List<AnalyzedMethod> methods;
    private final List<AnalyzedEndpoint> endpoints;
    private final String extendsClass;
    private final List<String> implementedInterfaces;
    private final String filePath;
    private final ClassKind type;

    private AnalyzedClass(Builder builder) {
        this.packageName = builder.packageName;
        this.className = builder.className;
        this.annotations = List.copyOf(builder.annotations);
        this.dependencies = List.copyOf(builder.dependencies);
        this.methods = List.copyOf(builder.methods);
        this.endpoints = List.copyOf(builder.endpoints);
        this.extendsClass = builder.extendsClass;
        this.implementedInterfaces =
                List.copyOf(builder.implementedInterfaces);
        this.filePath = builder.filePath;
        this.type = builder.type;
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
        private String extendsClass;
        private List<String> implementedInterfaces = List.of();
        private String filePath;
        private ClassKind type = ClassKind.CLASS;

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

        public Builder extendsClass(String extendsClass) {
            this.extendsClass = extendsClass;
            return this;
        }

        public Builder implementedInterfaces(
                List<String> implementedInterfaces
        ) {
            this.implementedInterfaces = implementedInterfaces;
            return this;
        }

        public Builder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public Builder type(ClassKind type) {
            this.type = type;
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

    public String getExtendsClass() {
        return extendsClass;
    }

    public List<String> getImplementedInterfaces() {
        return implementedInterfaces;
    }

    public String getFilePath() {
        return filePath;
    }

    public ClassKind getType() {
        return this.type;
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
                ", extendsClass='" + extendsClass + '\'' +
                ", implementedInterfaces=" + implementedInterfaces +
                ", filePath='" + filePath + '\'' +
                ", type=" + type +
                '}';
    }
}
