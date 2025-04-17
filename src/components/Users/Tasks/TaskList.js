import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import TaskCard from "./TaskCard";
import "./tasks.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    timeRange: 'all'
  });

  const getEmailFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);

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
      console.log("Fetching tasks for:", userEmail);

      const response = await fetch(
        `http://localhost:8080/api/tasks/user/${encodeURIComponent(userEmail)}`,
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
      console.log("Tasks received:", data);
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
      const response = await fetch(
        `http://localhost:8080/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

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
    <div className="modern-task-container">
      <header className="task-header">
        <h1>My Tasks</h1>
        <div className="header-controls">
          <div className="stats-badge">
            <span className="count">{filteredTasks.length}</span>
            <span>tasks</span>
          </div>
          <button className="refresh-btn" onClick={fetchTasks}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
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
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
          </select>
        </div>

        <div className="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="search-icon"
          >
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks, projects..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <img src="/illustration-empty.svg" alt="No tasks" />
          <h3>
            {tasks.length === 0
              ? "No tasks assigned yet"
              : "No tasks match your filters"}
          </h3>
          <p>When you get assigned tasks, they'll appear here</p>
        </div>
      ) : (
        <div className="task-board">
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
  );
};

export default TaskList;