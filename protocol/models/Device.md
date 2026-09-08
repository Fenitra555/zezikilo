# Device

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique de lâ€™appareil |
| `serialNumber` | String | Requis, unique | NumÃ©ro de sÃ©rie matÃ©riel |
| `alias` | String | Optionnel | Nom personnalisÃ© |
| `ownerId` | UUID | Requis | RÃ©fÃ©rence propriÃ©taire |
| `apiKey` | String | Requis, unique | ClÃ© API utilisÃ©e pour authentifier lâ€™ESP32 |
| `lastSyncAt` | Timestamp | Nullable | DerniÃ¨re synchronisation |
| `firmwareVersion` | String | Requis | Version du firmware |
| `createdAt` | Timestamp | Requis | Date de crÃ©ation |
| `updatedAt` | Timestamp | Requis | DerniÃ¨re mise Ã  jour |
