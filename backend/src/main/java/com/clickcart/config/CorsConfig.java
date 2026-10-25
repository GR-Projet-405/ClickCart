package com.clickcart.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class CorsConfig implements WebMvcConfigurer {
 private final String[] origins;
 public CorsConfig(@Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174}") String origins) {
  this.origins=java.util.Arrays.stream(origins.split(",")).map(String::trim).toArray(String[]::new);
 }
 @Override public void addCorsMappings(CorsRegistry registry) {
  registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
    .allowedHeaders("*").exposedHeaders("Content-Disposition").allowCredentials(true).maxAge(3600);
 }
}
