import axios from "axios";
import api from "./api";
const API_BASE_URL = "http://localhost:8000/api"; // Adjust to your DRF backend URL

class AuthServices {
  static async login(credentials: any) {
    try {
      console.log("payload: ", credentials);
      const response = await api.post(`/auth/login/`, credentials);
      const { access, refresh, user } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      return response.data;
    } catch (error: any) {
      console.log("Login Error: ", error);
      throw error.response?.data || error.message;
    }
  }

  static async logout() {
    try {
      await axios.post(`/auth/logout/`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }

  static async refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh,
      });
      const { access } = response.data;
      localStorage.setItem("access_token", access);
      return access;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static getAccessToken() {
    return localStorage.getItem("access_token");
  }

  static isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default AuthServices;
