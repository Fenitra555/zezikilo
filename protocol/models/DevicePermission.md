# DevicePermission

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™appareil |
| `userId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™utilisateur |
| `permission` | Enum | Requis (`read`, `write`, `admin`) | Niveau dâ€™accÃ¨s |
| `createdAt` | Timestamp | Requis | Date de crÃ©ation |
