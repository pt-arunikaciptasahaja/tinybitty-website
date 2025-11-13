// Delivery Cost Calculator for Tiny Bitty (from Depok, West Java)
// Updated with current 2024/2025 pricing and precise city validation
// Base rates increased by 60% to cover real delivery service costs

export interface DeliveryZone {
  name: string;
  cities: string[];
  districts: string[];
  postalCodes?: string[];
  baseRates: {
    gosendInstant: number;
    grab: number;
    paxel: number;
  };
  distance: 'near' | 'medium' | 'far';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

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
      gosendInstant: 32000,    // Increased 60% from 20,000
      grab: 29000,             // Increased 60% from 18,000
      paxel: 24000             // Increased 60% from 15,000
    },
    distance: 'near',
    coordinates: { lat: -6.4025, lng: 106.7942 }
  },
  {
    name: 'Jakarta Selatan',
    cities: ['jakarta', 'jakarta selatan', 'depok'],
    districts: [
      'kemang', 'pondok labu', 'pondok pinang', 'jagakarsa', 'manggarai',
      'tebet', 'pasar minggu', 'cilandak', 'cilandak barat', 'cipete raya',
      'minangkabau', 'fatmawati', 'gandaria', 'blok m', 'kebayoran baru',
      'kebayoran lama', 'grogol', 'petukangan', 'pondok aren', 'bintaro',
      'csra', 'kby. baru', 'kemang village', 'ampera', 'prapanca',
      'pancoran', 'duren karet', 'bangka', 'kuningan', 'setiabudi',
      'menteng dalam', 'jatinegara', 'kramat jati', 'makasar',
      'cakung', 'cipayung', 'pasar rebo', 'kebon pala', 'kelapa dua',
      'darmawangsa', 'cipete', 'senopati', 'prapanca'
    ],
    baseRates: {
      gosendInstant: 45000,    // Based on real data: Darmawangsa = Rp 55,000
      grab: 48000,             // Increased proportionally
      paxel: 40000             // Competitive pricing
    },
    distance: 'medium'
  },
  {
    name: 'Jakarta Timur',
    cities: ['jakarta', 'jakarta timur'],
    districts: [
      'pulo gadung', 'jatinegara', 'cakung', 'kramat jati', 'makasar',
      'cakung', 'duren senti', 'kelapa gading', 'penjaringan', 'tanjung priok',
      'koja', 'tarumajaya', 'semper', 'kebayoran baru', 'kebayoran lama',
      'pondok cabe', 'jatinegara', 'kramat jati', 'pasar rebo', 'kalimati',
      'cakung', 'rambutan', 'cipayung', 'lubang buaya', 'munjul',
      'kramat jati', 'makasar', 'cakung', 'pulo gadung', 'kelapa gading'
    ],
    baseRates: {
      gosendInstant: 48000,    // Increased 60% from 32,000
      grab: 52000,             // Increased 60% from 35,000
      paxel: 44000             // Increased 60% from 30,000
    },
    distance: 'medium'
  },
  {
    name: 'Jakarta Pusat & Barat',
    cities: ['jakarta', 'jakarta pusat', 'jakarta barat'],
    districts: [
      'gambir', 'sawah besar', 'kemayoran', 'senen', 'menteng',
      'tanah abang', 'cempaka putih', 'rawasari', 'kramat', 'kenari',
      'paseban', 'senayan', 'gondangdia', 'bendungan hilir', 'karawai',
      'pulogadung', 'jatinegara', 'kramat jati', 'tanjung priok', 'koja',
      'penjaringan', 'tambora', 'grogol petamburan', 'kebon jeruk',
      'kalideres', 'cengkareng', 'kembangan', 'rambutan', 'cengkareng',
      'duri kosambi', 'kebayoran baru', 'pondok gede', 'cileungsi'
    ],
    baseRates: {
      gosendInstant: 52000,    // Increased 60% from 35,000
      grab: 56000,             // Increased 60% from 38,000
      paxel: 52000             // Increased 60% from 35,000
    },
    distance: 'medium'
  },
  {
    name: 'Tangerang & Sekitarnya',
    cities: ['tangerang', 'tangerang selatan', 'cilegon', 'serang'],
    districts: [
      'tigaraksa', 'legok', 'pamarin', 'kroncong', 'cikande',
      'serang', 'cilegon', 'pandeglang', 'lebak', 'tanjung lesung',
      'bsd', 'serpong', 'tangerang', 'batu ceper', 'karang tengah',
      'gading', 'karihi', 'sukadiri', 'solear', 'mekakaru',
      'jambe', 'pasar kemis', 'tigaraksa', 'legok', 'pamarin',
      'cikande', 'carenang', 'kopo', 'sindang jaya', 'gunung kaler'
    ],
    baseRates: {
      gosendInstant: 63000,    // Increased 60% from 42,000
      grab: 68000,             // Increased 60% from 45,000
      paxel: 60000             // Increased 60% from 40,000
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
      'kayuringin', 'jaka rija', 'jakasetia', 'pekayon', 'durikdpung'
    ],
    baseRates: {
      gosendInstant: 57000,    // Increased 60% from 38,000
      grab: 60000,             // Increased 60% from 40,000
      paxel: 52000             // Increased 60% from 35,000
    },
    distance: 'medium'
  },
  {
    name: 'Bogor & Sekitarnya',
    cities: ['bogor', 'cibubur', 'gram实干', 'pramuka'],
    districts: [
      'bogor', 'bogor timur', 'bogor barat', 'bogor selatan', 'bogor utara',
      'cibinong', 'gunung Putri', 'cileungsi', 'jonggol', 'cariu',
      'sukabumi', 'celeuit', 'raharja', 'mandalawangi', 'jasinga',
      'tenjo', 'parung', 'parung bogor', 'cireurup', 'cariu',
      'jampango', 'simpur', 'subang', 'karawang', 'purwakarta'
    ],
    baseRates: {
      gosendInstant: 38000,    // Increased 60% from 25,000
      grab: 41000,             // Increased 60% from 28,000
      paxel: 33000             // Increased 60% from 22,000
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
      'cirebon', 'brebes', 'tegal', 'purwokerto', 'banyumas',
      'patikan', 'arjasari', 'cimahpar', 'sindangsari', 'parakan'
    ],
    baseRates: {
      gosendInstant: 82000,    // Increased 60% from 55,000
      grab: 90000,             // Increased 60% from 60,000
      paxel: 75000             // Increased 60% from 50,000
    },
    distance: 'far'
  }
];

