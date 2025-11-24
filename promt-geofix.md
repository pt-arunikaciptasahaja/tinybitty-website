You are an expert TypeScript + React engineer.
Build an address search + distance helper similar to Gojek/Grab “where to send” flow, using Nominatim (OpenStreetMap) geocoding.

🎯 Goal

Create a small MVP module where:

User can type area name OR postal code (e.g. "lebak bulus", "12740").

The app calls Nominatim’s search API (no Google, no paid APIs).

The results are limited to Indonesia, and preferably to Java island.

User selects one result from a dropdown suggestion (3–5 items).

The app calculates the distance in km from a fixed origin point:

originLat = -6.3838528

originLng = 106.8420638

The module returns the selected address + distance, which I will later plug into my delivery price (ongkir) calculation.

🌐 Geocoding API (Nominatim) – REQUIRED BEHAVIOR

Use Nominatim’s /search endpoint, via fetch from the frontend (no key needed).

Base URL:
https://nominatim.openstreetmap.org/search

Mandatory query parameters:

format=json

q=<user query> — user’s text (area name or postal code)

countrycodes=id — ONLY Indonesia

addressdetails=1

limit=5 — only top 5 results

viewbox=105,-5.2,115,-8.8 and bounded=1 — to roughly restrict to Java island

Example full URL (for "12740"):

https://nominatim.openstreetmap.org/search?format=json&q=12740&countrycodes=id&addressdetails=1&limit=5&viewbox=105,-5.2,115,-8.8&bounded=1


Technical requirements:

Use fetch with a custom User-Agent header (Nominatim requirement), e.g.:

fetch(url, {
  headers: {
    'User-Agent': 'tinybitty-location-search/1.0 (contact: your-email@example.com)',
    'Accept-Language': 'id,en',
  },
});


Assume max 1 request/second; implement a 300–500 ms debounce on the input to avoid spamming the API.

Handle errors gracefully (show “Tidak ada lokasi ditemukan” / “Terjadi kesalahan, coba lagi” etc.).

🧮 Distance Calculation

After the user selects a result, calculate the distance in kilometers from the constant origin:

const ORIGIN = {
  lat: -6.3838528,
  lng: 106.8420638,
};


Implement a pure function using the Haversine formula:

type LatLng = { lat: number; lng: number };

function calculateDistanceKm(origin: LatLng, destination: LatLng): number {
  // Haversine implementation
  // return distance in kilometers, with ~2 decimal precision
}


Use the lat / lon values returned by Nominatim for the destination.

📦 Data Structures

Define clean TypeScript types:

export type GeocodingResult = {
  lat: number;
  lng: number;
  label: string;         // nicely formatted string from display_name or assembled from address
  raw: any;              // original Nominatim item (optional, for debugging)
};

export type DistanceResult = {
  destination: GeocodingResult;
  distanceKm: number;
};


The main public API of the module should expose at least:

async function searchLocations(query: string): Promise<GeocodingResult[]>;

function calculateDistanceKm(origin: LatLng, destination: LatLng): number;

💻 React UI Requirements

Build a small React component in TypeScript, suitable for a SPA (Vite + React, no backend):

A single input:

Placeholder in Indonesian, e.g.
"Ketik nama area atau kode pos…"

On change: trigger debounced searchLocations(query).

Dropdown suggestions under the input:

Show max 5 items.

Each item shows:

Main label (e.g. "Lebak Bulus")

Secondary line (e.g. "Cilandak, Jakarta Selatan, DKI Jakarta, 12440")

When user clicks an item:

The dropdown closes.

The input is filled with the label.

The component computes distance from ORIGIN using calculateDistanceKm.

The component calls an onSelect callback with { destination, distanceKm }.

onSelect prop example:

type AddressPickerProps = {
  onSelect: (result: DistanceResult) => void;
};


I will use onSelect later to plug into my ongkir calculator, e.g.:

onSelect={(result) => {
  // result.distanceKm -> plug into calculateDeliveryPrice()
}}


Add minimal but clear UI feedback:

Loading state: "Mencari lokasi…"

No results: "Lokasi tidak ditemukan, coba ketik nama area lain."

Error: "Terjadi kesalahan saat mencari lokasi."

🧱 Implementation Style

Use TypeScript everywhere.

Use React hooks (useState, useEffect, etc.).

Encapsulate logic cleanly:

nominatimClient.ts for API calls.

distance.ts for Haversine function.

AddressSearchInput.tsx for the UI component.

Keep the design simple and easy to restyle (Tailwind-friendly class names if needed, but don’t hardcode heavy styling).

✅ Deliverables

nominatimClient.ts

searchLocations(query: string): Promise<GeocodingResult[]>

distance.ts

calculateDistanceKm(origin: LatLng, destination: LatLng): number

AddressSearchInput.tsx

React component with:

debounced search

dropdown suggestions

onSelect(result: DistanceResult) callback

Short usage example in a parent component showing how to:

Render <AddressSearchInput />

Log distanceKm & destination.label

(Ongkir logic will be added later by me)

Make sure the output is ready to drop into a Vite + React + TS project.