// geocode-kelurahan.js
// One-click DKI Jakarta kelurahan geocoder using Google Maps Geocoding API.
// Requires: Node.js 18+ (built-in fetch) and an environment variable GOOGLE_MAPS_API_KEY.

const fs = require('fs');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('❌ Please set GOOGLE_MAPS_API_KEY env var before running.');
  console.error('Example: GOOGLE_MAPS_API_KEY=YOUR_KEY node geocode-kelurahan.js');
  process.exit(1);
}

// Full kelurahan data (DKI Jakarta) – 267 kelurahan total
const kelurahanData = {
  "Jakarta Selatan": {
    "Cilandak": ["Cilandak Barat","Cipete Selatan","Gandaria Selatan","Lebak Bulus","Pondok Labu"],
    "Jagakarsa": ["Ciganjur","Cipedak","Jagakarsa","Lenteng Agung","Srengseng Sawah","Tanjung Barat"],
    "Kebayoran Baru": ["Cipete Utara","Gandaria Utara","Gunung","Kramat Pela","Melawai","Petogogan","Pulo","Rawa Barat","Selong","Senayan"],
    "Kebayoran Lama": ["Cipulir","Grogol Selatan","Grogol Utara","Kebayoran Lama Selatan","Kebayoran Lama Utara","Pondok Pinang"],
    "Mampang Prapatan": ["Bangka","Kuningan Barat","Mampang Prapatan","Pela Mampang","Tegal Parang"],
    "Pancoran": ["Cikoko","Duren Tiga","Kalibata","Pancoran","Pengadegan","Rawajati"],
    "Pasar Minggu": ["Cilandak Timur","Jati Padang","Kebagusan","Pasar Minggu","Pejaten Barat","Pejaten Timur","Ragunan"],
    "Pesanggrahan": ["Bintaro","Pesanggrahan","Petukangan Selatan","Petukangan Utara","Ulujami"],
    "Setiabudi": ["Guntur","Karet Semanggi","Karet","Karet Kuningan","Kuningan Timur","Menteng Atas","Pasar Manggis","Setiabudi"],
    "Tebet": ["Bukit Duri","Kebon Baru","Manggarai","Manggarai Selatan","Menteng Dalam","Tebet Barat","Tebet Timur"]
  },
  "Jakarta Timur": {
    "Cakung": ["Cakung Barat","Cakung Timur","Jatinegara","Penggilingan","Pulo Gebang","Rawa Terate","Ujung Menteng"],
    "Cipayung": ["Bambu Apus","Cilangkap","Cipayung","Lubang Buaya","Munjul","Pondok Ranggon","Setu"],
    "Ciracas": ["Cibubur","Ciracas","Kelapa Dua Wetan","Rambutan","Susukan"],
    "Duren Sawit": ["Duren Sawit","Klender","Malaka Jaya","Malaka Sari","Pondok Bambu","Pondok Kelapa","Pondok Kopi"],
    "Jatinegara": ["Bali Mester","Bidara Cina","Cipinang Besar Selatan","Cipinang Besar Utara","Cipinang Cempedak","Cipinang Muara","Kampung Melayu","Rawa Bunga"],
    "Kramat Jati": ["Batu Ampar","Cawang","Cililitan","Dukuh","Kramat Jati","Tengah"],
    "Makasar": ["Cipinang Melayu","Halim Perdana Kusuma","Kebon Pala","Makasar","Pinang Ranti"],
    "Matraman": ["Kayu Manis","Kebon Manggis","Pal Meriam","Pisangan Baru","Utan Kayu Selatan","Utan Kayu Utara"],
    "Pasar Rebo": ["Baru","Cijantung","Gedong","Kalisari","Pekayon"],
    "Pulogadung": ["Cipinang Baru","Jati","Jatinegara Kaum","Kayu Putih","Pisangan Timur","Rawamangun"]
  },
  "Jakarta Barat": {
    "Cengkareng": ["Cengkareng Barat","Cengkareng Timur","Duri Kosambi","Kapuk","Kedaung Kali Angke","Rawa Buaya"],
    "Grogol Petamburan": ["Grogol","Jelambar","Jelambar Baru","Tanjung Duren Selatan","Tanjung Duren Utara","Tomang"],
    "Kalideres": ["Kalideres","Kamal","Pegadungan","Semanan","Tegal Alur"],
    "Kebon Jeruk": ["Duri Kepa","Kedoya Selatan","Kedoya Utara","Kebon Jeruk","Kelapa Dua","Sukabumi Selatan","Sukabumi Utara"],
    "Kembangan": ["Joglo","Kembangan Selatan","Kembangan Utara","Meruya Selatan","Meruya Utara","Srengseng"],
    "Palmerah": ["Gelora","Jatipulo","Kemanggisan","Kota Bambu Selatan","Kota Bambu Utara","Slipi"],
    "Tambora": ["Angke","Duri Selatan","Duri Utara","Jembatan Besi","Jembatan Lima","Kali Anyar","Krendang","Pekojan","Roa Malaka","Tambora","Tanah Sereal"],
    "Taman Sari": ["Glodok","Kresek","Maphar","Pinangsia","Tangki","Keagungan","Mangga Besar","Taman Sari"]
  },
  "Jakarta Utara": {
    "Cilincing": ["Cilincing","Kalibaru","Kali Baru Barat","Marunda","Rorotan","Semper Barat","Semper Timur","Sukapura"],
    "Kelapa Gading": ["Kelapa Gading Barat","Kelapa Gading Timur","Pegangsaan Dua"],
    "Koja": ["Koja","Rawa Badak Selatan","Rawa Badak Utara","Tugu Selatan","Tugu Utara","Lagoa"],
    "Pademangan": ["Ancol","Pademangan Barat","Pademangan Timur"],
    "Penjaringan": ["Kamal Muara","Kapuk Muara","Pejagalan","Penjaringan","Pluit"],
    "Tanjung Priok": ["Kebon Bawang","Papanggo","Sungai Bambu","Sunter Agung","Sunter Jaya","Tanjung Priok"]
  },
  "Jakarta Pusat": {
    "Cempaka Putih": ["Cempaka Putih Barat","Cempaka Putih Timur","Rawasari"],
    "Gambir": ["Cideng","Duri Pulo","Gambir","Kebon Kelapa","Petojo Selatan","Petojo Utara"],
    "Johar Baru": ["Galur","Johar Baru","Kampung Rawa","Tanah Tinggi"],
    "Kemayoran": ["Cempaka Baru","Gunung Sahari Selatan","Harapan Mulya","Kemayoran","Kebon Kosong","Serdang","Sumur Batu","Utan Panjang"],
    "Menteng": ["Gondangdia","Kebon Sirih","Cikini","Menteng","Pegangsaan"],
    "Sawah Besar": ["Gunung Sahari Utara","Karang Anyar","Kartini","Mangga Dua Selatan","Pasar Baru"],
    "Senen": ["Bungur","Kenari","Kramat","Kwitang","Paseban","Senen"],
    "Tanah Abang": ["Bendungan Hilir","Gelora","Kampung Bali","Karet Tengsin","Kebon Kacang","Kebon Melati","Petamburan"]
  }
};

