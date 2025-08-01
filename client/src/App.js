import logo from './logo.svg';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import CompletedTodos from './components/CompletedTodos';
import ToDo from './components/ToDO';
import Auth from './components/Auth';
import Login from './components/Login';
import { AppProvider } from './AppContext'; 
import Navbar from './components/Navbar';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Inline ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" replace />;
  };

  return (
    <>
    <Navbar/>
    <AppProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sign-up" element={<Auth />} />
          <Route
            path="/todo"
            element={
              <ProtectedRoute>
                <ToDo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <ProtectedRoute>
                <CompletedTodos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AppProvider>
    </>
  );
}

export default App;