// src/pages/Dashboard/Dashboard.tsx
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
