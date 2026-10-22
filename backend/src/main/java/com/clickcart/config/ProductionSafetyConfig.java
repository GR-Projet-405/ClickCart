package com.clickcart.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import java.nio.charset.StandardCharsets;
/** Refuse an insecure production startup instead of silently using development defaults. */
@Configuration
@Profile("prod")
public class ProductionSafetyConfig {
 public ProductionSafetyConfig(Environment env) {
  require(env.getProperty("JWT_SECRET", "").getBytes(StandardCharsets.UTF_8).length >= 32, "JWT_SECRET must contain at least 32 bytes");
  require(env.getProperty("AUTH_COOKIE_SECURE", Boolean.class, false), "AUTH_COOKIE_SECURE must be true");
  require(env.getProperty("clickcart.security.enabled", Boolean.class, false), "clickcart.security.enabled must be true");
  require(!env.getProperty("clickcart.demo-data.enabled", Boolean.class, false), "Demo data must be disabled");
  String origins=env.getProperty("CORS_ALLOWED_ORIGINS", "");
  require(!origins.isBlank(), "Set explicit HTTPS CORS_ALLOWED_ORIGINS");
  for(String origin:origins.split(",")) require(origin.trim().startsWith("https://") && !origin.contains("*"), "Production CORS origins must be explicit HTTPS origins");
 }
 private static void require(boolean condition,String message) { if(!condition) throw new IllegalStateException(message); }
}
