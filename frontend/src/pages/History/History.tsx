// src/pages/History/History.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { deviceService } from '../../services/device.service';
import { measurementService } from '../../services/measurement.service';
import type { Device, Measurement } from '../../types';
import './History.css';

const PAGE_SIZE = 20;

type Period = '24h' | '7d' | '30d' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '24h': '24 heures',
  '7d': '7 jours',
  '30d': '30 jours',
  'all': 'Tout'
};

function getStartDate(period: Period): number | undefined {
  const now = Date.now();
  switch (period) {
    case '24h': return now - 24 * 60 * 60 * 1000;
    case '7d': return now - 7 * 24 * 60 * 60 * 1000;
    case '30d': return now - 30 * 24 * 60 * 60 * 1000;
    case 'all': return undefined;
  }
}

export function History() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [period, setPeriod] = useState<Period>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charge le device une seule fois
  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;

    const fetchDevice = async () => {
      try {
        const data = await deviceService.getById(deviceId);
        if (!cancelled) setDevice(data);
      } catch {
        if (!cancelled) setError('Appareil introuvable');
      }
    };

    fetchDevice();

    return () => { cancelled = true; };
  }, [deviceId]);

  // Charge les mesures quand page ou period change
  // (Pas de setState synchrone ici : tout se passe apres les await)
  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;

    const fetchMeasurements = async () => {
      try {
        const startDate = getStartDate(period);
        const data = await measurementService.list(deviceId, {
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          startDate
        });
        if (cancelled) return;
        setMeasurements(data.measurements);
        setTotal(data.pagination.total);
        setError('');
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          || 'Erreur lors du chargement';
        setError(message);
        setLoading(false);
      }
    };

    fetchMeasurements();

    return () => { cancelled = true; };
  }, [deviceId, page, period]);

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    setLoading(true);
    setError('');
    setPeriod(newPeriod);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setError('');
    setPage(newPage);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="history-page">
      <Header />

      <main className="history-main">
        <button
          className="btn-back"
          onClick={() => navigate(`/devices/${deviceId}`)}
        >
          &larr; Retour à l'appareil
        </button>

        <div className="history-header">
          <h2 className="history-title">Historique des mesures</h2>
          <p className="history-subtitle">
            {device?.alias || device?.serialNumber || '...'}
          </p>
        </div>

        <div className="history-filters">
          <span className="filters-label">Période :</span>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              className={`filter-btn ${period === p ? 'active' : ''}`}
              onClick={() => handlePeriodChange(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="history-info">
          {!loading && (
            <span>
              {total} mesure{total !== 1 ? 's' : ''} sur la période
            </span>
          )}
        </div>

        {loading && <p className="history-state">Chargement...</p>}

        {error && <p className="history-error">{error}</p>}

        {!loading && !error && measurements.length === 0 && (
          <div className="history-empty">
            <p>Aucune mesure sur cette période.</p>
          </div>
        )}

        {!loading && !error && measurements.length > 0 && (
          <>
            <div className="measurements-table-wrapper">
              <table className="measurements-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temp.</th>
                    <th>Hum.</th>
                    <th>Moteur</th>
                    <th>Vent.</th>
                    <th>Phase</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.timestamp)}</td>
                      <td>{m.temperature.toFixed(1)} °C</td>
                      <td>{m.humidity.toFixed(1)} %</td>
                      <td className={m.motor ? 'cell-on' : 'cell-off'}>
                        {m.motor ? 'Oui' : 'Non'}
                      </td>
                      <td className={m.fan ? 'cell-on' : 'cell-off'}>
                        {m.fan ? 'Oui' : 'Non'}
                      </td>
                      <td>{m.phase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="history-pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  &larr; Précédent
                </button>

                <span className="page-info">
                  Page {page + 1} sur {totalPages}
                </span>

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Suivant &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}