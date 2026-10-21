import com.mongodb.client.MongoClients;
import com.mongodb.client.model.IndexOptions;
import org.bson.Document;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.clickcart.util.PasswordPolicy;
import java.util.*;

/** Run through create-admin.ps1. Credentials are read privately, never printed. */
public class CreateAdmin {
    public static void main(String[] args) {
        ((ch.qos.logback.classic.Logger)org.slf4j.LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME)).setLevel(ch.qos.logback.classic.Level.OFF);
        var console = System.console();
        if (console == null) throw new IllegalStateException("Open an interactive terminal and run create-admin.ps1.");
        char[] uri = console.readPassword("MongoDB connection URI (hidden): ");
        String database = console.readLine("Database name: ").trim();
        String email = console.readLine("New admin email: ").trim().toLowerCase(Locale.ROOT);
        String name = console.readLine("Full name: ").trim();
        char[] password = console.readPassword("New password (hidden): ");
        char[] confirm = console.readPassword("Confirm password (hidden): ");
        try {
            if (database.isBlank() || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+") || name.isBlank() || name.length() > 100) throw new IllegalArgumentException("Enter a valid database, email and name.");
            if (!Arrays.equals(password, confirm) || !PasswordPolicy.isValid(new String(password))) throw new IllegalArgumentException("Passwords must match and contain 8-64 characters including uppercase, lowercase and a number (maximum 72 UTF-8 bytes).");
            if (!"CREATE".equals(console.readLine("Create administrator %s in database %s? Type CREATE: ", email, database))) { console.printf("Cancelled. No account created.%n"); return; }
            try (var client = MongoClients.create(new String(uri))) {
                var existingPublic = client.getDatabase(database).getCollection("users").find(new Document("email", email)).first();
                if (existingPublic != null && !"PLATFORM_ADMIN".equals(existingPublic.getString("role"))) throw new IllegalArgumentException("This email belongs to a customer/provider. Use a different email.");
                var users = client.getDatabase(database).getCollection("admins");
                if (users.find(new Document("email", email)).first() != null) throw new IllegalArgumentException("That email already exists. No account was changed.");
                users.createIndex(new Document("email", 1), new IndexOptions().unique(true).name("uk_admins_email"));
                Date now = new Date();
                users.insertOne(new Document("_id", "admin_" + UUID.randomUUID()).append("email", email)
                    .append("fullName", name).append("passwordHash", new BCryptPasswordEncoder(12).encode(new String(password)))
                    .append("role", "PLATFORM_ADMIN").append("status", "ACTIVE").append("failedLoginAttempts", 0)
                    .append("tokenVersion", 0).append("createdAt", now).append("updatedAt", now).append("passwordChangedAt", now));
                console.printf("Administrator created in the admins collection. Sign in at /admin/login with the email and password you chose.%n");
            }
        } catch (IllegalArgumentException e) { console.printf("Not created: %s%n", e.getMessage()); System.exit(1); }
        catch (Exception e) { console.printf("Database operation failed. Check connectivity, permissions and unique email records. No existing account was modified.%n"); System.exit(1); }
        finally { Arrays.fill(uri, '\0'); Arrays.fill(password, '\0'); Arrays.fill(confirm, '\0'); }
    }
}
