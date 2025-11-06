# 🚀 Deployment Guide - Creator Ops Dashboard

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub** (Already done! ✅)
   ```bash
   # Your code is at: claude/creator-ops-dashboard-mvp-011CUrM5oBxLgQTvDbweszd3
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**
   - Select: `grady-ctrl/Creatoropsmedia`
   - Branch: `claude/creator-ops-dashboard-mvp-011CUrM5oBxLgQTvDbweszd3`

5. **Configure Environment Variables** (click "Environment Variables"):

   **Required (Minimum for deployment):**
   ```env
   DATABASE_URL=<your-neon-postgres-url>
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=<your-vercel-url>
   ```

   **Optional (Add later for full functionality):**
   ```env
   EMAIL_SERVER_HOST=smtp.sendgrid.net
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=apikey
   EMAIL_SERVER_PASSWORD=<your-sendgrid-api-key>
   EMAIL_FROM=noreply@creatorops.us

   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>

   REDIS_URL=<your-upstash-redis-url>
   UPSTASH_REDIS_REST_URL=<your-upstash-rest-url>
   UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>

   DISCORD_WEBHOOK_URL=<your-discord-webhook>
   LARK_WEBHOOK_URL=<your-lark-webhook>
   NOTION_API_KEY=<your-notion-key>
   NOTION_DB_CREATORS=<your-notion-db-id>
   NOTION_DB_PAYOUTS=<your-notion-db-id>

   CRON_SECRET=<generate-random-string>
   ZAPIER_WEBHOOK_SECRET=<generate-random-string>
   ```

6. **Click "Deploy"**

7. **After deployment**, set up the database:
   ```bash
   # Install Vercel CLI locally
   npm i -g vercel

   # Pull your environment variables
   vercel env pull .env.local

   # Run database migrations
   pnpm db:push

   # Seed the database
   pnpm db:seed
   ```

---

## Option 2: Deploy via Vercel CLI

### Prerequisites Setup

#### 1. Set Up Neon Database (Free tier available)

```bash
# Go to https://neon.tech
# Create account and new project
# Copy the DATABASE_URL
```

#### 2. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

#### 3. Create .env file

```bash
cp .env.example .env
# Edit .env with your values
```

### Deploy Commands

```bash
# Login to Vercel
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

---

## Option 3: One-Click Deploy Button

Add this to your GitHub README for instant deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Creatoropsmedia&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&project-name=creator-ops-dashboard)

---

## Database Setup (Neon - Recommended)

