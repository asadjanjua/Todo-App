// middleware/validateTodo.js
const Joi = require('joi');

const todoSchema = Joi.object({
  text: Joi.string().min(1).max(200).required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  completed: Joi.boolean()
});

module.exports = (req, res, next) => {
  const { error } = todoSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: errors.join(', ') });
  }
  next();
};
