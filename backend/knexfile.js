// knexfile.js
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: './database/migrations'
    }
  }
};
