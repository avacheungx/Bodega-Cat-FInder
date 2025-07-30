import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Clock, Upload, Search, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Bodega Cats in NYC
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover the hidden gems of New York City - local bodegas, delis, and shops with resident cats. 
          Connect with the feline friends that make our neighborhoods special.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/search" className="btn-primary text-lg px-8 py-3">
            <Search className="w-5 h-5 inline mr-2" />
            Start Exploring
          </Link>
          <Link to="/register" className="btn-secondary text-lg px-8 py-3">
            Join the Community
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Find Nearby Cats</h3>
          <p className="text-gray-600">Discover bodega cats in your neighborhood using our interactive map.</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Save Favorites</h3>
          <p className="text-gray-600">Keep track of your favorite cats and bodegas for future visits.</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Share Discoveries</h3>
          <p className="text-gray-600">Add new cats and bodegas to help grow our community database.</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Rate & Review</h3>
          <p className="text-gray-600">Share your experiences and help others find the best bodega cats.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/search" className="card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold">Search Cats</h3>
              <p className="text-gray-600">Find cats by location, breed, or personality</p>
            </div>
          </div>
        </Link>

        <Link to="/recently-viewed" className="card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold">Recently Viewed</h3>
              <p className="text-gray-600">See cats you've recently discovered</p>
            </div>
          </div>
        </Link>

        <Link to="/upload" className="card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-8 h-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold">Add New Cat</h3>
              <p className="text-gray-600">Help us grow our database</p>
            </div>
          </div>
        </Link>
      </div>

      {/* About Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">About Bodega Cats</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Bodega cats are more than just pets - they're beloved members of our local communities. 
          These feline friends help keep stores pest-free while providing comfort and companionship 
          to customers and shop owners alike. Our mission is to celebrate these special cats and 
          help you discover the unique character they bring to New York City's neighborhoods.
        </p>
      </div>
    </div>
  );
}; 