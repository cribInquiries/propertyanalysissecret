# Supabase Setup Guide

This guide will help you set up Supabase for your LuxeAnalytics application to enable user authentication and cloud data storage.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in your project details:
   - **Name**: `luxe-analytics` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this takes a few minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **Project API Key** (anon/public key)
   - **Project API Key** (service_role key) - **Keep this secret!**

## 3. Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Vercel Blob (if you want to keep using it for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. Replace the placeholder values with your actual Supabase credentials

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `lib/supabase/schema.sql` into the editor
4. Click "Run" to execute the schema

This will create:
- `user_profiles` table for user information
- `user_data` table for storing user's property analysis data
- `property_analyses` table for structured property data
- Row Level Security (RLS) policies to ensure data privacy
- Triggers for automatic profile creation and timestamp updates

## 5. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development) or your production domain
   - **Redirect URLs**: Add your login/signup success pages
3. Go to **Authentication** → **Email Templates** to customize email templates if needed

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try creating a new account and signing in
4. Check that data is being saved to your Supabase database

## 7. Deploy to Production

1. Set up your production environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Update the Site URL in Supabase to your production domain
3. Deploy your application

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**: Double-check your environment variables are set correctly
2. **Database connection issues**: Ensure your database password is correct and the project is fully created
3. **RLS policy errors**: Make sure you've run the schema.sql file completely
4. **Authentication redirects**: Verify your Site URL and Redirect URLs are configured correctly

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Best Practices

1. **Never commit your `.env.local` file** to version control
2. **Use environment variables** in production
3. **Keep your service role key secret** - it bypasses RLS policies
4. **Regularly rotate your API keys** in production
5. **Monitor your database** for unusual activity

## Free Tier Limits

Supabase's free tier includes:
- 500MB database storage
- 2GB bandwidth
- 50,000 monthly active users
- 1GB file storage

These limits are generous for most applications and you can upgrade when needed.


