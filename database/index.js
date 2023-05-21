const { Pool } = require('pg');
const { DB } = require('./../config')

class Database {
  constructor(config) {
    this.pool = new Pool(config || DB);
  }
  
  query(query, params) {
    return new Promise((resolve, reject) => this.pool.query(query, params, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    }));
  }

  async getClient() {
    const client = await this.pool.connect();
    const { query } = client;
    const { release } = client;
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      /* eslint-disable-next-line */
      console.error('A client has been checked out for more than 5 seconds!');
      /* eslint-disable-next-line */
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);
    // monkey patch the query method to keep track of the last query executed

    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout);
      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  }
}

module.exports = {
  db: new Database()
};