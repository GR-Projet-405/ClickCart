package com.clickcart.service;
import com.clickcart.model.*;
import com.clickcart.dto.auth.ChangePasswordRequest;
import com.clickcart.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.mongodb.client.result.UpdateResult;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class ChangePasswordServiceTest {
 @Test void changesPasswordInCorrectCollectionForEveryRole() {
  for(var role:Role.values()) {
   var accounts=mock(AccountStore.class);var mongo=mock(MongoTemplate.class);var refresh=mock(RefreshTokenService.class);var attempts=mock(LoginAttemptService.class);var encoder=new BCryptPasswordEncoder(4);
   var user=new User();user.setId(role==Role.PLATFORM_ADMIN?"admin_one":"user_one");user.setRole(role);user.setPasswordHash(encoder.encode("OldPassword123"));when(accounts.findById(user.getId())).thenReturn(Optional.of(user));
   when(mongo.updateFirst(any(Query.class),any(Update.class),eq(User.class),eq(AccountStore.collection(user.getId())))).thenReturn(UpdateResult.acknowledged(1,1L,null));
   new ChangePasswordService(accounts,encoder,mongo,refresh,attempts).change(user.getId(),new ChangePasswordRequest("OldPassword123","NewPassword456","NewPassword456"));
   var update=org.mockito.ArgumentCaptor.forClass(Update.class);verify(mongo).updateFirst(any(Query.class),update.capture(),eq(User.class),eq(AccountStore.collection(user.getId())));
   var fields=(org.bson.Document)update.getValue().getUpdateObject().get("$set");assertTrue(encoder.matches("NewPassword456",fields.getString("passwordHash")));assertFalse(fields.containsKey("fullName"));
   verify(refresh).revokeAllForUser(user.getId(),RefreshToken.REASON_PASSWORD_RESET);
  }
 }
 @Test void incorrectCurrentPasswordNeverWritesPassword() {
  var accounts=mock(AccountStore.class);var mongo=mock(MongoTemplate.class);var refresh=mock(RefreshTokenService.class);var attempts=mock(LoginAttemptService.class);var encoder=new BCryptPasswordEncoder(4);
  var user=new User();user.setId("one");user.setPasswordHash(encoder.encode("OldPassword123"));when(accounts.findById("one")).thenReturn(Optional.of(user));when(attempts.recordFailure("one")).thenReturn(new LoginAttemptService.FailureOutcome(4,null));
  var service=new ChangePasswordService(accounts,encoder,mongo,refresh,attempts);
  assertThrows(BadRequestException.class,()->service.change("one",new ChangePasswordRequest("Wrong123","NewPassword456","NewPassword456")));verifyNoInteractions(mongo,refresh);
 }
 @Test void rejectsMismatchReuseAndWeakPassword() {
  var accounts=mock(AccountStore.class);var mongo=mock(MongoTemplate.class);var refresh=mock(RefreshTokenService.class);var attempts=mock(LoginAttemptService.class);var encoder=new BCryptPasswordEncoder(4);
  var user=new User();user.setId("one");user.setPasswordHash(encoder.encode("OldPassword123"));when(accounts.findById("one")).thenReturn(Optional.of(user));var service=new ChangePasswordService(accounts,encoder,mongo,refresh,attempts);
  for(var request:new ChangePasswordRequest[]{new ChangePasswordRequest("OldPassword123","NewPassword456","Mismatch456"),new ChangePasswordRequest("OldPassword123","OldPassword123","OldPassword123"),new ChangePasswordRequest("OldPassword123","weak","weak")})assertThrows(BadRequestException.class,()->service.change("one",request));verifyNoInteractions(mongo,refresh);
 }
}
