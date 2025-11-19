// Create a simple test script to verify the distance calculation works
import { calculateOngkirForAddress, formatOngkirDisplay } from './src/lib/ongkirService.js';
import { calculateDeliveryCostWithFallback } from './src/lib/distanceDeliveryCalculator.js';

console.log('Testing distance-based ongkir calculation...');

// Test case 1: GoSend Instant to a known kelurahan
console.log('\n=== Test 1: GoSend Instant ===');
const result1 = calculateOngkirForAddress('gosend', '31.74.01.1001', '31.74.01');
const formatted1 = formatOngkirDisplay(result1);
console.log('Kelurahan:', '31.74.01.1001');
console.log('Distance:', result1.distanceKm, 'km');
console.log('Cost:', formatted1.formattedCost);
console.log('Valid:', result1.isValid);

// Test case 2: Grab Express
console.log('\n=== Test 2: Grab Express ===');
const result2 = calculateOngkirForAddress('grab', '31.74.01.1001', '31.74.01');
const formatted2 = formatOngkirDisplay(result2);
console.log('Kelurahan:', '31.74.01.1001');
console.log('Distance:', result2.distanceKm, 'km');
console.log('Cost:', formatted2.formattedCost);
console.log('Valid:', result2.isValid);

// Test case 3: Full delivery cost calculation
console.log('\n=== Test 3: Full Delivery Cost ===');
const cart = []; // Empty cart for testing
const deliveryResult = calculateDeliveryCostWithFallback(
  'Kebayoran Baru, Jakarta Selatan',
  'gosend',
  cart,
  50000,
  '31.74.01.1001',
  '31.74.01'
);
console.log('Cost:', deliveryResult.formattedCost);
console.log('Zone:', deliveryResult.zone.name);
console.log('Time:', deliveryResult.estimatedTime);
console.log('Valid:', deliveryResult.isValidAddress);

console.log('\n✅ All tests completed!');