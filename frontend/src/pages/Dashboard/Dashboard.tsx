// src/pages/Dashboard/Dashboard.tsx
import { useEffect } from 'react';
import { useDevicesStore } from '../../store/devices.store';
import { Header } from '../../components/Header/Header';
import { DeviceCard } from '../../components/DeviceCard/DeviceCard';
import './Dashboard.css';

export function Dashboard() {
  const devices = useDevicesStore((state) => state.devices);
  const loading = useDevicesStore((state) => state.loading);
  const error = useDevicesStore((state) => state.error);
  const fetchDevices = useDevicesStore((state) => state.fetchDevices);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-main">
        <div className="dashboard-title-row">
          <h2 className="dashboard-title">Mes composteurs</h2>
          <button className="btn-add-device">+ Ajouter un appareil</button>
        </div>

        {loading && <p className="dashboard-info">Chargement...</p>}

        {error && <p className="dashboard-error">{error}</p>}

        {!loading && !error && devices.length === 0 && (
          <div className="dashboard-empty">
            <p>Aucun appareil associe</p>
            <p className="dashboard-empty-hint">
              Ajoutez votre premier composteur pour commencer.
            </p>
          </div>
        )}

        {!loading && devices.length > 0 && (
          <div className="dashboard-grid">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}