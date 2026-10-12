// src/components/CommandButtons/CommandButtons.tsx
import { useState } from 'react';
import { commandService } from '../../services/command.service';
import type { CommandType } from '../../services/command.service';
import './CommandButtons.css';

interface CommandButtonsProps {
  deviceId: string;
  motorActive: boolean;
  fanActive: boolean;
}

export function CommandButtons({ deviceId, motorActive, fanActive }: CommandButtonsProps) {
  const [loading, setLoading] = useState<CommandType | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sendCommand = async (command: CommandType) => {
    setLoading(command);
    setFeedback(null);

    try {
      await commandService.send(deviceId, command);
      setFeedback({ type: 'success', message: 'Commande envoyee' });
      // Le feedback disparait apres 2 secondes
      setTimeout(() => setFeedback(null), 2000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors de l\'envoi';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="commands-section">
      <h3 className="section-title">Commandes</h3>

      <div className="commands-grid">
        {/* Moteur */}
        <div className="command-group">
          <span className="command-label">
            Moteur {motorActive ? '(en marche)' : '(arrete)'}
          </span>
          <div className="command-buttons">
            <button
              className="btn-command btn-command-start"
              onClick={() => sendCommand('motor-start')}
              disabled={loading !== null || motorActive}
            >
              {loading === 'motor-start' ? '...' : 'Demarrer'}
            </button>
            <button
              className="btn-command btn-command-stop"
              onClick={() => sendCommand('motor-stop')}
              disabled={loading !== null || !motorActive}
            >
              {loading === 'motor-stop' ? '...' : 'Arreter'}
            </button>
          </div>
        </div>

        {/* Ventilateur */}
        <div className="command-group">
          <span className="command-label">
            Ventilateur {fanActive ? '(en marche)' : '(arrete)'}
          </span>
          <div className="command-buttons">
            <button
              className="btn-command btn-command-start"
              onClick={() => sendCommand('fan-start')}
              disabled={loading !== null || fanActive}
            >
              {loading === 'fan-start' ? '...' : 'Demarrer'}
            </button>
            <button
              className="btn-command btn-command-stop"
              onClick={() => sendCommand('fan-stop')}
              disabled={loading !== null || !fanActive}
            >
              {loading === 'fan-stop' ? '...' : 'Arreter'}
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`command-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <p className="command-hint">
        Note : ces commandes seront envoyees a l'ESP32 des qu'il sera connecte
        au backend (fonctionnalite WebSocket, etape suivante).
      </p>
    </section>
  );
}