# Facebook Developer App Creation Guide
## Instagram Graph API Integration - Step-by-Step Instructions

### Overview
To integrate Instagram Graph API, you need to create a Facebook Developer App with Instagram Graph API permissions. This guide walks you through the complete process.

---

## Step 1: Create Facebook Developer Account

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Sign in with your Facebook account (same account as your Instagram Business/Creator account)

2. **Verify Account (First Time Only)**
   - If prompted, complete phone number verification
   - This may take 24-48 hours for approval

---

## Step 2: Create New App

1. **Access App Dashboard**
   - Click "My Apps" → "Create App"

2. **Select App Type**
   - Choose: **"Business"** (not "Consumer" or "Community")
   - Click "Next"

3. **App Details**
   - **Display Name**: "GrowthHub Instagram Analytics" (or your preferred name)
   - **App Contact Email**: Your email address
   - **Business Manager Account**: Select or create one
   - Click "Create App ID"

---

## Step 3: Configure App Settings

1. **App Dashboard Access**
   - You'll be redirected to the App Dashboard
   - Note your **App ID** (we need this)

2. **Add Instagram Graph API Product**
   - In the left sidebar, click "Add Product"
   - Find "Instagram Graph API" → Click "Set Up"
   - This adds Instagram API functionality to your app

---

## Step 4: Set Up Instagram Basic Display (Required for OAuth)

1. **Add Instagram Basic Display Product**
   - In the left sidebar, click "Add Product" again
   - Find "Instagram Basic Display" → Click "Set Up"
   - **Important**: This provides OAuth functionality needed for Instagram

2. **Configure Basic Display Settings**
   - Go to Instagram Basic Display → Settings
   - **OAuth Redirect URIs**: Add these URLs:
     ```
     https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-oauth-callback
     ```
   - Click "Save Changes"

---

## Step 5: Configure App Permissions

1. **Navigate to App Review**
   - In left sidebar: Settings → App Review

2. **Request Permissions (Required)**
   Add these permissions under "Permissions and Features":

   **Instagram Graph API Permissions:**
   - `instagram_basic` - Basic Instagram account info
   - `instagram_manage_insights` - Access to analytics and insights
   - `instagram_manage_comments` - Manage comments (optional)

   **Permissions Process:**
   - Click "Request" next to each permission
   - Fill out the justification form for each:
     - Explain you're building an Instagram analytics platform
     - Show screenshots of your app (I'll provide these)
     - Mention it analyzes insights, follower growth, engagement
   - Submit for review

3. **App Type Verification**
   - Go to "App Type" section
   - Select "Business" and "Not a business"
   - This is needed for Instagram Business accounts

---

## Step 6: Configure OAuth Settings

1. **Navigate to Facebook Login**
   - In left sidebar: Facebook Login → Settings

2. **OAuth Settings Configuration**
   - **Valid OAuth Redirect URIs**: Add:
     ```
     https://zkqpimisftlwehwixgev.supabase.co/functions/v1/instagram-oauth-callback
     ```
   - **Use Strict Mode for Redirect URIs**: Turn ON
   - Click "Save Changes"

---

## Step 7: Get App Secret

1. **Access App Secret**
   - In left sidebar: Settings → Basic
   - Find "App Secret" → Click "Show"
   - **Important**: Copy and save this securely

2. **Note Your App Credentials**
   - **App ID**: Found at top of page (large number)
   - **App Secret**: Just obtained (long string)

---

## Step 8: Connect Instagram Account

1. **App Roles Assignment**
   - Go to Settings → App Roles → Roles
   - Add your Instagram Business/Creator account as an "Instagram Tester"
   - This allows testing without full review process

2. **Instagram Business Account Verification**
   - Your Instagram account must be a Business or Creator account
   - If Personal account: Go to Instagram → Settings → Account → Switch to Professional Account
   - Connect to Facebook Page (required for Business accounts)

---

## Step 9: App Testing (Optional)

1. **Test App Functionality**
   - Use the Instagram tester account
   - Test the OAuth flow
   - Verify data access permissions

2. **App Review (If Required)**
   - If your app needs public access, submit for App Review
   - Provide detailed explanation and screenshots
   - Review process takes 1-7 days

---

## What We Need From You

Once you complete these steps, please provide:

1. **App ID**: Your Facebook App ID (looks like: 1234567890123456)
2. **App Secret**: Your Facebook App Secret (long string like: abc123def456...)

## Troubleshooting

**Common Issues:**
- **Account Verification**: Phone verification can take 24-48 hours
- **Permission Denied**: Ensure Instagram account is Business/Creator type
- **OAuth Errors**: Check redirect URIs match exactly
- **App Secret Not Visible**: Refresh page and try again

**Required App Features:**
- Instagram Graph API product added
- Instagram Basic Display product added
- Valid OAuth redirect URIs configured
- Required permissions requested

## Next Steps After Getting Credentials

Once you provide the App ID and App Secret, I will:
1. Configure them as Supabase secrets
2. Deploy all backend functions and database schema
3. Update frontend configuration
4. Build and deploy the complete application
5. Test the Instagram OAuth integration end-to-end

## Timeline Estimate

- **App Creation**: 10-15 minutes
- **Account Verification**: 24-48 hours (if first time)
- **App Review**: 1-7 days (only if requesting public access)
- **Complete Integration**: 1-1.5 hours (after you provide credentials)

---

**Ready to proceed?** Follow these steps and let me know when you have your App ID and App Secret!