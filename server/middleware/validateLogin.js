const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Email must be a valid email',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      const field = detail.path[0];
      errors[field] = detail.message;
    });
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = validateLogin;
