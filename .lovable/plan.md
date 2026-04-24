

## Add Password Reset Flow

Currently the app only has sign-in — there's no way to reset a forgotten password from the UI. I'll add a complete self-service password reset flow so you don't need to touch the backend dashboard.

### What you'll get

1. **"Forgot password?" link** on the sign-in page
2. **Forgot password page** (`/forgot-password`) — enter your email, receive a reset link
3. **Reset password page** (`/reset-password`) — set a new password after clicking the email link
4. Default Lovable Cloud reset emails will be sent automatically (no email setup required)

### Flow

```text
Sign-in page  ──[Forgot password?]──►  /forgot-password
                                            │
                                            │ enter email
                                            ▼
                              supabase.auth.resetPasswordForEmail()
                                            │
                                            ▼
                              Email arrives with reset link
                                            │
                                            ▼
                              /reset-password (type=recovery)
                                            │
                                            │ enter new password
                                            ▼
                              supabase.auth.updateUser({ password })
                                            │
                                            ▼
                                      Redirect to /
```

### Files to add / change

- **New** `src/routes/forgot-password.tsx` — email input form, calls `resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- **New** `src/routes/reset-password.tsx` — public route (bypasses `AuthGate`), detects `type=recovery` in URL hash, shows new-password form, calls `updateUser({ password })`
- **Edit** `src/components/SignInPage.tsx` — add "Forgot password?" link below the password field, navigating to `/forgot-password`
- **Edit** auth gate logic — allow `/forgot-password` and `/reset-password` to render without an active session

### Notes about emails

- Lovable Cloud sends the default password reset email out of the box — no domain or email infrastructure setup required.
- If you later want the email to come from your own branded address (e.g. `noreply@acornactivations.co.za`), we can set up a custom email domain and branded templates as a follow-up.

### Out of scope

- Branded/custom email templates (can be added later)
- Rate limiting beyond Supabase's defaults
- Changing password while signed in (separate "change password" flow in Settings)

