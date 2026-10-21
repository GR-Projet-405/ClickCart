package com.clickcart.service;
import com.clickcart.model.*;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class AdminAccountStoreTest {
 @Test void adminIdsNeverFallBackToUsers() {
  var users=mock(UserRepository.class);var mongo=mock(MongoTemplate.class);var store=new AccountStore(users,mongo);
  assertTrue(store.findById("admin_missing").isEmpty());verify(mongo).findById("admin_missing",User.class,"admins");verifyNoInteractions(users);
 }
 @Test void legacyUserAdminIsNotAnAdminIdentity() {
  var users=mock(UserRepository.class);var mongo=mock(MongoTemplate.class);var store=new AccountStore(users,mongo);
  var old=new User();old.setRole(Role.PLATFORM_ADMIN);when(users.findById("legacy")).thenReturn(Optional.of(old));
  assertTrue(store.findById("legacy").isEmpty());
 }
 @Test void adminSaveUsesSeparateCollectionAndNamespacedId() {
  var users=mock(UserRepository.class);var mongo=mock(MongoTemplate.class);var store=new AccountStore(users,mongo);
  var admin=new User();admin.setRole(Role.PLATFORM_ADMIN);store.save(admin);
  assertTrue(admin.getId().startsWith("admin_"));verify(mongo).save(admin,"admins");verifyNoInteractions(users);
 }
 @Test void adminTokenChecksCurrentDatabaseStatusAndPasswordVersion() {
  var accounts=mock(AccountStore.class);var factory=new StaticListableBeanFactory();factory.addBean("accounts",accounts);
  var jwt=new JwtUtil("test-admin-secret-that-is-long-enough-for-hs256-signing",15);jwt.setAccounts(factory.getBeanProvider(AccountStore.class));
  var admin=new User();admin.setId("admin_one");admin.setEmail("admin@example.test");admin.setRole(Role.PLATFORM_ADMIN);
  when(accounts.findById("admin_one")).thenReturn(Optional.of(admin));var token=jwt.generateAccessToken(admin);
  assertTrue(jwt.parseAccessToken(token).isPresent());
  admin.setStatus(AccountStatus.SUSPENDED);assertTrue(jwt.parseAccessToken(token).isEmpty());
  admin.setStatus(AccountStatus.ACTIVE);admin.setTokenVersion(1);assertTrue(jwt.parseAccessToken(token).isEmpty());
  when(accounts.findById("admin_one")).thenReturn(Optional.empty());assertTrue(jwt.parseAccessToken(token).isEmpty());
 }
}
