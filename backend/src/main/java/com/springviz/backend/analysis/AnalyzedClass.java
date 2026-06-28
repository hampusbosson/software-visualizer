package com.springviz.backend.analysis;

import java.util.List;

public class AnalyzedClass {

    private String packageName;
    private String className;
    private List<String> annotations;

    public AnalyzedClass(String packageName, String className, List<String> annotations) {
        this.packageName = packageName;
        this.className = className;
        this.annotations = annotations;
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

    @Override
    public String toString() {
        return "AnalyzedClass{" +
                "packageName='" + packageName + '\'' +
                ", className='" + className + '\'' +
                ", annotations=" + annotations +
                '}';
    }
}
