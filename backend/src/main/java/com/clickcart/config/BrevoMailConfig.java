package com.clickcart.config;

import com.clickcart.service.BrevoMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.client.RestClient;

@Configuration
@ConditionalOnProperty(name = "clickcart.mail.provider", havingValue = "brevo")
public class BrevoMailConfig {
    @Bean
    JavaMailSender brevoMailSender(@Value("${BREVO_API_KEY:}") String key,
                                  @Value("${MAIL_FROM:}") String from) {
        if (key.isBlank() || from.isBlank()) {
            throw new IllegalStateException("Brevo requires BREVO_API_KEY and a verified MAIL_FROM address");
        }
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        var client = RestClient.builder().baseUrl("https://api.brevo.com")
                .requestFactory(factory).defaultHeader("api-key", key.trim()).build();
        return new BrevoMailSender(client, from.trim());
    }
}
