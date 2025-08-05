# Quick Backend Deployment Guide (For Beginners)

This guide will help you deploy your backend in about 10 minutes using Render (it's free and easy!).

## Step 1: Create a Render Account

1. Go to [Render.com](https://render.com)
2. Click "Get Started" and sign up with your GitHub account
3. This will connect your GitHub repository automatically

## Step 2: Deploy the Backend

1. In Render, click "New +" → "Web Service"
2. Connect your GitHub repository: `avacheungx/Bodega-Cat-FInder`
3. Configure the service:
   - **Name**: `bodega-cat-finder-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3
4. Click "Create Web Service"

## Step 3: Add a Database

1. In Render, click "New +" → "PostgreSQL"
2. Name it: `bodega-cat-finder-db`
3. Click "Create Database"
4. Copy the "Internal Database URL" (you'll need this)

## Step 4: Set Environment Variables

1. Go back to your Web Service
2. Click "Environment" tab
3. Add these variables:
   - **Key**: `DATABASE_URL` → **Value**: (paste the database URL from step 3)
   - **Key**: `JWT_SECRET_KEY` → **Value**: `my-super-secret-key-change-this-later`
   - **Key**: `GOOGLE_MAPS_API_KEY` → **Value**: (your Google Maps API key)

## Step 5: Get Your Backend URL

1. Once deployed, Render will give you a URL like: `https://your-app-name.onrender.com`
2. Copy this URL - you'll need it for the next step

## Step 6: Update Frontend Configuration

1. Go to your GitHub repository: https://github.com/avacheungx/Bodega-Cat-FInder
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository variable"
4. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: (paste your backend URL from step 5)
5. Click "Add variable"

## Step 7: Redeploy Frontend

Run this command in your terminal:

```bash
cd frontend
npm run deploy
```

## Step 8: Test Your App

1. Go to https://avacheungx.github.io/Bodega-Cat-FInder/
2. The homepage should now load properly
3. Click "Search" - it should work without errors
4. Try searching for cats or bodegas

## Troubleshooting

### If the backend fails to deploy:
- Check the logs in Render
- Make sure all environment variables are set
- Verify the database URL is correct

### If the frontend still shows errors:
- Make sure `REACT_APP_API_URL` is set correctly
- Wait a few minutes for the deployment to complete
- Clear your browser cache (Ctrl+F5)

### If you need a Google Maps API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable: Maps JavaScript API, Places API, Geocoding API
4. Create credentials → API Key
5. Add the key to your Render environment variables

## Need Help?

- Check the logs in Render for error messages
- Make sure all steps are completed in order
- The backend takes a few minutes to start up (this is normal)

That's it! Your app should now be fully functional. 🎉 