# 🚀 Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (free at vercel.com)
3. Your Slack app credentials

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Clean codebase for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Node.js project
6. Click "Deploy"

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to:
**Settings → Environment Variables**

Add these variables:
```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token (optional)
SLACK_CHANNEL_ID=your-channel-id
PUBLIC_BASE_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

## Step 4: Update Slack App Settings

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your app
3. Go to **"Slash Commands"**
4. Update Request URLs to:
   ```
   https://your-app-name.vercel.app/slack/commands
   ```

## Step 5: Test Your Deployment

1. Visit: `https://your-app-name.vercel.app/health`
2. Test Slack commands: `/birthday list`, `/profile`, etc.

## 🎉 You're Done!

Your Slack bot is now hosted on Vercel with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Free hosting
- ✅ Custom domain support

## Troubleshooting

### Common Issues:
1. **Environment Variables**: Make sure all required env vars are set in Vercel
2. **Slack URLs**: Update all slash command URLs to your Vercel domain
3. **Database**: SQLite files are included in deployment
4. **Assets**: Static assets are served from `/assets`

### Logs:
Check Vercel function logs in the dashboard for debugging.
