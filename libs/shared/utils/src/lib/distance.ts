export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const findNearestTeam = (
  customerLocation: { lat: number; lng: number },
  availableTeams: Array<{
    id: string;
    currentLocation?: { lat: number; lng: number };
    skills: string[];
  }>,
  requiredSkill: string
): { teamId: string; distance: number } | null => {
  const eligibleTeams = availableTeams.filter(
    team => team.skills.includes(requiredSkill) && team.currentLocation
  );

  if (eligibleTeams.length === 0) return null;

  let nearest = eligibleTeams[0];
  let minDistance = calculateDistance(
    customerLocation.lat,
    customerLocation.lng,
    nearest.currentLocation!.lat,
    nearest.currentLocation!.lng
  );

  for (const team of eligibleTeams.slice(1)) {
    const distance = calculateDistance(
      customerLocation.lat,
      customerLocation.lng,
      team.currentLocation!.lat,
      team.currentLocation!.lng
    );

    if (distance < minDistance) {
      nearest = team;
      minDistance = distance;
    }
  }

  return { teamId: nearest.id, distance: minDistance };
};