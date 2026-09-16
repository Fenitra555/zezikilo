exports.up = function(knex) {
  return knex.schema.createTable('device_settings', function(table) {
    table.uuid('id').primary();
    table.uuid('deviceId').unique().references('id').inTable('devices').onDelete('CASCADE');
    table.float('tempMaxUrgence').defaultTo(68.0);
    table.float('tempMaxThermophile').defaultTo(62.0);
    table.float('tempMinThermophile').defaultTo(55.0);
    table.float('humiditeMin').defaultTo(40.0);
    table.float('humiditeMax').defaultTo(65.0);
    table.float('tempFinCycle').defaultTo(35.0);
    table.integer('dureeBrassagePhase1').defaultTo(3);
    table.integer('dureeBrassagePhase2').defaultTo(2);
    table.integer('dureeBrassagePhase3').defaultTo(2);
    table.integer('intervallePhase1').defaultTo(2);
    table.integer('intervallePhase2').defaultTo(6);
    table.integer('intervallePhase3').defaultTo(24);
    table.float('tempTransitionP1P2').defaultTo(55.0);
    table.float('tempTransitionP2P3').defaultTo(45.0);
    table.integer('dureeTransitionP2P3').defaultTo(12);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('device_settings');
};
