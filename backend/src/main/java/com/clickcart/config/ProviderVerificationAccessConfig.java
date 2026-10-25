package com.clickcart.config;

import com.clickcart.repository.ProviderVerificationRepository;
import com.clickcart.security.CurrentProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Enforces onboarding even when a provider calls the API without the UI. */
@Configuration
public class ProviderVerificationAccessConfig implements WebMvcConfigurer, HandlerInterceptor {
    private final ProviderVerificationRepository verifications;
    public ProviderVerificationAccessConfig(ProviderVerificationRepository verifications) {
        this.verifications = verifications;
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/**");
    }
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || auth.getAuthorities().stream().noneMatch(a -> "ROLE_SERVICE_PROVIDER".equals(a.getAuthority()))) return true;
                String path = request.getServletPath();
                if (path.startsWith("/api/auth/") || path.equals("/api/provider/profile")
                        || path.equals("/api/provider-verification") || path.startsWith("/api/provider-verification/")
                        || path.equals("/api/health") || "OPTIONS".equals(request.getMethod())) return true;
                if (verifications.findByUserId(CurrentProvider.id()).filter(v -> "APPROVED".equals(v.getStatus())).isPresent()) return true;
                response.setStatus(403);
                response.setContentType("application/json");
                response.getWriter().write("{\"code\":\"PROVIDER_VERIFICATION_REQUIRED\",\"message\":\"Your provider verification must be approved before using this feature. Complete your profile and submit your documents.\"}");
                return false;
            }

}
