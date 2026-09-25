package com.clickcart.security;

import com.clickcart.exception.ApiException;

public final class ProviderContext {

    private static final ThreadLocal<ProviderPrincipal> HOLDER = new ThreadLocal<>();

    private ProviderContext() {
    }

    public static void set(ProviderPrincipal principal) {
        HOLDER.set(principal);
    }

    public static ProviderPrincipal require() {
        ProviderPrincipal principal = HOLDER.get();
        if (principal == null) {
            throw ApiException.unauthorized("Authentication required");
        }
        return principal;
    }

    public static void clear() {
        HOLDER.remove();
    }
}
