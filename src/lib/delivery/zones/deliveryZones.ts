// Enhanced delivery zones with cleaned data and improved algorithms
// Moved from deliveryCalculator.ts with typos fixed and structure improved

import { DeliveryZone } from '../types';

// Define delivery zones from Depok with precise city/district mapping
export const deliveryZones: DeliveryZone[] = [
  {
    name: 'Depok & Immediate Area',
    cities: ['depok'],
    districts: [
      'cimanggis', 'sawangan', 'pancoran mas', 'beji', 'cilodong',
      'sukmajaya', 'tapos', 'cimpaeun', 'leuwiliang', 'bojongsoang',
      'genteng', 'mekar jaya', 'bakti jaya', 'kalimulya', 'cisalak',
      'harjamukti', 'cimahpar', 'pasir gunting', 'krukut', 'meruyung'
    ],
    baseRates: {
      gosendInstant: 32000,    // Updated base rates for 2025
      gosendSameDay: 24000,    // Same Day - lower cost
      grab: 29000,
      paxel: 24000
    },
    distance: 'near',
    coordinates: { lat: -6.4025, lng: 106.7942 }
  },
  {
    name: 'Jakarta Selatan',
    cities: ['jakarta', 'jakarta selatan', 'jakarta Selatan', 'jkt'],
    districts: [
      'kemang', 'pondok labu', 'pondok pinang', 'jagakarsa', 'manggarai',
      'tebet', 'pasar minggu', 'cilandak', 'cilandak barat', 'cipete raya',
      'minangkabau', 'fatmawati', 'gandaria', 'blok m', 'kebayoran baru',
      'kebayoran lama', 'grogol', 'petukangan', 'pondok aren', 'bintaro',
      'csra', 'kby. baru', 'kemang village', 'ampera', 'prapanca',
      'pancoran', 'duren karet', 'bangka', 'kuningan', 'setiabudi',
      'menteng dalam', 'jatinegara', 'kramat jati', 'makasar',
      'cakung', 'cipayung', 'pasar rebo', 'kebon pala', 'kelapa dua',
      'darmawangsa', 'cipete', 'senopati', 'prapanca', 'pondok labu'
    ],
    baseRates: {
      gosendInstant: 45000,
      gosendSameDay: 35000,    // Same Day - lower cost
      grab: 48000,
      paxel: 40000
    },
    distance: 'medium',
    coordinates: { lat: -6.2600, lng: 106.7800 }
  },
  {
    name: 'Jakarta Timur',
    cities: ['jakarta', 'jakarta timur', 'jakarta Timur'],
    districts: [
      'pulo gadung', 'jatinegara', 'cakung', 'kramat jati', 'makasar',
      'kelapa gading', 'penjaringan', 'tanjung priok', 'koja',
      'tarumajaya', 'semper', 'kalimati', 'rambutan',
      'lubang buaya', 'munjul', 'pulo gadung',
      'duren senti', 'kelapa gading', 'bekasi', 'bekasi utara',
      'bekasi timur', 'bekasi barat', 'bekasi selatan'
    ],
    baseRates: {
      gosendInstant: 48000,
      gosendSameDay: 38000,    // Same Day - lower cost
      grab: 52000,
      paxel: 44000
    },
    distance: 'medium'
  },
  {
    name: 'Jakarta Pusat & Barat',
    cities: ['jakarta', 'jakarta pusat', 'jakarta barat', 'jakarta Pusat', 'jakarta Barat'],
    districts: [
      'gambir', 'sawah besar', 'kemayoran', 'senen', 'menteng',
      'tanah abang', 'cempaka putih', 'rawasari', 'kramat', 'kenari',
      'paseban', 'senayan', 'gondangdia', 'bendungan hilir', 'karawai',
      'pulogadung', 'jatinegara', 'tanjung priok', 'koja',
      'penjaringan', 'tambora', 'grogol petamburan', 'kebon jeruk',
      'kalideres', 'cengkareng', 'kembangan', 'rambutan',
      'duri kosambi', 'cileungsi', 'pondok gede'
    ],
    baseRates: {
      gosendInstant: 52000,
      gosendSameDay: 42000,    // Same Day - lower cost
      grab: 56000,
      paxel: 52000
    },
    distance: 'medium'
  },
  {
    name: 'Tangerang & Sekitanya',
    cities: ['tangerang', 'tangerang selatan', 'cilegon', 'serang', 'tangerang Selatan'],
    districts: [
      'tigaraksa', 'legok', 'pamarin', 'kroncong', 'cikande',
      'serang', 'cilegon', 'pandeglang', 'lebak', 'tanjung lesung',
      'bsd', 'serpong', 'tangerang', 'batu ceper', 'karang tengah',
      'gading', 'karihi', 'sukadiri', 'solear', 'mekakaru',
      'jambe', 'pasar kemis', 'tigaraksa', 'legok', 'pamarin',
      'cikande', 'carenang', 'kopo', 'sindang jaya', 'gunung kaler'
    ],
    baseRates: {
      gosendInstant: 63000,
      gosendSameDay: 53000,    // Same Day - lower cost
      grab: 68000,
      paxel: 60000
    },
    distance: 'medium'
  },
  {
    name: 'Bekasi & Sekitarnya',
    cities: ['bekasi', 'bekasi utara', 'bekasi timur', 'bekasi barat', 'bekasi selatan'],
    districts: [
      'bekasi', 'bekasi utara', 'bekasi timur', 'bekasi barat', 'bekasi selatan',
      'jatinegara', 'pekayon jaya', 'margahayu', 'durikayu', 'kayuringin jaya',
      'perwira', 'harapan baru', 'kota baru', 'kranji', 'betha iskandar',
      'taman wisma asri', 'mukamulya', 'sumur batu', 'sindang palaces',
      'ciketing', 'jaka samudra', 'aren giri', 'nagrasas', 'bantar gebang',
      'mustika sari', 'mustika jaya', 'cimuning', 'pedurenan',
      'jaka mulya', 'pekapelan', 'bojong rawalumbu', 'bojong soang',
      'kayuringin', 'jaka rija', 'jakasetia', 'pekayon'
    ],
    baseRates: {
      gosendInstant: 57000,
      gosendSameDay: 47000,    // Same Day - lower cost
      grab: 60000,
      paxel: 52000
    },
    distance: 'medium'
  },
  {
    name: 'Bogor & Sekitanya',
    cities: ['bogor', 'cibubur', 'cileungsi', 'pramuka'],
    districts: [
      'bogor', 'bogor timur', 'bogor barat', 'bogor selatan', 'bogor utara',
      'cibinong', 'gunung puti', 'cileunyi', 'jonggol', 'cariu',
      'sukabumi', 'cileuit', 'raharja', 'mandalawangi', 'jasinga',
      'tenjo', 'parung', 'parung bogor', 'cireurup', 'cariu',
      'jampango', 'simpur', 'subang', 'karawang', 'purwakarta'
    ],
    baseRates: {
      gosendInstant: 38000,
      gosendSameDay: 30000,    // Same Day - lower cost
      grab: 41000,
      paxel: 33000
    },
    distance: 'near',
    coordinates: { lat: -6.5966, lng: 106.7970 }
  },
  {
    name: 'Remote Areas (Karawang & Further)',
    cities: ['karawang', 'purwakarta', 'subang', 'cirebon', 'indramayu'],
    districts: [
      'karawang', 'purwakarta', 'subang', 'cirebon', 'indramayu',
      'regol', 'buaran', 'teluk jambe', 'clay', 'cikampek',
      'rengasdengklok', 'lebakbulus', 'subang kota', 'cirebon',
      'brebes', 'tegal', 'purwokerto', 'banyumas',
      'patikan', 'arjasari', 'sindangsari', 'parakan'
    ],
    baseRates: {
      gosendInstant: 82000,
      gosendSameDay: 70000,    // Same Day - lower cost
      grab: 90000,
      paxel: 75000
    },
    distance: 'far'
  }
];

