package com.clickcart.security;
import com.clickcart.exception.*;
import org.springframework.security.core.context.SecurityContextHolder;
public final class CurrentCustomer {
 private CurrentCustomer() {}
 public static String id() {
  var auth=SecurityContextHolder.getContext().getAuthentication();
  if(auth==null || !auth.isAuthenticated() || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) throw new UnauthorizedException("Sign in to continue");
  if(auth.getAuthorities().stream().noneMatch(a->"ROLE_CUSTOMER".equals(a.getAuthority()))) throw new ForbiddenException("Customer access required");
  return auth.getName();
 }
}
