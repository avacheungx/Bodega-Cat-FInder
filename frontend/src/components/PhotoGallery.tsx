import React, { useState } from 'react';
import { Star, Trash2, Camera } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Photo {
  id: number;
  filename: string;
  caption: string;
  is_primary: boolean;
  created_at: string;
}

interface PhotoGalleryProps {
  type: 'cat' | 'bodega';
  id: number;
  photos: Photo[];
  onPhotoDeleted?: () => void;
  onPrimaryChanged?: () => void;
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  type,
  id,
  photos,
  onPhotoDeleted,
  onPrimaryChanged,
  className = ''
}) => {
  const [deletingPhoto, setDeletingPhoto] = useState<number | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<number | null>(null);

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingPhoto(photoId);
    try {
      await axios.delete(`/api/photos/${type}s/${id}/photos/${photoId}`);
      toast.success('Photo deleted successfully');
      if (onPhotoDeleted) {
        onPhotoDeleted();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete photo');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    setSettingPrimary(photoId);
    try {
      await axios.put(`/api/photos/${type}s/${id}/photos/${photoId}/primary`);
      toast.success('Primary photo updated');
      if (onPrimaryChanged) {
        onPrimaryChanged();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update primary photo');
    } finally {
      setSettingPrimary(null);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">
        Photos ({photos.length})
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group bg-white rounded-lg shadow-sm border overflow-hidden">
            <img
              src={`http://localhost:5001/uploads/${type}s/${photo.filename}`}
              alt={photo.caption || `${type} photo`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODguOTU0MyA2OC45NTQzIDgwIDgwIDgwSDExMEMxMjEuMDQ2IDgwIDEzMCA4OC45NTQzIDEzMCAxMDBDMTMwIDExMS4wNDYgMTIxLjA0NiAxMjAgMTEwIDEyMEg4MEM2OC45NTQzIDEyMCA2MCAxMTEuMDQ2IDYwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTEwMCAxMzBDMTEwLjQ1NyAxMzAgMTE5IDEyMS40NTcgMTE5IDExMUMxMTkgMTAwLjU0MyAxMTAuNDU3IDkyIDEwMCA5MkM4OS41NDMgOTIgODEgMTAwLjU0MyA4MSAxMTFDODEgMTIxLjQ1NyA4OS41NDMgMTMwIDEwMCAxMzBaIiBmaWxsPSIjRDFENURCIi8+Cjwvc3ZnPgo=';
              }}
            />
            
            {photo.is_primary && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Primary
              </div>
            )}
            
            <div className="p-3">
              {photo.caption && (
                <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {!photo.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={settingPrimary === photo.id}
                      className="p-1 text-gray-600 hover:text-yellow-600 disabled:opacity-50"
                      title="Set as primary photo"
                    >
                      {settingPrimary === photo.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingPhoto === photo.id}
                  className="p-1 text-gray-600 hover:text-red-600 disabled:opacity-50"
                  title="Delete photo"
                >
                  {deletingPhoto === photo.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 