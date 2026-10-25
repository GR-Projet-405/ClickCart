package com.clickcart.config;

import com.clickcart.service.BrevoMailSender;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mail.javamail.JavaMailSender;
import static org.assertj.core.api.Assertions.assertThat;

class BrevoMailConfigTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(BrevoMailConfig.class)
            .withConfiguration(AutoConfigurations.of(MailSenderAutoConfiguration.class));

    @Test void brevoReplacesSmtpEvenWhenSmtpPropertiesExist() {
        runner.withPropertyValues("clickcart.mail.provider=brevo", "BREVO_API_KEY=test-key",
                "MAIL_FROM=sender@example.com", "spring.mail.host=smtp.example.com")
                .run(context -> {
                    assertThat(context).hasSingleBean(JavaMailSender.class);
                    assertThat(context.getBean(JavaMailSender.class)).isInstanceOf(BrevoMailSender.class);
                });
    }

    @Test void missingKeyPreventsSilentConsoleFallback() {
        runner.withPropertyValues("clickcart.mail.provider=brevo", "MAIL_FROM=sender@example.com")
                .run(context -> assertThat(context).hasFailed());
    }

    @Test void localSmtpStillWorksByDefault() {
        runner.withPropertyValues("spring.mail.host=smtp.example.com")
                .run(context -> {
                    assertThat(context).hasSingleBean(JavaMailSender.class);
                    assertThat(context.getBean(JavaMailSender.class)).isNotInstanceOf(BrevoMailSender.class);
                });
    }
}
