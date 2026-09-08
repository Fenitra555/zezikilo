# Measurement

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis | RÃ©fÃ©rence vers lâ€™appareil |
| `temperature` | Float | Requis | TempÃ©rature en Â°C |
| `humidity` | Float | Requis | HumiditÃ© en % |
| `motor` | Boolean | Requis | Ã‰tat du moteur |
| `fan` | Boolean | Requis | Ã‰tat du ventilateur |
| `phase` | Integer | Requis (`1`, `2`, `3`) | Phase de compostage |
| `emergency` | Boolean | Requis | Mode urgence activÃ© |
| `timestamp` | Number | Requis | Horodatage Unix en millisecondes |
| `syncId` | String | Optionnel | Identifiant de dÃ©duplication |
| `createdAt` | Timestamp | Requis | Insertion en base |
