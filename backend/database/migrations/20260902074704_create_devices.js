exports.up = function(knex) {
  return knex.schema.createTable('devices', function(table) {
    table.uuid('id').primary();
    table.string('serialNumber', 12).unique().notNullable();
    table.string('alias');
    table.uuid('ownerId').references('id').inTable('users').onDelete('CASCADE');
    table.string('apiKey').unique().notNullable();
    table.timestamp('lastSyncAt');
    table.string('firmwareVersion').defaultTo('1.0.0');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('devices');
};

