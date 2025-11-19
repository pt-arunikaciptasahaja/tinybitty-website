import fs from 'fs/promises';

// Known accurate coordinates from official sources
const knownCoordinates = {
  "Jakarta Selatan": {
    "Kebayoran Baru": {
      "Senayan": { lat: -6.2278, lng: 106.8025, source: "Google Maps/Google Places" },
      "Gandaria Utara": { lat: -6.2325, lng: 106.8062, source: "OpenStreetMap" },
      "Cipete Utara": { lat: -6.2447, lng: 106.8170, source: "Google Maps" }
    },
    "Cilandak": {
      "Pondok Labu": { lat: -6.2912, lng: 106.7801, source: "Google Maps" },
      "Cilandak Barat": { lat: -6.2877, lng: 106.7845, source: "OpenStreetMap" }
    },
    "Pancoran": {
      "Kalibata": { lat: -6.2089, lng: 106.8500, source: "Google Maps" }
    }
  },
  "Jakarta Pusat": {
    "Gambir": {
      "Gambir": { lat: -6.1754, lng: 106.8272, source: "Wikipedia/Monas Area" },
      "Cideng": { lat: -6.1815, lng: 106.8183, source: "Google Maps" }
    },
    "Tanah Abang": {
      "Bendungan Hilir": { lat: -6.2018, lng: 106.8179, source: "Google Maps" }
    }
  },
  "Jakarta Timur": {
    "Jatinegara": {
      "Bali Mester": { lat: -6.2280, lng: 106.8960, source: "Google Maps" }
    }
  },
  "Jakarta Barat": {
    "Grogol Petamburan": {
      "Grogol": { lat: -6.1692, lng: 106.7895, source: "Google Maps" },
      "Tomang": { lat: -6.1744, lng: 106.7892, source: "Google Maps" }
    }
  },
  "Jakarta Utara": {
    "Kelapa Gading": {
      "Kelapa Gading Barat": { lat: -6.1181, lng: 106.9067, source: "Google Maps" },
      "Kelapa Gading Timur": { lat: -6.1257, lng: 106.9123, source: "Google Maps" }
    },
    "Penjaringan": {
      "Pluit": { lat: -6.1083, lng: 106.7952, source: "Google Maps" }
    }
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getAccuracy(distance) {
  if (distance < 0.5) return 'Excellent';
  if (distance < 1) return 'Very Good';
  if (distance < 2) return 'Good';
  if (distance < 5) return 'Fair';
  return 'Poor';
}

async function manualVerification() {
  console.log('Manual coordinate verification using known landmarks...\n');
  
  const generatedData = JSON.parse(await fs.readFile('kelurahan-with-latlng.json', 'utf8'));
  const verificationResults = [];
  let totalSamples = 0;
  
  for (const [city, districts] of Object.entries(knownCoordinates)) {
    if (!generatedData[city]) continue;
    
    for (const [district, locations] of Object.entries(districts)) {
      if (!generatedData[city][district]) continue;
      
      for (const [kelurahan, knownCoord] of Object.entries(locations)) {
        if (!generatedData[city][district][kelurahan]) continue;
        
        const generated = generatedData[city][district][kelurahan];
        const distance = calculateDistance(
          generated.lat, generated.lng,
          knownCoord.lat, knownCoord.lng
        );
        
        const accuracy = getAccuracy(distance);
        
        verificationResults.push({
          city,
          district,
          kelurahan,
          generated: { lat: generated.lat, lng: generated.lng },
          reference: { lat: knownCoord.lat, lng: knownCoord.lng, source: knownCoord.source },
          distance_km: distance,
          accuracy
        });
        
        console.log(`${kelurahan}, ${district}, ${city}:`);
        console.log(`  Generated:  ${generated.lat}, ${generated.lng}`);
        console.log(`  Reference:  ${knownCoord.lat}, ${knownCoord.lng} (${knownCoord.source})`);
        console.log(`  Distance:   ${distance.toFixed(2)} km - ${accuracy}`);
        console.log('');
        
        totalSamples++;
      }
    }
  }
  
  // Generate summary statistics
  const accuracyCounts = verificationResults.reduce((acc, result) => {
    acc[result.accuracy] = (acc[result.accuracy] || 0) + 1;
    return acc;
  }, {});
  
  const avgDistance = verificationResults.reduce((sum, r) => sum + r.distance_km, 0) / verificationResults.length;
  
  const report = {
    timestamp: new Date().toISOString(),
    total_samples: totalSamples,
    results: verificationResults,
    accuracy_summary: accuracyCounts,
    average_distance_km: avgDistance,
    recommendations: generateRecommendations(accuracyCounts, avgDistance)
  };
  
  await fs.writeFile('coordinate-accuracy-report.json', JSON.stringify(report, null, 2));
  
  console.log('=== ACCURACY ASSESSMENT ===');
  console.log(`Total samples verified: ${totalSamples}`);
  console.log('Accuracy distribution:');
  Object.entries(accuracyCounts).forEach(([accuracy, count]) => {
    console.log(`  ${accuracy}: ${count} samples (${((count/totalSamples)*100).toFixed(1)}%)`);
  });
  console.log(`Average distance error: ${avgDistance.toFixed(2)} km`);
  console.log(`\nDetailed report saved to: coordinate-accuracy-report.json`);
  
  return report;
}

function generateRecommendations(accuracyCounts, avgDistance) {
  const recommendations = [];
  
  if (accuracyCounts['Poor'] > 2 || avgDistance > 3) {
    recommendations.push('Consider regenerating coordinates with more accurate reference points');
  }
  
  if (accuracyCounts['Fair'] > accuracyCounts['Good']) {
    recommendations.push('Coordinates are reasonably accurate but could be improved with better reference data');
  }
  
  if (accuracyCounts['Excellent'] >= accuracyCounts['Good']) {
    recommendations.push('Generated coordinates show good accuracy overall');
  }
  
  recommendations.push('For production use, consider manual verification of critical locations');
  recommendations.push('Use government or official geographic databases when available');
  
  return recommendations;
}

manualVerification().catch(console.error);