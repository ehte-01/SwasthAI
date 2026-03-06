# 🚀 Complete Next.js 15 + Supabase + Vercel Deployment Guide

This guide provides a **production-ready solution** for deploying a Next.js 15 app with Supabase authentication on Vercel.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account
- Git repository

## 🛠️ Setup Instructions

### Step 1: Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase-schema-production.sql
   ```

3. **Get your Supabase credentials**:
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

### Step 2: Local Development Setup

1. **Clone/setup your project**:
   ```bash
   # If starting fresh
   npx create-next-app@latest my-app
   cd my-app
   
   # Install dependencies
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Copy the production files** to your project:
   - Replace `/lib/supabaseClient.js` with `supabaseClient-production.js`
   - Copy all API routes from the production files
   - Copy components and hooks
   - Update your middleware with `middleware-production.js`
   - Update your layout with `layout-production.jsx`

3. **Create environment file**:
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Test locally**:
   ```bash
   npm run dev
   ```

### Step 3: Vercel Deployment

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. **Connect your Git repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`

3. **Deploy** by pushing to your main branch

### Step 4: Environment Variables in Vercel

**Via Vercel Dashboard:**
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

**Via Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

## 🔧 File Structure

Your project should have this structure:

```
your-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.js
│   │   │   ├── login/route.js
│   │   │   ├── logout/route.js
│   │   │   └── session/route.js
│   │   └── profile/route.js
│   ├── auth/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   ├── dashboard/page.jsx
│   ├── profile/page.jsx
│   └── layout.jsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── SignupForm.jsx
│   └── profile/
│       └── ProfileForm.jsx
├── hooks/
│   └── useAuth.js
├── lib/
│   └── supabaseClient.js
├── middleware.js
├── next.config.mjs
├── vercel.json
└── .env.local
```

## 🧪 Testing Your Deployment

1. **Visit your deployed URL**
2. **Test signup flow**:
   - Go to `/auth/signup`
   - Create a new account
   - Check your email for verification (if enabled)

3. **Test login flow**:
   - Go to `/auth/login`
   - Login with your credentials
   - Should redirect to `/dashboard`

4. **Test protected routes**:
   - Try accessing `/dashboard` without login
   - Should redirect to `/auth/login`

5. **Test profile management**:
   - Go to `/profile`
   - Update your profile information
   - Verify changes are saved

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. "Missing Supabase environment variables" Error
**Solution**: Ensure environment variables are set in Vercel dashboard and locally.

#### 2. Middleware causing 500 errors
**Solution**: The provided middleware is simplified and Vercel-compatible. It doesn't make direct Supabase calls.

#### 3. Authentication not working
**Solutions**:
- Check Supabase URL and key are correct
- Verify RLS policies are set up
- Check browser console for errors

#### 4. Build failures
**Solutions**:
- Ensure all dependencies are installed
- Check for TypeScript errors if using TS
- Verify all imports are correct

#### 5. CORS errors
**Solution**: Supabase automatically handles CORS for your domain. Ensure your domain is added to allowed origins in Supabase dashboard.

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs your-deployment-url

# Test build locally
npm run build

# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://your-project-id.supabase.co/rest/v1/
```

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use Row Level Security (RLS)** in Supabase
3. **Validate user input** in API routes
4. **Use HTTPS** in production (Vercel provides this automatically)
5. **Regularly rotate API keys**

## 📚 Key Features Included

✅ **Runtime-safe Supabase client initialization**  
✅ **Signup and login with API routes**  
✅ **Profile creation and updates**  
✅ **Vercel-compatible middleware**  
✅ **Proper error handling**  
✅ **Loading states and user feedback**  
✅ **Protected routes**  
✅ **Responsive design**  
✅ **Production-ready configuration**  

## 🎯 Next Steps

After successful deployment:

1. **Customize the UI** to match your brand
2. **Add more features** like password reset, email verification
3. **Implement role-based access control**
4. **Add database tables** for your specific use case
5. **Set up monitoring** and analytics
6. **Configure custom domain** in Vercel

## 📞 Support

If you encounter issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Check the [Supabase documentation](https://supabase.com/docs)
3. Check the [Vercel documentation](https://vercel.com/docs)
4. Review the troubleshooting section above

---

**🎉 Congratulations!** You now have a production-ready Next.js 15 app with Supabase authentication deployed on Vercel!
