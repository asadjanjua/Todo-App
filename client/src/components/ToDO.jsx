import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useAppContext } from '../AppContext';

const ToDo = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useAppContext();

  const [input, setInput] = useState('');
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState('low');
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [perPage, setPerPage] = useState(5);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const [editingTasks, setEditingTasks] = useState({});

  const fetchTodos = async (currentPage, query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/todos?page=${currentPage}&limit=${perPage}${
          query ? `&search=${encodeURIComponent(query)}` : ''
        }&completed=false`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to load todos');
        return;
      }
      const data = await res.json();
      setTodos(data.todos);
      setTotalRows(data.total);
      setError('');
    } catch (error) {
      console.error('Failed to load todos:', error);
      setError('Failed to load todos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchTodos(page, debouncedSearch);
  }, [page, debouncedSearch, perPage]);

  const addTodo = async () => {
    if (input.trim() === '') {
      setError('Please add a task');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: input,
          priority: priority,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to add todo');
        return;
      }
      fetchTodos(page, debouncedSearch);
      setInput('');
      setPriority('low');
      setError('');
    } catch (error) {
      console.error(error);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to delete todo');
        return;
      }
      fetchTodos(page, debouncedSearch);
      setError('');
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompleted = async (id, currentCompleted) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) {
      setError('Todo not found');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: todo.text,
          priority: todo.priority,
          completed: !currentCompleted,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to toggle todo');
        return;
      }
      fetchTodos(page, debouncedSearch);
      setError('');
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Failed to toggle todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  //  Multi-edit handlers
  const startEditing = (id, currentInput, currentPriority) => {
    setEditingTasks((prev) => ({
      ...prev,
      [id]: { input: currentInput, priority: currentPriority },
    }));
  };

  const updateEditingInput = (id, value) => {
    setEditingTasks((prev) => ({
      ...prev,
      [id]: { ...prev[id], input: value },
    }));
  };

  const updateEditingPriority = (id, value) => {
    setEditingTasks((prev) => ({
      ...prev,
      [id]: { ...prev[id], priority: value },
    }));
  };

  const cancelEditing = (id) => {
    setEditingTasks((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const editTodo = async (id) => {
    const { input, priority } = editingTasks[id];
    if (input.trim() === '') {
      setError('Todo text cannot be empty');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input, priority }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to update todo');
        return;
      }
      const updatedTodo = await res.json();
      const updatedTodos = todos.map((todo) =>
        todo._id === id ? updatedTodo : todo
      );
      setTodos(updatedTodos);
      cancelEditing(id);
      setError('');
    } catch (error) {
      console.error(error);
      setError('Failed to update todo');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.trimStart());
    setError('');
  };

  return (
    <>
      <div className="todo-container">
        <h2 className="todo-heading">📝 Todo App</h2>
        <div className="todo-search-group">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search todos..."
            className="todo-search-input"
          />
          <button
            onClick={() => navigate('/completed')}
            className="completed-tasks-button"
          >
            Completed Tasks
          </button>
        </div>
        <div className="todo-input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
            placeholder="Add a task"
            className="todo-input"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="todo-priority-select"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={addTodo} className="todo-button" disabled={isLoading}>
            Add
          </button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
        {isLoading && (
          <div className="loading-container">
            <span className="loading-icon">
              <div className="spinner"></div>
            </span>
          </div>
        )}
        <DataTable
          columns={[
            {
              name: 'Task',
              selector: (row) => row.text,
              sortable: true,
              grow: 2,
              cell: (row) =>
                editingTasks[row._id] ? (
                  <input
                    type="text"
                    className="todo-edit-input"
                    value={editingTasks[row._id].input}
                    onChange={(e) =>
                      updateEditingInput(row._id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') editTodo(row._id);
                    }}
                  />
                ) : (
                  <span
                    className="todo-text"
                    style={{
                      textDecoration: row.completed ? 'line-through' : 'none',
                      marginLeft: '8px',
                    }}
                  >
                    {row.text}
                  </span>
                ),
            },
            {
              name: 'Priority',
              selector: (row) => row.priority,
              sortable: true,
              sortFunction: (a, b) =>
                priorityOrder[a.priority] - priorityOrder[b.priority],
              cell: (row) =>
                editingTasks[row._id] ? (
                  <select
                    value={editingTasks[row._id].priority}
                    onChange={(e) =>
                      updateEditingPriority(row._id, e.target.value)
                    }
                    className="todo-priority-select"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                ) : (
                  <span
                    className="todo-priority"
                    style={{
                      color:
                        row.priority === 'high'
                          ? 'red'
                          : row.priority === 'medium'
                          ? 'orange'
                          : 'green',
                      fontWeight: 'bold',
                      marginLeft: '10px',
                    }}
                  >
                    [{row.priority}]
                  </span>
                ),
            },
            {
              name: 'Completed',
              selector: (row) => row.completed,
              sortable: true,
              width: '100px',
              cell: (row) => (
                <input
                  type="checkbox"
                  checked={row.completed}
                  onChange={() => toggleCompleted(row._id, row.completed)}
                  className="todo-checkbox"
                  disabled={isLoading}
                />
              ),
            },
            {
              name: 'Actions',
              width: '200px',
              cell: (row) =>
                editingTasks[row._id] ? (
                  <>
                    <button
                      className="todo-save-button"
                      onClick={() => editTodo(row._id)}
                      disabled={isLoading}
                    >
                      Save
                    </button>
                    <button
                      className="todo-cancel-button"
                      onClick={() => cancelEditing(row._id)}
                      disabled={isLoading}
                      style={{ marginLeft: '5px' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {!row.completed && (
                      <button
                        className="todo-edit-button"
                        onClick={() =>
                          startEditing(row._id, row.text, row.priority)
                        }
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="todo-delete-button"
                      onClick={() => {
                        setTodoToDelete(row._id);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={isLoading}
                      style={{ marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </>
                ),
              ignoreRowClick: true,
              allowOverflow: true,
              button: true,
            },
          ]}
          data={todos}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={perPage}
          onChangePage={(newPage) => setPage(newPage)}
          onChangeRowsPerPage={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          paginationRowsPerPageOptions={[5, 10, 15]}
          highlightOnHover
          pointerOnHover
          progressPending={isLoading}
          noDataComponent={
            <div style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
              No tasks yet. Add your first task!
            </div>
          }
        />
        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <p>Are you sure you want to delete this task?</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-delete-button"
                  onClick={() => {
                    deleteTodo(todoToDelete);
                    setShowDeleteConfirm(false);
                    setTodoToDelete(null);
                  }}
                >
                  Delete
                </button>
                <button
                  className="confirm-cancel-button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTodoToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ToDo;
