import { useEffect, useState } from 'react';
import { useSettings } from '../../state/settingsStore';

export function useFatiguePrompts(onFatigueCheck: () => void) {
  const { settings } = useSettings();
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    if (!settings.fatigueMonitoringEnabled) return;

    const interval = setInterval(
      () => {
        onFatigueCheck();
      },
      settings.fatigueCheckInterval * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [settings.fatigueMonitoringEnabled, settings.fatigueCheckInterval, onFatigueCheck]);
}
