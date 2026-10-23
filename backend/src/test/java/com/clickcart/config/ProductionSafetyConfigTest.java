package com.clickcart.config;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import static org.junit.jupiter.api.Assertions.*;
class ProductionSafetyConfigTest {
 private MockEnvironment valid(){return new MockEnvironment().withProperty("JWT_SECRET","a-unique-secret-with-at-least-thirty-two-bytes").withProperty("AUTH_COOKIE_SECURE","true").withProperty("clickcart.security.enabled","true").withProperty("CORS_ALLOWED_ORIGINS","https://app.example.com");}
 @Test void acceptsExplicitProductionSettings(){assertDoesNotThrow(()->new ProductionSafetyConfig(valid()));}
 @Test void rejectsUnsafeDefaults(){assertThrows(IllegalStateException.class,()->new ProductionSafetyConfig(new MockEnvironment()));}
 @Test void rejectsWildcardOriginsAndInsecureCookies(){assertThrows(IllegalStateException.class,()->new ProductionSafetyConfig(valid().withProperty("CORS_ALLOWED_ORIGINS","https://*.example.com")));assertThrows(IllegalStateException.class,()->new ProductionSafetyConfig(valid().withProperty("AUTH_COOKIE_SECURE","false")));}
}
