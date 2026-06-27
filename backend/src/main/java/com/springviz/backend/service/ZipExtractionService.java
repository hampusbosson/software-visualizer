package com.springviz.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

@Service
public class ZipExtractionService {

    public Path extract(MultipartFile file) throws IOException {
        Path tempDirectory = Files.createTempDirectory("springviz-");
        Path tempZipFile = Files.createTempFile("springviz-upload-", ".zip");

        try {
            try (InputStream uploadedZip = file.getInputStream()) {
                Files.copy(uploadedZip, tempZipFile, StandardCopyOption.REPLACE_EXISTING);
            }

            try (ZipFile zipFile = new ZipFile(tempZipFile.toFile())) {
                Enumeration<? extends ZipEntry> entries = zipFile.entries();

                while (entries.hasMoreElements()) {
                    ZipEntry entry = entries.nextElement();
                    extractEntry(zipFile, entry, tempDirectory);
                }
            }
        } finally {
            Files.deleteIfExists(tempZipFile);
        }

        return tempDirectory;
    }

    private void extractEntry(ZipFile zipFile, ZipEntry entry, Path tempDirectory) throws IOException {
        if (entry.getName() == null || entry.getName().isBlank()) {
            return;
        }

        Path destination = tempDirectory.resolve(entry.getName()).normalize();

        // Skydd mot zip slip
        if (!destination.startsWith(tempDirectory)) {
            throw new IOException("Invalid zip entry");
        }

        if (entry.isDirectory()) {
            Files.createDirectories(destination);
        } else {
            Files.createDirectories(destination.getParent());
            try (InputStream entryContent = zipFile.getInputStream(entry)) {
                Files.copy(entryContent, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }
}
