import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Cat {
  id: number;
  name: string;
  bodega_name: string;
  address: string;
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
}

interface Bodega {
  id: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  review_count: number;
  cat_count: number;
  is_verified: boolean;
  primary_photo: string | null;
}

export const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'cats' | 'bodegas'>('cats');
  const [cats, setCats] = useState<Cat[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchCats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/search/cats?q=${searchTerm}`);
      setCats(response.data.cats);
    } catch (error) {
      toast.error('Failed to search cats');
    } finally {
      setLoading(false);
    }
  };

  const searchBodegas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/search/bodegas?q=${searchTerm}`);
      setBodegas(response.data.bodegas);
    } catch (error) {
      toast.error('Failed to search bodegas');
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

  useEffect(() => {
    // Load initial data
    searchCats();
  }, []);

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
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
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
            onClick={() => {
              setSearchType('cats');
              searchCats();
            }}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'cats'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search Cats
          </button>
          <button
            onClick={() => {
              setSearchType('bodegas');
              searchBodegas();
            }}
            className={`px-4 py-2 rounded-lg ${
              searchType === 'bodegas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Search Bodegas
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">
              Google Maps integration will be displayed here when you add your API key.
            </p>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500">
                Map will show cat and bodega locations with markers and directions.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {searchType === 'cats' ? 'Cats Found' : 'Bodegas Found'}
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