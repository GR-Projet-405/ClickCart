# Administrator accounts in the separate `admins` collection

Admin login: `/admin/login` (locally `http://localhost:5173/admin/login`).

## Where the data lives

- `admins`: administrator identity, BCrypt password hash, name, phone, photo, account status and security fields.
- `users`: customer/provider identities. Old administrator documents in this collection no longer grant admin access.
- `refresh_tokens` and `password_reset_codes`: shared session/reset storage. Administrator IDs start with `admin_` so they cannot collide with public user IDs.

The backend creates `admins` and the unique email index at startup. The collection was also initialized in the configured `clickcart` database during this change; it was verified empty. Refresh your Compass/Atlas collection list to see it. No real administrator password or account has been chosen for you.

## Add your administrator directly to MongoDB

In PowerShell, from the project folder:

```powershell
.\backend\tools\create-admin.ps1
```

The tool connects directly to MongoDB; the backend does not have to be running. It asks for:
1. MongoDB connection URI (hidden input).
2. The exact database name used by your backend, e.g. `clickcart`.
3. Your chosen administrator email and name.
4. Your own password twice (hidden input): 8–64 characters including uppercase, lowercase and a number; maximum 72 UTF-8 bytes.
5. Type `CREATE` after checking the target database/email.

It creates a document in **`admins`**, with a unique `admin_` ID, `role: PLATFORM_ADMIN`, `status: ACTIVE`, BCrypt cost-12 hash and timestamps. It never stores a plain password. Existing administrators are not overwritten. An existing customer/provider email is rejected. If an old admin exists only in `users`, you may use that email to create a new `admins` account with your chosen password; the old record is left unchanged and does not authorize admin login.

No administrator email/password settings in `.env` are used. The old bootstrap has been removed. The application still needs its normal database connection and JWT signing secret configured. Do not commit database credentials or passwords.

## View and verify in Compass / mongosh

Open database `clickcart`, then collection **admins**. After running the tool, filter by the email you entered. Equivalent mongosh query:

```javascript
db.admins.findOne(
  { email: "your-chosen-admin-email@example.com" },
  { fullName: 1, email: 1, role: 1, status: 1, createdAt: 1 }
)
```

Do not manually paste a plain password into `passwordHash`. Use the tool so the hash, ID and security fields are correct. If you initialize a different database later:

```powershell
.\backend\tools\initialize-admins.ps1
```

This reads only the existing `MONGODB_URI` and `DATABASE_NAME` connection settings and creates an empty `admins` collection/index. It does not insert accounts or migrate users.

## Sign in and edit your profile

Restart the backend after these code changes, start the frontend and open `/admin/login`. Use your chosen email/password. Open **My Profile** to update your name, phone and DP; save persists to `admins`. Photos accept valid PNG/JPEG under 500 KB and 2048 × 2048 pixels.

Admin login, session refresh, current-account lookup, lockout and password reset now resolve the separate collection. Password reset email delivery must be configured. Suspended/deleted admins and tokens issued before an admin password reset are rejected. Existing users-collection admin sessions must sign in again using a newly created `admins` account.

Dashboard counts and lists use the real database. Mock panels are removed. These changes do not implement a live payment gateway or the removed moderation/support workflows.
