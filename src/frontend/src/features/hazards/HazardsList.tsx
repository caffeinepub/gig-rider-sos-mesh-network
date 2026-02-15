import { useState } from 'react';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNearbyHazards } from './useNearbyHazards';
import { getHazardTypeLabel, getSeverityLabel } from './hazardTypes';

export default function HazardsList() {
  const [radiusKm, setRadiusKm] = useState(5);
  const { hazards, isLoading, error } = useNearbyHazards(radiusKm);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Settings</CardTitle>
          <CardDescription>Adjust search radius for nearby hazards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Search Radius: {radiusKm} km</Label>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[radiusKm]}
              onValueChange={([value]) => setRadiusKm(value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading hazards...</p>
      ) : hazards.length === 0 ? (
        <Alert>
          <AlertDescription>
            No hazards reported in this area. Stay safe and report any dangers you encounter.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {hazards.map((hazard) => (
            <Card key={hazard.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {getHazardTypeLabel(hazard.hazardType)}
                  </CardTitle>
                  <Badge
                    variant={
                      hazard.severity === 'high'
                        ? 'destructive'
                        : hazard.severity === 'medium'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {getSeverityLabel(hazard.severity)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {hazard.description && (
                  <p className="text-sm text-muted-foreground">{hazard.description}</p>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">
                      {hazard.location.latitude.toFixed(6)}, {hazard.location.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Reported {new Date(Number(hazard.timestamp) / 1000000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
