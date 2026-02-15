import { ActiveSOS } from './sosState';

export function formatSOSBluetoothMessage(activeSOS: ActiveSOS, shareLink?: string): string {
  const lines: string[] = [];
  
  // Header
  lines.push('🚨 EMERGENCY SOS ALERT 🚨');
  lines.push('');
  
  // Note
  if (activeSOS.note && activeSOS.note.trim()) {
    lines.push(`Message: ${activeSOS.note}`);
    lines.push('');
  }
  
  // Timestamp
  const startDate = new Date(Number(activeSOS.startTime) / 1000000);
  lines.push(`Started: ${startDate.toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  })}`);
  lines.push('');
  
  // Share link (if available)
  if (shareLink) {
    lines.push('Track status:');
    lines.push(shareLink);
  } else {
    lines.push('Status link will be available once synced.');
  }
  
  return lines.join('\n');
}
