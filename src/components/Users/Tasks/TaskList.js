import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import TaskCard from "./TaskCard";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    timeRange: "all",
  });

  const getEmailFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);

      if (!decoded.email) throw new Error("Email not found in token");
      return decoded.email.toLowerCase();
    } catch (error) {
      console.error("Token decoding error:", error);
      toast.error("Authentication error. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw error;
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const userEmail = getEmailFromToken();

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/user/${encodeURIComponent(userEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  }, [getEmailFromToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesStatus =
        filters.status === "all" || task.status === filters.status;
      const matchesSearch =
        task.Task.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.project?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setFilteredTasks(filtered);
  }, [filters, tasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks(
        tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      toast.success("Task status updated successfully");
    } catch (error) {
      toast.error(error.message);
      console.error("Status update error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Main container with max-width */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>

            <div className="flex items-center gap-4">
              <div className="bg-[#a8499c] bg-opacity-10 text-[#a8499c] px-4 py-2 rounded-full flex items-center gap-2">
                <span className="font-bold text-lg">
                  {filteredTasks.length}
                </span>
                <span className="text-sm">tasks</span>
              </div>

              <button
                onClick={fetchTasks}
                className="flex items-center gap-2 px-4 py-2 bg-[#c8db00] text-white rounded-lg hover:bg-[#b4c900] transition-colors shadow-sm"
              >
                <FiRefreshCw className="text-white" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="px-4 py-2 border border-[#818181] border-opacity-20 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c] outline-none bg-white text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={filters.timeRange}
                  onChange={(e) =>
                    setFilters({ ...filters, timeRange: e.target.value })
                  }
                  className="px-4 py-2 border border-[#818181] border-opacity-20 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c] outline-none bg-white text-gray-700"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="today">Today</option>
                </select>
              </div>

              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-[#818181]" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10 pr-4 py-2 w-full border border-[#818181] border-opacity-20 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c] outline-none bg-white text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a8499c] mb-4"></div>
            <p className="text-[#818181]">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm">
            <div className="bg-[#818181] bg-opacity-10 p-8 rounded-full mb-6">
              <svg
                className="w-16 h-16 text-[#818181]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {tasks.length === 0
                ? "No tasks assigned yet"
                : "No tasks match your filters"}
            </h3>
            <p className="text-[#818181] max-w-md">
              {tasks.length === 0
                ? "When you get assigned tasks, they'll appear here"
                : "Try adjusting your filters to see more results"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
