// COMPLETE FIX: OrderForm.tsx with address normalization
// This replaces the problematic generateFullAddress function

// REPLACE THIS FUNCTION IN YOUR OrderForm.tsx (around line 149):

// Helper function to generate administrative address for delivery calculation
// Focus on administrative boundaries only, not detailed streets
const generateFullAddress = () => {
  const parts = [];
  
  // Add kelurahan first (most specific administrative unit)
  if (selectedKelurahan && wilayahData.kelurahan[selectedKelurahan]) {
    parts.push(wilayahData.kelurahan[selectedKelurahan]);
  }
  
  // Add kecamatan (always needed for context)
  if (selectedKecamatan && wilayahData.kecamatan[selectedKecamatan]) {
    parts.push(wilayahData.kecamatan[selectedKecamatan]);
  }
  
  // Add kota but simplify the name
  if (selectedKota && wilayahData.kota[selectedKota]) {
    const kotaName = wilayahData.kota[selectedKota]
      .replace(/Kota Administrasi /g, '')
      .replace(/Kabupaten /g, '');
    parts.push(kotaName);
  }
  
  // Add simplified province
  if (selectedProvinsi && wilayahData.provinsi[selectedProvinsi]) {
    const provinsiName = wilayahData.provinsi[selectedProvinsi]
      .replace(/Daerah Khusus Ibukota /g, '');
    parts.push(provinsiName);
  }
  
  // Always end with Indonesia for better geocoding
  parts.push('Indonesia');
  
  return parts.join(', ');
};

// ALSO ADD THIS HELPER FUNCTION:
// Get address data for distance calculation
const getAddressForCalculation = () => {
  return {
    kelurahanId: selectedKelurahan || null,
    kecamatanId: selectedKecamatan || null,
    administrativeAddress: generateFullAddress()
  };
};

// USAGE EXAMPLE:
// Instead of: calculateShippingCost(fullAddress, deliveryMethod, cart)
// Use: calculateShippingCost(getAddressForCalculation().administrativeAddress, deliveryMethod, cart)

// KEY CHANGES:
// 1. Removed detailedAddress from address generation
// 2. Prioritized kelurahan over kecamatan
// 3. Simplified province names
// 4. Always end with "Indonesia"