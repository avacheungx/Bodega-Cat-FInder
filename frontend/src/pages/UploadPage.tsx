import React, { useState } from 'react';
import { Upload, Cat, Store } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const UploadPage: React.FC = () => {
  const [uploadType, setUploadType] = useState<'cat' | 'bodega'>('cat');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [catForm, setCatForm] = useState({
    name: '',
    bodega_name: '',
    address: '',
    description: '',
    age: '',
    breed: '',
    sex: '',
    personality: '',
    color: '',
    weight: '',
    is_friendly: true
  });

  const [bodegaForm, setBodegaForm] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    hours: '',
    cat_count: 1
  });

  const handleCatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCatForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleBodegaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBodegaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/cats/', {
        name: catForm.name,
        bodega_name: catForm.bodega_name,
        address: catForm.address,
        description: catForm.description,
        age: catForm.age,
        breed: catForm.breed,
        sex: catForm.sex,
        personality: catForm.personality,
        color: catForm.color,
        weight: catForm.weight,
        is_friendly: catForm.is_friendly
      });
      
      toast.success('Cat uploaded successfully!');
      setCatForm({
        name: '',
        bodega_name: '',
        address: '',
        description: '',
        age: '',
        breed: '',
        sex: '',
        personality: '',
        color: '',
        weight: '',
        is_friendly: true
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload cat');
    } finally {
      setLoading(false);
    }
  };

  const handleBodegaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/bodegas/', {
        name: bodegaForm.name,
        address: bodegaForm.address,
        description: bodegaForm.description,
        phone: bodegaForm.phone,
        hours: bodegaForm.hours,
        latitude: 40.7589, // Default NYC coordinates - in real app, would use geocoding
        longitude: -73.9851
      });
      
      toast.success('Bodega uploaded successfully!');
      setBodegaForm({
        name: '',
        address: '',
        description: '',
        phone: '',
        hours: '',
        cat_count: 1
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload bodega');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Content</h1>
          <p className="text-gray-600">Please log in to upload cats and bodegas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
        <p className="text-gray-600">Help the community by adding new cats and bodegas</p>
      </div>

      {/* Upload Type Toggle */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setUploadType('cat')}
          className={`px-6 py-3 font-medium flex items-center gap-2 ${
            uploadType === 'cat'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Cat className="w-5 h-5" />
          Upload Cat
        </button>
        <button
          onClick={() => setUploadType('bodega')}
          className={`px-6 py-3 font-medium flex items-center gap-2 ${
            uploadType === 'bodega'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Store className="w-5 h-5" />
          Upload Bodega
        </button>
      </div>

      {/* Upload Forms */}
      {uploadType === 'cat' ? (
        <form onSubmit={handleCatSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Cat className="w-6 h-6" />
              Add a New Cat
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cat Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.name}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bodega Name *</label>
                <input
                  type="text"
                  name="bodega_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.bodega_name}
                  onChange={handleCatChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.address}
                  onChange={handleCatChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.description}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="text"
                  name="age"
                  placeholder="e.g., 3 years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.age}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <input
                  type="text"
                  name="breed"
                  placeholder="e.g., Domestic Shorthair"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.breed}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                <select
                  name="sex"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.sex}
                  onChange={handleCatChange}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  placeholder="e.g., Orange tabby"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.color}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="text"
                  name="weight"
                  placeholder="e.g., 12 lbs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.weight}
                  onChange={handleCatChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
                <input
                  type="text"
                  name="personality"
                  placeholder="e.g., Friendly, shy, playful"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={catForm.personality}
                  onChange={handleCatChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_friendly"
                    checked={catForm.is_friendly}
                    onChange={handleCatChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Friendly with customers</span>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Cat'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBodegaSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Store className="w-6 h-6" />
              Add a New Bodega
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bodega Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.name}
                  onChange={handleBodegaChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.phone}
                  onChange={handleBodegaChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.address}
                  onChange={handleBodegaChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.description}
                  onChange={handleBodegaChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                <input
                  type="text"
                  name="hours"
                  placeholder="e.g., 24/7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.hours}
                  onChange={handleBodegaChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cats</label>
                <input
                  type="number"
                  name="cat_count"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={bodegaForm.cat_count}
                  onChange={handleBodegaChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Bodega'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}; 