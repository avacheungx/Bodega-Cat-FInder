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
