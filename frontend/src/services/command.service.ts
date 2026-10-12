// src/services/command.service.ts
import api from './api';
import type { ApiSuccessResponse } from '../types';

interface CommandResponse {
  commandId: string;
  command: string;
  status: string;
  sentAt: string;
}

export type CommandType =
  | 'motor-start'
  | 'motor-stop'
  | 'fan-start'
  | 'fan-stop';

export const commandService = {
  /**
   * Envoyer une commande a un appareil
   */
  async send(deviceId: string, command: CommandType, params: Record<string, unknown> = {}): Promise<CommandResponse> {
    const response = await api.post<ApiSuccessResponse<CommandResponse>>(
      `/api/devices/${deviceId}/commands`,
      { command, params }
    );
    return response.data.data;
  }
};