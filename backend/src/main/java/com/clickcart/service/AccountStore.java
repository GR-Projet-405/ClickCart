package com.clickcart.service;

import com.clickcart.model.*;
import com.clickcart.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;
import java.util.*;

/** Admin identities live only in admins. Namespaced IDs keep sessions isolated. */
@Service
public class AccountStore {
    public static final String ADMINS = "admins";
    public static final String ADMIN_PREFIX = "admin_";
    private final UserRepository users;
    private final MongoTemplate mongo;
    public AccountStore(UserRepository users, MongoTemplate mongo) { this.users=users; this.mongo=mongo; }
    public static String collection(String id) { return id != null && id.startsWith(ADMIN_PREFIX) ? ADMINS : "users"; }
    public Optional<User> findAdminByEmail(String email) {
        return Optional.ofNullable(mongo.findOne(Query.query(Criteria.where("email").is(email).and("role").is(Role.PLATFORM_ADMIN)), User.class, ADMINS))
                .filter(u -> u.getId() != null && u.getId().startsWith(ADMIN_PREFIX));
    }
    public Optional<User> findByEmail(String email) {
        var admin=findAdminByEmail(email);
        return admin.isPresent() ? admin : users.findByEmail(email).filter(u -> u.getRole()!=Role.PLATFORM_ADMIN);
    }
    public Optional<User> findPublicByEmail(String email) { return users.findByEmail(email); }
    public Optional<User> findById(String id) {
        if (ADMINS.equals(collection(id))) return Optional.ofNullable(mongo.findById(id,User.class,ADMINS)).filter(u -> u.getRole()==Role.PLATFORM_ADMIN);
        return users.findById(id).filter(u -> u.getRole()!=Role.PLATFORM_ADMIN);
    }
    public boolean existsByEmail(String email) { return users.existsByEmail(email) || mongo.exists(Query.query(Criteria.where("email").is(email)),ADMINS); }
    public User save(User user) {
        if(user.getRole()==Role.PLATFORM_ADMIN) {
            if(user.getId()==null) user.setId(ADMIN_PREFIX+UUID.randomUUID());
            if(!user.getId().startsWith(ADMIN_PREFIX)) throw new IllegalArgumentException("Administrator IDs must start with admin_");
            return mongo.save(user,ADMINS);
        }
        if(ADMINS.equals(collection(user.getId()))) throw new IllegalArgumentException("Administrator identity cannot be saved as a public user");
        return users.save(user);
    }
}
