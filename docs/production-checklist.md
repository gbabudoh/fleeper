# Fleeper — Production Checklist

## Code Status

**100% complete.** Everything is built, committed, and pushed to `master`.

---

## Before Go-Live — 5 Config Steps

### 1. Set Production Environment Variables

Set the following on your hosting platform (Vercel → Project Settings → Environment Variables):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | 32+ random chars — `openssl rand -hex 32` |
| `ADMIN_SESSION_SECRET` | 32+ random chars — `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | `sk_live_...` from Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe webhook endpoint |
| `PLAID_CLIENT_ID` | From Plaid dashboard |
| `PLAID_SECRET` | From Plaid dashboard (production) |
| `PLAID_ENV` | `production` |
| `PLAID_REDIRECT_URI` | `https://yourdomain.com/dashboard/pools` |
| `RESEND_API_KEY` | `re_...` from Resend dashboard |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` |

### 2. Run Migrations on Production Database

```bash
npx prisma migrate deploy
```

Run this once after deploying. Applies all pending migrations without prompting.

### 3. Create Admin Account

```bash
ADMIN_EMAIL=you@yourdomain.com ADMIN_PASSWORD=yourpassword123 ADMIN_NAME="Your Name" npm run seed:admin
```

- Both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are required
- Password must be at least 12 characters
- Safe to re-run — upserts on email, no duplicates

Admin panel is at `/admin/login`.

### 4. Register Stripe Webhook

In your [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. Click **Add endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events to listen for: `payment_intent.succeeded`
4. Copy the `whsec_...` signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 5. Verify Sending Domain in Resend

In your [Resend Dashboard](https://resend.com):

1. Go to **Domains → Add Domain**
2. Add and verify your sending domain (e.g. `mail.yourdomain.com`)
3. Update the `from` address in `lib/email.ts` to match your verified domain

This ensures receipt emails and password reset emails don't land in spam.

---

## External Approvals (Allow Extra Time)

These require third-party review — start them early.

| Service | What to do | Typical wait |
|---|---|---|
| **Plaid** | Submit production access request via Plaid dashboard with your use case | 2–5 days |
| **Stripe Connect** | If onboarding other users to accept payments, Stripe reviews your platform | 1–2 days |

---

## Health Check

Once deployed, verify the app is running:

```
GET https://yourdomain.com/api/health
```

Returns `200 { "status": "ok", "db": "ok" }` if everything is connected.
Returns `503 { "status": "error", "db": "unreachable" }` if the database is down.

---

## Demo Account

A demo account is available for testing:

| | |
|---|---|
| **Email** | demo@fleeper.com |
| **Password** | password101 |
| **Profile** | `/demo` |

Re-seed at any time with:

```bash
npm run seed
```
