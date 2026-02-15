import { useState, useEffect } from 'react';

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function usePermissionStatus() {
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  const [motionPermission, setMotionPermission] = useState<PermissionState>('unsupported');

  useEffect(() => {
    // Check location permission
    if (navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as PermissionState);
        result.addEventListener('change', () => {
          setLocationPermission(result.state as PermissionState);
        });
      });
    } else if (navigator.geolocation) {
      setLocationPermission('prompt');
    } else {
      setLocationPermission('unsupported');
    }

    // Check motion permission (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined') {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        setMotionPermission('prompt');
      } else {
        setMotionPermission('granted');
      }
    } else {
      setMotionPermission('unsupported');
    }
  }, []);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission('granted'),
        () => setLocationPermission('denied')
      );
    }
  };

  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setMotionPermission(permission === 'granted' ? 'granted' : 'denied');
      } catch (error) {
        setMotionPermission('denied');
      }
    }
  };

  return {
    locationPermission,
    motionPermission,
    requestLocationPermission,
    requestMotionPermission,
  };
}
