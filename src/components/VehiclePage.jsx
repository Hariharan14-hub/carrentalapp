// src/components/VehiclePage.jsx
import React, { useEffect, useState } from 'react';
import vehicleApi from '../api/vehicleApi';
import bookingApi from '../api/bookingApi';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem('email');

  // Check query params for Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('bookingId');
    const vehicleId = params.get('vehicleId');
    const status = params.get('status');

    if (bookingId && vehicleId && status) {
      handlePostPayment(bookingId, vehicleId, status);
    }
  }, [location.search]);

  const handlePostPayment = async (bookingId, vehicleId, status) => {
    try {
      if (status === 'success') {
        await bookingApi.updateStatus(bookingId);
        await vehicleApi.updateAvailability(vehicleId, false);
        setMessage({ type: 'success', text: 'Booking successful!' });
      } else {
        setMessage({ type: 'error', text: 'Booking failed or cancelled!' });
      }
      // Remove query params from URL so refresh won't repeat API calls
      navigate('/vehicles', { replace: true });

      // Hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

      fetchVehicles();
    } catch (err) {
      console.error('Error updating booking/vehicle:', err);
      setMessage({ type: 'error', text: 'Something went wrong!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };


  // Fetch all available vehicles
  const fetchVehicles = async () => {
    try {
      const response = await vehicleApi.getAllVehicles();
      const vehicleList = response.data;

      const vehiclesWithImages = await Promise.all(
        vehicleList.map(async (v) => {
          try {
            const imgResponse = await vehicleApi.getImageById(v.vehicleId, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(imgResponse.data);
            return { ...v, image: imageUrl };
          } catch {
            return { ...v, image: null };
          }
        })
      );
      setVehicles(vehiclesWithImages);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/');
  };

  const handleBookNow = (vehicleId) => {
    navigate(`/booking/${vehicleId}`);
  };

  return (
    <div className="container-fluid p-0" style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="bg-dark text-white d-flex justify-content-between align-items-center p-3" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <h3 className="mb-0">🚗 DriveEasy</h3>
        <div className="d-flex align-items-center position-relative">
          <span className="me-4 fst-italic">"Find your ride, fuel your journey"</span>
          <div className="position-relative">
            <FaUserCircle size={32} onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }} />
            {showDropdown && (
              <div className="position-absolute end-0 mt-2 bg-white text-dark rounded shadow p-2" style={{ zIndex: 2000, minWidth: '160px' }}>
                <p className="mb-1 fw-bold text-truncate" title={email}>{email}</p>
                <button className="btn btn-sm btn-outline-dark w-100 mb-2" onClick={() => { setShowDropdown(false); navigate('/add-vehicle'); }}>View Profile</button>
                <button className="btn btn-sm btn-danger w-100" onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} text-center mt-3`} role="alert">
          {message.text}
        </div>
      )}

      {/* Vehicle List */}
      <div className="container mt-4">
        <h4 className="text-center mb-4">Available Vehicles</h4>
        <div className="row">
          {vehicles.length === 0 ? (
            <p className="text-center text-muted">No vehicles available</p>
          ) : (
            vehicles.map((v) => (
              <div className="col-md-3 mb-4" key={v.vehicleId}>
                <div className="card shadow-sm h-100 border-0" style={{ position: 'relative', zIndex: 1 }}>
                  {v.image ? (
                    <img src={v.image} className="card-img-top" alt={v.model} style={{ height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-secondary text-white text-center py-5">No Image</div>
                  )}
                  <div className="card-body text-center">
                    <h5 className="fw-bold">{v.brand}</h5>
                    <p className="mb-1">{v.model}</p>
                    <small className="text-muted">{v.year} • {v.fuelType}</small>
                    <p className="fw-bold mt-2">₹{v.rentPerDay}/day</p>
                    <button className="btn btn-sm btn-primary" onClick={() => handleBookNow(v.vehicleId)} disabled={!v.available}>
                      {v.available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePage;
