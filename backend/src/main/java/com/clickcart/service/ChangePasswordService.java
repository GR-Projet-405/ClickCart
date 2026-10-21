package com.clickcart.service;
import com.clickcart.dto.auth.ChangePasswordRequest;
import com.clickcart.exception.*;
import com.clickcart.model.*;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import java.time.Instant;
@Service
public class ChangePasswordService {
 private final AccountStore accounts; private final PasswordEncoder encoder; private final MongoTemplate mongo; private final RefreshTokenService refresh; private final LoginAttemptService attempts;
 public ChangePasswordService(AccountStore accounts, PasswordEncoder encoder, MongoTemplate mongo, RefreshTokenService refresh, LoginAttemptService attempts) {this.accounts=accounts;this.encoder=encoder;this.mongo=mongo;this.refresh=refresh;this.attempts=attempts;}
 public void change(String id, ChangePasswordRequest request) {
  var user=accounts.findById(id).orElseThrow(()->new UnauthorizedException("Please sign in again."));
  if(user.getStatus()!=AccountStatus.ACTIVE) throw AuthException.accountSuspended();
  var now=Instant.now();
  if(user.getLockedUntil()!=null && user.getLockedUntil().isAfter(now)) throw AuthException.accountLocked(user.getLockedUntil());
  if(!encoder.matches(request.currentPassword(),user.getPasswordHash())) {
   var result=attempts.recordFailure(id);
   if(result.locked()) throw AuthException.accountLocked(result.lockedUntil());
   throw new BadRequestException("Current password is incorrect.");
  }
  if(!request.newPassword().equals(request.confirmPassword())) throw new BadRequestException("New passwords do not match.");
  if(!com.clickcart.util.PasswordPolicy.isValid(request.newPassword())) throw new BadRequestException(com.clickcart.util.PasswordPolicy.REQUIREMENTS_MESSAGE);
  if(encoder.matches(request.newPassword(),user.getPasswordHash())) throw new BadRequestException("Choose a password different from your current password.");
  var result=mongo.updateFirst(Query.query(Criteria.where("_id").is(id).and("passwordHash").is(user.getPasswordHash()).and("tokenVersion").is(user.getTokenVersion())),
   new Update().set("passwordHash",encoder.encode(request.newPassword())).set("passwordChangedAt",now).set("updatedAt",now).inc("tokenVersion",1).set("failedLoginAttempts",0).unset("lockedUntil"),User.class,AccountStore.collection(id));
  if(result.getModifiedCount()!=1) throw new BadRequestException("Your account changed. Sign in again before retrying.");
  refresh.revokeAllForUser(id,RefreshToken.REASON_PASSWORD_RESET);
  mongo.updateMulti(Query.query(Criteria.where("userId").is(id).and("usedAt").is(null)),new Update().set("invalidatedAt",now),PasswordResetCode.class);
 }
}
