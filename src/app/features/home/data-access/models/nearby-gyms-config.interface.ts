export interface NearbyGymConfig {
  id: string;
  name: string;
  hoursLabel?: string;
  distanceLabel?: string;
  ratingLabel?: string;
}

export interface NearbyGymsConfig {
  title: string;
  locationLabel?: string;
  emptyLabel: string;
  gyms?: readonly NearbyGymConfig[];
}
