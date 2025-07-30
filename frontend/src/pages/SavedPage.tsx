import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface SavedCat {
  id: number;
  name: string;
  bodega_name: string;
  address: string;
  description: string;
  rating: number;
  review_count: number;
  primary_photo: string | null;
}

interface SavedBodega {
  id: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  review_count: number;
  cat_count: number;
  primary_photo: string | null;
}

export const SavedPage: React.FC = () => {
  const [savedCats, setSavedCats] = useState<SavedCat[]>([]);
  const [savedBodegas, setSavedBodegas] = useState<SavedBodega[]>([]);
  const [activeTab, setActiveTab] = useState<'cats' | 'bodegas'>('cats');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedItems();
    }
  }, [user]);

  const loadSavedItems = async () => {
    setLoading(true);
    try {
      const [catsResponse, bodegasResponse] = await Promise.all([
        axios.get('/api/users/saved-cats'),
        axios.get('/api/users/saved-bodegas')
      ]);
      setSavedCats(catsResponse.data.saved_cats);
      setSavedBodegas(bodegasResponse.data.saved_bodegas);
    } catch (error) {
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedCat = async (catId: number) => {
    try {
      await axios.delete(`/api/cats/${catId}/save`);
      setSavedCats(savedCats.filter(cat => cat.id !== catId));
      toast.success('Removed from saved cats');
    } catch (error) {
      toast.error('Failed to remove from saved cats');
    }
  };

  const removeSavedBodega = async (bodegaId: number) => {
    try {
      await axios.delete(`/api/bodegas/${bodegaId}/save`);
      setSavedBodegas(savedBodegas.filter(bodega => bodega.id !== bodegaId));
      toast.success('Removed from saved bodegas');
    } catch (error) {
      toast.error('Failed to remove from saved bodegas');
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Items</h1>
          <p className="text-gray-600">Please log in to view your saved cats and bodegas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your saved items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Saved Items</h1>
        <p className="text-gray-600">Keep track of your favorite cats and bodegas</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('cats')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'cats'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved Cats ({savedCats.length})
        </button>
        <button
          onClick={() => setActiveTab('bodegas')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'bodegas'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved Bodegas ({savedBodegas.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cats' ? (
        <div>
          {savedCats.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved cats yet</h3>
              <p className="text-gray-600">Start exploring and save your favorite bodega cats!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {savedCats.map((cat) => (
                <div key={cat.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{cat.name}</h3>
                      <p className="text-gray-600 text-sm">{cat.bodega_name}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {cat.address}
                      </p>
                      <p className="text-sm text-gray-700 mt-3">{cat.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {renderStars(cat.rating)}
                        <span className="text-sm text-gray-600">({cat.review_count} reviews)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSavedCat(cat.id)}
                      className="text-gray-400 hover:text-red-500 ml-4"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {savedBodegas.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved bodegas yet</h3>
              <p className="text-gray-600">Start exploring and save your favorite bodegas!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {savedBodegas.map((bodega) => (
                <div key={bodega.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{bodega.name}</h3>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {bodega.address}
                      </p>
                      <p className="text-sm text-gray-700 mt-3">{bodega.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span>{bodega.cat_count} cats</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {renderStars(bodega.rating)}
                        <span className="text-sm text-gray-600">({bodega.review_count} reviews)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSavedBodega(bodega.id)}
                      className="text-gray-400 hover:text-red-500 ml-4"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 