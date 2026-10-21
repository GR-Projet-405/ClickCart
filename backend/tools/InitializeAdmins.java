import com.mongodb.client.MongoClients;
import com.mongodb.client.model.IndexOptions;
import io.github.cdimascio.dotenv.Dotenv;
import org.bson.Document;
/** Creates the empty admins collection and unique email index without inserting accounts. */
public class InitializeAdmins {
 public static void main(String[] args) {
  ((ch.qos.logback.classic.Logger)org.slf4j.LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME)).setLevel(ch.qos.logback.classic.Level.OFF);
  try {
   var env=Dotenv.configure().ignoreIfMissing().load();
   String uri=env.get("MONGODB_URI"), database=env.get("DATABASE_NAME");
   if(uri==null || database==null || database.isBlank()) throw new IllegalArgumentException();
   try(var client=MongoClients.create(uri)) {
    var admins=client.getDatabase(database).getCollection("admins");
    admins.createIndex(new Document("email",1),new IndexOptions().unique(true).name("uk_admins_email"));
    System.out.println("Verified database: "+database+"; collection: admins; unique email index ready; existing administrator count: "+admins.countDocuments());
   }
  } catch(Exception e) { System.err.println("Could not initialize admins. Check database connectivity, permissions and duplicate emails. Connection details have not been printed."); System.exit(1); }
 }
}
