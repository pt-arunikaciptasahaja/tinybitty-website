// destinationCoords.ts
import coordinatesData from '../../kelurahan-with-latlng-accurate.json';
import wilayahData from '../data/jabodetabek-addresses.json';

export interface LatLng {
  lat: number;
  lng: number;
}

// Type for the nested coordinate structure
interface CoordinatesData {
  [city: string]: {
    [district: string]: {
      [village: string]: LatLng;
    };
  };
}

// Create lookup maps
const KELURAHAN_COORDS: Record<string, LatLng> = {};

// Function to convert coordinate data to lookup map
function buildCoordinateLookup() {
  const coords = coordinatesData as CoordinatesData;
  
  // Convert city names to match jabodetabek-addresses.json format
  const cityNameMap: Record<string, string> = {
    'Jakarta Selatan': 'Kota Administrasi Jakarta Selatan',
    'Jakarta Timur': 'Kota Administrasi Jakarta Timur', 
    'Jakarta Barat': 'Kota Administrasi Jakarta Barat',
    'Jakarta Utara': 'Kota Administrasi Jakarta Utara',
    'Jakarta Pusat': 'Kota Administrasi Jakarta Pusat',
  };

  for (const [cityName, districts] of Object.entries(coords)) {
    const mappedCityName = cityNameMap[cityName];
    if (!mappedCityName) continue;

    for (const [districtName, villages] of Object.entries(districts)) {
      // Find matching kecamatan codes for this district
      const kecCodes = Object.keys(wilayahData.kecamatan).filter(code => 
        code.startsWith(Object.keys(wilayahData.kota).find(kotaCode => 
          wilayahData.kota[kotaCode] === mappedCityName
        ) || '')
      );

      for (const kecCode of kecCodes) {
        const kecName = wilayahData.kecamatan[kecCode];
        
        // Try to match district name with kec name (fuzzy match)
        if (kecName.toLowerCase().includes(districtName.toLowerCase()) ||
            districtName.toLowerCase().includes(kecName.toLowerCase())) {
          
          // Now map villages to kelurahan codes
          for (const [villageName, coords] of Object.entries(villages)) {
            // Find kelurahan codes that belong to this kecamatan
            const kelCodes = Object.keys(wilayahData.kelurahan).filter(code =>
              code.startsWith(kecCode)
            );

            // Try to match village name with kelurahan name
            for (const kelCode of kelCodes) {
              const kelName = wilayahData.kelurahan[kelCode];
              
              // Fuzzy match village and kelurahan names
              if (kelName.toLowerCase().includes(villageName.toLowerCase()) ||
                  villageName.toLowerCase().includes(kelName.toLowerCase())) {
                KELURAHAN_COORDS[kelCode] = coords;
                break;
              }
            }
          }
        }
      }
    }
  }

  // Add fallback coordinates for major areas (centers of districts)
  const fallbackCoords: Record<string, LatLng> = {
    // Jakarta Pusat - Gambir area (city center)
    '31.71.01.1001': { lat: -6.175, lng: 106.827 }, // Gambir center
    '31.71.07.1001': { lat: -6.201, lng: 106.817 }, // Tanah Abang center
    
    // Jakarta Selatan - Major districts
    '31.74.01.1001': { lat: -6.288, lng: 106.784 }, // Cilandak
    '31.74.02.1001': { lat: -6.315, lng: 106.829 }, // Jagakarsa
    '31.74.03.1001': { lat: -6.244, lng: 106.814 }, // Kebayoran Baru
    '31.74.04.1001': { lat: -6.251, lng: 106.784 }, // Kebayoran Lama
    '31.74.05.1001': { lat: -6.234, lng: 106.815 }, // Mampang Prapatan
    '31.74.06.1001': { lat: -6.219, lng: 106.837 }, // Pancoran
    '31.74.07.1001': { lat: -6.287, lng: 106.851 }, // Pasar Minggu
    '31.74.08.1001': { lat: -6.198, lng: 106.781 }, // Pesanggrahan
    '31.74.09.1001': { lat: -6.214, lng: 106.822 }, // Setiabudi
    '31.74.10.1001': { lat: -6.221, lng: 106.834 }, // Tebet
    
    // Jakarta Timur
    '31.75.01.1001': { lat: -6.215, lng: 106.912 }, // Cakung
    '31.75.02.1001': { lat: -6.228, lng: 106.896 }, // Jatinegara
    
    // Jakarta Barat
    '31.73.01.1001': { lat: -6.169, lng: 106.789 }, // Grogol Petamburan
    
    // Jakarta Utara
    '31.72.01.1001': { lat: -6.118, lng: 106.906 }, // Kelapa Gading
    '31.72.02.1001': { lat: -6.108, lng: 106.795 }, // Penjaringan
  };

  // Merge fallback coordinates (they won't override existing ones)
  Object.assign(KELURAHAN_COORDS, fallbackCoords);
}

buildCoordinateLookup();

export { KELURAHAN_COORDS };

/**
 * Get coordinates for a kelurahan ID
 */
export function getCoordinatesForKelurahan(kelurahanId: string): LatLng | null {
  return KELURAHAN_COORDS[kelurahanId] || null;
}

/**
 * Get coordinates for a kecamatan ID (center point)
 */
export function getCoordinatesForKecamatan(kecamatanId: string): LatLng | null {
  // Try to find a kelurahan within this kecamatan
  const kelCodes = Object.keys(KELURAHAN_COORDS).filter(code => 
    code.startsWith(kecamatanId)
  );
  
  if (kelCodes.length > 0) {
    return KELURAHAN_COORDS[kelCodes[0]];
  }
  
  // Fallback to district centers for major areas
  const districtFallbacks: Record<string, LatLng> = {
    '31.71': { lat: -6.175, lng: 106.827 }, // Jakarta Pusat center
    '31.72': { lat: -6.108, lng: 106.795 }, // Jakarta Utara center
    '31.73': { lat: -6.169, lng: 106.789 }, // Jakarta Barat center
    '31.74': { lat: -6.244, lng: 106.814 }, // Jakarta Selatan center
    '31.75': { lat: -6.215, lng: 106.912 }, // Jakarta Timur center
  };
  
  return districtFallbacks[kecamatanId.substring(0, 4)] || null;
}