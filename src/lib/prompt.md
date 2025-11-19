1. Geocoding Rules

Use Kelurahan-level addresses only.
Ignore street names, building names, or house numbers.

Valid examples:

Pulo, Kebayoran Baru, Jakarta Selatan

Cempaka Putih, Jakarta Pusat

Lenteng Agung, Jagakarsa, Jakarta Selatan

Invalid examples (must be stripped):

Jalan Mawar No. 12, Pulo…

Gg. Haji Ipin…

asdsadasd ← return “address not found”

Behavior:

If user enters a full address: strip down to Kelurahan + Kecamatan + Kota + Province

If geocode fails after retries → return error:

"error": "ADDRESS_NOT_FOUND"

📍 2. Origin Address (Constant)

Use Pesona Mungil, Pesona Khayangan, Mekar Jaya, Depok
Coordinates fixed.

🧭 3. Distance Calculation

Use OSRM or Haversine to compute approximate distance.

Return JSON:

{
  "distance_km": 23.1
}


Distance is rounded to one decimal place.

💰 4. Delivery Pricing — Now Uses RANGES

Because distances are estimated (Kelurahan-level), the pricing must also be estimated, not exact.

Base formulas (same as before):

GoSend Instant: distance_km × 4000

GoSend Same Day: distance_km × 3000

GrabExpress Instant: distance_km × 4200

📏 5. Price Range Rules (NEW)
Generate a range instead of a single number:

Lower bound:
price × 0.95 (−5%)

Upper bound:
price × 1.10 (+10%)

Example:

If GoSend Instant = 40,000:

Range returned:

GoSend Instant: 38,000 - 44,000

📤 6. JSON Response Format (UPDATED)
{
  "distance_km": 23.1,
  "gosend_instant_range": {
    "min": 38000,
    "max": 44000
  },
  "gosend_same_day_range": {
    "min": 28500,
    "max": 33000
  },
  "grabexpress_instant_range": {
    "min": 39900,
    "max": 46200
  }
}

⚠️ 7. Error Handling Rules
If address cannot be geocoded:

Return:

{
  "error": "ADDRESS_NOT_FOUND",
  "message": "Alamat tidak ditemukan. Harap gunakan nama kelurahan yang valid."
}

If distance cannot be computed:
{
  "error": "DISTANCE_CALCULATION_FAILED"
}

🖥️ 8. Frontend Behavior (UX Rules)
On success:

Display:

Estimated distance

Price range for each courier:

“GoSend Instant: 38rb – 44rb”

“GrabExpress: 40rb – 46rb”

On invalid address:

Show message:

“Alamat tidak ditemukan. Gunakan nama kelurahan yang valid (contoh: Pulo, Kebayoran Baru).”

On missing kelurahan:

Ask user:

“Tolong masukkan nama kelurahan untuk estimasi ongkir.”

🌐 9. Required Data Flow

Clean user input → extract Kelurahan + Kecamatan + Kota + Province

Geocode cleaned address

Calculate distance

Calculate base pricing

Generate price ranges

