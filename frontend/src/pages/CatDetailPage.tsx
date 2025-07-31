import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart, User, Camera, Edit } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { PhotoUpload } from '../components/PhotoUpload';
import { PhotoGallery } from '../components/PhotoGallery';

interface Photo {
  id: number;
  filename: string;
  caption: string;
  is_primary: boolean;
  created_at: string;
}

interface Cat {
  id: number;
  name: string;
  bodega_id: number;
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
  created_by: number;
  creator_username: string;
  photos: Photo[];
  created_at: string;
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

interface Bodega {
  id: number;
  name: string;
  address: string;
  description: string;
  phone: string;
  hours: string;
  rating: number;
  review_count: number;
  cat_count: number;
  is_verified: boolean;
}

export const CatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);
  const [bodega, setBodega] = useState<Bodega | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadCatDetails();
      loadReviews();
      if (user) {
        checkIfSaved();
      }
    }
  }, [id, user]);

  const loadCatDetails = async () => {
    try {
      const response = await axios.get(`/api/cats/${id}`);
      setCat(response.data.cat);
      setBodega(response.data.bodega);
    } catch (error) {
      toast.error('Failed to load cat details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/cat/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews');
      setReviews([]);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(`/api/users/savedcats`);
      const savedCats = response.data.saved_cats;
      setIsSaved(savedCats.some((savedCat: any) => savedCat.id === parseInt(id!)));
    } catch (error) {
      console.error('Failed to check saved status');
    }
  };

  const toggleSave = async () => {
    if (!user) {
      toast.error('Please log in to save cats');
      return;
    }

    try {
      if (isSaved) {
        await axios.delete(`/api/cats/${id}/save`);
        setIsSaved(false);
        toast.success('Removed from saved cats');
      } else {
        await axios.post(`/api/cats/${id}/save`);
        setIsSaved(true);
        toast.success('Added to saved cats');
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
        cat_id: parseInt(id!),
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
      loadCatDetails(); // Refresh cat rating
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
          <p className="mt-4 text-gray-600">Loading cat details...</p>
        </div>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cat Not Found</h1>
          <p className="text-gray-600">The cat you're looking for doesn't exist.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>
            <p className="text-gray-600">{cat.bodega_name}</p>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {cat.address}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user && cat.created_by === user.id && (
              <button
                onClick={() => navigate(`/cat/${id}/edit`)}
                className="p-3 rounded-lg border-2 border-gray-300 text-gray-400 hover:border-primary-500 hover:text-primary-500"
                title="Edit cat"
              >
                <Edit className="w-6 h-6" />
              </button>
            )}
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
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cat Photo */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            {cat.primary_photo ? (
              <img
                src={cat.primary_photo}
                alt={cat.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Cat Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">About {cat.name}</h2>
            <p className="text-gray-700 mb-6">{cat.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span>{cat.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Breed:</span>
                    <span>{cat.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sex:</span>
                    <span>{cat.sex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span>{cat.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span>{cat.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personality:</span>
                    <span>{cat.personality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Friendly:</span>
                    <span className={cat.is_friendly ? 'text-green-600' : 'text-red-600'}>
                      {cat.is_friendly ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(cat.rating)}
                  <span className="text-lg font-semibold">{cat.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">{cat.review_count} reviews</p>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <PhotoGallery
              type="cat"
              id={cat.id}
              photos={cat.photos || []}
              onPhotoDeleted={loadCatDetails}
              onPrimaryChanged={loadCatDetails}
            />
          </div>

          {/* Photo Upload */}
          {user && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <PhotoUpload
                type="cat"
                id={cat.id}
                onPhotoUploaded={loadCatDetails}
              />
            </div>
          )}

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
                    placeholder="Share your experience with this cat..."
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
          {/* Bodega Info */}
          {bodega && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Bodega Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{bodega.name}</h4>
                  <p className="text-sm text-gray-600">{bodega.address}</p>
                </div>
                {bodega.description && (
                  <p className="text-sm text-gray-700">{bodega.description}</p>
                )}
                <div className="flex items-center gap-2">
                  {renderStars(bodega.rating)}
                  <span className="text-sm text-gray-600">({bodega.review_count} reviews)</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{bodega.cat_count} cats</p>
                  {bodega.phone && <p>Phone: {bodega.phone}</p>}
                  {bodega.hours && <p>Hours: {bodega.hours}</p>}
                  {bodega.is_verified && (
                    <p className="text-green-600 font-medium">✓ Verified</p>
                  )}
                </div>
                <Link
                  to={`/bodega/${bodega.id}`}
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  View Bodega
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/search"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Search More Cats
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
                  {isSaved ? 'Remove from Saved' : 'Save Cat'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 