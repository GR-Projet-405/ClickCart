package com.clickcart.config;
import com.clickcart.model.*;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.PasswordPolicy;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.Locale;
@Component
@ConditionalOnProperty(name="clickcart.admin.bootstrap.enabled", havingValue="true")
public class AdminAccountBootstrap implements ApplicationRunner {
 private final UserRepository users; private final PasswordEncoder encoder; private final String email,password,name;
 public AdminAccountBootstrap(UserRepository users, PasswordEncoder encoder,
   @Value("${CLICKCART_ADMIN_EMAIL:}") String email, @Value("${CLICKCART_ADMIN_PASSWORD:}") String password,
   @Value("${CLICKCART_ADMIN_NAME:Platform Administrator}") String name) {
  this.users=users; this.encoder=encoder; this.email=email.trim().toLowerCase(Locale.ROOT); this.password=password; this.name=name;
 }
 @Override public void run(ApplicationArguments args) {
  if (!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+") || !PasswordPolicy.isValid(password)) throw new IllegalStateException("Set a valid CLICKCART_ADMIN_EMAIL and a password meeting the registration password policy before enabling admin bootstrap.");
  var existing=users.findByEmail(email);
  if(existing.isPresent()) {
   if(existing.get().getRole()!=Role.PLATFORM_ADMIN) throw new IllegalStateException("Admin bootstrap email belongs to a non-admin account. Use a separate email.");
   return;
  }
  var user=new User(); var now=Instant.now(); user.setEmail(email); user.setPasswordHash(encoder.encode(password)); user.setFullName(name); user.setRole(Role.PLATFORM_ADMIN); user.setStatus(AccountStatus.ACTIVE); user.setCreatedAt(now); user.setUpdatedAt(now); user.setPasswordChangedAt(now); users.save(user);
 }
}
