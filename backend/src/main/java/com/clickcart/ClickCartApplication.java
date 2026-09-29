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
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class ClickCartApplication {

    private static final Logger log = LoggerFactory.getLogger(ClickCartApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(ClickCartApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] candidates = new Path[5]; // 🍏 Changed 4 to 5
        candidates[0] = Paths.get(".env");
        candidates[1] = Paths.get("backend", ".env");
        candidates[2] = Paths.get("..", ".env");
        candidates[3] = Paths.get("..", "backend", ".env");
        candidates[4] = Paths.get("ClickCart", "backend", ".env"); // 🔥 Added for your specific VS Code workspace

        for (Path path : candidates) {
            if (!Files.exists(path)) {
                continue;
            }
            try {
                List<String> lines = Files.readAllLines(path);
                for (String rawLine : lines) {
                    String line = rawLine.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx <= 0) {
                        continue;
                    }
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();
                    if (value.length() >= 2) {
                        boolean dq = value.startsWith("\"") && value.endsWith("\"");
                        boolean sq = value.startsWith("'") && value.endsWith("'");
                        if (dq || sq) {
                            value = value.substring(1, value.length() - 1);
                        }
                    }
                    if (System.getProperty(key) == null && System.getenv(key) == null) {
                        System.setProperty(key, value);
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