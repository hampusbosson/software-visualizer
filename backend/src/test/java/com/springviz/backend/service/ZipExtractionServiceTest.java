package com.springviz.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ZipExtractionServiceTest {

    private final ZipExtractionService zipExtractionService = new ZipExtractionService();

    @Test
    void extractsUploadedZip() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "project.zip",
                "application/zip",
                zipBytes(Map.of(
                        "backend/src/main/java/App.java", "class App {}",
                        "backend/src/main/resources/application.properties", "spring.application.name=test"
                ))
        );

        Path extractedDirectory = zipExtractionService.extract(file);

        assertTrue(Files.exists(extractedDirectory.resolve("backend/src/main/java/App.java")));
        assertEquals(
                "class App {}",
                Files.readString(extractedDirectory.resolve("backend/src/main/java/App.java"))
        );
    }

    @Test
    void rejectsZipSlipEntries() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "project.zip",
                "application/zip",
                zipBytes(Map.of("../evil.txt", "nope"))
        );

        assertThrows(IOException.class, () -> zipExtractionService.extract(file));
    }

    private byte[] zipBytes(Map<String, String> entries) {
        try {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();

            try (ZipOutputStream zipOutputStream = new ZipOutputStream(bytes)) {
                for (Map.Entry<String, String> entry : entries.entrySet()) {
                    zipOutputStream.putNextEntry(new ZipEntry(entry.getKey()));
                    zipOutputStream.write(entry.getValue().getBytes());
                    zipOutputStream.closeEntry();
                }
            }

            return bytes.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create test zip", e);
        }
    }
}
