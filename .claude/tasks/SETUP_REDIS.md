# Redis Cache Setup for Team Member Feedback

## Upstash Redis Configuration (Recommended)

This implementation uses Upstash Redis for serverless-friendly caching with automatic fallback to in-memory caching.

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or sign in
3. Create a new Redis database
4. Choose your region (closest to your users)
5. Select the free tier for testing

### 2. Get Your Credentials

From your Upstash dashboard, copy:
- **KV_REST_API_URL**: Your Redis REST URL
- **KV_REST_API_READ_ONLY_TOKEN**: Your Redis REST token

### 3. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Upstash Redis Configuration
KV_REST_API_URL=https://your-redis-url.upstash.io
KV_REST_API_READ_ONLY_TOKEN=your-redis-token

# Cron Job Security
CRON_SECRET=your_random_secret_for_cron_jobs
```

And to your Vercel deployment environment variables:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the same variables

### 4. Cron Configuration

The `vercel.json` file is already configured with the cache cleanup cron:

```json
{
    "crons": [
        {
            "path": "/api/cron/sync-notion",
            "schedule": "0 9 * * *"
        },
        {
            "path": "/api/cron/cache-cleanup",
            "schedule": "0 * * * *"
        }
    ]
}
```

**Note**: Cache cleanup uses Authorization header (same pattern as sync-notion) instead of query parameters for better security.

### 5. How It Works

#### **Caching Strategy**
- **Primary**: Upstash Redis with 1-hour TTL
- **Fallback**: In-memory cache for development/Redis failures
- **User Isolation**: Cache keys use format `team-member:user@example.com`

#### **Cache Flow**
1. User requests team member data
2. Check Upstash Redis first
3. If miss or error, check memory cache
4. If miss, fetch from external API and cache result
5. Return data to user

#### **Automatic Cleanup**
- **Upstash TTL**: Redis automatically expires keys after 1 hour
- **Admin-Controlled Cron**: Hourly cleanup only runs if enabled in Admin Dashboard
- **Memory Cleanup**: Clears expired in-memory entries
- **Manual Cleanup**: Available through Admin Dashboard

### 6. Benefits of This Approach

✅ **Simple Setup**: Just add environment variables
✅ **Serverless-Friendly**: Upstash designed for serverless
✅ **Automatic Scaling**: No server management needed
✅ **Generous Free Tier**: 10,000 requests/day free
✅ **Fallback Safety**: Works even without Redis
✅ **User Security**: Complete data isolation per user

### 7. Testing the Cache

1. **First Visit**: Visit your home page - will be slower (fetches from API)
2. **Second Visit**: Much faster (served from cache)
3. **Check Logs**: Look for cache hit/miss messages in your console
4. **Upstash Dashboard**: Monitor requests in Upstash console

### 8. Cache Management

#### **Admin Dashboard Control**
1. **Enable/Disable Hourly Cleanup**: Toggle "Enable Hourly Cache Cleanup" in Admin Dashboard
2. **Manual Cache Cleanup**: Click "Clean Cache" button in Admin Dashboard
3. **Monitoring**: Check cleanup status and results in Admin interface

#### **Manual Cache Clear via API** (for debugging)
```bash
# Manual cleanup via API (requires Authorization header)
curl -X POST https://your-app.vercel.app/api/cron/cache-cleanup \
  -H "Authorization: Bearer your_cron_secret"
```

#### **Cache Status** (for debugging)
Add this to any API route to check cache status:
```typescript
import { teamMemberCache } from '@/lib/cache';
console.log(teamMemberCache.getStatus());
```

#### **How the Admin Control Works**
- **Cron Job**: Runs every hour but checks admin setting first
- **If Disabled**: Cron returns early with "disabled" message
- **If Enabled**: Proceeds with cleanup as normal
- **Manual Override**: Admin can always manually trigger cleanup regardless of setting

### 9. Costs

- **Free Tier**: 10,000 requests/day, 256MB storage
- **Pay-as-you-go**: $0.2 per 100K requests after free tier
- **For typical usage**: Likely to stay within free tier

### 10. Security Features

- **User Isolation**: Each user's data cached separately
- **Authentication Required**: Cache only works for authenticated users
- **Secure Tokens**: Upstash uses secure REST tokens
- **CRON Protection**: Cleanup endpoint protected by secret
- **No Cross-User Access**: Impossible to access other users' cached data

This setup provides excellent performance improvements while maintaining all security requirements!