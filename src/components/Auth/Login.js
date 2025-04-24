import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@prodesign.mu")) {
      setError("Access restricted to prodesign.mu users.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", response.data.role);

      // Redirect based on role
      navigate(
        response.data.role === "admin" ? "/Admin/dashboard" : "/dashboard"
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
      console.error("Login error:", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg px-20 py-20 max-w-md w-full mx-auto">
      <h2 className="text-xl font-semibold text-center mb-3 text-[#a54399]">
        Login
      </h2>

      {error && (
        <div className="mb-4 text-red-600 text-center border border-red-400 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter your @prodesign.mu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#a54399] text-white py-2 rounded-lg hover:bg-[#c8db00] transition-colors"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Only users with <strong>@prodesign.mu</strong> email addresses can
          access the dashboard.
        </p>
      </form>
    </div>
  );
}

export default Login;
