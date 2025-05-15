const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * Fetches approved tasks from the API
 * @returns {Promise<Array>} Array of approved tasks
 */
export const fetchApprovedTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks?status=Approved`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching approved tasks:", error);
    throw error;
  }
};

/**
 * Returns Tailwind CSS classes based on department
 * @param {string} department - Department name
 * @returns {string} Tailwind CSS classes
 */
export const getDepartmentColorClass = (department) => {
  const departmentColors = {
    LEED: "bg-[#a8499c]/20 border-l-4 border-[#a8499c] text-[#a8499c]",
    BIM: "bg-[#c8db00]/20 border-l-4 border-[#c8db00] text-[#818181]",
    MEP: "bg-[#6366f1]/20 border-l-4 border-[#818181] text-[#818181]",
    default: "bg-gray-200/20 border-l-4 border-gray-300 text-gray-700",
  };
  return departmentColors[department?.toUpperCase()] || departmentColors.default;
};

/**
 * Schedules tasks sequentially for each user per day
 * @param {Array} tasks - Array of tasks to schedule
 * @returns {Array} Array of scheduled tasks with start/end times
 */
export const scheduleTasksSequentially = (tasks) => {
  const scheduledTasks = [];
  const userDayMap = {};

  const WORKDAY_START = { hour: 8, minute: 30 };
  const WORKDAY_END = { hour: 16, minute: 45 };

  const getWorkdayStart = (date) => {
    const start = new Date(date);
    start.setHours(WORKDAY_START.hour, WORKDAY_START.minute, 0, 0);
    return start;
  };

  const getWorkdayEnd = (date) => {
    const end = new Date(date);
    end.setHours(WORKDAY_END.hour, WORKDAY_END.minute, 0, 0);
    return end;
  };

  const getNextDay = (date) => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return next;
  };

  const scheduleForUser = (task, userKey) => {
    let remainingHours = Math.max(task.approvedHours || task.hours || 1, 0.5);
    let currentDate = new Date(task.date || task.weekHours?.[0]?.date || task.createdAt);
    currentDate.setHours(0, 0, 0, 0);

    while (remainingHours > 0) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const workdayStart = getWorkdayStart(currentDate);
      const workdayEnd = getWorkdayEnd(currentDate);

      if (!userDayMap[userKey]) userDayMap[userKey] = {};
      if (!userDayMap[userKey][dateKey]) {
        userDayMap[userKey][dateKey] = new Date(workdayStart);
      }

      let nextAvailable = userDayMap[userKey][dateKey];
      if (nextAvailable > workdayEnd) {
        currentDate = getNextDay(currentDate);
        continue;
      }

      const availableMinutes = (workdayEnd - nextAvailable) / (1000 * 60);
      const taskMinutes = Math.min(remainingHours * 60, availableMinutes);
      const taskStart = new Date(nextAvailable);
      const taskEnd = new Date(taskStart.getTime() + taskMinutes * 60 * 1000);

      scheduledTasks.push({
        ...task,
        start: taskStart.toISOString(),
        end: taskEnd.toISOString(),
      });

      remainingHours -= taskMinutes / 60;
      userDayMap[userKey][dateKey] = new Date(taskEnd);

      if (remainingHours > 0) {
        currentDate = getNextDay(currentDate);
      }
    }
  };

  tasks.forEach((task) => {
    if (task.start && task.end) {
      scheduledTasks.push(task);
    }
  });

  const unscheduledTasks = tasks.filter((task) => !task.start || !task.end);
  unscheduledTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  unscheduledTasks.forEach((task) => {
    const userKey = task.email || task.requestedName || "unknown-user";
    scheduleForUser(task, userKey);
  });

  return scheduledTasks;
};

/**
 * Filters tasks based on filter criteria
 * @param {Array} tasks - Array of tasks to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered array of tasks
 */
export const filterTasks = (tasks, filters) => {
  return tasks.filter((task) => {
    const taskDate = new Date(task.date || task.weekHours?.[0]?.date)
      .toISOString()
      .split("T")[0];
    const filterDate = filters.date
      ? new Date(filters.date).toISOString().split("T")[0]
      : "";

    return (
      (!filters.requestedName ||
        task.requestedName
          ?.toLowerCase()
          .includes(filters.requestedName.toLowerCase())) &&
      (!filters.project ||
        task.project?.toLowerCase().includes(filters.project.toLowerCase())) &&
      (!filters.projectCode ||
        task.projectCode
          ?.toLowerCase()
          .includes(filters.projectCode.toLowerCase())) &&
      (!filters.date || taskDate === filterDate)
    );
  });
};

/**
 * Exports events to CSV file
 * @param {Array} events - Array of events to export
 */
export const exportToCSV = (events) => {
  const processedEvents = events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  const sortedEvents = [...processedEvents].sort((a, b) => a.start - b.start);

  const timetable = {};
  sortedEvents.forEach((event) => {
    const dateStr = event.start.toISOString().split("T")[0];
    const timeSlot = `${event.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${event.end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    if (!timetable[dateStr]) {
      timetable[dateStr] = [];
    }

    timetable[dateStr].push({
      timeSlot,
      assignee: event.extendedProps.requestedName,
      task: event.title,
      project: event.extendedProps.project,
      department: event.extendedProps.department,
      hours: event.extendedProps.hours,
    });
  });

  let csvContent = "Date,Time,Assignee,Task,Project,Department,Hours\n";
  Object.entries(timetable).forEach(([date, entries]) => {
    const formattedDate = new Date(date).toLocaleDateString();
    entries.forEach((entry) => {
      csvContent +=
        [
          `"${formattedDate}"`,
          `"${entry.timeSlot}"`,
          `"${entry.assignee}"`,
          `"${entry.task}"`,
          `"${entry.project}"`,
          `"${entry.department}"`,
          `"${entry.hours}"`,
        ].join(",") + "\n";
    });
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `timetable_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formats a date to a readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a time to a readable string
 * @param {Date} date - Date containing time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Renders custom FullCalendar event content (Asana/Teamwork style)
 * @param {Object} eventInfo - Event render info from FullCalendar
 * @returns {JSX.Element} Formatted task element
 */
export const renderEventContent = (eventInfo) => {
  const { title } = eventInfo.event;
  const { requestedName, project } = eventInfo.event.extendedProps;

  return (
    <div className="px-2 py-1 rounded-lg text-sm font-medium leading-tight">
      <div className="truncate">{title}</div>
      <div className="text-xs text-gray-500">{requestedName} · {project}</div>
    </div>
  );
};
