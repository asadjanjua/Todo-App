import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useAppContext } from '../AppContext';

const CompletedTodos = () => {
  const navigate = useNavigate();
  const { isLoading, setIsLoading } = useAppContext();

  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [perPage, setPerPage] = useState(5);

  const fetchTodos = async (currentPage, query = '') => {
    setIsLoading(true); // Start loading
    try {
      const res = await fetch(
        `http://localhost:5000/api/todos?page=${currentPage}&limit=${perPage}${query ? `&search=${encodeURIComponent(query)}` : ''}&completed=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
        setError('Failed to load completed todos');
        return;
      }
      const data = await res.json();
      setTodos(data.todos);
      setTotalRows(data.total);
      setError('');
    } catch (error) {
      console.error('Failed to load completed todos:', error);
      setError('Failed to load completed todos. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchTodos(page, debouncedSearch);
  }, [page, debouncedSearch, perPage]);

  const deleteTodo = async (id) => {
    setIsLoading(true); // Start loading
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      setIsLoading(false); // Stop loading
    }
  };

  const toggleCompleted = async (id, currentCompleted) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) {
      setError('Todo not found');
      return;
    }
    setIsLoading(true); // Start loading
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
      setIsLoading(false); // Stop loading
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
    <div className="todo-container">
      <h2 className="todo-heading">📝 Completed Todos</h2>
      <div className="todo-search-group">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search completed todos..."
          className="todo-search-input"
        />
        <button
          onClick={() => navigate('/todo')}
          className="all-tasks-button"
        >
          All Tasks
        </button>
      </div>
      {error && <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>}
      {isLoading && (
        <div className="loading-container">
          <span className="loading-icon"><div className="spinner"></div></span>
        </div>
      )}
      <DataTable
        columns={[
          {
            name: 'Task',
            selector: (row) => row.text,
            sortable: true,
            grow: 2,
            cell: (row) => (
              <span
                className="todo-text"
                style={{
                  textDecoration: 'line-through',
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
            cell: (row) => (
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
                disabled={isLoading} // Disable during loading
              />
            ),
          },
          {
            name: 'Actions',
            width: '100px',
            cell: (row) => (
              <button
                className="todo-delete-button"
                onClick={() => deleteTodo(row._id)}
                disabled={isLoading} // Disable during loading
              >
                Delete
              </button>
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
        paginationPerPage={5}
        onChangePage={(newPage) => setPage(newPage)}
         onChangeRowsPerPage={(newPerPage, currentPage)=>{
          setPerPage(newPerPage)
          setPage(1)
        }}
        paginationRowsPerPageOptions={[5, 10, 15]}
        highlightOnHover
        pointerOnHover
        progressPending={isLoading} // Built-in loading state for DataTable
         noDataComponent={
          <div style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
               No tasks Completed yet!
          </div>
          }
      />
    </div>
  );
};

export default CompletedTodos;