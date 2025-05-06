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
    LEED: "bg-[#a8499c]/20 border-[#a8499c]/30 text-[#a8499c]",
    BIM: "bg-[#c8db00]/20 border-[#c8db00]/30 text-[#818181]",
    MEP: "bg-[#6366f1]/20 border-[#818181]/30 text-[#818181]",
    default: "bg-gray-200/20 border-gray-300/30 text-gray-700",
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
  const userDayMap = {}; // Format: { "user@email-YYYY-MM-DD": { nextAvailableTime: Date } }

  // First, process tasks that already have scheduled times
  tasks.forEach((task) => {
    if (task.start && task.end) {
      const dateKey = new Date(task.start).toISOString().split("T")[0];
      const userKey = `${task.email || task.requestedName}-${dateKey}`;

      scheduledTasks.push(task);

      // Update the user's next available time
      if (
        !userDayMap[userKey] ||
        new Date(task.end) > userDayMap[userKey].nextAvailableTime
      ) {
        userDayMap[userKey] = {
          nextAvailableTime: new Date(task.end),
        };
      }
    }
  });

  // Then process unscheduled tasks
  const unscheduledTasks = tasks.filter((task) => !task.start || !task.end);

  // Sort by creation date or priority if needed
  unscheduledTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  unscheduledTasks.forEach((task) => {
    const taskDate = task.date || task.weekHours?.[0]?.date;
    if (!taskDate) return;

    const dateKey = new Date(taskDate).toISOString().split("T")[0];
    const userKey = `${task.email || task.requestedName}-${dateKey}`;

    // Initialize if new user/day
    if (!userDayMap[userKey]) {
      userDayMap[userKey] = {
        nextAvailableTime: new Date(taskDate),
      };
      // Set to 8:30 AM
      userDayMap[userKey].nextAvailableTime.setHours(8, 30, 0, 0);
    }

    const duration = Math.max(task.approvedHours || task.hours || 1, 0.5);
    const start = new Date(userDayMap[userKey].nextAvailableTime);
    const end = new Date(start);
    end.setHours(start.getHours() + Math.floor(duration));
    end.setMinutes(start.getMinutes() + (duration % 1) * 60);

    // Check against 4:45 PM end time
    const dayEnd = new Date(start);
    dayEnd.setHours(16, 45, 0, 0);

    if (end > dayEnd) {
      console.warn(`Task doesn't fit in workday: ${task.Task}`);
      return;
    }

    scheduledTasks.push({
      ...task,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    // Update for next task
    userDayMap[userKey].nextAvailableTime = new Date(end);
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