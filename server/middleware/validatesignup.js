const Joi = require('joi');

const signupSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 3 characters',
    }),

  lastName: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 3 characters',
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .pattern(/^(?=[a-zA-Z0-9.]*[a-zA-Z])(?=[a-zA-Z0-9.]*[0-9])(?=[a-zA-Z0-9.]*\.)[a-zA-Z0-9.]+@gmail\.com$/)
    .required()
    .messages({
      'string.email': 'Email must be a valid email, e.g. example1.a@gmail.com',
      'string.empty': 'Email is required',
      'string.pattern.base': 'Email format is invalid',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).*$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter and one special character',
    }),
});

const validateSignup = (req, res, next) => {
  const { error, value } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map(err => ({
      field: err.context.key,
      message: err.message,
    }));
    return res.status(422).json({ errors });
  }

  req.body = value; // cleaned and trimmed
  next();
};

module.exports = validateSignup;
