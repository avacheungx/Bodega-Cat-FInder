# Bodega Cat Finder 🐱

Find bodega cats in New York City! A web app to discover and connect with cats living in local bodegas, delis, and convenience stores.

## Features

- **Interactive Map**: Find cats and bodegas on Google Maps
- **Search & Filters**: Search by location, breed, personality
- **User Accounts**: Save favorites, upload new cats/bodegas
- **Reviews & Photos**: Rate cats and share photos
- **Location-Based**: Find cats near you with GPS

## Quick Start

1. **Clone and setup**
   ```bash
   git clone https://github.com/avacheungx/Bodega-Cat-FInder.git
   cd bodega
   cp env.example .env
   ```

2. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API, Places API, Geocoding API
   - Create API key and add to `.env`:
     ```
     GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

3. **Run the app**
   ```bash
   docker-compose up --build
   ```

4. **Open in browser**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:5001

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python Flask + PostgreSQL
- **Maps**: Google Maps API
- **Deployment**: Docker

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
flask run

# Frontend  
cd frontend
npm install
npm start
```

## Deployment

### Frontend (GitHub Pages)

The frontend is automatically deployed to GitHub Pages when you push to the main branch.

**Manual deployment:**
```bash
cd frontend
npm run deploy
```

**Live site:** https://avacheungx.github.io/Bodega-Cat-FInder

### Backend Deployment

For the backend, you'll need to deploy to a service that supports Python/Flask:

#### Option 1: Render (Recommended - Free)
1. Go to [Render](https://render.com/) and create an account
2. Connect your GitHub repository
3. Create a new Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app`
6. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET_KEY`: A secure random string
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

#### Option 2: Railway
1. Go to [Railway](https://railway.app/) and create an account
2. Connect your GitHub repository
3. Add a PostgreSQL database
4. Deploy the backend service
5. Set environment variables as above

#### Option 3: Heroku
1. Create a Heroku account and install CLI
2. Create a new app: `heroku create your-app-name`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET_KEY=your-secret-key
   heroku config:set GOOGLE_MAPS_API_KEY=your-api-key
   ```
5. Deploy: `git push heroku main`

### After Backend Deployment

1. **Update Frontend API URL**: Set the `REACT_APP_API_URL` environment variable in your GitHub repository:
   - Go to your repository Settings → Secrets and variables → Actions
   - Add `REACT_APP_API_URL` with your backend URL (e.g., `https://your-app.onrender.com`)

2. **Redeploy Frontend**: The frontend will automatically redeploy with the new API URL

## Troubleshooting

### GitHub Pages Issues

If you see network errors or the app doesn't load properly:

1. **Check Browser Console**: Look for CORS errors or failed API calls
2. **Verify Backend URL**: Ensure `REACT_APP_API_URL` is set correctly
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or clear cache
4. **Check Backend Status**: Verify your backend is running and accessible

### Common Issues

- **"Failed to fetch" errors**: Usually means the backend URL is incorrect or the backend is down
- **CORS errors**: Backend needs to allow requests from your frontend domain
- **404 errors on navigation**: This should be fixed with the 404.html file included in this repo

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details
