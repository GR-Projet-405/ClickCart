package com.clickcart.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.clickcart.exception.ApiException;

@Component
public class JwtTokenService {

    private static final String ROLE_PROVIDER = "SERVICE_PROVIDER";

    private final byte[] secret;
    private final long ttlSeconds;

    public JwtTokenService(
        @Value("${clickcart.jwt.secret}") String secret,
        @Value("${clickcart.jwt.ttl-seconds:31536000}") long ttlSeconds
    ) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
    }

    public String createToken(String providerId, String displayName) {
        return createToken(providerId, displayName, Instant.now().getEpochSecond() + ttlSeconds);
    }

    public String createToken(String providerId, String displayName, long exp) {
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url(
            "{\"sub\":\"" + sanitize(providerId) + "\",\"role\":\"" + ROLE_PROVIDER
                + "\",\"name\":\"" + sanitize(displayName) + "\",\"exp\":" + exp + "}"
        );
        String body = header + "." + payload;
        return body + "." + base64Url(hmac(body));
    }

    public ProviderPrincipal parse(String token) {
        if (token == null || token.isBlank()) {
            throw ApiException.unauthorized("Authentication required");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw ApiException.unauthorized("Invalid access token");
        }
        String body = parts[0] + "." + parts[1];
        String expected = base64Url(hmac(body));
        if (!constantTimeEquals(expected, parts[2])) {
            throw ApiException.unauthorized("Invalid access token");
        }
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String providerId = readJsonString(payloadJson, "sub");
        String role = readJsonString(payloadJson, "role");
        String name = readJsonString(payloadJson, "name");
        long exp = readJsonLong(payloadJson, "exp");
        if (providerId == null || providerId.isBlank()) {
            throw ApiException.unauthorized("Invalid access token");
        }
        if (!ROLE_PROVIDER.equals(role)) {
            throw ApiException.forbidden("Service provider access is required");
        }
        if (exp > 0 && Instant.now().getEpochSecond() > exp) {
            throw ApiException.unauthorized("Access token has expired");
        }
        return new ProviderPrincipal(providerId, name == null ? providerId : name, role);
    }

    private byte[] hmac(String body) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign token", exception);
        }
    }

    private static String base64Url(String value) {
        return base64Url(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "").replace("\"", "");
    }

    private static boolean constantTimeEquals(String left, String right) {
        byte[] a = left.getBytes(StandardCharsets.UTF_8);
        byte[] b = right.getBytes(StandardCharsets.UTF_8);
        if (a.length != b.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }

    private static String readJsonString(String json, String key) {
        String needle = "\"" + key + "\":\"";
        int start = json.indexOf(needle);
        if (start < 0) {
            return null;
        }
        int from = start + needle.length();
        int end = json.indexOf('"', from);
        if (end < 0) {
            return null;
        }
        return json.substring(from, end);
    }

    private static long readJsonLong(String json, String key) {
        String needle = "\"" + key + "\":";
        int start = json.indexOf(needle);
        if (start < 0) {
            return 0;
        }
        int from = start + needle.length();
        int end = from;
        while (end < json.length() && Character.isDigit(json.charAt(end))) {
            end++;
        }
        if (end == from) {
            return 0;
        }
        return Long.parseLong(json.substring(from, end));
    }
}
