const { db } = require('./../../database');

class AdminDB {
  static async login (params) {
		const sql = `
			SELECT
				u.id,
				username,
				full_name,
				TO_CHAR(created_at, 'DD.MM.YYYY HH24:mi:ss'),
				avatar,
				capacity,
				r.title AS role
			FROM
				diploma.users u
			JOIN
				diploma.roles r ON r.id = u.role_id
			WHERE
				username = $1 AND password = $2
		`;

		const result = await db.query(sql, params);
		return result.rows && result.rows.length ? result.rows[0] : null;
  }

	static async getUsers (params) {
		const sql  = `
			SELECT
				u.id, 
				username,
				r.title AS role,
				avatar,
				full_name,
				capacity,
				TO_CHAR(created_at, 'DD.MM.YYYY hh24:mi:ss') AS created_at
			FROM
				diploma.users u
			JOIN
				diploma.roles r ON r.id = u.role_id
			WHERE
				role_id = $1
		`;

		const result = await db.query(sql, params);
		return result.rows || [];
	}
}

module.exports = AdminDB;