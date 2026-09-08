// check-tables.js
const db = require('./src/config/database');

async function check() {
  const tables = await db.raw(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);
  console.log('Tables dans la base :');
  tables.forEach(row => console.log(' -', row.name));
  process.exit(0);
}
check();

