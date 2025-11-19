// Instant Delivery Calculator
// Fixed origin point and calculation methods for instant delivery services

// Fixed origin coordinates (pickup point)
export const ORIGIN_COORDS = {
  lat: -6.3838528,
  lng: 106.8420638,
};

// Service types with their base rates and characteristics
export const INSTANT_DELIVERY_SERVICES = {
  gosendInstant: {
    name: "GoSend Instant",
    baseRate: 15000, // Base rate in IDR
    pricePerKm: 2000, // Price per kilometer
    maxDistance: 40, // Maximum delivery distance in km
    estimatedTime: "1-3 jam",
    description: "Delivery dalam 1-3 jam",
    priority: 1
  },
  gosendSameDay: {
    name: "GoSend Same Day", 
    baseRate: 12000, // Lower base rate than instant
    pricePerKm: 1500, // Lower per km rate
    maxDistance: 60, // Longer distance for same day
    estimatedTime: "3-8 jam",
    description: "Delivery hari yang sama",
    priority: 2
  },
  grabexpressInstant: {
    name: "GrabExpress Instant",
    baseRate: 18000, // Higher base rate
    pricePerKm: 2500, // Higher per km rate
    maxDistance: 45, // Maximum distance
    estimatedTime: "1-4 jam", 
    description: "Delivery dalam 1-4 jam",
    priority: 1
  },
  grabexpressSameDay: {
    name: "GrabExpress Same Day",
    baseRate: 14000, // Between instant and GoSend same day
    pricePerKm: 1800,
    maxDistance: 70, // Longest distance coverage
    estimatedTime: "4-10 jam",
    description: "Delivery hari yang sama",
    priority: 2
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if destination is within service area
 */
export function isWithinServiceArea(distance, serviceKey) {
  const service = INSTANT_DELIVERY_SERVICES[serviceKey];
  return distance <= service.maxDistance;
}

/**
 * Calculate delivery cost with surge pricing
 */
export function calculateDeliveryCost(destinationLat, destinationLng, serviceKey) {
  const service = INSTANT_DELIVERY_SERVICES[serviceKey];
  if (!service) {
    throw new Error(`Unknown service: ${serviceKey}`);
  }

  // Calculate distance
  const distance = calculateDistance(
    ORIGIN_COORDS.lat, 
    ORIGIN_COORDS.lng, 
    destinationLat, 
    destinationLng
  );

  // Check if within service area
  if (!isWithinServiceArea(distance, serviceKey)) {
    return {
      service: service.name,
      available: false,
      reason: `Out of service area (max ${service.maxDistance}km)`,
      distance,
      cost: 0,
      estimatedTime: "N/A"
    };
  }

  // Calculate base cost
  let cost = service.baseRate + (distance * service.pricePerKm);

  // Apply surge pricing during peak hours
  const currentHour = new Date().getHours();
  let surgeMultiplier = 1;
  
  // Peak hours: 7-9 AM (morning) and 5-8 PM (evening)
  if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20)) {
    surgeMultiplier = 1.2; // 20% surge
  }
  
  // Weekend surcharge (Saturday and Sunday)
  const currentDay = new Date().getDay();
  if (currentDay === 0 || currentDay === 6) {
    surgeMultiplier *= 1.1; // 10% weekend surcharge
  }

  cost = Math.round(cost * surgeMultiplier);

  // Apply service fees and taxes
  cost = Math.round(cost * 1.11); // 11% service fee and tax

  return {
    service: service.name,
    available: true,
    distance,
    cost,
    estimatedTime: service.estimatedTime,
    breakdown: {
      baseRate: service.baseRate,
      distance: Math.round(distance * service.pricePerKm),
      surgeMultiplier,
      serviceFee: Math.round(cost * 0.11)
    }
  };
}

/**
 * Get all available services for a destination
 */
export function getAllServices(destinationLat, destinationLng) {
  const results = {};
  
  for (const [serviceKey, service] of Object.entries(INSTANT_DELIVERY_SERVICES)) {
    results[serviceKey] = calculateDeliveryCost(destinationLat, destinationLng, serviceKey);
  }
  
  return results;
}

/**
 * Find the cheapest available service
 */
export function findCheapestService(destinationLat, destinationLng) {
  const allServices = getAllServices(destinationLat, destinationLng);
  let cheapest = null;
  let lowestCost = Infinity;
  
  for (const [serviceKey, result] of Object.entries(allServices)) {
    if (result.available && result.cost < lowestCost) {
      lowestCost = result.cost;
      cheapest = { serviceKey, ...result };
    }
  }
  
  return cheapest;
}

