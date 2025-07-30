#!/bin/bash

# Bodega Cat Finder Startup Script

echo "🐱 Starting Bodega Cat Finder..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 .env file created with temporary Google Maps API key."
    echo "   You can update it later with a real API key from: https://console.cloud.google.com/"
    echo ""
fi

# Build and start the application
echo "🚀 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   Health Check: http://localhost:5000/api/health"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
    echo ""
    echo "🎉 Bodega Cat Finder is ready!"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi 