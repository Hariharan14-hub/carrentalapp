import React, { useState } from 'react';
import { signupUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(formData);
      alert('Signup successful! Please login.');
      navigate('/');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h3 className="text-center mb-3">Sign Up</h3>
        {error && <div className="alert alert-danger text-center py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" name="name" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="text" name="phone" className="form-control" onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
