import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import bookingApi from '../api/bookingApi';
import { getUserUsingEmail } from '../api/authApi';
import vehicleApi from '../api/vehicleApi';
import { Button } from 'react-bootstrap';

const BookingPage = () => {
    const { id: vehicleId } = useParams();
    const email = localStorage.getItem('email');
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [userId, setUserId] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserAndVehicle = async () => {
            try {
                const res = await getUserUsingEmail(email);
                setUserId(res.data.userId);
                const vehicleRes = await vehicleApi.getVehicleById(vehicleId);
                setVehicle(vehicleRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchUserAndVehicle();
    }, [vehicleId, email]);

    const handleBooking = async () => {
        if (!startDate || !endDate) return alert('Select start and end dates!');
        if (!vehicle) return alert('Vehicle not loaded!');
        setLoading(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const totalAmount = totalDays * vehicle.rentPerDay;

            const startDateTime = start.toISOString(); // "2025-11-11T00:00:00.000Z"
            const endDateTime = end.toISOString();

            const bookingRequest = {
                userId,
                vehicleId: vehicle.vehicleId,
                startDate: startDateTime,
                endDate: endDateTime,
                totalDays,
                totalAmount,
                status: 'Pending',
                paymentRequest: {
                    paymentMethod: 'STRIPE',
                    amount: totalAmount,
                    currency: 'INR',
                    description: `Booking for ${vehicle.brand} ${vehicle.model}`,
                    paymentGateway: 'STRIPE',
                },
            };

            // Create booking
            const res = await bookingApi.createBooking(bookingRequest);
            const paymentUrl = res.data.paymentUrl;

            // Redirect to Stripe payment page
            window.location.href = paymentUrl;
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Booking failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h3>Booking Details</h3>
            <div className="mb-3">
                <Button variant="secondary" onClick={() => navigate('/vehicles')}>
                    ← Back
                </Button>
            </div>
            {vehicle ? (
                <div className="card p-4 shadow-sm">
                    <h5>{vehicle.brand} {vehicle.model}</h5>
                    <p>Rent per day: ₹{vehicle.rentPerDay}</p>

                    <div className="mb-3">
                        <label>Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <p>Total Days: {startDate && endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1 : '-'}</p>
                    <p>Total Amount: ₹{startDate && endDate ? ((Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1) * vehicle.rentPerDay) : '-'}</p>

                    <button
                        className="btn btn-primary"
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Pay & Book'}
                    </button>
                </div>
            ) : (
                <p>Loading vehicle...</p>
            )}
        </div>
    );
};

export default BookingPage;
