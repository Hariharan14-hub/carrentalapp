import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import { Provider } from 'react-redux';
import store from './redux/store';
import VehiclePage from './components/VehiclePage';
import AddVehiclePage from './components/AddVehiclePage';
import BookingPage from './components/BookingPage';

const App = () => {
  return (
    <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/vehicles" element={<VehiclePage />} /> 
        <Route path="/add-vehicle" element={<AddVehiclePage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
      </Routes>
    </Router>
    </Provider> 
  );
};

export default App;
