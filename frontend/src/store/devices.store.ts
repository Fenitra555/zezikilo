// src/store/devices.store.ts
import { create } from 'zustand';
import type { Device } from '../types';
import { deviceService } from '../services/device.service';

interface DevicesState {
  devices: Device[];
  loading: boolean;
  error: string | null;
  fetchDevices: () => Promise<void>;
  addDevice: (device: Device) => void;
  clearDevices: () => void;
}

export const useDevicesStore = create<DevicesState>((set) => ({
  devices: [],
  loading: false,
  error: null,

  fetchDevices: async () => {
    set({ loading: true, error: null });
    try {
      const devices = await deviceService.list();
      set({ devices, loading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors du chargement des appareils';
      set({ error: message, loading: false });
    }
  },

  addDevice: (device) => {
    set((state) => ({ devices: [...state.devices, device] }));
  },

  clearDevices: () => {
    set({ devices: [], loading: false, error: null });
  }
}));