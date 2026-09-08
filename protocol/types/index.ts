export type UserRole = 'user' | 'constructor' | 'admin';

export type CommandType =
  | 'motor-start'
  | 'motor-stop'
  | 'fan-start'
  | 'fan-stop'
  | 'reset-cycle'
  | 'update-settings';

export type CommandStatus =
  | 'pending'
  | 'sent'
  | 'acknowledged'
  | 'failed';

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
}

export interface DevicePermission {
  id: string;
  deviceId: string;
  userId: string;
  permission: DevicePermissionType;
  createdAt: string;
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

export interface Command {
  id: string;
  deviceId: string;
  userId?: string;
  command: CommandType;
  params: Record<string, any>;
  status: CommandStatus;
  result: string | null;
  sentAt: string | null;
  acknowledgedAt: string | null;
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

/**
 * ModÃ¨le persistant complet d'une configuration d'appareil.
 */
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
  updatedAt: string;
}

/**
 * Configuration partielle utilisÃ©e lors d'une mise Ã  jour.
 */
export type DeviceSettingUpdate = Partial<
  Omit<DeviceSetting, 'id' | 'deviceId' | 'updatedAt'>
>;

export interface SyncQueue {
  id: string;
  deviceId: string;
  payload: Record<string, any>;
  type: 'measurement' | 'ack' | 'state' | 'alert';
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt: string | null;
}

export interface WsDeviceState {
  type: 'device-state';
  deviceId: string;
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

export interface WsCommand {
  type: 'command';
  deviceId: string;
  commandId: string;
  command: CommandType;
  params: Record<string, any>;
  timestamp: number;
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
  severity: AlertSeverity;
  message: string;
  timestamp: number;
}

export interface WsSettingsUpdate {
  type: 'settings-update';
  deviceId: string;
  settings: DeviceSettingUpdate;
  timestamp: number;
}

export interface WsSettingsAck {
  type: 'settings-ack';
  deviceId: string;
  status: 'success' | 'failed';
  timestamp: number;
}

export interface WsSyncBatch {
  type: 'sync-batch';
  deviceId: string;
  entries: {
    type: 'measurement' | 'alert' | 'state';
    syncId: string;
    data: any;
  }[];
  timestamp: number;
}

export interface WsSyncBatchAck {
  type: 'sync-batch-ack';
  deviceId: string;
  receivedCount: number;
  timestamp: number;
}
