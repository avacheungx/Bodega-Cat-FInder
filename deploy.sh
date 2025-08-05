#!/bin/bash

# Bodega Cat Finder Deployment Script

echo "🚀 Deploying Bodega Cat Finder..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Deploy frontend to GitHub Pages
echo "📦 Deploying frontend to GitHub Pages..."
cd frontend
npm run deploy
cd ..

echo "✅ Frontend deployed to GitHub Pages!"
echo ""
echo "🌐 Next steps:"
echo "1. Deploy the backend to a service like Render, Railway, or Heroku"
echo "2. Set the REACT_APP_API_URL environment variable in your GitHub repository"
echo "3. The frontend will automatically redeploy with the new API URL"
echo ""
echo "📖 See README.md for detailed deployment instructions" 