const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { Router } = require('express');

const { replaceAll, saveBase64Image } = require('./../../utils/');

const AdminDB = require('./db');
const { loginSchema, getUsersSchema, registerUserSchema, getUserByIdSchema, deleteUserSchema } = require('./schema');
const { APP } = require('../../config');

const roles = {
  "admin": 1,
  "teacher": 2,
  "student": 3
}

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

  const hasThemeRes = await AdminDB.getTheme([user.id]);

  user.hasTheme = !!(hasThemeRes && hasThemeRes.length)

	const token = jwt.sign({ user }, APP.SECRET_KEY, { expiresIn: APP.SESSION_TIMEOUT })

	return res.status(200).send({
		token,
		user,
		message: "You are successfully logged in!!!"
	});
}

const getSkills = async (req, res) => {
  const skills = await AdminDB.getSkills();
  return res.status(200).send(skills)
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

	const users = await AdminDB.getUsers(v.roleId, req.headers.host);

	return res.status(200).send(users);
}

const registerUser = async (req, res) => {
  const { error: err, value: v } = registerUserSchema.validate(req.body);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  let capacity = 0;
  if (!v.capacity) {
    capacity = v.role === 'teacher' ? 4 : (v.role === 'student' ? 1 : 0);
  } else {
    capacity = v.capacity;
  }

  let filename = null;
  if (v.avatar) {
    filename = saveBase64Image(v.avatar);
  }

  await AdminDB.registerUser([v.username, md5(md5(md5(v.password))), v.fullName, filename, roles[v.role], capacity, v.skills ? `{${v.skills.join(',')}}` : null, v.gpa, v.linkedin, v.faculty, v.position]);

  return res.status(200).send({
    message: "User added successfully"
  })
}

const getUserById = async (req, res) => {
  const { error: err, value: v } = getUserByIdSchema.validate(req.params);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  const user = await AdminDB.getUser([v.userId], req.headers.host)

  return res.status(200).send(user);
}

const deleteUser = async (req, res) => {
  const { error: err, value: v } = deleteUserSchema.validate(req.params);
  if (err) {
    return res.status(400).send({
      error: replaceAll(err.details[0].message, '"', ''),
      warning: '',
      message: '',
    });
  }

  await AdminDB.deleteUser([v.userId]);

  return res.status(200).send({
    message: "User deleted successfully"
  })
}

router.post('/login', login);
router.get('/skills', getSkills);
router.get('/users/:roleId', getUsers);
router.post('/register', registerUser);
router.get('/user/:userId', getUserById);
router.delete('/user/:userId', deleteUser);

module.exports = router;