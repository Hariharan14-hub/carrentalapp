import React, { useState } from 'react';
import { forgotPassword } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(formData);
      setSuccess('Password updated successfully! Please login.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h3 className="text-center mb-3">Forgot Password</h3>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}
        {success && <div className="alert alert-success text-center py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input type="password" name="newPassword" className="form-control" onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary w-100">Reset Password</button>
        </form>

        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
