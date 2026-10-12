// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DeviceDetail } from './pages/DeviceDetail/DeviceDetail';
import { Settings } from './pages/Settings/Settings';
import { useAuthStore } from './store/auth.store';
import { websocketService } from './services/websocket.service';
import './App.css';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated && token) {
      websocketService.connect(token);
    } else {
      websocketService.disconnect();
    }
  }, [isAuthenticated, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/devices/:deviceId"
          element={<ProtectedRoute><DeviceDetail /></ProtectedRoute>}
        />
        <Route
          path="/devices/:deviceId/settings"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;