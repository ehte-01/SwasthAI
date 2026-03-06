# Environment Variables for Deployment

## Frontend (Vercel) Environment Variables

Add these environment variables in your Vercel dashboard (Project Settings > Environment Variables):

**Required for Build to Succeed:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=AIzaSyBd0JzFZk_j-QknnMzJP0wLrEMyPyPRZh4
```

**Optional (for additional functionality):**
```
TEAM_API_KEY=your_aixplain_team_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
DOC_MODEL_ID=your_doc_model_id
SUMM_MODEL_ID=your_summ_model_id
NEWS_MODEL_ID=your_news_model_id
AGENT_MODEL_ID=your_agent_model_id
```

**Important:** Make sure to set these as regular environment variables in Vercel, not as secrets. The vercel.json file has been updated to use standard environment variable syntax.

## Backend (Railway) Environment Variables

Add these environment variables in your Railway dashboard:

```
TEAM_API_KEY=your_aixplain_team_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
DOC_MODEL_ID=your_doc_model_id
SUMM_MODEL_ID=your_summ_model_id
NEWS_MODEL_ID=your_news_model_id
AGENT_MODEL_ID=your_agent_model_id
PORT=5000
```

## How to Get API Keys

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon public key

### 2. Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Maps JavaScript API and Places API
4. Create credentials (API Key)
5. Restrict the key to your domains

### 3. aiXplain API Keys
1. Go to [aiXplain platform](https://aixplain.com)
2. Sign up/login to your account
3. Get your team API key from dashboard
4. Note down your model IDs for the health assistant models

## Security Notes
- Never commit actual API keys to version control
- Use environment variables in production
- Restrict API keys to specific domains/IPs when possible
