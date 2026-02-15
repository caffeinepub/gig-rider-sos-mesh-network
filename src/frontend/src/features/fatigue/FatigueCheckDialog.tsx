import { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFatiguePrompts } from './useFatiguePrompts';

export default function FatigueCheckDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFatigueCheck = () => {
    setIsOpen(true);
  };

  useFatiguePrompts(handleFatigueCheck);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Fatigue Check-In
          </AlertDialogTitle>
          <AlertDialogDescription>
            You've been riding for a while. Are you feeling alert and safe to continue?
            Consider taking a short break if you're feeling tired.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setIsOpen(false)}>
            I'm Alert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
