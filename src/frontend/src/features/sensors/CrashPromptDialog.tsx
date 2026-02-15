import { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCrashDetection } from './useCrashDetection';
import { startSOSEvent } from '../sos/sosState';
import { toast } from 'sonner';

export default function CrashPromptDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);

  const handleCrashDetected = () => {
    // Prevent opening multiple dialogs if already open
    if (isOpenRef.current) return;
    
    isOpenRef.current = true;
    setIsOpen(true);
  };

  useCrashDetection(handleCrashDetected);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    isOpenRef.current = open;
  };

  const handleStartSOS = async () => {
    try {
      await startSOSEvent('Possible crash detected');
      toast.success('SOS activated');
    } catch (error) {
      toast.error('Failed to start SOS');
    }
    handleOpenChange(false);
  };

  const handleDismiss = () => {
    handleOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Possible Impact Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            A sudden impact was detected. Are you okay? Do you need emergency assistance?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>I'm OK</AlertDialogCancel>
          <AlertDialogAction onClick={handleStartSOS} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Start SOS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
