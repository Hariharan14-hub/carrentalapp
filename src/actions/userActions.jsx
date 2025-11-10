import axios from "axios";
import {
  loginRequest,
  loginSuccess,
  loginFailed,
  loadUserSuccess,
  loadUserFailed,
  loadUserRequest,
  logoutSuccess,
  logoutFailed,
} from "../slices/authSlice";
export const login = (userName, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    const { data } = await axios.post(
      process.env.REACT_APP_API_URL + `/auth/signin`,
      { userName, password },
      { withCredentials: true }
    );

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    dispatch(loginSuccess(data));
  } catch (error) {
    dispatch(loginFailed({ error: "Oyie !Invalid Credentials " }));
  }
};

export const loadUser = () => async (dispatch) => {
  try {
    dispatch(loadUserRequest());
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth/user`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    dispatch(loadUserSuccess(data));
  } catch (error) {
    dispatch(
      loadUserFailed(error.response?.data?.message || "Failed to load user")
    );
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axios.post(
      process.env.REACT_APP_API_URL + `/auth/signout`,
      {},
      { withCredentials: true }
    );
    dispatch(logoutSuccess());
  } catch (error) {
    dispatch(logoutFailed());
  }
};
