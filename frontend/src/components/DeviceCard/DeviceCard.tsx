// src/components/DeviceCard/DeviceCard.tsx
import { useNavigate } from 'react-router-dom';
import type { Device } from '../../types';
import './DeviceCard.css';

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/devices/${device.id}`);
  };

  const formatLastSync = (dateStr: string | null): string => {
    if (!dateStr) return 'Jamais synchronise';
    const date = new Date(dateStr);
    return `Derniere synchro : ${date.toLocaleString('fr-FR')}`;
  };

  return (
    <div className="device-card" onClick={handleClick}>
      <div className="device-card-header">
        <h3 className="device-card-title">{device.alias || device.serialNumber}</h3>
        <span className="device-card-status" />
      </div>
      <div className="device-card-body">
        <p className="device-card-serial">
          <strong>Serial :</strong> {device.serialNumber}
        </p>
        <p className="device-card-sync">{formatLastSync(device.lastSyncAt)}</p>
        <p className="device-card-firmware">
          <strong>Firmware :</strong> {device.firmwareVersion}
        </p>
      </div>
    </div>
  );
}