const { db } = require('./../../database');

class AdminDB {
  static async login (params) {
		const sql = `
			SELECT
				u.id,
				username,
				full_name AS "fullName",
				TO_CHAR(created_at, 'DD.MM.YYYY HH24:mi:ss') AS "joinedAt",
				avatar,
				capacity,
				r.title AS role,
				gpa,
				linkedin,
				faculty,
				position,
				(
					SELECT
						ARRAY_AGG(title)
					FROM
						diploma.skills
					WHERE
						id = ANY (u.skill_ids)
				) AS skills
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

	static async getUsers (role) {
		const sql  = `
			SELECT
				u.id,
				username,
				full_name AS "fullName",
				TO_CHAR(created_at, 'DD.MM.YYYY HH24:mi:ss') AS "joinedAt",
				avatar,
				capacity,
				r.title AS role,
				gpa,
				linkedin,
				faculty,
				position,
				(
					SELECT
						ARRAY_AGG(title)
					FROM
						diploma.skills
					WHERE
						id = ANY (u.skill_ids)
				) AS skills
			FROM
				diploma.users u
			JOIN
				diploma.roles r ON r.id = u.role_id
			${role ? `
			WHERE 
				role_id = ${role}
			` : ''}
		`;

		const result = await db.query(sql);
		return result.rows || [];
	}
}

module.exports = AdminDB;