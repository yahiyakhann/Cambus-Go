import { PathPoint, RouteStop } from '../types';

/**
 * Calculates straight-line distance in kilometers between two geo-coordinates
 * using the Haversine formula.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates current coordinate and heading along a polyline given a progress [0..1]
 */
export function getPositionAlongPath(
  points: PathPoint[],
  progress: number
): { x: number; y: number; lat: number; lng: number; heading: number } {
  if (!points || points.length === 0) {
    return { x: 500, y: 300, lat: 17.385, lng: 78.4867, heading: 0 };
  }
  if (points.length === 1) {
    return {
      x: points[0].x,
      y: points[0].y,
      lat: points[0].lat,
      lng: points[0].lng,
      heading: 0,
    };
  }

  // Normalize progress between 0 and 1
  const clamped = Math.max(0, Math.min(1, progress));

  // Compute total segment lengths in SVG pixel space
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  const targetDist = clamped * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segFraction = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const p1 = points[i];
      const p2 = points[i + 1];

      const x = p1.x + (p2.x - p1.x) * segFraction;
      const y = p1.y + (p2.y - p1.y) * segFraction;
      const lat = p1.lat + (p2.lat - p1.lat) * segFraction;
      const lng = p1.lng + (p2.lng - p1.lng) * segFraction;

      const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const heading = (angleRad * 180) / Math.PI + 90; // Rotate heading for SVG bus sprite

      return { x, y, lat, lng, heading };
    }
    accumulated += segLen;
  }

  const last = points[points.length - 1];
  return { x: last.x, y: last.y, lat: last.lat, lng: last.lng, heading: 0 };
}

/**
 * Calculates remaining distance to target boarding stop along the route
 */
export function getRemainingDistanceToStop(
  busLat: number,
  busLng: number,
  targetStop: RouteStop,
  allStops: RouteStop[],
  currentStopIndex: number
): number {
  const targetIdx = allStops.findIndex((s) => s.id === targetStop.id);
  if (targetIdx === -1) {
    return calculateDistanceKm(busLat, busLng, targetStop.lat, targetStop.lng);
  }

  // If bus is behind or at current stop
  if (currentStopIndex <= targetIdx) {
    let dist = calculateDistanceKm(busLat, busLng, allStops[currentStopIndex].lat, allStops[currentStopIndex].lng);
    for (let i = currentStopIndex; i < targetIdx; i++) {
      dist += Math.max(0.1, allStops[i + 1].distanceFromStartKm - allStops[i].distanceFromStartKm);
    }
    return Math.max(0.05, dist);
  }

  // If bus has already passed target stop on this cycle
  return calculateDistanceKm(busLat, busLng, targetStop.lat, targetStop.lng);
}

/**
 * Calculates ETA given distance, vehicle speed, and traffic delay offset
 */
export function calculateETA(
  distanceKm: number,
  speedKmh: number,
  delayMinutes: number = 0
): { minutes: number; formattedText: string } {
  const effectiveSpeed = Math.max(15, speedKmh);
  const travelHours = distanceKm / effectiveSpeed;
  const travelMinutes = travelHours * 60;
  const totalMinutes = Math.round(travelMinutes + delayMinutes);

  if (totalMinutes <= 0 || distanceKm < 0.1) {
    return { minutes: 0, formattedText: 'Arriving Now' };
  }

  if (totalMinutes === 1) {
    return { minutes: 1, formattedText: '1 min' };
  }

  return {
    minutes: totalMinutes,
    formattedText: `${totalMinutes} min`,
  };
}

/**
 * Formats distance into human-friendly string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
