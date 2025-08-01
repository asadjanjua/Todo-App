const express = require('express');
const router = express.Router();

const todoController = require('../controllers/Todo');
const authMiddleware = require('../middleware/authMiddleware');
const validateTodo = require('../middleware/validateTodo'); 

router.get('/', authMiddleware, todoController.getTodos);
router.post('/', authMiddleware, validateTodo, todoController.createTodo);
router.put('/:id', authMiddleware, validateTodo, todoController.updateTodo);
router.delete('/:id', authMiddleware, todoController.deleteTodo);

module.exports = router;
