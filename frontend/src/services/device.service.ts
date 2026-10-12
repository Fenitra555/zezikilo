// src/services/device.service.ts
import api from './api';
import type { Device, ApiSuccessResponse } from '../types';

export const deviceService = {
  /**
   * Lister les appareils de l'utilisateur connecte
   */
  async list(): Promise<Device[]> {
    const response = await api.get<ApiSuccessResponse<Device[]>>('/api/devices');
    return response.data.data;
  },

  /**
   * Recuperer un appareil par ID
   */
  async getById(deviceId: string): Promise<Device> {
    const response = await api.get<ApiSuccessResponse<Device>>(`/api/devices/${deviceId}`);
    return response.data.data;
  },

  /**
   * Creer un nouvel appareil
   */
  async create(serialNumber: string, alias?: string): Promise<Device> {
    const response = await api.post<ApiSuccessResponse<Device>>('/api/devices', {
      serialNumber,
      alias
    });
    return response.data.data;
  },

  /**
   * Modifier l'alias d'un appareil
   */
  async update(deviceId: string, alias: string): Promise<Device> {
    const response = await api.put<ApiSuccessResponse<Device>>(`/api/devices/${deviceId}`, {
      alias
    });
    return response.data.data;
  },

  /**
   * Supprimer un appareil
   */
  async delete(deviceId: string): Promise<void> {
    await api.delete(`/api/devices/${deviceId}`);
  }
};