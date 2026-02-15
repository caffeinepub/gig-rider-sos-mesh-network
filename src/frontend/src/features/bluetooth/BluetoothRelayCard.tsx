import { useState } from 'react';
import { Bluetooth, Send, Trash2, AlertCircle, Info, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useBluetoothRelay } from './useBluetoothRelay';
import { toast } from 'sonner';

export default function BluetoothRelayCard() {
  const {
    connectionState,
    messages,
    lastError,
    isAvailable,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useBluetoothRelay();

  const [messageText, setMessageText] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSend = async () => {
    if (messageText.trim()) {
      try {
        await sendMessage(messageText);
        setMessageText('');
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    try {
      const testMessage = 'Test message from Rider Safety App - Bluetooth connection working!';
      await sendMessage(testMessage);
      toast.success('Test message sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test message');
    } finally {
      setIsSendingTest(false);
    }
  };

  const getConnectionBadge = () => {
    switch (connectionState) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>;
      case 'connecting':
        return <Badge variant="outline">Connecting...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Bluetooth Relay
          </CardTitle>
          {getConnectionBadge()}
        </div>
        <CardDescription>
          Share emergency alerts with nearby devices via Bluetooth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Platform Support & Limitations</AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-sm">
            <p>
              <strong>Supported platforms:</strong> Chrome/Edge on Android and desktop (Windows, macOS, Linux). <strong>Not supported on iOS.</strong>
            </p>
            <p>
              <strong>Important:</strong> This is NOT true phone-to-phone mesh networking. Web Bluetooth has significant limitations:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Requires manual pairing with each device</li>
              <li>Cannot relay messages automatically between devices</li>
              <li>Range limited to ~10-30 meters in ideal conditions</li>
              <li>Connection requires user interaction (cannot run in background)</li>
              <li>Most phones cannot act as Bluetooth peripherals for Web Bluetooth</li>
            </ul>
            <p className="mt-2">
              <strong>How to test:</strong>
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Ensure Bluetooth is turned on in device settings</li>
              <li>Keep both devices close together (within 10 meters)</li>
              <li>Use Chrome on Android or desktop</li>
              <li>Accept pairing prompts when they appear</li>
              <li>Keep screen on during connection</li>
            </ul>
            <p className="mt-2">
              For reliable emergency communication, use cellular data or Wi-Fi when available.
            </p>
          </AlertDescription>
        </Alert>

        {!isAvailable && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Web Bluetooth is not available. Please use Chrome or Edge on Android or desktop. iOS Safari does not support Web Bluetooth.
            </AlertDescription>
          </Alert>
        )}

        {lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{lastError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {connectionState === 'disconnected' || connectionState === 'error' ? (
            <Button onClick={connect} disabled={!isAvailable} className="flex-1">
              <Bluetooth className="mr-2 h-4 w-4" />
              Connect to Device
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" className="flex-1">
              Disconnect
            </Button>
          )}
        </div>

        {connectionState === 'connected' && (
          <>
            <Separator />
            
            <div className="space-y-2">
              <Button 
                onClick={handleSendTestMessage} 
                disabled={isSendingTest}
                variant="outline"
                className="w-full"
              >
                <TestTube className="mr-2 h-4 w-4" />
                {isSendingTest ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {messages.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Messages</p>
                  <Button variant="ghost" size="sm" onClick={clearMessages}>
                    <Trash2 className="mr-2 h-3 w-3" />
                    Clear
                  </Button>
                </div>

                <ScrollArea className="h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-2 text-sm ${
                          msg.direction === 'sent'
                            ? 'ml-8 bg-primary text-primary-foreground'
                            : 'mr-8 bg-muted'
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                        <p className="mt-1 text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
