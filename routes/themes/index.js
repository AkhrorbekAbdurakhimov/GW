const fs = require('fs');
const path = require('path');

const { Router } = require('express');

const { db } = require('./../../database');
const { replaceAll } = require('./../../utils');
const { getThemesListSchema, createThemeSchema } = require('./schema');

const ThemesDB = require('./db');

const getThemesList = async (req, res) => {
  const { error: err, value: v } = getThemesListSchema.validate(req.query);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  const themes = await ThemesDB.getThemesList(v);

  return res.status(200).send(themes);
}

const createTheme = async (req, res) => {

  if (!['teacher', 'student'].includes(req.user.role)) {
    return res.status(403).send({
      message: "Permission Denied"
    })
  }

  const { error: err, value: v } = createThemeSchema.validate(req.body);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  const client = await db.getClient();

  let processId = null;

  try {
    await client.query('BEGIN TRANSACTION');

    const themeR = (await client.query(`
      INSERT INTO diploma.themes (
        title,
        description,
        created_user_id
      ) VALUES (
        $1, $2, $3
      ) RETURNING id;
    `, [v.title, v.description, req.user.id])).rows || [];

    let attachedUserId = null;
    let status = 'not-selected';
    let advisorId = v.advisorId ? v.advisorId : null;

    if (req.user.role === 'student') {
      attachedUserId = req.user.id;
      status = 'initialized'
    }

    if (req.user.role === 'teacher') {
      advisorId = req.user.id;
    }

    const processR = (await client.query(`
      INSERT INTO diploma.process (
        theme_id,
        attached_user_id,
        advisor_id,
        status
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id
    `, [themeR[0].id, attachedUserId, advisorId, status])).rows || [];

    if (processR.length) {
      processId = processR[0].id;
    }

    await client.query('COMMIT TRANSACTION')

  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK TRANSACTION')
  }

  return res.status(200).send({
    message: "Graduation work successfully inserted"
  })

}

const router = Router();

router.get('/list', getThemesList);
router.post('/create', createTheme);

module.exports = router;