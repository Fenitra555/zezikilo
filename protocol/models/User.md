# User

## Champs

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Requis, unique | Identifiant unique de lâ€™utilisateur |
| `email` | String | Requis, unique | Adresse email de lâ€™utilisateur |
| `passwordHash` | String | Requis | Mot de passe hachÃ© |
| `fullName` | String | Requis | Nom complet de lâ€™utilisateur |
| `role` | Enum | Requis (`user`, `constructor`, `admin`) | RÃ´le de lâ€™utilisateur |
| `createdAt` | Timestamp | Requis | Date de crÃ©ation |
| `updatedAt` | Timestamp | Requis | DerniÃ¨re mise Ã  jour |
