# Alert

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™appareil |
| `type` | Enum | Requis | `critical`, `warning`, `info` |
| `message` | String | Requis | Description de lâ€™alerte |
| `acknowledged` | Boolean | Requis | Statut dâ€™acquittement |
| `acknowledgedBy` | UUID | Nullable | Utilisateur ayant acquittÃ© |
| `timestamp` | Number | Requis | Horodatage Unix en millisecondes |
| `createdAt` | Timestamp | Requis | CrÃ©ation de lâ€™alerte |
