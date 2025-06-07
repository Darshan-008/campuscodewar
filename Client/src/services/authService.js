// src/services/authService.js
import axiosInstance from "./axiosInstance";

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(`/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const signUp = async (userData) => {
  try {
    const response = await axiosInstance.post(`/auth/signup`, userData);
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post(`/auth/logout`);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    // Still remove local storage items even if server request fails
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(`/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
