import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  breadcrumbInterval: number;
  crashDetectionEnabled: boolean;
  crashThreshold: number;
  fatigueMonitoringEnabled: boolean;
  fatigueCheckInterval: number;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  breadcrumbInterval: 30,
  crashDetectionEnabled: true,
  crashThreshold: 2.5,
  fatigueMonitoringEnabled: true,
  fatigueCheckInterval: 60,
};

// Clamp crash threshold to safe range
const clampCrashThreshold = (value: number): number => {
  return Math.max(1.5, Math.min(5.0, value));
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => {
          const newSettings = { ...state.settings, ...updates };
          
          // Validate and clamp crashThreshold if it's being updated
          if (updates.crashThreshold !== undefined) {
            newSettings.crashThreshold = clampCrashThreshold(updates.crashThreshold);
          }
          
          return { settings: newSettings };
        }),
    }),
    {
      name: 'rider-sos-settings',
    }
  )
);
