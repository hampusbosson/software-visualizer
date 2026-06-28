package com.springviz.backend.config;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParserConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JavaParserConfig {

    @Bean
    public ParserConfiguration parserConfiguration() {
        return new ParserConfiguration()
                .setLanguageLevel(ParserConfiguration.LanguageLevel.JAVA_21);
    }

    @Bean
    public JavaParser javaParser(ParserConfiguration parserConfiguration) {
        return new JavaParser(parserConfiguration);
    }
}
