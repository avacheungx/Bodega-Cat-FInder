# Bodega Cat Finder 🐱

A modern web application to help users discover and connect with bodega cats throughout New York City. Find your local bodega cats, explore their stories, and contribute to the community!

## ✨ Features

### 🗺️ **Interactive Maps & Location**
- **Google Maps Integration**: Interactive map showing cat and bodega locations
- **Location-Based Search**: Find cats and bodegas near your current location
- **Distance Calculation**: See how far each cat/bodega is from you
- **Auto-Location Detection**: Get your current location with one click
- **Address Geocoding**: Automatic coordinate conversion for new entries

### 🔍 **Advanced Search & Discovery**
- **Smart Search**: Search by cat name, breed, personality, or bodega name
- **Advanced Filters**: Filter by breed, personality, friendliness, and rating
- **Real-time Results**: Instant search results with live updates
- **Map Integration**: Visual search results on interactive map

### 👤 **User Experience**
- **User Authentication**: Secure login/registration with JWT tokens
- **Personal Profiles**: Save favorite cats and bodegas
- **Recently Viewed**: Track your browsing history
- **Content Upload**: Add new cats and bodegas with photo uploads
- **Reviews & Ratings**: Rate and review cats and bodegas
- **Photo Galleries**: Browse cat and bodega photos

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Tailwind CSS**: Beautiful, modern styling with utility classes
- **TypeScript**: Full type safety and better development experience
- **Real-time Notifications**: Toast notifications for user feedback
- **Loading States**: Smooth loading animations and feedback

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript for type safety
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Google Maps JavaScript API** for interactive maps
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for beautiful icons

### **Backend**
- **Python Flask** with RESTful API design
- **SQLAlchemy** ORM with PostgreSQL
- **JWT Authentication** for secure user sessions
- **Google Maps Geocoding API** for address conversion
- **File upload handling** with secure file storage

### **Infrastructure**
- **Docker & Docker Compose** for containerization
- **PostgreSQL** database
- **Environment-based configuration**
- **Production-ready setup**

## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/avacheungx/Bodega-Cat-FInder.git
cd bodega
```

### 2. **Environment Setup**
```bash
cp env.example .env
```

### 3. **Configure Google Maps API**

The application requires a valid Google Maps API key with the following services enabled:

**Required Services:**
- **Maps JavaScript API** - For interactive maps
- **Places API** - For location search and autocomplete
- **Geocoding API** - For address-to-coordinate conversion

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

### 4. **Start the Application**
```bash
docker-compose up --build
```

### 5. **Access the Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001

## 🏗️ Development Setup

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)

### **Backend Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### **Frontend Development**
```bash
cd frontend
npm install
npm start
```

### **TypeScript & Linting**
The project uses TypeScript for type safety and ESLint for code quality:

```bash
# Check TypeScript compilation
cd frontend
npx tsc --noEmit

# Run ESLint
npx eslint src --ext .ts,.tsx

# Build for production
npm run build
```

## 📁 Project Structure

```
bodega/
├── backend/                 # Flask backend
│   ├── routes/             # API endpoints
│   ├── models.py           # Database models
│   ├── utils/              # Utility functions
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node.js dependencies
│   └── tsconfig.json       # TypeScript configuration
├── docker-compose.yml      # Docker services
└── README.md              # This file
```

## 🔧 Configuration

### **Environment Variables**
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `FLASK_ENV`: Development/production environment

### **VS Code Configuration**
The project includes VS Code settings for optimal development experience:
- Tailwind CSS IntelliSense
- TypeScript support
- ESLint integration
- CSS validation configuration

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
python -m pytest
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

## 🚀 Deployment

### **Production Build**
```bash
# Build frontend
cd frontend
npm run build

# Start production services
docker-compose -f docker-compose.prod.yml up
```

### **Environment Variables for Production**
Make sure to set appropriate environment variables for production:
- Use a production PostgreSQL database
- Set `FLASK_ENV=production`
- Configure proper CORS settings
- Set up SSL certificates

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   cd frontend && npm run lint
   cd backend && python -m pytest
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📝 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### **Cat Endpoints**
- `GET /api/search/cats` - Search cats with filters
- `GET /api/cats/<id>` - Get cat details
- `POST /api/cats/` - Create new cat
- `PUT /api/cats/<id>` - Update cat
- `DELETE /api/cats/<id>` - Delete cat

### **Bodega Endpoints**
- `GET /api/search/bodegas` - Search bodegas
- `GET /api/bodegas/<id>` - Get bodega details
- `POST /api/bodegas/` - Create new bodega
- `PUT /api/bodegas/<id>` - Update bodega

### **Location Endpoints**
- `GET /api/search/nearby` - Find cats/bodegas near location
- `GET /api/search/filters` - Get available filter options

## 🐛 Troubleshooting

### **Common Issues**

**Google Maps not loading:**
- Verify your API key is correct
- Ensure all required APIs are enabled
- Check API key restrictions

**Database connection issues:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**TypeScript compilation errors:**
- Run `npm install` in frontend directory
- Check `tsconfig.json` configuration
- Verify all dependencies are installed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps API** for mapping functionality
- **Tailwind CSS** for beautiful styling
- **React community** for excellent tooling
- **Flask community** for robust backend framework

---

**Made with ❤️ for bodega cats everywhere! 🐱**
