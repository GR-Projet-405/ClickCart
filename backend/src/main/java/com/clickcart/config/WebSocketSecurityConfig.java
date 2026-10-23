package com.clickcart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final com.clickcart.util.JwtUtil jwtUtil;
    private final com.clickcart.repository.ProviderVerificationRepository verifications;

    public WebSocketSecurityConfig(com.clickcart.util.JwtUtil jwtUtil, com.clickcart.repository.ProviderVerificationRepository verifications) {
        this.jwtUtil = jwtUtil;
        this.verifications = verifications;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        Principal principal = jwtUtil.parseAccessToken(token)
                                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired session"));
                        accessor.setUser(principal);
                    } else {
                        // Reject unauthenticated connection
                        accessor.setUser(null);
                        throw new IllegalArgumentException("No valid authentication found");
                    }
                }
                if (accessor != null && accessor.getUser() instanceof com.clickcart.dto.auth.AuthenticatedUser user
                        && user.role() == com.clickcart.model.Role.SERVICE_PROVIDER
                        && accessor.getCommand() != StompCommand.DISCONNECT
                        && verifications.findByUserId(user.id()).filter(v -> "APPROVED".equals(v.getStatus())).isEmpty()) {
                    throw new IllegalArgumentException("Provider verification must be approved before messaging");
                }
                return message;
            }
        });
    }
}
