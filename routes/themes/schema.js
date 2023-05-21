const Joi = require('joi');

const getThemesListSchema = Joi.object({
  studentId: Joi.number().optional(),
  teacherId: Joi.number().optional()
})

const createThemeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  advisorId: Joi.number().optional()
})

module.exports = { getThemesListSchema, createThemeSchema }