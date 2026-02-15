import { Wifi, WifiOff, RefreshCw, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSyncStatus } from '../offline/sync';

export default function ConnectivityIndicator() {
  const isOnline = useOnlineStatus();
  const { isSyncing, queuedCount, isAuthenticated } = useSyncStatus();

  const showSyncingBadge = isSyncing && isAuthenticated;
  const showQueuedBadge = queuedCount > 0 && !isSyncing;

  const getQueuedMessage = () => {
    if (!isAuthenticated) {
      return `${queuedCount} item${queuedCount !== 1 ? 's' : ''} queued (login required to sync)`;
    }
    return `${queuedCount} item${queuedCount !== 1 ? 's' : ''} queued`;
  };

  return (
    <div className="sticky top-16 z-40 border-b border-border/40 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
      <div className="container flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-success" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOnline ? 'Connected to network' : 'No network connection'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showSyncingBadge && (
            <Badge variant="outline" className="gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Syncing...
            </Badge>
          )}

          {showQueuedBadge && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="gap-1.5">
                    {!isAuthenticated && <LogIn className="h-3 w-3" />}
                    {queuedCount} queued
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getQueuedMessage()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
