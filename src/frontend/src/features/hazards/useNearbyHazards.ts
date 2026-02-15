import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useLastKnownLocation } from '../location/useBreadcrumbTracking';
import type { Hazard } from '../../backend';

export function useNearbyHazards(radiusKm: number) {
  const { actor } = useActor();
  const { location, error: locationError } = useLastKnownLocation();

  const query = useQuery<Hazard[]>({
    queryKey: ['nearbyHazards', location?.latitude, location?.longitude, radiusKm],
    queryFn: async () => {
      if (!actor || !location) return [];
      return actor.getNearbyHazards(location.latitude, location.longitude, radiusKm);
    },
    enabled: !!actor && !!location,
  });

  return {
    hazards: query.data || [],
    isLoading: query.isLoading,
    error: locationError ? 'Location not available' : query.error ? 'Failed to load hazards' : null,
  };
}
