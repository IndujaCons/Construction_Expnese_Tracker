# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Construction Expense Tracker.

## 📋 Prerequisites

- Google Cloud Console account
- Construction Expense Tracker project set up locally

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Enter project name: `Construction Expense Tracker`
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: `Construction Expense Tracker`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click "Save and Continue"
5. Skip "Scopes" for now (click "Save and Continue")
6. Add test users if needed, then "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the name: `Construction Expense Tracker Web Client`
5. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourapp.vercel.app`)
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourapp.vercel.app/api/auth/callback/google` (for production)
7. Click "Create"

### 5. Copy Your Credentials

After creating the OAuth client, you'll see a dialog with:
- **Client ID**: Copy this value
- **Client Secret**: Copy this value

### 6. Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Google OAuth credentials:
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID="your-actual-client-id-here"
   GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
   
   # NextAuth.js Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-random-secret-here"
   ```

3. Generate a random secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth flow

## 🎯 User Role Assignment

The app automatically assigns roles based on email patterns:

- **Emails containing "wife" or "spouse"** → `WIFE` role
- **Emails containing "architect" or "arch"** → `ARCHITECT` role  
- **All other emails** → `OWNER` role (default)

You can customize this logic in `app/api/auth/[...nextauth]/route.ts`.

## 🚀 Production Deployment

### For Vercel:

1. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)

2. Update your Google OAuth settings with production URLs

### For Other Platforms:

1. Set the same environment variables in your hosting platform
2. Update the authorized origins and redirect URIs in Google Cloud Console

## 🔧 Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
   - Ensure there are no trailing slashes

2. **"invalid_client" error**:
   - Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Make sure there are no extra spaces in your `.env` file

3. **"access_denied" error**:
   - Check that your OAuth consent screen is properly configured
   - Ensure your app is not restricted to specific users only

4. **Users not getting proper roles**:
   - Check the role assignment logic in the `signIn` callback
   - Verify the user's email pattern matches your role rules

## 🎉 Success!

Once configured, users can:

1. **Sign in with Google** using their Google accounts
2. **Get automatic role assignment** based on their email
3. **Access all construction expense tracking features**
4. **Maintain their data** across sessions

The app supports both Google OAuth and traditional email/password login for maximum flexibility.