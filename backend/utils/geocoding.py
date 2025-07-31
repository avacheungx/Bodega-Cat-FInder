import requests
import os
from typing import Optional, Tuple

def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Convert an address to latitude and longitude using Google Maps Geocoding API
    
    Args:
        address (str): The address to geocode
        
    Returns:
        Optional[Tuple[float, float]]: (latitude, longitude) or None if geocoding fails
    """
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    if not api_key:
        print("Warning: GOOGLE_MAPS_API_KEY not found in environment variables")
        return None
    
    # Add "New York City" to the address if it's not already there
    if "new york" not in address.lower() and "nyc" not in address.lower():
        address = f"{address}, New York City, NY"
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] == 'OK' and data['results']:
            location = data['results'][0]['geometry']['location']
            return (location['lat'], location['lng'])
        else:
            print(f"Geocoding failed for address '{address}': {data.get('status', 'Unknown error')}")
            return None
            
    except requests.RequestException as e:
        print(f"Error geocoding address '{address}': {e}")
        return None
    except Exception as e:
        print(f"Unexpected error geocoding address '{address}': {e}")
        return None

def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    """
    Convert latitude and longitude to an address using Google Maps Geocoding API
    
    Args:
        lat (float): Latitude
        lng (float): Longitude
        
    Returns:
        Optional[str]: Formatted address or None if reverse geocoding fails
    """
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    if not api_key:
        print("Warning: GOOGLE_MAPS_API_KEY not found in environment variables")
        return None
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'latlng': f"{lat},{lng}",
        'key': api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] == 'OK' and data['results']:
            return data['results'][0]['formatted_address']
        else:
            print(f"Reverse geocoding failed for coordinates ({lat}, {lng}): {data.get('status', 'Unknown error')}")
            return None
            
    except requests.RequestException as e:
        print(f"Error reverse geocoding coordinates ({lat}, {lng}): {e}")
        return None
    except Exception as e:
        print(f"Unexpected error reverse geocoding coordinates ({lat}, {lng}): {e}")
        return None 