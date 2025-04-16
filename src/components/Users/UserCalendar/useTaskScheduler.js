import { toast } from "react-toastify";

export const useTaskScheduler = () => {
  const scheduleTasks = (tasks) => {
    const scheduledTasks = [];
    const userDayMap = {};

    // Sort tasks by date and priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const getTaskDate = (task) => {
        if (task.date) return new Date(task.date);
        if (task.weekHours?.[0]?.date) return new Date(task.weekHours[0].date);
        return new Date(0); // Invalid date will be sorted first
      };
      return getTaskDate(a) - getTaskDate(b);
    });

    sortedTasks.forEach((task) => {
      // Skip unapproved tasks
      if (task.status !== "Approved") return;

      // Get the first date (from either task.date or weekHours)
      const taskDate = task.date || task.weekHours?.[0]?.date;
      if (!taskDate || isNaN(new Date(taskDate).getTime())) {
        console.error("Invalid date for task:", task);
        return;
      }

      const dateKey = new Date(taskDate).toISOString().split("T")[0];
      const userKey = `${task.email || task.requestedName}-${dateKey}`;

      // Initialize user's day schedule if not exists
      if (!userDayMap[userKey]) {
        userDayMap[userKey] = {
          currentStart: new Date(taskDate),
          tasks: [],
        };
        // Set workday start time (8:30 AM)
        userDayMap[userKey].currentStart.setHours(8, 30, 0, 0);
      }

      // Calculate duration (priority: approvedHours > weekHours > hours > default 1)
      const duration = task.approvedHours || 
                      task.weekHours?.[0]?.hours || 
                      task.hours || 
                      1;

      const startTime = new Date(userDayMap[userKey].currentStart);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + duration);

      // Workday end time (4:45 PM)
      const maxEndTime = new Date(startTime);
      maxEndTime.setHours(16, 45, 0, 0);

      // Check if task fits in workday
      if (endTime > maxEndTime) {
        toast.warning(
          `"${task.Task}" exceeds work hours for ${task.requestedName} on ${dateKey}`
        );
        return;
      }

      // Add the scheduled task
      scheduledTasks.push({
        ...task,
        start: startTime,
        end: endTime,
        duration,
        dateKey,
        userKey,
      });

      // Update currentStart for next task (with 15min buffer)
      userDayMap[userKey].currentStart = new Date(endTime);
      userDayMap[userKey].currentStart.setMinutes(endTime.getMinutes() + 0);
      
      // Track all tasks for the user/day
      userDayMap[userKey].tasks.push(task);
    });

    return scheduledTasks;
  };

  return { scheduleTasks };
};