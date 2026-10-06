package com.clickcart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.clickcart.security.ProviderAuthInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final ProviderAuthInterceptor providerAuthInterceptor;

    public WebMvcConfig(ProviderAuthInterceptor providerAuthInterceptor) {
        this.providerAuthInterceptor = providerAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(providerAuthInterceptor)
            .addPathPatterns("/api/provider/jobs", "/api/provider/jobs/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Content-Disposition");
    }
}
