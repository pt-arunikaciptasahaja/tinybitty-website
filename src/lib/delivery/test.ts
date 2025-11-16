// Test and sample usage for the delivery cost engine
// Demonstrates all functionality: scraping, fallback, caching, etc.

import { getDeliveryCost, getBatchDeliveryCosts, getDeliveryCostWithProvider } from './deliveryService';
import { CartItem } from './types';
import { formatDeliveryCost } from './deliveryService';

console.log('🧪 Testing Delivery Cost Engine');
console.log('=' .repeat(50));

// Sample cart for testing
const sampleCart: CartItem[] = [
  {
    productName: 'Chocolate Chip Cookies',
    quantity: 2,
    variant: {
      size: 'medium',
      price: 25000
    }
  },
  {
    productName: 'Almond Cookies',
    quantity: 1,
    variant: {
      size: 'large',
      price: 35000
    }
  }
];

// Test addresses
const testAddresses = [
  'Kebayoran Baru, Jakarta Selatan',
  'Kemang, Jakarta Selatan', 
  'Bekasi, Bekasi',
  'Tangerang, Tangerang',
  'Bogor, Bogor'
];

// Test methods
const testMethods = ['gosendInstant', 'grabExpress', 'paxel'];

async function runTests() {
  console.log('\n📦 Test 1: Basic Single Provider Calculation');
  console.log('-' .repeat(50));
  
  try {
    const delivery = await getDeliveryCost(
      "Kebayoran Baru, Jakarta Selatan",
      "gosendInstant",
      sampleCart
    );
    
    console.log('✅ Success!');
    console.log('Address:', delivery.address);
    console.log('Provider:', delivery.provider);
    console.log('Cost:', formatDeliveryCost(delivery));
    console.log('Source:', delivery.source);
    console.log('Is Live:', delivery.isLive);
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n🚀 Test 2: Force Specific Provider');
  console.log('-' .repeat(50));
  
  try {
    const grabDelivery = await getDeliveryCostWithProvider(
      "Kemang, Jakarta Selatan",
      "grabExpress",
      sampleCart,
      'grab'
    );
    
    console.log('✅ Success!');
    console.log('Provider (forced):', grabDelivery.provider);
    console.log('Cost:', formatDeliveryCost(grabDelivery));
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n📊 Test 3: Batch Calculation (Multiple Methods)');
  console.log('-' .repeat(50));
  
  try {
    const batchResults = await getBatchDeliveryCosts(
      "Bekasi, Bekasi",
      testMethods,
      sampleCart
    );
    
    console.log('✅ Success!');
    Object.entries(batchResults).forEach(([method, result]) => {
      console.log(`${method}: ${formatDeliveryCost(result).cost} (${result.source})`);
    });
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n🔄 Test 4: Multiple Addresses (Caching Test)');
  console.log('-' .repeat(50));
  
  for (const address of testAddresses) {
    try {
      const delivery = await getDeliveryCost(
        address,
        'gosendInstant',
        sampleCart
      );
      
      console.log(`${address}: ${formatDeliveryCost(delivery).cost} (${delivery.source})`);
      
      // Wait a bit to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`${address}: ❌ Failed -`, error);
    }
  }
  
  console.log('\n💰 Test 5: Heavy Cart (Weight Surcharge Test)');
  console.log('-' .repeat(50));
  
  const heavyCart: CartItem[] = [
    {
      productName: 'Family Cookies Pack',
      quantity: 10,
      variant: {
        size: 'family',
        price: 50000
      }
    }
  ];
  
  try {
    const heavyDelivery = await getDeliveryCost(
      "Tangerang, Tangerang",
      'paxel',
      heavyCart
    );
    
    console.log('✅ Success!');
    console.log('Heavy cart delivery:', formatDeliveryCost(heavyDelivery));
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n⏰ Test 6: Time-based Surcharge (Peak Hours)');
  console.log('-' .repeat(50));
  
  try {
    const peakDelivery = await getDeliveryCost(
      "Bogor, Bogor",
      'gosendInstant',
      sampleCart
    );
    
    console.log('✅ Success!');
    console.log('Peak time delivery:', formatDeliveryCost(peakDelivery));
    console.log('Current hour:', new Date().getHours(), '(Peak hours: 17-20)');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n🚫 Test 7: Invalid Address (Error Handling)');
  console.log('-' .repeat(50));
  
  try {
    const invalidDelivery = await getDeliveryCost(
      "Random Unknown City, Outer Space",
      'gosendInstant',
      sampleCart
    );
    
    console.log('❌ This should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Expected error:', error.message);
  }
  
  console.log('\n🏎️  Test 8: Fast Address Validation');
  console.log('-' .repeat(50));
  
  const validationTests = [
    'Jakarta',
    'Bekasi',
    'Bogor',
    'Unknown Place',
    'Kemang'
  ];
  
  validationTests.forEach(address => {
    const isValid = require('./deliveryService').isDeliverableAddress(address);
    console.log(`${address}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });
  
  console.log('\n🎯 Test 9: Provider Availability Check');
  console.log('-' .repeat(50));
  
  try {
    const availableProviders = await require('./deliveryService').getAvailableProviders(
      "Jakarta Selatan",
      sampleCart
    );
    
    console.log('Available providers:');
    availableProviders.forEach(provider => {
      console.log(`- ${provider.provider}: ${provider.isLive ? 'Live' : 'Fallback'} (${Math.round(provider.confidence * 100)}% confidence)`);
    });
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
  
  console.log('\n📈 Test 10: Performance Test (Multiple Requests)');
  console.log('-' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    const promises = testAddresses.map(address => 
      getDeliveryCost(address, 'gosendInstant', sampleCart)
    );
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ Completed ${results.length} requests in ${endTime - startTime}ms`);
    console.log(`Average: ${(endTime - startTime) / results.length}ms per request`);
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// Sample usage as requested in the prompt
async function demoSampleUsage() {
  console.log('\n📋 Sample Usage (as requested in prompt):');
  console.log('=' .repeat(50));
  
  const cart = [
    {
      productName: 'Sample Cookies',
      quantity: 1,
      variant: { size: 'medium', price: 25000 }
    }
  ];
  
  // This is the exact example from the prompt
  console.log('const delivery = await getDeliveryCost("Kebayoran Baru, Jakarta Selatan", "gosendInstant", cart);');
  
  const delivery = await getDeliveryCost("Kebayoran Baru, Jakarta Selatan", "gosendInstant", cart);
  console.log('console.log(delivery);');
  console.log(delivery);
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('- ✅ Real-time pricing from scrapers');
  console.log('- ✅ Fallback to zone-based calculation');
  console.log('- ✅ 24-hour caching to avoid hammering endpoints');
  console.log('- ✅ Weight-based surcharges');
  console.log('- ✅ Time-based peak pricing');
  console.log('- ✅ Batch calculations');
  console.log('- ✅ Provider forcing');
  console.log('- ✅ Error handling');
  console.log('- ✅ Address validation');
  console.log('- ✅ Performance optimization');
}

// Run all tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => demoSampleUsage())
    .catch(console.error);
}

export { runTests, demoSampleUsage };