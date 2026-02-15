import { Shield, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LastKnownLocationCard from '../features/location/LastKnownLocationCard';
import { useActiveSOS } from '../features/sos/sosState';

export default function HomePage() {
  const activeSOS = useActiveSOS();

  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <img
          src="/assets/generated/rider-silhouette.dim_512x512.png"
          alt="Delivery Rider"
          className="h-32 w-32 object-contain opacity-90"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider SOS Network</h1>
          <p className="mt-2 text-muted-foreground">
            Stay safe on the road with real-time hazard alerts and emergency support
          </p>
        </div>
      </div>

      {activeSOS && (
        <Alert className="mb-6 border-destructive bg-destructive/10">
          <Shield className="h-4 w-4 text-destructive" />
          <AlertDescription className="font-medium">
            SOS Active - Your location is being tracked and shared with emergency contacts
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Emergency SOS
            </CardTitle>
            <CardDescription>
              Quick access to emergency assistance. Tap the SOS button at the bottom to activate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Location tracking starts automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Breadcrumb trail recorded every 30 seconds</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Share status link with emergency contacts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <LastKnownLocationCard />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Safety Features</CardTitle>
            <CardDescription>
              Designed for delivery riders in low-connectivity areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Offline-First</h3>
                <p className="text-sm text-muted-foreground">
                  Works without internet. Data syncs automatically when connection returns.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Hazard Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  Report road hazards to help fellow riders stay safe.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Crash Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic alerts when sudden impacts are detected (where supported).
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Fatigue Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Periodic check-ins to ensure you're alert and safe.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
