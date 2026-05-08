/**
 * Calculates speed in km/h between two positions using the Haversine formula.
 * @param {{ lat: number, lng: number }} pos1 - Previous position
 * @param {{ lat: number, lng: number }} pos2 - Current position
 * @param {number} timeDiffSeconds - Time elapsed in seconds
 * @returns {number} Speed in km/h
 */
export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) *
      Math.cos(toRad(pos2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // distance in km
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return speedKmh;
}
