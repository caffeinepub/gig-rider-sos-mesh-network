export const HAZARD_TYPES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'spill', label: 'Oil/Water Spill' },
  { value: 'low-visibility', label: 'Low Visibility' },
  { value: 'construction', label: 'Construction' },
  { value: 'debris', label: 'Road Debris' },
  { value: 'other', label: 'Other' },
] as const;

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-yellow-600' },
  { value: 'medium', label: 'Medium', color: 'text-orange-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
] as const;

export function getHazardTypeLabel(type: string): string {
  return HAZARD_TYPES.find((t) => t.value === type)?.label || type;
}

export function getSeverityLabel(severity: string): string {
  return SEVERITY_LEVELS.find((s) => s.value === severity)?.label || severity;
}
