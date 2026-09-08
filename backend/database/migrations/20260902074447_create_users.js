// database/migrations/XXXXXX_create_users.js
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    // SQLite : on utilise string pour l'id, et on laisse l'application générer les UUID
    table.string('id', 36).primary();
    table.string('email', 255).unique().notNullable();
    table.string('passwordHash', 255).notNullable();
    table.string('fullName', 255).notNullable();
    table.enum('role', ['user', 'constructor', 'admin']).defaultTo('user');
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
