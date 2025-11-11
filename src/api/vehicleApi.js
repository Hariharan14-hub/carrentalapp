import api from './axiosInstance';

const API_BASE = '/vehicle';

const vehicleApi = {
  getAllVehicles: () => api.get(`${API_BASE}/getAllVehicle`),
  getImageById: (id) => api.get(`${API_BASE}/getImageById/${id}`, { responseType: 'blob' }),
  addVehicle: (vehicle) => api.post(`${API_BASE}/create`, vehicle),
  getVehicleByUserId: (userId) => api.get(`${API_BASE}/getVehicleByUserId/${userId}`),
  getVehicleById: (vehicleId) => api.get(`${API_BASE}/getVehicleById/${vehicleId}`),
  deleteVehicle: (vehicleId) => api.delete(`${API_BASE}/delete/${vehicleId}`),
  updateVehicle: (vehicleData) => api.put(`${API_BASE}/update`, vehicleData),
  updateAvailability: (vehicleId, available) => api.put(`${API_BASE}/updateAvailability/${vehicleId}/${available}`),
  uploadImage: (vehicleId, formData) =>
    api.put(`${API_BASE}/uploadImage/${vehicleId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default vehicleApi;
