import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Heart, Phone, Clock, User, Camera, Cat } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Bodega {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  phone: string;
  hours: string;
  rating: number;
  review_count: number;
  cat_count: number;
  is_verified: boolean;
  created_at: string;
}

interface Cat {
  id: number;
  name: string;
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

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: {
    id: number;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

export const BodegaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bodega, setBodega] = useState<Bodega | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadBodegaDetails();
      loadReviews();
      if (user) {
        checkIfSaved();
      }
    }
  }, [id, user]);

  const loadBodegaDetails = async () => {
    try {
      const response = await axios.get(`/api/bodegas/${id}`);
      setBodega(response.data.bodega);
      setCats(response.data.cats || []);
    } catch (error) {
      toast.error('Failed to load bodega details');
      setCats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/bodega/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
      setReviews([]);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(`/api/users/savedbodegas`);
      const savedBodegas = response.data.saved_bodegas;
      setIsSaved(savedBodegas.some((savedBodega: any) => savedBodega.id === parseInt(id!)));
    } catch (error) {
      console.error('Failed to check saved status');
    }
  };

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please log in to save bodegas');
      return;
    }

    try {
      if (isSaved) {
        await axios.delete(`/api/bodegas/${id}/save`);
        setIsSaved(false);
        toast.success('Removed from saved bodegas');
      } else {
        await axios.post(`/api/bodegas/${id}/save`);
        setIsSaved(true);
        toast.success('Added to saved bodegas');
      }
    } catch (error) {
      toast.error('Failed to update saved status');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }

    try {
      await axios.post(`/api/reviews/`, {
        bodega_id: parseInt(id!),
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
      loadBodegaDetails(); // Refresh bodega rating
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bodega details...</p>
        </div>
      </div>
    );
  }

  if (!bodega) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bodega Not Found</h1>
          <p className="text-gray-600">The bodega you're looking for doesn't exist.</p>
          <Link to="/search" className="text-primary-600 hover:text-primary-500 mt-4 inline-block">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{bodega.name}</h1>
              {bodega.is_verified && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {bodega.address}
            </p>
          </div>
          <button
            onClick={toggleSave}
            className={`p-3 rounded-lg border-2 ${
              isSaved
                ? 'border-red-500 text-red-500 hover:bg-red-50'
                : 'border-gray-300 text-gray-400 hover:border-primary-500 hover:text-primary-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bodega Photo */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          </div>

          {/* Bodega Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">About {bodega.name}</h2>
            <p className="text-gray-700 mb-6">{bodega.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Contact & Hours</h3>
                <div className="space-y-2 text-sm">
                  {bodega.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{bodega.phone}</span>
                    </div>
                  )}
                  {bodega.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{bodega.hours}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Cat className="w-4 h-4 text-gray-400" />
                    <span>{bodega.cat_count} cats</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(bodega.rating)}
                  <span className="text-lg font-semibold">{bodega.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">{bodega.review_count} reviews</p>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Added</h3>
                  <p className="text-sm text-gray-600">{formatDate(bodega.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-xl font-semibold mb-6">Cats ({cats?.length || 0})</h2>
                        
                        {!cats || cats.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No cats listed yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {cats.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/cat/${cat.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {cat.primary_photo ? (
                          <img
                            src={cat.primary_photo}
                            alt={cat.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Cat className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{cat.breed} • {cat.age}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{cat.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {renderStars(cat.rating)}
                          <span className="text-sm text-gray-600">({cat.review_count})</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                                      <h2 className="text-xl font-semibold">Reviews ({reviews?.length || 0})</h2>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Write Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-2xl"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Share your experience with this bodega..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
                                      {!reviews || reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{review.user.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Map will be displayed here</p>
              <p className="text-xs text-gray-500 mt-1">Coordinates: {bodega.latitude}, {bodega.longitude}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/search"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Search More Bodegas
              </Link>
              {user && (
                <button
                  onClick={toggleSave}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isSaved
                      ? 'border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-500'
                  }`}
                >
                  {isSaved ? 'Remove from Saved' : 'Save Bodega'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 