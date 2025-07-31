import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, Heart, X, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GoogleMap } from '../components/GoogleMap';
import { MapFallback } from '../components/MapFallback';
import { isGoogleMapsConfigured } from '../utils/maps';
import { useAuth } from '../contexts/AuthContext';

interface Cat {
  id: number;
  name: string;
  bodega_name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  age: string;
  breed: string;
  sex: string;
  personality: string;
  color: string;
  weight: string;
  is_friendly: boolean;
  rating: number;
  review_count: number;
  primary_photo: string | null;
  distance?: number;
}

interface Bodega {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  review_count: number;
  cat_count: number;
  is_verified: boolean;
  primary_photo: string | null;
  distance?: number;
}

interface FilterOptions {
  breeds: string[];
  personalities: string[];
  rating_range: {
    min: number;
    max: number;
    average: number;
  };
}

interface CatFilters {
  breed: string;
  personality: string;
  min_rating: number;
  max_rating: number;
  is_friendly: boolean | null;
}

interface BodegaFilters {
  min_cats: number;
  max_cats: number;
  min_rating: number;
  max_rating: number;
  verified_only: boolean;
}

export const SearchPage: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'cats' | 'bodegas'>('cats');
  const [cats, setCats] = useState<Cat[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  // Ensure axios base URL is set immediately
  useEffect(() => {
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = 'http://localhost:5001';
      console.log('Setting axios base URL in SearchPage:', axios.defaults.baseURL);
    }
  }, []);
  
  // Filter states
  const [catFilters, setCatFilters] = useState<CatFilters>({
    breed: '',
    personality: '',
    min_rating: 0,
    max_rating: 5,
    is_friendly: null
  });
  
  const [bodegaFilters, setBodegaFilters] = useState<BodegaFilters>({
    min_cats: 0,
    max_cats: 100,
    min_rating: 0,
    max_rating: 5,
    verified_only: false
  });

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLocationPermission('denied');
      return;
    }

    // Check if permission is already denied
    if (locationPermission === 'denied') {
      toast.error('Location permission was denied. Please enable location access in your browser settings and try again.');
      return;
    }

    setLocationPermission('pending');
    
    const options = {
      enableHighAccuracy: false, // Changed to false for better compatibility
      timeout: 15000, // Increased timeout
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        toast.success('Location detected! Results sorted by distance.');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            toast.error(
              'Location permission denied. To enable location-based search:\n' +
              '1. Click the lock icon in your browser address bar\n' +
              '2. Allow location access\n' +
              '3. Refresh the page and try again'
            );
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error('Location unavailable. Please check your device settings and try again.');
            break;
          case 3: // TIMEOUT
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('Unable to get your location. Results will not be sorted by distance.');
        }
      },
      options
    );
  };

  // Load filter options
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      console.log('Loading filter options from:', '/api/search/filters');
      const response = await axios.get('/api/search/filters');
      console.log('Filter options response:', response.data);
      setFilterOptions(response.data);
    } catch (error: any) {
      console.error('Error loading filter options:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method
        });
        if (error.response?.status === 404) {
          toast.error('Filter options endpoint not found. Please check the backend configuration.');
        } else {
          toast.error(`Failed to load filter options: ${error.response?.status || 'Network error'}`);
        }
      } else {
        toast.error('Failed to load filter options');
      }
    } finally {
      setLoadingFilters(false);
    }
  };

  const searchCats = async () => {
    setLoading(true);
    try {
      let response;
      
      if (userLocation) {
        // Use nearby search with user location
        const params = new URLSearchParams({
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString(),
          radius: '10', // 10km radius
          type: 'cats',
          ...(searchTerm && { q: searchTerm }),
          ...(catFilters.breed && { breed: catFilters.breed }),
          ...(catFilters.personality && { personality: catFilters.personality }),
          ...(catFilters.min_rating > 0 && { min_rating: catFilters.min_rating.toString() }),
          ...(catFilters.max_rating < 5 && { max_rating: catFilters.max_rating.toString() }),
          ...(catFilters.is_friendly !== null && { is_friendly: catFilters.is_friendly.toString() })
        });
        
        console.log('Searching cats with location:', `/api/search/nearby?${params}`);
        response = await axios.get(`/api/search/nearby?${params}`);
        console.log('Nearby cats response:', response.data.cats?.length || 0, 'cats found');
        setCats(response.data.cats);
      } else {
        // Use regular search
        const params = new URLSearchParams({
          q: searchTerm,
          ...(catFilters.breed && { breed: catFilters.breed }),
          ...(catFilters.personality && { personality: catFilters.personality }),
          ...(catFilters.min_rating > 0 && { min_rating: catFilters.min_rating.toString() }),
          ...(catFilters.max_rating < 5 && { max_rating: catFilters.max_rating.toString() }),
          ...(catFilters.is_friendly !== null && { is_friendly: catFilters.is_friendly.toString() })
        });
        
        const fullUrl = `${axios.defaults.baseURL}/api/search/cats?${params}`;
        console.log('Searching cats with full URL:', fullUrl);
        console.log('Axios base URL at time of request:', axios.defaults.baseURL);
        
        // Simple axios request
        response = await axios.get(`/api/search/cats?${params}`);
        console.log('Regular cats response:', response.data.cats?.length || 0, 'cats found');
        setCats(response.data.cats);
      }
    } catch (error: any) {
      console.error('Error searching cats:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        });
        toast.error(`Failed to search cats: ${error.response?.status || 'Network error'}`);
      } else {
        toast.error('Failed to search cats');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchBodegas = async () => {
    setLoading(true);
    try {
      let response;
      
      if (userLocation) {
        // Use nearby search with user location
        const params = new URLSearchParams({
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString(),
          radius: '10', // 10km radius
          type: 'bodegas',
          ...(searchTerm && { q: searchTerm }),
          ...(bodegaFilters.min_cats > 0 && { min_cats: bodegaFilters.min_cats.toString() }),
          ...(bodegaFilters.max_cats < 100 && { max_cats: bodegaFilters.max_cats.toString() }),
          ...(bodegaFilters.min_rating > 0 && { min_rating: bodegaFilters.min_rating.toString() }),
          ...(bodegaFilters.max_rating < 5 && { max_rating: bodegaFilters.max_rating.toString() }),
          ...(bodegaFilters.verified_only && { verified_only: 'true' })
        });
        
        console.log('Searching bodegas with location:', `/api/search/nearby?${params}`);
        response = await axios.get(`/api/search/nearby?${params}`);
        console.log('Nearby bodegas response:', response.data.bodegas?.length || 0, 'bodegas found');
        setBodegas(response.data.bodegas);
      } else {
        // Use regular search
        const params = new URLSearchParams({
          q: searchTerm,
          ...(bodegaFilters.min_cats > 0 && { min_cats: bodegaFilters.min_cats.toString() }),
          ...(bodegaFilters.max_cats < 100 && { max_cats: bodegaFilters.max_cats.toString() }),
          ...(bodegaFilters.min_rating > 0 && { min_rating: bodegaFilters.min_rating.toString() }),
          ...(bodegaFilters.max_rating < 5 && { max_rating: bodegaFilters.max_rating.toString() }),
          ...(bodegaFilters.verified_only && { verified_only: 'true' })
        });
        
        console.log('Searching bodegas:', `/api/search/bodegas?${params}`);
        response = await axios.get(`/api/search/bodegas?${params}`);
        console.log('Regular bodegas response:', response.data.bodegas?.length || 0, 'bodegas found');
        setBodegas(response.data.bodegas);
      }
    } catch (error: any) {
      console.error('Error searching bodegas:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to search bodegas: ${error.response?.status || 'Network error'}`);
      } else {
        toast.error('Failed to search bodegas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'cats') {
      searchCats();
    } else {
      searchBodegas();
    }
  };

  const clearFilters = () => {
    setCatFilters({
      breed: '',
      personality: '',
      min_rating: 0,
      max_rating: 5,
      is_friendly: null
    });
    setBodegaFilters({
      min_cats: 0,
      max_cats: 100,
      min_rating: 0,
      max_rating: 5,
      verified_only: false
    });
  };

  const applyFilters = () => {
    if (searchType === 'cats') {
      searchCats();
    } else {
      searchBodegas();
    }
  };

  useEffect(() => {
    // Wait for auth to be ready and axios base URL to be set
    if (authLoading || !axios.defaults.baseURL) return;
    
    // Add a delay to ensure backend is ready before making API calls
    const timer = setTimeout(() => {
      searchCats();
      loadFilterOptions();
    }, 2000); // Increased delay to 2 seconds
    
    // Don't automatically request location - let user choose
    
    return () => clearTimeout(timer);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Apply filters when search type changes
    if (searchType === 'cats') {
      searchCats();
    } else {
      searchBodegas();
    }
  }, [searchType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-apply filters when they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchType === 'cats') {
        searchCats();
      } else {
        searchBodegas();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [catFilters, bodegaFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const hasActiveFilters = () => {
    if (searchType === 'cats') {
      return catFilters.breed || catFilters.personality || catFilters.min_rating > 0 || 
             catFilters.max_rating < 5 || catFilters.is_friendly !== null;
    } else {
      return bodegaFilters.min_cats > 0 || bodegaFilters.max_cats < 100 || 
             bodegaFilters.min_rating > 0 || bodegaFilters.max_rating < 5 || 
             bodegaFilters.verified_only;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Bodega Cats</h1>
        <p className="text-gray-600">Find cats and bodegas in New York City</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search for cats, bodegas, or locations..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
              hasActiveFilters() ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          {!filterOptions && (
            <button
              type="button"
              onClick={loadFilterOptions}
              disabled={loadingFilters}
              className="px-4 py-3 border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 flex items-center gap-2"
              title="Retry loading filter options"
            >
              <span className="text-sm">🔄</span>
              {loadingFilters ? 'Loading...' : 'Retry Filters'}
            </button>
          )}
          <button
            type="button"
            onClick={getUserLocation}
            disabled={locationPermission === 'pending'}
            className={`px-4 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors ${
              userLocation 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : locationPermission === 'denied'
                ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
            }`}
            title={
              userLocation 
                ? 'Location detected - Results sorted by distance' 
                : locationPermission === 'denied'
                ? 'Location permission denied - Click to try again'
                : 'Enable location-based search'
            }
          >
            <Navigation className="w-5 h-5" />
            {locationPermission === 'pending' 
              ? 'Locating...' 
              : userLocation 
                ? '📍 Located' 
                : locationPermission === 'denied'
                ? '❌ Location'
                : '📍 Location'
            }
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Type Toggle */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setSearchType('cats')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'cats'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search Cats
          </button>
          <button
            onClick={() => setSearchType('bodegas')}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'bodegas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search Bodegas
          </button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <button
                onClick={clearFilters}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchType === 'cats' && (
                <>
                  {catFilters.breed && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Breed: {catFilters.breed}
                      <button
                        onClick={() => setCatFilters({ ...catFilters, breed: '' })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {catFilters.personality && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Personality: {catFilters.personality}
                      <button
                        onClick={() => setCatFilters({ ...catFilters, personality: '' })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {catFilters.is_friendly !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {catFilters.is_friendly ? 'Friendly Only' : 'Not Friendly'}
                      <button
                        onClick={() => setCatFilters({ ...catFilters, is_friendly: null })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(catFilters.min_rating > 0 || catFilters.max_rating < 5) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Rating: {catFilters.min_rating}-{catFilters.max_rating}
                      <button
                        onClick={() => setCatFilters({ ...catFilters, min_rating: 0, max_rating: 5 })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </>
              )}
              {searchType === 'bodegas' && (
                <>
                  {(bodegaFilters.min_cats > 0 || bodegaFilters.max_cats < 100) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Cats: {bodegaFilters.min_cats}-{bodegaFilters.max_cats}
                      <button
                        onClick={() => setBodegaFilters({ ...bodegaFilters, min_cats: 0, max_cats: 100 })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(bodegaFilters.min_rating > 0 || bodegaFilters.max_rating < 5) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Rating: {bodegaFilters.min_rating}-{bodegaFilters.max_rating}
                      <button
                        onClick={() => setBodegaFilters({ ...bodegaFilters, min_rating: 0, max_rating: 5 })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {bodegaFilters.verified_only && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Verified Only
                      <button
                        onClick={() => setBodegaFilters({ ...bodegaFilters, verified_only: false })}
                        className="hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {searchType === 'cats' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Breed Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                  <select
                    value={catFilters.breed}
                    onChange={(e) => setCatFilters({ ...catFilters, breed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Breeds</option>
                    {filterOptions?.breeds.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                {/* Personality Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
                  <select
                    value={catFilters.personality}
                    onChange={(e) => setCatFilters({ ...catFilters, personality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Personalities</option>
                    {filterOptions?.personalities.map((personality) => (
                      <option key={personality} value={personality}>{personality}</option>
                    ))}
                  </select>
                </div>

                {/* Friendliness Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Friendliness</label>
                  <select
                    value={catFilters.is_friendly === null ? '' : catFilters.is_friendly.toString()}
                    onChange={(e) => setCatFilters({ 
                      ...catFilters, 
                      is_friendly: e.target.value === '' ? null : e.target.value === 'true' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Cats</option>
                    <option value="true">Friendly Only</option>
                    <option value="false">Not Friendly</option>
                  </select>
                </div>

                {/* Rating Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Range: {catFilters.min_rating} - {catFilters.max_rating}
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={catFilters.min_rating}
                        onChange={(e) => setCatFilters({ 
                          ...catFilters, 
                          min_rating: parseFloat(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={catFilters.max_rating}
                        onChange={(e) => setCatFilters({ 
                          ...catFilters, 
                          max_rating: parseFloat(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Cat Count Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cat Count: {bodegaFilters.min_cats} - {bodegaFilters.max_cats}
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min Cats</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={bodegaFilters.min_cats}
                        onChange={(e) => setBodegaFilters({ 
                          ...bodegaFilters, 
                          min_cats: parseInt(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max Cats</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={bodegaFilters.max_cats}
                        onChange={(e) => setBodegaFilters({ 
                          ...bodegaFilters, 
                          max_cats: parseInt(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Range: {bodegaFilters.min_rating} - {bodegaFilters.max_rating}
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Min Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={bodegaFilters.min_rating}
                        onChange={(e) => setBodegaFilters({ 
                          ...bodegaFilters, 
                          min_rating: parseFloat(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Max Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={bodegaFilters.max_rating}
                        onChange={(e) => setBodegaFilters({ 
                          ...bodegaFilters, 
                          max_rating: parseFloat(e.target.value) 
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Verified Only */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bodegaFilters.verified_only}
                      onChange={(e) => setBodegaFilters({ 
                        ...bodegaFilters, 
                        verified_only: e.target.checked 
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified Bodegas Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
                {/* Interactive Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              Interactive Map
            </h3>
            {isGoogleMapsConfigured() ? (
              (() => {
                const mapLocations = [
                  ...cats.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    latitude: cat.latitude,
                    longitude: cat.longitude,
                    type: 'cat' as const,
                    address: cat.address,
                    rating: cat.rating,
                    distance: cat.distance
                  })),
                  ...bodegas.map(bodega => ({
                    id: bodega.id,
                    name: bodega.name,
                    latitude: bodega.latitude,
                    longitude: bodega.longitude,
                    type: 'bodega' as const,
                    address: bodega.address,
                    rating: bodega.rating,
                    distance: bodega.distance
                  }))
                ];
                console.log('GoogleMaps configured, rendering map with locations:', mapLocations);
                console.log('Cats count:', cats.length);
                console.log('Bodegas count:', bodegas.length);
                return (
                  <GoogleMap
                    locations={mapLocations}
                userLocation={userLocation}
                showSearchBox={true}
                height="500px"
                className="rounded-lg"
                onLocationClick={(location) => {
                  if (location.type === 'cat') {
                    window.location.href = `/cat/${location.id}`;
                  } else {
                    window.location.href = `/bodega/${location.id}`;
                  }
                }}
                onSearchResult={(place) => {
                  if (place.formatted_address) {
                    setSearchTerm(place.formatted_address);
                    toast.success(`Searching near ${place.formatted_address}`);
                  }
                }}
              />
                );
              })()
            ) : (
              <MapFallback 
                height="500px"
                className="rounded-lg"
                locations={[
                  ...cats.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    latitude: cat.latitude,
                    longitude: cat.longitude,
                    type: 'cat' as const,
                    address: cat.address,
                    rating: cat.rating,
                    distance: cat.distance
                  })),
                  ...bodegas.map(bodega => ({
                    id: bodega.id,
                    name: bodega.name,
                    latitude: bodega.latitude,
                    longitude: bodega.longitude,
                    type: 'bodega' as const,
                    address: bodega.address,
                    rating: bodega.rating,
                    distance: bodega.distance
                  }))
                ]}
                onSearchClick={() => {
                  // Focus on the search input
                  const searchInput = document.getElementById('search-input') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {searchType === 'cats' ? `Cats Found (${cats.length})` : `Bodegas Found (${bodegas.length})`}
          </h2>
          
          {searchType === 'cats' ? (
            <div className="space-y-4">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/cat/${cat.id}`}
                  className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{cat.name}</h3>
                      <p className="text-gray-600 text-sm">{cat.bodega_name}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {cat.address}
                        {cat.distance && (
                          <span className="text-green-600 font-medium">
                            • {cat.distance}km away
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">{cat.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{cat.breed}</span>
                        <span>{cat.age}</span>
                        <span>{cat.sex}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {renderStars(cat.rating)}
                        <span className="text-sm text-gray-600">({cat.review_count} reviews)</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <Heart className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bodegas.map((bodega) => (
                <Link
                  key={bodega.id}
                  to={`/bodega/${bodega.id}`}
                  className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{bodega.name}</h3>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {bodega.address}
                        {bodega.distance && (
                          <span className="text-green-600 font-medium">
                            • {bodega.distance}km away
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">{bodega.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{bodega.cat_count} cats</span>
                        {bodega.is_verified && (
                          <span className="text-green-600 font-medium">✓ Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {renderStars(bodega.rating)}
                        <span className="text-sm text-gray-600">({bodega.review_count} reviews)</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <Heart className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 