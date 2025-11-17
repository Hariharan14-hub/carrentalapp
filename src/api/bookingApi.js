import api from './axiosInstance';

const API_BASE = '/bookings';

const bookingApi = {
  createBooking: (bookingData) => api.post(`${API_BASE}/create`, bookingData),
  updateBooking: (id, bookingData) => api.put(`${API_BASE}/update/${id}`, bookingData),
  updateAmountAndDate: (id, bookingData) => api.put(`${API_BASE}/updateAmountAndDate/${id}`, bookingData),
  updateStatus: (bookingId) => api.put(`${API_BASE}/updateStatus/${bookingId}`),
  getAllBookings: () => api.get(`${API_BASE}/getAllBookings`),
  getBookingById: (id) => api.get(`${API_BASE}/getBookingById/${id}`),
  deleteBooking: (id,status) => api.delete(`${API_BASE}/deleteBooking/${id}/${status}`),
  getBookingsByUserId: (id) => api.get(`${API_BASE}/getBookingsByUserId/${id}`),
  updateBookingAsCompleted: () => api.put(`${API_BASE}/updateBookingAsCompleted`),
};

export default bookingApi;
