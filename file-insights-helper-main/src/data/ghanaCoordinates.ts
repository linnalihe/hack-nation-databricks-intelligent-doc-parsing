// Ghana region coordinates for mapping
// These are approximate center points for major regions/cities in Ghana

export interface GhanaRegion {
  name: string;
  lat: number;
  lng: number;
  alternateNames?: string[];
}

export const ghanaRegions: GhanaRegion[] = [
  // Major Regions
  { name: "Greater Accra", lat: 5.6037, lng: -0.1870, alternateNames: ["Accra", "Tema", "Madina"] },
  { name: "Ashanti", lat: 6.6885, lng: -1.6244, alternateNames: ["Kumasi", "Obuasi"] },
  { name: "Western", lat: 5.0527, lng: -1.9821, alternateNames: ["Takoradi", "Sekondi"] },
  { name: "Central", lat: 5.4315, lng: -1.0587, alternateNames: ["Cape Coast", "Elmina"] },
  { name: "Eastern", lat: 6.1000, lng: -0.4500, alternateNames: ["Koforidua", "Nkawkaw"] },
  { name: "Volta", lat: 6.6000, lng: 0.4500, alternateNames: ["Ho", "Hohoe"] },
  { name: "Northern", lat: 9.4000, lng: -0.8500, alternateNames: ["Tamale"] },
  { name: "Upper East", lat: 10.7500, lng: -0.8500, alternateNames: ["Bolgatanga", "Navrongo"] },
  { name: "Upper West", lat: 10.4000, lng: -2.1500, alternateNames: ["Wa"] },
  { name: "Brong Ahafo", lat: 7.5000, lng: -1.6667, alternateNames: ["Sunyani", "Techiman"] },
  
  // Major Cities
  { name: "Accra", lat: 5.5560, lng: -0.1969 },
  { name: "Kumasi", lat: 6.6885, lng: -1.6244 },
  { name: "Tamale", lat: 9.4008, lng: -0.8393 },
  { name: "Takoradi", lat: 4.8845, lng: -1.7554 },
  { name: "Cape Coast", lat: 5.1315, lng: -1.2795 },
  { name: "Tema", lat: 5.6698, lng: -0.0166 },
  { name: "Koforidua", lat: 6.0941, lng: -0.2593 },
  { name: "Ho", lat: 6.6000, lng: 0.4667 },
  { name: "Sunyani", lat: 7.3349, lng: -2.3123 },
  { name: "Bolgatanga", lat: 10.7855, lng: -0.8514 },
  { name: "Wa", lat: 10.0601, lng: -2.5099 },
  { name: "Obuasi", lat: 6.2000, lng: -1.6667 },
  
  // Other notable locations
  { name: "Dansoman", lat: 5.5341, lng: -0.2574 },
  { name: "Osu", lat: 5.5500, lng: -0.1833 },
  { name: "Labadi", lat: 5.5607, lng: -0.1467 },
  { name: "Kaneshie", lat: 5.5667, lng: -0.2333 },
  { name: "Achimota", lat: 5.6167, lng: -0.2167 },
  { name: "Kasoa", lat: 5.5333, lng: -0.4167 },
  { name: "Ashaiman", lat: 5.6833, lng: -0.0333 },
  { name: "Madina", lat: 5.6681, lng: -0.1667 },
  { name: "Teshie", lat: 5.5833, lng: -0.1000 },
  { name: "Nungua", lat: 5.5833, lng: -0.0667 },
  { name: "East Legon", lat: 5.6350, lng: -0.1550 },
  { name: "Spintex", lat: 5.6350, lng: -0.0850 },
  { name: "Airport Residential", lat: 5.6050, lng: -0.1750 },
  { name: "Adabraka", lat: 5.5550, lng: -0.2100 },
  { name: "Ridge", lat: 5.5700, lng: -0.2000 },
];

// Ghana boundary box for map
export const ghanaBounds = {
  north: 11.1667,
  south: 4.7389,
  east: 1.1992,
  west: -3.2556,
  center: { lat: 7.9465, lng: -1.0232 },
};

// Try to match a city/region name to coordinates
export function getCoordinatesForLocation(cityOrRegion: string): { lat: number; lng: number } | null {
  const normalized = cityOrRegion.toLowerCase().trim();
  
  for (const region of ghanaRegions) {
    if (region.name.toLowerCase() === normalized) {
      return { lat: region.lat, lng: region.lng };
    }
    if (region.alternateNames) {
      for (const alt of region.alternateNames) {
        if (alt.toLowerCase() === normalized) {
          return { lat: region.lat, lng: region.lng };
        }
      }
    }
  }
  
  // Partial match
  for (const region of ghanaRegions) {
    if (normalized.includes(region.name.toLowerCase()) || region.name.toLowerCase().includes(normalized)) {
      return { lat: region.lat, lng: region.lng };
    }
  }
  
  return null;
}

// Add some randomization to prevent marker stacking
export function jitterCoordinates(lat: number, lng: number, index: number): { lat: number; lng: number } {
  const jitter = 0.02; // ~2km variation
  const angle = (index * 137.5) % 360; // Golden angle distribution
  const radius = (index % 10) * jitter * 0.1;
  
  return {
    lat: lat + Math.sin(angle * Math.PI / 180) * radius,
    lng: lng + Math.cos(angle * Math.PI / 180) * radius,
  };
}
