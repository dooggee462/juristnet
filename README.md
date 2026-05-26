# JuristNet — Legal Services Marketplace

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally (or Docker)
- Stripe account (for payments)

### 1. Environment
```bash
cp .env.example .env
# Fill in your values in .env
```

### 2. Database
```bash
# With Docker:
docker compose up postgres -d

# Push schema
cd backend && npm run db:push
```

### 3. Backend
```bash
cd backend
npm install
npm run dev          # Runs on :4000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev          # Runs on :5173
```

### Full Docker Stack
```bash
cp .env.example .env  # fill in values
docker compose up --build
```

## Stripe Setup
1. Create a product + recurring price in Stripe Dashboard
2. Set `STRIPE_PRICE_ID` in `.env`
3. Run `stripe listen --forward-to localhost:4000/api/stripe/webhook`
4. Set the printed webhook secret as `STRIPE_WEBHOOK_SECRET`

## Architecture

```
legal-marketplace/
├── backend/
│   ├── prisma/schema.prisma     # DB schema (PostgreSQL)
│   └── src/
│       ├── routes/              # auth, jurists, listings, reviews, messages, stripe, analytics
│       ├── middleware/          # JWT auth, error handler
│       └── utils/               # Prisma client
├── frontend/
│   └── src/
│       ├── pages/               # Landing, Listings, JuristProfile, JuristAuth, Dashboard, Inbox
│       ├── components/          # Navbar, StarRating, Badge
│       ├── store/               # Zustand auth store
│       └── lib/                 # Axios API client
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Jurist registration |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | JWT | Current jurist |
| GET | /api/jurists | — | List/search jurists |
| GET | /api/jurists/:id | — | Single jurist profile |
| POST | /api/jurists/:id/phone-click | — | Track phone reveal |
| PUT | /api/jurists/me/profile | JWT | Update own profile |
| GET | /api/listings | — | Browse listings |
| POST | /api/listings | JWT | Create listing |
| PUT | /api/listings/:id | JWT | Update listing |
| DELETE | /api/listings/:id | JWT | Delete listing |
| POST | /api/reviews/listing/:id | — | Post review |
| POST | /api/messages/jurist/:id | — | Send message |
| GET | /api/messages/inbox | JWT | Jurist inbox |
| GET | /api/analytics/dashboard | JWT | Dashboard stats |
| POST | /api/stripe/create-checkout | JWT | Start subscription |
| POST | /api/stripe/portal | JWT | Billing portal |
| POST | /api/stripe/webhook | Stripe | Webhook handler |
