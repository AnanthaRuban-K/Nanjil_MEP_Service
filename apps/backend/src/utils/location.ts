export interface Coordinates {
  lat: number
  lng: number
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLon = toRad(coord2.lng - coord1.lng)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function estimateArrivalTime(distance: number): string {
  // Assume average speed of 25 km/h in city traffic
  const timeInHours = distance / 25
  const timeInMinutes = Math.ceil(timeInHours * 60)
  
  if (timeInMinutes <= 60) {
    return `${timeInMinutes} minutes`
  } else {
    const hours = Math.floor(timeInMinutes / 60)
    const minutes = timeInMinutes % 60
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minutes` : ''}`
  }
}