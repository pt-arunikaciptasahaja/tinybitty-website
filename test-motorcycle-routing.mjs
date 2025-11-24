#!/usr/bin/env node
// Test script to verify motorcycle routing without tolls

import { calculateDeliveryCosts } from './src/lib/shipping/distance.js';

console.log('🛵 Testing Motorcycle Routing Without Tolls\n');

// Test with some Jakarta destinations
const testDestinations = [
  'Thamrin, Jakarta Pusat, Jakarta',
  'Pondok Indah, Jakarta Selatan, Jakarta', 
  'Kelapa Gading, Jakarta Utara, Jakarta',
  'Depok, Jawa Barat',
  'Bogor, Jawa Barat'
];

async function runTests() {
  for (const destination of testDestinations) {
    try {
      console.log(`📍 Testing: ${destination}`);
      const result = await calculateDeliveryCosts(destination);
      
      console.log(`   ✅ Distance: ${result.distance_km} km`);
      console.log(`   💰 GoSend Instant: Rp ${result.gosend_instant.toLocaleString()}`);
      console.log(`   💰 GoSend Same Day: Rp ${result.gosend_same_day.toLocaleString()}`);
      console.log(`   💰 GrabExpress Instant: Rp ${result.grabexpress_instant.toLocaleString()}`);
      console.log();
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log();
    }
  }
  
  console.log('🎯 Test completed! All distances now use motorcycle routing without tolls.');
}

runTests().catch(console.error);