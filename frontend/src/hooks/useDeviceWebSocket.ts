// src/hooks/useDeviceWebSocket.ts
import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket.service';

export interface LiveMeasurement {
  temperature: number;
  humidity: number;
  motor: boolean;
  fan: boolean;
  phase: 1 | 2 | 3;
  emergency: boolean;
  timestamp: number;
}

export interface LiveAlert {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface CommandAck {
  commandId: string;
  status: 'success' | 'failed';
  result: string | null;
}

interface UseDeviceWebSocketOptions {
  onCommandAck?: (ack: CommandAck) => void;
}

interface Return {
  measurement: LiveMeasurement | null;
  alerts: LiveAlert[];
  connected: boolean;
}

export function useDeviceWebSocket(
  deviceId: string | undefined,
  options: UseDeviceWebSocketOptions = {}
): Return {
  const [measurement, setMeasurement] = useState<LiveMeasurement | null>(null);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    const socket = websocketService.getSocket();
    if (!socket) {
      console.warn('[WS] Socket non initialise');
      return;
    }

    setConnected(socket.connected);

    // S'abonner a la room de l'appareil
    socket.emit('subscribe', { deviceId });

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleDeviceState = (payload: {
      timestamp: number;
      data: Omit<LiveMeasurement, 'timestamp'>;
    }) => {
      setMeasurement({
        ...payload.data,
        timestamp: payload.timestamp
      });
    };

    const handleAlert = (payload: LiveAlert) => {
      setAlerts((prev) => [payload, ...prev].slice(0, 5));
    };

    const handleCommandAck = (payload: CommandAck) => {
      options.onCommandAck?.(payload);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('device-state', handleDeviceState);
    socket.on('alert', handleAlert);
    socket.on('command-ack', handleCommandAck);

    return () => {
      socket.emit('unsubscribe', { deviceId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('device-state', handleDeviceState);
      socket.off('alert', handleAlert);
      socket.off('command-ack', handleCommandAck);
    };
  }, [deviceId]);

  return { measurement, alerts, connected };
}