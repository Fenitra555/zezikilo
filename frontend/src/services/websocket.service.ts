// src/services/websocket.service.ts
import { io, Socket } from 'socket.io-client';

const WS_URL = 'http://localhost:3000';

let socket: Socket | null = null;

export const websocketService = {
  /**
   * Etablit la connexion WebSocket avec le token JWT
   */
  connect(token: string): Socket {
    if (socket?.connected) return socket;

    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[WS] Connecte au backend');
    });

    socket.on('connect_error', (err) => {
      console.error('[WS] Erreur de connexion :', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Deconnecte :', reason);
    });

    return socket;
  },

  /**
   * Ferme la connexion
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Retourne le socket courant (peut etre null)
   */
  getSocket(): Socket | null {
    return socket;
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  }
};