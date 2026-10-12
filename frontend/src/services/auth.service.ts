// src/services/auth.service.ts
import api from './api';
import type { LoginResponse, User, ApiSuccessResponse } from '../types';

export const authService = {
  async register(email: string, password: string, fullName: string): Promise<LoginResponse> {
    const response = await api.post<ApiSuccessResponse<LoginResponse>>('/api/auth/register', {
      email,
      password,
      fullName
    });
    return response.data.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiSuccessResponse<LoginResponse>>('/api/auth/login', {
      email,
      password
    });
    return response.data.data;
  },

  async me(): Promise<User> {
    const response = await api.get<ApiSuccessResponse<User>>('/api/auth/me');
    return response.data.data;
  }
};
