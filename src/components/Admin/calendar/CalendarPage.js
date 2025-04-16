import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./calendarStyles.css";

import CalendarFilters from "./CalendarFilters";
import CalendarEventModal from "./CalendarEventModal";
import CalendarToolbar from "./CalendarToolbar";
import {
  fetchApprovedTasks,
  scheduleTasksSequentially,
  filterTasks,
  getDepartmentColorClass,
  exportToCSV,
} from "./CalendarUtils";

const CalendarPage = () => {
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState("timeGridWeek");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    requestedName: "",
    project: "",
    projectCode: "",
    date: "",
  });

  const calendarRef = useRef(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const tasks = await fetchApprovedTasks();
        setApprovedTasks(tasks);
      } catch (error) {
        toast.error("Failed to fetch approved tasks");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleNavigate = (action) => {
    const calendarApi = calendarRef.current.getApi();
    switch (action) {
      case "PREV":
        calendarApi.prev();
        break;
      case "NEXT":
        calendarApi.next();
        break;
      case "TODAY":
        calendarApi.today();
        break;
      default:
        break;
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleExport = () => {
    const filteredTasks = filterTasks(approvedTasks, filters);
    const scheduledEvents = scheduleTasksSequentially(filteredTasks);
    exportToCSV(
      scheduledEvents.map((event) => ({
        ...event,
        title: `${event.Task} (${event.requestedName})`,
        extendedProps: event,
      }))
    );
  };

  const filteredTasks = filterTasks(approvedTasks, filters);
  const scheduledEvents = scheduleTasksSequentially(filteredTasks);

  const calendarEvents = scheduledEvents.map((task) => ({
    id: task._id || `${task.Task}-${task.requestedName}-${task.start}`,
    title: `${task.Task} (${task.requestedName})`,
    start: task.start,
    end: task.end,
    className: getDepartmentColorClass(task.department),
    extendedProps: {
      ...task,
      hours: task.duration || task.approvedHours || task.hours,
    },
  }));

  const handleEventClick = (info) => {
    setSelectedTask({
      title: info.event.title,
      ...info.event.extendedProps,
      start: info.event.start,
      end: info.event.end,
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Task Calendar
            </h1>
            <p className="text-gray-600">View and manage all approved tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {scheduledEvents.length} tasks scheduled
            </span>
          </div>
        </div>

        <CalendarFilters filters={filters} setFilters={setFilters} />

        <div className="bg-white p-4 md:p-6 shadow rounded-xl border border-gray-100">
          <CalendarToolbar
            events={calendarEvents}
            view={view}
            setView={handleViewChange}
            onNavigate={handleNavigate}
            onExport={handleExport}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              headerToolbar={false}
              events={calendarEvents}
              eventClick={handleEventClick}
              datesSet={(dateInfo) => {
                setView(dateInfo.view.type);
              }}
              eventContent={(eventInfo) => (
                <div className="p-1 h-full">
                  <div className="h-full rounded-md p-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <strong className="block text-sm font-semibold truncate-text">
                        {eventInfo.event.title.split(" (")[0]}
                      </strong>
                      <span className="text-xs bg-gray-100 px-1 rounded whitespace-nowrap">
                        {eventInfo.event.extendedProps.hours}h
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate-text">
                      {eventInfo.event.extendedProps.project || "..."}
                    </p>
                    <p className="text-xs text-gray-600 truncate-text">
                      {eventInfo.event.extendedProps.requestedName || "..."}
                    </p>
                    <div className="mt-auto pt-1">
                      <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-opacity-20 bg-gray-500 truncate-text">
                        {eventInfo.event.extendedProps.department || "..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              height="auto"
              editable
              selectable
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                startTime: "08:30",
                endTime: "16:45",
              }}
              slotMinTime="08:00:00" // Show from 8:00 AM
              slotMaxTime="17:00:00" // Show until 5:00 PM
              slotDuration="00:30:00" // 30-minute slots
              allDaySlot={false}
              nowIndicator
              dayHeaderFormat={{ weekday: "short", day: "numeric" }}
              dayHeaderClassNames="font-medium text-gray-700"
            />
          )}
        </div>
      </div>

      <CalendarEventModal
        selectedTask={selectedTask}
        closeTaskDetails={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default CalendarPage;
