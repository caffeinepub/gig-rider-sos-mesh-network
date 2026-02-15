export function generateSOSShareLink(sosId: bigint): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/sos/${sosId.toString()}`;
}
