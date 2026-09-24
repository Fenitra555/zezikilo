// tests/seed-alert.js
const db = require('../src/config/database');
const crypto = require('crypto');

async function seed() {
  // Récupérer le premier appareil disponible
  const device = await db('devices').first();

  if (!device) {
    console.error('❌ Aucun appareil en base. Créez-en un d\'abord via l\'API.');
    process.exit(1);
  }

  const id = crypto.randomUUID();
  await db('alerts').insert({
    id,
    deviceId: device.id,
    type: 'critical',
    message: 'Température > 68°C, refroidissement d\'urgence',
    acknowledged: false,
    timestamp: Date.now()
  });

  console.log('✅ Alerte créée :', id);
  console.log('   → attachée à l\'appareil :', device.id, `(${device.serialNumber})`);
  process.exit(0);
}

seed().catch(err => { console.error('❌', err); process.exit(1); });