// database/migrations/XXXXXX_create_users.js
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.string('id', 36).primary();
    table.string('email', 255).unique().notNullable();
    table.string('passwordHash', 255).notNullable();
    table.string('fullName', 255).notNullable();
    table.enum('role', ['user', 'constructor', 'admin']).defaultTo('user');
    // Timestamps explicites en camelCase
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
