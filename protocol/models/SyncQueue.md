# SyncQueue

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™appareil |
| `payload` | JSON | Requis | DonnÃ©es sauvegardÃ©es hors ligne |
| `type` | Enum | Requis | `measurement`, `ack`, `state`, `alert` |
| `status` | Enum | Requis | `pending`, `sent`, `failed` |
| `createdAt` | Timestamp | Requis | Date de mise en file |
| `sentAt` | Timestamp | Nullable | Date de synchronisation |
