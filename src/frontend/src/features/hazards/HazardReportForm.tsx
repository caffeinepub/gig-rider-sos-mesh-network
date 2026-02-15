import { useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HAZARD_TYPES, SEVERITY_LEVELS } from './hazardTypes';
import { useLastKnownLocation } from '../location/useBreadcrumbTracking';
import { enqueueItem } from '../../offline/queue';
import { toast } from 'sonner';

export default function HazardReportForm() {
  const { location, error: locationError } = useLastKnownLocation();
  const [hazardType, setHazardType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hazardType) {
      toast.error('Please select a hazard type');
      return;
    }

    if (!location) {
      toast.error('Location not available. Please enable location services.');
      return;
    }

    setIsSubmitting(true);
    try {
      await enqueueItem({
        type: 'submitHazard',
        data: {
          hazardType,
          severity,
          description,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: BigInt(Date.now() * 1000000),
          },
        },
        timestamp: Date.now(),
      });

      toast.success('Hazard report submitted');
      setHazardType('');
      setSeverity('medium');
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit hazard report');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {locationError && (
        <Alert variant="destructive">
          <AlertDescription>
            Location access required to report hazards. Please enable location permissions.
          </AlertDescription>
        </Alert>
      )}

      {location && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Current Location:</span>
            <span className="font-mono text-xs">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="hazard-type">Hazard Type *</Label>
        <Select value={hazardType} onValueChange={setHazardType}>
          <SelectTrigger id="hazard-type">
            <SelectValue placeholder="Select hazard type" />
          </SelectTrigger>
          <SelectContent>
            {HAZARD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Severity *</Label>
        <RadioGroup value={severity} onValueChange={setSeverity}>
          {SEVERITY_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className={level.color}>
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide additional details about the hazard..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !location} className="w-full">
        <AlertTriangle className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Submitting...' : 'Submit Hazard Report'}
      </Button>
    </form>
  );
}
