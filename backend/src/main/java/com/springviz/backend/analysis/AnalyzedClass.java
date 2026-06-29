package com.springviz.backend.analysis;

import java.util.List;

public class AnalyzedClass {

    private String packageName;
    private String className;
    private List<String> annotations;
    private List<String> dependencies;

    public AnalyzedClass(String packageName, String className, List<String> annotations, List<String> dependencies) {
        this.packageName = packageName;
        this.className = className;
        this.annotations = annotations;
        this.dependencies = dependencies;
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

    @Override
    public String toString() {
        return "AnalyzedClass{" +
                "packageName='" + packageName + '\'' +
                ", className='" + className + '\'' +
                ", annotations=" + annotations +
                ", dependencies=" + dependencies +
                '}';
    }
}
