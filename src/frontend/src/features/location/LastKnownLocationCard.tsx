import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLastKnownLocation } from './useBreadcrumbTracking';

export default function LastKnownLocationCard() {
  const { location, error } = useLastKnownLocation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-destructive" />
          Current Location
        </CardTitle>
        <CardDescription>Your last known position</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error === 'denied'
                ? 'Location permission denied. Enable in Settings to use tracking features.'
                : 'Unable to access location. Check device settings and permissions.'}
            </AlertDescription>
          </Alert>
        ) : location ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Latitude</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {location.latitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Longitude</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {new Date(location.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Requesting location...</p>
        )}
      </CardContent>
    </Card>
  );
}