export interface CartItem {
  productName: string;
  quantity: number;
  variant: {
    size: string;
    price: number;
  };
}

export interface DeliveryCalculation {
  cost: number;
  zone: DeliveryZone;
  method: string;
  estimatedTime: string;
  confidence: 'high' | 'medium' | 'low' | 'invalid';
  breakdown: {
    baseRate: number;
    distanceMultiplier: number;
    weightCharge: number;
    surcharges?: number;
  };
  isValidAddress: boolean;
}

/**
 * Validate if address contains recognizable city/district names
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
 * Enhanced city/area validation with multiple matching strategies
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
        if (cleanedAddress.includes(postalCode)) {
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
 * Calculate delivery cost based on address, method, and cart weight
 */
export const calculateDeliveryCost = (
  address: string,
  deliveryMethod: string,
  cart: CartItem[] = [],
  subtotal: number = 0
): DeliveryCalculation => {
  const zone = findDeliveryZone(address);
  const baseRates = zone.baseRates;
  
  // Check if address is valid
  const isValidAddress = validateAddress(address);
  if (!isValidAddress) {
    return {
      cost: 0,
      zone: zone,
      method: deliveryMethod,
      estimatedTime: 'N/A',
      confidence: 'invalid',
      breakdown: {
        baseRate: 0,
        distanceMultiplier: 1,
        weightCharge: 0,
      },
      isValidAddress: false
    };
  }
  
  // Base rate for selected method
  let baseRate = 0;
  switch (deliveryMethod) {
    case 'gosendInstant':
      baseRate = baseRates.gosendInstant;
      break;
    case 'grab':
      baseRate = baseRates.grab;
      break;
    case 'paxel':
      baseRate = baseRates.paxel;
      break;
    default:
      baseRate = baseRates.gosendInstant;
  }
  
  // Weight calculation (realistic for cookies)
  const totalWeight = cart.reduce((total, item) => {
    const weightPerItem = item.productName.toLowerCase().includes('cookie') ? 
      getCookieWeight(item.variant.size) : 
      getProductWeight(item.variant.size);
    return total + (weightPerItem * item.quantity);
  }, 0);
  
  // Weight charge (updated 2024/2025 rates)
  let weightCharge = 0;
  if (totalWeight > 3) { // More than 3kg
    weightCharge = (totalWeight - 3) * 15000; // Increased to Rp 15,000 per kg over 3kg
  }
  
  // Time-based surge (peak hours)
  const currentHour = new Date().getHours();
  let timeSurcharge = 0;
  if (currentHour >= 17 && currentHour <= 20) { // 5-8 PM peak
    timeSurcharge = baseRate * 0.1; // 10% peak surcharge
  }
  
  // Final calculation
  const cost = Math.round(baseRate + weightCharge + timeSurcharge);
  
  // Estimate delivery time (more realistic for 2024/2025)
  const getEstimatedTime = (): string => {
    switch (zone.distance) {
      case 'near':
        return deliveryMethod === 'gosendInstant' ? '30-60 menit' : '1-2 jam';
      case 'medium':
        return deliveryMethod === 'gosendInstant' ? '1-2 jam' : '2-4 jam';
      case 'far':
        return deliveryMethod === 'gosendInstant' ? '2-4 jam' : '4-8 jam';
      default:
        return '1-3 jam';
    }
  };

  // Calculate confidence level
  const confidence = calculateConfidence(zone, address);
  
  return {
    cost,
    zone,
    method: deliveryMethod,
    estimatedTime: getEstimatedTime(),
    confidence,
    breakdown: {
      baseRate,
      distanceMultiplier: 1, // Base rates already account for distance
      weightCharge,
      surcharges: timeSurcharge > 0 ? timeSurcharge : undefined
    },
    isValidAddress: true
  };
};

