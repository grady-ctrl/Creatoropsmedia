# Creator Ops Division — Creator Network Dashboard

**Production-ready TikTok LIVE agency management platform for Creator Ops Division (CreatorOps.us)**

© Syndicate Holdings Group LLC • Spartanburg, South Carolina, USA

---

## 🚀 Overview

A comprehensive, secure, multi-role dashboard for operating a TikTok LIVE creator network at scale. Manage onboarding, live operations, payouts, referrals, CRM, compliance, and reporting—all in one platform.

### Key Features

- **Multi-Role Access Control**: Admin, Manager, Creator, Finance roles with RBAC
- **Real-Time Dashboard**: KPIs, charts, leaderboards, and alerts
- **Creator CRM**: Full lifecycle management from lead to active creator
- **Live Operations**: Real-time monitoring and daily leaderboards
- **Payout Management**: Automated calculations, bulk processing, CSV/Sheets export
- **Referral Tracking**: Monitor creator referrals and bonuses
- **Support System**: Ticket management with Discord/Lark escalations
- **Compliance Monitoring**: KYC, age verification, content flags
- **Integrations**: Discord, Lark, Notion, Google Sheets, Zapier
- **Background Jobs**: Nightly rollups and automated syncs
- **Audit Logging**: Complete change tracking for compliance

---

## ⚡ Quick Deploy

### Deploy to Vercel in 3 Steps

