// Test script to verify custom delivery cost calculation
// Run with: node test-delivery-custom.js

const { DeliveryCalculator } = require('./src/lib/delivery/calculator/index.ts');

async function testCustomDelivery() {
    console.log('🧪 Testing Custom Delivery Cost Calculation');
    console.log('='.repeat(50));
    
    const testCases = [
        {
            address: 'daerah khusus ibukota jakarta, kota administrasi jakarta selatan, cilandak, cilandak timur',
            method: 'gosendInstant',
            description: 'Jakarta Selatan - GoSend'
        },
        {
            address: 'depok sukmajaya',
            method: 'gosendInstant', 
            description: 'Depok Area - GoSend'
        },
        {
            address: 'jakarta pusat, gambir',
            method: 'grabExpress',
            description: 'Jakarta Pusat - Grab Express'
        },
        {
            address: 'bekasi bekasi utara',
            method: 'paxel',
            description: 'Bekasi - Paxel'
        }
    ];
    
    const cart = [
        { weight: 0.5, quantity: 2 }, // 1kg total
        { weight: 0.3, quantity: 3 }  // 0.9kg total
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`\n📍 Testing: ${testCase.description}`);
            console.log(`Address: ${testCase.address}`);
            console.log(`Method: ${testCase.method}`);
            console.log(`Cart weight: ${cart.reduce((total, item) => total + (item.weight * item.quantity), 0)}kg`);
            
            const result = await DeliveryCalculator.calculate(
                testCase.address,
                testCase.method,
                cart
            );
            
            console.log(`✅ Result:`);
            console.log(`   Cost: Rp ${result.cost.toLocaleString('id-ID')}`);
            console.log(`   Provider: ${result.provider}`);
            console.log(`   Zone: ${result.zone?.name || 'Unknown'}`);
            console.log(`   Base Rate: Rp ${result.breakdown.baseRate.toLocaleString('id-ID')}`);
            console.log(`   Weight Charge: Rp ${result.breakdown.weightCharge.toLocaleString('id-ID')}`);
            console.log(`   Surcharges: Rp ${result.breakdown.surcharges.toLocaleString('id-ID')}`);
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Custom delivery calculation test completed!');
    console.log('No more scraping errors - using our own formula! 🎉');
}

// Run the test
testCustomDelivery().catch(console.error);