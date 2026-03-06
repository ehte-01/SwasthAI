# SwasthAI Deployment Guide - Vercel + Railway

This guide will help you deploy SwasthAI with the frontend on Vercel and backend on Railway.

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy from project root
   railway up
   ```

3. **Set Environment Variables in Railway**
   - Go to your Railway dashboard
   - Click on your deployed service
   - Go to Variables tab
   - Add all backend environment variables (see deployment-env-template.md)

4. **Get Backend URL**
   - Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project root
   vercel
   ```

3. **Set Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to Settings > Environment Variables
   - Add frontend environment variables (see deployment-env-template.md)

4. **Update API Endpoints**
   - Update your frontend code to use the Railway backend URL
   - Replace localhost:5000 with your Railway URL

### Step 3: Configure Database (Supabase)

1. **Set up Supabase**
   - Follow the instructions in DEPLOYMENT.md
   - Run the database schema from `database/schema.sql`
   - Configure authentication settings

2. **Update Environment Variables**
   - Add Supabase URL and keys to Vercel environment variables

### Step 4: Test Deployment

1. **Test Backend API**
   ```bash
   curl https://your-railway-app.railway.app/
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Test authentication flow
   - Test API connectivity

## 🔧 Alternative: One-Click Deploy

### Railway Deploy Button
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Vercel Deploy Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 🛠️ Manual Configuration

### Update CORS for Production
In `backend.py`, update the CORS configuration:
```python
CORS(app, origins=["https://your-vercel-app.vercel.app"])
```

### Update API Base URL
In your Next.js app, create an environment variable for the API URL:
```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

## 📊 Monitoring

### Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user engagement

## 🔒 Security Checklist

- [ ] Environment variables are set correctly
- [ ] API keys are not exposed in frontend code
- [ ] CORS is configured for production domains
- [ ] Supabase RLS policies are enabled
- [ ] Google Maps API key is restricted

## 🚨 Troubleshooting

### Common Issues

1. **Backend not responding**
   - Check Railway logs
   - Verify environment variables
   - Ensure PORT is set correctly

2. **CORS errors**
   - Update CORS origins in backend.py
   - Check if frontend URL is correct

3. **Database connection issues**
   - Verify Supabase credentials
   - Check if database schema is applied

4. **API key errors**
   - Verify all API keys are set
   - Check if keys have proper permissions

## 📞 Support

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check network connectivity

---

**Your SwasthAI app will be live at:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.railway.app`
