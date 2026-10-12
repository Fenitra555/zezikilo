// src/components/AddDeviceModal/AddDeviceModal.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { deviceService } from '../../services/device.service';
import type { Device } from '../../types';
import './AddDeviceModal.css';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (device: Device) => void;
}

export function AddDeviceModal({ isOpen, onClose, onSuccess }: AddDeviceModalProps) {
  const [serialNumber, setSerialNumber] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const device = await deviceService.create(serialNumber, alias || undefined);
      onSuccess(device);
      // Reset du formulaire
      setSerialNumber('');
      setAlias('');
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors de l\'ajout';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Ajouter un appareil</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Numero de serie</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="ex : a0b7c8d9e0f1"
              required
              maxLength={12}
            />
            <small className="hint">
              12 caracteres hexadecimaux, inscrits sur l'etiquette de l'appareil
            </small>
          </div>

          <div className="form-group">
            <label>Alias (optionnel)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="ex : Composteur Jardin"
              maxLength={50}
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}