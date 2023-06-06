const { db } = require('./../../database');

class ThemesDB {

  static async getThemesList ({ teacherId, studentId, status }, host) {
    const sql = `
      SELECT	
        t.id,
        p.id AS "processId",
        title,
        description,
        u1.id AS "studentId",
        u1.full_name AS "studentFullName",
        u1.faculty,
        CASE 
					WHEN u1.avatar IS NOT NULL THEN CONCAT('http://${host}', '/images/', u1.avatar)
					ELSE NULL 
				END AS "studentAvatar",
        u2.id AS "advisorId",
        u2.full_name AS "advisorFullName",
        CASE 
					WHEN u2.avatar IS NOT NULL THEN CONCAT('http://${host}', '/images/', u2.avatar)
					ELSE NULL 
				END AS "advisorAvatar",
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
        TRUE
      ${status !== 'all' ? `AND p.status = '${status}'` : ''}
      ${teacherId ? `AND p.advisor_id = ${teacherId}` : ''}
      ${studentId ? `AND p.attached_user_id = ${studentId}` : ''}
      ORDER BY
        p.id
    `;

    const result = await db.query(sql)
    return result.rows || [];
  }

  static async bindStudentToGw (params) {
    await db.query(`
      UPDATE 
        diploma.process
      SET
        attached_user_id = $1,
        status = 'initialized'
      WHERE
        id = $2
    `, params)
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

  static async getPerforming (params, host) {
    const sql = `
      SELECT
        p1.id,
        title,
        JSON_AGG(
          JSONB_BUILD_OBJECT(
            'id', p2.id,
            'link', CASE 
              WHEN p2.filename IS NOT NULL THEN CONCAT('http://${host}/files/', p2.filename)
              ELSE NULL END,
            'filename', p2.filename,
            'done', p2.done_percentage,
            'created_date', TO_CHAR(p2.created_date, 'DD.MM.YYYY HH24:mi:ss'),
            'comment', p2.comment,
            'status', p2.status
          ) ORDER BY p2.created_date
        ) AS details
      FROM
        diploma.phases p1
      LEFT JOIN
        diploma.performing p2 ON p1.id = p2.phase_id AND user_id = $1
      GROUP BY
        p1.id,
        p1.title
    `;

    const result = await db.query(sql, params);
    return result.rows || []
  }

  static async sendRequest (params) {
    const sql = `
      INSERT INTO diploma.performing (
        filename,
        phase_id,
        user_id
      ) VALUES (
        $1, $2, $3
      ) RETURNING id;
    `;

    await db.query(sql, params);
  }

  static async receiveRequest (params) {
    const sql = `
      UPDATE
        diploma.performing
      SET
        status = $2,
        done_percentage = $3,
        comment = $4
      WHERE
        id = $1
    `;
    await db.query(sql, params)
  }

  static async getNews () {
    const sql = `
      SELECT
        id,
        body,
        TO_CHAR(created_datetime, 'DD.MM.YYYY HH24:mi:ss') AS created_datetime
      FROM  
        diploma.news
    `;

    const result = await db.query(sql);
    return result.rows || []
  }

  static async addNews (params) {
    const sql = `
      INSERT into diploma.news (
        body
      ) VALUES (
        $1
      ) RETURNING id
    `;

    await db.query(sql, params);
  }

}

module.exports = ThemesDB;