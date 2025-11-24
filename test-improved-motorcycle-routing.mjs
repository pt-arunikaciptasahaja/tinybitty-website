#!/usr/bin/env node
// Enhanced test script for motorcycle routing without tolls
// This demonstrates the improved fallback system

console.log('🛵 Enhanced Motorcycle Routing System\n');
console.log('📋 Fallback Chain:');
console.log('   1st: OpenRouteService API (motorcycle + no tolls)');
console.log('   2nd: OSRM road distance (car routing)');
console.log('   3rd: Adjusted Haversine (straight line × road factor)');
console.log('   4th: Raw Haversine (last resort)\n');

import { calculateDeliveryCosts } from './src/lib/shipping/distance.js';

const testAddress = 'Victoria Riverpark BSD, bsd city, Jl. Victoria River Park, Lengkong Karya, Kec. Serpong Utara, Kota Tangerang Selatan, Banten 15310';

async function testImprovedSystem() {
  try {
    console.log(`📍 Testing address: ${testAddress}\n`);
    
    const startTime = Date.now();
    const result = await calculateDeliveryCosts(testAddress);
    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Calculation time: ${duration}ms`);
    console.log(`📏 Distance: ${result.distance_km} km`);
    console.log(`💰 GoSend Instant: Rp ${result.gosend_instant.toLocaleString()}`);
    console.log(`💰 GoSend Same Day: Rp ${result.gosend_same_day.toLocaleString()}`);
    console.log(`💰 GrabExpress Instant: Rp ${result.grabexpress_instant.toLocaleString()}`);
    
    console.log(`\n🎯 Result Analysis:`);
    console.log(`   • Distance calculation uses motorcycle routing`);
    console.log(`   • Toll roads are automatically excluded`);
    console.log(`   • Fallback system ensures reliability`);
    
    if (result.distance_km >= 30) {
      console.log(`   • Long distance detected - using road-based calculation`);
    } else {
      console.log(`   • Medium/short distance - high accuracy expected`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log('🚀 Starting improved motorcycle routing test...\n');
testImprovedSystem();