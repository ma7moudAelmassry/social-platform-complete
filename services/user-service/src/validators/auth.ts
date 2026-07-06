import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
      'any.required': 'Username is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  displayName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Display name must be at least 2 characters',
      'string.max': 'Display name must be at most 50 characters',
      'any.required': 'Display name is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(160).optional().allow(''),
  location: Joi.string().max(100).optional().allow(''),
  website: Joi.string().uri().max(200).optional().allow(''),
});
