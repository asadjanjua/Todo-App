import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [generalErrors, setGeneralErrors] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    let hasError = false;

    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralErrors([]);

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      hasError = true;
    } else if (firstName.trim().length < 3) {
      setFirstNameError('Please enter at least 3 characters for first name');
      hasError = true;
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      hasError = true;
    } else if (lastName.trim().length < 3) {
      setLastNameError('Please enter at least 3 characters for last name');
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (
      !/^(?=[a-zA-Z0-9.]*[a-zA-Z])(?=[a-zA-Z0-9.]*[0-9])(?=[a-zA-Z0-9.]*\.)[a-zA-Z0-9.]+@gmail\.com$/.test(email)
    ) {
      setEmailError('Please enter a valid Gmail address, e.g. example1.a@gmail.com');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    } else if (
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)
    ) {
      setPasswordError('Password must contain at least one uppercase letter and one special character');
      hasError = true;
    }

    return !hasError;
  };

  const handleSignup = async () => {
    setIsLoading(true);

    const isValid = validateInputs();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // If the response is not JSON, leave data as empty object.
      }

      if (!response.ok) {
        // Clear field errors
        setFirstNameError('');
        setLastNameError('');
        setEmailError('');
        setPasswordError('');
        setGeneralErrors([]);

        if (Array.isArray(data.errors)) {
          const otherErrors = [];

          data.errors.forEach((err) => {
            const { field, message } = err;

            switch (field) {
              case 'firstName':
                setFirstNameError(message);
                break;
              case 'lastName':
                setLastNameError(message);
                break;
              case 'email':
                setEmailError(message);
                break;
              case 'password':
                setPasswordError(message);
                break;
              default:
                otherErrors.push(message);
            }
          });

          if (otherErrors.length) {
            setGeneralErrors(otherErrors);
          }
        } else if (data.message) {
          setGeneralErrors([data.message]);
        } else if (data.error) {
          setGeneralErrors([data.error]);
        } else {
          setGeneralErrors(['Signup failed due to an unknown error.']);
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      navigate('/');
    } catch (error) {
      console.error(error);
      setGeneralErrors(['Something went wrong. Please try again.']);
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="auth-container">
      <h1 className="auth-title">Sign Up</h1>
      <p className="auth-subtitle">Create your account</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
      >
        <div>
          <label htmlFor="firstName" style={{
            marginLeft: '4px',
            marginBottom: '0px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            }}>First Name</label>
          <input
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => {setFirstName(e.target.value)
              if (firstNameError) setFirstNameError('')
            }}
            style={{border : firstNameError ? '1px solid red': '' }}
            className="auth-input"
          />
          {firstNameError && (
            <p style={{  color: 'red', margin: '0 0 0 5px', overflowWrap: 'break-word',  fontSize: '12.5px' }}>
              {firstNameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="LastName" style={{
            marginLeft: '4px',
            marginTop:'9px',
            marginBottom: '0px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            }}>Last Name</label>
          <input
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => {setLastName(e.target.value)
              if (lastNameError) setLastNameError('')
            }}
           style={{border : lastNameError ? '1px solid red': '' }}
            className="auth-input"
          />
          {lastNameError && (
            <p style={{ color: 'red', margin: '0 0 0 5px', overflowWrap: 'break-word', fontSize: '12.5px' }}>
              {lastNameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="Email" style={{
            marginLeft: '4px',
            marginBottom: '0px',
            marginTop:'9px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            }}>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => {setEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
           style={{border : emailError ? '1px solid red': '' }}
            className="auth-input"
          />
          {emailError && (
            <p style={{ color: 'red', margin: '0 0 0 5px', overflowWrap: 'break-word', fontSize: '12.5px' }}>
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" style={{
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
            placeholder="Enter password"
            value={password}
            onChange={(e) => {setPassword(e.target.value)
              if (passwordError) setPasswordError('')
            }}
           style={{border : passwordError ? '1px solid red': '' }}
            className="auth-input"
          />
          {passwordError && (
            <p style={{ color: 'red', margin: '0 0 0 5px', overflowWrap: 'break-word', fontSize: '12.5px' }}>
              {passwordError}
            </p>
          )}
        </div>

        <div className="button-container">
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
        {generalErrors.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            {generalErrors.map((err, idx) => (
              <p key={idx} style={{ color: 'red', fontSize: '13px', margin: '2px 0' }}>
                {err}
              </p>
            ))}
          </div>
        )}
      </form>
      <p className="signup-text">
        Already have an account?{' '}
        <button onClick={() => navigate('/')}className="signup-button">
          Login
        </button>
      </p>
    </div>
    </>
  );
};

export default Auth;
