// src/components/AddVehiclePage.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import vehicleApi from '../api/vehicleApi';
import bookingApi from '../api/bookingApi';
import { getUserUsingEmail, updateUserProfile } from '../api/authApi';
import { useLocation, useNavigate } from 'react-router-dom';

const AddVehiclePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', rentPerDay: '', color: '',
    registrationNumber: '', transmissionType: '', fuelType: '', available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateVehicleId, setUpdateVehicleId] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateStartDate, setUpdateStartDate] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState('');
  const [extraDays, setExtraDays] = useState(0);
  const [extraAmount, setExtraAmount] = useState(0);

  const email = localStorage.getItem('email');

  // Fetch user, vehicles, bookings
  useEffect(() => {
    if (!email) return;
    fetchUserData();
  }, [email]);

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
        setMessage({ type: 'success', text: 'Booking successful!' });
      } else {
        setMessage({ type: 'error', text: 'Booking failed or cancelled!' });
      }
      navigate('/add-vehicle', { replace: true });

      // Hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating booking/vehicle:', err);
      setMessage({ type: 'error', text: 'Something went wrong!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await getUserUsingEmail(email);
      setUser(res.data);
      fetchUserVehicles(res.data.userId);
      fetchUserBookings(res.data.userId);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchUserVehicles = async (userId) => {
    try {
      const res = await vehicleApi.getVehicleByUserId(userId);
      setUserVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchUserBookings = async (userId) => {
    try {
      const res = await bookingApi.getBookingsByUserId(userId);
      setUserBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // User profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      await updateUserProfile(user.userId, {
        name: user.name,
        phone: user.phone,
        password: user.password,
      });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  // Vehicle handlers
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => setImageFile(e.target.files[0]);

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['brand', 'model', 'year', 'rentPerDay', 'color', 'registrationNumber', 'transmissionType', 'fuelType'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please enter ${field}`);
        return;
      }
    }
    if (!user?.userId) return alert('User not loaded yet');
    setLoading(true);
    try {
      if (updateVehicleId) {
        const updateData = { ...formData, id: updateVehicleId };
        delete updateData.vehicleId;
        await vehicleApi.updateVehicle(updateData);
        if (imageFile) {
          const imgForm = new FormData();
          imgForm.append('image', imageFile);
          await vehicleApi.uploadImage(updateVehicleId, imgForm);
        }
        alert('✅ Vehicle updated successfully!');
      }
      else {
        const response = await vehicleApi.addVehicle({ ...formData, userId: user.userId });
        const newVehicle = response.data;
        if (imageFile) {
          const imgForm = new FormData();
          imgForm.append('image', imageFile);
          await vehicleApi.uploadImage(newVehicle.vehicleId, imgForm);
        }
        alert('✅ Vehicle added successfully!');
      }
      setFormData({
        brand: '', model: '', year: '', rentPerDay: '', color: '',
        registrationNumber: '', transmissionType: '', fuelType: '', available: true,
      });
      setImageFile(null);
      setShowVehicleForm(false);
      fetchUserVehicles(user.userId);
    } catch (err) {
      console.error(err);
      alert('Error saving vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setFormData({ ...vehicle });
    setUpdateVehicleId(vehicle.vehicleId);
    setShowVehicleForm(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleApi.deleteVehicle(vehicleId);
      alert('Vehicle deleted successfully!');
      fetchUserVehicles(user.userId);
    } catch (err) {
      console.error(err);
      if (err.message.includes("Request failed with status code 500")) {
        alert('❌ You cannot remove a vehicle while it has active bookings.');
      } else {
        alert('Failed to delete vehicle.');
      }

    }
  };
  
  // Booking handlers
  const handleDeleteBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await bookingApi.deleteBooking(booking.bookingId, "Cancelled");
      await vehicleApi.updateAvailability(booking.vehicle.vehicleId, true);
      alert('✅ Booking deleted successfully! You will receive your refund shortly.');
      fetchUserBookings(user.userId);
      fetchUserVehicles(user.userId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete booking.');
    }
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setUpdateStartDate(booking.startDate.slice(0, 10));
    setUpdateEndDate(booking.endDate.slice(0, 10));
    setExtraDays(0);
    setExtraAmount(0);
    setShowBookingModal(true);
  };

  const calculateExtra = (newEnd) => {
    if (!selectedBooking || !newEnd || isNaN(newEnd)) return;

    const oldEnd = new Date(selectedBooking.endDate);
    const oldEndDateOnly = new Date(oldEnd.getFullYear(), oldEnd.getMonth(), oldEnd.getDate());
    const newEndDateOnly = new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());

    let days = Math.floor((newEndDateOnly - oldEndDateOnly) / (1000 * 60 * 60 * 24));
    days = days > 0 ? days : 0;

    const rentPerDay = parseFloat(selectedBooking.vehicle.rentPerDay || 0);
    const amount = days * rentPerDay;

    setExtraDays(days);
    setExtraAmount(amount);
  };

  useEffect(() => {
    if (selectedBooking && updateEndDate) {
      calculateExtra(new Date(updateEndDate));
    }
  }, [updateEndDate]);

  const closeModal = () => {
    setShowBookingModal(false);
    setExtraDays(0);
    setExtraAmount(0);
  };

  const handleUpdateBooking = async () => {
    try {
      if (!selectedBooking) return;
      const startDateISO = new Date(updateStartDate).toISOString();
      const endDateISO = new Date(updateEndDate).toISOString();
      const oldEnd = new Date(selectedBooking.endDate);
      const newEnd = new Date(endDateISO);
      const oldEndDateOnly = new Date(oldEnd.getFullYear(), oldEnd.getMonth(), oldEnd.getDate());
      const newEndDateOnly = new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());
      let extraDaysCalc = Math.floor((newEndDateOnly - oldEndDateOnly) / (1000 * 60 * 60 * 24));
      const rentPerDay = parseFloat(selectedBooking.vehicle.rentPerDay || 0);

      if (extraDaysCalc > 0) {
        // ✅ User extended booking
        const extraAmountCalc = extraDaysCalc * rentPerDay;
        const updatedTotalDays = selectedBooking.totalDays + extraDaysCalc;
        const updatedTotalAmount = selectedBooking.totalAmount + extraAmountCalc;

        const updatedBooking = {
          userId: selectedBooking.user.userId,
          vehicleId: selectedBooking.vehicle.vehicleId,
          startDate: startDateISO,
          endDate: endDateISO,
          totalDays: updatedTotalDays,
          totalAmount: updatedTotalAmount,
          status: selectedBooking.status,
          paymentRequest: {
            paymentMethod: 'stripe',
            amount: updatedTotalAmount,
            currency: 'INR',
            description: `Booking updated: total ${updatedTotalDays} days`,
            paymentGateway: 'stripe',
          }
        };

        const res = await bookingApi.updateBooking(selectedBooking.bookingId, updatedBooking);
        window.location.href = res.data.paymentUrl;

      } else if (extraDaysCalc < 0) {
        const oldEndDateOnly = new Date(oldEnd.getFullYear(), oldEnd.getMonth(), oldEnd.getDate());
        const newEndDateOnly = new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());
        let extraDaysCalc = Math.floor((oldEndDateOnly - newEndDateOnly) / (1000 * 60 * 60 * 24));
        const rentPerDay = parseFloat(selectedBooking.vehicle.rentPerDay || 0);
        const extraAmountCalc = extraDaysCalc * rentPerDay;
        const updatedTotalDays = selectedBooking.totalDays - extraDaysCalc;
        const updatedTotalAmount = selectedBooking.totalAmount - extraAmountCalc;

        const reducedBooking = {
          userId: selectedBooking.user.userId,
          vehicleId: selectedBooking.vehicle.vehicleId,
          startDate: startDateISO,
          endDate: endDateISO,
          totalDays: updatedTotalDays,
          totalAmount: updatedTotalAmount,
          status: selectedBooking.status,
          paymentRequest: {
            paymentMethod: 'stripe',
            amount: updatedTotalAmount,
            currency: 'INR',
            description: 'Booking updated',
            paymentGateway: 'stripe',
          }
        };
        await bookingApi.updateAmountAndDate(selectedBooking.bookingId, reducedBooking);
        alert(`Booking updated successfully! New amount: ₹${updatedTotalAmount}. Any remaining balance will be refunded shortly.`)
      } else {
        // ✅ No change
        alert('No extra or reduced days added.');
      }

      closeModal();
      fetchUserBookings(user.userId);

    } catch (err) {
      console.error(err);
      alert('Failed to update booking.');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '1000px' }}>
      <div className="mb-3">
        <Button variant="secondary" onClick={() => navigate('/vehicles')}>
          ← Back
        </Button>
      </div>
      <h3 className="text-center mb-4">👤 User Profile & Vehicle Management</h3>

      {/* User Profile */}
      {user && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            {!editMode ? (
              <>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <Button className="me-2" onClick={() => setEditMode(true)}>Edit Profile</Button>
                <Button onClick={() => setShowVehicleForm(!showVehicleForm)}>
                  {showVehicleForm ? 'Cancel' : 'Add Vehicle'}
                </Button>
              </>
            ) : (
              <Form className="row">
                <div className="col-md-4">
                  <Form.Label>Name</Form.Label>
                  <Form.Control name="name" value={user.name || ''} onChange={handleProfileChange} />
                </div>
                <div className="col-md-4">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={user.phone || ''} onChange={handleProfileChange} />
                </div>
                <div className="col-md-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value='' onChange={handleProfileChange} />
                </div>
                <div className="col-12 mt-2">
                  <Button className="me-2" onClick={handleProfileSave}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Form */}
      {showVehicleForm && (
        <div className="card shadow p-4 mb-4">
          <h5 className="mb-3">{updateVehicleId ? '✏️ Update Vehicle' : '🚗 Add Vehicle'}</h5>
          <Form onSubmit={handleVehicleSubmit}>
            {['brand', 'model', 'year', 'rentPerDay', 'color', 'registrationNumber', 'transmissionType', 'fuelType'].map(f => (
              <Form.Group className="mb-2" key={f}>
                <Form.Label>{f.charAt(0).toUpperCase() + f.slice(1)}</Form.Label>
                <Form.Control name={f} value={formData[f]} onChange={handleVehicleChange} />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : updateVehicleId ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </Form>
        </div>
      )}

      {/* Vehicles List */}
      <h5 className="text-center mb-3">Your Vehicles</h5>
      <div className="row">
        {userVehicles.length > 0 ? userVehicles.map(v => (
          <div className="col-md-4 mb-3" key={v.vehicleId}>
            <div className="card shadow-sm h-100">
              {v.imageUrl && <img src={`data:image/jpeg;base64,${v.imageUrl}`} className="card-img-top" alt={v.brand} style={{ height: '180px', objectFit: 'cover' }} />}
              <div className="card-body">
                <h6 className="fw-bold">{v.brand} {v.model}</h6>
                <p className="text-muted mb-1">{v.year} • {v.fuelType}</p>
                <p className="fw-bold mb-2">₹{v.rentPerDay}/day</p>
                <Button size="sm" className="me-2" onClick={() => handleEditVehicle(v)}>Update Vehicle</Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteVehicle(v.vehicleId)}>Remove Vehicle</Button>
              </div>
            </div>
          </div>
        )) : <p className="text-center text-muted">No vehicles added yet.</p>}
      </div>

      {/* Bookings List */}
      <h5 className="text-center mt-4 mb-3">Your Bookings</h5>
      <div className="row">
        {userBookings.length > 0 ? userBookings.map(b => (
          <div className="col-md-6 mb-3" key={b.bookingId}>
            <div className="card shadow-sm h-100 p-3">
              <h6 className="fw-bold">{b.vehicle.brand} {b.vehicle.model}</h6>
              <p>Dates: {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</p>
              <p>Total: ₹{b.totalAmount} ({b.totalDays} days)</p>
              <div className="d-flex gap-2 flex-wrap">
                {b.status === 'Cancelled' ? (
                  <Button size="sm" variant="secondary" disabled>
                    Cancelled
                  </Button>
                ) : b.status === 'Completed' ? (
                  <Button size="sm" variant="success" disabled>
                    Completed
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openBookingModal(b)}>
                      Update Booking
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteBooking(b)}>
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )) : <p className="text-center text-muted">No bookings yet.</p>}
      </div>

      {/* Booking Update Modal */}
      <Modal show={showBookingModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={updateStartDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setUpdateStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={updateEndDate}
                min={updateStartDate || new Date().toISOString().split('T')[0]}
                max={
                  updateStartDate
                    ? new Date(new Date(updateStartDate).getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
                      .toISOString()
                      .split('T')[0]
                    : ''
                }
                onChange={e => setUpdateEndDate(e.target.value)}
              />
            </Form.Group>
            {extraDays > 0 && (
              <p className="text-success">
                Extra {extraDays} day(s), Additional Amount: ₹{extraAmount}
              </p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          {extraDays > 0 ? (
            <Button variant="success" onClick={handleUpdateBooking}>Pay & Update</Button>
          ) : (
            <Button variant="primary" onClick={handleUpdateBooking}>Update Booking</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddVehiclePage;