// Map kota name -> full city label for the address
const CITY_NAME_MAP = {
  "Jakarta Selatan": "Kota Jakarta Selatan",
  "Jakarta Timur": "Kota Jakarta Timur",
  "Jakarta Barat": "Kota Jakarta Barat",
  "Jakarta Utara": "Kota Jakarta Utara",
  "Jakarta Pusat": "Kota Jakarta Pusat"
};

// Count kelurahan to be extra sure we only hit 267
function countKelurahan(data) {
  let count = 0;
  for (const kecamatans of Object.values(data)) {
    for (const kelList of Object.values(kecamatans)) {
      count += kelList.length;
    }
  }
  return count;
}

const totalKelurahan = countKelurahan(kelurahanData);
console.log(`📍 Total kelurahan to geocode: ${totalKelurahan}`);
if (totalKelurahan !== 267) {
  console.warn('⚠️ Warning: expected 267 kelurahan. Check your data if this seems wrong.');
}

// Build a precise address string for Google Geocoding
function buildAddress(kelurahan, kecamatan, kota) {
  const kotaFull = CITY_NAME_MAP[kota] || kota;
  return `${kelurahan}, ${kecamatan}, ${kotaFull}, DKI Jakarta, Indonesia`;
}

// Call Google Geocoding API for one address
async function geocode(address) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('❌ HTTP error for', address, res.status);
    return null;
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0 || data.status !== 'OK') {
    console.warn('⚠️ No geocoding result for:', address, 'status:', data.status);
    return null;
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

async function main() {
  const output = {};
  let requestCount = 0;

  for (const [kota, kecamatans] of Object.entries(kelurahanData)) {
    output[kota] = {};
    for (const [kecamatan, kelurahans] of Object.entries(kecamatans)) {
      output[kota][kecamatan] = {};
      for (const kelurahan of kelurahans) {
        requestCount++;
        const address = buildAddress(kelurahan, kecamatan, kota);
        console.log(`(${requestCount}/${totalKelurahan}) Geocoding: ${address}`);

        const coords = await geocode(address);
        output[kota][kecamatan][kelurahan] = coords; // can be null if not found

        // Safety: if for some reason count overshoots, stop
        if (requestCount >= totalKelurahan) {
          console.log('Reached total expected kelurahan count, stopping requests.');
          break;
        }

        // Gentle delay (~200 ms) – total time still well within a minute
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  fs.writeFileSync(
    'kelurahan-with-latlng-google.json',
    JSON.stringify(output, null, 2),
    'utf8'
  );

  console.log('✅ Done. Saved to kelurahan-with-latlng-google.json');
  console.log(`Total requests sent: ${requestCount}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