1. **Set up a free database at [Neon.tech](https://neon.tech)**
2. **Click this button:**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

3. **Add your database URL and deploy!**

📖 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (Email magic link + Google OAuth)
- **State**: Zustand for client state
- **Forms**: react-hook-form + zod
- **Charts**: Recharts
- **Background Jobs**: BullMQ with Upstash Redis
- **Rate Limiting**: Upstash Ratelimit
- **Logging**: Pino
- **Testing**: Playwright
- **Deployment**: Vercel (recommended)

---

## 📋 Prerequisites

- **Node.js** >= 18.17.0
- **pnpm** (recommended) or npm
- **PostgreSQL** database (Neon, Supabase, or local)
- **Redis** instance (Upstash recommended)

---

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url> creator-ops-dashboard
cd creator-ops-dashboard
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

#### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/creatorops"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"

# Email (for magic links)
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="<your-sendgrid-api-key>"
EMAIL_FROM="noreply@creatorops.us"
```

#### Optional Integrations

```env
# Google OAuth
GOOGLE_CLIENT_ID="<your-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your-client-secret>"

# Google Sheets (service account)
GOOGLE_SHEETS_CREDS_JSON='{"type":"service_account",...}'

# Discord
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Lark
LARK_WEBHOOK_URL="https://open.larksuite.com/open-apis/bot/v2/hook/..."

# Notion
NOTION_API_KEY="secret_xxxxx"
NOTION_DB_CREATORS="<database-id>"
NOTION_DB_PAYOUTS="<database-id>"

# Upstash Redis
REDIS_URL="redis://default:password@redis.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="<your-token>"
```

### 3. Database Setup

```bash
# Push schema to database
pnpm db:push

# Seed with demo data (25 creators, 60 days of stats)
pnpm db:seed
```

**Seed Data Includes:**
- 1 Admin user: `admin@creatorops.us`
- 1 Finance user: `finance@creatorops.us`
- 4 Manager users
- 25 Creators across all lifecycle stages
- 60 days of live stats
- Payouts for last 2 periods
- Support tickets, tasks, compliance events
- Referrals with qualification tracking

### 4. Development

```bash
# Start dev server
pnpm dev

# Open http://localhost:3000

# (Optional) Start background worker
pnpm worker
```

### 5. View Demo Data

Navigate to `http://localhost:3000` and sign in using magic link with:
- `admin@creatorops.us` (Admin access)
- `sarah@creatorops.us` (Manager access)
- `finance@creatorops.us` (Finance access)

Check your email for the magic link (or check email logs in development).

---

## 🚢 Deployment

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Creator Ops Dashboard"
git remote add origin <your-github-repo>
git push -u origin main
```

#### 2. Create Vercel Project

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Follow prompts to link project
```

Or use the [Vercel Dashboard](https://vercel.com):
1. Import your GitHub repository
2. Set environment variables from `.env`
3. Deploy

#### 3. Set Up Database (Neon)

1. Go to [Neon.tech](https://neon.tech) and create a project
2. Copy the `DATABASE_URL`
3. Add to Vercel environment variables
4. Run migration:

```bash
vercel env pull .env.local
pnpm db:push
pnpm db:seed
```

#### 4. Set Up Redis (Upstash)

1. Go to [Upstash.com](https://upstash.com) and create a Redis database
2. Copy `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`
3. Add to Vercel environment variables

#### 5. Set Up Cron Jobs (Vercel Cron)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-rollup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create the cron endpoint at `src/app/api/cron/daily-rollup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { dailyRollupQueue } from '@/server/worker';
import { env } from '@/env';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!dailyRollupQueue) {
    return NextResponse.json({ error: 'Queue not configured' }, { status: 400 });
  }

  await dailyRollupQueue.add('daily-rollup', {
    date: new Date().toISOString(),
    syncNotion: true,
  });

  return NextResponse.json({ success: true });
}
```

#### 6. Background Worker (Separate Service)

For production, run the worker as a separate process:

**Option A: Vercel Background Functions** (Coming soon)

**Option B: Separate Service (Railway, Render, Fly.io)**

```bash
# On your worker service
pnpm worker
```

Set the same environment variables as your main app.

---

## 📊 Features Deep Dive

### Dashboard Overview

- **KPI Cards**: Active creators, live minutes, diamonds, MTD revenue
- **Charts**: 30-day diamonds trend, live minutes vs viewers, revenue by cohort
- **Top Performers**: Top 5 earners with drill-down
- **Alerts Panel**: Escalated tickets, compliance risks, overdue payouts
- **Quick Actions**: Invite creator, new ticket, create task, export CSV

### Creator CRM

- **Advanced Filtering**: Stage, region, manager, risk level, KYC status
- **Full Profile**: Timeline, stats, tickets, tasks, payouts, compliance events
- **Bulk Actions**: Export CSV, sync to Notion, message on Discord
- **Risk Management**: Automatic risk scoring and compliance tracking

### Live Operations

- **Who's Live Now**: Real-time monitoring (via lastLiveAt)
- **Daily Leaderboard**: Top performers by diamonds, minutes, viewers
- **Manager Tools**: Assign creators, add notes, push announcements

### Onboarding Pipeline

- **Kanban View**: LEAD → APPLIED → ONBOARDING → ACTIVE
- **Task Tracking**: Checklists for each stage
- **One-Click Actions**: Send welcome pack, create Notion page, schedule KYC

### Payouts

- **Period Selector**: Weekly/biweekly/monthly (configurable)
- **Automatic Calculations**: Revenue, fees (15%), bonuses
- **Bulk Operations**: Mark paid, export CSV, push to Google Sheets
- **Audit Trail**: Complete change history

### Referrals

- **Leaderboard**: Top referrers by qualified referrals
- **Qualification Rules**: 30-day activity threshold (configurable)
- **Bonus Tracking**: Automatic bonus calculation

### Support & Escalations

- **Ticket Inbox**: Filter by status, priority, channel
- **Discord Integration**: Link to threads
- **Escalate to Lark**: One-click manager alerts
- **SLA Timers**: Track response times

### Compliance

- **Event Types**: KYC, age verification, content flags, ban risk
- **Severity Levels**: Info, warning, critical, blocking
- **Bulk Actions**: Send reminders, export reports

---

## 🔌 Integrations

### Discord

Send announcements and support updates to Discord channels.

**Setup:**
1. Create a webhook in your Discord server
2. Add `DISCORD_WEBHOOK_URL` to `.env`

**Usage:**
```typescript
POST /api/webhooks/discord
{
  "message": "Welcome to the Creator Ops family!",
  "creatorHandle": "nova123",
  "type": "announcement"
}
```

### Lark

Escalate critical issues to managers via Lark.

**Setup:**
1. Create a bot in Lark
2. Add webhook URL to `.env`

**Usage:**
```typescript
POST /api/webhooks/lark
{
  "title": "Urgent: Compliance Issue",
  "message": "Creator flagged for review",
  "creatorHandle": "creator123",
  "priority": "URGENT"
}
```

### Notion

Sync creators and payouts to Notion databases.

**Setup:**
1. Create integration at [notion.so/my-integrations](https://notion.so/my-integrations)
2. Create databases for Creators and Payouts
3. Share databases with integration
4. Add IDs to `.env`

**Usage:**
```typescript
import { syncCreatorToNotion } from '@/server/notion';
await syncCreatorToNotion(creatorId);
```

### Google Sheets

Export payouts to Google Sheets.

**Setup:**
1. Create service account in Google Cloud Console
2. Enable Google Sheets API
3. Download credentials JSON
4. Add to `.env` as `GOOGLE_SHEETS_CREDS_JSON`

### Zapier

Inbound webhook for creator lead intake.

**Setup:**
1. Create Zap with webhook trigger
2. Add `ZAPIER_WEBHOOK_SECRET` to `.env` for validation

**Usage:**
```bash
POST /api/webhooks/zapier
{
  "handle": "newcreator123",
  "email": "creator@example.com",
  "region": "US-East",
  "referralCode": "REFER123",
  "displayName": "New Creator"
}
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific test
pnpm test tests/auth.spec.ts
```

### Test Coverage

- ✅ Authentication flows
- ✅ RBAC enforcement
- ✅ Creator CRUD operations
- ✅ Payout exports
- ⏭️ Additional test coverage recommended for production

---

## 🔐 Security

### RBAC (Role-Based Access Control)

- **ADMIN**: Full system access
- **MANAGER**: Creator management, live ops, support
- **FINANCE**: Payouts and financial reports
- **CREATOR**: Limited self-service (future)

### Security Features

- ✅ Email magic link + OAuth authentication
- ✅ Role-based route protection
- ✅ Rate limiting on API endpoints
- ✅ Input validation with Zod
- ✅ PII masking in logs
- ✅ Audit logging for all changes
- ✅ CSRF protection on forms

---

## 🎨 UI/UX

### Design System

- **TailwindCSS** with custom configuration
- **shadcn/ui** components with 2xl border radius
- **Dark mode** support with next-themes
- **Framer Motion** for subtle animations
- **Accessible**: Keyboard navigation, ARIA labels, color contrast

### Mobile Responsive

- ✅ Responsive grid layouts
- ✅ Mobile-friendly tables
- ✅ Touch-optimized interactions

---

## 📈 Performance

### Optimization

- Server-side rendering with Next.js App Router
- React Server Components for data fetching
- Indexed database queries (<200ms locally)
- Image optimization with next/image
- Code splitting and lazy loading

### Monitoring

- Structured logging with Pino
- Audit trail in database
- Error boundaries for UI resilience

---

## 🗂️ Project Structure

```
creator-ops-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script with demo data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth routes
│   │   │   ├── exports/      # CSV/Sheets exports
│   │   │   └── webhooks/     # Integration webhooks
│   │   ├── auth/             # Auth pages
│   │   └── dashboard/        # Protected dashboard pages
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Auth components
│   │   ├── dashboard/        # Dashboard components
│   │   └── creators/         # Creator-specific components
│   ├── lib/
│   │   ├── utils.ts          # Utility functions
│   │   └── logger.ts         # Pino logger
│   ├── server/
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── audit.ts          # Audit logging
│   │   ├── ratelimit.ts      # Upstash rate limiting
│   │   ├── notion.ts         # Notion sync
│   │   └── worker.ts         # BullMQ workers
│   └── env.ts                # Environment validation (t3-env)
├── tests/                    # Playwright tests
├── .env.example              # Example environment file
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 Maintenance

### Database Migrations

```bash
# Create migration
pnpm db:migrate

# View database
pnpm db:studio
```

### Backup

Regular backups recommended:
- **Database**: Use Neon automated backups or pg_dump
- **Redis**: Upstash provides persistence
- **Notion**: Native version history

### Monitoring

- Vercel Analytics for frontend
- Pino logs for backend (integrate with Datadog, Logtail, etc.)
- Upstash dashboard for Redis/queue monitoring

---

## 🤝 Contributing

This is proprietary software owned by **Syndicate Holdings Group LLC**.

Internal development guidelines:
1. Branch naming: `feature/description` or `fix/description`
2. Commit messages: Conventional Commits format
3. PR reviews required from team lead
4. Test coverage expected for new features

---

## 📄 License

**Proprietary** — © 2024 Syndicate Holdings Group LLC

All intellectual property rights reserved. Licensed for use by Creator Ops Division (CreatorOps.us) only.

Jurisdiction: Spartanburg, South Carolina, USA

---

## 🆘 Support

For technical issues or questions:
- **Internal Team**: Contact via Lark
- **Email**: dev@creatorops.us
- **Documentation**: [Notion workspace]

---

## 🎯 Roadmap

### Phase 1 (Current - MVP)
- ✅ Core dashboard with all screens
- ✅ CRUD for creators, payouts, tasks, tickets
- ✅ Integrations (Discord, Lark, Notion, Zapier)
- ✅ CSV exports
- ✅ Background jobs

### Phase 2 (Next)
- 🔲 TikTok API integration for live data
- 🔲 Real-time "Who's Live" with WebSockets
- 🔲 Advanced analytics and cohort analysis
- 🔲 Creator self-service portal
- 🔲 Mobile app (React Native)

### Phase 3 (Future)
- 🔲 AI-powered creator matching
- 🔲 Automated content compliance scanning
- 🔲 Multi-platform support (YouTube, Twitch)
- 🔲 Advanced payout scheduling
- 🔲 White-label for other agencies

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel](https://vercel.com)
- [Upstash](https://upstash.com)

---

**Creator Ops Division** — Empowering creators, scaling operations.

*Built with ❤️ by Syndicate Holdings Group LLC*
