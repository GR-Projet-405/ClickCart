# Administrator sign-in

Open `/admin/login` on the frontend (locally: http://localhost:5173/admin/login).
Customer/provider sign-in remains at `/login`. The server checks the stored account role before issuing a session. Public registration cannot create administrator accounts.

## Create the first real administrator

In the backend `.env` file, set these values using your own email and a strong password:

```properties
clickcart.admin.bootstrap.enabled=true
CLICKCART_ADMIN_EMAIL=your-admin-email@example.com
CLICKCART_ADMIN_PASSWORD=your-own-strong-password
CLICKCART_ADMIN_NAME=Platform Administrator
```

Replace the password placeholder with your own password: 8–64 characters including an uppercase letter, a lowercase letter and a number (at most 72 UTF-8 bytes). Start the backend once. It creates the administrator in the configured MongoDB database with a hashed password. Existing accounts are not overwritten or promoted.

Then remove the bootstrap password and set `clickcart.admin.bootstrap.enabled=false`. Restart the backend and sign in at `/admin/login` with the email and password you chose. Never commit `.env` or credentials to GitHub.

If an administrator already exists, use its credentials; bootstrap does not reset passwords. Use the password reset flow if your email delivery is configured.
