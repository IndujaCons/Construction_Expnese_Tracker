# ⚡ Quick Google OAuth Setup

## 🚨 **Current Issue**
You're seeing this error: `OAuth client was not found` because the Google OAuth credentials need to be configured.

## 🔧 **5-Minute Fix**

### **Step 1: Get Google OAuth Credentials**

1. **Visit**: https://console.cloud.google.com/
2. **Create Project**: "Construction Expense Tracker" 
3. **Enable API**: Search "Google+ API" → Enable
4. **OAuth Consent**: 
   - Choose "External" 
   - App name: "Construction Expense Tracker"
   - Your email for support/developer contact
5. **Create Credentials**:
   - APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client IDs
   - Web application
   - **Authorized origins**: `http://localhost:3000`
   - **Redirect URIs**: `http://localhost:3000/api/auth/callback/google`

### **Step 2: Update .env File**

Replace these lines in your `.env` file:

```env
GOOGLE_CLIENT_ID="PASTE_YOUR_ACTUAL_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="PASTE_YOUR_ACTUAL_CLIENT_SECRET_HERE"
```

### **Step 3: Restart Development Server**

```bash
npm run dev
```

### **Step 4: Test Google OAuth**

1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Should now work! 🎉

## 📋 **Checklist**

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID copied to .env file
- [ ] Client Secret copied to .env file
- [ ] Development server restarted
- [ ] Google OAuth tested

## 🆘 **Still Having Issues?**

### **Common Problems:**

1. **"redirect_uri_mismatch"**:
   - Make sure redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
   - No trailing slashes!

2. **"invalid_client"**:
   - Double-check Client ID and Secret are copied correctly
   - No extra spaces in .env file

3. **"access_denied"**:
   - Make sure OAuth consent screen is configured
   - Try signing in with the same email used in Google Cloud Console

## 🚀 **After OAuth Works**

Once Google OAuth is working, you can:

1. **Create your first project**: "Indu's Residency"
2. **Invite team members** via their Gmail addresses
3. **Start tracking expenses** collaboratively!

---

**💡 Tip**: The detailed setup guide is in `GOOGLE_OAUTH_SETUP.md` if you need more help!