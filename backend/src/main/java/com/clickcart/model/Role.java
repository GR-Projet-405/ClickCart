package com.clickcart.model;

/**
 * Platform roles (SRS IAM-004). Spring Security authorities are "ROLE_" + name().
 */
public enum Role {
    CUSTOMER,
    SERVICE_PROVIDER,
    PLATFORM_ADMIN;

    /** Only these roles may be chosen on the public registration form; admins are provisioned internally. */
    public boolean isSelfRegistrable() {
        return this == CUSTOMER || this == SERVICE_PROVIDER;
    }

    public String authority() {
        return "ROLE_" + name();
    }
}
