# 🛵 Shipping Rate Engine – Cursor Instructions
Update and manage the shipping cost engine using the following specifications.
The goal: given a destination address, generate real-world shipping rates using
public routing and deterministic courier formulas.

This prompt REPLACES all previous shipping-related instructions.

---

## 1. ORIGIN (Store Location)
Always use this fixed origin point:

**Origin Address**
Depok, Sukmajaya 16411

Geocode this address via:
https://nominatim.openstreetmap.org/search?format=json&q=<address>

Cache the coordinates.

---

## 2. DISTANCE CALCULATION (REQUIRED)
To compute driving distance between origin and destination, use OSRM:

GET:
http://router.project-osrm.org/route/v1/driving/<ORIGIN_LON>,<ORIGIN_LAT>;<DEST_LON>,<DEST_LAT>?overview=false

Parse:
- routes[0].distance (meters → convert to km)
- routes[0].duration optional

Create util:
`/lib/shipping/distance.ts`

```ts
export async function getDistanceKm(origin: string, destination: string): Promise<number> {
  // geocode origin → lon/lat
  // geocode destination → lon/lat
  // call OSRM
  // return distance in km (number, float)
}
Add geocode cache to reduce API load.

3. SHIPPING FORMULAS
A. GoSend Instant
Rate: Rp 2.500 / km

Minimum charge: Rp 20.000

Maximum distance: 20 km

If distance > 20, return unavailable.

Formula:

ini
Copy code
price = max(20000, distance_km * 2500)
B. GoSend Same Day
Base: Rp 13.000

Additional: Rp 2.000 / km

Minimum: Rp 20.000

Max distance: 40 km (if >40 → unavailable)

Formula:

ini
Copy code
price = max(20000, 13000 + (distance_km * 2000))
C. GrabExpress Instant
Base fee: Rp 10.000

Per km: Rp 2.700

Minimum: Rp 20.000

Maximum distance: 30 km (if >30 → unavailable)

Formula:

ini
Copy code
price = max(20000, 10000 + (distance_km * 2700))
4. TYPE DEFINITIONS
Create:
/lib/shipping/types.ts

ts
Copy code
export type ShippingAvailable = {
  available: true;
  price: number;
};

export type ShippingUnavailable = {
  available: false;
  reason: string;
};

export type ShippingResult = ShippingAvailable | ShippingUnavailable;

export interface ShippingRates {
  distance_km: number;
  gosend_instant: ShippingResult;
  gosend_same_day: ShippingResult;
  grabexpress_instant: ShippingResult;
}
5. MAIN SHIPPING ENGINE
Create:
/lib/shipping/calculate.ts

Implement:

ts
Copy code
export async function calculateShipping(destination: string): Promise<ShippingRates>;
Behavior:

Compute distance.

Apply formulas for each courier.

Return exactly this object shape:

json
Copy code
{
  "distance_km": 17.3,
  "gosend_instant": { "available": true, "price": 20000 },
  "gosend_same_day": { "available": true, "price": 24600 },
  "grabexpress_instant": { "available": true, "price": 25700 }
}
If unavailable:

json
Copy code
{ "available": false, "reason": "Distance exceeds 20 km limit" }
6. SHIPPING API ENDPOINT
Create file:
/app/api/shipping/quote/route.ts

Route:
GET /api/shipping/quote?destination=<string>

Return application/json:

json
Copy code
{
  "distance_km": <number>,
  "gosend_instant": { ... },
  "gosend_same_day": { ... },
  "grabexpress_instant": { ... }
}
Validation:

If destination missing → return 400 error.

7. CODE STYLE REQUIREMENTS
Use TypeScript.

Use async/await everywhere.

Keep functions pure and testable.

Implement geocode caching (simple in-memory Map).

Handle OSRM errors gracefully.

Do not depend on paid APIs.

Structure code clean, modular, predictable.

All output must match the exact JSON shape above.

END OF PROMPT
