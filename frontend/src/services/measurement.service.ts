// src/services/measurement.service.ts
import api from './api';
import type { PaginatedMeasurements, ApiSuccessResponse } from '../types';

export interface ListMeasurementsOptions {
  limit?: number;
  offset?: number;
  startDate?: number;
  endDate?: number;
}

export const measurementService = {
  async list(
    deviceId: string,
    options: ListMeasurementsOptions = {}
  ): Promise<PaginatedMeasurements> {
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.append('limit', String(options.limit));
    if (options.offset !== undefined) params.append('offset', String(options.offset));
    if (options.startDate !== undefined) params.append('startDate', String(options.startDate));
    if (options.endDate !== undefined) params.append('endDate', String(options.endDate));

    const query = params.toString();
    const url = `/api/devices/${deviceId}/measurements${query ? `?${query}` : ''}`;

    const response = await api.get<ApiSuccessResponse<PaginatedMeasurements>>(url);
    return response.data.data;
  }
};