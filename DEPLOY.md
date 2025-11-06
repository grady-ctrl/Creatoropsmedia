# Creator Ops Dashboard - Quick Deploy

## 🚀 One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Creatoropsmedia&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=Required%20environment%20variables%20for%20Creator%20Ops%20Dashboard&envLink=https://github.com/YOUR_USERNAME/Creatoropsmedia/blob/main/DEPLOYMENT.md&project-name=creator-ops-dashboard&repository-name=creator-ops-dashboard)

## Required Setup Steps

### 1. Click the Deploy Button Above

### 2. Set Required Environment Variables

When prompted, provide:

- **DATABASE_URL**: Your Neon PostgreSQL connection string
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **NEXTAUTH_URL**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### 3. After Deployment

```bash
# Pull environment variables
vercel env pull .env.local

# Push database schema
pnpm db:push

# Seed with demo data
pnpm db:seed
```

### 4. Access Your Dashboard

Visit your Vercel URL and sign in with: `grady@creatorops.us`

---

## Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions including:
- Database setup (Neon)
- Redis configuration (Upstash)
- Email service (SendGrid)
- All integrations (Discord, Lark, Notion, Google Sheets)

---

## Manual Deployment

If you prefer manual deployment:

1. **Fork this repository**
2. **Go to [vercel.com](https://vercel.com)**
3. **Import your fork**
4. **Add environment variables**
5. **Deploy!**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
