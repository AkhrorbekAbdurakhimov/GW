const Joi = require('joi');

const getThemesListSchema = Joi.object({
  studentId: Joi.number().optional(),
  teacherId: Joi.number().optional(),
})

const changeThemeStatusSchema = Joi.object({
  processId: Joi.number().required(),
  status: Joi.string().required().allow('initialized', 'pending', 'accepted', 'declined'),
})

const createThemeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  advisorId: Joi.number().optional(),
})

const deleteThemeSchema = Joi.object({
  themeId: Joi.number().required(),
})

module.exports = { getThemesListSchema, changeThemeStatusSchema, createThemeSchema, deleteThemeSchema }