const fs = require('fs');
const path = require('path');

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const Promise = require('bluebird');

const { db } = require('./../../database');
const { replaceAll } = require('./../../utils');
const { getThemesListSchema, createThemeSchema } = require('./schema');

const ThemesDB = require('./db');

const upload = multer();

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

  const { error: err, value: v } = createThemeSchema.validate(req.body);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  const client = await db.getClient();

  let files = [];
  if (req.files && req.files.length) {
    await Promise.each(req.files, async ({ originalname, buffer }) => {
      try {
        let filename = `${uuidv4()}${path.extname(originalname)}`
        fs.writeFileSync(path.join(process.cwd(), 'uploads', filename), buffer)
        files.push(`('${filename}')`);
      } catch (err) {
        console.log(err);
      }
    })
  }

  let processId = null;

  try {
    await client.query('BEGIN TRANSACTION');

    let fileIds = [];
    if (files.length) {
      fileIds = (await client.query(`
        INSERT INTO diploma.files (
          filename
        ) VALUES ${files.join(',')}
        RETURNING id
      `)).rows || [];
    }

    console.log(fileIds.map(file => file.id).join(','));

    const themeR = (await client.query(`
      INSERT INTO diploma.themes (
        title,
        description,
        created_user_id,
        file_ids
      ) VALUES (
        $1, $2, $3, ${files.length ? `'{${fileIds.map(file => file.id).join(',')}}'` : 'NULL'}
      ) RETURNING id;
    `, [v.title, v.description, req.user.id])).rows || [];

    if (v.advisorId && themeR.length) {
      const processR = (await client.query(`
        INSERT INTO diploma.process (
          theme_id,
          attached_user_id,
          advisor_id,
          status
        ) VALUES (
          $1, $2, $3, 'initialized'
        ) RETURNING id
      `, [themeR[0].id, req.user.id, v.advisorId])).rows || [];

      if (processR.length) {
        processId = processR[0].id;
      }
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
router.post('/create', upload.any(), createTheme);

module.exports = router;