// src/pages/Settings/Settings.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { deviceService } from '../../services/device.service';
import { settingsService } from '../../services/settings.service';
import type { DeviceSettingUpdate } from '../../services/settings.service';
import type { Device } from '../../types';
import './Settings.css';

type FormState = {
  tempMaxUrgence: string;
  tempMaxThermophile: string;
  tempMinThermophile: string;
  tempFinCycle: string;
  tempTransitionP1P2: string;
  tempTransitionP2P3: string;
  dureeTransitionP2P3: string;
  humiditeMin: string;
  humiditeMax: string;
  dureeBrassagePhase1: string;
  intervallePhase1: string;
  dureeBrassagePhase2: string;
  intervallePhase2: string;
  dureeBrassagePhase3: string;
  intervallePhase3: string;
};

const emptyForm: FormState = {
  tempMaxUrgence: '',
  tempMaxThermophile: '',
  tempMinThermophile: '',
  tempFinCycle: '',
  tempTransitionP1P2: '',
  tempTransitionP2P3: '',
  dureeTransitionP2P3: '',
  humiditeMin: '',
  humiditeMax: '',
  dureeBrassagePhase1: '',
  intervallePhase1: '',
  dureeBrassagePhase2: '',
  intervallePhase2: '',
  dureeBrassagePhase3: '',
  intervallePhase3: ''
};

