const Joi = require('joi');

const loginSchema = Joi.object({
  login: Joi.string().required(),
	password: Joi.string().required()
})

const getUsersSchema = Joi.object({
	roleId: Joi.number().required().allow(0, 1, 2, 3)
})

const registerUserSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
	fullName: Joi.string().required(),
	position: Joi.string().optional().allow('', null).default(null),
	avatar: Joi.string().optional().allow('', null).default(null),
	role: Joi.string().allow('admin', 'teacher', 'student').required(),
	gpa: Joi.number().optional().allow(null).default(null),
	faculty: Joi.string().optional().allow('', null).default(null),
	capacity: Joi.number().optional().allow(null).default(null),
	linkedin: Joi.string().optional().allow(null).default(null),
	skills: Joi.array().items(Joi.number().optional()).optional().allow(null).default(null)
})

const getUserByIdSchema = Joi.object({
	userId: Joi.number().required()
})

const deleteUserSchema = Joi.object({
	userId: Joi.number().required()
})

module.exports = {
	loginSchema,
	getUsersSchema,
	deleteUserSchema,
	getUserByIdSchema,
	registerUserSchema
}