package com.clickcart.config;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import com.clickcart.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String devRoleHeader = request.getHeader("X-Dev-Role");
        String devProviderHeader = request.getHeader("X-Provider-Id");

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                String providerId = jwtUtil.extractProviderId(token);

                String normalizedRole = role != null && !role.startsWith("ROLE_") ? "ROLE_" + role : role;
                if (normalizedRole == null) {
                    normalizedRole = "ROLE_SERVICE_PROVIDER";
                }

                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(normalizedRole)
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(providerId != null ? providerId : username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } else if (StringUtils.hasText(devProviderHeader) || StringUtils.hasText(devRoleHeader)) {
            // Development fallback support when DEV-01 auth token is not yet passed from client
            String role = StringUtils.hasText(devRoleHeader) ? devRoleHeader : "ROLE_SERVICE_PROVIDER";
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }
            String providerId = StringUtils.hasText(devProviderHeader) ? devProviderHeader : "dev-provider-09";

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(providerId, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            // Default dev provider context for local UI development so provider features work seamlessly
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken("dev-provider-09", null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER")));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
