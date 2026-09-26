package com.clickcart;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClickCartApplication {

    private static final Logger log = LoggerFactory.getLogger(ClickCartApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(ClickCartApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] possiblePaths = new Path[] {
            Paths.get(".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", ".env"),
            Paths.get("..", "backend", ".env")
        };

        for (Path path : possiblePaths) {
            if (Files.exists(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    log.info("[ClickCart] Loaded environment variables from: {}", path.toAbsolutePath());
                    break;
                } catch (IOException e) {
                    log.warn("[ClickCart] Could not read .env file at {}: {}", path, e.getMessage());
                }
            }
        }
    }
}
