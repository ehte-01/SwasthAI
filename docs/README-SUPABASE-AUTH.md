# Supabase Authentication Integration for SwasthAI

This guide explains how to set up and use the Supabase authentication that has been integrated into the SwasthAI application.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Once your project is created, go to the project dashboard

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Project Settings > API
2. Copy your **Project URL** and **anon/public** key

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (you can copy from `.env.local.example`)
2. Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Enable Email Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Make sure Email provider is enabled
3. Configure any additional settings as needed (password strength, etc.)

## Features Implemented

- **Authentication Context**: A React context that provides authentication state and methods throughout the application
- **Login & Signup**: Updated to use Supabase authentication
- **Protected Routes**: Middleware to protect routes that require authentication
- **User Profile**: A simple profile page that displays user information
- **Session Management**: Automatic session handling and refresh

## Usage

### Authentication Hook

You can use the `useAuth` hook in any component to access authentication functionality:

```jsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, signIn, signOut, signUp } = useAuth();
  
  // Check if user is logged in
  if (user) {
    return <p>Welcome, {user.email}!</p>;
  }
  
  return <p>Please log in</p>;
}
```

### Protected Routes

To protect a route, you can use the `ProtectedRoute` component:

```jsx
import ProtectedRoute from '@/components/protected-route';

export default function SecurePage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

Alternatively, the middleware will automatically redirect unauthenticated users away from protected routes defined in `middleware.ts`.

## Testing

To test the authentication flow:

1. Start the development server: `npm run dev`
2. Navigate to `/auth/signup` to create a new account
3. After signing up, you'll be redirected to the login page
4. Log in with your credentials
5. Try accessing the profile page at `/profile`
6. Test logging out and verify you're redirected to the login page

## Troubleshooting

- **Authentication Issues**: Check your Supabase credentials in `.env.local`
- **Redirect Loops**: Ensure the middleware is correctly configured
- **Session Errors**: Make sure the AuthProvider is wrapping your application