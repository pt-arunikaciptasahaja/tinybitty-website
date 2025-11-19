import { kelurahanData } from './kelurahan-data.js';
import fs from 'fs/promises';

const BASE_URL = 'https://nominatim.openstreetmap.org/search';

async function geocode(q) {
  const url = `${BASE_URL}?format=json&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      // identify your app, Nominatim requires this
      'User-Agent': 'Kelurahan-Geocoder/1.0 (your-email@example.com)'
    }
  });

  if (!res.ok) {
    console.error('HTTP error for', q, res.status);
    return null;
  }

  const data = await res.json();
  if (!data || data.length === 0) {
    console.warn('No result for', q);
    return null;
  }

  // Take first result
  const { lat, lon } = data[0];
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lon)
  };
}

async function main() {
  const result = {};

  for (const [kota, kecamatans] of Object.entries(kelurahanData)) {
    result[kota] = {};
    for (const [kec, kelList] of Object.entries(kecamatans)) {
      result[kota][kec] = {};
      for (const kel of kelList) {
        const query = `${kel}, ${kec}, ${kota}, Jakarta, Indonesia`;
        console.log('Geocoding:', query);

        const coords = await geocode(query);
        result[kota][kec][kel] = coords; // may be null if not found

        // be polite to Nominatim – 1 sec delay
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  await fs.writeFile(
    'kelurahan-with-latlng.json',
    JSON.stringify(result, null, 2),
    'utf8'
  );

  console.log('Done. Saved to kelurahan-with-latlng.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
