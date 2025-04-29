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
    const processedTaskDates = new Map();
    const userDayMap = {};

    const sortedTasks = [...tasks].sort((a, b) => {
      const getTaskDate = (task) => {
        if (task.weekHours?.[0]?.date) return new Date(task.weekHours[0].date);
        return new Date(0);
      };
      return getTaskDate(a) - getTaskDate(b);
    });

    sortedTasks.forEach((task) => {
      if (task.status !== "Approved") return;
      if (
        viewMode === "my-tasks" &&
        task.email.toLowerCase() !== currentUserEmail.toLowerCase()
      )
        return;

      const email = task.email.toLowerCase();
      const displayName = task.requestedName || email.split("@")[0];
      const taskId = task._id.split("-")[0];

      if (task.weekHours?.length > 0) {
        task.weekHours.forEach((wh) => {
          if (!wh.date) return;

          try {
            const date = new Date(wh.date);
            if (isNaN(date.getTime())) return;

            const dateKey = date.toISOString().split("T")[0];
            const compositeKey = `${taskId}-${dateKey}`;
            const userKey = `${email}-${dateKey}`;

            if (processedTaskDates.has(compositeKey)) return;
            processedTaskDates.set(compositeKey, true);

            if (!userDayMap[userKey]) {
              userDayMap[userKey] = {
                currentStart: new Date(date),
              };
              userDayMap[userKey].currentStart.setHours(8, 30, 0, 0);
            }

            const duration = Math.max(wh.hours || 1, 0.5);
            const start = new Date(userDayMap[userKey].currentStart);
            const end = new Date(start);
            end.setHours(start.getHours() + duration);

            const maxEndTime = new Date(date);
            maxEndTime.setHours(16, 45, 0, 0);

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
    if (!department) return "#818181";

    switch (department.toLowerCase()) {
      case "leed":
        return "#a8499c";
      case "bim":
        return "#c8db00";
      case "mep":
        return "#818181";
      default:
        return "#818181";
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <FiCalendar className="text-[#a8499c] text-2xl" />
          <h1 className="text-xl font-semibold text-gray-900">Task Schedule</h1>
          {currentUserEmail && (
            <span className="flex items-center gap-1 ml-2 px-3 py-1 bg-[#a8499c]/10 rounded-full text-sm text-[#a8499c]">
              <FiUser className="text-[#a8499c]" />
              {currentUserEmail}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${viewMode === "my-tasks" ? "bg-[#a8499c] text-white" : "text-gray-500"}`}
              onClick={() => handleViewModeChange("my-tasks")}
            >
              <FiUser />
              My Tasks
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${viewMode === "team-tasks" ? "bg-[#a8499c] text-white" : "text-gray-500"}`}
              onClick={() => handleViewModeChange("team-tasks")}
            >
              <FiUsers />
              Team Tasks
            </button>
          </div>

          <button
            onClick={fetchTasks}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`${isLoading ? "animate-spin" : ""}`} />
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

      <div className="flex-1 p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleViewChange("dayGridMonth")}
            className={`px-3 py-1 text-sm rounded-lg border ${calendarView === "dayGridMonth" ? "bg-[#a8499c] text-white border-[#a8499c]" : "bg-white border-gray-200 text-gray-700"}`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange("timeGridWeek")}
            className={`px-3 py-1 text-sm rounded-lg border ${calendarView === "timeGridWeek" ? "bg-[#a8499c] text-white border-[#a8499c]" : "bg-white border-gray-200 text-gray-700"}`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("timeGridDay")}
            className={`px-3 py-1 text-sm rounded-lg border ${calendarView === "timeGridDay" ? "bg-[#a8499c] text-white border-[#a8499c]" : "bg-white border-gray-200 text-gray-700"}`}
          >
            Day
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 border-4 border-[#a8499c] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : (
          <div className="h-[calc(100vh-250px)] min-h-[500px] bg-white rounded-lg shadow-sm p-4">
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
              height="100%"
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5],
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
                <div className="p-1">
                  <div className="font-medium text-sm text-white">
                    {eventInfo.event.title}
                  </div>
                  <div className="flex justify-between text-xs text-white/90">
                    <span className="truncate">
                      {viewMode === "team-tasks" && eventInfo.event.extendedProps.personName}
                    </span>
                    <span className="ml-2 font-semibold">
                      {eventInfo.event.extendedProps.hours ||
                        eventInfo.event.extendedProps.approvedHours ||
                        1}
                      h
                    </span>
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