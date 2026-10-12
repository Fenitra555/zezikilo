// src/services/settings.service.ts
import api from './api';
import type { DeviceSetting, ApiSuccessResponse } from '../types';

export type DeviceSettingUpdate = Partial<
  Omit<DeviceSetting, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'>
>;

export const settingsService = {
  /**
   * Recuperer les parametres d'un appareil
   */
  async get(deviceId: string): Promise<DeviceSetting> {
    const response = await api.get<ApiSuccessResponse<DeviceSetting>>(
      `/api/devices/${deviceId}/settings`
    );
    return response.data.data;
  },

  /**
   * Mettre a jour les parametres (champs partiels)
   */
  async update(deviceId: string, data: DeviceSettingUpdate): Promise<DeviceSetting> {
    const response = await api.put<ApiSuccessResponse<DeviceSetting>>(
      `/api/devices/${deviceId}/settings`,
      data
    );
    return response.data.data;
  }
};