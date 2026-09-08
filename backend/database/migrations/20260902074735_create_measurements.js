exports.up = function(knex) {
  return knex.schema.createTable('measurements', function(table) {
    table.uuid('id').primary();
    table.uuid('deviceId').references('id').inTable('devices').onDelete('CASCADE');
    table.float('temperature').notNullable();
    table.float('humidity').notNullable();
    table.boolean('motor').defaultTo(false);
    table.boolean('fan').defaultTo(false);
    table.integer('phase').checkIn([1, 2, 3]).notNullable();
    table.boolean('emergency').defaultTo(false);
    table.bigInteger('timestamp').notNullable();
    table.string('syncId');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('measurements');
};
