# DeviceSetting

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique |
| `deviceId` | UUID | Requis, unique | RÃ©fÃ©rence unique vers lâ€™appareil |
| `tempMaxUrgence` | Float | Requis | TempÃ©rature critique maximale |
| `tempMaxThermophile` | Float | Requis | TempÃ©rature maximale phase thermophile |
| `tempMinThermophile` | Float | Requis | TempÃ©rature minimale phase thermophile |
| `humiditeMin` | Float | Requis | Seuil dâ€™humiditÃ© minimal |
| `humiditeMax` | Float | Requis | Seuil dâ€™humiditÃ© maximal |
| `tempFinCycle` | Float | Requis | TempÃ©rature de fin de cycle |
| `dureeBrassagePhase1` | Integer | Requis | Minutes de brassage P1 |
| `dureeBrassagePhase2` | Integer | Requis | Minutes de brassage P2 |
| `dureeBrassagePhase3` | Integer | Requis | Minutes de brassage P3 |
| `intervallePhase1` | Integer | Requis | Intervalle en heures P1 |
| `intervallePhase2` | Integer | Requis | Intervalle en heures P2 |
| `intervallePhase3` | Integer | Requis | Intervalle en heures P3 |
| `tempTransitionP1P2` | Float | Requis | Seuil de transition P1â†’P2 |
| `tempTransitionP2P3` | Float | Requis | Seuil de transition P2â†’P3 |
| `dureeTransitionP2P3` | Integer | Requis | DurÃ©e de transition P2â†’P3 en heures |
| `updatedAt` | Timestamp | Requis | DerniÃ¨re modification |
