import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiMoreVertical,
  FiEdit2,
  FiSave,
  FiLock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import "./TaskCard.css";

const statusConfig = {
  Pending: { color: "#FFC107", bg: "#FFF8E1", icon: "⏳" },
  Approved: { color: "#2196F3", bg: "#E3F2FD", icon: "✅" },
  Rejected: { color: "#F44336", bg: "#FFEBEE", icon: "❌" },
  Completed: { color: "#4CAF50", bg: "#E8F5E9", icon: "🏁" },
};

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const TaskCard = ({ task, onStatusChange, onTaskUpdate }) => {
  const [editingDate, setEditingDate] = useState(null);
  const [actualHours, setActualHours] = useState({});
  const [completedDates, setCompletedDates] = useState({});
  const [lockedDates, setLockedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize state from task data and completions
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch completion records from backend
        const completionsResponse = await axios.get(
          `${API_BASE_URL}/api/tasks/${task._id}/completions`
        );
        const completions = completionsResponse.data;

        const initialActualHours = {};
        const initialCompletedDates = {};
        const initialLockedDates = {};

        // Initialize from both task.weekHours and completion records
        task.weekHours?.forEach((day) => {
          if (day.date) {
            const dateKey = formatDateKey(day.date);

            // Find matching completion record
            const completion = completions.find(
              (c) => formatDateKey(c.date) === dateKey
            );

            initialActualHours[dateKey] =
              completion?.actualHours || day.actualHours || 0;
            initialCompletedDates[dateKey] =
              completion?.completed || day.completed || false;
            initialLockedDates[dateKey] = completion?.locked || false;
          }
        });

        setActualHours(initialActualHours);
        setCompletedDates(initialCompletedDates);
        setLockedDates(initialLockedDates);
      } catch (error) {
        console.error("Failed to fetch completion status:", error);
        // Fallback to task data if API fails
        const fallbackActualHours = {};
        const fallbackCompletedDates = {};
        const fallbackLockedDates = {};

        task.weekHours?.forEach((day) => {
          if (day.date) {
            const dateKey = formatDateKey(day.date);
            fallbackActualHours[dateKey] = day.actualHours || 0;
            fallbackCompletedDates[dateKey] = day.completed || false;
            fallbackLockedDates[dateKey] = day.locked || false;
          }
        });

        setActualHours(fallbackActualHours);
        setCompletedDates(fallbackCompletedDates);
        setLockedDates(fallbackLockedDates);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [task._id, task.weekHours]);

  const totalWeekHours =
    task.weekHours?.reduce((sum, day) => sum + day.hours, 0) || 0;
  const totalActualHours = Object.values(actualHours).reduce(
    (sum, hours) => sum + Number(hours),
    0
  );

  const formatDateKey = (dateStr) => {
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const handleActualHoursChange = (date, value) => {
    const numericValue = parseFloat(value) || 0;
    setActualHours((prev) => ({
      ...prev,
      [date]: Math.max(0, Math.min(8, numericValue)),
    }));
  };

  const toggleDateCompletion = (date) => {
    setCompletedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const saveDayProgress = async (date) => {
    setIsLoading(true);
    try {
      const hoursWorked = actualHours[date] || 0;
      const isCompleted = completedDates[date] || false;

      if (hoursWorked > 8) {
        toast.error(`Maximum 8 hours allowed per day`);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/tasks/${task._id}/complete`,
        {
          date,
          actualHours: hoursWorked,
          completed: isCompleted,
        }
      );

      if (response.data.success) {
        toast.success(
          `Progress saved for ${new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
          })}`
        );

        // Update all states from backend response
        setLockedDates((prev) => ({
          ...prev,
          [date]: response.data.locked || false,
        }));

        setCompletedDates((prev) => ({
          ...prev,
          [date]: isCompleted,
        }));

        setActualHours((prev) => ({
          ...prev,
          [date]: hoursWorked,
        }));

        // Update the parent component with the latest task data
        if (onTaskUpdate) {
          onTaskUpdate(response.data.task);
        }

        setEditingDate(null);
      } else {
        toast.error(response.data.message || "Failed to save progress");
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Failed to save: ${errorMessage}`);

      // If backend says this date is locked, update our state
      if (error.response?.data?.locked) {
        setLockedDates((prev) => ({
          ...prev,
          [date]: true,
        }));
        setEditingDate(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="task-card loading">
        <div className="loading-message">Loading task data...</div>
      </div>
    );
  }

  return (
    <div className="task-card" data-status={task.status.toLowerCase()}>
      <div className="card-header">
        <div
          className="status-indicator"
          style={{
            backgroundColor: statusConfig[task.status].bg,
            color: statusConfig[task.status].color,
          }}
        >
          {statusConfig[task.status].icon} {task.status}
        </div>
        <button className="card-menu">
          <FiMoreVertical />
        </button>
      </div>

      <h3 className="task-title">{task.Task}</h3>

      <div className="task-meta">
        <div className="meta-item">
          <span className="label">Project:</span>
          <span className="value">
            {task.project} {task.projectCode && `(${task.projectCode})`}
          </span>
        </div>
        <div className="meta-item">
          <span className="label">Requester:</span>
          <span className="value">{task.requester}</span>
        </div>
      </div>

      {task.weekHours?.length > 0 && (
        <div className="time-allocation">
          <div className="time-header">
            <FiClock className="time-icon" />
            <span>Time Allocation</span>
            <div className="totals">
              <span>Planned: {totalWeekHours}h</span>
              <span
                style={{
                  color:
                    totalActualHours > totalWeekHours ? "#F44336" : "#4CAF50",
                }}
              >
                Actual: {totalActualHours}h
              </span>
              <span>
                Progress:{" "}
                {Math.round((totalActualHours / totalWeekHours) * 100)}%
              </span>
            </div>
          </div>

          <div className="time-grid">
            {task.weekHours.map((day, index) => {
              const dateStr = day.date;
              const dateKey = formatDateKey(dateStr);
              const isEditing =
                editingDate === dateKey && !lockedDates[dateKey];
              const isCompleted = completedDates[dateKey];
              const isLocked = lockedDates[dateKey];
              const hoursWorked = actualHours[dateKey] || 0;
              const progressPercentage = Math.round(
                (hoursWorked / day.hours) * 100
              );

              return (
                <div
                  key={index}
                  className={`time-row ${isEditing ? "editing" : ""} ${
                    isCompleted ? "completed" : ""
                  } ${isLocked ? "locked" : ""}`}
                >
                  <div className="day-info">
                    <span className="day">{day.day}</span>
                    <span className="date">
                      {new Date(dateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {isLocked && (
                      <FiLock
                        className="lock-icon"
                        title="Completed and locked"
                      />
                    )}
                  </div>

                  <div className="hours-info">
                    <div className="hours-bar">
                      <div
                        className="bar-fill planned"
                        style={{ width: `${(day.hours / 8) * 100}%` }}
                      ></div>
                      {hoursWorked > 0 && (
                        <div
                          className="bar-fill actual"
                          style={{
                            width: `${(hoursWorked / 8) * 100}%`,
                            backgroundColor: isLocked
                              ? "#9E9E9E"
                              : isCompleted
                              ? "#4CAF50"
                              : "#2196F3",
                          }}
                        ></div>
                      )}
                    </div>

                    <span className="hours-text">
                      {day.hours}h planned •{" "}
                      {hoursWorked > 0
                        ? `${hoursWorked}h actual`
                        : "Not started"}
                      {isCompleted && ` • ${progressPercentage}%`}
                    </span>
                  </div>

                  {isLocked ? (
                    <div className="locked-message">Completed and locked</div>
                  ) : isEditing ? (
                    <div className="edit-controls">
                      <label>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleDateCompletion(dateKey)}
                        />
                        Complete
                      </label>
                      <div className="hours-input">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.25"
                          value={hoursWorked}
                          onChange={(e) =>
                            handleActualHoursChange(dateKey, e.target.value)
                          }
                        />
                        <span>h</span>
                      </div>
                      <button
                        onClick={() => saveDayProgress(dateKey)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          "Saving..."
                        ) : (
                          <>
                            <FiSave /> Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingDate(null)}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    task.status === "Approved" &&
                    !isLocked && (
                      <button onClick={() => setEditingDate(dateKey)}>
                        <FiEdit2 /> Edit
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card-footer">
        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        {task.status === "Approved" && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
          >
            <option value="Approved">Approved</option>
            <option value="Completed">Complete</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
