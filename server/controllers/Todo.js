const Todo = require('../models/Todo');

// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const { text, priority } = req.body;

    const newTodo = new Todo({
      text,
      priority,
      userId: req.user.id, 
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create todo' });
  }
};

// Get Todos (with admin access)
exports.getTodos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const completed = req.query.completed ? req.query.completed === 'true' : null;

    const query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } 

    if (search) {
      query.text = { $regex: search, $options: 'i' };
    }

    if (completed !== null) {
      query.completed = completed;
    }

    let todos = [];
    let total = 0;

    try {
      todos = await Todo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }

    try {
      total = await Todo.countDocuments(query);
    } catch (err) {
      console.error('Failed to count todos:', err);
    }

    res.json({ todos, total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while getting todos.' });
  }
};





// Update Todo (admin can edit any)
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, priority, completed } = req.body;

    const filter = { _id: id };
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id; 
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      filter,
      { text, priority, completed },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update todo' });
  }
};

// Delete Todo (admin can delete any)
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = { _id: id };
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id; 
    }

    const deletedTodo = await Todo.findOneAndDelete(filter);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete todo' });
  }
};
