import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Login.css';
import { login } from '../actions/userActions';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { status, error } = useSelector((state) => state.auth);

    const handleLogin = (e) => {
        e.preventDefault();
         dispatch(login(email, password));
    };

    return (
        <div className="container-fluid vh-100 d-flex">
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-light">
                <img src="/car.jpg" alt="Car" className="img-fluid mb-3" style={{ maxHeight: '300px' }} />
                <p>Go anywhere with comfort and style!</p>
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
                    <form className="w-75" onSubmit={handleLogin}>
                        <h3 className="mb-4 text-center">Login</h3>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                            {status === 'loading' ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="mt-3 text-center">
                            <a>Sign Up</a>
                            <a>forgot-passwordForgot Password?</a>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}

export default Login;