/**
 * EZKORA Location & Geographic Distance Service
 * 
 * Provides real Haversine distance calculations, ground coordinates,
 * and graceful fallbacks for location-aware cricket discovery.
 */

// Ground & Venue Geocoding Registry (Real coordinates in India)
export const VENUE_COORDINATES = {
  // Hyderabad Grounds
  'Rajiv Cricket Ground, Hyderabad': { lat: 17.4065, lon: 78.5505, city: 'Hyderabad', ground: 'Rajiv Gandhi International Cricket Stadium' },
  'Rajiv Gandhi International Cricket Stadium': { lat: 17.4065, lon: 78.5505, city: 'Hyderabad', ground: 'Rajiv Gandhi Stadium' },
  'Gymkhana Ground, Secunderabad': { lat: 17.4399, lon: 78.4983, city: 'Hyderabad', ground: 'Gymkhana Cricket Ground' },
  'Sunrise Cricket Ground': { lat: 17.4435, lon: 78.3489, city: 'Hyderabad', ground: 'Sunrise Cricket Ground, Gachibowli' },
  'Sunrise Cricket Ground, Gachibowli': { lat: 17.4435, lon: 78.3489, city: 'Hyderabad', ground: 'Sunrise Cricket Ground' },
  'LB Stadium, Hyderabad': { lat: 17.4011, lon: 78.4747, city: 'Hyderabad', ground: 'Fateh Maidan / LB Stadium' },
  'Hoopp Turf & Cricket Arena, Kondapur': { lat: 17.4682, lon: 78.3571, city: 'Hyderabad', ground: 'Hoopp Turf Arena' },

  // Bengaluru Grounds
  'Greenfield Stadium, Bengaluru': { lat: 12.9352, lon: 77.6245, city: 'Bengaluru', ground: 'Greenfield Turf, Koramangala' },
  'M Chinnaswamy Stadium, Bengaluru': { lat: 12.9788, lon: 77.5996, city: 'Bengaluru', ground: 'M. Chinnaswamy Stadium' },
  'Alur Cricket Ground, Bengaluru': { lat: 13.0645, lon: 77.4428, city: 'Bengaluru', ground: 'KSCA Alur Cricket Ground' },

  // Delhi Grounds
  'Arun Jaitley Stadium, Delhi': { lat: 28.6379, lon: 77.2432, city: 'Delhi', ground: 'Arun Jaitley Stadium' },
  'Kurukshetra Sports Complex': { lat: 29.9695, lon: 76.8783, city: 'Kurukshetra', ground: 'Kurukshetra Sports Complex' },

  // Mumbai Grounds
  'Wankhede Stadium, Mumbai': { lat: 18.9389, lon: 72.8258, city: 'Mumbai', ground: 'Wankhede Stadium' },
};

// Default User Anchor Location (Hyderabad tech hub area)
export const DEFAULT_USER_LOCATION = {
  name: 'Hyderabad (Near You)',
  city: 'Hyderabad',
  lat: 17.4399,
  lon: 78.3983,
};

/**
 * Calculate Great-Circle Distance between two coordinates using Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number|null} Distance in kilometers rounded to 1 decimal place, or null if coordinates invalid
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null || isNaN(lat1) ||
    lon1 === undefined || lon1 === null || isNaN(lon1) ||
    lat2 === undefined || lat2 === null || isNaN(lat2) ||
    lon2 === undefined || lon2 === null || isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  return Math.round(dist * 10) / 10;
}

/**
 * Resolve coordinates for a venue name.
 * If venue is in registry, return exact coordinates.
 * Otherwise, attempt city heuristic or generate deterministic anchor offset.
 */
export function resolveVenueCoordinates(venueName, defaultCity = 'Hyderabad') {
  if (!venueName || typeof venueName !== 'string') {
    return { ...DEFAULT_USER_LOCATION, ground: 'Local Ground' };
  }

  // Exact match
  if (VENUE_COORDINATES[venueName]) {
    return VENUE_COORDINATES[venueName];
  }

  // Substring match
  const matchKey = Object.keys(VENUE_COORDINATES).find((key) =>
    venueName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(venueName.toLowerCase())
  );
  if (matchKey) {
    return VENUE_COORDINATES[matchKey];
  }

  // City match heuristic
  const vLower = venueName.toLowerCase();
  if (vLower.includes('bengaluru') || vLower.includes('bangalore')) {
    return { lat: 12.9716, lon: 77.5946, city: 'Bengaluru', ground: venueName };
  }
  if (vLower.includes('delhi')) {
    return { lat: 28.6139, lon: 77.2090, city: 'Delhi', ground: venueName };
  }
  if (vLower.includes('mumbai')) {
    return { lat: 19.0760, lon: 72.8777, city: 'Mumbai', ground: venueName };
  }

  // Default to Hyderabad with small deterministic variance based on string hash
  let hash = 0;
  for (let i = 0; i < venueName.length; i++) {
    hash = (hash << 5) - hash + venueName.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 80) - 40) / 1000; // ±0.04 deg (~4 km)
  const lonOffset = (((Math.abs(hash >> 3)) % 80) - 40) / 1000;

  return {
    lat: DEFAULT_USER_LOCATION.lat + latOffset,
    lon: DEFAULT_USER_LOCATION.lon + lonOffset,
    city: defaultCity,
    ground: venueName,
  };
}

/**
 * Get current user geographic location.
 * Falls back safely to profile location or DEFAULT_USER_LOCATION without crashing.
 */
export async function getUserLocation(profileLocationStr) {
  // If browser/device geolocation is available
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 60000,
        });
      });
      if (pos?.coords) {
        return {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: 'Current Location',
          isDeviceGps: true,
        };
      }
    } catch (e) {
      // Fall through to profile location
    }
  }

  // Fallback to profile location string
  if (profileLocationStr) {
    const locLower = profileLocationStr.toLowerCase();
    if (locLower.includes('bengaluru') || locLower.includes('bangalore')) {
      return { lat: 12.9716, lon: 77.5946, city: 'Bengaluru', isDeviceGps: false };
    }
    if (locLower.includes('delhi')) {
      return { lat: 28.6139, lon: 77.2090, city: 'Delhi', isDeviceGps: false };
    }
    if (locLower.includes('mumbai')) {
      return { lat: 19.0760, lon: 72.8777, city: 'Mumbai', isDeviceGps: false };
    }
  }

  return {
    ...DEFAULT_USER_LOCATION,
    isDeviceGps: false,
  };
}
