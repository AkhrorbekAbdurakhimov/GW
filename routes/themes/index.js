const fs = require('fs');
const path = require('path');

const { Router } = require('express');

const { db } = require('./../../database');
const { replaceAll } = require('./../../utils');
const { getThemesListSchema, changeThemeStatusSchema, bindStudentSchema, createThemeSchema, deleteThemeSchema } = require('./schema');

const statuses = [
  { id: 0, status: 'all' },
  { id: 1, status: 'not-selected' },
  { id: 2, status: 'initialized' },
  { id: 3, status: 'pending' },
  { id: 4, status: 'accepted' },
  { id: 5, status: 'declined' },
]

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

  v.status = statuses.find(status => status.id === v.statusId).status;

  const themes = await ThemesDB.getThemesList(v);

  return res.status(200).send(themes);
}

const bindStudent = async (req, res) => {

  if (req.user.role !== 'student') {
    res.status(403).send({
      message: "You can not select the graduation work"
    })
  }

  const { error: err, value: v } = bindStudentSchema.validate(req.body);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }  

  await ThemesDB.bindStudentToGw([req.user.id, v.processId]);

  return res.status(200).send({
    message: "Graduation work was selected successfully"
  })
}

const getStatusesList = async (req, res) => {
  return res.status(200).send(statuses)
}

const changeThemeStatus = async (req, res) => {
  const { error: err, value: v } = changeThemeStatusSchema.validate({ ...req.params, ...req.body });
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  await ThemesDB.changeThemeStatus([v.processId, v.status]);

  return res.status(200).send({
    message: "Graduation work status changed successfully"
  })
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
    message: "Graduation work was created successfully "
  })

}

const deleteTheme = async (req, res) => {
  const { error: err, value: v } = deleteThemeSchema.validate(req.params);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN TRANSACTION');

    await client.query(`
      DELETE FROM
        diploma.process
      WHERE
        theme_id = $1
    `, [v.themeId]);

    await client.query(`
      DELETE FROM
        diploma.themes
      WHERE
        id = $1
    `, [v.themeId]);

    await client.query('COMMIT TRANSACTION')

  } catch (err) {
    console.log(err);
    await client.query('ROLLBACK TRANSACTION')
  }

  return res.status(200).send({
    message: "Graduation work was deleted successfully"
  })

}

const router = Router();

router.get('/list', getThemesList);
router.post('/bind', bindStudent);
router.get('/status/list', getStatusesList);
router.patch('/status/:processId', changeThemeStatus)

router.post('/', createTheme);
router.delete('/:themeId', deleteTheme)

module.exports = router;