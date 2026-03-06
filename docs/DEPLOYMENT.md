# SwasthAI Deployment Guide

This guide will walk you through deploying SwasthAI with all its features including profile management, family vault, and health records.

## 🚀 Quick Setup Summary

You now have a complete health management system with:

✅ **Authentication System**
- Email/password authentication with Supabase
- Email verification flow
- Protected routes with middleware
- Session management

✅ **Profile Management** 
- Complete profile setup with photo upload
- Personal information management
- Medical information storage

✅ **Family Vault**
- Family member management
- Document upload and storage
- Emergency contacts
- Secure file management

✅ **Health Records**
- Medical record tracking
- File attachments
- Appointment management
- Advanced filtering

## 📋 Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

## 🛠️ Step-by-Step Setup

### 1. Supabase Database Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Run the database schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire content from `database/schema.sql`
   - Click "Run" to execute the schema

3. **Set up Storage Buckets**
   - Go to Storage in your Supabase dashboard
   - The buckets should be created automatically by the schema
   - Verify these buckets exist:
     - `avatars` (public)
     - `documents` (private)
     - `health-records` (private)

4. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure email templates as needed
   - Set up redirect URLs for your domain

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see your application.

### 4. Testing the Features

1. **Authentication**
   - Sign up with a real email address
   - Check your email for verification link
   - Sign in after verification

2. **Profile Management**
   - Go to `/profile/edit`
   - Upload a profile photo
   - Fill in personal information

3. **Family Vault**
   - Go to `/family-vault`
   - Add family members
   - Upload documents
   - Add emergency contacts

4. **Health Records**
   - Go to `/health-records`
   - Add health records
   - Upload medical files
   - Schedule appointments

### 5. Production Deployment

#### Option A: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Add Environment Variables**
   - Go to your Vercel dashboard
   - Add the same environment variables from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### Option B: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `.next` folder to your hosting provider**

## 🔧 Configuration Options

### Supabase Settings

1. **Email Confirmation**
   - Go to Authentication > Settings
   - Toggle "Enable email confirmations" based on your needs
   - Update email templates as needed

2. **File Upload Limits**
   - Adjust `MAX_FILE_SIZES` in `lib/storage.ts`
   - Update storage policies if needed

3. **Security Policies**
   - All RLS policies are set up automatically
   - Review and adjust if needed for your use case

### Application Settings

1. **File Types**
   - Modify `ALLOWED_DOCUMENT_TYPES` in `lib/storage.ts`
   - Update `ALLOWED_IMAGE_TYPES` for avatars

2. **UI Customization**
   - Modify colors in `tailwind.config.js`
   - Update components in `components/ui/`

## 🔍 Troubleshooting

### Authentication Issues

1. **Email not confirmed**
   - Check spam folder
   - Resend confirmation email
   - Use `/debug-auth` page for testing

2. **Invalid credentials after signup**
   - Ensure email is confirmed
   - Check Supabase auth settings
   - Verify environment variables

### Database Issues

1. **Tables not found**
   - Ensure schema was run completely
   - Check for SQL errors in Supabase logs

2. **Permission denied**
   - Verify RLS policies are set up
   - Check user authentication status

### File Upload Issues

1. **Upload failed**
   - Check storage bucket policies
   - Verify file size and type limits
   - Check network connectivity

2. **Files not accessible**
   - Verify storage policies
   - Check file permissions

## 📊 Monitoring & Analytics

### Supabase Dashboard
- Monitor database usage
- Check authentication metrics
- Review storage usage
- Monitor API requests

### Application Monitoring
- Use Vercel Analytics for performance
- Monitor error rates
- Track user engagement

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different keys for development and production

2. **Database Security**
   - RLS policies are enforced automatically
   - Regular security audits recommended

3. **File Storage**
   - Files are stored securely with proper access controls
   - Signed URLs for private file access

## 🚀 Performance Optimization

1. **Database Optimization**
   - Indexes are set up automatically
   - Monitor query performance in Supabase

2. **File Storage**
   - Images are optimized automatically
   - CDN delivery for fast access

3. **Frontend Optimization**
   - Next.js optimizations enabled
   - Lazy loading for components

## 📈 Scaling Considerations

### Database Scaling
- Supabase handles scaling automatically
- Monitor usage and upgrade plan as needed

### Storage Scaling
- Storage scales with usage
- Consider CDN for global distribution

### Application Scaling
- Vercel handles scaling automatically
- Monitor performance metrics

## 🆘 Support & Maintenance

### Regular Maintenance
- Monitor Supabase usage and billing
- Update dependencies regularly
- Review security policies

### Backup Strategy
- Supabase provides automatic backups
- Consider additional backup strategies for critical data

### Updates
- Follow semantic versioning
- Test updates in staging environment
- Monitor for breaking changes

## 🎯 Next Steps

Your SwasthAI application is now fully deployed with:

1. ✅ Complete authentication system
2. ✅ Profile management with photo upload
3. ✅ Family vault with document storage
4. ✅ Health records management
5. ✅ Appointment scheduling
6. ✅ Secure file storage
7. ✅ Responsive design
8. ✅ Database security

### Potential Enhancements
- Add AI health insights
- Implement telemedicine features
- Add medication tracking
- Create mobile app
- Add data analytics dashboard

## 📞 Getting Help

- Check the main README.md for detailed documentation
- Review the codebase for implementation details
- Use the `/debug-auth` page for authentication troubleshooting
- Check Supabase documentation for database issues

---

**Congratulations!** You now have a fully functional health management system. 🎉
