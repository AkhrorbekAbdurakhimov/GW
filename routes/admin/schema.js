const Joi = require('joi');

const loginSchema = Joi.object({
  login: Joi.string().required(),
	password: Joi.string().required()
})

const getUsersSchema = Joi.object({
	roleId: Joi.number().required().allow(0, 1, 2, 3)
})

module.exports = {
	loginSchema,
	getUsersSchema,
}