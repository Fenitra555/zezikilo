# Command

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™appareil |
| `userId` | UUID | Optionnel | Utilisateur Ã©metteur |
| `command` | Enum | Requis | Type de commande |
| `params` | JSON | Optionnel | ParamÃ¨tres additionnels |
| `status` | Enum | Requis | `pending`, `sent`, `acknowledged`, `failed` |
| `result` | String | Nullable | Message de retour |
| `sentAt` | Timestamp | Nullable | Envoi Ã  lâ€™ESP32 |
| `acknowledgedAt` | Timestamp | Nullable | AccusÃ© de rÃ©ception |
| `createdAt` | Timestamp | Requis | CrÃ©ation de la commande |
