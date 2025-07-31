import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { getGoogleMapsApiKey } from '../utils/maps';

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: 'cat' | 'bodega';
  address: string;
  rating?: number;
  photo?: string;
}

interface GoogleMapProps {
  locations?: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationClick?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
  showSearchBox?: boolean;
  onSearchResult?: (result: google.maps.places.PlaceResult) => void;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  locations = [],
  center = { lat: 40.7589, lng: -73.9851 }, // Default to NYC
  zoom = 12,
  onLocationClick,
  onMapClick,
  className = '',
  height = '400px',
  showSearchBox = false,
  onSearchResult
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      console.warn('Map container ref is not available');
      return;
    }

    try {
      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) {
        setError('Google Maps API key not configured. Please add your API key to the .env file.');
        setIsLoading(false);
        return;
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();

      // Ensure the map container still exists
      if (!mapRef.current) {
        console.warn('Map container was removed before initialization');
        return;
      }

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add search box if requested
      if (showSearchBox) {
        try {
          const input = document.createElement('input');
          input.className = 'controls';
          input.placeholder = 'Search for bodegas, cats, or locations...';
          input.style.cssText = `
            box-sizing: border-box;
            border: 1px solid transparent;
            width: 240px;
            height: 32px;
            padding: 0 12px;
            border-radius: 3px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            outline: none;
            text-overflow: ellipses;
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1;
          `;

          // Ensure the map controls exist
          if (map.controls && map.controls[google.maps.ControlPosition.TOP_LEFT]) {
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          } else {
            console.warn('Map controls not available for search box');
            return;
          }

          const searchBox = new google.maps.places.SearchBox(input);
          searchBoxRef.current = searchBox;

          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
              const place = places[0];
              if (onSearchResult) {
                onSearchResult(place);
              }
              
              if (place.geometry && place.geometry.location) {
                map.setCenter(place.geometry.location);
                map.setZoom(15);
              }
            }
          });
        } catch (searchError) {
          console.error('Error creating search box:', searchError);
        }
      }

      // Add legend
      const legend = document.createElement('div');
      legend.className = 'legend';
      legend.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        font-size: 12px;
        z-index: 1;
        min-width: 120px;
      `;
      legend.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">Legend</div>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="width: 16px; height: 16px; background: #FF3737; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
          <span>🐱 Cat</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 16px; height: 16px; background: #FF3737; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
          <span>🏪 Bodega</span>
        </div>
      `;

      // Add legend to map
      if (map.controls && map.controls[google.maps.ControlPosition.BOTTOM_RIGHT]) {
        map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(legend);
      }

      // Add map click listener
      if (onMapClick) {
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick(event.latLng.lat(), event.latLng.lng());
          }
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      let errorMessage = 'Failed to load Google Maps. ';
      
      if (err instanceof Error) {
        if (err.message.includes('REQUEST_DENIED')) {
          errorMessage += 'The API key is invalid or does not have the necessary permissions. Please check your Google Maps API key and ensure the following services are enabled: Maps JavaScript API, Places API, and Geocoding API.';
        } else if (err.message.includes('OVER_QUERY_LIMIT')) {
          errorMessage += 'The API key has exceeded its quota. Please check your Google Cloud Console billing and quotas.';
        } else if (err.message.includes('INVALID_KEY')) {
          errorMessage += 'The API key is invalid. Please check your Google Maps API key configuration.';
        } else {
          errorMessage += err.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [center, zoom, showSearchBox, onMapClick, onSearchResult]);

  // Update markers when locations change
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    console.log('Updating markers with locations:', locations);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    locations.forEach(location => {
      console.log('Adding marker for:', location.name, 'at:', location.latitude, location.longitude);
      // Create custom marker with red dot and icon
      const markerIcon = {
        url: location.type === 'cat' 
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNGRjM3MzciLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjYiIGZpbGw9IiNGRjM3MzciLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWiIgZmlsbD0iIzM0MzQzNCIvPgo8cGF0aCBkPSJNMTAgMTZMMTIgMTRMMTQgMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMiAxNFYxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==' // Cat icon with red dot
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNGRjM3MzciLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTAiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjYiIGZpbGw9IiNGRjM3MzciLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWiIgZmlsbD0iIzM0MzQzNCIvPgo8cGF0aCBkPSJNMTAgMTZMMTIgMTRMMTQgMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMiAxNFYxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==', // Bodega icon with red dot
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      };

      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        title: location.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">
                ${location.type === 'cat' ? '🐱' : '🏪'}
              </span>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                ${location.name}
              </h3>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
              ${location.address}
            </p>
            ${location.rating ? `
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="display: flex; margin-right: 6px;">
                  ${Array.from({ length: 5 }, (_, i) => 
                    `<span style="color: ${i < Math.floor(location.rating) ? '#fbbf24' : '#d1d5db'}; font-size: 14px;">★</span>`
                  ).join('')}
                </div>
                <span style="font-size: 13px; color: #6b7280; font-weight: 500;">
                  ${location.rating.toFixed(1)}
                </span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
                ${location.type === 'cat' ? 'Cat' : 'Bodega'}
              </span>
              <button 
                onclick="window.open('/${location.type}/${location.id}', '_blank')"
                style="
                  background: #ef4444; 
                  color: white; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  font-size: 12px; 
                  cursor: pointer;
                  font-weight: 500;
                "
                onmouseover="this.style.background='#dc2626'"
                onmouseout="this.style.background='#ef4444'"
              >
                View Details
              </button>
            </div>
          </div>
        `
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      markersRef.current.push(marker);
    });
  }, [locations, onLocationClick]);

  // Initialize map on mount and cleanup on unmount
  useEffect(() => {
    initializeMap();
    
    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Clear search box
      if (searchBoxRef.current) {
        searchBoxRef.current = null;
      }
      
      // Clear map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

  // Update markers when locations change
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}; 