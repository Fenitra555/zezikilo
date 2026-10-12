# init_frontend.py
# Crée tous les fichiers du frontend Zezik'Ilo d'un coup
import os
from pathlib import Path

# Répertoire racine du frontend
ROOT = Path(__file__).parent

def write_file(relative_path: str, content: str):
    """Crée un fichier avec son contenu (UTF-8)"""
    path = ROOT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    print(f"[OK] {relative_path}")

# ============================================================
# 1. src/types/index.ts
# ============================================================
write_file("src/types/index.ts", '''// src/types/index.ts

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
''')

# ============================================================
# 2. src/services/auth.service.ts
# ============================================================
write_file("src/services/auth.service.ts", '''// src/services/auth.service.ts
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
''')

# ============================================================
# 3. src/store/auth.store.ts
# ============================================================
write_file("src/store/auth.store.ts", '''// src/store/auth.store.ts
import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}));
''')

# ============================================================
# 4. src/pages/Login/Login.tsx
# ============================================================
write_file("src/pages/Login/Login.tsx", '''// src/pages/Login/Login.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await authService.login(email, password);
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Zezik'Ilo</h1>
        <p className="subtitle">Connexion a votre composteur</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="register-link">
          Pas encore de compte ? <Link to="/register">Creer un compte</Link>
        </p>
      </div>
    </div>
  );
}
''')

# ============================================================
# 5. src/pages/Login/Login.css
# ============================================================
write_file("src/pages/Login/Login.css", '''/* src/pages/Login/Login.css */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #DADADA;
  padding: 1rem;
}

.login-card {
  background: #FFFFFF;
  padding: 2.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
  color: #4FAE32;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #585857;
  font-family: 'Arial Narrow', Arial, sans-serif;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #1D1D1B;
  margin-bottom: 0.4rem;
  font-family: 'Arial Narrow', Arial, sans-serif;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #DADADA;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4FAE32;
}

button[type='submit'] {
  width: 100%;
  padding: 0.8rem;
  background-color: #4FAE32;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  font-family: 'Arial Rounded MT Bold', Arial, sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #3d8c28;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #585857;
  font-family: 'Arial Narrow', Arial, sans-serif;
}

.register-link a {
  color: #4FAE32;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
''')

# ============================================================
# 6. src/pages/Dashboard/Dashboard.tsx
# ============================================================
write_file("src/pages/Dashboard/Dashboard.tsx", '''// src/pages/Dashboard/Dashboard.tsx
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Bienvenue {user?.fullName}</p>
      <button onClick={handleLogout}>Se deconnecter</button>
    </div>
  );
}
''')

# ============================================================
# 7. src/App.tsx
# ============================================================
write_file("src/App.tsx", '''// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { useAuthStore } from './store/auth.store';
import './App.css';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
''')

# ============================================================
# 8. src/App.css
# ============================================================
write_file("src/App.css", '''/* src/App.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial Narrow', Arial, sans-serif;
  background-color: #DADADA;
  color: #1D1D1B;
}
''')

# ============================================================
# 9. src/main.tsx (vérification)
# ============================================================
write_file("src/main.tsx", '''// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
''')

# ============================================================
# 10. src/index.css (nettoyage)
# ============================================================
write_file("src/index.css", '''/* src/index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
}
''')

print("\\n=== Tous les fichiers ont ete crees avec succes ===")
print(f"Repertoire : {ROOT}")cd "C:\Users\Fablab pc user\Desktop\Fenitra\Zezikilo\frontend"
