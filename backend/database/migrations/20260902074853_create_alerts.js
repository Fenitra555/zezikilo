exports.up = function(knex) {
  return knex.schema.createTable('alerts', function(table) {
    table.uuid('id').primary();
    table.uuid('deviceId').references('id').inTable('devices').onDelete('CASCADE');
    table.enum('type', ['critical', 'warning', 'info']).notNullable();
    table.text('message').notNullable();
    table.boolean('acknowledged').defaultTo(false);
    table.uuid('acknowledgedBy').references('id').inTable('users').onDelete('SET NULL');
    table.bigInteger('timestamp').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('alerts');
};