export function Settings() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!deviceId) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [deviceData, settingsData] = await Promise.all([
          deviceService.getById(deviceId),
          settingsService.get(deviceId)
        ]);
        setDevice(deviceData);
        setForm({
          tempMaxUrgence: String(settingsData.tempMaxUrgence),
          tempMaxThermophile: String(settingsData.tempMaxThermophile),
          tempMinThermophile: String(settingsData.tempMinThermophile),
          tempFinCycle: String(settingsData.tempFinCycle),
          tempTransitionP1P2: String(settingsData.tempTransitionP1P2),
          tempTransitionP2P3: String(settingsData.tempTransitionP2P3),
          dureeTransitionP2P3: String(settingsData.dureeTransitionP2P3),
          humiditeMin: String(settingsData.humiditeMin),
          humiditeMax: String(settingsData.humiditeMax),
          dureeBrassagePhase1: String(settingsData.dureeBrassagePhase1),
          intervallePhase1: String(settingsData.intervallePhase1),
          dureeBrassagePhase2: String(settingsData.dureeBrassagePhase2),
          intervallePhase2: String(settingsData.intervallePhase2),
          dureeBrassagePhase3: String(settingsData.dureeBrassagePhase3),
          intervallePhase3: String(settingsData.intervallePhase3)
        });
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

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: DeviceSettingUpdate = {};
      (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
        const value = parseFloat(form[key]);
        if (!isNaN(value)) {
          (payload as Record<string, number>)[key] = value;
        }
      });

      await settingsService.update(deviceId, payload);
      setSuccess('Paramètres enregistrés');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors de l\'enregistrement';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <main className="settings-main">
          <p className="settings-info">Chargement...</p>
        </main>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="settings-page">
        <Header />
        <main className="settings-main">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            &larr; Retour
          </button>
          <p className="settings-error">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />

      <main className="settings-main">
        <button
          className="btn-back"
          onClick={() => navigate(`/devices/${deviceId}`)}
        >
          &larr; Retour à l'appareil
        </button>

        <div className="settings-header">
          <h2 className="settings-title">Paramètres de régulation</h2>
          <p className="settings-subtitle">
            {device?.alias || device?.serialNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* Températures critiques */}
          <fieldset className="settings-fieldset">
            <legend>Températures critiques (°C)</legend>
            <div className="settings-grid">
              <label>
                <span>Max urgence</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempMaxUrgence}
                  onChange={(e) => handleChange('tempMaxUrgence', e.target.value)}
                />
              </label>
              <label>
                <span>Max thermophile</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempMaxThermophile}
                  onChange={(e) => handleChange('tempMaxThermophile', e.target.value)}
                />
              </label>
              <label>
                <span>Min thermophile</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempMinThermophile}
                  onChange={(e) => handleChange('tempMinThermophile', e.target.value)}
                />
              </label>
              <label>
                <span>Fin de cycle</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempFinCycle}
                  onChange={(e) => handleChange('tempFinCycle', e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Transitions */}
          <fieldset className="settings-fieldset">
            <legend>Transitions entre phases</legend>
            <div className="settings-grid">
              <label>
                <span>P1 &rarr; P2 (°C)</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempTransitionP1P2}
                  onChange={(e) => handleChange('tempTransitionP1P2', e.target.value)}
                />
              </label>
              <label>
                <span>P2 &rarr; P3 (°C)</span>
                <input
                  type="number"
                  step="0.5"
                  value={form.tempTransitionP2P3}
                  onChange={(e) => handleChange('tempTransitionP2P3', e.target.value)}
                />
              </label>
              <label>
                <span>Durée transition (h)</span>
                <input
                  type="number"
                  step="1"
                  value={form.dureeTransitionP2P3}
                  onChange={(e) => handleChange('dureeTransitionP2P3', e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Humidité */}
          <fieldset className="settings-fieldset">
            <legend>Humidité (%)</legend>
            <div className="settings-grid">
              <label>
                <span>Minimum</span>
                <input
                  type="number"
                  step="1"
                  value={form.humiditeMin}
                  onChange={(e) => handleChange('humiditeMin', e.target.value)}
                />
              </label>
              <label>
                <span>Maximum</span>
                <input
                  type="number"
                  step="1"
                  value={form.humiditeMax}
                  onChange={(e) => handleChange('humiditeMax', e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Brassage */}
          <fieldset className="settings-fieldset">
            <legend>Cadence de brassage</legend>
            <div className="settings-grid settings-grid-3col">
              <label>
                <span>Phase 1 - Durée (min)</span>
                <input
                  type="number"
                  step="1"
                  value={form.dureeBrassagePhase1}
                  onChange={(e) => handleChange('dureeBrassagePhase1', e.target.value)}
                />
              </label>
              <label>
                <span>Phase 1 - Intervalle (h)</span>
                <input
                  type="number"
                  step="1"
                  value={form.intervallePhase1}
                  onChange={(e) => handleChange('intervallePhase1', e.target.value)}
                />
              </label>
              <label>
                <span>&nbsp;</span>
                <span className="settings-empty" />
              </label>

              <label>
                <span>Phase 2 - Durée (min)</span>
                <input
                  type="number"
                  step="1"
                  value={form.dureeBrassagePhase2}
                  onChange={(e) => handleChange('dureeBrassagePhase2', e.target.value)}
                />
              </label>
              <label>
                <span>Phase 2 - Intervalle (h)</span>
                <input
                  type="number"
                  step="1"
                  value={form.intervallePhase2}
                  onChange={(e) => handleChange('intervallePhase2', e.target.value)}
                />
              </label>
              <label>
                <span>&nbsp;</span>
                <span className="settings-empty" />
              </label>

              <label>
                <span>Phase 3 - Durée (min)</span>
                <input
                  type="number"
                  step="1"
                  value={form.dureeBrassagePhase3}
                  onChange={(e) => handleChange('dureeBrassagePhase3', e.target.value)}
                />
              </label>
              <label>
                <span>Phase 3 - Intervalle (h)</span>
                <input
                  type="number"
                  step="1"
                  value={form.intervallePhase3}
                  onChange={(e) => handleChange('intervallePhase3', e.target.value)}
                />
              </label>
              <label>
                <span>&nbsp;</span>
                <span className="settings-empty" />
              </label>
            </div>
          </fieldset>

          {error && <div className="settings-error">{error}</div>}
          {success && <div className="settings-success">{success}</div>}

          <div className="settings-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/devices/${deviceId}`)}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}