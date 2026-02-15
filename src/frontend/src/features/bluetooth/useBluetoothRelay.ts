import { useState, useCallback, useRef, useEffect } from 'react';
import { create } from 'zustand';

interface BluetoothMessage {
  text: string;
  timestamp: number;
  direction: 'sent' | 'received';
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
const CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1';

interface BluetoothState {
  connectionState: ConnectionState;
  messages: BluetoothMessage[];
  lastError: string | null;
  isAvailable: boolean;
  deviceRef: any | null;
  characteristicRef: any | null;
  setConnectionState: (state: ConnectionState) => void;
  setMessages: (messages: BluetoothMessage[]) => void;
  addMessage: (message: BluetoothMessage) => void;
  setLastError: (error: string | null) => void;
  setDeviceRef: (device: any | null) => void;
  setCharacteristicRef: (characteristic: any | null) => void;
  clearMessages: () => void;
}

const useBluetoothStore = create<BluetoothState>((set) => ({
  connectionState: 'disconnected',
  messages: [],
  lastError: null,
  isAvailable: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  deviceRef: null,
  characteristicRef: null,
  setConnectionState: (state) => set({ connectionState: state }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLastError: (error) => set({ lastError: error }),
  setDeviceRef: (device) => set({ deviceRef: device }),
  setCharacteristicRef: (characteristic) => set({ characteristicRef: characteristic }),
  clearMessages: () => set({ messages: [] }),
}));

function getActionableErrorMessage(error: any): string {
  const errorMsg = error?.message || error?.toString() || '';
  const errorName = error?.name || '';

  // iOS/Safari detection
  if (!('bluetooth' in navigator)) {
    return 'Web Bluetooth is not supported on iOS. Please use Chrome or Edge on Android or desktop.';
  }

  // User cancelled the device picker
  if (errorMsg.includes('User cancelled') || errorName === 'NotFoundError') {
    return 'Device selection cancelled. Please try again and select a device.';
  }

  // Permission denied
  if (errorMsg.includes('permission') || errorName === 'NotAllowedError' || errorName === 'SecurityError') {
    return 'Bluetooth permission denied. Please allow Bluetooth access in your browser settings and try again.';
  }

  // Bluetooth not available/powered off
  if (errorMsg.includes('Bluetooth adapter not available') || errorMsg.includes('not available') || errorName === 'NotSupportedError') {
    return 'Bluetooth is not available. Please ensure Bluetooth is turned on in your device settings.';
  }

  // No compatible device found
  if (errorMsg.includes('No Services found') || errorMsg.includes('GATT') || errorMsg.includes('not supported')) {
    return 'No compatible Bluetooth device found. Ensure the device is powered on, nearby, and supports the required Bluetooth service.';
  }

  // Connection timeout
  if (errorMsg.includes('timeout') || errorMsg.includes('Timed out')) {
    return 'Connection timed out. Please ensure the device is nearby and powered on, then try again.';
  }

  // Device disconnected during operation
  if (errorMsg.includes('disconnected') || errorName === 'NetworkError') {
    return 'Device disconnected. Please reconnect and try again.';
  }

  // Generic fallback
  return `Connection failed: ${errorMsg || 'Unknown error'}. Please ensure Bluetooth is on, the device is nearby, and try again.`;
}

export function useBluetoothRelay() {
  const {
    connectionState,
    messages,
    lastError,
    isAvailable,
    deviceRef,
    characteristicRef,
    setConnectionState,
    addMessage,
    setLastError,
    setDeviceRef,
    setCharacteristicRef,
    clearMessages,
  } = useBluetoothStore();

  const handleDisconnect = useCallback(() => {
    setConnectionState('disconnected');
    setDeviceRef(null);
    setCharacteristicRef(null);
  }, [setConnectionState, setDeviceRef, setCharacteristicRef]);

  const handleCharacteristicValueChanged = useCallback((event: Event) => {
    const target = event.target as any;
    const value = target.value;
    if (value) {
      const decoder = new TextDecoder();
      const text = decoder.decode(value);
      addMessage({
        text,
        timestamp: Date.now(),
        direction: 'received',
      });
    }
  }, [addMessage]);

  const connect = useCallback(async () => {
    if (!isAvailable) {
      const errorMsg = 'Web Bluetooth is not supported on this browser/platform. Please use Chrome or Edge on Android or desktop.';
      setLastError(errorMsg);
      setConnectionState('error');
      return;
    }

    setConnectionState('connecting');
    setLastError(null);

    try {
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID],
      });

      setDeviceRef(device);

      device.addEventListener('gattserverdisconnected', handleDisconnect);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      setCharacteristicRef(characteristic);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setConnectionState('connected');
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      const actionableError = getActionableErrorMessage(error);
      setLastError(actionableError);
      setConnectionState('error');
      setDeviceRef(null);
      setCharacteristicRef(null);
    }
  }, [isAvailable, handleDisconnect, handleCharacteristicValueChanged, setConnectionState, setLastError, setDeviceRef, setCharacteristicRef]);

  const disconnect = useCallback(async () => {
    if (deviceRef?.gatt?.connected) {
      deviceRef.gatt.disconnect();
    }
    handleDisconnect();
  }, [deviceRef, handleDisconnect]);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!characteristicRef) {
      const error = 'Not connected to a device';
      setLastError(error);
      setConnectionState('error');
      throw new Error(error);
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      await characteristicRef.writeValue(data);
      
      addMessage({
        text,
        timestamp: Date.now(),
        direction: 'sent',
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      const actionableError = getActionableErrorMessage(error);
      setLastError(actionableError);
      setConnectionState('error');
      setDeviceRef(null);
      setCharacteristicRef(null);
      throw new Error(actionableError);
    }
  }, [characteristicRef, addMessage, setLastError, setConnectionState, setDeviceRef, setCharacteristicRef]);

  return {
    connectionState,
    messages,
    lastError,
    isAvailable,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
}
