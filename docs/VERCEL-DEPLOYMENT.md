# SwasthAI Vercel Full-Stack Deployment Guide

Deploy both frontend and backend on Vercel using Next.js API routes.

## 🚀 Quick Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Root
```bash
vercel
```

That's it! Your entire SwasthAI application (frontend + backend) will be deployed on Vercel.

## 🔧 Environment Variables Setup

After deployment, add these environment variables in your Vercel dashboard:

### Frontend Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=/api
```

### Backend API Variables
```
TEAM_API_KEY=your_aixplain_team_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
DOC_MODEL_ID=your_doc_model_id
SUMM_MODEL_ID=your_summ_model_id
NEWS_MODEL_ID=your_news_model_id
AGENT_MODEL_ID=your_agent_model_id
```

## 📁 API Routes Structure

Your backend Flask routes have been converted to Next.js API routes:

```
app/api/
├── ask/route.ts          # Health assistant endpoint
├── doctors/route.ts      # Doctor discovery endpoint
├── health-centers/route.ts # Health centers locator
├── news/route.ts         # Health news endpoint
└── health/route.ts       # Health check endpoint
```

## 🔗 API Endpoints

Once deployed, your API will be available at:

- **Health Assistant**: `POST /api/ask`
- **Doctor Discovery**: `POST /api/doctors`
- **Health Centers**: `POST /api/health-centers`
- **Health News**: `POST /api/news`
- **Health Check**: `GET /api/health`

## 🧪 Testing Your Deployment

### 1. Test Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Test Health Assistant
```bash
curl -X POST https://your-app.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the symptoms of fever?"}'
```

### 3. Test Doctor Discovery
```bash
curl -X POST https://your-app.vercel.app/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"condition": "diabetes", "location": "Mumbai"}'
```

### 4. Test Health Centers
```bash
curl -X POST https://your-app.vercel.app/api/health-centers \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777}'
```

## 🔄 Updating Your Deployment

To update your deployment:

```bash
# Make your changes
git add .
git commit -m "Update SwasthAI"

# Deploy to production
vercel --prod
```

## 🎯 Advantages of Vercel-Only Deployment

✅ **Single Platform**: Manage everything in one place  
✅ **Automatic Scaling**: Both frontend and API scale automatically  
✅ **Global CDN**: Fast worldwide performance  
✅ **Zero Configuration**: No server management needed  
✅ **Integrated Monitoring**: Built-in analytics and logging  
✅ **Git Integration**: Automatic deployments from Git  
✅ **Free Tier**: Generous free usage limits  

## 🔒 Security Features

- ✅ Automatic HTTPS
- ✅ Environment variable encryption
- ✅ DDoS protection
- ✅ Edge network security

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function execution
- Track performance metrics
- Set up alerts

### Function Logs
```bash
vercel logs your-app-url
```

## 🛠️ Troubleshooting

### Common Issues

1. **API Routes Not Working**
   - Check if files are in `app/api/` directory
   - Ensure files are named `route.ts`
   - Verify environment variables are set

2. **Environment Variables Not Loading**
   - Add variables in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

3. **Function Timeout**
   - API routes have 10-30 second timeout
   - Optimize API calls for faster response
   - Consider caching for repeated requests

4. **Build Errors**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Review build logs in Vercel dashboard

## 🚀 Performance Optimization

### API Routes
- Use edge runtime for faster cold starts
- Implement caching for repeated requests
- Optimize external API calls

### Frontend
- Next.js automatic optimizations
- Image optimization
- Static generation where possible

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables
3. Test API endpoints individually
4. Review Vercel documentation

---

**Your SwasthAI app will be live at:**
`https://your-app.vercel.app`

Both frontend and backend APIs are served from the same domain! 🎉