### 1. Create Neon Account
- Go to [neon.tech](https://neon.tech)
- Sign up (free tier available)

### 2. Create Database Project
- Click "Create Project"
- Name: `creator-ops-dashboard`
- Region: Choose closest to your users

### 3. Get Connection String
- Copy the "Connection string"
- It looks like: `postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require`

### 4. Add to Vercel Environment Variables
- Paste as `DATABASE_URL`

### 5. Run Migrations
```bash
vercel env pull .env.local
pnpm db:push
pnpm db:seed
```

---

## Redis Setup (Upstash - For Background Jobs)

### 1. Create Upstash Account
- Go to [upstash.com](https://upstash.com)
- Sign up (free tier available)

### 2. Create Redis Database
- Click "Create Database"
- Name: `creator-ops-redis`
- Type: Regional
- Region: Same as your Vercel deployment

### 3. Get Credentials
- Copy `REDIS_URL` (standard connection)
- Copy `UPSTASH_REDIS_REST_URL`
- Copy `UPSTASH_REDIS_REST_TOKEN`

### 4. Add to Vercel
- Add all three values as environment variables

---

## Email Setup (SendGrid - For Magic Links)

### 1. Create SendGrid Account
- Go to [sendgrid.com](https://sendgrid.com)
- Sign up (free tier: 100 emails/day)

### 2. Create API Key
- Settings → API Keys → Create API Key
- Name: `creator-ops-auth`
- Permissions: Full Access (or Mail Send)

### 3. Verify Domain (Optional but recommended)
- Settings → Sender Authentication
- Verify your domain (creatorops.us)

### 4. Add to Environment Variables
```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=<your-api-key>
EMAIL_FROM=noreply@creatorops.us
```

---

## Post-Deployment Checklist

### ✅ Verify Deployment

1. **Visit your Vercel URL**
   - Should show sign-in page

2. **Test Authentication**
   - Enter `admin@creatorops.us`
   - Check email for magic link
   - Should redirect to dashboard

3. **Check Dashboard**
   - Overview page loads
   - KPIs display correctly
   - Charts render

4. **Test Navigation**
   - All menu items work
   - Data loads on each page

### ✅ Set Up Cron Jobs

Vercel Cron is automatically configured via `vercel.json`:
- Daily rollup runs at 2 AM UTC
- Notion sync included in rollup

To test cron manually:
```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-rollup" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### ✅ Configure Integrations

#### Discord
1. Create webhook in your Discord server
2. Add `DISCORD_WEBHOOK_URL` to Vercel env vars
3. Redeploy

#### Lark
1. Create bot in Lark
2. Get webhook URL
3. Add `LARK_WEBHOOK_URL` to Vercel env vars
4. Redeploy

#### Notion
1. Create integration at [notion.so/my-integrations](https://notion.so/my-integrations)
2. Create "Creators" and "Payouts" databases
3. Share databases with your integration
4. Copy database IDs from URLs
5. Add all Notion env vars to Vercel
6. Redeploy

#### Google Sheets
1. Create service account in Google Cloud Console
2. Enable Google Sheets API
3. Download credentials JSON
4. Minify JSON (remove spaces/newlines)
5. Add as `GOOGLE_SHEETS_CREDS_JSON` to Vercel
6. Redeploy

---

## Custom Domain (Optional)

### 1. Add Domain in Vercel
- Project Settings → Domains
- Add `dashboard.creatorops.us`

### 2. Configure DNS
Add these records to your DNS provider:

```
Type: CNAME
Name: dashboard
Value: cname.vercel-dns.com
```

### 3. Update Environment Variable
```env
NEXTAUTH_URL=https://dashboard.creatorops.us
```

---

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Add to package.json scripts (already done):
"postinstall": "prisma generate"
```

**Error: Environment variables missing**
- Check all required vars are set in Vercel dashboard
- Redeploy after adding env vars

### Database Connection Fails

**Error: Can't reach database**
- Check DATABASE_URL is correct
- Ensure Neon database is running
- Check IP whitelist in Neon (should allow all for Vercel)

### Authentication Not Working

**Magic link not sending**
- Verify SendGrid API key
- Check EMAIL_FROM is verified in SendGrid
- Check Vercel logs for errors

**Google OAuth fails**
- Verify Google OAuth credentials
- Add Vercel domain to authorized redirect URIs
- Format: `https://your-app.vercel.app/api/auth/callback/google`

### Background Jobs Not Running

**Cron not triggering**
- Verify `vercel.json` is in root directory
- Check Vercel Cron logs in dashboard
- Ensure CRON_SECRET is set

**BullMQ worker not processing**
- Check Redis connection
- Verify REDIS_URL is correct
- May need separate worker service (see README)

---

## Monitoring & Maintenance

### Vercel Analytics
- Automatically enabled
- View in Vercel dashboard

### Database
- Monitor Neon dashboard
- Set up automated backups (Pro plan)

### Logs
- View in Vercel dashboard: Project → Logs
- Filter by severity

### Performance
- Check Vercel Analytics
- Monitor Core Web Vitals
- Target: Performance >85, Accessibility >90

---

## Scaling Considerations

### When You Outgrow Free Tiers

**Neon** (Free → Pro at ~10GB)
- Pro: $20/month
- Unlimited databases
- Automated backups

**Upstash** (Free → Pay-as-you-go at 10K requests/day)
- ~$0.20 per 100K requests
- Regional read replicas available

**Vercel** (Free → Pro at heavy usage)
- Pro: $20/month per user
- More build minutes
- Advanced analytics

### Separate Worker Service

For production at scale, run BullMQ worker separately:

**Deploy to Railway/Render/Fly.io:**
```bash
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
CMD ["pnpm", "worker"]
```

---

## Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] All webhook secrets are random strings
- [ ] Database has connection pooling enabled
- [ ] Rate limiting is configured (REDIS_URL set)
- [ ] CORS is properly configured
- [ ] All API keys are in environment variables (not in code)
- [ ] Vercel deployment protection enabled (optional)

---

## Support

- **Issues**: Open on GitHub
- **Documentation**: See main README.md
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

---

## Cost Estimate (Monthly)

**Free Tier (Development):**
- Vercel: Free (hobby plan)
- Neon: Free (0.5GB storage, 100 hours compute)
- Upstash: Free (10K requests/day)
- SendGrid: Free (100 emails/day)
- **Total: $0**

**Production (Light Usage):**
- Vercel Pro: $20
- Neon Pro: $20
- Upstash: ~$5
- SendGrid Pro: $15
- **Total: ~$60/month**

**Production (Heavy Usage):**
- Vercel Team: $20/user
- Neon Scale: $69+
- Upstash: $10-50
- SendGrid: $15-90
- **Total: ~$120-250/month**

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Invite team members (Vercel team settings)
3. ✅ Set up monitoring alerts
4. ✅ Configure custom domain
5. ✅ Enable all integrations
6. ✅ Schedule team demo
7. ✅ Document any custom configurations
8. ✅ Plan creator onboarding

---

**You're all set! 🚀**

Your Creator Ops Dashboard is now live and ready to manage your TikTok LIVE creator network at scale.
