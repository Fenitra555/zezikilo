exports.up = function(knex) {
  return knex.schema.createTable('commands', function(table) {
    table.uuid('id').primary();
    table.uuid('deviceId').references('id').inTable('devices').onDelete('CASCADE');
    table.uuid('userId').references('id').inTable('users').onDelete('SET NULL');
    table.enum('command', ['motor-start', 'motor-stop', 'fan-start', 'fan-stop', 'reset-cycle', 'update-settings']).notNullable();
    table.json('params').defaultTo('{}');
    table.enum('status', ['pending', 'sent', 'acknowledged', 'failed']).defaultTo('pending');
    table.text('result');
    table.timestamp('sentAt');
    table.timestamp('acknowledgedAt');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('commands');
};