/**
 * Format cost for display
 */
export function formatCost(cost) {
  return `Rp ${cost.toLocaleString('id-ID')}`;
}

// Test coordinates for major areas around Jakarta
export const TEST_COORDINATES = {
  "Jakarta Pusat": { lat: -6.1944, lng: 106.8229 },
  "Jakarta Selatan": { lat: -6.2615, lng: 106.8106 },
  "Jakarta Timur": { lat: -6.2088, lng: 106.8856 },
  "Jakarta Barat": { lat: -6.1747, lng: 106.7589 },
  "Jakarta Utara": { lat: -6.1278, lng: 106.8389 },
  "Depok": { lat: -6.4025, lng: 106.7942 },
  "Bogor": { lat: -6.5966, lng: 106.7970 },
  "Bekasi": { lat: -6.2349, lng: 106.9897 },
  "Tangerang": { lat: -6.1781, lng: 106.6296 },
  "South Tangerang": { lat: -6.2833, lng: 106.7172 }
};

/**
 * Run sample tests with predefined coordinates
 */
export function runSampleTests() {
  console.log("🧪 Running Instant Delivery Calculator Tests\n");
  console.log(`📍 Origin Point: ${ORIGIN_COORDS.lat}, ${ORIGIN_COORDS.lng}`);
  console.log("─".repeat(80));
  
  for (const [location, coords] of Object.entries(TEST_COORDINATES)) {
    console.log(`\n📍 Testing location: ${location}`);
    console.log(`   Coordinates: ${coords.lat}, ${coords.lng}`);
    
    const distance = calculateDistance(
      ORIGIN_COORDS.lat, 
      ORIGIN_COORDS.lng, 
      coords.lat, 
      coords.lng
    );
    console.log(`   Distance: ${distance} km\n`);
    
    const allServices = getAllServices(coords.lat, coords.lng);
    
    for (const [serviceKey, result] of Object.entries(allServices)) {
      const service = INSTANT_DELIVERY_SERVICES[serviceKey];
      console.log(`   ${service.name}:`);
      
      if (result.available) {
        console.log(`     ✅ Available - ${formatCost(result.cost)}`);
        console.log(`     ⏱️  ${result.estimatedTime}`);
        console.log(`     📊 Breakdown: Base ${formatCost(result.breakdown.baseRate)} + Distance ${formatCost(result.breakdown.distance)}`);
        if (result.breakdown.surgeMultiplier > 1) {
          console.log(`     🚀 Surge applied: ${(result.breakdown.surgeMultiplier * 100 - 100).toFixed(0)}%`);
        }
      } else {
        console.log(`     ❌ ${result.reason}`);
      }
      console.log("");
    }
    
    // Find cheapest option
    const cheapest = findCheapestService(coords.lat, coords.lng);
    if (cheapest) {
      console.log(`   💰 Cheapest option: ${cheapest.service} - ${formatCost(cheapest.cost)}`);
    } else {
      console.log(`   💰 No services available for this location`);
    }
    
    console.log("\n" + "=".repeat(80));
  }
}

/**
 * Quick estimation function
 */
export function quickEstimate(lat, lng) {
  const distance = calculateDistance(ORIGIN_COORDS.lat, ORIGIN_COORDS.lng, lat, lng);
  
  // Quick estimate with average rates
  const estimate = {
    distance,
    services: {},
    cheapest: null,
    allAvailable: false
  };
  
  for (const [serviceKey, service] of Object.entries(INSTANT_DELIVERY_SERVICES)) {
    if (distance <= service.maxDistance) {
      const cost = Math.round((service.baseRate + (distance * service.pricePerKm)) * 1.11);
      estimate.services[serviceKey] = {
        service: service.name,
        cost,
        available: true
      };
      
      if (!estimate.cheapest || cost < estimate.cheapest.cost) {
        estimate.cheapest = { serviceKey, service: service.name, cost };
      }
    } else {
      estimate.services[serviceKey] = {
        service: service.name,
        available: false,
        reason: `Max distance ${service.maxDistance}km`
      };
    }
  }
  
  estimate.allAvailable = Object.values(estimate.services).some(s => s.available);
  
  return estimate;
}

// Export default calculation function
export default {
  ORIGIN_COORDS,
  INSTANT_DELIVERY_SERVICES,
  calculateDistance,
  calculateDeliveryCost,
  getAllServices,
  findCheapestService,
  formatCost,
  runSampleTests,
  quickEstimate,
  TEST_COORDINATES
};