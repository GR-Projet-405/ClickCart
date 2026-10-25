package com.clickcart.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Runs the admin identity, role and suspended-account tests with production security enabled. */
@WebMvcTest(controllers = AdminWorkspaceController.class, properties = {
        "clickcart.security.enabled=true",
        "clickcart.security.issuer-uri=",
        "JWT_SECRET=admin-workspace-test-secret-that-is-long-enough"
})
class ProductionAdminSecurityTest extends AdminWorkspaceSecurityTest {
    @Autowired ApplicationContext context;

    @Test void appLoginDoesNotRequireAnExternalIssuer() {
        assertTrue(context.getBeansOfType(JwtDecoder.class).isEmpty());
    }

    @Test void malformedTokenCannotAccessAdminWorkspace() throws Exception {
        mvc.perform(get("/api/admin/workspace/profile")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }
}
