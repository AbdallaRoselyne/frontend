import { useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const useApi = () => {
  const fetchData = useCallback(async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }, []);

  return { fetchData };
};