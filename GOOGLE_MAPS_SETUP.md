# Google Maps Setup Guide

## Issues Fixed
- ✅ Viewport metadata warning (moved to separate viewport export)
- 🔧 Google Maps integration troubleshooting

## Quick Fix for Google Maps

### 1. Check Environment Variable
Visit the tracking page - you should see a debug panel that shows if your API key is detected.

### 2. Create `.env.local` file
In your project root (same directory as `package.json`), create a file called `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Important:** 
- Use `NEXT_PUBLIC_` prefix for client-side access
- No spaces around the `=`
- Replace `YOUR_API_KEY_HERE` with your actual API key

### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (optional, for address lookups)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### 4. Secure Your API Key (Recommended)

1. In Google Cloud Console, click on your API key
2. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add: `localhost:3000/*` for development
   - Add: `yourdomain.com/*` for production
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select only "Maps JavaScript API"

### 5. Restart Development Server

After creating/updating `.env.local`:

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

### 6. Test

1. Go to `/tracking`
2. Enter tracking number: `SP123456789` or `123456789`
3. You should see the map with markers and route

## Common Issues

### Issue: "Failed to load map"
**Solution:** Check that:
- API key is in `.env.local`
- Maps JavaScript API is enabled in Google Cloud
- No billing issues in Google Cloud (you need a billing account)

### Issue: Map shows but no markers
**Solution:** API key might be restricted to wrong domain

### Issue: "This page can't load Google Maps correctly"
**Solution:** Either the API key is invalid or billing is not set up

## Removing Debug Panel

Once maps are working, remove the debug panel by deleting this line from `app/tracking/page.tsx`:

```tsx
<MapDebug />
```

## Free Tier Limits

Google Maps provides:
- $200 monthly credit (covers ~28,000 map loads)
- After that: $7 per 1,000 additional loads

For development, this is more than enough!
