import { useState, useEffect } from 'react';
import { Settings, MapPin, Activity, Bluetooth, Database, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '../state/settingsStore';
import { usePermissionStatus } from '../features/permissions/usePermissionStatus';
import BluetoothRelayCard from '../features/bluetooth/BluetoothRelayCard';
import { getQueuedCount } from '../offline/queue';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const {
    breadcrumbInterval,
    crashDetectionEnabled,
    crashThreshold,
    fatigueMonitoringEnabled,
  } = settings;

  const {
    locationPermission,
    motionPermission,
    requestLocationPermission,
    requestMotionPermission,
  } = usePermissionStatus();

  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const loadQueuedCount = async () => {
      try {
        const count = await getQueuedCount();
        setQueuedCount(count);
      } catch (error) {
        console.error('Failed to load queued count:', error);
      }
    };

    loadQueuedCount();
    const interval = setInterval(loadQueuedCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBreadcrumbIntervalChange = (value: number) => {
    updateSettings({ breadcrumbInterval: value });
  };

  const handleCrashDetectionChange = (enabled: boolean) => {
    updateSettings({ crashDetectionEnabled: enabled });
  };

  const handleCrashThresholdChange = (value: number[]) => {
    updateSettings({ crashThreshold: value[0] });
  };

  const handleFatigueMonitoringChange = (enabled: boolean) => {
    updateSettings({ fatigueMonitoringEnabled: enabled });
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data? This cannot be undone.')) {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Cache cleared. Please refresh the page.');
    }
  };

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your safety preferences and permissions
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Platform Limitations</AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-sm">
          <p>
            This app uses modern web technologies that have varying support across platforms:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Location tracking:</strong> Works on all platforms when permission is granted</li>
            <li><strong>Crash detection:</strong> Requires DeviceMotion API (works on most mobile devices)</li>
            <li><strong>Bluetooth relay:</strong> Only works on Chrome/Edge (Android & desktop). Not supported on iOS</li>
            <li><strong>Background operation:</strong> Limited by browser/OS power management</li>
          </ul>
          <p className="mt-2">
            For best results, keep the app open and your screen on during rides.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Services
          </CardTitle>
          <CardDescription>
            Manage location tracking and breadcrumb recording
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location Permission</Label>
              <p className="text-sm text-muted-foreground">
                Status: {locationPermission}
              </p>
            </div>
            {locationPermission !== 'granted' && (
              <Button onClick={requestLocationPermission} variant="outline">
                Request Permission
              </Button>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="breadcrumb-interval">Breadcrumb Interval</Label>
              <p className="text-sm text-muted-foreground">
                Record location every {breadcrumbInterval} seconds during SOS
              </p>
            </div>
            <select
              id="breadcrumb-interval"
              value={breadcrumbInterval}
              onChange={(e) => handleBreadcrumbIntervalChange(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Safety Sensors
          </CardTitle>
          <CardDescription>
            Configure crash detection and fatigue monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Motion Permission</Label>
              <p className="text-sm text-muted-foreground">
                Status: {motionPermission}
              </p>
            </div>
            {motionPermission === 'prompt' && (
              <Button onClick={requestMotionPermission} variant="outline">
                Request Permission
              </Button>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="crash-detection">Crash Detection</Label>
              <p className="text-sm text-muted-foreground">
                Alert when sudden impact is detected
              </p>
            </div>
            <Switch
              id="crash-detection"
              checked={crashDetectionEnabled}
              onCheckedChange={handleCrashDetectionChange}
              disabled={motionPermission !== 'granted'}
            />
          </div>

          {crashDetectionEnabled && motionPermission === 'granted' && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="crash-threshold">Crash Sensitivity</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {crashThreshold.toFixed(1)}g
                  </span>
                </div>
                <Slider
                  id="crash-threshold"
                  min={1.5}
                  max={5.0}
                  step={0.1}
                  value={[crashThreshold]}
                  onValueChange={handleCrashThresholdChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower values = more sensitive (may trigger on bumps). Higher values = less sensitive (only major impacts).
                  Default: 2.5g
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fatigue-monitoring">Fatigue Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Periodic check-ins during long rides
              </p>
            </div>
            <Switch
              id="fatigue-monitoring"
              checked={fatigueMonitoringEnabled}
              onCheckedChange={handleFatigueMonitoringChange}
            />
          </div>
        </CardContent>
      </Card>

      <BluetoothRelayCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your local data and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Queued Items</Label>
              <p className="text-sm text-muted-foreground">
                {queuedCount} item{queuedCount !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear Cache</Label>
              <p className="text-sm text-muted-foreground">
                Remove all locally stored data
              </p>
            </div>
            <Button onClick={handleClearCache} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
