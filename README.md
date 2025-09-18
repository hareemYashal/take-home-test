# Shopify Analytics MVP

A Next.js application that integrates with Shopify to provide analytics for the last 30 days. Built for a DTC ecommerce brokerage MVP.

## 🚀 Live Demo

**Deployed URL:** [Coming Soon - Will be added after Vercel deployment]

## 📋 Features

- **Shopify OAuth Integration**: Secure connection to Shopify stores
- **30-Day Metrics**: Orders count, gross revenue, refunds, net revenue, and AOV
- **Dubai Timezone Support**: All date calculations use Dubai time (UTC+4)
- **Secure Token Storage**: Access tokens stored securely in PostgreSQL
- **Audit Logging**: Track OAuth events and API calls
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Responsive UI**: Clean, functional interface (function over form)

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Shopify OAuth 2.0
- **HTTP Client**: Axios
- **Testing**: Jest with React Testing Library
- **Deployment**: Vercel

## 📊 Database Schema

```
┌─────────────────┐       ┌─────────────────┐
│     shops       │       │   audit_log     │
├─────────────────┤       ├─────────────────┤
│ id (UUID)       │◄──────┤ shop_id (UUID)  │
│ shop_domain     │       │ id (UUID)       │
│ access_token    │       │ actor           │
│ api_scope       │       │ action          │
│ created_at      │       │ meta (JSON)     │
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Shopify Partner account with a dev store
- Supabase account (optional, for managed PostgreSQL)

### 1. Clone and Install

```bash
git clone <repository-url>
cd shopify-next
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# App Configuration
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development

# Database (use Supabase URL or local PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/shopify_analytics

# Supabase (if using Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Shopify App Credentials
SHOPIFY_APP_KEY=your-app-key
SHOPIFY_APP_SECRET=your-app-secret
SHOPIFY_SCOPES=read_orders,read_products,read_customers

# For production deployment
VERCEL_URL=your-vercel-url
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Shopify App Setup

1. Create a Shopify Partner account
2. Create a new app in your Partner dashboard
3. Set the OAuth callback URL to: `http://localhost:3000/api/auth/shopify/callback`
4. Copy the API key and secret to your `.env` file
5. Create a dev store and add some test orders with refunds

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and connect your Shopify store!

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The tests include:
- **Metrics Aggregator Tests**: Validates calculation logic with mocked Shopify responses
- **API Route Tests**: Tests the `/api/shops/[id]/metrics` endpoint for response shape and error handling

### Test Coverage

- ✅ Metrics calculation with orders and refunds
- ✅ Zero metrics when no orders exist
- ✅ API error handling and graceful fallbacks
- ✅ Response shape and type validation
- ✅ Monetary value rounding to 2 decimal places

## 📡 API Documentation

### Endpoints

#### `POST /api/auth/shopify`
Initiate Shopify OAuth flow.

**Request:**
```json
{
  "shopDomain": "your-store.myshopify.com"
}
```

**Response:**
```json
{
  "oauthUrl": "https://your-store.myshopify.com/admin/oauth/authorize?..."
}
```

#### `GET /api/auth/shopify/callback`
OAuth callback endpoint (handled automatically by Shopify).

#### `GET /api/shops/{id}/metrics`
Get 30-day metrics for a connected shop.

**Response:**
```json
{
  "shopId": "uuid",
  "fromDate": "2023-12-01T00:00:00.000Z",
  "toDate": "2023-12-31T23:59:59.999Z",
  "ordersCount": 25,
  "grossRevenue": 2500.00,
  "currency": "USD",
  "avgOrderValue": 100.00,
  "refundedAmount": 250.00,
  "netRevenue": 2250.00
}
```

## 🔒 Security Features

- **Token Security**: Access tokens never exposed in logs or client responses
- **Secret Redaction**: Automatic redaction of sensitive data in server logs
- **Secure Storage**: Tokens stored in PostgreSQL, not cookies or localStorage
- **Audit Logging**: All OAuth events and API calls are logged
- **Input Validation**: Shop domains are sanitized and validated

## 🌍 Timezone Handling

All date calculations use **Dubai timezone (UTC+4)**:
- "Last 30 days" means 30 calendar days inclusive of today
- Date ranges are calculated in Dubai time
- Shopify API calls use ISO timestamps converted from Dubai time

## 📈 Production Hardening

For production deployment, consider these improvements:

1. **Rate Limiting**: Implement rate limiting on API routes
2. **Caching**: Add Redis cache for metrics (60-second TTL suggested)
3. **Monitoring**: Add application monitoring (Sentry, DataDog)
4. **Database**: Use connection pooling (PgBouncer)
5. **Security**: Add CSRF protection and request validation
6. **Webhooks**: Listen to Shopify webhooks for real-time updates
7. **Error Boundaries**: Add React error boundaries for better UX
8. **Logging**: Structured logging with correlation IDs
9. **Backup**: Automated database backups
10. **SSL**: Ensure all communications use HTTPS

## 🎯 Key Decisions Made

1. **Prisma over Raw SQL**: Chose Prisma for type safety and easier migrations
2. **Dubai Timezone**: Hard-coded UTC+4 offset as specified in requirements
3. **Graceful Degradation**: Return zero metrics if Shopify API fails
4. **Function over Form**: Minimal UI styling, focused on functionality
5. **Inclusive Date Range**: 30 days includes today (29 days ago + today)
6. **Monetary Rounding**: All currency values rounded to 2 decimal places
7. **Audit Logging**: Track both successful and failed OAuth attempts

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/shopify/        # OAuth routes
│   │   └── shops/[id]/metrics/  # Metrics API
│   └── page.tsx                 # Main UI
├── lib/
│   ├── prisma.ts               # Database client
│   ├── shopify.ts              # Shopify API client
│   ├── security.ts             # Secret redaction
│   └── date-utils.ts           # Dubai timezone utilities
└── __tests__/                  # Test files
```

## 📝 Test Report

```bash
npm test
```

Expected output:
```
PASS  src/__tests__/metrics.test.ts
PASS  src/__tests__/api-metrics.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.5s
```

## 🎬 Demo Video

**Loom Walkthrough:** [Link will be added after recording]

The demo covers:
- OAuth flow from start to finish
- Database inspection after connection
- Metrics API call and response
- Comparison with Shopify Analytics dashboard
- Test suite execution
- Code walkthrough and architecture decisions

---

**Time Investment:** ~5 hours total
**Completion Date:** [To be filled]
**Author:** [Your name]