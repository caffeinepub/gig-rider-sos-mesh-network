import { useParams } from '@tanstack/react-router';
import { Shield, MapPin, Clock, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import type { SOSEventView, SOSStatus } from '../backend';

export default function SOSStatusPage() {
  const { sosId } = useParams({ from: '/sos/$sosId' });
  const { actor } = useActor();

  const { data: sosEvent, isLoading, error } = useQuery<SOSEventView>({
    queryKey: ['sosStatus', sosId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSOSStatus(BigInt(sosId));
    },
    enabled: !!actor && !!sosId,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <p className="text-center text-muted-foreground">Loading SOS status...</p>
      </div>
    );
  }

  if (error || !sosEvent) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load SOS status. The event may not exist yet (still syncing), or there was a connection error. Please try refreshing in a moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusVariant = (status: SOSStatus): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'active':
      case 'sent':
        return 'destructive';
      case 'ended':
        return 'secondary';
      case 'queued':
        return 'outline';
      default:
        return 'default';
    }
  };

  const statusVariant = getStatusVariant(sosEvent.status);
  const lastBreadcrumb = sosEvent.breadcrumbs[sosEvent.breadcrumbs.length - 1];

  return (
    <div className="container max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <Shield className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight">SOS Status</h1>
        <p className="mt-2 text-muted-foreground">Emergency event information</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event #{sosEvent.id.toString()}</CardTitle>
            <Badge variant={statusVariant}>{sosEvent.status.toUpperCase()}</Badge>
          </div>
          <CardDescription>
            Started {new Date(Number(sosEvent.startTime) / 1000000).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sosEvent.note && (
            <div>
              <p className="text-sm font-medium">Note:</p>
              <p className="text-sm text-muted-foreground">{sosEvent.note}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">User ID:</span>
              <span className="font-mono text-xs">{sosEvent.userId.toString().slice(0, 20)}...</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Start Time:</span>
              <span>{new Date(Number(sosEvent.startTime) / 1000000).toLocaleString()}</span>
            </div>

            {sosEvent.endTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">End Time:</span>
                <span>{new Date(Number(sosEvent.endTime) / 1000000).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {lastBreadcrumb && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-destructive" />
              Last Known Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Latitude</p>
                <p className="font-mono text-muted-foreground">{lastBreadcrumb.latitude.toFixed(6)}</p>
              </div>
              <div>
                <p className="font-medium">Longitude</p>
                <p className="font-mono text-muted-foreground">{lastBreadcrumb.longitude.toFixed(6)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(Number(lastBreadcrumb.timestamp) / 1000000).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {sosEvent.breadcrumbs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb Trail</CardTitle>
            <CardDescription>
              {sosEvent.breadcrumbs.length} location{sosEvent.breadcrumbs.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sosEvent.breadcrumbs.slice().reverse().map((breadcrumb, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-4 text-sm">
                      <span className="font-mono">
                        {breadcrumb.latitude.toFixed(6)}, {breadcrumb.longitude.toFixed(6)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(breadcrumb.timestamp) / 1000000).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
