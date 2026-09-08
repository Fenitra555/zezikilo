# Zezik'Ilo – Composteur intelligent connecté

Système de compostage automatisé et connecté, piloté par un ESP32, avec interface Web locale et distante.

## Structure du dépôt

| Dossier | Description |
|---------|-------------|
| `firmware/` | Code ESP32 (PlatformIO) |
| `backend/` | Serveur Node.js (API REST + WebSocket) |
| `frontend/` | Application React (interface distante) |
| `protocol/` | Contrat de données (modèles, API, WebSocket) |
| `docs/` | Documentation du projet |
| `scripts/` | Scripts utilitaires |

## Technologies

- **ESP32** : PlatformIO (C++)
- **Backend** : Node.js + Express + SQLite + Socket.IO
- **Frontend** : React + TypeScript + Zustand
- **Protocole** : JSON / WebSocket

## Démarrage rapide

### 1. Firmware (ESP32)
```bash
cd firmware/Zezikilo-Iot
pio run --target upload