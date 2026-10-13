// src/components/Header/Header.tsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useDevicesStore } from '../../store/devices.store';
import './Header.css';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearDevices = useDevicesStore((state) => state.clearDevices);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearDevices();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-logo">Zezik'Ilo</h1>
      </div>
      <div className="header-right">
        <span className="header-user">{user?.fullName}</span>
        <button className="header-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}