// src/pages/DeviceDetail/DeviceDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { deviceService } from '../../services/device.service';
import { measurementService } from '../../services/measurement.service';
import type { Device, Measurement } from '../../types';
import './DeviceDetail.css';

export function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deviceId) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [deviceData, measurementsData] = await Promise.all([
          deviceService.getById(deviceId),
          measurementService.list(deviceId, { limit: 20 })
        ]);
        setDevice(deviceData);
        setMeasurements(measurementsData.measurements);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          || 'Erreur lors du chargement';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [deviceId]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const getPhaseLabel = (phase: number): string => {
    switch (phase) {
      case 1: return 'Phase 1 - Montee en temperature';
      case 2: return 'Phase 2 - Fermentation thermophile';
      case 3: return 'Phase 3 - Maturation';
      default: return `Phase ${phase}`;
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Header />
        <main className="detail-main">
          <p className="detail-info">Chargement...</p>
        </main>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="detail-page">
        <Header />
        <main className="detail-main">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            &larr; Retour
          </button>
          <p className="detail-error">{error || 'Appareil introuvable'}</p>
        </main>
      </div>
    );
  }

  const latest = measurements[0];
  const isEmergency = Boolean(latest?.emergency);

  return (
    <div className="detail-page">
      <Header />

      <main className="detail-main">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          &larr; Retour au dashboard
        </button>

        <div className="detail-header">
          <h2 className="detail-title">{device.alias || device.serialNumber}</h2>
          <p className="detail-subtitle">Serial : {device.serialNumber}</p>
        </div>

        <section className="detail-section">
          <h3 className="section-title">Etat actuel</h3>

          {latest ? (
            <div className="live-grid">
              <div className="live-card">
                <span className="live-label">Temperature</span>
                <span className="live-value">{latest.temperature.toFixed(1)} °C</span>
              </div>
              <div className="live-card">
                <span className="live-label">Humidite</span>
                <span className="live-value">{latest.humidity.toFixed(1)} %</span>
              </div>
              <div className="live-card">
                <span className="live-label">Moteur</span>
                <span className={`live-value ${latest.motor ? 'on' : 'off'}`}>
                  {latest.motor ? 'En marche' : 'Arrete'}
                </span>
              </div>
              <div className="live-card">
                <span className="live-label">Ventilateur</span>
                <span className={`live-value ${latest.fan ? 'on' : 'off'}`}>
                  {latest.fan ? 'En marche' : 'Arrete'}
                </span>
              </div>
              <div className="live-card live-card-wide">
                <span className="live-label">Phase</span>
                <span className="live-value">{getPhaseLabel(latest.phase)}</span>
              </div>
              {isEmergency && (
                <div className="live-card live-card-emergency">
                  <span className="live-label">Urgence</span>
                  <span className="live-value">Refroidissement actif</span>
                </div>
              )}
            </div>
          ) : (
            <p className="detail-info">Aucune mesure enregistree.</p>
          )}
        </section>

        <section className="detail-section">
          <h3 className="section-title">Dernieres mesures</h3>

          {measurements.length === 0 ? (
            <p className="detail-info">Aucune mesure disponible.</p>
          ) : (
            <div className="measurements-table-wrapper">
              <table className="measurements-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temp.</th>
                    <th>Hum.</th>
                    <th>Phase</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.timestamp)}</td>
                      <td>{m.temperature.toFixed(1)} °C</td>
                      <td>{m.humidity.toFixed(1)} %</td>
                      <td>{m.phase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}