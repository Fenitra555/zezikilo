exports.up = function(knex) {
  return knex.schema.createTable('device_permissions', function(table) {
    table.uuid('id').primary();
    table.uuid('deviceId').references('id').inTable('devices').onDelete('CASCADE');
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
    table.enum('permission', ['read', 'write', 'admin']).defaultTo('read');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('device_permissions');
};
