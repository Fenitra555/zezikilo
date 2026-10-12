// src/types/index.ts

export type UserRole = 'user' | 'constructor' | 'admin';

export type CommandType =
  | 'motor-start'
  | 'motor-stop'
  | 'fan-start'
  | 'fan-stop'
  | 'reset-cycle'
  | 'update-settings';

export type CommandStatus = 'pending' | 'sent' | 'acknowledged' | 'failed';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type DevicePermissionType = 'read' | 'write' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  alias: string | null;
  ownerId: string;
  apiKey: string;
  lastSyncAt: string | null;
  firmwareVersion: string;
  createdAt: string;
  updatedAt: string;
  permission?: DevicePermissionType;
}

export interface Measurement {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  motor: boolean;
  fan: boolean;
  phase: 1 | 2 | 3;
  emergency: boolean;
  timestamp: number;
  syncId?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  deviceId: string;
  type: AlertSeverity;
  message: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  timestamp: number;
  createdAt: string;
}

export interface DeviceSetting {
  id: string;
  deviceId: string;
  tempMaxUrgence: number;
  tempMaxThermophile: number;
  tempMinThermophile: number;
  humiditeMin: number;
  humiditeMax: number;
  tempFinCycle: number;
  dureeBrassagePhase1: number;
  dureeBrassagePhase2: number;
  dureeBrassagePhase3: number;
  intervallePhase1: number;
  intervallePhase2: number;
  intervallePhase3: number;
  tempTransitionP1P2: number;
  tempTransitionP2P3: number;
  dureeTransitionP2P3: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PaginatedMeasurements {
  measurements: Measurement[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface WsDeviceState {
  type: 'device-state';
  deviceId: string;
  serialNumber: string;
  timestamp: number;
  data: {
    temperature: number;
    humidity: number;
    motor: boolean;
    fan: boolean;
    phase: 1 | 2 | 3;
    emergency: boolean;
  };
}

export interface WsCommandAck {
  type: 'command-ack';
  deviceId: string;
  commandId: string;
  status: 'success' | 'failed';
  result: string | null;
  timestamp: number;
}

export interface WsAlert {
  type: 'alert';
  deviceId: string;
  serialNumber: string;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
}
