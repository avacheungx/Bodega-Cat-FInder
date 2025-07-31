import React, { useState, useRef } from 'react';
import { Upload, Camera, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PhotoUploadProps {
  type: 'cat' | 'bodega';
  id: number;
  onPhotoUploaded?: () => void;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  type, 
  id, 
  onPhotoUploaded,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Please upload an image smaller than 5MB.');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('caption', caption);
      formData.append('is_primary', isPrimary.toString());

      await axios.post(`/api/photos/${type}s/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Photo uploaded successfully!');
      setCaption('');
      setIsPrimary(false);
      
      if (onPhotoUploaded) {
        onPhotoUploaded();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 ${className}`}>
      <div
        className={`relative text-center ${
          dragActive ? 'border-blue-400 bg-blue-50' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Camera className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload {type === 'cat' ? 'Cat' : 'Bodega'} Photo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop an image here, or click to select a file
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Photo caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-700">Set as primary photo</span>
            </label>
          </div>

          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 