const { db } = require('./../../database');

class ThemesDB {

  static async getThemesList ({ teacherId, studentId }) {

    const sql = `
      SELECT	
        t.id,
        p.id AS "processId",
        title,
        description,
        u1.id AS "studentId",
        u1.full_name AS "studentFullName",
        u1.faculty,
        u2.id AS "advisorId",
        u2.full_name AS "advisorFullName",
        status,
        TO_CHAR(p.created_at, 'DD.MM.YYYY HH24:mi:ss') AS "createdAt"
      FROM	
        diploma.process p
      JOIN 
        diploma.themes t ON t.id = p.theme_id 
      LEFT JOIN 
        diploma.users u1 ON u1.id = p.attached_user_id
      LEFT JOIN 
        diploma.users u2 ON u2.id = p.advisor_id
      WHERE
        t.deleted_at IS NULL AND u1.deleted_at IS NULL AND u2.deleted_at IS NULL
      ${teacherId ? `AND p.advisor_id = ${teacherId}` : ''}
      ${studentId ? `AND p.attached_user_id = ${studentId}` : ''}
      ORDER BY
        p.created_at DESC
    `;

    const result = await db.query(sql)
    return result.rows || [];
  }

  static async changeThemeStatus (params) {
    await db.query(`
      UPDATE
        diploma.process
      SET
        status = $2
      WHERE
        id = $1
    `, params)
  }

}

module.exports = ThemesDB;