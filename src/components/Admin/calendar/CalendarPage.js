import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  useEffect(() => {
    if (filters.date) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(filters.date);
      setView("timeGridDay");
    }
  }, [filters.date]);

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
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
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
    title: `${task.Task}`,
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
    <div className="p-4 md:p-6 bg-[#f8f8f8] min-h-screen">
      <ToastContainer position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#a8499c]">
              Task Calendar
            </h1>
            <p className="text-[#818181]">View and manage all approved tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#c8db00] animate-pulse"></div>
            <span className="text-sm text-[#818181]">
              {scheduledEvents.length} tasks scheduled
            </span>
          </div>
        </div>

        <CalendarFilters filters={filters} setFilters={setFilters} />

        <div className="bg-white p-4 md:p-6 shadow rounded-xl border border-[#e0e0e0]">
          <CalendarToolbar
            events={calendarEvents}
            view={view}
            setView={handleViewChange}
            onNavigate={handleNavigate}
            onExport={handleExport}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a8499c]"></div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              headerToolbar={false}
              events={calendarEvents}
              eventClick={handleEventClick}
              datesSet={(dateInfo) => setView(dateInfo.view.type)}
              eventContent={(eventInfo) => (
                <div className="px-2 py-1 text-white h-full w-full overflow-hidden rounded-md bg-opacity-90">
                  <div className="text-xs font-semibold truncate">
                    {eventInfo.event.title}
                  </div>
                  <div className="text-[10px] truncate">
                    {eventInfo.event.extendedProps.project}
                  </div>
                  <div className="text-[10px] truncate">
                    {eventInfo.event.extendedProps.requestedName}
                  </div>
                </div>
              )}
              height="auto"
              editable
              selectable
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: "08:30",
                endTime: "16:45",
              }}
              slotMinTime="08:00:00"
              slotMaxTime="17:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              nowIndicator
              dayHeaderFormat={{ weekday: "short", day: "numeric" }}
              dayHeaderClassNames="font-medium text-[#818181]"
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
