# PetSoft

PetSoft is a Next.js web app for managing a pet daycare: sign up, log in, track pets under your care, and unlock access via Stripe payment.

## Features

- **Auth (Credentials)** via NextAuth/Auth.js v5 (beta)
- **Paywall / access gating**: users without payment are redirected to `/payment`
- **Pet management**: add, edit, and check out pets (Postgres + Prisma)
- **Search + details view** for current guests

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- NextAuth/Auth.js (Credentials)
- Stripe Checkout + webhook

## Getting Started (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the repo root.

Required:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
STRIPE_SECRET_KEY="sk_test_..."
```

Recommended:

```bash
# Used as a fallback to build Stripe success/cancel URLs in a couple flows.
# In many deployments this can be your public site URL.
CANONICAL_URL="http://localhost:3000"

# Stripe webhook signing secret (required if you want the webhook route to work)
STRIPE_WEBHOOK_SECRET="whsec_..."

# NextAuth/Auth.js secret (required for production deployments)
# Depending on your Auth.js version, this may be AUTH_SECRET or NEXTAUTH_SECRET.
AUTH_SECRET="<random-32+>"
```

Notes:

- Stripe Checkout uses a **hard-coded Price ID** (`price_...`) in server code; replace it with your own Stripe Price.
- Auth config uses `trustHost: true` to work reliably behind proxies/tunnels.

### 3) Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

Optional: seed sample data

```bash
npx prisma db seed
```

The seed creates a user:

- Email: `example@gmail.com`
- Password: `welcome@1234`

### 4) Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Stripe Setup

### Checkout

The app starts a Stripe Checkout session from:

- `GET /api/stripe/checkout` (redirects the browser to Stripe)

After payment, Stripe returns to `/payment?success=true&session_id=...`, and the app confirms the session and marks the current user as paid.

### Webhook (recommended)

There is also a webhook endpoint:

- `POST /api/stripe`

It listens for `checkout.session.completed` and sets `hasPaid=true` for the matching user (by email). To test locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe
```

Then set `STRIPE_WEBHOOK_SECRET` to the `whsec_...` value printed by the Stripe CLI.

## Project Structure

- `src/app/(maketing)/page.tsx`: landing page
- `src/app/(auth)/*`: signup/login/payment routes
- `src/app/(app)/app/*`: authenticated app routes (dashboard/account)
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth route handlers
- `src/app/api/stripe/*`: Stripe checkout + webhook endpoints
- `src/app/actions/action.ts`: server actions (auth, pets CRUD, Stripe confirmation)
- `prisma/schema.prisma`: Prisma models for `User` + `Pet`

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

## Deployment Notes

- Configure all env vars in your hosting provider.
- Ensure your Stripe webhook is pointing to `https://<your-domain>/api/stripe`.
- For Stripe return URLs to be correct behind proxies, the app uses request headers (`x-forwarded-*`) when available.

## License

No license file is included yet. If you plan to open source this, add a `LICENSE`.
