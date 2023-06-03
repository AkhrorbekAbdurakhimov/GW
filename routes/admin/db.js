const { param } = require('.');
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

	static async getUsers (role, host) {
		const sql  = `
			SELECT
				u.id,
				username,
				full_name AS "fullName",
				TO_CHAR(created_at, 'DD.MM.YYYY HH24:mi:ss') AS "joinedAt",
				CASE 
					WHEN avatar IS NOT NULL THEN CONCAT('http://${host}', '/images/', avatar)
					ELSE NULL 
				END AS avatar,
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
			ORDER BY
				u.role_id, username
		`;

		const result = await db.query(sql);
		return result.rows || [];
	}

	static async getSkills () {
		const sql = `
			SELECT
				*
			FROM
				diploma.skills
		`;

		const result = await db.query(sql);
		return result.rows || [];
	}

	static async registerUser (params) {
		const sql = `
			INSERT INTO diploma.users (
				username, 
				password,
				full_name,
				avatar,
				role_id,
				capacity,
				skill_ids,
				gpa,
				linkedin,
				faculty,
				position
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
			)
		`;

		await db.query(sql, params)
	}

	static async getUser (params, host) {
			const sql = `
				SELECT
					u.id,
					username,
					full_name AS "fullName",
					TO_CHAR(created_at, 'DD.MM.YYYY HH24:mi:ss') AS "joinedAt",
					CASE 
						WHEN avatar IS NOT NULL THEN CONCAT('http://${host}', '/images/', avatar)
						ELSE NULL 
					END AS avatar,
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
					u.id = $1;
			`;

			const result = await db.query(sql, params);
			return result.rows && result.rows.length ? result.rows[0] : {}
	}
	
	static async deleteUser (params) {
		const sql = `
			DELETE FROM
				diploma.users
			WHERE
				id = $1
		`;

		await db.query(sql, params)
	}
}

module.exports = AdminDB;