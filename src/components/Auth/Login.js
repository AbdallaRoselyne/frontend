import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Environment-aware API configuration
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://backend-production-e729.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email.endsWith("@prodesign.mu")) {
      setError("Access restricted to prodesign.mu users.");
      setIsLoading(false);
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
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Store authentication data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", response.data.role);

      // Redirect based on role
      navigate(
        response.data.role === "admin" ? "/Admin/dashboard" : "/dashboard"
      );
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        // Server responded with error status (4xx/5xx)
        console.error("Server error:", error.response.data);
        errorMessage =
          error.response.data.message ||
          `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response:", error.request);
        errorMessage = "Server is not responding. Please try again later.";
      } else {
        // Other errors
        console.error("Request error:", error.message);
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-800">
          Login
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-center border border-red-400 p-2 rounded">
            {error}
            <p className="text-sm mt-1">
              If this persists, please contact support@prodesign.mu
            </p>
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
              placeholder="user@prodesign.mu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-900 transition-colors ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            System access restricted to authorized @prodesign.mu users only.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