/**
 * Enhanced address validation with improved matching algorithms
 */
export const validateAddress = (address: string): boolean => {
  if (!address || address.trim().length < 3) return false;
  
  const addressLower = address.toLowerCase();
  
  // Check if address contains any recognizable city or district
  for (const zone of deliveryZones) {
    // Check cities
    for (const city of zone.cities) {
      if (addressLower.includes(city.toLowerCase())) {
        return true;
      }
    }
    
    // Check districts
    for (const district of zone.districts) {
      if (addressLower.includes(district.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Enhanced delivery zone finder with improved scoring algorithm
 */
export const findDeliveryZone = (address: string): DeliveryZone => {
  const addressLower = address.toLowerCase();
  
  // Remove common address words for better matching
  const cleanedAddress = addressLower
    .replace(/jl\.|jalan|street|st/g, '')
    .replace(/rt\.|rw\./g, '')
    .replace(/no\.|number/g, '')
    .replace(/kec\.|kecamatan/g, '')
    .replace(/kel\.|kelurahan/g, '')
    .replace(/dki/g, '')
    .replace(/\d+/g, '') // Remove numbers
    .trim();

  let bestMatch: { zone: DeliveryZone; score: number } | null = null;

  for (const zone of deliveryZones) {
    let score = 0;
    
    // Direct city match (highest priority)
    for (const city of zone.cities) {
      if (cleanedAddress.includes(city.toLowerCase())) {
        score += 10;
      }
    }
    
    // District match (medium priority)
    for (const district of zone.districts) {
      if (cleanedAddress.includes(district.toLowerCase())) {
        score += 5;
      }
      
      // Partial word matching for better coverage
      const districtWords = district.split(' ');
      for (const word of districtWords) {
        if (word.length > 3 && cleanedAddress.includes(word.toLowerCase())) {
          score += 2;
        }
      }
    }
    
    // Postal code match if available
    if (zone.postalCodes) {
      for (const postalCode of zone.postalCodes) {
        if (addressLower.includes(postalCode)) {
          score += 8;
        }
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { zone, score };
    }
  }
  
  // Return best match or default to far zone
  return bestMatch ? bestMatch.zone : deliveryZones[deliveryZones.length - 1];
};

/**
 * Calculate confidence level of zone detection
 */
export const calculateConfidence = (zone: DeliveryZone, address: string): 'high' | 'medium' | 'low' => {
  const addressLower = address.toLowerCase();
  let matchCount = 0;
  
  // Count city matches
  for (const city of zone.cities) {
    if (addressLower.includes(city.toLowerCase())) matchCount++;
  }
  
  // Count district matches  
  for (const district of zone.districts) {
    if (addressLower.includes(district.toLowerCase())) matchCount++;
  }
  
  if (matchCount >= 3) return 'high';
  if (matchCount >= 1) return 'medium';
  return 'low';
};

/**
 * Get estimated delivery time based on zone and method
 */
export const getEstimatedTime = (zone: DeliveryZone, method: string): string => {
  // ETA based on delivery method only (not zone distance)
  switch (method.toLowerCase()) {
    case 'gosend':
    case 'gosendinstant':
      return '1-3 jam';
    case 'gosendsameday':
      return '3-6 jam'; // Same Day takes longer but costs less
    case 'grab':
    case 'grabexpress':
      return '1-3 jam';
    case 'paxel':
      return '2-6 jam';
    default:
      return '1-3 jam';
  }
};