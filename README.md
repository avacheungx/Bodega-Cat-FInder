# Bodega Cat Finder 🐱

A web application to help users find bodegas, delis, and shops in New York City that have resident cats (bodega cats).

## Features

- **User Authentication**: Create accounts, login, and manage profiles
- **Search & Discovery**: Find bodega cats by location, filters, and search terms
- **Interactive Maps**: Google Maps integration to locate bodegas and cats
- **Cat & Bodega Profiles**: Detailed information about cats and their bodegas
- **Reviews & Ratings**: Rate and review cats and bodegas
- **Content Upload**: Add new cats and bodegas to the database
- **Save & Favorites**: Save your favorite cats and bodegas
- **Recently Viewed**: Track recently viewed cats

## Tech Stack

- **Backend**: Python Flask
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Maps**: Google Maps API
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT tokens

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bodega
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Google Maps API key and other credentials
   ```

3. **Configure Google Maps API Key**
   
   The application requires a valid Google Maps API key with the following services enabled:
   
   **Required Services:**
   - Maps JavaScript API
   - Places API
   - Geocoding API
   
   **Setup Steps:**
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Enable the required APIs:
      - Navigate to "APIs & Services" > "Library"
      - Search for and enable "Maps JavaScript API"
      - Search for and enable "Places API"
      - Search for and enable "Geocoding API"
   4. Create credentials:
      - Go to "APIs & Services" > "Credentials"
      - Click "Create Credentials" > "API Key"
      - Copy the generated API key
   5. Restrict the API key (recommended):
      - Click on the created API key
      - Under "Application restrictions", select "HTTP referrers"
      - Add `localhost:3001/*` for development
      - Under "API restrictions", select "Restrict key"
      - Select the three APIs mentioned above
   6. Update your `.env` file:
      ```
      GOOGLE_MAPS_API_KEY=your_actual_api_key_here
      ```
   
   **Note:** The current API key in the `.env` file is a placeholder and will not work. You must replace it with your own valid API key.

3. **Start with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
