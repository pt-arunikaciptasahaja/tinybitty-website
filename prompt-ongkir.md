Get lat/lng for origin & destination

Use a Haversine function to get distance in km

Feed that distance into calculateOngkir

I’ll show you exactly how in TypeScript.

1. Decide where your coordinates come from

You already have fixed origin:

// Example: your pickup point in DKI Jakarta
export const ORIGIN_COORD = {
  lat: -6.3838528,
  lng: 106.8420638,
};


For destination, you have two main options (no Google API needed):

Best for DKI-only:
Make a small JSON mapping kelurahanId -> { lat, lng }
(You only serve DKI Jakarta anyway, so you can pre-store 267 kelurahan coordinates from any source.)

// destinationCoords.ts
export interface LatLng {
  lat: number;
  lng: number;
}

export const KELURAHAN_COORDS: Record<string, LatLng> = {
  'kelurahan_id_1': { lat: -6.2, lng: 106.8 },
  'kelurahan_id_2': { lat: -6.21, lng: 106.83 },
  // ...
};


Then in your form, when user selects province / kota / kecamatan / kelurahan, you’ll have a kelurahan_id → look up its coords from this map.

2. Haversine distance helper (TS, drop-in)

Create a small helper for distance:

// distanceHelpers.ts

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Returns distance in kilometers between two coordinates using Haversine formula.
 */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius in km

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const haversine =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  const distance = R * c;

  // You can choose to round here if you like:
  return Number(distance.toFixed(2)); // e.g. 2 decimal places
}


Usage:

import { haversineDistanceKm, LatLng } from './distanceHelpers';
import { calculateOngkir, OngkirService } from './ongkirHelpers';
import { ORIGIN_COORD } from './config';

// Example: from origin to selected kelurahan
function getOngkirForKelurahan(
  service: OngkirService,
  dest: LatLng
) {
  const distanceKm = haversineDistanceKm(ORIGIN_COORD, dest);
  const result = calculateOngkir(service, distanceKm);
  return { distanceKm, result };
}

3. Wiring it into your React form flow

Rough sketch with your dropdown:

// OngkirEstimator.tsx
import { useMemo } from 'react';
import { haversineDistanceKm } from './distanceHelpers';
import { calculateOngkir, ONGKIR_NOTE, OngkirService } from './ongkirHelpers';
import { ORIGIN_COORD } from './config';
import { KELURAHAN_COORDS } from './destinationCoords';

interface Props {
  selectedKelurahanId: string | null;
  service: OngkirService;
}

export function OngkirEstimator({ selectedKelurahanId, service }: Props) {
  const { distanceKm, ongkirResult } = useMemo(() => {
    if (!selectedKelurahanId) {
      return {
        distanceKm: 0,
        ongkirResult: null,
      };
    }

    const destCoord = KELURAHAN_COORDS[selectedKelurahanId];

    if (!destCoord) {
      return {
        distanceKm: 0,
        ongkirResult: null,
      };
    }

    const distanceKm = haversineDistanceKm(ORIGIN_COORD, destCoord);
    const ongkirResult = calculateOngkir(service, distanceKm);

    return { distanceKm, ongkirResult };
  }, [selectedKelurahanId, service]);

  if (!ongkirResult) {
    return <p className="text-sm text-gray-500">Pilih kelurahan dulu.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm">
        Jarak estimasi:{' '}
        <strong>{distanceKm.toFixed(2)} km</strong>
      </div>

      <div className="text-sm">
        Estimasi ongkir ({service}):{' '}
        <strong>
          Rp {ongkirResult.estimatedCost.toLocaleString('id-ID')}
        </strong>
      </div>

      {ongkirResult.warnings.length > 0 && (
        <ul className="text-xs text-red-500 mt-1">
          {ongkirResult.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-500 mt-2">{ONGKIR_NOTE}</p>
    </div>
  );
}

4. Summary (so it’s clear in your head)

Origin → fixed coord (your kitchen / store).

Destination → coord looked up from kelurahan_id (no Google needed).

distanceKm = haversineDistanceKm(origin, destination)

ongkir = calculateOngkir(service, distanceKm)

Show distance, ongkir, + note:

Perkiraan ongkir. Ongkir final mengikuti aplikasi GoSend/GrabExpress (belum termasuk tol/parkir/tip).