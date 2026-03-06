# 🚀 QUICK DEPLOYMENT FIX - Vercel Environment Variables

## ❌ Current Error
```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## ✅ IMMEDIATE SOLUTION

### Step 1: Add Environment Variables to Vercel (REQUIRED)

1. **Go to your Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (swasthai-gemini or similar)
3. **Go to Settings → Environment Variables**
4. **Add these variables for ALL environments** (Production, Preview, Development):

```bash
# REQUIRED - Add these NOW:
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4

# OPTIONAL (for full functionality):
TEAM_API_KEY=your_aixplain_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
DOC_MODEL_ID=your_doc_model_id
SUMM_MODEL_ID=your_summ_model_id
NEWS_MODEL_ID=your_news_model_id
AGENT_MODEL_ID=your_agent_model_id
```

### Step 2: Redeploy
After adding the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## 🔧 Alternative: Use Real Supabase Credentials

If you have a Supabase project:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon key
5. Replace the placeholder values above

## ⚡ FASTEST FIX (Copy-Paste Ready)

**For Vercel Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDY5OTQ1Nn0.placeholder-key
GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4
```

## 🎯 Why This Happens
- Vercel builds fail when environment variables are undefined
- Supabase client requires valid URL format even with placeholders
- Our code now has fallback values, but Vercel needs the env vars set

## ✅ After Fix
Your deployment will:
- ✅ Build successfully
- ✅ Run with Gemini AI integration
- ✅ Show placeholder message for Supabase features
- ✅ Work perfectly for all other features

**Estimated fix time: 2 minutes** ⏱️
