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

### GitHub Pages (Frontend)

The frontend is automatically deployed to GitHub Pages when you push to the main branch.

**Manual deployment:**
```bash
cd frontend
npm run deploy
```

**Live site:** https://avacheungx.github.io/Bodega-Cat-FInder

### Backend Deployment

For the backend, you'll need to deploy to a service that supports Python/Flask:

- **Heroku**: Easy deployment with PostgreSQL add-on
- **Railway**: Simple deployment with database
- **Render**: Free tier with PostgreSQL
- **DigitalOcean App Platform**: Managed deployment

After deploying the backend, set the `REACT_APP_API_URL` environment variable in your GitHub repository secrets.

## License

MIT License
