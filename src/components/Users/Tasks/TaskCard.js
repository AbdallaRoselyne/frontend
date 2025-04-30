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

  useEffect(() => {
    const initializeData = async () => {
      try {
        const completionsResponse = await axios.get(
          `${API_BASE_URL}/api/tasks/${task._id}/completions`
        );
        const completions = completionsResponse.data;

        const initialActualHours = {};
        const initialCompletedDates = {};
        const initialLockedDates = {};

        task.weekHours?.forEach((day) => {
          if (day.date) {
            const dateKey = formatDateKey(day.date);
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
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-gray-500">Loading task data...</div>
      </div>
    );
  }

  const getStatusBorderColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-l-yellow-400";
      case "approved":
        return "border-l-blue-400";
      case "rejected":
        return "border-l-red-400";
      case "completed":
        return "border-l-green-400";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <div className="w-full">
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 ${getStatusBorderColor(
          task.status
        )} h-full flex flex-col`}
      >
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-3">
            <div
              className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
              style={{
                backgroundColor: "#a8499c20",
                color: "#a8499c",
              }}
            >
              {statusConfig[task.status].icon} {task.status}
            </div>
            <button className="text-gray-500 hover:text-purple-600 p-1 transition-colors">
              <FiMoreVertical />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {task.Task}
          </h3>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2 text-sm items-baseline">
              <span className="text-gray-500 font-medium min-w-[70px]">
                Project:
              </span>
              <span className="text-gray-700">
                {task.project}{" "}
                {task.projectCode && (
                  <span className="text-gray-500">({task.projectCode})</span>
                )}
              </span>
            </div>
            <div className="flex gap-2 text-sm items-baseline">
              <span className="text-gray-500 font-medium min-w-[70px]">
                Requester:
              </span>
              <span className="text-gray-700">{task.requester}</span>
            </div>
          </div>

          {task.weekHours?.length > 0 && (
            <div className="mt-4 flex-grow">
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiClock className="text-purple-600" />
                  <span className="font-medium text-gray-700">
                    Time Allocation
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs font-medium">
                      Planned
                    </span>
                    <span className="font-semibold text-gray-700">
                      {totalWeekHours}h
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs font-medium">
                      Actual
                    </span>
                    <span
                      className={`font-semibold ${
                        totalActualHours > totalWeekHours
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {totalActualHours}h
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs font-medium">
                      Progress
                    </span>
                    <span className="font-semibold text-[#a8499c]">
                      {Math.round((totalActualHours / totalWeekHours) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
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
                      className={`p-2 rounded ${
                        isEditing
                          ? "flex-wrap p-3 gap-3 bg-gray-50 border border-gray-200 mb-2"
                          : "bg-gray-50"
                      } ${isCompleted ? "bg-green-50" : ""} ${
                        isLocked ? "bg-gray-100 opacity-90" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-[80px]">
                          <span className="font-medium text-sm">{day.day}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(dateStr).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {isLocked && (
                          <FiLock
                            className="ml-2 text-gray-500 text-sm"
                            title="Completed and locked"
                          />
                        )}

                        <div className="flex-1 mx-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1 relative">
                            <div
                              className="h-full bg-gray-400 opacity-50 absolute"
                              style={{ width: `${(day.hours / 8) * 100}%` }}
                            ></div>
                            {hoursWorked > 0 && (
                              <div
                                className="h-full absolute"
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
                          <span className="text-xs text-gray-600">
                            {day.hours}h planned •{" "}
                            {hoursWorked > 0
                              ? `${hoursWorked}h actual`
                              : "Not started"}
                            {isCompleted && ` • ${progressPercentage}%`}
                          </span>
                        </div>

                        {isLocked ? (
                          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded ml-auto">
                            Completed and locked
                          </div>
                        ) : isEditing ? (
                          <div className="w-full flex flex-wrap items-center gap-3 pt-2 mt-2 border-t border-dashed border-gray-300">
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => toggleDateCompletion(dateKey)}
                                className="m-0 w-4 h-4"
                              />
                              Complete
                            </label>
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300">
                              <input
                                type="number"
                                min="0"
                                max="8"
                                step="0.25"
                                value={hoursWorked}
                                onChange={(e) =>
                                  handleActualHoursChange(
                                    dateKey,
                                    e.target.value
                                  )
                                }
                                className="w-12 p-0 border-none bg-transparent text-sm focus:outline-none"
                              />
                              <span className="text-sm">h</span>
                            </div>
                            <button
                              onClick={() => saveDayProgress(dateKey)}
                              disabled={isLoading}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded border border-blue-600 hover:bg-blue-600 disabled:opacity-60 transition-colors"
                            >
                              {isLoading ? (
                                "Saving..."
                              ) : (
                                <>
                                  <FiSave size={14} /> Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingDate(null)}
                              disabled={isLoading}
                              className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-60 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          task.status === "Approved" &&
                          !isLocked && (
                            <button
                              onClick={() => setEditingDate(dateKey)}
                              className="flex items-center gap-1 text-sm text-[#a8499c] hover:text-[#c8db00] transition-colors"
                            >
                              <FiEdit2 size={14} /> Edit
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <span>
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
