package com.clickcart.controller;
import com.clickcart.config.SecurityConfig;
import com.clickcart.model.*;
import com.clickcart.service.AccountStore;
import com.clickcart.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(controllers=AdminWorkspaceController.class, properties={"clickcart.security.enabled=false", "JWT_SECRET=admin-workspace-test-secret-that-is-long-enough"})
@Import(SecurityConfig.class)
class AdminWorkspaceSecurityTest {
 @Autowired MockMvc mvc;
 @Autowired JwtUtil tokens;
 @MockitoBean AccountStore users;
 @MockitoBean com.clickcart.repository.ProviderVerificationRepository verifications;
 @MockitoBean MongoTemplate mongo;
 @MockitoBean(name="mongoMappingContext") MongoMappingContext mapping;
 private User user(String id, Role role) { var u=new User();u.setId(id);u.setRole(role);u.setEmail(id+"@example.com");u.setFullName("Admin Name");u.setPasswordHash("must-not-leak");return u; }
 private String token(User u) { return "Bearer "+tokens.generateAccessToken(u); }
 @Test void onlyAdminsCanReadDashboard() throws Exception {
   mvc.perform(get("/api/admin/workspace/summary")).andExpect(status().isUnauthorized());
   when(users.findById("customer")).thenReturn(Optional.of(user("customer",Role.CUSTOMER)));
   mvc.perform(get("/api/admin/workspace/profile").header("Authorization",token(user("customer",Role.CUSTOMER)))).andExpect(status().isForbidden());
   verifyNoInteractions(mongo);
 }
 @Test void profileUsesSessionIdentityAndNeverLeaksHash() throws Exception {
   var u=user("alice",Role.PLATFORM_ADMIN);when(users.findById("alice")).thenReturn(Optional.of(u));
   mvc.perform(get("/api/admin/workspace/profile").param("id","bob").header("Authorization",token(u))).andExpect(status().isOk()).andExpect(jsonPath("$.id").value("alice")).andExpect(jsonPath("$.passwordHash").doesNotExist());
   verify(users,never()).findById("bob");
 }
 @Test void suspendedAdminIsDenied() throws Exception {
   var u=user("alice",Role.PLATFORM_ADMIN);u.setStatus(AccountStatus.SUSPENDED);when(users.findById("alice")).thenReturn(Optional.of(u));
   mvc.perform(get("/api/admin/workspace/summary").header("Authorization",token(u))).andExpect(status().isUnauthorized());
   verifyNoInteractions(mongo);
 }
 @Test void updateOnlyChangesOwnProfileFields() throws Exception {
   var u=user("alice",Role.PLATFORM_ADMIN);when(users.findById("alice")).thenReturn(Optional.of(u));
   mvc.perform(put("/api/admin/workspace/profile").header("Authorization",token(u)).contentType("application/json").content("{\"fullName\":\"New Name\",\"phone\":\"+94771234567\",\"avatar\":\"\",\"id\":\"bob\",\"role\":\"CUSTOMER\"}")).andExpect(status().isOk());
   var query=org.mockito.ArgumentCaptor.forClass(Query.class);var update=org.mockito.ArgumentCaptor.forClass(Update.class);
   verify(mongo).updateFirst(query.capture(),update.capture(),eq(User.class),eq(AccountStore.ADMINS));
   assertEquals("alice",query.getValue().getQueryObject().get("_id"));
   var fields=(org.bson.Document)update.getValue().getUpdateObject().get("$set");
   assertEquals("New Name",fields.get("fullName"));assertFalse(fields.containsKey("role"));assertFalse(fields.containsKey("passwordHash"));
 }
 @Test void rejectsInvalidProfileAndImage() throws Exception {
   var u=user("alice",Role.PLATFORM_ADMIN);when(users.findById("alice")).thenReturn(Optional.of(u));
   mvc.perform(put("/api/admin/workspace/profile").header("Authorization",token(u)).contentType("application/json").content("{\"fullName\":\"\",\"phone\":\"bad\"}")).andExpect(status().isBadRequest());
   mvc.perform(put("/api/admin/workspace/profile").header("Authorization",token(u)).contentType("application/json").content("{\"fullName\":\"Admin\",\"avatar\":\"data:image/svg+xml;base64,PHN2Zz4=\"}")).andExpect(status().isBadRequest());
   verifyNoInteractions(mongo);
 }
 @Test void avatarValidationAcceptsRealPngAndRejectsFake() throws Exception {
   var output=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(2,2,java.awt.image.BufferedImage.TYPE_INT_RGB),"png",output);
   assertDoesNotThrow(()->AdminWorkspaceController.validateAvatar("data:image/png;base64,"+java.util.Base64.getEncoder().encodeToString(output.toByteArray())));
   assertThrows(org.springframework.web.server.ResponseStatusException.class,()->AdminWorkspaceController.validateAvatar("data:image/png;base64,bm90LWFuLWltYWdl"));
 }
}
