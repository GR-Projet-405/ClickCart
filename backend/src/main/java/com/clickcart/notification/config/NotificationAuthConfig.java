package com.clickcart.notification.config;

import com.clickcart.notification.util.NotificationCurrentUserResolver;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the notification module's temporary user resolver.
 *
 * <p>DEV-33 TEMPORARY INTEGRATION POINT — see
 * {@link com.clickcart.notification.util.NotificationCurrentUserResolver} for
 * the X-User-Id seam that must be replaced once DEV-01 auth lands.
 */
@Configuration
public class NotificationAuthConfig {

    @Bean
    public NotificationCurrentUserResolver notificationCurrentUserResolver() {
        return new NotificationCurrentUserResolver.HeaderResolver();
    }
}