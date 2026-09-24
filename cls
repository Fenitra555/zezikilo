[33mcommit d53e4d5e4c38fc1865a01f33f7e61d6f8bd47404[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Thu Sep 24 10:38:52 2026 +0300

    feat(ws): creation d'alertes via WebSocket
    
    - Fonction handleAlert dans ws/index.js (verification device + stockage + diffusion)
    - Handler socket.on('alert') cote ESP32
    - Bouton 'Envoyer une alerte' dans esp32-simulator.html
    - Listener 'alert' dans ws-test.html
    - Suppression des routes specifiques dupliquees dans ws/index.js
    
    Closes BE-008.7

[33mcommit fb6cd11c0d339e51f8c57c74a4175dce6414d3bf[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Thu Sep 24 10:14:16 2026 +0300

    feat(backend): routes Permissions (partage d'appareils)
    
    - Modele DevicePermission (create, findByDevice, findByDeviceAndUser, update, delete, hasPermission)
    - Route GET /api/devices/:deviceId/permissions
    - Route POST /api/devices/:deviceId/permissions (partage par email)
    - Route PUT /api/devices/:deviceId/permissions/:userId
    - Route DELETE /api/devices/:deviceId/permissions/:userId
    - Middleware checkAdminAccess (proprietaire ou permission admin)
    - Interdiction de modifier/supprimer les droits du proprietaire
    
    Closes BE-007

[33mcommit eabee33fe1f0d4a3550c30179c95fb030b57da06[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Thu Sep 24 09:39:34 2026 +0300

    feat(backend): routes Alerts (GET + acknowledge)
    
    - Modele Alert (create, findById, findByDevice, acknowledge)
    - Route GET /api/devices/:deviceId/alerts avec filtre acknowledged
    - Route POST /api/devices/:deviceId/alerts/:alertId/acknowledge
    - Middleware d'acces verifie que l'utilisateur possede l'appareil
    - Script tests/seed-alert.js pour injecter des alertes de test
    
    Closes BE-006

[33mcommit 5b00cf2462c2114e2f9d00700dc6466d05d00815[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 11:15:16 2026 +0300

    feat(ws): relais complet des commandes et acquittements
    
    - ESP32 rejoint automatiquement sa room a la connexion
    - Verification de presence de l'ESP32 avant envoi d'une commande
    - Insertion de la commande en base (table commands)
    - Relais du command au device concerne
    - Reception du command-ack et mise a jour du statut en base
    - Diffusion du command-ack aux clients abonnes
    
    Closes BE-008.5, BE-008.6

[33mcommit 823f5f3a7f475451a6ecaba7d6e97ed797a1d84f[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 10:20:38 2026 +0300

    feat(ws): reception device-state et diffusion temps reel
    
    - Authentification double : JWT (user) ou apiKey (device/ESP32)
    - Reception des device-state de l'ESP32 et insertion en base (measurements)
    - Mise a jour de lastSyncAt sur l'appareil
    - Diffusion du device-state aux clients abonnes a la room
    - Page esp32-simulator.html pour tester la connexion appareil
    - Compatible avec le firmware ESP32 reel (meme protocole)
    
    Closes BE-008.4

[33mcommit 74b5ed970fe6165538033d928da7b67b701a82fa[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 10:07:10 2026 +0300

    feat(ws): gestion des rooms par appareil
    
    - Verification des permissions (ownerId ou device_permissions)
    - Message subscribe/unsubscribe pour rejoindre une room
    - Room nommee device:<deviceId>
    - Diffusion ciblee aux clients abonnes
    - Page ws-test.html mise a jour avec champ deviceId
    
    Closes BE-008.3

[33mcommit 577909c81ef2c879559aea942be70eaa033368c8[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 10:02:19 2026 +0300

    feat(ws): serveur Socket.IO avec authentification JWT
    
    - Installation de socket.io
    - Fichier src/ws/index.js : initialisation + middleware JWT
    - Mise a jour de src/index.js (http.createServer + server.listen)
    - Page public/ws-test.html pour tester la connexion
    - Le client doit envoyer auth.token a la connexion
    
    Closes BE-008.1, BE-008.2

[33mcommit 27a333582016948c44af0dac047849e2d73176d3[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 09:42:16 2026 +0300

    feat(backend): routes Settings (GET/PUT parametres de regulation)
    
    - Modele DeviceSetting (findByDevice, update)
    - Route GET /api/devices/:deviceId/settings
    - Route PUT /api/devices/:deviceId/settings (filtrage des champs autorises)
    - Middleware d'acces verifie que l'utilisateur possede l'appareil
    - 3 nouveaux tests dans tests/api.http
    
    Closes BE-005

[33mcommit 8a4493787e856a3232644ec53a6d3c37f767d456[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 09:35:43 2026 +0300

    feat(backend): routes Measurements avec pagination et filtres
    
    - Modele Measurement (create, findByDevice, countByDevice, findLatest)
    - Route GET /api/devices/:deviceId/measurements (pagination + filtres date)
    - Route POST pour tests manuels
    - Middleware d'acces verifie que l'utilisateur possede l'appareil
    - 7 nouveaux tests dans tests/api.http (creation + pagination + filtres)
    
    Closes BE-004

[33mcommit 6f53431d605082c992ea3f5451126519cd1e5b96[m
Author: Aina Fenitra Fitiavana ANDRIAMAMONJY <fenitra561@gmail.com>
Date:   Wed Sep 16 09:26:30 2026 +0300

    feat(backend): authentification JWT + routes Devices CRUD
    
    - Correction du bug UUID (crypto.randomUUID cote Node.js)
    - Correction des timestamps (createdAt/updatedAt en camelCase)
    - Implementation des routes Devices (GET, POST, PUT, DELETE)
    - Middleware auth applique a toutes les routes protegees
    - Fichier de test REST Client avec captures automatiques
    - Health check operationnel
    
    Closes BE-001, BE-002, BE-003

[33mcommit 7132842637752d123231ffe0a7476aada2917db3[m
Author: Fenitra <fenitra561@gmail.com>
Date:   Tue Sep 8 10:55:19 2026 +0300

    Premier commit : structure monorepo Zezik'Ilo
    
    - firmware/ : code ESP32 (PlatformIO)
    - backend/ : serveur Node.js (Express + SQLite + JWT)
    - protocol/ : contrat de données (API, modèles, WebSocket)
    - docs/ : documentation
    
    État : Backend opérationnel (health check OK)
           Firmware à tester (PlatformIO)
    
    Prochaine étape : BE-003 Routes Devices
