# Deployment Guide

This guide will help you fix the GitHub Pages issues and deploy your Bodega Cat Finder app properly.

## Current Issues

The app currently has these problems when deployed to GitHub Pages:

1. **Network Errors**: The frontend tries to connect to `localhost:5001` for API calls
2. **404 Errors**: Client-side routing doesn't work properly
3. **No Backend**: There's no backend deployed to handle API requests

## Step-by-Step Fix

### 1. Deploy the Backend

Choose one of these options:

#### Option A: Render (Recommended - Free)

1. Go to [Render](https://render.com/) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bodega-cat-finder-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3
5. Add environment variables:
   - `DATABASE_URL`: Will be auto-generated when you add a database
   - `JWT_SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`)
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
6. Click "Create Web Service"
7. Add a PostgreSQL database:
   - Click "New +" → "PostgreSQL"
   - Name it `bodega-cat-finder-db`
   - Link it to your web service

#### Option B: Railway

1. Go to [Railway](https://railway.app/) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add a PostgreSQL database
5. Set environment variables as above

### 2. Update Frontend Configuration

Once your backend is deployed, you need to tell the frontend where to find it:

1. Go to your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository variable"
4. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-app.onrender.com`)

### 3. Redeploy Frontend

The frontend will automatically redeploy when you push changes, or you can manually trigger it:

```bash
cd frontend
npm run deploy
```

### 4. Test the Fix

1. Go to https://avacheungx.github.io/Bodega-Cat-FInder/
2. Open browser developer tools (F12)
3. Check the Console tab for any remaining errors
4. Try navigating to different pages (like /search)

## Troubleshooting

### Still seeing network errors?

1. **Check the backend URL**: Make sure `REACT_APP_API_URL` is correct
2. **Verify backend is running**: Visit your backend URL directly
3. **Check CORS**: The backend should allow requests from GitHub Pages

### Pages not loading?

1. **Clear browser cache**: Hard refresh (Ctrl+F5)
2. **Check 404.html**: Make sure the file exists in your repository
3. **Verify routing**: The SPA routing should work with the included scripts

### Backend deployment issues?

1. **Check logs**: Look at the deployment logs in your hosting service
2. **Verify requirements**: Make sure all dependencies are in `requirements.txt`
3. **Database connection**: Ensure the database URL is correct

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET_KEY` | Secret for JWT tokens | `your-secret-key-here` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |
| `REACT_APP_API_URL` | Backend API URL | `https://your-app.onrender.com` |

## Quick Test

After deployment, you can test if everything is working:

1. Visit your frontend URL
2. Open browser console
3. Look for successful API calls (no red errors)
4. Try the search functionality
5. Check if the map loads properly

If you see successful API calls and no network errors, the deployment is working correctly! 