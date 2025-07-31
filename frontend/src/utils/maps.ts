/**
 * Utility functions for Google Maps integration
 */

/**
 * Check if Google Maps API key is configured and valid
 */
export const isGoogleMapsConfigured = (): boolean => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return false;
  }
  
  // Check for placeholder values
  const placeholderValues = [
    'your_actual_google_maps_api_key_here',
    'your_google_maps_api_key_here',
    'temp_placeholder_key_for_development',
    'YOUR_API_KEY_HERE',
    'REPLACE_WITH_YOUR_API_KEY'
  ];
  
  return !placeholderValues.includes(apiKey);
};

/**
 * Get Google Maps API key if configured
 */
export const getGoogleMapsApiKey = (): string | null => {
  return isGoogleMapsConfigured() ? process.env.REACT_APP_GOOGLE_MAPS_API_KEY || null : null;
}; 