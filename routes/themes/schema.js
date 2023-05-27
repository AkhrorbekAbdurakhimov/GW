const Joi = require('joi');

const getThemesListSchema = Joi.object({
  studentId: Joi.number().optional(),
  teacherId: Joi.number().optional(),
  statusId: Joi.number().allow(0, 1, 2, 3, 4, 5).optional().default(0)
})

const changeThemeStatusSchema = Joi.object({
  processId: Joi.number().required(),
  status: Joi.string().required().allow('initialized', 'pending', 'accepted', 'declined'),
})

const bindStudentSchema = Joi.object({
  processId: Joi.number().required()
})

const createThemeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  advisorId: Joi.number().optional(),
})

const deleteThemeSchema = Joi.object({
  themeId: Joi.number().required(),
})

module.exports = { getThemesListSchema, changeThemeStatusSchema, bindStudentSchema, bindStudentSchema, createThemeSchema, deleteThemeSchema }