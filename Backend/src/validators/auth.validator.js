
const Joi = require('joi');


const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Le nom est obligatoire'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Veuillez fournir un email valide',
    'any.required': 'L\'email est obligatoire'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est obligatoire'
  })
});


const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};