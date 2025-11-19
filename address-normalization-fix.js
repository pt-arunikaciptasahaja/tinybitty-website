// Create a fixed version of the address generation function
// Helper function to generate administrative address for delivery calculation
// Focus on administrative boundaries only, not detailed streets
const generateAdministrativeAddress = () => {
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

// Helper function to get coordinates directly from selected IDs
const getCoordinatesFromSelection = () => {
  return {
    kelurahanId: selectedKelurahan || null,
    kecamatanId: selectedKecamatan || null,
    kotaId: selectedKota || null,
    provinsiId: selectedProvinsi || null,
    // Generate clean address string without detailed street info
    administrativeAddress: generateAdministrativeAddress()
  };
};

console.log('Address normalization functions created');