import { useState } from 'react';
import { Shield, Share2, X, Bluetooth } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useActiveSOS, startSOSEvent, endSOSEvent } from './sosState';
import { generateSOSShareLink } from './shareLink';
import { formatSOSBluetoothMessage } from './sosBluetoothMessage';
import { useBluetoothRelay } from '../bluetooth/useBluetoothRelay';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function SOSController() {
  const activeSOS = useActiveSOS();
  const { identity } = useInternetIdentity();
  const { connectionState, sendMessage } = useBluetoothRelay();
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const isAuthenticated = !!identity;
  const isBluetoothConnected = connectionState === 'connected';

  const handleStartSOS = async () => {
    setIsStarting(true);
    try {
      await startSOSEvent(note);
      toast.success('SOS activated');
      setIsStartDialogOpen(false);
      setNote('');
    } catch (error) {
      toast.error('Failed to start SOS');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSOS = async () => {
    if (!activeSOS) return;
    if (!confirm('Are you sure you want to end this SOS event?')) return;

    setIsEnding(true);
    try {
      const sosId = activeSOS.backendId || activeSOS.tempId;
      await endSOSEvent(sosId);
      toast.success('SOS ended');
    } catch (error) {
      toast.error('Failed to end SOS');
      console.error(error);
    } finally {
      setIsEnding(false);
    }
  };

  const handleShare = () => {
    if (!activeSOS) return;
    
    if (!activeSOS.backendId) {
      if (!isAuthenticated) {
        toast.error('Login required to share SOS status link');
      } else {
        toast.error('SOS link not yet available. Please wait for sync to complete.');
      }
      return;
    }
    
    const link = generateSOSShareLink(activeSOS.backendId);
    navigator.clipboard.writeText(link);
    toast.success('SOS link copied to clipboard');
  };

  const handleBluetoothShare = async () => {
    if (!activeSOS) return;
    
    if (!isBluetoothConnected) {
      toast.error('Not connected to a Bluetooth device. Connect via Settings first.');
      return;
    }
    
    // Generate share link only if backendId exists
    const shareLink = activeSOS.backendId 
      ? generateSOSShareLink(activeSOS.backendId)
      : undefined;
    
    const message = formatSOSBluetoothMessage(activeSOS, shareLink);
    
    try {
      await sendMessage(message);
      toast.success('SOS sent via Bluetooth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send via Bluetooth');
    }
  };

  const getStatusBadge = () => {
    if (!activeSOS) return null;
    
    switch (activeSOS.status) {
      case 'queued':
        return <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-4 w-4" />
          SOS QUEUED
        </Badge>;
      case 'syncing':
        return <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-4 w-4" />
          {isAuthenticated ? 'SOS SYNCING...' : 'SOS LOCAL ONLY'}
        </Badge>;
      case 'active':
        return <Badge variant="destructive" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-4 w-4" />
          SOS ACTIVE
        </Badge>;
      case 'ending':
        return <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-4 w-4" />
          ENDING...
        </Badge>;
      case 'ended':
        return <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
          <Shield className="h-4 w-4" />
          SOS ENDED
        </Badge>;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!activeSOS) return null;
    
    if (activeSOS.backendId) {
      return `Event #${activeSOS.backendId.toString()}`;
    }
    
    if (!isAuthenticated) {
      return 'Local only (login to sync)';
    }
    
    return 'Waiting for sync...';
  };

  const canShare = activeSOS && activeSOS.backendId;
  const canBluetoothShare = activeSOS && isBluetoothConnected;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center justify-between px-4 py-4">
          {activeSOS ? (
            <>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <span className="text-sm text-muted-foreground">
                  {getStatusText()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBluetoothShare}
                  disabled={!canBluetoothShare}
                  title={!isBluetoothConnected ? 'Connect Bluetooth in Settings first' : 'Send SOS via Bluetooth'}
                >
                  <Bluetooth className="mr-2 h-4 w-4" />
                  BT
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  disabled={!canShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndSOS}
                  disabled={isEnding || activeSOS.status === 'ending' || activeSOS.status === 'ended'}
                >
                  <X className="mr-2 h-4 w-4" />
                  {isEnding || activeSOS.status === 'ending' ? 'Ending...' : 'End SOS'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Emergency assistance</p>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setIsStartDialogOpen(true)}
                className="gap-2"
              >
                <Shield className="h-5 w-5" />
                Start SOS
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Emergency SOS</DialogTitle>
            <DialogDescription>
              This will activate emergency mode and begin tracking your location.
              {!isAuthenticated && (
                <span className="mt-2 block text-warning">
                  Note: You are not logged in. SOS will be saved locally only until you log in.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Emergency Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Describe the situation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStartDialogOpen(false)}
              disabled={isStarting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStartSOS}
              disabled={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start SOS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
