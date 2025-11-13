import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, login } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    dispatch(login({ email, password })).then((res) => {
      if (!res.error) {
        navigate('/vehicles');
      }
    });
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-75 shadow rounded overflow-hidden">
        <div className="col-md-6 bg-primary text-white d-flex flex-column justify-content-center align-items-center p-5">
          <h2 className="fw-bold mb-3">Welcome to CarRental</h2>
          <p className="lead text-center">Wherever you go, we’ve got your wheels.</p>
        </div>

        <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <h3 className="mb-4 text-center">Login</h3>

          <div style={{ minHeight: '48px' }}>
            {error && <div className="alert alert-danger py-2 text-center">Invalid username or password</div>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-decoration-none me-3">Forgot Password?</Link>
            <Link to="/signup" className="text-decoration-none">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
