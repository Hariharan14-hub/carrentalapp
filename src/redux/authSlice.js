import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser } from '../api/authApi';

// 🟢 Login API call
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      const { jwt, email } = response.data;

      localStorage.setItem('token', jwt);
      localStorage.setItem('email', email);

      return response.data;
    } catch (err) {
      if (err.response && err.response.data) return rejectWithValue(err.response.data);
      return rejectWithValue({ message: err.message });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
});

const initialState = {
  user: localStorage.getItem('email') || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.email;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
