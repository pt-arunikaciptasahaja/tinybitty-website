// SOLUTION: Simple address fix for geocoding issue
// Replace the generateFullAddress function in OrderForm.tsx (around line 149)

// FIND THIS CODE IN OrderForm.tsx:
// (lines 149-195 approximately)

  // Helper function to generate full address string for delivery calculation
  const generateFullAddress = () => {
    const parts = [];
    
    // Prioritize specific location details first (better for geocoding)
    if (detailedAddress && detailedAddress.trim()) {
      parts.push(detailedAddress.trim());
    }
    
    // Add kecamatan (subdistrict) - this provides good geographical specificity
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
    
    // Add kelurahan if it's significantly different from kecamatan
    if (selectedKelurahan && wilayahData.kelurahan[selectedKelurahan]) {
      const kelurahanName = wilayahData.kelurahan[selectedKelurahan];
      const kecamatanName = wilayahData.kecamatan[selectedKecamatan];
      
      // Only add kelurahan if it's not the same as kecamatan
      if (kelurahanName !== kecamatanName) {
        parts.push(kelurahanName);
      }
    }
    
    // Add simplified province
    if (selectedProvinsi && wilayahData.provinsi[selectedProvinsi]) {
      const provinsiName = wilayahData.provinsi[selectedProvinsi]
        .replace(/Daerah Khusus Ibukota /g, '');
      parts.push(provinsiName);
    }
    
    // Ensure we always have Indonesia at the end
    if (!parts.join(', ').toLowerCase().includes('indonesia')) {
      parts.push('Indonesia');
    }
    
    return parts.join(', ');
  };

// REPLACE IT WITH THIS:

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

// EXPLANATION:
// 1. Removed the detailedAddress line that was causing geocoding failures
// 2. Prioritized kelurahan over kecamatan for better precision
// 3. Only uses administrative boundaries that have reliable coordinates

// BEFORE: "jl margonda raya, Jagakarsa, Jakarta Selatan, Lenteng Agung, Jakarta, Indonesia"
// AFTER:  "Lenteng Agung, Jagakarsa, Jakarta Selatan, Indonesia"

// This will generate much cleaner addresses for geocoding!