import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface RecentlyViewedItem {
  id: number;
  name: string;
  type: 'cat' | 'bodega';
  bodega_name?: string;
  address: string;
  description: string;
  rating: number;
  review_count: number;
  viewed_at: string;
  primary_photo: string | null;
}

export const RecentlyViewedPage: React.FC = () => {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecentlyViewed();
    }
  }, [user]);

  const loadRecentlyViewed = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users/recently-viewed');
      setRecentItems(response.data.recently_viewed);
    } catch (error) {
      toast.error('Failed to load recently viewed items');
    } finally {
      setLoading(false);
    }
  };

  const clearRecentlyViewed = async () => {
    try {
      await axios.delete('/api/users/recently-viewed');
      setRecentItems([]);
      toast.success('Recently viewed items cleared');
    } catch (error) {
      toast.error('Failed to clear recently viewed items');
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recently Viewed</h1>
          <p className="text-gray-600">Please log in to view your recently visited cats and bodegas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your recently viewed items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recently Viewed</h1>
          <p className="text-gray-600">Your browsing history of cats and bodegas</p>
        </div>
        {recentItems.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg"
          >
            Clear History
          </button>
        )}
      </div>

      {recentItems.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recently viewed items</h3>
          <p className="text-gray-600">Start exploring cats and bodegas to see them here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'cat' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type === 'cat' ? '🐱 Cat' : '🏪 Bodega'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.viewed_at)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                  {item.type === 'cat' && item.bodega_name && (
                    <p className="text-gray-600 text-sm">{item.bodega_name}</p>
                  )}
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {item.address}
                  </p>
                  <p className="text-sm text-gray-700 mt-3">{item.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-600">({item.review_count} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 