/**
 * GPS Utilities: Kalman filter + OSRM map matching
 */

export interface Coord {
  latitude: number;
  longitude: number;
}

// ── Haversine distance (km) ────────────────────────────────────────
export function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ── 1D Kalman filter for GPS position smoothing ───────────────────
/**
 * Simple adaptive Kalman filter for GPS coordinates.
 * Q: process noise (how fast position changes, in degrees²/s) → small for pedestrian
 * R: measurement noise (GPS accuracy) → varies with each reading
 */
export class KalmanGPS {
  private lat: number;
  private lon: number;
  private pLat: number = 1; // estimate error covariance lat
  private pLon: number = 1; // estimate error covariance lon
  private readonly Q = 1e-7; // process noise: very slow motion (walking/running)

  constructor(initialLat: number, initialLon: number) {
    this.lat = initialLat;
    this.lon = initialLon;
  }

  /**
   * Feed a new GPS reading. Returns smoothed position.
   * @param lat - Raw latitude
   * @param lon - Raw longitude
   * @param accuracyM - GPS accuracy in metres (lower = more accurate)
   */
  update(lat: number, lon: number, accuracyM: number): Coord {
    // Convert accuracy from metres to degrees² (rough approximation)
    // 1° latitude ≈ 111 000 m  →  1 m ≈ 9e-6°
    const metersPerDeg = 111000;
    const R = Math.max(1, accuracyM) / metersPerDeg;
    const R2 = R * R;

    // Predict step: state doesn't change, error grows
    const pLatPred = this.pLat + this.Q;
    const pLonPred = this.pLon + this.Q;

    // Kalman gain (how much to trust new reading vs prediction)
    const kLat = pLatPred / (pLatPred + R2);
    const kLon = pLonPred / (pLonPred + R2);

    // Update estimate
    this.lat += kLat * (lat - this.lat);
    this.lon += kLon * (lon - this.lon);

    // Update error covariance
    this.pLat = (1 - kLat) * pLatPred;
    this.pLon = (1 - kLon) * pLonPred;

    return { latitude: this.lat, longitude: this.lon };
  }

  getPosition(): Coord {
    return { latitude: this.lat, longitude: this.lon };
  }

  reset(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
    this.pLat = 1;
    this.pLon = 1;
  }
}

// ── Speed validation for running ─────────────────────────────────
const MIN_SPEED_MS = 0.3; // 0.3 m/s ≈ 1 km/h (almost still)
const MAX_SPEED_MS = 9.0; // 9 m/s ≈ 32 km/h (top sprint)

/**
 * Validates whether movement between two positions is realistic for running.
 * @param distKm - Haversine distance in km
 * @param elapsedMs - Time elapsed in milliseconds
 */
export function isRealisticMovement(distKm: number, elapsedMs: number): boolean {
  if (elapsedMs <= 0 || distKm <= 0) return false;
  const speedMs = (distKm * 1000) / (elapsedMs / 1000);
  return speedMs >= MIN_SPEED_MS && speedMs <= MAX_SPEED_MS;
}

// ── OSRM map matching ─────────────────────────────────────────────
const OSRM_MATCH_URL = "https://router.project-osrm.org/match/v1/foot";

/**
 * Snap a route (array of coords) to the nearest roads using OSRM.
 * Falls back to original coords on error.
 */
export async function snapRouteToRoads(coords: Coord[]): Promise<Coord[]> {
  if (coords.length < 2) return coords;

  // OSRM accepts max 100 waypoints per request
  const CHUNK = 100;
  if (coords.length > CHUNK) {
    // Process in overlapping chunks and merge
    const result: Coord[] = [];
    for (let i = 0; i < coords.length; i += CHUNK - 1) {
      const chunk = coords.slice(i, i + CHUNK);
      const snapped = await snapChunk(chunk);
      if (i === 0) {
        result.push(...snapped);
      } else {
        result.push(...snapped.slice(1));
      }
    }
    return result;
  }
  return snapChunk(coords);
}

async function snapChunk(coords: Coord[]): Promise<Coord[]> {
  try {
    const coordStr = coords
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(";");
    const radiuses = coords.map(() => 25).join(";");

    const url = `${OSRM_MATCH_URL}/${coordStr}?radiuses=${radiuses}&overview=full&geometries=geojson&annotations=false`;

    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return coords;

    const data = await resp.json();
    if (data.code !== "Ok" || !data.matchings?.length) return coords;

    const geometry = data.matchings[0].geometry;
    if (geometry?.type !== "LineString") return coords;

    return geometry.coordinates.map(([lng, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));
  } catch {
    return coords;
  }
}

// ── Calorie estimation ────────────────────────────────────────────
/**
 * METs-based calorie burn estimation.
 * Walking ≈ 3.5 METs, jogging ≈ 7, running ≈ 9
 */
export function estimateCalories(
  distanceKm: number,
  durationSec: number,
  weightKg = 70
): number {
  if (distanceKm <= 0 || durationSec <= 0) return 0;
  const speedKmh = (distanceKm / durationSec) * 3600;
  let met: number;
  if (speedKmh < 6) met = 3.5;
  else if (speedKmh < 9) met = 7.0;
  else if (speedKmh < 12) met = 9.0;
  else met = 11.0;
  const hours = durationSec / 3600;
  return Math.round(met * weightKg * hours);
}
