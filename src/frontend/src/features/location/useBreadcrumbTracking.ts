import { useEffect, useState } from 'react';
import { useActiveSOS, addBreadcrumbToSOS } from '../sos/sosState';
import { useSettings } from '../../state/settingsStore';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export function useLastKnownLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('unsupported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('denied');
        } else {
          setError('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}

export function useBreadcrumbTracking() {
  const activeSOS = useActiveSOS();
  const { location } = useLastKnownLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (!activeSOS || !location) return;

    const interval = setInterval(
      () => {
        if (location && activeSOS) {
          const sosId = activeSOS.backendId || activeSOS.tempId;
          addBreadcrumbToSOS(sosId, location.latitude, location.longitude);
        }
      },
      settings.breadcrumbInterval * 1000
    );

    return () => clearInterval(interval);
  }, [activeSOS, location, settings.breadcrumbInterval]);
}
