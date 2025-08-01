import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setEmailError('');
    setPasswordError('');
    setServerError('');

    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setEmailError(data.errors.email || '');
          setPasswordError(data.errors.password || '');
        } else if (data.message) {
          setServerError(data.message);
        } else {
          setServerError('Login failed.');
        }
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/todo');
    } catch (error) {
      console.error(error);
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Welcome!</h1>
      <p className="login-subtitle">Please login to continue.</p>

      <div>
        <label htmlFor="Email" style={{
            marginLeft: '4px',
            marginBottom: '0px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            }}>Email</label>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => {setEmail(e.target.value)
            if (emailError) setEmailError('')
          }}
         style={{border : emailError ? '1px solid red': '' }}
          className="login-input"
        />
        {emailError && (
          <p style={{ color: 'red', margin: '0 0 0 5px', fontSize: '13px' }}>{emailError}</p>
        )}
      </div>

      <div>
        <label htmlFor="Password" style={{
            marginLeft: '4px',
            marginBottom: '0px',
            marginTop:'9px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            }}>Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {setPassword(e.target.value)
            if (passwordError) setPasswordError('')
          }}
         style={{border : passwordError ? '1px solid red': '' }}
          className="login-input"
        />
        {passwordError && (
          <p style={{ color: 'red', margin: '0 0 0 5px', fontSize: '13px' }}>{passwordError}</p>
        )}
      </div>

      <div className="button-container">
        <button onClick={handleLogin} className="login-button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {isLoading && <span className="loading-icon active"><div className="spinner"></div></span>}
      </div>

      {serverError && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '13px' }}>{serverError}</p>
      )}

      <p className="signup-text">
        Don't have an account?{' '}
        <button onClick={() => navigate('/sign-up')} className="signup-button">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
