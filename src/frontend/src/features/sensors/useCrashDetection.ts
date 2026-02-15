import { useEffect, useState, useRef } from 'react';
import { useSettings } from '../../state/settingsStore';
import { usePermissionStatus } from '../permissions/usePermissionStatus';

export function useCrashDetection(onCrashDetected: () => void) {
  const { settings } = useSettings();
  const { motionPermission } = usePermissionStatus();
  const [isSupported, setIsSupported] = useState(false);
  const cooldownRef = useRef(false);
  const recentReadingsRef = useRef<number[]>([]);

  useEffect(() => {
    // Only listen when crash detection is enabled AND motion permission is granted
    if (!settings.crashDetectionEnabled) return;
    if (motionPermission !== 'granted') return;

    if (typeof DeviceMotionEvent === 'undefined') {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const handleMotion = (event: DeviceMotionEvent) => {
      // Skip if in cooldown period
      if (cooldownRef.current) return;

      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      const gForce = totalAcceleration / 9.81;

      // Keep a rolling window of recent readings for smoothing
      recentReadingsRef.current.push(gForce);
      if (recentReadingsRef.current.length > 5) {
        recentReadingsRef.current.shift();
      }

      // Require at least 3 samples before checking
      if (recentReadingsRef.current.length < 3) return;

      // Check if current reading exceeds threshold
      if (gForce > settings.crashThreshold) {
        // Confirmation: check if at least 2 of the last 3 readings exceed threshold
        const recentHigh = recentReadingsRef.current.slice(-3).filter(
          (reading) => reading > settings.crashThreshold
        );

        if (recentHigh.length >= 2) {
          // Trigger crash detection
          onCrashDetected();

          // Start cooldown period (10 seconds)
          cooldownRef.current = true;
          recentReadingsRef.current = [];

          setTimeout(() => {
            cooldownRef.current = false;
          }, 10000);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      recentReadingsRef.current = [];
    };
  }, [settings.crashDetectionEnabled, settings.crashThreshold, motionPermission, onCrashDetected]);

  return { isSupported };
}