/**
 * Calculate confidence level of zone detection
 */
const calculateConfidence = (zone: DeliveryZone, address: string): 'high' | 'medium' | 'low' => {
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
 * Get cookie weight by size (realistic estimates)
 */
const getCookieWeight = (size: string): number => {
  if (size.toLowerCase().includes('small') || size === 'S') return 0.15; // 150g
  if (size.toLowerCase().includes('medium') || size === 'M') return 0.25; // 250g
  if (size.toLowerCase().includes('large') || size === 'L') return 0.35; // 350g
  if (size.toLowerCase().includes('family') || size === 'F') return 0.5; // 500g
  return 0.2; // Default 200g
};

/**
 * Get product weight by size
 */
const getProductWeight = (size: string): number => {
  if (size.toLowerCase().includes('small') || size === 'S') return 0.2;
  if (size.toLowerCase().includes('medium') || size === 'M') return 0.35;
  if (size.toLowerCase().includes('large') || size === 'L') return 0.5;
  return 0.25; // Default
};

/**
 * Format delivery cost for display
 */
export const formatDeliveryCost = (cost: number): string => {
  return `Rp ${cost.toLocaleString('id-ID')}`;
};

/**
 * Get delivery cost details for UI display
 */
export const getDeliveryInfo = (address: string, deliveryMethod: string): {
  cost: string;
  zone: string;
  time: string;
  confidence: string;
  breakdown: string;
  isValid: boolean;
} => {
  const calculation = calculateDeliveryCost(address, deliveryMethod);
  
  const confidenceText = {
    'high': 'Tinggi',
    'medium': 'Sedang', 
    'low': 'Rendah',
    'invalid': 'Tidak Valid'
  };
  
  if (!calculation.isValidAddress) {
    return {
      cost: 'Invalid Address',
      zone: 'Please enter a valid city/area',
      time: 'N/A',
      confidence: 'Tidak Valid',
      breakdown: 'Address must contain recognizable city or area name',
      isValid: false
    };
  }
  
  return {
    cost: formatDeliveryCost(calculation.cost),
    zone: calculation.zone.name,
    time: calculation.estimatedTime,
    confidence: confidenceText[calculation.confidence],
    breakdown: `Base: ${formatDeliveryCost(calculation.breakdown.baseRate)}` + 
               (calculation.breakdown.weightCharge > 0 ? ` + Weight: ${formatDeliveryCost(calculation.breakdown.weightCharge)}` : '') +
               (calculation.breakdown.surcharges ? ` + Peak: ${formatDeliveryCost(calculation.breakdown.surcharges)}` : ''),
    isValid: true
  };
};