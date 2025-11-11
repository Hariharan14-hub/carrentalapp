import api from './axiosInstance';

const API_URL = '/user';

export const loginUser = (data) => api.post(`${API_URL}/signin`, data);
export const signupUser = (data) => api.post(`${API_URL}/signUp`, data);
export const forgotPassword = (data) => api.put(`${API_URL}/forgotPassword`, data);
export const getUserUsingEmail = (email) => api.get(`${API_URL}/getUserUsingEmail/${email}`);
export const updateUserProfile = (userId, userRequest) => api.put(`${API_URL}/updateUser/${userId}`, userRequest);
