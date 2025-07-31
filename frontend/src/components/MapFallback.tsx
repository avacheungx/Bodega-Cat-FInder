import React from 'react';
import { MapPin, Search, Map } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: 'cat' | 'bodega';
  address: string;
  rating?: number;
}

interface MapFallbackProps {
  className?: string;
  height?: string;
  onSearchClick?: () => void;
  locations?: Location[];
}

export const MapFallback: React.FC<MapFallbackProps> = ({
  className = '',
  height = '400px',
  onSearchClick,
  locations = []
}) => {
  return (
    <div 
      className={`bg-gray-100 rounded-lg ${className}`}
      style={{ height }}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Google Maps integration will be displayed here when you add your API key.
          </p>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 mb-4">
            <p className="text-sm text-gray-500 mb-3">
              Map will show cat and bodega locations with red dot markers and directions.
            </p>
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Locations
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500">
            <p>To enable the map, add a valid Google Maps API key to your <code>.env</code> file</p>
            <p className="mt-1">Required services: Maps JavaScript API, Places API, Geocoding API</p>
          </div>
        </div>

        {/* Show locations list as fallback */}
        {locations.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Locations Found ({locations.length})
            </h4>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {locations.map((location) => (
                <div 
                  key={`${location.type}-${location.id}`}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {location.type === 'cat' ? '🐱' : '🏪'}
                        </span>
                        <h5 className="font-medium text-gray-900">{location.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                      <p className="text-xs text-gray-500">
                        📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                      {location.rating && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⭐ {location.rating.toFixed(1)} rating
                        </p>
                      )}
                    </div>
                    <a
                      href={`/${location.type}/${location.id}`}
                      className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 