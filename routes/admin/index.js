const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { Router } = require('express');

const { replaceAll } = require('./../../utils/');

const AdminDB = require('./db');
const { loginSchema, getUsersSchema } = require('./schema');
const { APP } = require('../../config');

const router = Router();

const login = async (req, res) => {
  const { error: err, value: v } = loginSchema.validate(req.body);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

	const user = await AdminDB.login([v.login, md5(md5(md5(v.password)))]);

	if (!user) {
		return res.status(404).send({
			message: "Invalid username or password!!!"
		})
	}

	const token = jwt.sign({ user }, APP.SECRET_KEY, { expiresIn: APP.SESSION_TIMEOUT })

	return res.status(200).send({
		token,
		user,
		message: "You are successfully logged in!!!"
	});
}

const getUsers = async (req, res) => {
	const { error: err, value: v } = getUsersSchema.validate(req.params);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

	const users = await AdminDB.getUsers(v.roleId);

	return res.status(200).send(users);
}

router.post('/login', login);
router.get('/users/:roleId', getUsers);

module.exports = router;