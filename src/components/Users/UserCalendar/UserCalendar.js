import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FiCalendar, FiRefreshCw, FiUser, FiUsers } from "react-icons/fi";
import { FilterBar } from "./FilterBar";
import { TaskDetailsModal } from "./TaskDetailsModal";
import "./UserCalendar.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const UserCalendar = () => {
  const [viewMode, setViewMode] = useState("my-tasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarView, setCalendarView] = useState("timeGridWeek");
  const [tasks, setTasks] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [filters, setFilters] = useState({
    project: "",
    department: "",
    date: "",
  });

  const getEmailFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);
      if (!decoded.email) throw new Error("Email not found in token");

      const email = decoded.email.toLowerCase().trim();
      setCurrentUserEmail(email);
      return email;
    } catch (error) {
      console.error("Token decoding error:", error);
      toast.error("Authentication error. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw error;
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const userEmail = await getEmailFromToken();
      let endpoint =
        viewMode === "my-tasks"
          ? `${API_BASE_URL}/api/tasks/user/${encodeURIComponent(
              userEmail
            )}?status=Approved`
          : `${API_BASE_URL}/api/tasks?status=Approved`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("Fetched tasks:", data);
      setTasks(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load tasks");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, getEmailFromToken]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, viewMode]);

  const getCalendarEvents = useCallback(() => {
    const events = [];
    const processedTaskDates = new Map(); // Tracks processed taskId + date combinations
    const userDayMap = {}; // Tracks each user's schedule per day

    // Sort tasks by date (earlier first)
    const sortedTasks = [...tasks].sort((a, b) => {
      const getTaskDate = (task) => {
        if (task.weekHours?.[0]?.date) return new Date(task.weekHours[0].date);
        return new Date(0); // Invalid date will be sorted first
      };
      return getTaskDate(a) - getTaskDate(b);
    });

    sortedTasks.forEach((task) => {
      // Filter conditions
      if (task.status !== "Approved") return;
      if (
        viewMode === "my-tasks" &&
        task.email.toLowerCase() !== currentUserEmail.toLowerCase()
      )
        return;

      const email = task.email.toLowerCase();
      const displayName = task.requestedName || email.split("@")[0];
      const taskId = task._id.split("-")[0]; // Normalize task ID

      // Process weekHours if available
      if (task.weekHours?.length > 0) {
        task.weekHours.forEach((wh) => {
          if (!wh.date) return;

          try {
            const date = new Date(wh.date);
            if (isNaN(date.getTime())) return;

            const dateKey = date.toISOString().split("T")[0];
            const compositeKey = `${taskId}-${dateKey}`;
            const userKey = `${email}-${dateKey}`;

            // Skip duplicates
            if (processedTaskDates.has(compositeKey)) return;
            processedTaskDates.set(compositeKey, true);

            // Initialize user's day schedule if not exists
            if (!userDayMap[userKey]) {
              userDayMap[userKey] = {
                currentStart: new Date(date),
              };
              // Set workday start time (8:30 AM)
              userDayMap[userKey].currentStart.setHours(8, 30, 0, 0);
            }

            // Calculate duration (minimum 0.5 hours)
            const duration = Math.max(wh.hours || 1, 0.5);

            // Create event time range
            const start = new Date(userDayMap[userKey].currentStart);
            const end = new Date(start);
            end.setHours(start.getHours() + duration);

            // Workday end time (4:45 PM)
            const maxEndTime = new Date(date);
            maxEndTime.setHours(16, 45, 0, 0);

            // Check if task fits in workday
            if (end > maxEndTime) {
              console.warn(
                `Task "${task.Task}" exceeds work hours for ${displayName} on ${dateKey}`
              );
              return;
            }

            events.push({
              id: compositeKey,
              title: `${task.Task} (${displayName})`,
              start,
              end,
              color: getDepartmentColor(task.department),
              extendedProps: {
                ...task,
                ...wh,
                personName: displayName,
                originalTaskId: task._id,
              },
            });

            // Update currentStart for next task (with 15min buffer)
            userDayMap[userKey].currentStart = new Date(end);
            userDayMap[userKey].currentStart.setMinutes(end.getMinutes() + 0);
          } catch (e) {
            console.error("Invalid date in weekHours:", wh.date, e);
          }
        });
      }
    });

    return events;
  }, [tasks, viewMode, currentUserEmail]);

  const getDepartmentColor = (department) => {
    if (!department) return "#64748b";

    switch (department.toLowerCase()) {
      case "leed":
        return "#8b5cf6";
      case "bim":
        return "#10b981";
      case "mep":
        return "#3b82f6";
      default:
        return "#64748b";
    }
  };

  const handleViewChange = useCallback((newView) => {
    setIsLoading(true);
    setCalendarView(newView);
    setTimeout(() => setIsLoading(false), 50);
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const filteredEvents = getCalendarEvents().filter((event) => {
    // Apply filters if they exist
    if (
      filters.project &&
      !event.extendedProps.project
        ?.toLowerCase()
        .includes(filters.project.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.department &&
      !event.extendedProps.department
        ?.toLowerCase()
        .includes(filters.department.toLowerCase())
    ) {
      return false;
    }
    if (filters.date) {
      const eventDate = new Date(event.start).toISOString().split("T")[0];
      const filterDate = new Date(filters.date).toISOString().split("T")[0];
      return eventDate === filterDate;
    }
    return true;
  });

  return (
    <div className="calendar-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="calendar-header">
        <div className="header-title">
          <FiCalendar className="header-icon" />
          <h1>Task Schedule</h1>
          {currentUserEmail && (
            <span className="user-badge">
              <FiUser className="user-icon" />
              {currentUserEmail}
            </span>
          )}
        </div>

        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={viewMode === "my-tasks" ? "active" : ""}
              onClick={() => handleViewModeChange("my-tasks")}
            >
              <FiUser className="button-icon" />
              My Tasks
            </button>
            <button
              className={viewMode === "team-tasks" ? "active" : ""}
              onClick={() => handleViewModeChange("team-tasks")}
            >
              <FiUsers className="button-icon" />
              Team Tasks
            </button>
          </div>

          <button
            onClick={fetchTasks}
            className="refresh-btn"
            disabled={isLoading}
          >
            <FiRefreshCw
              className={`refresh-icon ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        clearFilters={() =>
          setFilters({
            project: "",
            department: "",
            date: "",
          })
        }
      />

      <div className="calendar-view-container">
        <div className="view-options">
          <button
            onClick={() => handleViewChange("dayGridMonth")}
            className={calendarView === "dayGridMonth" ? "active" : ""}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("timeGridWeek")}
            className={calendarView === "timeGridWeek" ? "active" : ""}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("timeGridDay")}
            className={calendarView === "timeGridDay" ? "active" : ""}
          >
            Day
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={filteredEvents}
              eventClick={(info) => {
                setSelectedTask({
                  ...info.event.extendedProps,
                  title: info.event.title,
                  start: info.event.start,
                  end: info.event.end,
                });
              }}
              height="auto"
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                startTime: "08:30",
                endTime: "16:45",
              }}
              slotMinTime="08:00:00"
              slotMaxTime="17:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }}
              eventDisplay="block"
              eventOrder="start"
              eventContent={(eventInfo) => (
                <div className="fc-event-content">
                  <div className="event-title">{eventInfo.event.title}</div>
                  <div className="event-meta">
                    <span className="event-hours">
                      {eventInfo.event.extendedProps.hours ||
                        eventInfo.event.extendedProps.approvedHours ||
                        1}
                      h
                    </span>
                    {viewMode === "team-tasks" && (
                      <span className="event-person">
                        {eventInfo.event.extendedProps.personName}
                      </span>
                    )}
                  </div>
                </div>
              )}
              views={{
                dayGridMonth: {
                  dayMaxEventRows: 3,
                },
                timeGridWeek: {
                  dayHeaderFormat: { weekday: "short", day: "numeric" },
                },
              }}
            />
          </div>
        )}
      </div>

      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default UserCalendar;
